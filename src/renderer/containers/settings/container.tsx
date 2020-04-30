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
// import { WindowEvent } from '../../components/window_event';
// import { intl } from '../../../main/locale';

const s = require('./styles/container.sass');

enum TabType {
  sites = 1,
  logging,
  language,
}

export interface IContainerProps {
  language: {
    list: string[],
    current: string;
  };
  keys: {
    list: IKey[];
    isFetching: IsFetchingType;
  };
}

export interface IContainerState {
  tab: TabType;
}

// Use Tabs strings from locale
export default class Container extends React.Component<IContainerProps, IContainerState> {
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
    const { language, keys } = this.props;
    const { tab } = this.state;

    return (
      <section className={s.host}>
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
              Sites
            </Tab>
            <Tab
              value={TabType.logging}
              className={classnames(s.tab, 'b3')}
              color="grey_4"
            >
              Logging
            </Tab>
            <Tab
              value={TabType.language}
              className={classnames(s.tab, 'b3')}
              color="grey_4"
            >
              Language
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
            />
            <Language
              name={TabType.language}
              language={language}
            />
          </SegueHandler>
        </div>
      </section>
    );
  }
}
