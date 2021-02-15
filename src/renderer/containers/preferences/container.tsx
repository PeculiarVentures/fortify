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

type TabType = 'sites' | 'settings' | 'updates' | 'about';

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
    value: ('system' | 'dark' | 'light');
    onThemeChange: (theme: ('system' | 'dark' | 'light')) => void;
  };
  version: string;
  defaultTab?: TabType;
}

export interface IContainerState {
  tab: TabType;
}

export default class Container extends React.Component<IContainerProps, IContainerState> {
  static contextType = IntlContext;

  constructor(props: IContainerProps) {
    super(props);

    this.state = {
      tab: props.defaultTab || 'sites',
    };
  }

  onChangeTab = (e: Event, value: string | number) => {
    this.setState({
      tab: value as TabType,
    });
  };

  render() {
    const {
      language,
      keys,
      logging,
      telemetry,
      version,
      theme,
    } = this.props;
    const { tab } = this.state;
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
            value={tab}
            align="left"
            onChange={this.onChangeTab}
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
              Settings
            </Tab>
            <Tab
              value="updates"
              className={classnames(s.tab, 'b3')}
            >
              Updates
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
          <SegueHandler value={tab}>
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
