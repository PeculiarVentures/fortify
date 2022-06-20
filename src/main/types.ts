import { Config } from '@webcrypto-local/cards';

export type Assoc<T> = Record<string, T>;

export interface IConfigureProvider {
  lib: string;
  slots?: number[];
  libraryParameters?: string;
  readWrite?: boolean;
  /**
     * Name of the provider
     */
  name?: string;
}

export interface ICard {
  reader?: string;
  name: string;
  atr: Buffer;
  mask?: Buffer;
  readOnly: boolean;
  libraries: string[];
  config?: Config;
}

export interface IConfigure {
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

export interface ICardJson {
  reader?: string;
  name: string;
  atr: string;
  mask?: string;
  readOnly?: boolean;
  libraries: string[];
  config?: Config;
}

export interface IConfigureJson {
  logging?: boolean;
  locale?: string;
  disableCardUpdate?: boolean;
  cardConfigPath?: string;
  providers?: IConfigureProvider[];
  cards: ICardJson[];
  userId: string;
  telemetry?: boolean;
  theme: ('system' | 'dark' | 'light');
}
