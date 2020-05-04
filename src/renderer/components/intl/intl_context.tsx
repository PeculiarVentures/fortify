import * as React from 'react';
import { ISO_LANGS } from '../../conts';

export interface IIntlContext {
  lang: string;
  intl: (key: string, ...args: any[]) => string;
  list: (keyof typeof ISO_LANGS)[];
}

export const IntlContext = React.createContext<IIntlContext>({
  lang: 'en',
  intl: () => String(),
  list: [],
});
