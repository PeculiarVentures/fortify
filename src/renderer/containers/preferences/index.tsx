import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import WindowProvider from '../../components/window_provider';
import Container from './container';

const PACKAGE_PATH = path.join(__dirname, '../../package.json');

interface IRootState {
  keys: {
    list: IKey[];
    isFetching: IsFetchingType;
  };
  logging: boolean;
  telemetry: boolean;
  theme: ('system' | 'dark' | 'light');
}

class Root extends WindowProvider<{}, IRootState> {
  version: string;

  constructor(props: {}) {
    super(props);

    this.state = {
      keys: {
        list: [],
        isFetching: 'pending',
      },
      logging: false,
      telemetry: false,
      theme: 'system',
    };

    this.version = Root.getVersion();
  }

  componentWillMount() {
    this.handleKeysListGet();
    this.handleLoggingGet();
    this.handleTelemetryGet();
    this.handleThemeGet();

    ipcRenderer.on('ipc-2key-changed', this.handleKeysListGet);
    ipcRenderer.on('ipc-logging-status-changed', this.onLoggingChangedListener);
    ipcRenderer.on('ipc-telemetry-status-changed', this.onTelemetryChangedListener);
    ipcRenderer.on('ipc-theme-changed', this.onThemeChangedListener);
  }

  static getVersion() {
    const json = fs.readFileSync(PACKAGE_PATH, { encoding: 'utf8' });
    const data = JSON.parse(json);

    return data.version;
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
      logging: status,
    });
  }

  handleTelemetryGet() {
    const status = ipcRenderer.sendSync('ipc-telemetry-status-get');

    this.setState({
      telemetry: status,
    });
  }

  handleThemeGet() {
    const theme = ipcRenderer.sendSync('ipc-theme-get');

    this.setState({
      theme,
    });
  }

  onLoggingChangedListener = (_: IpcRendererEvent, status: boolean) => {
    this.setState({
      logging: status,
    });
  };

  onTelemetryChangedListener = (_: IpcRendererEvent, status: boolean) => {
    this.setState({
      telemetry: status,
    });
  };

  onThemeChangedListener = (_: IpcRendererEvent, theme: ('system' | 'dark' | 'light')) => {
    this.setState({
      theme,
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

  onTelemetryStatusChange = () => {
    ipcRenderer.send('ipc-telemetry-status-change');
  };

  onThemeChange = (theme: ('system' | 'dark' | 'light')) => {
    ipcRenderer.send('ipc-theme-set', theme);
  };

  renderChildrens() {
    const { keys, logging, telemetry, theme } = this.state;

    return (
      <Container
        logging={{
          onLoggingOpen: this.onLoggingOpen,
          onLoggingStatusChange: this.onLoggingStatusChange,
          status: logging,
        }}
        telemetry={{
          onTelemetryStatusChange: this.onTelemetryStatusChange,
          status: telemetry,
        }}
        language={{
          onLanguageChange: this.onLanguageChange,
        }}
        keys={{
          ...keys,
          onKeyRemove: this.onKeyRemove,
        }}
        theme={{
          value: theme,
          onThemeChange: this.onThemeChange,
        }}
        version={this.version}
        defaultTab={this.params.defaultTab}
      />
    );
  }
}

ReactDOM.render(
  <Root />,
  document.getElementById('root'),
);
