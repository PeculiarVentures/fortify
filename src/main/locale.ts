import * as electron from "electron";
import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";
import * as winston from "winston";

const LANG_DIR = path.join(__dirname, typeof navigator === "undefined" ? "" : "..",  "..", "locale");

export type LocaleChangeHandle = () => void;

export class Locale extends EventEmitter {

    public static getLangList() {
        if (!fs.existsSync(LANG_DIR)) {
            throw new Error(`Cannot read ${LANG_DIR}. Folder doesn't exist`);
        }
        const items = fs.readdirSync(LANG_DIR);
        const langList: string[] = [];
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

    public lang: string;
    public data: Assoc<string>;

    //#region Events
    public on(event: "change", cb: LocaleChangeHandle): this;
    public on(event: string, cb: (...args: any[]) => void): this;
    public on(event: string, cb: (...args: any[]) => void) {
        return super.on(event, cb);
    }

    public once(event: "change", cb: LocaleChangeHandle): this;
    public once(event: string, cb: (...args: any[]) => void): this;
    public once(event: string, cb: (...args: any[]) => void) {
        return super.on(event, cb);
    }

    public emit(event: "change"): boolean;
    public emit(event: string, ...args: any[]): boolean;
    public emit(event: string, ...args: any[]) {
        return super.emit(event, ...args);
    }
    //#endregion

    public get(key: string): string {
        return this.data[key] || `{${key}}`;
    }

    public setLang(lang: string) {
        const data = this.loadLang(lang);

        this.lang = lang;
        this.data = data;

        this.emit("change");
    }

    protected loadLang(lang: string) {
        const localePath = path.join(LANG_DIR, `${lang}.json`);
        if (!fs.existsSync(localePath)) {
            throw new Error(`Cannot load ${localePath}. File does not exist`);
        }

        const json = fs.readFileSync(localePath, { encoding: "utf8" });
        const data = JSON.parse(json);
        return data;
    }

}

export const locale = new Locale();

export const t = locale.get.bind(locale);
