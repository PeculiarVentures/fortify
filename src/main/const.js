import * as os from 'os';
import * as path from 'path';

export const TMP_DIR = os.homedir();
export const APP_TMP_DIR = path.join(TMP_DIR, '.fortify');

export const SRC_DIR = path.join(__dirname, '..', 'src');
export const HTML_DIR = path.join(SRC_DIR, 'htmls');
export const ICON_DIR = path.join(SRC_DIR, 'icons');

export const APP_LOG_FILE = path.join(APP_TMP_DIR, `LOG.log`);
export const APP_CONFIG_FILE = path.join(APP_TMP_DIR, `config.json`);
export const APP_SSL_CERT_CA = path.join(APP_TMP_DIR, `ca.pem`);
export const APP_SSL_CERT = path.join(APP_TMP_DIR, `cert.pem`);
export const APP_SSL_KEY = path.join(APP_TMP_DIR, `key.pem`);
