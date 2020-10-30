/* eslint-disable class-methods-use-this */
import * as asn from '@peculiar/asn1-schema';
import * as x509 from '@peculiar/asn1-x509';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { PemConverter } from 'webcrypto-core';
import * as constants from '../../constants';
import { windowsController } from '../../windows';
import { l10n } from '../../l10n';
import { CertificateGenerator, ValidityType, IName } from './generator';
import { SslCertInstaller } from './installer';
import logger from '../../logger';

export enum CaCertificateStatus {
  none,
  valid,
  renew,
  expired
}

export class SslService {
  public static readonly CERT_VALIDITY_TYPE: ValidityType = 'year';

  public static readonly CERT_VALIDITY_VALUE = 2;

  public static readonly CERT_RENEW_COEFFICIENT = 0.2;

  public static readonly CERT_CA_COMMON_NAME = 'Fortify Local CA';

  public static readonly CERT_ORGANIZATION = 'PeculiarVentures, LLC';

  public static readonly CERT_LOCALHOST_COMMON_NAME = 'localhost';

  public static readonly CERT_KEY_ALG: RsaHashedKeyAlgorithm = {
    name: 'RSASSA-PKCS1-v1_5',
    hash: {
      name: 'SHA-256',
    },
    publicExponent: new Uint8Array([1, 0, 1]),
    modulusLength: 2048,
  };

  public installer: SslCertInstaller;

  constructor() {
    this.installer = this.createInstaller();
  }

  /**
   * Returns CA certificate in PEM format
   */
  public getCaCert() {
    if (fs.existsSync(constants.APP_SSL_CERT_CA)) {
      const pem = fs.readFileSync(constants.APP_SSL_CERT_CA, { encoding: 'utf8' });

      return pem;
    }

    return null;
  }

  /**
   * Returns `true` if CA certificate requires renew
   */
  public getCaCertStatus() {
    if (fs.existsSync(constants.APP_SSL_CERT)
      && fs.existsSync(constants.APP_SSL_KEY)
      && fs.existsSync(constants.APP_SSL_CERT_CA)) {
      const pem = this.getCaCert();
      if (pem) {
        const der = PemConverter.toArrayBuffer(pem);
        const cert = asn.AsnConvert.parse(der, x509.Certificate);

        const notBefore = cert.tbsCertificate.validity.notBefore.getTime();
        const notAfter = cert.tbsCertificate.validity.notAfter.getTime();
        const renewDate = notBefore.getTime() + Math.floor((notAfter.getTime()
          - notBefore.getTime()) * (1 - SslService.CERT_RENEW_COEFFICIENT));

        // eslint-disable-next-line no-nested-ternary
        return notAfter.getTime() < Date.now()
          ? CaCertificateStatus.expired
          : renewDate < Date.now()
            ? CaCertificateStatus.renew
            : CaCertificateStatus.valid;
      }
    }

    return CaCertificateStatus.none;
  }

  public async run() {
    let status = this.getCaCertStatus();

    logger.info('ssl-service', 'Get certificate status', { status: CaCertificateStatus[status] });

    if (os.platform() === 'win32' && (status === CaCertificateStatus.renew || status === CaCertificateStatus.expired)) {
      windowsController.showWarningWindow(
        {
          text: l10n.get('warn.ssl.renew'),
          title: 'warning.title.oh_no',
          buttonRejectLabel: 'close',
          id: 'ssl.renew',
        },
      );

      status = CaCertificateStatus.valid;
    }

    if (status !== CaCertificateStatus.valid) {
      const pem = this.getCaCert();

      logger.info('ssl-service', 'Certificate enrollment is required', {
        pem,
        status: CaCertificateStatus[status],
      });

      try {
        await windowsController.showWarningWindow({
          text: l10n.get('warn.ssl.install'),
          buttonRejectLabel: 'i_understand',
          id: 'ssl.install',
        });

        logger.info('ssl-service', 'Warning window was closed');
      } catch {
        //
      }

      // #region PublicData folder
      if (!fs.existsSync(constants.APP_DATA_DIR)) {
        fs.mkdirSync(constants.APP_DATA_DIR);

        logger.warn('ssl-service', 'PublicData folder created. This folder should bew created from installer', {
          folder: constants.APP_DATA_DIR,
        });
      }
      // #endregion

      // #region Generate CA cert
      const caName: IName = {
        commonName: SslService.CERT_CA_COMMON_NAME,
        organization: SslService.CERT_ORGANIZATION,
      };
      const caKeys = (await crypto.subtle.generateKey(SslService.CERT_KEY_ALG, false, ['sign', 'verify'])) as CryptoKeyPair;
      const caCert = await CertificateGenerator.create({
        // NOTE: Use random serial. Firefox doesn't allow to add certificate
        // with the same serial number
        serialNumber: CertificateGenerator.randomSerial(),
        subject: caName,
        validity: {
          type: SslService.CERT_VALIDITY_TYPE,
          value: SslService.CERT_VALIDITY_VALUE,
        },
        publicKey: caKeys.publicKey,
        signingKey: caKeys.privateKey,
        extensions: [
          new x509.Extension({
            extnID: x509.id_ce_basicConstraints,
            critical: true,
            extnValue: new asn.OctetString(asn.AsnConvert.serialize(
              new x509.BasicConstraints({
                cA: true,
                pathLenConstraint: 2,
              }),
            )),
          }),
          new x509.Extension({
            extnID: x509.id_ce_keyUsage,
            critical: true,
            extnValue: new asn.OctetString(asn.AsnConvert.serialize(
              new x509.KeyUsage(x509.KeyUsageFlags.keyCertSign),
            )),
          }),
        ],
      });
      // #endregion

      // #region Generate localhost cert
      const localhostName: IName = {
        commonName: '127.0.0.1',
        organization: SslService.CERT_ORGANIZATION,
      };
      const localhostKeys = (await crypto.subtle.generateKey(SslService.CERT_KEY_ALG, true, ['sign', 'verify'])) as CryptoKeyPair;
      const localhostCert = await CertificateGenerator.create({
        // NOTE: Use random serial. Firefox doesn't allow to add certificate
        // with the same serial number
        serialNumber: CertificateGenerator.randomSerial(),
        subject: localhostName,
        issuer: caName,
        validity: {
          type: SslService.CERT_VALIDITY_TYPE,
          value: SslService.CERT_VALIDITY_VALUE,
        },
        publicKey: localhostKeys.publicKey,
        signingKey: caKeys.privateKey,
        extensions: [
          new x509.Extension({
            extnID: x509.id_ce_basicConstraints,
            critical: true,
            extnValue: new asn.OctetString(asn.AsnConvert.serialize(
              new x509.BasicConstraints({
                cA: false,
              }),
            )),
          }),
          new x509.Extension({
            extnID: x509.id_ce_keyUsage,
            critical: true,
            extnValue: new asn.OctetString(asn.AsnConvert.serialize(
              new x509.KeyUsage(x509.KeyUsageFlags.keyEncipherment
                | x509.KeyUsageFlags.digitalSignature),
            )),
          }),
          new x509.Extension({
            extnID: x509.id_ce_extKeyUsage,
            critical: true,
            extnValue: new asn.OctetString(asn.AsnConvert.serialize(
              new x509.ExtendedKeyUsage([
                '1.3.6.1.5.5.7.3.1', // serverAuth
              ]),
            )),
          }),
          new x509.Extension({
            extnID: x509.id_ce_subjectAltName,
            critical: true,
            extnValue: new asn.OctetString(asn.AsnConvert.serialize(
              new x509.SubjectAlternativeName([
                new x509.GeneralName({
                  dNSName: SslService.CERT_LOCALHOST_COMMON_NAME,
                }),
                new x509.GeneralName({
                  iPAddress: '127.0.0.1',
                }),
              ]),
            )),
          }),
        ],
      });
      // #endregion

      // #region Install CA cert
      // Save CA file
      fs.writeFileSync(constants.APP_SSL_CERT_CA, caCert.cert, { flag: 'w+' });

      logger.info('ssl-service', 'ca.pem file added to ProgramData folder', {
        file: constants.APP_SSL_CERT_CA,
      });

      try {
        this.installer.install(constants.APP_SSL_CERT_CA);

        logger.info('ssl-service', 'Certificate added to trusted storages');
      } catch (error) {
        logger.error('ssl-service', 'Cannot install SSL certificate', {
          error: error.message,
          stack: error.stack,
        });

        fs.unlinkSync(constants.APP_SSL_CERT_CA);

        logger.info('ssl-service', 'Certificate removed from ProgramData folder', {
          file: constants.APP_SSL_CERT_CA,
        });

        throw error;
      }

      // Save localhost cert
      fs.writeFileSync(constants.APP_SSL_CERT, localhostCert.cert, { flag: 'w+' });
      const pkcs8 = await crypto.subtle.exportKey('pkcs8', localhostKeys.privateKey);
      fs.writeFileSync(constants.APP_SSL_KEY, PemConverter.fromBufferSource(pkcs8, 'PRIVATE KEY'), { flag: 'w+' });
      // #endregion
    } else {
      try {
        this.installer.installFirefox(constants.APP_SSL_CERT_CA);
      } catch (error) {
        logger.error('ssl-service', 'Install Firefox', {
          error: error.message,
          stack: error.stack,
        });
      }
    }
  }

  private createInstaller() {
    let nssCertUtil: string;
    const platform = os.platform();
    switch (platform) {
      case 'linux':
        nssCertUtil = 'certutil';
        break;
      case 'darwin':
        nssCertUtil = '/Applications/Fortify.app/Contents/MacOS/certutil'; // TODO: Use exec path
        break;
      case 'win32':
        nssCertUtil = path.normalize(`${__dirname}\\..\\..\\certutil.exe`); // TODO: Use exec path
        break;
      default:
        throw new Error('Unsupported Operation System');
    }

    const installer = new SslCertInstaller({
      nssCertName: SslService.CERT_CA_COMMON_NAME,
      nssCertUtil,
      osxAppIcons: '/Applications/Fortify.app/Contents/Resources/static/icons/tray/mac/icon.icns',
      osxAppName: 'Fortify application',
    });

    return installer;
  }
}
