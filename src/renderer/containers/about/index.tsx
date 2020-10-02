import * as path from 'path';
import * as fs from 'fs';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import WindowProvider from '../../components/window_provider';
import Container from './container';

const PACKAGE_PATH = path.join(__dirname, '../../package.json');

class Root extends WindowProvider<{}, {}> {
  version: string;

  constructor(props: {}) {
    super(props);

    this.version = Root.getVersion();
  }

  static getVersion() {
    const json = fs.readFileSync(PACKAGE_PATH, { encoding: 'utf8' });
    const data = JSON.parse(json);

    return data.version;
  }

  renderChildrens() {
    return (
      <Container
        version={this.version}
        onClose={this.close}
      />
    );
  }
}

ReactDOM.render(
  <Root />,
  document.getElementById('root'),
);
