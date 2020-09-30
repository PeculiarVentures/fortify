import { setEngine } from '2key-ratchet';
import * as wsServer from '@webcrypto-local/server';
import type { Cards } from '@webcrypto-local/cards';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';
import { SslService } from './services';
import * as constants from './constants';
import { logger } from './logger';
import { ErrorWindow } from './windows';
import { l10n } from './l10n';
import * as jws from './jws';
import { request } from './utils';
import './crypto';

export class Server {
  server!: wsServer.LocalServer;

  config: IConfigure;

  constructor(config: IConfigure) {
    this.config = config;
  }

  // eslint-disable-next-line class-methods-use-this
  private fillPvPKCS11(options: wsServer.IServerOptions) {
    if (!options.config.pvpkcs11) {
      options.config.pvpkcs11 = [];
    }

    switch (os.platform()) {
      case 'win32':
        options.config.pvpkcs11.push(path.normalize(`${process.execPath}/../pvpkcs11.dll`));
        break;
      case 'darwin':
        options.config.pvpkcs11.push(path.join(__dirname, '..', 'libpvpkcs11.dylib'));
        break;
      default:
        // nothing
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private fillOpenScOptions(options: wsServer.IServerOptions) {
    const platform = os.platform();

    switch (platform) {
      case 'win32':
        options.config.opensc = path.join(process.execPath, '..', 'opensc-pkcs11.dll');
        break;
      case 'darwin':
      case 'linux':
        options.config.opensc = path.join(process.execPath, '..', 'opensc-pkcs11.so');
        break;
      default:
        // nothing
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private load(options: wsServer.IServerOptions) {
    setEngine('@peculiar/webcrypto', (global as any).crypto);

    this.fillPvPKCS11(options);
    this.fillOpenScOptions(options);

    this.server = new wsServer.LocalServer(options);
  }

  // eslint-disable-next-line class-methods-use-this
  async init() {
    wsServer.setEngine('@peculiar/webcrypto', (global as any).crypto);

    const sslService = new SslService();

    try {
      await sslService.run();
    } catch (e) {
      logger.error(e.toString());

      ErrorWindow.create({
        params: {
          type: 'error',
          text: l10n.get('error.ssl.install'),
        },
        onClosed: () => {
          // application.quit();
        },
      });

      // application.quit();
    }

    const sslData: wsServer.IServerOptions = {
      cert: fs.readFileSync(constants.APP_SSL_CERT),
      key: fs.readFileSync(constants.APP_SSL_KEY),
    } as any;

    logger.info('SSL certificate is loaded');

    await this.prepareConfig();

    // @ts-ignore
    sslData.config = this.config;
    sslData.storage = await wsServer.FileStorage.create();

    try {
      this.load(sslData);
    } catch (e) {
      logger.error(e.message);
      logger.error('LocalServer is empty. webcrypto-local module wasn\'t loaded');
    }

    this.run();
  }

  run() {
    // TODO: Add other events.
    this.server
      .on('listening', (e: any) => {
        logger.info(`Server: Started at ${e}`);
      })
      .on('info', (message) => {
        logger.info(message);
      })
      .on('error', (e: Error) => {
        logger.error(e.stack || e.toString());
      })
      .on('close', (e: any) => {
        logger.info(`Close: ${e}`);
      });

    this.server.listen('127.0.0.1:31337');
  }

  private async prepareConfig() {
    this.config.cardConfigPath = constants.APP_CARD_JSON;

    if (!this.config.disableCardUpdate) {
      await this.prepareCardJson();
    }

    this.prepareProviders();
    this.prepareCards();
  }

  // eslint-disable-next-line class-methods-use-this
  private prepareProviders() {
    try {
      if (fs.existsSync(constants.APP_CONFIG_FILE)) {
        const json = JSON.parse(fs.readFileSync(constants.APP_CONFIG_FILE).toString());

        if (json.providers) {
          this.config.providers = json.providers;
        }
      }
    } catch (err) {
      logger.error(`Cannot prepare config data. ${err.stack}`);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private prepareCards() {
    try {
      if (fs.existsSync(constants.APP_CONFIG_FILE)) {
        const json = JSON.parse(fs.readFileSync(constants.APP_CONFIG_FILE).toString());

        if (json.cards) {
          this.config.cards = json.cards.map((card: any) => ({
            name: card.name,
            atr: Buffer.from(card.atr, 'hex'),
            readOnly: card.readOnly,
            libraries: card.libraries,
          }));
        }
      }
    } catch (err) {
      logger.error(`Cannot prepare config data. ${err.stack}`);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private async prepareCardJson() {
    try {
      if (!fs.existsSync(constants.APP_CARD_JSON)) {
        // try to get the latest card.json from git
        try {
          const message = await request(constants.APP_CARD_JSON_LINK);

          // try to parse
          const card: Cards = await jws.getContent(message);

          // copy card.json to .fortify
          fs.writeFileSync(constants.APP_CARD_JSON, JSON.stringify(card, null, '  '), { flag: 'w+' });
          logger.info(`card.json v${card.version} was copied to .fortify from ${constants.APP_CARD_JSON_LINK}`);

          return;
        } catch (err) {
          logger.error(`Cannot get card.json from ${constants.APP_CARD_JSON_LINK}. ${err.stack}`);
        }

        // get original card.json from webcrypto-local
        // eslint-disable-next-line global-require
        const original: Cards = require('@webcrypto-local/cards/lib/card.json');
        fs.writeFileSync(constants.APP_CARD_JSON, JSON.stringify(original, null, '  '), { flag: 'w+' });
        logger.info(`card.json v${original.version} was copied to .fortify from modules`);
      } else {
        // compare existing card.json version with remote
        // if remote version is higher then upload and remove local file
        logger.info('Comparing current version of card.json file with remote');

        let remote: Cards | undefined;

        try {
          const jwsString = await request(constants.APP_CARD_JSON_LINK);
          remote = await jws.getContent(jwsString);
        } catch (e) {
          logger.error(`Cannot get get file ${constants.APP_CARD_JSON_LINK}. ${e.message}`);
        }

        const local: Cards = JSON.parse(
          fs.readFileSync(constants.APP_CARD_JSON, { encoding: 'utf8' }),
        );

        if (remote && semver.lt(local.version || '0.0.0', remote.version || '0.0.0')) {
          // copy card.json to .fortify
          fs.writeFileSync(constants.APP_CARD_JSON, JSON.stringify(remote, null, '  '), { flag: 'w+' });

          logger.info(`card.json v${remote.version} was copied to .fortify from ${constants.APP_CARD_JSON_LINK}`);
        } else {
          logger.info(`card.json has the latest version v${local.version}`);
        }
      }
    } catch (err) {
      logger.error(`Cannot prepare card.json data. ${err.stack}`);
    }
  }
}
