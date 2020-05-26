import en from '../locales/en.json';

const MESSAGES_ALL = {
  'en': en,
};

export class DocsLocalization {
  private readonly locale: string;
  private readonly bundle: { [id: string]: string };

  constructor() {
    const language = 'en';

    this.locale = language && MESSAGES_ALL.hasOwnProperty(language) ? language : 'en';
    this.bundle = MESSAGES_ALL[this.locale];
  }

  getLocale = () => this.locale;

  getString = (id: string) => this.bundle[id] || en[id];
}

export const l10n = new DocsLocalization();
