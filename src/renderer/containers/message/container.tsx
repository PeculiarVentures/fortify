import * as React from 'react';
import { Typography, Checkbox } from 'lib-react-components';
import { DialogLayout, IDialogLayoutProps } from '../../components/layouts';
import { WindowEvent } from '../../components/window_event';
import { IntlContext } from '../../components/intl';

const s = require('./styles/container.sass');

export interface IContainerProps {
  type: 'error' | 'warning' | 'question' | 'token';
  text: string;
  onClose: (showAgain?: boolean) => void;
  onApprove?: (showAgain?: boolean) => void;
  hasShowAgain?: boolean;
  defaultShowAgainValue?: boolean;
  buttonRejectLabel?: string;
  buttonApproveLabel?: string;
}

export default class Container extends React.Component<IContainerProps> {
  static contextType = IntlContext;

  checkboxRef = React.createRef<any>();

  onKeyDown = (e: KeyboardEvent) => {
    const { type } = this.props;

    switch (e.keyCode) {
      case 13: // enter
        if (['question', 'token'].includes(type)) {
          this.onApprove();
        }

        break;

      case 27: // esc
        this.onClose();
        break;

      default:
        // nothing
    }
  };

  onClose = () => {
    const { onClose } = this.props;
    const { checkboxRef } = this;

    onClose(checkboxRef?.current?.isChecked());
  };

  onApprove = () => {
    const { onApprove } = this.props;
    const { checkboxRef } = this;

    if (onApprove) {
      onApprove(checkboxRef?.current?.isChecked());
    }
  };

  getDialogProps() {
    const {
      type,
      buttonRejectLabel,
      buttonApproveLabel,
      hasShowAgain,
      defaultShowAgainValue,
    } = this.props;
    const { intl } = this.context;
    const props: Omit<IDialogLayoutProps, 'children'> = {
      icon: (
        <img
          src="../static/icons/attention_icon.svg"
          alt="Attention icon"
          width="50"
        />
      ),
      onReject: this.onClose,
      textReject: buttonRejectLabel && intl(buttonRejectLabel),
    };

    if (hasShowAgain) {
      props.footer = (
        <Checkbox
          label={intl('show.again')}
          labelPosition="right"
          bgType="stroke"
          color="grey_4"
          colorOn="grey_4"
          iconColorOn="black"
          ref={this.checkboxRef}
          defaultChecked={defaultShowAgainValue}
          labelProps={{
            type: 'b3',
            color: 'grey_4',
          }}
        />
      );
    }

    switch (type) {
      case 'error':
        props.icon = (
          <img
            src="../static/icons/error_icon.svg"
            alt="Error icon"
            width="50"
          />
        );
        break;

      case 'question':
        props.icon = (
          <img
            src="../static/icons/question_icon.svg"
            alt="Question icon"
            width="50"
          />
        );

        props.onApprove = this.onApprove;
        props.textReject = intl(buttonRejectLabel || 'no');
        props.textApprove = intl(buttonApproveLabel || 'yes');
        break;

      case 'token':
        props.icon = (
          <img
            src="../static/icons/token_icon.svg"
            alt="Token icon"
            width="24"
          />
        );

        props.onApprove = this.onApprove;
        props.textReject = intl(buttonRejectLabel || 'no');
        props.textApprove = intl(buttonApproveLabel || 'yes');
        break;

      default:
    }

    return props;
  }

  render() {
    const { text } = this.props;

    return (
      <>
        <WindowEvent
          event="keydown"
          onCall={this.onKeyDown}
        />
        <DialogLayout
          {...this.getDialogProps()}
        >
          {text.split('\n').map((part: string, index) => (
            <Typography
              type="b3"
              key={index}
              className={s.text}
            >
              {part}
            </Typography>
          ))}
        </DialogLayout>
      </>
    );
  }
}
