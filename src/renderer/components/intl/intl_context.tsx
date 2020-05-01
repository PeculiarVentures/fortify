import * as React from 'react';

export interface IIntlContext {
  lang: string;
  intl: (key: string, ...args: any[]) => string;
  list: string[];
}

export const IntlContext = React.createContext<IIntlContext>({
  lang: 'en',
  intl: () => String(),
  list: [],
});
