import { app, screen } from 'electron';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  inject,
  injectable,
} from 'tsyringe';
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

@injectable()
export class Application {
  private readonly startTime = new Date();

  config = getConfig();

  constructor(
    @inject('server') public server: Server,
  ) {}

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

  // eslint-disable-next-line class-methods-use-this
  public exit() {
    app.exit();
  }

  private async onReady() {
    try {
      await app.whenReady();

      /**
       * Print screen size after app is ready.
       */
      this.printScreenSize();

      /**
       * Init ipc events.
       */
      ipcMessages.initEvents();

      /**
       * Init localization.
       */
      this.initLocalization();

      /**
       * Create tray.
       */
      tray.create();

      /**
       * Init check updates.
       */
      await this.initAutoUpdater();

      /**
       * Init server service.
       */
      await this.initServer();

      /**
       * Init ipc server events.
       */
      ipcMessages.initServerEvents();
    } catch (error) {
      logger.error(error.toString());
    }

    /**
     * Print load information about load time.
     */
    this.printLoadInfo();
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
      await autoUpdater.checkForUpdates();

      setInterval(
        () => autoUpdater.checkForUpdates(),
        CHECK_UPDATE_INTERVAL,
      );
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private printStartInfo() {
    logger.info(`Start time: ${this.startTime}`);

    try {
      const json = fs.readFileSync(path.join(APP_DIR, 'package.json'), 'utf8');
      const pkg = JSON.parse(json);

      logger.info('App', {
        version: pkg.version,
      });
    } catch {
      //
    }

    logger.info('System', {
      type: os.type(),
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      version: process.getSystemVersion(),
      totalmem: os.totalmem(),
      freemem: os.freemem(),
    });
  }

  // eslint-disable-next-line class-methods-use-this
  private printScreenSize() {
    const { width, height } = screen.getPrimaryDisplay().bounds;

    logger.info('Screen', {
      width,
      height,
    });
  }

  private printLoadInfo() {
    const loadTime = new Date();
    const loadDuration = loadTime.getTime() - this.startTime.getTime();

    logger.info(`Load time: ${loadTime}`);
    logger.info(`Load duration: ${loadDuration}ms`);
  }

  private async initServer() {
    await this.server.init();
  }
}
