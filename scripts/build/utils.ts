/// <reference path="./types.d.ts" />

import * as childProcess from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";
import * as request from "request";
import * as json from "json-parser";
import * as os from "os";
import * as path from "path";
import * as rimraf from "rimraf";
import * as extractZip from "extract-zip";

/**
 * Calls commands and print message about it to console
 * @param command 
 * @param args 
 * @param message 
 */
export function spawn(command: string, args: string[] = [], message = "") {
  return new Promise((resolve, reject) => {
    process.stdout.write([
      "",
      `\x1b[36mRun command: ${message}\x1b[0m`,
      `\x1b[33m  ${command} ${args.join(" ")}\x1b[0m`,
      "",
      ""].join("\n"));
    let item: childProcess.ChildProcess;
    if (os.platform() === "win32") {
      item = childProcess.spawn("cmd", ["/c", command, ...args], { stdio: "inherit" });
    } else {
      item = childProcess.spawn(command, args, { stdio: "inherit" });
    }
    item
      .on("message", (msg) => {
        process.stdout.write(msg);
      })
      .on("close", (code) => {
        if (code) {
          reject(new Error(`Command finished with code ${code}`));
        } else {
          resolve();
        }
      })
      .on("error", reject);
  });
}

/**
 * TMP directory. <TMP>/HEX(Random10)
 */
export const TMP = path.join(os.tmpdir(), crypto.randomBytes(10).toString("hex"));

/**
 * Creates TMP directory
 * @param dir 
 */
export function createTempDir(dir = TMP) {
  if (!fs.existsSync(dir)) {
    process.stdout.write(`Create TMP directory ${dir}\n\n`);
    fs.mkdirSync(dir);
  }
}

/**
 * Removes TMP directory
 * @param dir 
 */
export function removeTmpDir(dir = TMP) {
  if (fs.existsSync(dir)) {
    process.stdout.write(`Remove TMP directory ${dir}\n\n`);
    rimraf.sync(dir);
  }
}

/**
 * Returns fprepare.json parsed file
 * @param file 
 */
export function getFortifyPrepareConfig(file: string) {
  const text = fs.readFileSync(file, { encoding: "utf8" });
  return json.parse(text) as {
    outDir: string;
  };
}

/**
 * Returns version from package.json
 */
export function getVersion() {
  const text = fs.readFileSync("package.json", { encoding: "utf8" });
  return json.parse(text).version as string;
}

export async function downloadAsync(uri: string, file: string) {
  process.stdout.write([
    "",
    `\x1b[36mDownlading: ${uri}\x1b[0m`,
    `\x1b[33m  ${file}\x1b[0m`,
    "",
    ""].join("\n"));

  return new Promise((resolve, reject) => {
    let fileStream = fs.createWriteStream(file);
    request({
      uri,
    })
      .pipe(fileStream)
      .on('finish', () => {
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      })
  });
}

export async function extractAsync(file: string, directory: string) {
  process.stdout.write([
    "",
    `\x1b[36mExtracting ZIP: ${file}\x1b[0m`,
    `\x1b[33m  ${directory}\x1b[0m`,
    "",
    ""].join("\n"));
  return new Promise((resolve, reject) => {
    extractZip(file, { dir: directory }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  })
}
