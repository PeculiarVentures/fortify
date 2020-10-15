import * as React from 'react';
import { ipcRenderer } from 'electron';
import { IntlContext, IIntlContext } from './intl_context';
import { printf } from '../../../main/utils';

interface IIntlProviderProps {
  children: React.ReactNode;
}

export default class IntlProvider extends React.Component<IIntlProviderProps, IIntlContext> {
  UNSAFE_componentWillMount() {
    ipcRenderer.on('ipc-language-changed', this.onLanguageListener);

    this.onLanguageListener();
  }

  onLanguageListener = () => {
    const l10n = ipcRenderer.sendSync('ipc-language-get');

    this.setState({
      lang: l10n.lang,
      list: l10n.list,
      intl: this.intl(l10n.data),
    });
  };

  intl = (data: Assoc<string>) => (key: string, ...args: any[]): string => {
    const text = data[key];

    return text ? printf(text, args) : `{${key}}`;
  };

  render() {
    const { children } = this.props;

    return (
      <IntlContext.Provider value={this.state}>
        {children}
      </IntlContext.Provider>
    );
  }
}
