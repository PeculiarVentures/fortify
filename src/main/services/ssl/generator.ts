import * as x509 from '@peculiar/asn1-x509';
import * as asn from '@peculiar/asn1-schema';
import { Convert } from 'pvtsutils';
import * as core from 'webcrypto-core';

const pkijs = require('pkijs');

export interface IName {
  commonName: string,
  organization?: string;
}

export type ValidityType = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second';

export interface IValidity {
  value: number;
  type: ValidityType;
}

export interface ISubjectAlternativeName {
  dns?: string[],
}

export interface ICertificate {
  cert: string,
  publicKey: CryptoKey;
  privateKey?: CryptoKey;
}

export interface ICertificateGeneratorCreateParams {
  /**
   * Serial number. Default is 1
   */
  serialNumber?: number,
  publicKey: CryptoKey;
  signingKey: CryptoKey;
  hashAlg?: string;
  subject: IName;
  issuer?: IName;
  validity: IValidity;
  extensions?: x509.Extension[];
}

export class CertificateGenerator {
  public static readonly SECOND = 1;

  public static readonly MINUTE = CertificateGenerator.SECOND * 60;

  public static readonly HOUR = CertificateGenerator.MINUTE * 60;

  public static readonly DAY = CertificateGenerator.HOUR * 24;

  public static readonly WEEK = CertificateGenerator.DAY * 7;

  public static readonly MONTH = CertificateGenerator.DAY * 30;

  public static readonly YEAR = CertificateGenerator.MONTH * 12;

  public static readonly HASH = 'SHA-256';

  /**
   * Returns RDN object
   * @param name Name params
   */
  private static createName(name: IName) {
    const res = new x509.Name();

    res.push(new x509.RelativeDistinguishedName([
      new x509.AttributeTypeAndValue({
        type: '2.5.4.3', // Common name
        value: new x509.AttributeValue({ printableString: name.commonName }),
      }),
    ]));
    if (name.organization) {
      res.push(new x509.RelativeDistinguishedName([
        new x509.AttributeTypeAndValue({
          type: '2.5.4.10', // Organization
          value: new x509.AttributeValue({ printableString: name.organization }),
        }),
      ]));
    }

    return res;
  }

  /**
   * Returns a validity period in seconds
   */
  private static getSeconds(validity: IValidity) {
    switch (validity.type) {
      case 'second':
        return this.SECOND * validity.value;
      case 'minute':
        return this.MINUTE * validity.value;
      case 'hour':
        return this.HOUR * validity.value;
      case 'day':
        return this.DAY * validity.value;
      case 'week':
        return this.WEEK * validity.value;
      case 'month':
        return this.MONTH * validity.value;
      case 'year':
        return this.YEAR * validity.value;
      default:
        throw new Error('Unsupported validity type in use');
    }
  }

  /**
   * Returns a random serial number
   */
  public static randomSerial() {
    return Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));
  }

  /**
   * Creates X509 certificate
   * @param params Parameters
   */
  public static async create(params: ICertificateGeneratorCreateParams) {
    pkijs.setEngine('OpenSSL', crypto, new pkijs.CryptoEngine({ name: 'OpenSSL', crypto, subtle: crypto.subtle }));

    const cert = new x509.Certificate();

    // region Put a static values
    const tbs = cert.tbsCertificate;
    tbs.version = x509.Version.v3;
    tbs.serialNumber = params.serialNumber
      ? Convert.FromHex(params.serialNumber.toString(16))
      : new Uint8Array([1]).buffer;

    tbs.subject = this.createName(params.subject);
    tbs.issuer = this.createName(params.issuer || params.subject);

    // Valid period
    tbs.validity.notBefore.utcTime = new Date(); // current date
    const notAfter = new Date();
    notAfter.setSeconds(notAfter.getSeconds() + this.getSeconds(params.validity));
    tbs.validity.notAfter.utcTime = notAfter;

    // Extensions are not a part of certificate by default, it's an optional array
    tbs.extensions = new x509.Extensions(params.extensions);

    const pkiCert = new pkijs.Certificate({ schema: asn.AsnSerializer.toASN(cert) });
    await pkiCert.subjectPublicKeyInfo.importKey(params.publicKey);
    const hashName = params.hashAlg
      || (params.signingKey.algorithm as RsaHashedKeyAlgorithm).hash.name
      || this.HASH;
    await pkiCert.sign(params.signingKey, hashName);

    const pem = core.PemConverter.fromBufferSource(pkiCert.toSchema().toBER(false), 'CERTIFICATE');

    return {
      cert: pem,
      publicKey: params.publicKey,
    } as ICertificate;
  }
}
