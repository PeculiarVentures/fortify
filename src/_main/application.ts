import { app } from 'electron';
import { autoUpdater } from './updater';
import { l10n } from './l10n';
import { tray } from './tray';
import { CHECK_UPDATE, CHECK_UPDATE_INTERVAL } from './constants';

export class Application {
  app = app;

  public start() {
    const gotTheLock = this.app.requestSingleInstanceLock();

    if (!gotTheLock) {
      this.app.quit();
    }

    if ('dock' in this.app) {
      this.app.dock.hide();
    }

    this.onReady();
  }

  public exit() {
    this.app.exit();
  }

  private async onReady() {
    await this.app.whenReady();

    this.initLocalization();
    tray.create();
    await this.initAutoUpdater();
  }

  private initLocalization() {
    // TODO: Add handler.
    // TODO: Add read/write to config.
    l10n.on('locale-change', (lang) => {
      console.log(lang);
    });

    const appLang = this.app.getLocale().split('-')[0];

    l10n.setLang(appLang);
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
}

export const application = new Application();
