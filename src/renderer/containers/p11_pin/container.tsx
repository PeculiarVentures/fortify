import * as React from 'react';
import { TextField } from 'lib-react-components';
import { ModalLayout } from '../../components/layouts';
import { WindowEvent } from '../../components/window_event';
import { IntlContext } from '../../components/intl';

const s = require('./styles/container.sass');

export interface IContainerProps {
  onApprove: (password: string) => void;
  onReject: () => void;
  origin: string;
}

export default class Container extends React.Component<IContainerProps> {
  static contextType = IntlContext;

  context!: React.ContextType<typeof IntlContext>;

  textFieldRef = React.createRef<any>();

  onKeyDown = (e: KeyboardEvent) => {
    const { onReject } = this.props;

    switch (e.keyCode) {
      case 13: // enter
        this.onApprove();
        break;

      case 27: // esc
        onReject();
        break;

      default:
        // nothing
    }
  };

  onApprove = () => {
    const { onApprove } = this.props;
    const password = this.textFieldRef.current.inputNode.getValue();

    onApprove(password);
  };

  render() {
    const {
      onReject,
      origin,
    } = this.props;
    const { intl } = this.context;

    return (
      <>
        <WindowEvent
          event="keydown"
          onCall={this.onKeyDown}
        />
        <ModalLayout
          title={[
            [<a href={origin}>{origin}</a>, <br />, intl('p11-pin.1')],
            intl('p11-pin.2'),
          ]}
          onApprove={this.onApprove}
          onReject={onReject}
        >
          <TextField
            placeholder="Password"
            bgType="stroke"
            size="large"
            color="grey_2"
            type="password"
            autoFocus
            className={s.field}
            ref={this.textFieldRef}
          />
        </ModalLayout>
      </>
    );
  }
}
