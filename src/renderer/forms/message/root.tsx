import * as React from 'react';
import { intl } from '../../../main/locale';
import Align from '../../components/align/index';
import Button from '../../components/button/index';
import { Content, Footer, Page } from '../../components/page/index';
import { WindowEvent } from '../../components/window_event';
import WindowComponent from '../../window';

const s = require('./style.sass');

export interface IRootProps { }
export interface IRootState {
  showAgain?: boolean;
}

export class Root extends WindowComponent<IRootProps, IRootState> {
  constructor(props: IRootProps) {
    super(props);

    this.state = {
      showAgain: false,
    };
  }

  public renderButtons() {
    switch (this.params.type) {
      case 'error':
      case 'warning':
        return (
          [
            <Button key="close" accept text={this.params.buttonLabel} onClick={() => this.close()} />,
          ]
        );
      case 'question':
        return (
          [
            <Button accept text={intl('yes')} onClick={this.onYesClick.bind(this)} />,
            <Button text={intl('no')} onClick={() => this.close()} />,
          ]
        );
      default:
        // nothing
    }
  }

  public render() {
    return (
      <Page>
        <WindowEvent event="keydown" onCall={this.onWindowKeyDown.bind(this)} />
        <Content>
          <div className={s.box}>
            <div className={s.icon}>
              <img src={`../static/icons/${this.params.type}.png`} width="96px" />
            </div>
            <div className={s.text}>
              <h3>{this.params.title}</h3>
              {this.params.text.split('\n').map((item: string, index: number) => (
                <p key={index}>
                  {item}
                </p>
              ))}
            </div>
          </div>
        </Content>
        {
          this.hasShowAgain()
            ? (
              <div className={s.showDialog}>
                <input ref="show-dialog" type="checkbox" id="show-dialog" />
                <label htmlFor="show-dialog">
                  {intl('show.again')}
                </label>
              </div>
            )
            : null
        }
        <Footer>
          <Align type="center">
            <div>
              {this.renderButtons()}
            </div>
          </Align>
        </Footer>
      </Page>
    );
  }

  public hasShowAgain() {
    return this.params.id && this.params.showAgain;
  }

  protected onYesClick() {
    this.params.result = 1;
    this.close();
  }

  protected onWindowKeyDown(e: KeyboardEvent) {
    switch (e.keyCode) {
      case 13: // enter
        if (this.params.type === 'question') {
          this.onYesClick();
        }
        break;
      case 27: // esc
        this.close();
        break;
      default:
        // nothing
    }
  }

  protected onClose() {
    if (this.hasShowAgain()) {
      this.params.showAgainValue = (this.refs['show-dialog'] as any).checked;
    }
  }
}
