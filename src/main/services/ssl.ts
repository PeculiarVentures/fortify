/* eslint-disable class-methods-use-this */
import * as asn from '@peculiar/asn1-schema';
import * as x509 from '@peculiar/asn1-x509';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { PemConverter } from 'webcrypto-core';
import * as winston from 'winston';
import * as c from '../const';
import { CertificateGenerator, IName, SslCertInstaller } from '../ssl';

export enum CaCertificateStatus {
  none,
  valid,
  renew,
}

export class SslService {
  public static readonly CERT_VALIDITY_YEARS = 2;

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
    if (fs.existsSync(c.APP_SSL_CERT_CA)) {
      const pem = fs.readFileSync(c.APP_SSL_CERT_CA, { encoding: 'utf8' });

      return pem;
    }

    return null;
  }

  /**
   * Returns `true` if CA certificate requires renew
   */
  public getCaCertStatus() {
    const pem = this.getCaCert();
    if (pem) {
      const der = PemConverter.toArrayBuffer(pem);
      const cert = asn.AsnConvert.parse(der, x509.Certificate);

      const notBefore = cert.tbsCertificate.validity.notBefore.getTime();
      const notAfter = cert.tbsCertificate.validity.notAfter.getTime();
      const renewDate = notBefore.getTime() + Math.floor((notAfter.getTime()
        - notBefore.getTime()) * (1 - SslService.CERT_RENEW_COEFFICIENT));

      return renewDate < Date.now()
        ? CaCertificateStatus.renew
        : CaCertificateStatus.valid;
    }

    return CaCertificateStatus.none;
  }

  public async run() {
    const status = this.getCaCertStatus();
    if (status !== CaCertificateStatus.valid) {
      const pem = this.getCaCert();
      winston.info('SSL certificate enrollment is required', {
        class: 'SslService',
        pem,
        status: CaCertificateStatus[status],
      });

      // #region PublicData folder
      if (!fs.existsSync(c.APP_DATA_DIR)) {
        fs.mkdirSync(c.APP_DATA_DIR);
        winston.warn('PublicData folder created. This folder should bew created from installer', {
          class: 'SslService',
          folder: c.APP_DATA_DIR,
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
          type: 'year',
          value: SslService.CERT_VALIDITY_YEARS,
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
          type: 'year',
          value: SslService.CERT_VALIDITY_YEARS,
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
      fs.writeFileSync(c.APP_SSL_CERT_CA, caCert.cert, { flag: 'w+' });
      winston.info('ca.pem file added to ProgramData folder', {
        class: 'SslService',
        file: c.APP_SSL_CERT_CA,
      });

      try {
        this.installer.install(c.APP_SSL_CERT_CA);

        winston.info('SSL certificate added to trusted storages', {
          class: 'SslService',
        });
      } catch (e) {
        winston.error('Cannot install SSL certificate', {
          class: 'SslService',
        });

        fs.unlinkSync(c.APP_SSL_CERT_CA);
        winston.info('SSL certificate removed from ProgramData folder', {
          class: 'SslService',
          file: c.APP_SSL_CERT_CA,
        });
        throw e;
      }

      // Save localhost cert
      fs.writeFileSync(c.APP_SSL_CERT, localhostCert.cert, { flag: 'w+' });
      const pkcs8 = await crypto.subtle.exportKey('pkcs8', localhostKeys.privateKey);
      fs.writeFileSync(c.APP_SSL_KEY, PemConverter.fromBufferSource(pkcs8, 'PRIVATE KEY'), { flag: 'w+' });
      // #endregion
    } else {
      try {
        this.installer.installFirefox(c.APP_SSL_CERT_CA);
      } catch (e) {
        winston.error(e.toString());
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
