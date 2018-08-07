import * as childProcess from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";
import * as json from "json-parser";
import * as os from "os";
import * as path from "path";
import * as rimraf from "rimraf";

export function spawn(command: string, args: string[] = [], message = "") {
  return new Promise((resolve, reject) => {
    process.stdout.write(`\nRun command: ${message}\n  ${command} ${args.join(" ")}\n\n`);
    const item = childProcess.spawn(command, args, { stdio: "inherit" });
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

export function createTempDir() {
  if (!fs.existsSync(TMP)) {
    process.stdout.write(`Create TMP directory ${TMP}\n\n`);
    fs.mkdirSync(TMP);
  }
}

export function removeTmpDir() {
  if (fs.existsSync(TMP)) {
    process.stdout.write(`Remove TMP directory ${TMP}\n\n`);
    rimraf.sync(TMP);
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
