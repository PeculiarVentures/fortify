import * as React from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { IntlContext, IIntlContext } from './intl_context';
import { l10n } from '../../../main/l10n';

interface IIntlProviderProps {
  children: React.ReactNode;
}

export default class IntlProvider extends React.Component<IIntlProviderProps, IIntlContext> {
  constructor(props: IIntlProviderProps) {
    super(props);

    // const $window = remote.getCurrentWindow() as any;

    // locale.setLang($window.lang || 'en');

    this.state = {
      lang: l10n.lang,
      intl: l10n.get,
      list: l10n.supportedLangs as any,
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
    // locale.setLang(lang);

    // this.setState({
    //   lang,
    // });
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
