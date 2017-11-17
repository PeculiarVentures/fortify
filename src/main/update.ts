import * as request from "request";
import * as winston from "winston";

import { JWS_LINK } from "./const";
import * as jws from "./jws";
import { UpdateError } from "./update_error";

function GetJWS() {
  return new Promise<string>((resolve, reject) => {
    request.get(JWS_LINK, {
      encoding: "utf8",
    }, (error, response, body) => {
      if (error) {
        winston.warn(`Cannot GET ${JWS_LINK}`);
        winston.error(error.toString());
        reject(new UpdateError("Unable to connect to update server", false));
      } else {
        resolve(body.replace(/[\n\r]/g, ""));
      }
    });
  });
}

/**
 * @typedef {Object} UpdateInfo
 * @property {string}   version     Current version of install package
 * @property {string}   [min]       min version. If version of working app is lower we should stop app for secure reason
 */

/**
 * Get info from trusted update.jws
 * @return {Promise<UpdateInfo>}
 */
export async function GetUpdateInfo() {
  try {
    const jwsString = await GetJWS();
    return jws.GetContent(jwsString);
  } catch (e) {
    winston.error(`GetUpdateInfo: ${e.toString()}`);
    throw new UpdateError("Unable to check updated version.", true);
  }
}
