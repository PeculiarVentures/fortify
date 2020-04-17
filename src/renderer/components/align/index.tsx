import * as React from 'react';

const s = require('./style.sass');

export interface IAlignProps {
  type: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

const Align: React.SFC<IAlignProps> = (props) => {
  const { type, children } = props;

  let cls: string;

  switch (type) {
    case 'center':
      cls = s.center;
      break;
    case 'right':
      cls = s.center;
      break;
    default:
      cls = s.left;
  }

  return (
    <div className={cls}>
      {children}
    </div>
  );
};

export default Align;
