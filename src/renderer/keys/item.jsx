import React from 'react';
import PropTypes from 'prop-types';
import s from './styles/item.sass';

const Item = (props) => {
  const { id, origin, browser, created, handleAction } = props;
  const newDate = new Date(created);
  const date = newDate.toLocaleDateString();
  const time = newDate.toLocaleTimeString();

  return (
    <div className={s.item_wrapper}>
      <div className={s.info}>
        <div className={s.origin}>
          { origin }
        </div>
        <div className={s.browser}>
          { browser }
        </div>
        <div className={s.date}>
          { date }, { time }
        </div>
      </div>
      <div className={s.btns_container}>
        <div
          className={s.btn_remove}
          onClick={() => handleAction({ type: 'KEY:REMOVE', id })}
        >
          <svg
            viewBox="0 0 12 14"
            className={s.icon_remove}>
            <path d="M2 3.5h.5c.25 0 .45.18.5.4l1 8.2c.06.23.26.4.5.4h3c.24 0 .44-.17.5-.4 0-.03 1-7.82 1-8.1v-.1c.05-.22.25-.4.5-.4h.5c.28 0 .5.22.5.5v.07c-.04.24-.96 8.14-.97 8.24-.15.97-.98 1.7-1.98 1.7h-3.1c-1 0-1.83-.73-1.98-1.7 0-.1-.93-8-.97-8.23V4c0-.28.22-.5.5-.5m9.5-1H.5C.22 2.5 0 2.28 0 2v-.5c0-.28.22-.5.5-.5H5c0-.55.45-1 1-1s1 .45 1 1h4.5c.28 0 .5.22.5.5V2c0 .28-.22.5-.5.5" fillRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
};

Item.propTypes = {
  id: PropTypes.string,
  origin: PropTypes.string,
  created: PropTypes.string,
  browser: PropTypes.string,
  handleAction: PropTypes.func
};

export default Item;