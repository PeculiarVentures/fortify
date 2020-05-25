// NodeJS
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import * as sudo from 'sudo-prompt';
import * as winston from 'winston';

// PKI
import * as asn1js from 'asn1js';

import { SRC_DIR } from './const';
import { crypto } from './crypto';

const pkijs = require('pkijs');

const CERT_NAME = 'Fortify Local CA';

// Set PKI engine
pkijs.setEngine('OpenSSL', crypto, new pkijs.CryptoEngine({ name: 'OpenSSL', crypto, subtle: crypto.subtle }));

const alg = {
  name: 'RSASSA-PKCS1-v1_5',
  publicExponent: new Uint8Array([1, 0, 1]),
  modulusLength: 2048,
  hash: 'SHA-256',
} as RsaHashedKeyGenParams;
const hashAlg = 'SHA-256';

/**
 * Creates new certificate
 *
 * @param keyPair     Key pair for new certificate
 * @param caKey       Issuer's private key for cert TBS signing
 * @returns
 */
async function GenerateCertificate(keyPair: CryptoKeyPair, caKey: CryptoKey) {
  const certificate = new pkijs.Certificate();

  // region Put a static values
  certificate.version = 2;
  const serialNumber = crypto.getRandomValues(new Uint8Array(10));
  certificate.serialNumber = new asn1js.Integer();
  certificate.serialNumber.valueBlock.valueHex = serialNumber.buffer;

  const commonName = new pkijs.AttributeTypeAndValue({
    type: '2.5.4.3', // Common name
    value: new asn1js.PrintableString({ value: process.env.FORTIFY_SSL_CN || '127.0.0.1' }),
  });

  certificate.subject.typesAndValues.push(commonName);
  certificate.issuer.typesAndValues.push(new pkijs.AttributeTypeAndValue({
    type: '2.5.4.3', // Common name
    value: new asn1js.PrintableString({ value: 'Fortify Local CA' }),
  }));

  // Valid period is 1 year
  certificate.notBefore.value = new Date(); // current date
  const notAfter = new Date();
  notAfter.setFullYear(notAfter.getFullYear() + 1);
  certificate.notAfter.value = notAfter;

  // Extensions are not a part of certificate by default, it's an optional array
  certificate.extensions = [];

  // Extended key usage
  const extKeyUsage = new pkijs.ExtKeyUsage({
    keyPurposes: ['1.3.6.1.5.5.7.3.1'],
  });
  certificate.extensions.push(new pkijs.Extension({
    extnID: '2.5.29.37',
    critical: true,
    extnValue: extKeyUsage.toSchema().toBER(false),
    parsedValue: extKeyUsage,
  }));

  // Subject alternative name
  const subjectAlternativeName = new pkijs.AltName({
    altNames: [
      new pkijs.GeneralName({
        type: 2,
        value: 'localhost',
      }),
      new pkijs.GeneralName({
        type: 7,
        value: new asn1js.OctetString({ valueHex: new Uint8Array(Buffer.from('7F000001', 'hex')).buffer }),
      }),
    ],
  });
  certificate.extensions.push(new pkijs.Extension({
    extnID: '2.5.29.17',
    critical: false,
    extnValue: subjectAlternativeName.toSchema().toBER(false),
    parsedValue: subjectAlternativeName,
  }));

  // Basic constraints
  const basicConstraints = new pkijs.BasicConstraints({
    cA: false,
  });
  certificate.extensions.push(new pkijs.Extension({
    extnID: '2.5.29.19',
    critical: false,
    extnValue: basicConstraints.toSchema().toBER(false),
    parsedValue: basicConstraints,
  }));

  await certificate.subjectPublicKeyInfo.importKey(keyPair.publicKey);
  await certificate.sign(caKey, hashAlg);

  return certificate;
}

/**
 * Creates CA certificate
 *
 * @param   keyPair     Key pair of CA cert
 * @returns
 */
async function GenerateCertificateCA(keyPair: CryptoKeyPair) {
  const certificate = new pkijs.Certificate();

  // region Put a static values
  certificate.version = 2;
  const serialNumber = crypto.getRandomValues(new Uint8Array(10));
  certificate.serialNumber = new asn1js.Integer();
  certificate.serialNumber.valueBlock.valueHex = serialNumber.buffer;

  const commonName = new pkijs.AttributeTypeAndValue({
    type: '2.5.4.3', // Common name
    value: new asn1js.PrintableString({ value: 'Fortify Local CA' }),
  });

  certificate.issuer.typesAndValues.push(commonName);
  certificate.subject.typesAndValues.push(commonName);

  // Valid period is 1 year
  certificate.notBefore.value = new Date(); // current date
  const notAfter = new Date();
  notAfter.setFullYear(notAfter.getFullYear() + 1);
  certificate.notAfter.value = notAfter;

  // Extensions are not a part of certificate by default, it's an optional array
  certificate.extensions = [];

  // Basic constraints
  const basicConstraints = new pkijs.BasicConstraints({
    cA: true,
    pathLenConstraint: 2,
  });
  certificate.extensions.push(new pkijs.Extension({
    extnID: '2.5.29.19',
    critical: false,
    extnValue: basicConstraints.toSchema().toBER(false),
    parsedValue: basicConstraints,
  }));

  await certificate.subjectPublicKeyInfo.importKey(keyPair.publicKey);
  await certificate.sign(keyPair.privateKey, hashAlg);

  return certificate;
}

/**
 * Generates key pair for sign/verify
 */
async function GenerateKey() {
  const keys = (await crypto.subtle.generateKey(alg, true, ['sign', 'verify'])) as CryptoKeyPair;

  return keys;
}

/**
 * Returns DER buffer in PEM format
 *
 * @param der     Incoming buffer of PKI object
 * @param tag     tag name for BEGIN/END block
 */
function ConvertToPEM(der: ArrayBuffer, tag: string) {
  const derBuffer = Buffer.from(der);
  const b64 = derBuffer.toString('base64');
  const stringLength = b64.length;
  let pem = '';

  for (let i = 0, count = 0; i < stringLength; i += 1, count += 1) {
    if (count > 63) {
      pem = `${pem}\r\n`;
      count = 0;
    }
    pem = `${pem}${b64[i]}`;
  }

  const t = tag.toUpperCase();
  const pad = '-----';

  return `${pad}BEGIN ${t}${pad}\r\n${pem}\r\n${pad}END ${t}${pad}\r\n`;
}

/**
 * Returns crypto key in PEM format
 *
 * @param   key
 */
async function ConvertKeyToPEM(key: CryptoKey) {
  const format = key.type === 'public' ? 'spki' : 'pkcs8';
  const der = await crypto.subtle.exportKey(format, key);

  return ConvertToPEM(der, `RSA ${key.type.toUpperCase()} KEY`);
}

/**
 * @typedef {Object} ISslGenerateResult
 *
 * @property {Buffer}   root    CA cert in PEM format
 * @property {Buffer}   cert    localhost cert in PEM format
 * @property {Buffer}   key     private key of localhost cert in PEM format
 *
 */

/**
 * Generates SSL cert chain (CA + localhost)
 *
 * @export
 */
export async function generate() {
  const rootKeys = await GenerateKey();
  const rootCert = await GenerateCertificateCA(rootKeys);
  const localhostKeys = await GenerateKey();
  const localhostCert = await GenerateCertificate(localhostKeys, rootKeys.privateKey);
  const keyPem = await ConvertKeyToPEM(localhostKeys.privateKey);

  const rootCertPem = ConvertToPEM(rootCert.toSchema(true).toBER(false), 'CERTIFICATE');
  const localhostCertPem = ConvertToPEM(localhostCert.toSchema(true).toBER(false), 'CERTIFICATE');

  return {
    root: Buffer.from(rootCertPem),
    cert: Buffer.from(localhostCertPem),
    key: Buffer.from(keyPem),
  };
}

async function InstallTrustedNss(certUtil: string, nssDbFolder: string, certPath: string) {
  // check Firefox was installed
  if (fs.existsSync(nssDbFolder)) {
    const nssDbTypes = ['sql'];
    // eslint-disable-next-line
    for (const nssDbType of nssDbTypes) {
      // #region Remove old Fortify SSL certs
      try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          childProcess.execSync(`"${certUtil}" -D -n "${CERT_NAME}" -d ${nssDbType}:"${nssDbFolder}"`);
          winston.info(`SSL: NSS old SSL certificate was removed from ${nssDbType}:cert.db`);
        }
      } catch {
        // nothing
      }
      // #endregion

      // #region Install Fortify SSL certificate
      try {
        childProcess.execSync(`"${certUtil}" -A -i "${certPath}" -n "${CERT_NAME}" -t "CT,c" -d ${nssDbType}:"${nssDbFolder}"`);
        winston.info(`SSL: NSS certificate was installed to ${nssDbType}:cert.db`);

        return 1;
      } catch (e) {
        winston.error(e.message);
        winston.info(`SSL:Error: Cannot install SSL cert to ${nssDbType}:cert.db`);
      }
      // #endregion
    }
  } else {
    winston.info(`SSL: NSS folder not found '${nssDbFolder}'`);
  }

  return 0;
}

/**
 * Installs trusted cert on OS X
 *
 * @param certPath Path to cert
 */
async function InstallTrustedOSX(certPath: string) {
  const USER_HOME = os.homedir();
  const FIREFOX_DIR = path.normalize(`${USER_HOME}/Library/Application Support/Firefox/Profiles`);
  const CERTUTIL = '/Applications/Fortify.app/Contents/MacOS/certutil';

  // install certificate to system key chain
  await new Promise((resolve, reject) => {
    const options = {
      name: 'Fortify application',
      icons: '/Applications/Fortify.app/Contents/Resources/static/icons/tray/mac/icon.icns',
    };
    const appPath = path.dirname(certPath);
    const { username } = os.userInfo();
    winston.info('SSL: Adding CA certificate to System KeyChain');
    sudo.exec(`appPath=${appPath} userDir=${os.homedir()} USER=${username} CERTUTIL=${process.cwd()} bash ${SRC_DIR}/resources/osx-ssl.sh`, options, (err) => {
      // console.log(stdout.toString());
      if (err) {
        reject(err);
      } else {
        winston.info('SSL: CA certificate was added to System KeyChain');
        resolve();
      }
    });
  });

  // #region Firefox
  let ok = 0;
  if (fs.existsSync(FIREFOX_DIR)) {
    const profiles = fs.readdirSync(FIREFOX_DIR);

    // eslint-disable-next-line
    for (const profile of profiles) {
      if (/default/.test(profile)) {
        const firefoxProfile = path.normalize(path.join(FIREFOX_DIR, profile));
        winston.info(`SSL: ${firefoxProfile}`);
        // tslint:disable-next-line:no-bitwise
        ok |= await InstallTrustedNss(CERTUTIL, firefoxProfile, certPath);
      }
    }

    if (ok) {
      try {
        winston.info('SSL: Restart Firefox');
        childProcess.execSync('pkill firefox');
        childProcess.execSync('open /Applications/Firefox.app');
      } catch (err) {
        winston.info(`SSL:Error: Cannot restart Firefox ${err.toString()}`);
        // firefox is not running
      }
    }
  }
  // #endregion
}

/**
 * Installs trusted cert on Windows
 *
 * @param {string}  certPath Path to cert
 */
async function InstallTrustedWindows(certPath: string) {
  const USER_HOME = os.homedir();
  const FIREFOX_DIR = path.normalize(`${USER_HOME}/AppData/Roaming/Mozilla/Firefox/Profiles`);
  const CERTUTIL = path.normalize(`${__dirname}\\..\\..\\certutil.exe`);

  let ok = 0;
  if (fs.existsSync(FIREFOX_DIR)) {
    const profiles = fs.readdirSync(FIREFOX_DIR);
    // eslint-disable-next-line
    for (const profile of profiles) {
      if (/default$/.test(profile)) {
        const firefoxProfile = path.normalize(path.join(FIREFOX_DIR, profile));
        winston.info(`SSL: ${firefoxProfile}`);
        ok |= await InstallTrustedNss(CERTUTIL, firefoxProfile, certPath);
      }
    }
    winston.info(`SSL: Certificate installation status: ${ok}`);
    if (ok) {
      // #region Restart firefox
      try {
        winston.info('SSL: Restart Firefox');
        childProcess.execSync('taskkill /F /IM firefox.exe');
        childProcess.execSync('start firefox');
      } catch (err) {
        winston.info(`SSL:Error: Cannot restart Firefox ${err.toString()}`);
        // firefox is not running
      }
      // #endregion
    }
  }

  // Install cert to System trusted storage
  childProcess.execSync(`certutil -addstore -user root "${certPath}"`);
  winston.info('SSL: Certificate was installed to System store');
}

/**
 * Installs trusted cert on Linux
 *
 * @param {string}  certPath Path to cert
 */
async function InstallTrustedLinux(certPath: string) {
  const USER_HOME = os.homedir();
  const FIREFOX_DIR = path.normalize(`${USER_HOME}/.mozilla/firefox`);
  const CHROME_DIR = path.normalize(`${USER_HOME}/.pki/nssdb`);
  const CERTUTIL = 'certutil';

  let ok = 0;
  if (fs.existsSync(FIREFOX_DIR)) {
    const profiles = fs.readdirSync(FIREFOX_DIR);
    // eslint-disable-next-line
    for (const profile of profiles) {
      if (/default$/.test(profile)) {
        const firefoxProfile = path.normalize(path.join(FIREFOX_DIR, profile));
        winston.info(`SSL: ${firefoxProfile}`);
        ok |= await InstallTrustedNss(CERTUTIL, firefoxProfile, certPath);
      }
    }

    if (ok) {
      try {
        winston.info('SSL: Restart Firefox');
        childProcess.execSync('pkill firefox');
        childProcess.execSync('firefox&');
      } catch (err) {
        winston.info(`SSL:Error: Cannot restart Firefox ${err.toString()}`);
        // firefox is not running
      }
    }
  }

  winston.info(`SSL: ${CHROME_DIR}`);
  ok = await InstallTrustedNss(CERTUTIL, CHROME_DIR, certPath);
  if (ok) {
    // TODO: restart Chrome
  }
}

/**
 * Installs cert to trusted stores
 *
 * @param certPath    Path to cert which must be installed to trusted store
 */
export async function InstallTrustedCertificate(certPath: string) {
  const platform = os.platform();
  switch (platform) {
    case 'darwin':
      await InstallTrustedOSX(certPath);
      break;
    case 'win32':
      await InstallTrustedWindows(certPath);
      break;
    case 'linux':
      await InstallTrustedLinux(certPath);
      break;
    default:
      throw new Error(`Unsupported OS platform '${platform}'`);
  }
}
