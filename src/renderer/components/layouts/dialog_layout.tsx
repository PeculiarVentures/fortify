import * as React from 'react';
import { Button } from 'lib-react-components';
import { IntlContext } from '../intl';

const s = require('./styles/dialog_layout.sass');

export interface IDialogLayoutProps {
  children: React.ReactNode;
  icon: React.ReactNode;
  footer?: React.ReactNode;
  onReject?: () => void;
  onApprove?: () => void;
  textReject?: string;
  textApprove?: string;
}

export default class DialogLayout extends React.Component<IDialogLayoutProps> {
  static contextType = IntlContext;

  renderButtons() {
    const {
      onReject,
      onApprove,
      textReject,
      textApprove,
    } = this.props;
    const { intl } = this.context;
    const buttons = [];

    if (onReject) {
      buttons.push((
        <Button
          size="large"
          className={s.button}
          bgType="stroke"
          color="grey_4"
          textColor="black"
          key="reject"
          onClick={onReject}
        >
          {textReject || intl('close')}
        </Button>
      ));
    }

    if (onApprove) {
      buttons.push((
        <Button
          size="large"
          className={s.button}
          color="secondary"
          key="approve"
          onClick={onApprove}
        >
          {textApprove || intl('ok')}
        </Button>
      ));
    }

    return buttons;
  }

  render() {
    const { children, icon, footer } = this.props;

    return (
      <section className={s.host}>
        <div className={s.container_body}>
          <div className={s.container_content}>
            {children}
          </div>
          <div className={s.container_icon}>
            {icon}
          </div>
        </div>
        <footer className={s.footer}>
          <div className={s.footer_content_container}>
            {footer}
          </div>
          <div className={s.buttons_container}>
            {this.renderButtons()}
          </div>
        </footer>
      </section>
    );
  }
}
