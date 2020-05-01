import * as React from 'react';
import {
  Tabs,
  Tab,
  Box,
  SegueHandler,
} from 'lib-react-components';
import classnames from 'classnames';
import { Sites } from './sites';
import { Logging } from './logging';
import { Language } from './language';
import { IntlContext } from '../../components/intl';

const s = require('./styles/container.sass');

enum TabType {
  sites = 1,
  logging,
  language,
}

export interface IContainerProps {
  logging: {
    onLoggingOpen: () => void;
    onLoggingStatusChange: () => void;
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
}

export interface IContainerState {
  tab: TabType;
}

export default class Container extends React.Component<IContainerProps, IContainerState> {
  static contextType = IntlContext;

  context!: React.ContextType<typeof IntlContext>;

  constructor(props: IContainerProps) {
    super(props);

    this.state = {
      tab: TabType.sites,
    };
  }

  onChangeTab = (e: Event, value: string | number) => {
    this.setState({
      tab: value as TabType,
    });
  };

  render() {
    const { language, keys, logging } = this.props;
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
          >
            <Tab
              value={TabType.sites}
              className={classnames(s.tab, 'b3')}
              color="grey_4"
            >
              {intl('sites')}
            </Tab>
            <Tab
              value={TabType.logging}
              className={classnames(s.tab, 'b3')}
              color="grey_4"
            >
              {intl('logging')}
            </Tab>
            <Tab
              value={TabType.language}
              className={classnames(s.tab, 'b3')}
              color="grey_4"
            >
              {intl('language')}
            </Tab>
          </Tabs>
        </Box>
        <div className={s.content}>
          <SegueHandler value={tab}>
            <Sites
              name={TabType.sites}
              keys={keys}
            />
            <Logging
              name={TabType.logging}
              logging={logging}
            />
            <Language
              name={TabType.language}
              language={language}
            />
          </SegueHandler>
        </div>
      </Box>
    );
  }
}
