import { app, screen, nativeTheme } from 'electron';
import * as fs from 'fs';
import * as os from 'os';
import {
  inject,
  injectable,
} from 'tsyringe';
import { l10n } from './l10n';
import { tray } from './tray';
import {
  APP_USER_DIR,
  CHECK_UPDATE,
  CHECK_UPDATE_INTERVAL,
} from './constants';
import { setConfig, getConfig } from './config';
import logger, { loggingSwitch, loggingAnalyticsSwitch } from './logger';
import { Server } from './server';
import { firefoxProviders } from './firefox_providers';
import { ipcMessages, sendToRenderers } from './ipc_messages';
import { autoUpdater } from './updater';

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
    loggingAnalyticsSwitch(!!this.config.telemetry);

    /**
     * Init application theme.
     */
    this.initTheme();

    /**
     * Print start information about system and application.
     */
    this.printStartInfo();

    /**
     * Get firefox providers and save to config.
     */
    this.initFirefoxProviders();
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

    app.allowRendererProcessReuse = true;

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
       * Init server service.
       */
      await this.initServer();

      /**
       * Init ipc server events.
       */
      ipcMessages.initServerEvents();

      /**
       * Init application auto updater.
       */
      this.initAutoUpdater();
    } catch (error) {
      logger.error('application', 'On ready error', {
        error: error.message,
        stack: error.stack,
      });
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
  private printStartInfo() {
    logger.info('application', 'Starting', {
      time: this.startTime,
    });
    logger.info('application', 'Application info', {
      version: app.getVersion(),
      versionChrome: process.versions.chrome,
      versionElectron: process.versions.electron,
      versionNode: process.versions.node,
    });
    logger.info('system', 'System info', {
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

    logger.info('system', 'Screen size', {
      width,
      height,
    });
  }

  private printLoadInfo() {
    const loadTime = new Date();
    const loadDuration = loadTime.getTime() - this.startTime.getTime();

    logger.info('application', 'Loaded', {
      time: loadTime,
      duration: loadDuration,
    });
  }

  private async initServer() {
    await this.server.init();
  }

  private initFirefoxProviders() {
    if (!this.config.providers?.length) {
      try {
        const providers = firefoxProviders.create();

        this.config.providers = this.config.providers!.concat(providers);

        setConfig(this.config);
      } catch (error) {
        logger.error('application', 'Firefox providers create error', {
          error: error.message,
          stack: error.stack,
        });
      }
    }
  }

  private initTheme() {
    nativeTheme.themeSource = this.config.theme || 'system';
  }

  // eslint-disable-next-line class-methods-use-this
  private async initAutoUpdater() {
    autoUpdater.on('checking-for-update', () => {
      sendToRenderers('ipc-checking-for-update');
    });

    autoUpdater.on('update-available', (info) => {
      sendToRenderers('ipc-update-available', info);
      tray.setIcon(true);
    });

    autoUpdater.on('update-not-available', () => {
      sendToRenderers('ipc-update-not-available');
      tray.setIcon();
    });

    autoUpdater.on('error', () => {
      sendToRenderers('ipc-update-error');
      tray.setIcon();
    });

    if (CHECK_UPDATE) {
      await autoUpdater.checkForUpdates();

      setInterval(
        () => autoUpdater.checkForUpdates(),
        CHECK_UPDATE_INTERVAL,
      );
    }
  }
}
