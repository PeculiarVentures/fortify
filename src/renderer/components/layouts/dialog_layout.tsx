import * as React from 'react';
import { Button } from 'lib-react-components';

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
  renderButtons() {
    const {
      onReject,
      onApprove,
      textReject,
      textApprove,
    } = this.props;
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
          {textReject || 'Close'}
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
          {textApprove || 'Ok'}
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
          <div>
            {footer}
          </div>
          <div>
            {this.renderButtons()}
          </div>
        </footer>
      </section>
    );
  }
}
