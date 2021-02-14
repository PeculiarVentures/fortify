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

class Updater extends EventEmitter {
  on(event: 'update-found', cb: (version: string) => void): this;

  on(event: 'update-not-found', cb: () => void): this;

  on(event: 'update-error', cb: (error: UpdateError) => void): this;

  on(event: string, cb: (...args: any[]) => void) {
    return super.on(event, cb);
  }

  emit(event: 'update-found', version: string): boolean;

  emit(event: 'update-not-found'): boolean;

  emit(event: 'update-error', error: UpdateError): boolean;

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

      throw new UpdateError(l10n.get('error.update.server'));
    }
  }

  /**
   * Get info from trusted update.jws
   */
  private async getUpdateInfo() {
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

      throw new UpdateError(l10n.get('error.update.check'));
    }
  }

  async checkForUpdates() {
    try {
      logger.info('update', 'Check for new update');

      const update = await this.getUpdateInfo();
      // Get current version
      const packageJson = fs.readFileSync(path.join(APP_DIR, 'package.json')).toString();
      const curVersion = JSON.parse(packageJson).version;

      // Compare versions
      if (semver.lt(curVersion, update.version)) {
        logger.info('update', 'New version was found');

        this.emit('update-found', update.version);
      } else {
        logger.info('update', 'New version wasn\'t found');

        this.emit('update-not-found');
      }
    } catch (error) {
      logger.error('update', 'Update error', {
        error: error.message,
        stack: error.stack,
      });

      if (error instanceof UpdateError) {
        this.emit('update-error', error);
      }
    }
  }
}

export const autoUpdater = new Updater();
