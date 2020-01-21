import * as fs from "fs";
import * as path from "path";
import * as rimraf from "rimraf";
import { createTempDir, getFortifyPrepareConfig, getVersion, removeTmpDir, spawn, TMP, downloadAsync, extractAsync } from "./utils";

export async function run() {
  try {
    const DEB_URL = "https://github.com/PeculiarVentures/fortify/releases/download/v2-binaries/linux-x64-debian.zip";
    const DEB_ZIP_FILE = path.join(TMP, "debian.zip");
    const DEB_DIR = path.join(TMP, "debian");
    const DEB_FORTIFY = path.join(DEB_DIR, "opt", "fortify");

    createTempDir();
    if (!fs.existsSync(DEB_DIR)) {
      await downloadAsync(DEB_URL, DEB_ZIP_FILE);
      await extractAsync(DEB_ZIP_FILE, DEB_DIR);
    }
    const fortifyPrepareConfig = getFortifyPrepareConfig("fprepare.json");
    const appname = "fortify";
    const arch = "x64";
    const version = getVersion().replace(/\./g, "_");

    await spawn("npm", ["run", "build:prod"], "Compile source code");
    await spawn("node_modules/.bin/fortify-prepare", [], "Copy required files to tmp dir");
    await spawn("electron-packager", [
      fortifyPrepareConfig.outDir,
      appname,
      `--arch=${arch}`,
      "--asar",
      `--out=${TMP}`,
      "--overwrite=true",
      "--electron-version=5.0.6",
      "--no-prune",
    ], "Create Electron package");
    if (fs.existsSync(DEB_FORTIFY)) {
      rimraf.sync(DEB_FORTIFY);
    }
    await spawn("cp", ["-r", path.join(TMP, `${appname}-linux-${arch}`), DEB_FORTIFY], "Copy Electron package to DEB project");
    await spawn("dpkg", ["-b", DEB_DIR], "Create DEB file");
    await spawn("mv", ["-f", `${DEB_DIR}.deb`, path.join("..", `${appname}-linux-${arch}-v${version}.deb`)], "Rename DEB file");
  } catch (e) {
    throw e;
  } finally {
    // removeTmpDir();
  }
}
