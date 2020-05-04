import * as React from 'react';
import { ipcRenderer, IpcRendererEvent, remote } from 'electron';
import { IntlContext, IIntlContext } from './intl_context';
import { locale, intl, Locale } from '../../../main/locale';

interface IIntlProviderProps {
  children: React.ReactNode;
}

export default class IntlProvider extends React.Component<IIntlProviderProps, IIntlContext> {
  constructor(props: IIntlProviderProps) {
    super(props);

    const $window = remote.getCurrentWindow() as any;

    locale.setLang($window.lang || 'en');

    this.state = {
      lang: locale.lang,
      intl,
      list: Locale.getLangList() as any,
    };
  }

  componentWillMount() {
    ipcRenderer.on('language-get', this.onLanguageListener);
    ipcRenderer.on('language-change', this.onLanguageListener);
    ipcRenderer.send('language-get');
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('language-get');
    ipcRenderer.removeAllListeners('language-change');
  }

  onLanguageListener = (_: IpcRendererEvent, lang: string) => {
    locale.setLang(lang);

    this.setState({
      lang,
    });
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
