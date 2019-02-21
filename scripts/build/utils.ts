/// <reference path="types.d.ts" />

import * as childProcess from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";
import * as json from "json-parser";
import * as os from "os";
import * as path from "path";
import * as rimraf from "rimraf";

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
      .on("close", () => {
        resolve();
      })
      .on("error", reject);
  });
}

export const TMP = path.join(os.tmpdir(), crypto.randomBytes(10).toString("hex"));

export function createTempDir(dir = TMP) {
  if (!fs.existsSync(dir)) {
    process.stdout.write(`Create TMP directory ${dir}\n\n`);
    fs.mkdirSync(dir);
  }
}

export function removeTmpDir(dir = TMP) {
  if (fs.existsSync(dir)) {
    process.stdout.write(`Remove TMP directory ${dir}\n\n`);
    rimraf.sync(dir);
  }
}

export function getFortifyPrepareConfig(file: string) {
  const text = fs.readFileSync(file, { encoding: "utf8" });
  return json.parse(text) as {
    outDir: string;
  };
}

export function getVersion() {
  const text = fs.readFileSync("package.json", { encoding: "utf8" });
  return json.parse(text).version as string;
}
