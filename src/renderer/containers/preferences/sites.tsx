import * as React from 'react';
import {
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
} from 'lib-react-components';
import classnames from 'classnames';
import { IntlContext } from '../../components/intl';

const s = require('./styles/sites.sass');

interface ISitesProps {
  name: any;
  keys: {
    list: IKey[];
    isFetching: IsFetchingType;
    onKeyRemove: (origin: string) => void;
  };
}

interface ISitesState {
  search: string;
}

export class Sites extends React.Component<ISitesProps, ISitesState> {
  static browsersList = [
    {
      title: 'Firefox',
      name: 'firefox',
      src: '../static/icons/firefox.png',
    },
    {
      title: 'Chrome',
      name: 'chrome',
      src: '../static/icons/chrome.png',
    },
    {
      title: 'Safari',
      name: 'safari',
      src: '../static/icons/safari.png',
    },
    {
      title: 'Edge',
      name: 'edge',
      src: '../static/icons/edge.png',
    },
    {
      title: 'Internet Explorer',
      name: 'ie',
      src: '../static/icons/ie.png',
    },
  ];

  static contextType = IntlContext;

  constructor(props: ISitesProps) {
    super(props);

    this.state = {
      search: '',
    };
  }

  onChangeSearch = (e: any) => {
    this.setState({
      search: e.target.value.toLowerCase(),
    });
  };

  renderKeyItem(key: IKey) {
    const { keys } = this.props;
    const { intl } = this.context;

    return (
      <Box
        key={key.origin}
        tagType="li"
        stroke="grey_2"
        fill="white"
        className={s.item_key}
      >
        <div>
          <Typography
            type="b3"
          >
            {key.origin}
          </Typography>
          <Typography
            type="c1"
            color="grey_4"
            className={s.date}
          >
            {new Date(key.created).toLocaleDateString()}
          </Typography>
          <div className="clear">
            {Sites.browsersList.map((browser) => (
              <img
                className={s.image_browser}
                key={browser.name}
                src={browser.src}
                title={browser.title}
                data-active={key.browsers.indexOf(browser.name) !== -1}
                alt={browser.title}
              />
            ))}
          </div>
        </div>
        <Button
          bgType="stroke"
          color="grey_4"
          textColor="black"
          className={s.button_remove}
          onClick={() => keys.onKeyRemove(key.origin)}
        >
          {intl('remove')}
        </Button>
      </Box>
    );
  }

  renderContent() {
    const { keys } = this.props;
    const { search } = this.state;
    const { intl } = this.context;

    if (keys.isFetching === 'pending') {
      return (
        <CircularProgress />
      );
    }

    if (keys.list.length === 0) {
      return (
        <div className={s.container_list_state}>
          <img
            src="../static/icons/globe_icon.svg"
            alt="Globe icon"
            width="20"
            className={s.icon_list_state}
          />
          <Typography
            type="b3"
            color="grey_4"
          >
            {intl('keys.empty')}
          </Typography>
        </div>
      );
    }

    const newList: React.ReactNode[] = [];

    keys.list.forEach((key) => {
      if (search) {
        const origin = key.origin.toLowerCase();
        const hasMatch = origin.includes(search);

        if (!hasMatch) {
          return;
        }
      }

      newList.push(this.renderKeyItem(key));
    });

    if (newList.length === 0) {
      return (
        <div className={s.container_list_state}>
          <img
            src="../static/icons/search_icon.svg"
            alt="Search icon"
            width="20"
            className={s.icon_list_state}
          />
          <Typography
            type="b3"
            color="grey_4"
          >
            {intl('keys.empty.search')}
          </Typography>
        </div>
      );
    }

    return (
      <ul>
        {newList}
      </ul>
    );
  }

  render() {
    const { keys } = this.props;
    const { intl } = this.context;

    return (
      <>
        <TextField
          placeholder={intl('search')}
          bgType="stroke"
          size="large"
          color="grey_2"
          className={s.search}
          onChange={this.onChangeSearch}
          disabled={keys.list.length === 0}
        />
        <div
          className={classnames(
            s.content,
            {
              [s.m_center]: keys.isFetching === 'pending',
            },
          )}
        >
          {this.renderContent()}
        </div>
      </>
    );
  }
}
