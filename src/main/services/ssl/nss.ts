/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import { execSync } from 'child_process';
import * as os from 'os';
import { BufferSourceConverter, Convert } from 'pvtsutils';
import { PemConverter } from 'webcrypto-core';
import logger from '../../logger';

export interface INssCertUtilArguments {
  [key: string]: string | undefined;

  /**
   * Use ASCII format or allow the use of ASCII format for input or output.
   * This formatting follows RFC 1113. For certificate requests,
   * ASCII output defaults to standard output unless redirected.
   * ```text
   * -a
   * ```
   */
  a?: string;
  /**
   * Specify a time at which a certificate is required to be valid.
   * Use when checking certificate validity with the -V option.
   * The format of the validity-time argument is "YYMMDDHHMMSS[+HHMM|-HHMM|Z]".
   * Specifying seconds (SS) is optional. When specifying an explicit time, use "YYMMDDHHMMSSZ".
   * When specifying an offset time, use "YYMMDDHHMMSS+HHMM" or "YYMMDDHHMMSS-HHMM".
   * If this option is not used, the validity check defaults to the current system time.
   * ```text
   * -b validity-time
   * ```
   */
  b?: string;
  /**
   * Identify the certificate of the CA from which a new certificate will derive its authenticity.
   * Use the exact nickname or alias of the CA certificate, or use the CA's email address.
   * Bracket the issuer string with quotation marks if it contains spaces.
   * ```text
   * -c issuer
   * ```
   */
  c?: string;
  /**
   * Specify the database directory containing the certificate and key database files.
   * On Unix the Certificate Database Tool defaults to $HOME/.netscape (that is, ~/.netscape).
   * On Windows NT the default is the current directory.
   *
   * The cert8.db and key3.db database files must reside in the same directory.
   * ```text
   * -d directory
   * ```
   */
  d?: string;
  /**
   * Specify the prefix used on the cert8.db and key3.db files
   * (for example, my_cert8.db and my_key3.db).
   * This option is provided as a special case.
   * Changing the names of the certificate and key databases is not recommended.
   * ```text
   * -P dbprefix
   * ```
   */
  P?: string;
  /**
   * Check a certificate's signature during the process of validating a certificate.
   * * ```text
   * -e
   * ```
   */
  e?: string;
  /**
   * Specify a file that will automatically supply the password to include in a certificate
   * or to access a certificate database. This is a plain-text file containing one password.
   * Be sure to prevent unauthorized access to this file.
   * ```text
   * -f password-file
   * ```
   */
  f?: string;
  /**
   * Set a key size to use when generating new public and private key pairs.
   * The minimum is 512 bits and the maximum is 8192 bits. The default is 1024 bits.
   * Any size that is a multiple of 8 between the minimum and maximum is allowed.
   * ```text
   * -g keysize
   * ```
   */
  g?: string;
  /**
   * Specify the name of a token to use or act on. Unless specified
   * otherwise the default token is an internal slot (specifically, internal slot 2).
   * This slot can also be explicitly named with the string "internal".
   * An internal slots is a virtual slot maintained in software, rather than a hardware device.
   * Internal slot 2 is used by key and certificate services.
   * Internal slot 1 is used by cryptographic services.
   * ```text
   * -h tokenname
   * ```
   */
  h?: string;
  /**
   * Specify a specific certificate, or a certificate-request file.
   * ```text
   * -i cert|cert-request-file
   * ```
   */
  i?: string;
  /**
   * Specify the type of a key: RSA, DSA or both. The default value is rsa.
   * By specifying the type of key you can avoid mistakes caused by duplicate nicknames.
   * ```text
   * -k rsa|dsa|all
   * ```
   */
  k?: 'rsa' | 'dsa' | 'all';
  /**
   * Display detailed information when validating a certificate with the -V option.
   * ```text
   * -l
   * ```
   */
  l?: string;
  /**
   * Assign a unique serial number to a certificate being created.
   * This operation should be performed by a CA. The default serial number is 0 (zero).
   * Serial numbers are limited to integers.
   * ```text
   * -m serial-number
   * ```
   */
  m?: string;
  /**
   * Specify the nickname of a certificate or key to list, create, add to a database,
   * modify, or validate. Bracket the nickname string with quotation marks if it contains spaces.
   * ```text
   * -n nickname
   * ```
   */
  n?: string;
  /**
   * Specify the output file name for new certificates or binary certificate requests.
   * Bracket theoutput-file string with quotation marks if it contains spaces.
   * If this argument is not used the output destination defaults to standard output.
   * ```text
   * -o output-file
   * ```
   */
  o?: string;
  /**
   * Specify a contact telephone number to include in new certificates or certificate requests.
   * Bracket this string with quotation marks if it contains spaces.
   * ```text
   * -p phone
   * ```
   */
  p?: string;
  /**
   * Read an alternate PQG value from the specified file when generating DSA key pairs.
   * If this argument is not used, the Key Database Tool generates its own PQG value.
   * PQG files are created with a separate DSA utility.
   * ```text
   * -q pqgfile
   * ```
   */
  q?: string;
  /**
   * Display a certificate's binary DER encoding when listing information
   * about that certificate with the -L option.
   * ```text
   * -r
   * ```
   */
  r?: string;
  /**
   * Identify a particular certificate owner for new certificates or certificate requests.
   * Bracket this string with quotation marks if it contains spaces.
   * The subject identification format follows RFC 1485.
   * ```text
   * -s subject
   * ```
   */
  s?: string;
  /**
   * Specify the trust attributes to modify in an existing certificate
   * or to apply to a certificate when creating it or adding it to a database.
   *
   * There are three available trust categories for each certificate,
   * expressed in this order: "SSL ,email ,object signing ".
   * In each category position use zero or more of the following attribute codes:
   *
   * `p`    prohibited (explicitly distrusted)
   *
   * `P`    Trusted peer
   *
   * `c`    Valid CA
   *
   * `T`    Trusted CA to issue client certificates (implies c)
   *
   * `C`    Trusted CA to issue server certificates (SSL only)
   *      (implies c)
   *
   * `u`    Certificate can be used for authentication or signing
   *
   * `w`    Send warning (use with other attributes to include a warning
   *      when the certificate is used in that context)
   *
   * The attribute codes for the categories are separated by commas,
   * and the entire set of attributes enclosed by quotation marks. For example:
   *
   * -t "TCu,Cu,Tuw"
   *
   */
  t?: string;
  /**
   * Specify a usage context to apply when validating a certificate with the -V option.
   *
   * The contexts are the following:
   *
   * C (as an SSL client)
   *
   * V (as an SSL server)
   *
   * S (as an email signer)
   *
   * R (as an email recipient)
   *
   * ```text
   * -u certusage
   * ```
   */
  u?: string;
  /**
   * Set the number of months a new certificate will be valid.
   * The validity period begins at the current system time unless an offset is added
   * or subtracted with the -w option.
   * If this argument is not used, the default validity period is three months.
   * When this argument is used, the default three-month period is automatically added
   * to any value given in thevalid-month argument. For example, using this option
   * to set a value of 3 would cause 3 to be added to the three-month default,
   * creating a validity period of six months. You can use negative values
   * to reduce the default period. For example, setting a value of -2 would subtract 2
   * from the default and create a validity period of one month.
   *
   * ```text
   * -v valid-months
   * ```
   */
  v?: string;
  /**
   * Set an offset from the current system time, in months, for the beginning
   * of a certificate's validity period. Use when creating the certificate
   * or adding it to a database. Express the offset in integers, using a minus sign (-)
   * to indicate a negative offset. If this argument is not used,
   * the validity period begins at the current system time.
   * The length of the validity period is set with the -v argument.
   *
   * ```text
   * -w offset-months
   * ```
   */
  w?: string;
  /**
   * Use the Certificate Database Tool to generate the signature for a certificate being created
   * or added to a database, rather than obtaining a signature from a separate CA.
   *
   * ```text
   * -x
   * ```
   */
  x?: string;
  /**
   * Set an alternate exponent value to use in generating a new RSA public key for the database,
   * instead of the default value of 65537. The available alternate values are 3 and 17.
   *
   * ```text
   * -y exp
   * ```
   */
  y?: string;
  /**
   * Read a seed value from the specified binary file to use in generating a new RSA private
   * and public key pair. This argument makes it possible to use hardware-generated seed values
   * and unnecessary to manually create a value from the keyboard.
   * The minimum file size is 20 bytes.
   *
   * ```text
   * -z noise-file
   * ```
   */
  z?: string;
  /**
   * Add a key usage extension to a certificate that is being created or added to a database.
   * This extension allows a certificate's key to be dedicated to supporting specific operations
   * such as SSL server or object signing. The Certificate Database Tool will prompt you
   * to select a particular usage for the certificate's key. These usages are described under
   * Standard X.509 v3 Certificate Extensions in Appendix A.3 of the Red Hat
   * Certificate System Administration Guide.
   *
   * ```text
   * -1
   * ```
   */
  1?: string;
  /**
   * Add a basic constraint extension to a certificate that is being created or
   * added to a database. This extension supports the certificate chain verification process.
   * The Certificate Database Tool will prompt you to select the certificate constraint extension.
   * Constraint extensions are described in Standard X.509 v3 Certificate Extensions
   * in Appendix A.3 of the Red Hat Certificate System Administration Guide.
   *
   * ```text
   * -2
   * ```
   */
  2?: string;
  /**
   * Add an authority keyID extension to a certificate that is being created or added
   * to a database. This extension supports the identification of a particular certificate,
   * from among multiple certificates associated with one subject name, as the correct issuer
   * of a certificate. The Certificate Database Tool will prompt you to select
   * the authority keyID extension. Authority key ID extensions are described under
   * Standard X.509 v3 Certificate Extensions in Appendix B.3 of the Red Hat Certificate
   * System Administration Guide.
   *
   * ```text
   * -3
   * ```
   */
  3?: string;
  /**
   * Add a CRL distribution point extension to a certificate that is being created
   * or added to a database. This extension identifies the URL of a certificate's
   * associated certificate revocation list (CRL). The Certificate Database Tool prompts you
   * to enter the URL. CRL distribution point extensions are described in Standard X.509 v3
   * Certificate Extensions in Appendix A.3 of theRed Hat Certificate System Administration Guide.
   *
   * ```text
   * -4
   * ```
   */
  4?: string;
  /**
   * Add a Netscape certificate type extension to a certificate that is being created
   * or added to the database. Netscape certificate type extensions are described in
   * Standard X.509 v3 Certificate Extensions in Appendix A.3 of theRed Hat Certificate
   * System Administration Guide.
   *
   * ```text
   * -5
   * ```
   */
  5?: string;
  /**
   * Add an extended key usage extension to a certificate that is being created
   * or added to the database. Extended key usage extensions are described in
   * Standard X.509 v3 Certificate Extensions in Appendix A.3 of theRed Hat Certificate
   * System Administration Guide.
   *
   * ```text
   * -6
   * ```
   */
  6?: string;
  /**
   * Add a comma-separated list of email addresses to the subject alternative name extension
   * of a certificate or certificate request that is being created or added to the database.
   * Subject alternative name extensions are described in Section 4.2.1.7 of RFC 32800.
   *
   * ```text
   * -7 emailAddrs
   * ```
   */
  7?: string;
  /**
   * Add a comma-separated list of DNS names to the subject alternative name extension
   * of a certificate or certificate request that is being created or added to the database.
   * Subject alternative name extensions are described in Section 4.2.1.7 of RFC 32800
   *
   * ```text
   * -8 dns-names
   * ```
   */
  8?: string;
}

export interface INssCertList {
  name: string;
  attrs: INssTrustedAttributes;
}

export interface INssTrustedAttributes {
  ssl: string;
  sMime: string;
  jar: string;
}

/**
 * NSS tools certutil
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Projects/NSS/tools/NSS_Tools_certutil
 */
export class NssCertUtils {
  public app: string;

  public dbDirectory: string;

  public constructor(app: string, dbDirectory: string) {
    this.app = app;
    this.dbDirectory = dbDirectory;
  }

  /**
   * Adds certificate file to NSS database storage
   * @param cert Path to certificate
   * @param certName Certificate name
   * @param attrs Trusted attributes. Default is ',,'
   */
  public add(cert: string, certName: string, attrs: string = ',,') {
    this.run('-A', {
      d: this.dbDirectory,
      i: cert,
      n: certName,
      t: attrs,
    });
  }

  /**
   * Returns true if certificate exists in NSS database storage, otherwise false
   * @param certName Certificate name
   */
  public exists(certName: string, cert?: BufferSource) {
    const certs = this.list();

    const ok = certs.some((o) => o.name === certName);
    if (ok && cert) {
      const derCert = BufferSourceConverter.toArrayBuffer(cert);
      const nssCertPem = this.get(certName);
      const nssCertDer = PemConverter.toArrayBuffer(nssCertPem);

      return Convert.ToHex(derCert) === Convert.ToHex(nssCertDer);
    }

    return ok;
  }

  /**
   * Removes certificate from NSS database storage
   * @param certName Certificate name
   */
  public remove(certName: string) {
    this.run('-D', {
      d: this.dbDirectory,
      n: certName,
    });
  }

  /**
   * Gets list of certificates from NSS database storage
   */
  public list() {
    // certutil -L -d nssdb -h all
    const out = this.run('-L', {
      d: this.dbDirectory,
      h: 'all',
    });
    const lines = out.split('\n'); // skip table headers
    const certLines = lines.slice(4);
    const res: INssCertList[] = [];
    for (const cert of certLines) {
      const attrsRegex = / *([pPcTCuw,]*) *$/;
      const certName = cert.replace(new RegExp(attrsRegex), '');
      if (!certName) {
        // skip records without cert name
        break;
      }
      const matches = attrsRegex.exec(cert);
      if (!matches) {
        break;
      }
      const attrs = matches[1].split(',');
      res.push({
        name: certName,
        attrs: {
          ssl: attrs[0],
          sMime: attrs[1],
          jar: attrs[2],
        },
      });
    }

    return res;
  }

  /**
   * Gets certificate from NSS database storage in PEM format
   * @param certName Certificate name
   */
  public get(certName: string) {
    const out = this.run('-L', {
      d: this.dbDirectory,
      n: certName,
      a: '',
    });

    return out;
  }

  /**
   * Runs NSS certutil command
   * @param command Command (eg -L, -D, -A)
   * @param args NSS arguments
   */
  public run(command: string, args: INssCertUtilArguments = {}) {
    const shell = os.platform() === 'win32' ? 'cmd' : 'bash';
    const args2: string[] = [];

    for (const key in args) {
      args2.push(`-${key} "${args[key]}"`);
    }

    const execCommand = `"${this.app}" ${command} ${args2.join(' ')}`;

    logger.info('nss', 'Run certutil command', { command: execCommand, shell });

    return execSync(execCommand, { shell }).toString();
  }
}
