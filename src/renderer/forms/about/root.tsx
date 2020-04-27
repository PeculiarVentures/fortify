import * as fs from 'fs';
import * as path from 'path';
import * as React from 'react';
import { Button } from 'lib-react-components';

import { t } from '../../../main/locale';
import Align from '../../components/align';
import Link from '../../components/link';
import { Content, Footer, Page } from '../../components/page';
import { WindowEvent } from '../../components/window_event';
import WindowComponent from '../../window';

const s = require('./style.sass');

const PACKAGE_PATH = path.join(__dirname, '..', '..', 'package.json');

export interface IRootProps { }
export interface IRootState { }

export class Root extends WindowComponent<IRootProps, IRootState> {
  public version: string;

  constructor(props: IRootProps) {
    super(props);

    this.state = {};
    this.version = Root.getVersion();

    document.title = t('about');
  }

  static getVersion() {
    const json = fs.readFileSync(PACKAGE_PATH, { encoding: 'utf8' });
    const data = JSON.parse(json);

    return data.version;
  }

  public render() {
    return (
      <Page>
        <WindowEvent event="keydown" onCall={this.onKeyDown} />
        <Content>
          <div className={s.text}>
            <div className={s.info}>
              <div>
                <p>
                  <Link href="http://fortifyapp.com">Fortify</Link>
                </p>
                <p>
                  {t('by')}
                  : Peculiar Ventures
                </p>
                <p>
                  {t('version')}
                  :
                  {this.version}
                </p>
              </div>
              <div>
                <img className={s.icon} src="../static/icons/logo.svg" alt="Fortify logo" />
              </div>
            </div>
            <p className={s.copyright}>
              {t('copyright')}
              .
              <br />
              {t('all.rights')}
              .
            </p>
          </div>
        </Content>
        <Footer>
          <Align type="center">
            <Button
              size="large"
              onClick={() => this.close()}
            >
              {t('close')}
            </Button>
          </Align>
        </Footer>
      </Page>
    );
  }

  onKeyDown = (e: KeyboardEvent) => {
    switch (e.keyCode) {
      case 13: // enter
      case 27: // esc
        this.close();
        break;
      default:
        // nothing
    }
  };
}
