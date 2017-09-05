import React from 'react';
import PropTypes from 'prop-types';
import s from './styles/item.sass';

const Item = (props) => {
  const { id, name, handleAction } = props;
  return (
    <div className={s.item}>
      <div className={s.name}>
        { name }
      </div>
      <button
        onClick={() => handleAction({ type: 'KEY:REMOVE', id })}
        className={s.btn_remove}
      >
        Remove
      </button>
    </div>
  );
};

Item.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  handleAction: PropTypes.func
};

export default Item;
