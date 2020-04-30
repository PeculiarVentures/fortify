import * as React from 'react';
import {
  Typography,
  Box,
  TextField,
  Button,
} from 'lib-react-components';
import { intl } from '../../../main/locale';

const s = require('./styles/sites.sass');

interface ISitesProps {
  name: any;
  keys: {
    list: IKey[];
    isFetching: IsFetchingType;
  };
}

interface ISitesState {}

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

  constructor(props: ISitesProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { keys } = this.props;

    // TODO: Use `Remove` from locale
    // TODO: Need to add handler for `loading`, `search`
    return (
      <>
        <TextField
          placeholder={intl('search')}
          bgType="stroke"
          size="large"
          color="grey_2"
          className={s.search}
        />
        <div className={s.content}>
          <ul>
            {keys.list.map((key) => (
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
                >
                  Remove
                </Button>
              </Box>
            ))}
          </ul>
        </div>
      </>
    );
  }
}
