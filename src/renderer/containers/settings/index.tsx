import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import WindowProvider from '../../components/window_provider';
import Container from './container';
import { Locale, locale } from '../../../main/locale';

interface IRootProps {}

interface IRootState {
  keys: {
    list: IKey[];
    isFetching: IsFetchingType;
  };
  logging: {
    status: boolean;
  };
}

class Root extends WindowProvider<IRootProps, IRootState> {
  constructor(props: IRootProps) {
    super(props);

    this.state = {
      keys: {
        list: [],
        isFetching: 'pending',
      },
      logging: {
        status: false,
      },
    };
  }

  componentWillMount() {
    ipcRenderer.on('2key-list', this.onKeyListListener);
    ipcRenderer.on('2key-remove', this.onKeyRemoveListener);
    ipcRenderer.on('logging-status', this.onLoggingStatusListener);

    // Call event for get sites list
    ipcRenderer.send('2key-list');
    // Call event for get logging status
    ipcRenderer.send('logging-status');

    // TODO: Need to check auto change UI lang
    locale.on('change', () => {
      console.log('lang changed');
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('2key-list');
    ipcRenderer.removeAllListeners('2key-remove');
    ipcRenderer.removeAllListeners('logging-status');
  }

  onLoggingStatusListener = (_: IpcRendererEvent, status: boolean) => {
    this.setState({
      logging: {
        status,
      },
    });
  };

  onKeyListListener = (_: IpcRendererEvent, list: IKey[]) => {
    this.setState({
      keys: {
        list,
        isFetching: 'resolved',
      },
    });
  };

  onKeyRemoveListener = (_: IpcRendererEvent, origin: string) => {
    this.setState((prevState) => ({
      keys: {
        ...prevState.keys,
        list: prevState.keys.list
          .filter((key) => key.origin !== origin),
      },
    }));
  };

  onKeyRemove = (origin: string) => {
    ipcRenderer.send('2key-remove', origin);
  };

  onLoggingOpen = () => {
    ipcRenderer.send('logging-open');
  };

  onLoggingStatusChange = () => {
    ipcRenderer.send('logging-status-change');
  };

  onLanguageChange = (lang: string) => {
    ipcRenderer.send('language-change', lang);
  };

  render() {
    const { keys, logging } = this.state;

    return (
      <Container
        logging={{
          onLoggingOpen: this.onLoggingOpen,
          onLoggingStatusChange: this.onLoggingStatusChange,
          ...logging,
        }}
        language={{
          list: Locale.getLangList(),
          current: locale.lang,
          onLanguageChange: this.onLanguageChange,
        }}
        keys={{
          ...keys,
          onKeyRemove: this.onKeyRemove,
        }}
      />
    );
  }
}

ReactDOM.render(
  <Root />,
  document.getElementById('root'),
);
