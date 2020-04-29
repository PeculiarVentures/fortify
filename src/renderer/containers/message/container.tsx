import * as React from 'react';
import { Typography, Checkbox } from 'lib-react-components';
import { DialogLayout, IDialogLayoutProps } from '../../components/layouts';
import { WindowEvent } from '../../components/window_event';
import { intl } from '../../../main/locale';

const s = require('./styles/container.sass');

export interface IContainerProps {
  type: 'error' | 'warning' | 'question';
  text: string;
  onClose: (showAgain?: boolean) => void;
  onApprove?: () => void;
  hasShowAgain?: boolean;
  textClose?: string;
}

export default class Container extends React.Component<IContainerProps> {
  checkboxRef = React.createRef<any>();

  onKeyDown = (e: KeyboardEvent) => {
    const { type, onApprove } = this.props;

    switch (e.keyCode) {
      case 13: // enter
        if (type === 'question' && onApprove) {
          onApprove();
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

    onClose(checkboxRef?.current?.state.checkedState);
  };

  getDialogProps() {
    const {
      type,
      textClose,
      onApprove,
      hasShowAgain,
    } = this.props;
    const props: Omit<IDialogLayoutProps, 'children'> = {
      icon: (
        <img
          src="../static/icons/attention_icon.svg"
          alt="Attention icon"
          width="50"
        />
      ),
      onReject: this.onClose,
      textReject: textClose,
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

        props.onApprove = onApprove;
        props.textReject = intl('no');
        props.textApprove = intl('yes');
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
