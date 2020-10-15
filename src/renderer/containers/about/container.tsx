import * as React from 'react';
import { Typography } from 'lib-react-components';
import { DialogLayout } from '../../components/layouts';
import { WindowEvent } from '../../components/window_event';
import { IntlContext } from '../../components/intl';

const s = require('./styles/container.sass');

export interface IContainerProps {
  version: string;
  onClose: () => void;
}

export default class Container extends React.Component<IContainerProps> {
  static contextType = IntlContext;

  onKeyDown = (e: KeyboardEvent) => {
    const { onClose } = this.props;

    switch (e.keyCode) {
      case 13: // enter
      case 27: // esc
        onClose();
        break;
      default:
        // nothing
    }
  };

  render() {
    const { onClose, version } = this.props;
    const { intl } = this.context;

    return (
      <>
        <WindowEvent
          event="keydown"
          onCall={this.onKeyDown}
        />
        <DialogLayout
          icon={(
            <img
              src="../static/icons/logo.svg"
              alt="Fortify logo"
              width="38"
            />
          )}
          onReject={onClose}
        >
          <Typography
            type="b3"
          >
            <a href="http://fortifyapp.com">Fortify</a> {intl('by')} <a href="https://peculiarventures.com">Peculiar Ventures</a>
          </Typography>
          <Typography
            type="b3"
          >
            {intl('version')} {version}
          </Typography>
          <br />
          <Typography
            type="b3"
          >
            {intl('made.with')}
          </Typography>
          <Typography
            type="b3"
          >
            {intl('copyright')}. {intl('all.rights')}.
          </Typography>
          <br />
          <div className={s.links}>
            <a
              href="https://github.com/PeculiarVentures"
              className={s.link}
            >
              <img
                src="../static/icons/github_icon.svg"
                alt="Github organization"
                width="20"
              />
            </a>
            <a
              href="https://twitter.com/peculiarventure"
              className={s.link}
            >
              <img
                src="../static/icons/twitter_icon.svg"
                alt="Twitter official"
                width="22"
              />
            </a>
          </div>
        </DialogLayout>
      </>
    );
  }
}
