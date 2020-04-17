import * as os from 'os';

async function main() {
  let build: { run(): Promise<void> };
  const platform = os.platform();
  switch (platform) {
    case 'linux':
      build = require('./linux');
      break;
    case 'darwin':
      build = require('./osx');
      break;
    case 'win32':
      build = require('./win32');
      break;
    default:
      throw new Error(`Not supported OS '${platform}'`);
  }
  await build.run();
}

main().catch((err) => {
  process.stdout.write(err.stack);
  process.exit(1);
});
