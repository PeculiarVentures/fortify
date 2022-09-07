import * as os from 'os';
import * as path from 'path';

/**
 * Home directory
 */
export const HOME_DIR = os.homedir();
/**
 * Fortify data available for user only
 */
export const APP_USER_DIR = path.join(HOME_DIR, '.fortify');
/**
 * Fortify data available for all users
 */
export const APP_DATA_DIR = (os.platform() === 'win32')
  ? path.join(process.env.ProgramData!, 'Fortify')
  : APP_USER_DIR;

export const APP_DIR = path.join(__dirname, '..');
export const SRC_DIR = path.join(APP_DIR, 'src');
export const RESOURCES_DIR = path.join(SRC_DIR, 'resources');
export const STATIC_DIR = path.join(SRC_DIR, 'static');
export const HTML_PATH = path.join(STATIC_DIR, 'index.html');
export const PRELOAD_PATH = path.join(APP_DIR, 'out/preload.js');
export const ICON_DIR = path.join(STATIC_DIR, 'icons');

export const APP_LOG_FILE = path.join(APP_USER_DIR, 'fortify.log');
export const APP_CONFIG_FILE = path.join(APP_USER_DIR, 'config.json');
/**
 * Path to dialog.json file. Allows to disable/enable warning dialogs showing
 */
export const APP_DIALOG_FILE = path.join(APP_USER_DIR, 'dialog.json');
export const APP_SSL_CERT_CA = path.join(APP_DATA_DIR, 'ca.pem');
export const APP_SSL_CERT = path.join(APP_DATA_DIR, 'cert.pem');
export const APP_SSL_KEY = path.join(APP_DATA_DIR, 'cert.key');
export const APP_CARD_JSON = path.join(APP_USER_DIR, 'card.json');
export const TEMPLATE_NEW_CARD_FILE = path.join(RESOURCES_DIR, 'new_card.tmpl');

export const CHECK_UPDATE = true;
export const CHECK_UPDATE_INTERVAL = 24 * 60 * 60e3; // 24h

export const icons = {
  tray: path.join(ICON_DIR, 'tray/png/icon.png'),
  trayNotification: path.join(ICON_DIR, 'tray_notification/png/icon.png'),
  favicon: path.join(ICON_DIR, 'tray/png/icon@2x.png'),
};
