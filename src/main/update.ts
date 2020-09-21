import { shell } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';
import * as winston from 'winston';

import { quit } from './application';
import {
  APP_DIR, DOWNLOAD_LINK, JWS_LINK,
} from './const';
import * as jws from './jws';
import { intl } from './locale';
import { UpdateError } from './update_error';
import { request } from './utils';
import { CreateErrorWindow, CreateQuestionWindow } from './windows';

async function GetJWS() {
  try {
    const resp = await request(JWS_LINK);

    return resp.replace(/[\n\r]/g, '');
  } catch (e) {
    winston.warn(`Cannot GET ${JWS_LINK}`);
    winston.error(e);
    throw new UpdateError(intl('error.update.server'), false);
  }
}

/**
 * Get info from trusted update.jws
 */
export async function GetUpdateInfo() {
  try {
    const jwsString = await GetJWS();

    return jws.GetContent(jwsString);
  } catch (err) {
    winston.error(`GetUpdateInfo: ${err.toString()}`);
    if (err instanceof UpdateError) {
      throw err;
    } else {
      throw new UpdateError(intl('error.update.check'), false);
    }
  }
}

export async function CheckUpdate() {
  try {
    winston.info('Update: Check for new update');
    const update = await GetUpdateInfo();
    // get current version
    const packageJson = fs.readFileSync(path.join(APP_DIR, 'package.json')).toString();
    const curVersion = JSON.parse(packageJson).version;

    // compare versions
    if (semver.lt(curVersion, update.version)) {
      winston.info('Update: New version was found');
      await new Promise((resolve) => {
        CreateQuestionWindow(
          intl('question.update.new', update.version),
          { id: 'question.update.new', showAgain: true },
          (res) => {
            if (res) {
              // yes
              winston.info(`User agreed to download new version ${update.version}`);
              shell.openExternal(DOWNLOAD_LINK);
            } else {
              // no
              winston.info(`User refused to download new version ${update.version}`);
            }
            if (update.min && semver.lt(curVersion, update.min)) {
              winston.info(`Update ${update.version} is critical. App is not matching to minimal criteria`);

              CreateErrorWindow({
                params: {
                  type: 'error',
                  text: intl('error.critical.update'),
                },
                onClosed: () => {
                  winston.info('Close application');
                  quit();
                },
              });
            } else {
              resolve();
            }
          },
        );
      });
    } else {
      winston.info("Update: New version wasn't found");
    }
  } catch (e) {
    winston.error(e.toString());
    if (e.type === 'UpdateError' && e.critical) {
      await new Promise(() => {
        CreateErrorWindow({
          params: {
            type: 'error',
            text: e.toString(),
          },
          onClosed: () => {
            quit();
          },
        });
      });
    } else {
      // await new Promise((resolve, reject) => {
      //   CreateWarningWindow(``, () => {
      //     resolve();
      //   });
      // });
    }
  }
}
