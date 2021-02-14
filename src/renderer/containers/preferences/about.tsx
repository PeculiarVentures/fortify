import * as React from 'react';
import { Typography } from 'lib-react-components';
import { IntlContext } from '../../components/intl';

const s = require('./styles/about.sass');

interface IAboutProps {
  name: any;
  version: string;
}

// eslint-disable-next-line react/prefer-stateless-function
export class About extends React.Component<IAboutProps> {
  static contextType = IntlContext;

  render() {
    const { version } = this.props;
    const { intl } = this.context;

    return (
      <div className={s.root}>
        <div>
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
        </div>
        <div>
          <img
            src="../static/icons/logo.svg"
            alt="Fortify logo"
            width="38"
          />
        </div>
      </div>
    );
  }
}
