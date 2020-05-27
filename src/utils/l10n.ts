import en from '../locales/en.json';
import ru from '../locales/ru.json';

const MESSAGES_ALL = {
  en,
  ru,
};

export class DocsLocalization {
  private locale: string;

  private bundle: { [id: string]: string };

  constructor() {
    let language = this.getLocaleFromStorage();

    if (!language) {
      language = this.getLocaleFromNavigator();
    }

    this.setLocale(language);
  }

  private setLocaleToStorage(locale: string) {
    localStorage.setItem('locale', locale);
  }

  private getLocaleFromStorage(): string {
    return localStorage.getItem('locale');
  }

  private getLocaleFromNavigator(): string {
    return window.navigator.language.slice(0, 2).toLowerCase();
  }

  setLocale = (locale: string) => {
    this.locale = locale && MESSAGES_ALL.hasOwnProperty(locale) ? locale : 'en';
    this.bundle = MESSAGES_ALL[this.locale];

    this.setLocaleToStorage(this.locale);
  }

  getLocale = () => this.locale;

  getString = (id: string) => this.bundle[id] || en[id];
}

export const l10n = new DocsLocalization();
