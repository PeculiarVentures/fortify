/* eslint-disable no-continue */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-restricted-syntax */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as childProcess from 'child_process';
import { PemConverter } from 'webcrypto-core';
import { Firefox } from './firefox';
import { NssCertUtils } from './nss';
import { SRC_DIR } from '../../constants';
import logger from '../../logger';

export interface ISslCertInstallerPolicy {
  /**
   * Path to NSS certutil application
   */
  nssCertUtil: string;
  /**
   * NSS certificate name in data base storage
   */
  nssCertName: string;
  /**
   * App name for sudo dialog
   *
   * Default value is 'Fortify application'
   */
  osxAppName?: string;
  /**
   * Path to icon for sudo dialog. File extension should be icns.
   *
   * Default path is '/Applications/Fortify.app/Contents/Resources/static/icons/tray/mac/icon.icns'
   */
  osxAppIcons?: string;
}

export class SslCertInstaller {
  public constructor(public policy: ISslCertInstallerPolicy) { }

  /**
   * Installs CA certificate to trusted storages (System, Firefox, Chrome, etc)
   * @param certPath Path to CA PEM file
   */
  public async install(certPath: string) {
    const platform = os.platform();

    switch (platform) {
      case 'linux':
        this.installLinux(certPath);
        break;
      case 'darwin':
        await this.installDarwin(certPath);
        break;
      case 'win32':
        // MSI installer adds SSL certificate to Root storage
        break;
      default:
        throw new Error('Unsupported Operation System');
    }

    this.installFirefox(certPath);
  }

  private installLinux(cert: string) {
    // Add cert to Chrome storage
    const USER_HOME = os.homedir();
    const CHROME_DIR = path.normalize(`${USER_HOME}/.pki/nssdb`);
    const certName = this.policy.nssCertName;
    const nss = new NssCertUtils(this.policy.nssCertUtil, `sql:${CHROME_DIR}`);

    if (nss.exists(certName)) {
      // Remove a prev SSL certificate
      const pem = nss.get(certName);
      nss.remove(certName);

      logger.info('ssl-installer', 'SSL certificate removed from Chrome profile', {
        profile: CHROME_DIR,
        certName,
        pem,
      });
    }

    nss.add(cert, certName, 'CT,c,');

    logger.info('ssl-installer', 'SSL certificate added to Chrome profile', {
      profile: CHROME_DIR,
      certName,
    });
  }

  private async installDarwin(certPath: string) {
    await new Promise((resolve, reject) => {
      const certName = this.policy.nssCertName;
      const { username } = os.userInfo();

      logger.info('ssl-installer', 'Adding CA certificate to System KeyChain');

      childProcess.exec(`certPath="${certPath}" certName="${certName}" userDir="${os.homedir()}" USER="${username}" bash ${SRC_DIR}/resources/osx-ssl.sh`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });

      logger.info('ssl-installer', 'SSL certificate added to User KeyChain', {
        certName,
      });
    });
  }

  public installFirefox(certPath: string) {
    const certName = this.policy.nssCertName;
    const certUtil = this.policy.nssCertUtil;
    const caPem = fs.readFileSync(certPath, { encoding: 'utf8' });
    const caDer = PemConverter.toArrayBuffer(caPem);
    const profiles = Firefox.profiles();
    let installed = false;

    for (const profile of profiles) {
      try {
        const nss = new NssCertUtils(certUtil, `sql:${profile}`);

        if (nss.exists(certName, caDer)) {
          continue;
        }

        if (nss.exists(certName)) {
          // Remove a prev SSL certificate
          const pem = nss.get(certName);

          nss.remove(certName);

          logger.info('ssl-installer', 'SSL certificate removed from Mozilla Firefox profile', {
            profile,
            certName,
            pem,
          });
        }
        // Add cert to NSS
        nss.add(certPath, certName, 'CT,c,');

        logger.info('ssl-installer', 'SSL certificate added to Mozilla Firefox profile', {
          profile,
          certName,
        });
        installed = true;
      } catch (error) {
        logger.error('ssl-installer', 'SSL install error', {
          error: error.message,
          stack: error.stack,
        });
      }
    }

    if (profiles.length && installed) {
      Firefox.restart();
    }
  }
}
