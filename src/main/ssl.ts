// NodeJS
import * as childProcess from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import * as sudo from "sudo-prompt";
import * as winston from "winston";

// PKI
import * as asn1js from "asn1js";
const pkijs = require("pkijs");

import { SRC_DIR } from "./const";
import { crypto } from "./crypto";

// Set PKI engine
pkijs.setEngine("OpenSSL", crypto, new pkijs.CryptoEngine({ name: "OpenSSL", crypto, subtle: crypto.subtle }));

const alg = {
  name: "RSASSA-PKCS1-v1_5",
  publicExponent: new Uint8Array([1, 0, 1]),
  modulusLength: 2048,
  hash: "SHA-256",
};
const hashAlg = "SHA-256";

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
    type: "2.5.4.3", // Common name
    value: new asn1js.PrintableString({ value: process.env.FORTIFY_SSL_CN || "fortifyapp.com" }),
  });

  certificate.subject.typesAndValues.push(commonName);
  certificate.issuer.typesAndValues.push(new pkijs.AttributeTypeAndValue({
    type: "2.5.4.3", // Common name
    value: new asn1js.PrintableString({ value: "Fortify Local CA" }),
  }));

  // Valid period is 1 year
  certificate.notBefore.value = new Date(); // current date
  const notAfter = new Date();
  notAfter.setFullYear(notAfter.getFullYear() + 1);
  certificate.notAfter.value = notAfter;

  certificate.extensions = []; // Extensions are not a part of certificate by default, it's an optional array

  // Extended key usage
  const extKeyUsage = new pkijs.ExtKeyUsage({
    keyPurposes: ["1.3.6.1.5.5.7.3.1"],
  });
  certificate.extensions.push(new pkijs.Extension({
    extnID: "2.5.29.37",
    critical: true,
    extnValue: extKeyUsage.toSchema().toBER(false),
    parsedValue: extKeyUsage,
  }));

  // Subject alternative name
  const subjectAlternativeName = new pkijs.AltName({
    altNames: [
      new pkijs.GeneralName({
        type: 2,
        value: "localhost",
      }),
      new pkijs.GeneralName({
        type: 7,
        value: new asn1js.OctetString({ valueHex: new Uint8Array(Buffer.from("7F000001", "hex")).buffer }),
      }),
    ],
  });
  certificate.extensions.push(new pkijs.Extension({
    extnID: "2.5.29.17",
    critical: false,
    extnValue: subjectAlternativeName.toSchema().toBER(false),
    parsedValue: subjectAlternativeName,
  }));

  // Basic constraints
  const basicConstraints = new pkijs.BasicConstraints({
    cA: false,
  });
  certificate.extensions.push(new pkijs.Extension({
    extnID: "2.5.29.19",
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
    type: "2.5.4.3", // Common name
    value: new asn1js.PrintableString({ value: "Fortify Local CA" }),
  });

  certificate.issuer.typesAndValues.push(commonName);
  certificate.subject.typesAndValues.push(commonName);

  // Valid period is 1 year
  certificate.notBefore.value = new Date(); // current date
  const notAfter = new Date();
  notAfter.setFullYear(notAfter.getFullYear() + 1);
  certificate.notAfter.value = notAfter;

  certificate.extensions = []; // Extensions are not a part of certificate by default, it's an optional array

  // Basic constraints
  const basicConstraints = new pkijs.BasicConstraints({
    cA: true,
    pathLenConstraint: 2,
  });
  certificate.extensions.push(new pkijs.Extension({
    extnID: "2.5.29.19",
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
  return crypto.subtle.generateKey(alg, true, ["sign", "verify"]);
}

/**
 * Returns crypto key in PEM format
 *
 * @param   key
 */
async function ConvertKeyToPEM(key: CryptoKey) {
  const format = key.type === "public" ? "spki" : "pkcs8";
  const der = await crypto.subtle.exportKey(format, key);
  return ConvertToPEM(der, `RSA ${key.type.toUpperCase()} KEY`);
}

/**
 * Returns DER buffer in PEM format
 *
 * @param der     Incoming buffer of PKI object
 * @param tag     tag name for BEGIN/END block
 */
function ConvertToPEM(der: ArrayBuffer, tag: string) {
  const derBuffer = Buffer.from(der);
  const b64 = derBuffer.toString("base64");
  const stringLength = b64.length;
  let pem = "";

  for (let i = 0, count = 0; i < stringLength; i++ , count++) {
    if (count > 63) {
      pem = `${pem}\r\n`;
      count = 0;
    }
    pem = `${pem}${b64[i]}`;
  }

  tag = tag.toUpperCase();
  const pad = "-----";
  return `${pad}BEGIN ${tag}${pad}\r\n${pem}\r\n${pad}END ${tag}${pad}\r\n`;
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

  const rootCertPem = ConvertToPEM(rootCert.toSchema(true).toBER(false), "CERTIFICATE");
  const localhostCertPem = ConvertToPEM(localhostCert.toSchema(true).toBER(false), "CERTIFICATE");

  return {
    root: Buffer.from(rootCertPem),
    cert: Buffer.from(localhostCertPem),
    key: Buffer.from(keyPem),
  };
}

/**
 * Installs cert to trusted stores
 *
 * @param certPath    Path to cert which must be installed to trusted store
 */
export async function InstallTrustedCertificate(certPath: string) {
  const platform = os.platform();
  switch (platform) {
    case "darwin":
      await InstallTrustedOSX(certPath);
      break;
    case "win32":
      await InstallTrustedWindows(certPath);
      break;
    case "linux":
    default:
      throw new Error(`Unsupported OS platform '${platform}'`);
  }
}

/**
 * Installs trusted cert on OS X
 *
 * @param certPath Path to cert
 */
async function InstallTrustedOSX(certPath: string) {
  // install certificate to system key chain
  await new Promise((resolve, reject) => {
    const options = {
      name: "Fortify application",
      icons: "/Applications/Fortify.app/Contents/Resources/icons/icon.icns",
    };
    const appPath = path.dirname(certPath);
    const username = os.userInfo().username;
    sudo.exec(`appPath=${appPath} userDir=${os.homedir()} USER=${username} bash ${SRC_DIR}/resources/osx-ssl.sh`, options, (err, stdout) => {
      // console.log(stdout.toString());
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
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
  const CERT_NAME = `Fortify Local CA`;

  // check Firefox was installed
  // if (fs.existsSync(FIREFOX_DIR)) {
  //   winston.info(`SSL: Firefox default folder is found '${FIREFOX_DIR}'`);
  //   // get profiles
  //   try {
  //     fs.readdirSync(FIREFOX_DIR).map((item) => {
  //       const PROFILE_DIR = `${FIREFOX_DIR}\\${item}`;
  //       if (fs.existsSync(PROFILE_DIR)) {
  //         childProcess.execSync(`"${CERTUTIL}" -D -n "${CERT_NAME}" -d "${PROFILE_DIR}" | "${CERTUTIL}" -A -i "${certPath}" -n "${CERT_NAME}" -t "C,c,c" -d "${PROFILE_DIR}"`);
  //         winston.info(`SSL: Firefox certificate was installed`);
  //         // restart firefox
  //         try {
  //           winston.info(`SSL: Restart Firefox`);
  //           childProcess.execSync(`taskkill /F /IM firefox.exe`);
  //           childProcess.execSync(`start firefox`);
  //         } catch (err) {
  //           winston.info(`SSL:Error: Cannot restart Firefox ${err.toString()}`);
  //           // firefox is not running
  //         }
  //       }
  //     });
  //   } catch (err) {
  //     winston.info(`SSL:Error Cannot install certificate to Firefox.`, err);
  //   }

  // }

  childProcess.execSync(`certutil -addstore -user root "${certPath}"`);
  winston.info(`SSL: Certificate was installed to System store`);
}
