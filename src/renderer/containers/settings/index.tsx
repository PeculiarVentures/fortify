import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import WindowProvider from '../../components/window_provider';
import Container from './container';
import { Locale, locale } from '../../../main/locale';

interface IRootProps {}

interface IRootState {
  keys: IKey[];
  isFetching: IsFetchingType;
}

class Root extends WindowProvider<IRootProps, IRootState> {
  constructor(props: IRootProps) {
    super(props);

    this.state = {
      keys: [],
      isFetching: 'pending',
    };
  }

  componentWillMount() {
    ipcRenderer.on('2key-list', this.onKeyListListener);
    ipcRenderer.on('2key-remove', this.onKeyRemoveListener);
    ipcRenderer.send('2key-list');
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('2key-list', this.onKeyListListener);
    ipcRenderer.removeListener('2key-remove', this.onKeyRemoveListener);
  }

  onKeyListListener = (_: IpcRendererEvent, keys: IKey[]) => {
    this.setState({
      keys,
      isFetching: 'resolved',
    });
  };

  onKeyRemoveListener = (_: IpcRendererEvent, origin: string) => {
    this.setState((prevState) => ({
      keys: prevState.keys
        .filter((key) => key.origin !== origin),
    }));
  };

  onKeyRemove = (origin: string) => {
    ipcRenderer.send('2key-remove', origin);
  };

  render() {
    const { keys, isFetching } = this.state;

    return (
      <Container
        language={{
          list: Locale.getLangList(),
          current: locale.lang,
        }}
        keys={{
          isFetching,
          list: keys,
        }}
      />
    );
  }
}

ReactDOM.render(
  <Root />,
  document.getElementById('root'),
);
