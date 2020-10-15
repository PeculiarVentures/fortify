import * as React from 'react';
import { Button, Typography } from 'lib-react-components';
import { IntlContext } from '../intl';

const s = require('./styles/modal_layout.sass');

export interface IModalLayoutProps {
  children: React.ReactNode;
  title: (string | React.ReactNode)[];
  onReject: () => void;
  onApprove: () => void;
  textReject?: string;
  textApprove?: string;
}

export default class ModalLayout extends React.Component<IModalLayoutProps> {
  static contextType = IntlContext;

  renderButtons() {
    const {
      onReject,
      onApprove,
      textReject,
      textApprove,
    } = this.props;
    const { intl } = this.context;

    return (
      <>
        <Button
          size="large"
          className={s.button}
          bgType="stroke"
          color="grey_4"
          textColor="black"
          key="reject"
          onClick={onReject}
        >
          {textReject || intl('cancel')}
        </Button>
        <Button
          size="large"
          className={s.button}
          color="secondary"
          key="approve"
          onClick={onApprove}
        >
          {textApprove || intl('ok')}
        </Button>
      </>
    );
  }

  render() {
    const { children, title } = this.props;

    return (
      <section className={s.host}>
        <div className={s.container_body}>
          <div className={s.container_title}>
            {title.map((value, index) => (
              <Typography
                type="b3"
                align="auto"
                key={index}
                className={s.title}
              >
                {value}
              </Typography>
            ))}
          </div>
          <div className={s.container_content}>
            {children}
          </div>
        </div>
        <footer className={s.footer}>
          {this.renderButtons()}
        </footer>
      </section>
    );
  }
}
