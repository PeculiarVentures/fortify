import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger';

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

    return text ? this.printf(text, args) : `{${key}}`;
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

    logger.info(`Localization: Set language to '${lang}'`);

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

  /**
   * Print formatted data
   *
   * Example:
   * printf("Some text %1 must be %2", 1, "here")
   * @param text string template
   * @param args arguments
   */
  // eslint-disable-next-line class-methods-use-this
  private printf(text: string, ...args: any[]) {
    let msg: string = text;
    let match: RegExpExecArray | null;
    const regFind = /(%\d+)/g;
    const matches: Array<{ arg: string, index: number }> = [];

    // eslint-disable-next-line no-cond-assign
    while (match = regFind.exec(msg)) {
      matches.push({ arg: match[1], index: match.index });
    }

    // replace matches
    for (let i = matches.length - 1; i >= 0; i -= 1) {
      const item = matches[i];
      const arg = item.arg.substring(1);
      const { index } = item;

      msg = msg.substring(0, index) + args[+arg] + msg.substring(index + 1 + arg.length);
    }

    // convert %% -> %
    // msg = msg.replace("%%", "%");

    return msg;
  }
}

export const l10n = new Localization();
