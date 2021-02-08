import { EventEmitter } from 'events';
import { shell, app } from 'electron';
import * as path from 'path';
import * as semver from 'semver';
import * as fs from 'fs';
import { request } from './utils';
import { JWS_LINK, APP_DIR, DOWNLOAD_LINK } from './constants';
import logger from './logger';
import * as jws from './jws';
import { UpdateError } from './errors';
import { windowsController } from './windows';
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

        try {
          const questionWindowResult = await windowsController.showQuestionWindow({
            text: l10n.get('question.update.new', update.version),
            id: 'question.update.new',
            result: 0,
            showAgain: true,
            showAgainValue: false,
          });

          if (questionWindowResult.result) { // yes
            logger.info('update', 'User agreed to download new version', {
              version: update.version,
            });

            shell.openExternal(DOWNLOAD_LINK);
          } else { // no
            logger.info('update', 'User refused to download new version', {
              version: update.version,
            });
          }
        } catch {
          //
        }

        if (update.min && semver.lt(curVersion, update.min)) {
          logger.info('update', 'Version is critical. App is not matching to minimal criteria', {
            version: update.version,
          });

          await windowsController.showErrorWindow({
            text: l10n.get('error.critical.update'),
          });

          app.quit();
        }
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
