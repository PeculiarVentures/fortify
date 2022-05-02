import * as crypto from 'crypto';
import { shell, app, ipcMain } from 'electron';
import { setEngine } from '2key-ratchet';
import * as wsServer from '@webcrypto-local/server';
import type { Cards } from '@webcrypto-local/cards';
import * as querystring from 'querystring';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';
import { SslService } from './services';
import * as constants from './constants';
import logger from './logger';
import { windowsController } from './windows';
import { l10n } from './l10n';
import * as jws from './jws';
import { request } from './utils';
import { getConfig } from './config';
import './crypto';

export class Server {
  server!: wsServer.LocalServer;

  config: IConfigure;

  constructor() {
    this.config = getConfig();
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
    } catch (error) {
      logger.error('server', 'SSL service run error', {
        error: error.message,
        stack: error.stack,
      });

      await windowsController.showErrorWindow({
        text: l10n.get('error.ssl.install'),
      });

      app.quit();

      return;
    }

    const sslData: wsServer.IServerOptions = {
      cert: fs.readFileSync(constants.APP_SSL_CERT),
      key: fs.readFileSync(constants.APP_SSL_KEY),
    } as any;

    logger.info('server', 'SSL certificate is loaded');

    await this.prepareConfig();

    // @ts-ignore
    sslData.config = this.config;
    sslData.storage = await wsServer.FileStorage.create();

    try {
      this.load(sslData);
    } catch (error) {
      logger.error('server', 'LocalServer is empty. webcrypto-local module wasn\'t loaded', {
        error: error.message,
        stack: error.stack,
      });
    }

    this.run();
  }

  run() {
    this.server
      .on('listening', (address: string) => {
        logger.info('server', 'Started', {
          address,
        });
      })
      .on('info', (level, source, message, data) => {
        logger.log(level, source, message, data);
      })
      .on('token_new', async (card) => {
        const atr = card.atr.toString('hex');

        logger.info('server', 'New token was found reader', {
          reader: card.reader,
          atr,
        });

        try {
          const tokenWindowResult = await windowsController.showTokenWindow();

          if (tokenWindowResult) {
            const title = `Add support for '${atr}' token`;
            const body = fs.readFileSync(constants.TEMPLATE_NEW_CARD_FILE, { encoding: 'utf8' })
              .replace(/\$\{reader\}/g, card.reader)
              .replace(/\$\{atr\}/g, atr.toUpperCase())
              .replace(/\$\{driver\}/g, crypto.randomBytes(20).toString('hex').toUpperCase());
            const url = `${constants.GITHUB_REPO_LINK}/issues/new?${querystring.stringify({
              title,
              body,
            })}`;

            shell.openExternal(url);
          }
        } catch (error) {
          logger.error('server', 'Token window', {
            error: error.message,
            stack: error.stack,
          });
        }
      })
      .on('error', (error: Error) => {
        logger.error('server', 'Server event error', {
          error: error.message,
          stack: error.stack,
        });

        if (error.hasOwnProperty('code') && error.hasOwnProperty('type')) {
          const err = error as wsServer.WebCryptoLocalError;
          const { CODE } = wsServer.WebCryptoLocalError;

          switch (err.code) {
            case CODE.PCSC_CANNOT_START:
              windowsController.showWarningWindow(
                {
                  text: l10n.get('warn.pcsc.cannot_start'),
                  title: 'warning.title.oh_no',
                  buttonRejectLabel: 'i_understand',
                  id: 'warn.pcsc.cannot_start',
                  showAgain: true,
                  showAgainValue: false,
                },
              );
              break;
            case CODE.WEBSOCKET_VANISHED:
              logger.info('server', 'Closing open disposable windows', {origin: (error as any).origin});
              windowsController.destroyDisposableWindows((error as any).origin);
              break;
            case CODE.PROVIDER_CRYPTO_NOT_FOUND:
              windowsController.showWarningWindow(
                {
                  text: l10n.get('warn.token.crypto_not_found', err.message),
                  title: 'warning.title.oh_no',
                  buttonRejectLabel: 'close',
                  id: 'warn.token.crypto_not_found',
                  showAgain: true,
                  showAgainValue: false,
                },
              );
              break;
            case CODE.PROVIDER_CRYPTO_WRONG:
            case CODE.PROVIDER_WRONG_LIBRARY:
              windowsController.showWarningWindow(
                {
                  text: l10n.get('warn.token.crypto_wrong', err.message),
                  title: 'warning.title.oh_no',
                  buttonRejectLabel: 'close',
                  id: 'warn.token.crypto_wrong',
                  showAgain: true,
                  showAgainValue: false,
                },
              );
              break;
            default:
            // nothing
          }
        }
      })
      .on('notify', async (params: any) => {
        switch (params.type) {
          case '2key': {
            const keyPinWindowResult = await windowsController.showKeyPinWindow({
              ...params,
              accept: false,
            }, params.origin);

            params.resolve(keyPinWindowResult.accept);

            break;
          }

          case 'pin': {
            const p11PinWindowResult = await windowsController.showP11PinWindow({
              ...params,
              pin: '',
            }, params.origin);

            if (p11PinWindowResult.pin) {
              params.resolve(p11PinWindowResult.pin);
            } else {
              params.reject(new wsServer.WebCryptoLocalError(10001, 'Incorrect PIN value. It cannot be empty.'));
            }

            break;
          }

          default:
            throw new Error('Unknown Notify param');
        }
      })
      .on('close', (e: any) => {
        logger.info('server', 'Close event', {
          e,
        });
      })
      .on('identity_changed', () => {
        ipcMain.emit('ipc-identity-changed');
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
    } catch (error) {
      logger.error('server', 'Cannot prepare config data error', {
        error: error.message,
        stack: error.stack,
      });
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
    } catch (error) {
      logger.error('server', 'Cannot prepare config data error', {
        stack: error.stack,
      });
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

          logger.info('server', 'card.json was copied to .fortify', {
            version: card.version,
            from: constants.APP_CARD_JSON_LINK,
          });

          return;
        } catch (error) {
          logger.error('server', 'Cannot get card.json error', {
            from: constants.APP_CARD_JSON_LINK,
            error: error.message,
            stack: error.stack,
          });
        }

        // get original card.json from webcrypto-local
        // eslint-disable-next-line global-require
        const original: Cards = require('@webcrypto-local/cards/lib/card.json');
        fs.writeFileSync(constants.APP_CARD_JSON, JSON.stringify(original, null, '  '), { flag: 'w+' });

        logger.info('server', 'card.json was copied to .fortify from modules', {
          version: original.version,
        });
      } else {
        // compare existing card.json version with remote
        // if remote version is higher then upload and remove local file
        logger.info('server', 'Comparing current version of card.json file with remote');

        let remote: Cards | undefined;

        try {
          const jwsString = await request(constants.APP_CARD_JSON_LINK);
          remote = await jws.getContent(jwsString);
        } catch (error) {
          logger.error('server', 'Cannot get file error', {
            file: constants.APP_CARD_JSON_LINK,
            error: error.message,
            stack: error.stack,
          });
        }

        const local: Cards = JSON.parse(
          fs.readFileSync(constants.APP_CARD_JSON, { encoding: 'utf8' }),
        );

        if (remote && semver.lt(local.version || '0.0.0', remote.version || '0.0.0')) {
          // copy card.json to .fortify
          fs.writeFileSync(constants.APP_CARD_JSON, JSON.stringify(remote, null, '  '), { flag: 'w+' });

          logger.info('server', 'card.json was copied to .fortify', {
            version: remote.version,
            from: constants.APP_CARD_JSON_LINK,
          });
        } else {
          logger.info('server', 'card.json has the latest version', {
            version: local.version,
          });
        }
      }
    } catch (error) {
      logger.error('server', 'Cannot prepare card.json data error', {
        error: error.message,
        stack: error.stack,
      });
    }
  }
}
