import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import WindowProvider from '../../components/window_provider';
import Container from './container';

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
    this.handleKeysListGet();
    this.handleLoggingGet();

    ipcRenderer.on('ipc-2key-changed', this.handleKeysListGet);
    ipcRenderer.on('ipc-logging-status-changed', this.onLoggingChangedListener);
  }

  handleKeysListGet = () => {
    const list = ipcRenderer.sendSync('ipc-2key-list-get');

    this.setState({
      keys: {
        list,
        isFetching: 'resolved',
      },
    });
  };

  handleLoggingGet() {
    const status = ipcRenderer.sendSync('ipc-logging-status-get');

    this.setState({
      logging: {
        status,
      },
    });
  }

  onLoggingChangedListener = (_: IpcRendererEvent, status: boolean) => {
    this.setState({
      logging: {
        status,
      },
    });
  };

  onKeyRemove = (origin: string) => {
    ipcRenderer.send('ipc-2key-remove', origin);
  };

  onLoggingOpen = () => {
    ipcRenderer.send('ipc-logging-open');
  };

  onLoggingStatusChange = () => {
    ipcRenderer.send('ipc-logging-status-change');
  };

  onLanguageChange = (lang: string) => {
    ipcRenderer.send('ipc-language-set', lang);
  };

  renderChildrens() {
    const { keys, logging } = this.state;

    return (
      <Container
        logging={{
          onLoggingOpen: this.onLoggingOpen,
          onLoggingStatusChange: this.onLoggingStatusChange,
          ...logging,
        }}
        language={{
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
