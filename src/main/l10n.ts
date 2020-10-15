import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import logger from './logger';
import { printf } from './utils';

const LANG_DIR = path.join(__dirname, typeof navigator === 'undefined' ? '' : '..', '..', 'locale');

class Localization extends EventEmitter {
  readonly defaultLang = 'en';

  supportedLangs: string[];

  lang: string;

  data: Assoc<string>;

  constructor() {
    super();

    this.lang = this.defaultLang;
    this.data = {};
    this.supportedLangs = this.getLangList();
  }

  public on(event: 'locale-change', cb: (locale: string) => void): this;

  public on(event: string, cb: (...args: any[]) => void) {
    return super.on(event, cb);
  }

  public emit(event: 'locale-change', lang: string): boolean;

  public emit(event: string, ...args: any[]) {
    return super.emit(event, ...args);
  }

  public get(key: string, ...args: any[]): string {
    const text = this.data[key];

    return text ? printf(text, args) : `{${key}}`;
  }

  // eslint-disable-next-line class-methods-use-this
  private getLangList() {
    if (!fs.existsSync(LANG_DIR)) {
      throw new Error(`Cannot read ${LANG_DIR}. Folder doesn't exist`);
    }

    const items = fs.readdirSync(LANG_DIR);
    const langList: string[] = [];
    // eslint-disable-next-line
    for (const item of items) {
      const itemPath = path.join(LANG_DIR, item);
      const itemStat = fs.statSync(itemPath);

      if (itemStat.isFile()) {
        const parts = /(\w+)\.json/.exec(item);

        if (parts) {
          langList.push(parts[1]);
        }
      }
    }

    return langList;
  }

  public setLang(lang: string) {
    if (!this.supportedLangs.includes(lang)) {
      return;
    }

    logger.info('l10n', 'Change language', {
      lang,
    });

    const data = this.loadLang(lang);

    this.lang = lang;
    this.data = data;

    this.emit('locale-change', lang);
  }

  // eslint-disable-next-line class-methods-use-this
  private loadLang(lang: string) {
    const localePath = path.join(LANG_DIR, `${lang}.json`);

    if (!fs.existsSync(localePath)) {
      throw new Error(`Cannot load ${localePath}. File does not exist`);
    }

    const json = fs.readFileSync(localePath, { encoding: 'utf8' });
    const data = JSON.parse(json);

    return data;
  }
}

export const l10n = new Localization();
