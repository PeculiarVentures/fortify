import * as React from 'react';
import {
  Tabs,
  Tab,
  Box,
  SegueHandler,
} from 'lib-react-components';
import classnames from 'classnames';
import { Sites } from './sites';
import { About } from './about';
import { Settings } from './settings';
import { Updates } from './updates';
import { IntlContext } from '../../components/intl';

const s = require('./styles/container.sass');

export interface IContainerProps {
  logging: {
    onLoggingOpen: () => void;
    onLoggingStatusChange: () => void;
    status: boolean;
  };
  telemetry: {
    onTelemetryStatusChange: () => void;
    status: boolean;
  };
  language: {
    onLanguageChange: (lang: string) => void;
  };
  keys: {
    list: IKey[];
    isFetching: IsFetchingType;
    onKeyRemove: (origin: string) => void;
  };
  theme: {
    value: ThemeType;
    onThemeChange: (theme: ThemeType) => void;
  };
  update: {
    isFetching: IsFetchingType;
    info?: UpdateInfoType;
  };
  version: string;
  tab: {
    value: TabType;
    onChange: (value: TabType) => void;
  };
}

export interface IContainerState {
  tab: TabType;
}

export default class Container extends React.Component<IContainerProps, IContainerState> {
  static contextType = IntlContext;

  handleChangeTab = (_: Event, value: string | number) => {
    const { tab } = this.props;

    tab.onChange(value as TabType);
  };

  // eslint-disable-next-line class-methods-use-this
  renderNotificationBadge() {
    return (
      <Box
        className={s.badge}
        fill="attention"
      />
    );
  }

  render() {
    const {
      language,
      keys,
      logging,
      telemetry,
      version,
      theme,
      update,
      tab,
    } = this.props;
    const { intl } = this.context;

    return (
      <Box
        className={s.host}
        fill="grey_1"
      >
        <Box
          stroke="grey_2"
          strokeType="bottom"
        >
          <Tabs
            value={tab.value}
            align="left"
            onChange={this.handleChangeTab}
            className={s.tabs}
            color="grey_4"
            colorOn="black"
          >
            <Tab
              value="sites"
              className={classnames(s.tab, 'b3')}
            >
              {intl('sites')}
            </Tab>
            <Tab
              value="settings"
              className={classnames(s.tab, 'b3')}
            >
              {intl('settings')}
            </Tab>
            <Tab
              value="updates"
              className={classnames(s.tab, 'b3')}
            >
              {intl('updates')}
              {update.info ? this.renderNotificationBadge() : null}
            </Tab>
            <Tab
              value="about"
              className={classnames(s.tab, 'b3')}
            >
              {intl('about')}
            </Tab>
          </Tabs>
        </Box>
        <div className={s.content}>
          <SegueHandler value={tab.value}>
            <Sites
              name="sites"
              keys={keys}
            />
            <Settings
              name="settings"
              language={language}
              logging={logging}
              telemetry={telemetry}
              theme={theme}
            />
            <Updates
              name="updates"
              update={update}
            />
            <About
              name="about"
              version={version}
            />
          </SegueHandler>
        </div>
      </Box>
    );
  }
}
