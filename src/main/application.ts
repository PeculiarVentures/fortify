import { app } from 'electron';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { autoUpdater } from './updater';
import { l10n } from './l10n';
import { tray } from './tray';
import {
  CHECK_UPDATE,
  CHECK_UPDATE_INTERVAL,
  APP_USER_DIR,
  APP_DIR,
} from './constants';
import { setConfig, getConfig } from './config';
import { loggingSwitch, logger } from './logger';
import { Server } from './server';
import { firefoxProviders } from './firefox_providers';
import { ipcMessages } from './ipc_messages';

export class Application {
  server!: Server;

  config = getConfig();

  // eslint-disable-next-line class-methods-use-this
  private beforeStart() {
    /**
     * Create application directory.
     */
    if (!fs.existsSync(APP_USER_DIR)) {
      fs.mkdirSync(APP_USER_DIR);
    }

    /**
     * Set logging from config.
     */
    loggingSwitch(!!this.config.logging);

    /**
     * Print start information about system and application.
     */
    this.printStartInfo();

    /**
     * Get firefox providers and save to config.
     */
    // TODO: Review solution.
    if (!this.config.providers?.length) {
      try {
        const providers = firefoxProviders.create();

        this.config.providers = this.config.providers!.concat(providers);

        setConfig(this.config);
      } catch (err) {
        logger.error(err.stack);
      }
    }
  }

  public start() {
    this.beforeStart();

    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
      app.quit();
    }

    if ('dock' in app) {
      app.dock.hide();
    }

    /**
     * Don't quit when all windows are closed.
     */
    app.on('window-all-closed', (e: Event) => e.preventDefault());

    this.onReady();
  }

  public exit() {
    app.exit();
  }

  private async onReady() {
    try {
      await app.whenReady();

      this.initLocalization();

      tray.create();

      await this.initAutoUpdater();

      await this.initServer();

      // TODO: Think about server use in args.
      ipcMessages.init(this.server.server.server);
    } catch (error) {
      logger.error(error.toString());
    }
  }

  private initLocalization() {
    l10n.on('locale-change', (lang) => {
      this.config.locale = lang;

      /**
       * Save locale to config.
       */
      setConfig(this.config);

      /**
       * Refresh tray.
       */
      tray.refresh();
    });

    let lang = this.config.locale;

    if (!lang) {
      lang = app.getLocale().split('-')[0];
    }

    l10n.setLang(lang);
  }

  // eslint-disable-next-line class-methods-use-this
  private async initAutoUpdater() {
    if (CHECK_UPDATE) {
      // TODO: Add handler.
      autoUpdater.on('update-found', (version) => {
        console.log('update-found', version);
      });

      // TODO: Add handler.
      autoUpdater.on('update-not-found', () => {
        console.log('update-not-found');
      });

      // TODO: Add handler.
      autoUpdater.on('error', (error) => {
        console.log('error', error);
      });

      await autoUpdater.checkForUpdates();

      setInterval(
        () => autoUpdater.checkForUpdates(),
        CHECK_UPDATE_INTERVAL,
      );
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private printStartInfo() {
    logger.info(`Application started at ${new Date()}`);
    logger.info(`OS ${os.platform()} ${os.arch()} `);

    try {
      const json = fs.readFileSync(path.join(APP_DIR, 'package.json'), 'utf8');
      const pkg = JSON.parse(json);

      logger.info(`Fortify v${pkg.version}`);
    } catch {
      //
    }
  }

  private async initServer() {
    this.server = new Server(this.config);

    await this.server.init();
  }
}

export const application = new Application();
