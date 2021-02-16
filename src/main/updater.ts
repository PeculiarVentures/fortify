import { EventEmitter } from 'events';
import * as path from 'path';
import * as semver from 'semver';
import * as fs from 'fs';
import { request } from './utils';
import { JWS_LINK, APP_DIR } from './constants';
import logger from './logger';
import * as jws from './jws';
import { UpdateError } from './errors';
import { l10n } from './l10n';

type UpdateInfo = {
  version: string;
  createdAt: number;
  min?: string;
};

class Updater extends EventEmitter {
  on(event: 'update-available', cb: (info: UpdateInfo) => void): this;

  on(event: 'update-not-available', cb: () => void): this;

  on(event: 'checking-for-update', cb: () => void): this;

  on(event: 'error', cb: (error: UpdateError) => void): this;

  on(event: string, cb: (...args: any[]) => void) {
    return super.on(event, cb);
  }

  emit(event: 'update-available', info: UpdateInfo): boolean;

  emit(event: 'update-not-available'): boolean;

  emit(event: 'checking-for-update'): boolean;

  emit(event: 'error', error: UpdateError): boolean;

  emit(event: string, ...args: any[]) {
    return super.emit(event, ...args);
  }

  // eslint-disable-next-line class-methods-use-this
  private async getJWS() {
    try {
      const response = await request(JWS_LINK);

      return response.replace(/[\n\r]/g, '');
    } catch (error) {
      logger.error('update', 'JWS GET error', {
        jwsLink: JWS_LINK,
        error: error.message,
        stack: error.stack,
      });

      throw new UpdateError('Unable to connect to update server');
    }
  }

  /**
   * Get info from trusted update.jws
   */
  private async getUpdateInfo(): Promise<UpdateInfo> {
    try {
      const jwsString = await this.getJWS();

      return jws.getContent(jwsString);
    } catch (error) {
      logger.error('update', 'Get info error', {
        error: error.message,
        stack: error.stack,
      });

      if (error instanceof UpdateError) {
        throw error;
      }

      throw new UpdateError('Unable to check updated version');
    }
  }

  async checkForUpdates() {
    this.emit('checking-for-update');
    logger.info('update', 'Check for new update');

    try {
      const info = await this.getUpdateInfo();
      // Get current version
      const packageJson = fs.readFileSync(path.join(APP_DIR, 'package.json')).toString();
      const curVersion = JSON.parse(packageJson).version;

      // Compare versions
      if (semver.lt(curVersion, info.version)) {
        logger.info('update', 'New version was found');

        this.emit('update-available', info);
      } else {
        logger.info('update', 'New version wasn\'t found');

        this.emit('update-not-available');
      }
    } catch (error) {
      logger.error('update', 'Update error', {
        error: error.message,
        stack: error.stack,
      });

      if (error instanceof UpdateError) {
        this.emit('error', error);
      }
    }
  }
}

export const autoUpdater = new Updater();
