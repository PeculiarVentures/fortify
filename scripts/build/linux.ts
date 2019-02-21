import * as fs from "fs";
import * as path from "path";
import * as rimraf from "rimraf";
import { createTempDir, getFortifyPrepareConfig, getVersion, removeTmpDir, spawn, TMP } from "./utils";

const DEB_DIR = path.join("..", "fortify_x64");
const DEB_FORTIFY = path.join(DEB_DIR, "opt", "fortify");

export async function run() {
  try {
    if (!fs.existsSync(DEB_DIR)) {
      throw new Error(`Cannot find DEB project folder ${DEB_DIR}`);
    }
    const fortifyPrepareConfig = getFortifyPrepareConfig("fprepare.json");
    const appname = "fortify";
    const arch = "x64";
    const version = getVersion().replace(/\./g, "_");

    createTempDir();
    await spawn("npm", ["run", "build:prod"], "Compile source code");
    await spawn("fortify-prepare", [], "Copy required files to tmp dir");
    await spawn("electron-packager", [
      fortifyPrepareConfig.outDir,
      appname,
      `--arch=${arch}`,
      "--asar",
      `--out=${TMP}`,
      "--overwrite=true",
      "--electron-version=4.0.5",
      "--no-prune",
    ], "Create Electron package");
    if (fs.existsSync(DEB_FORTIFY)) {
      rimraf.sync(DEB_FORTIFY);
    }
    await spawn("cp", ["-r", path.join(TMP, `${appname}-linux-${arch}`), DEB_FORTIFY], "Copy Electron package to DEB project");
    await spawn("dpkg", ["-b", DEB_DIR], "Create DEB file");
    await spawn("mv", ["-f", `${DEB_DIR}.deb`, path.join("..", `${appname}-linux-${arch}-v${version}.deb`)], "Rename DEB file");
  } catch (e) {
    removeTmpDir();
    throw e;
  }
  removeTmpDir();
}
