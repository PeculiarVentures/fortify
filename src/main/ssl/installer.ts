/* eslint-disable class-methods-use-this */
/* eslint-disable no-restricted-syntax */

import * as os from 'os';
import * as path from 'path';
import * as sudo from 'sudo-prompt';
import * as winston from 'winston';
import { Firefox } from './firefox';
import { NssCertUtils } from './nss';
import { SRC_DIR } from '../const';

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
      winston.info('SSL certificate removed from Chrome profile', {
        class: 'SslCertInstaller',
        profile: CHROME_DIR,
        certName,
        pem,
      });
    }
    nss.add(cert, certName, 'CT,c,');
    winston.info('SSL certificate added to Chrome profile', {
      class: 'SslCertInstaller',
      profile: CHROME_DIR,
      certName,
    });
  }

  private async installDarwin(certPath: string) {
    await new Promise((resolve, reject) => {
      const certName = this.policy.nssCertName;
      const options = {
        name: this.policy.osxAppName || 'Fortify application',
        icons: this.policy.osxAppIcons || '/Applications/Fortify.app/Contents/Resources/static/icons/tray/mac/icon.icns',
      };
      const { username } = os.userInfo();
      winston.info('SSL: Adding CA certificate to System KeyChain');
      sudo.exec(`certPath="${certPath}" certName="${certName}" userDir="${os.homedir()}" USER="${username}" bash ${SRC_DIR}/resources/osx-ssl.sh`, options, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
      winston.info('SSL certificate added to System KeyChain', {
        class: 'SslCertInstaller',
        certName,
      });
    });
  }

  private installFirefox(cert: string) {
    const certName = this.policy.nssCertName;
    const certUtil = this.policy.nssCertUtil;

    const profiles = Firefox.profiles();
    for (const profile of profiles) {
      const nss = new NssCertUtils(certUtil, `sql:${profile}`);
      if (nss.exists(certName)) {
        // Remove a prev SSL certificate
        const pem = nss.get(certName);
        nss.remove(certName);
        winston.info('SSL certificate removed from Mozilla Firefox profile', {
          class: 'SslCertInstaller',
          profile,
          certName,
          pem,
        });
      }
      //
      nss.add(cert, certName, 'CT,c,');
      winston.info('SSL certificate added to Mozilla Firefox profile', {
        class: 'SslCertInstaller',
        profile,
        certName,
      });
    }

    if (profiles.length) {
      Firefox.restart();
    }
  }
}
