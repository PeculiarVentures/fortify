type Assoc<T> = { [key: string]: T };

interface IConfigureProvider {
  lib: string;
  slots?: number[];
  libraryParameters?: string;
  readWrite?: boolean;
  /**
     * Name of the provider
     */
  name?: string;
}

interface ICard {
  reader?: string;
  name: string;
  atr?: Buffer;
  mask?: Buffer;
  readOnly: boolean;
  libraries: string[];
}

interface IConfigure {
  logging?: boolean;
  locale?: string;
  disableCardUpdate?: boolean;
  cardConfigPath?: string;
  providers?: IConfigureProvider[];
  cards: ICard[];
  userId: string;
  telemetry?: boolean;
  theme: ('system' | 'dark' | 'light');
}
