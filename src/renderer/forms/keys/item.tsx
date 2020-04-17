import * as React from 'react';

const s = require('./styles/item.sass');

const browsersList = [
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

export interface IItemProps {
  origin: string;
  created: Date;
  browsers: string[];
  handleAction: (p: IPayload) => void;
}

export interface IItemState {
  date?: string;
}

export class Item extends React.Component<IItemProps, IItemState> {
  constructor(props: IItemProps) {
    super(props);

    const newDate = new Date(this.props.created);
    const date = newDate.toLocaleDateString();

    this.state = {
      date,
    };
  }

  public render() {
    const { origin, browsers, handleAction } = this.props;
    const { date } = this.state;

    return (
      <div className={s.item_wrapper}>
        <div className={s.info}>
          <div className={s.origin}>
            {origin}
          </div>
          <div className={s.date}>
            {date}
          </div>
          <div>
            {browsersList.map((browser) => (
              <img
                className={s.browser}
                src={browser.src}
                title={browser.title}
                data-active={browsers.indexOf(browser.name) !== -1}
                alt={browser.title}
              />
            ))}
          </div>
        </div>
        <div className={s.btns_container}>
          <div
            className={s.btn_remove}
            onClick={() => handleAction({ type: 'KEY:REMOVE', origin })}
          >
            <svg
              viewBox="0 0 12 14"
              className={s.icon_remove}
            >
              <path d="M2 3.5h.5c.25 0 .45.18.5.4l1 8.2c.06.23.26.4.5.4h3c.24 0 .44-.17.5-.4 0-.03 1-7.82 1-8.1v-.1c.05-.22.25-.4.5-.4h.5c.28 0 .5.22.5.5v.07c-.04.24-.96 8.14-.97 8.24-.15.97-.98 1.7-1.98 1.7h-3.1c-1 0-1.83-.73-1.98-1.7 0-.1-.93-8-.97-8.23V4c0-.28.22-.5.5-.5m9.5-1H.5C.22 2.5 0 2.28 0 2v-.5c0-.28.22-.5.5-.5H5c0-.55.45-1 1-1s1 .45 1 1h4.5c.28 0 .5.22.5.5V2c0 .28-.22.5-.5.5" fillRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    );
  }
}
