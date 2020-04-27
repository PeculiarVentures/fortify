import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as xmldom from 'xmldom';
import {
  createTempDir,
  getFortifyPrepareConfig,
  getVersion,
  removeTmpDir,
  spawn,
} from './utils';

const TMP = 'build';

function isElement(xml: Node): xml is Element {
  return xml && xml.nodeType === 1;
}

function getNextSiblingElement(xml: Node): Node | null {
  const next = xml.nextSibling;
  if (next) {
    if (isElement(next)) {
      return next;
    }

    return getNextSiblingElement(next);
  }

  return null;
}

function getKey(xml: Element, value: string) {
  const keys = xml.getElementsByTagName('key');
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (key.textContent === value) {
      return key;
    }
  }

  return null;
}

function getDict(xml: Node, keyName: string) {
  const key = getKey(xml as Element, keyName);
  if (!key) {
    throw new Error(`Cannot get ${keyName}`);
  }

  return getNextSiblingElement(key);
}

function updatePkgVersion(file: string, version: string) {
  const text = fs.readFileSync(file, { encoding: 'utf8' });
  const xmlParser = new xmldom.DOMParser();
  const xml = xmlParser.parseFromString(text, 'application/xml');

  const packageSettings = getDict(xml, 'PACKAGE_SETTINGS');
  if (!packageSettings) {
    throw new Error(`Cannot get PACKAGE_SETTINGS from ${file}`);
  }

  const pkgVersion = getDict(packageSettings, 'VERSION');
  if (!pkgVersion) {
    throw new Error(`Cannot get VERSION from ${file}`);
  }

  if (pkgVersion.textContent !== version) {
    process.stdout.write(`\nUpdate version from ${pkgVersion.textContent} to ${version} in ${file}\n`);

    pkgVersion.textContent = version;

    const prjSettings = getDict(xml, 'PROJECT_SETTINGS');
    if (!prjSettings) {
      throw new Error(`Cannot get PROJECT_SETTINGS from ${file}`);
    }
    const pkgName = getDict(prjSettings, 'NAME');
    if (!pkgName) {
      throw new Error(`Cannot get NAME from ${file}`);
    }
    const name = `fortify-mac-x64-v${version.replace(/\./g, '_')}`;
    pkgName.textContent = name;

    // TODO: Set PATH to Fortify.app

    process.stdout.write(`Rewrite ${file} file\n`);
    fs.writeFileSync(file, new xmldom.XMLSerializer().serializeToString(xml));
  }
}

export async function run() {
  try {
    const fortifyPrepareConfig = getFortifyPrepareConfig('fprepare.json');
    const arch = 'x64';
    const version = getVersion();
    const pkgprojFile = path.join(os.homedir(), 'packages', 'fortify.pkgproj');

    createTempDir(TMP);
    await spawn('npm', ['run', 'build:prod'], 'Compile source code');
    await spawn('fortify-prepare', [], 'Copy required files to tmp dir');
    await spawn('electron-packager', [
      fortifyPrepareConfig.outDir,
      `--arch=${arch}`,
      `--out=${TMP}`,
      '--icon=src/static/icons/tray/mac/icon.icns',
      '--overwrite=true',
      '--electron-version=5.0.6',
      '--app-bundle-id=com.peculiarventures.fortify',
      '--no-prune',
    ], 'Create Electron package');
    await spawn('cp', ['-a', 'nss/.', path.join(TMP, 'Fortify-darwin-x64', 'Fortify.app', 'Contents', 'MacOS')], 'Copy NSS precompiled files');
    updatePkgVersion(pkgprojFile, version);
    await spawn('packagesbuild', [pkgprojFile], `Build PKG file from ${pkgprojFile}`);
  } catch (e) {
    throw e;
  } finally {
    removeTmpDir(TMP);
  }
}
