import { EventEmitter } from 'events';
import * as path from 'path';
import * as semver from 'semver';
import * as fs from 'fs';
import { request } from './utils';
import { JWS_LINK, APP_DIR } from './constants';
import { logger } from './logger';
import * as jws from './jws';
import { UpdateError } from './errors';

class Updater extends EventEmitter {
  on(event: 'update-found', cb: (version: string) => void): this;

  on(event: 'update-not-found', cb: () => void): this;

  on(event: 'error', cb: (error: UpdateError) => void): this;

  on(event: string, cb: (...args: any[]) => void) {
    return super.on(event, cb);
  }

  emit(event: 'update-found', version: string): boolean;

  emit(event: 'update-not-found'): boolean;

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
      logger.warn(`Cannot GET ${JWS_LINK}`);
      logger.error(error);

      // TODO: Add intl.
      throw new UpdateError('error.update.server');
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
      logger.error(`GetUpdateInfo: ${error.toString()}`);

      if (error instanceof UpdateError) {
        throw error;
      }

      // TODO: Add intl.
      throw new UpdateError('error.update.check');
    }
  }

  async checkForUpdates() {
    try {
      logger.info('Update: Check for new update');

      const update = await this.getUpdateInfo();
      // Get current version
      const packageJson = fs.readFileSync(path.join(APP_DIR, 'package.json')).toString();
      const curVersion = JSON.parse(packageJson).version;

      // Compare versions
      if (semver.lt(curVersion, update.version)) {
        logger.info('Update: New version was found');

        this.emit('update-found', update.version);

        // TODO: Add handlers for critical update.
        // await new Promise((resolve) => {
        //   QuestionWindow.create({
        //     params: {
        //       type: 'question',
        //       text: intl('question.update.new', update.version),
        //       id: 'question.update.new',
        //       result: 0,
        //       showAgain: true,
        //       showAgainValue: false,
        //     },
        //     onClosed: (result) => {
        //       if (result) {
        //         // yes
        //         winston.info(`User agreed to download new version ${update.version}`);
        //         shell.openExternal(constants.DOWNLOAD_LINK);
        //       } else {
        //         // no
        //         winston.info(`User refused to download new version ${update.version}`);
        //       }

        //       if (update.min && semver.lt(curVersion, update.min)) {
        //         winston.info(`Update ${update.version} is critical. App is not matching to minimal criteria`);

        //         ErrorWindow.create({
        //           params: {
        //             type: 'error',
        //             text: intl('error.critical.update'),
        //           },
        //           onClosed: () => {
        //             winston.info('Close application');
        //             quit();
        //           },
        //         });
        //       } else {
        //         resolve();
        //       }
        //     },
        //   });
        // });
      } else {
        logger.info('Update: New version wasn\'t found');

        this.emit('update-not-found');
      }
    } catch (error) {
      logger.error(error.toString());

      if (error instanceof UpdateError) {
        this.emit('error', error);
      }
    }
  }
}

export const autoUpdater = new Updater();
