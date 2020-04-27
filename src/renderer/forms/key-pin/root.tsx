import * as React from 'react';

import { t } from '../../../main/locale';
import Align from '../../components/align';
import Button from '../../components/button';
import { Content, Footer, Page } from '../../components/page';
import { WindowEvent } from '../../components/window_event';
import WindowComponent from '../../window';
import Pin from './pin';

const s = require('./style.sass');

export interface IRootProps { }
export interface IRootState { }

export class Root extends WindowComponent<IRootProps, IRootState> {
  constructor(props: IRootProps) {
    super(props);

    this.state = {};

    document.title = t('key-pin');
  }

  public render() {
    return (
      <Page>
        <WindowEvent event="keydown" onCall={this.onKeyDown.bind(this)} />
        <Content>
          <div className={s.content}>
            <p>
              {t('key-pin.1', this.params.origin)}
            </p>
            <p>
              {t('key-pin.2', t('approve'))}
            </p>
            <Align type="center">
              <Pin value={this.params.pin} />
            </Align>
          </div>
        </Content>
        <Footer>
          <Align type="center">
            <div>
              <Button accept text={t('approve')} onClick={this.onApproveClick.bind(this)} />
              <Button text={t('cancel')} onClick={this.onCancelClick.bind(this)} />
            </div>
          </Align>
        </Footer>
      </Page>
    );
  }

  protected approve() {
    this.params.accept = true;
    this.close();
  }

  protected cancel() {
    this.params.accept = false;
    this.close();
  }

  protected onApproveClick() {
    this.approve();
  }

  protected onCancelClick() {
    this.cancel();
  }

  protected onKeyDown(e: KeyboardEvent) {
    switch (e.keyCode) {
      case 13: // enter
        this.approve();
        break;
      case 27: // esc
        this.cancel();
        break;
      default:
        // nothing
    }
  }
}
