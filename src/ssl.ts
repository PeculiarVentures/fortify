import * as os from "os";
import * as path from "path";

import * as asn1js from "asn1js";
const sudo = require("sudo-prompt");
const pkijs = require("pkijs");
const CryptoOpenSSL = require("node-webcrypto-ossl");
const crypto = new CryptoOpenSSL();
// Set crypto engine for PKI
pkijs.setEngine("OpenSSL", crypto, crypto.subtle);

const alg = {
    name: "RSASSA-PKCS1-v1_5",
    publicExponent: new Uint8Array([1, 0, 1]),
    modulusLength: 2048,
    hash: "SHA-256",
}
const hashAlg = "SHA-256";

async function GenerateCertificatePEM(keyPair: CryptoKeyPair) {
    const certificate = new pkijs.Certificate();

    //region Put a static values 
    certificate.version = 2;
    certificate.serialNumber = new asn1js.Integer({ value: 1 });

    const commonName = new pkijs.AttributeTypeAndValue({
        type: "2.5.4.3", // Common name
        value: new asn1js.PrintableString({ value: "fortifyapp.com" })
    });
    // const organization = new pkijs.AttributeTypeAndValue({
    //     type: "2.5.4.10", // Organization
    //     value: new asn1js.PrintableString({ value: "fortifyapp.com" })
    // });

    certificate.issuer.typesAndValues.push(commonName);
    certificate.subject.typesAndValues.push(commonName);

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
        parsedValue: extKeyUsage
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
                value: new asn1js.OctetString({ valueHex: new Uint8Array(new Buffer("7F000001", "hex")).buffer }),
            }),
        ]
    });
    certificate.extensions.push(new pkijs.Extension({
        extnID: "2.5.29.17",
        critical: false,
        extnValue: subjectAlternativeName.toSchema().toBER(false),
        parsedValue: subjectAlternativeName
    }));

    await certificate.subjectPublicKeyInfo.importKey(keyPair.publicKey);
    await certificate.sign(keyPair.privateKey, hashAlg);
    const der = certificate.toSchema(true).toBER(false);
    return ConvertToPEM(der, "CERTIFICATE");
}

async function GenerateKey() {
    return crypto.subtle.generateKey(alg, true, ["sign", "verify"]) as CryptoKeyPair;
}

async function ConvertKeyToPEM(key: CryptoKey) {
    const format = key.type === "public" ? "spki" : "pkcs8";
    const der = await crypto.subtle.exportKey(format, key);
    return ConvertToPEM(der, `RSA ${key.type.toUpperCase()} KEY`);
}

function ConvertToPEM(der: ArrayBuffer, tag: string) {
    const derBuffer = new Buffer(der);
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
    const resultString = `${pad}BEGIN ${tag}${pad}\r\n${pem}\r\n${pad}END ${tag}${pad}\r\n`;
    return resultString;
}

export async function generate() {
    const keys = await GenerateKey();
    const certPEM = await GenerateCertificatePEM(keys);
    const privateKeyPEM = await ConvertKeyToPEM(keys.privateKey);

    return {
        cert: new Buffer(certPEM),
        key: new Buffer(privateKeyPEM),
    };
}

export async function InstallTrustedCertificate(certPath: string) {
    const platform = os.platform();
    switch (platform) {
        case "darwin":
            await InstalTrustedOSX(certPath);
            break;
        case "win32":
        case "linux":
        default:
            throw new Error(`Unsupported OS platform '${platform}'`)
    }

}

async function InstalTrustedOSX(certPath: string) {
    // install certificate to system key chain
    await new Promise((resolve, reject) => {
        const options = { 
            name: "Fortify application" ,
            icons: "/Applications/Fortify.app/Contents/Resources/icons/icon.icns"
        };
        const appPath = path.dirname(certPath);
        sudo.exec(`appPath=${appPath} userDir=${os.homedir()} bash ${__dirname}/../resources/osx-ssl.sh`, options, (err: Error) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

}