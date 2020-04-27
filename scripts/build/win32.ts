import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as xmldom from 'xmldom';
import {
  getFortifyPrepareConfig,
  getVersion,
  spawn,
} from './utils';

export function updatePkgVersion(file: string) {
  const text = fs.readFileSync(file, { encoding: 'utf8' });
  const xmlParser = new xmldom.DOMParser();
  const xml = xmlParser.parseFromString(text, 'application/xml');

  process.stdout.write(`Rewrite ${file} file\n`);
  fs.writeFileSync(file, new xmldom.XMLSerializer().serializeToString(xml));
}

export async function run() {
  const advancedInstaller = path.join(process.env['ProgramFiles(x86)']!, 'Caphyon', 'Advanced Installer 15.6', 'bin', 'x86', 'AdvancedInstaller.com');
  if (!fs.existsSync(advancedInstaller)) {
    throw new Error(`Cannot find Advanced Installer by path ${advancedInstaller}`);
  }
  const fortifyPrepareConfig = getFortifyPrepareConfig('fprepare.json');
  const regRes = /(x\d+)/.exec(fortifyPrepareConfig.outDir);
  if (!regRes) {
    throw new Error('Cannot get arch from fprepare.json');
  }
  const arch = regRes[1];
  process.stdout.write(`\nFortify architecture: ${arch}\n\n`);
  const version = getVersion();

  await spawn('npm', ['run', 'build:prod'], 'Compile source code');
  await spawn('fortify-prepare', [], 'Copy required files to tmp dir');
  await spawn('asar', [
    'pack',
    fortifyPrepareConfig.outDir,
    `../fortify-prod/${arch}/resources/app.asar`,
  ], 'Create Electron package');
  const aipFile = path.join(os.homedir(), 'Documents', `Fortify_${arch}.aip`);
  await spawn(advancedInstaller, ['/edit', aipFile, '/SetVersion', version], `AI set new version v${version}`);
  const msiName = `fortify-win32-${arch}-v${version.replace(/\./g, '_')}.msi`;
  await spawn(advancedInstaller, ['/edit', aipFile, '/SetPackageName', msiName, '-buildname', 'DefaultBuild'], `AI set name for output file to ${msiName}`);
  await spawn(advancedInstaller, ['/build', aipFile], 'Build MSI');
}
