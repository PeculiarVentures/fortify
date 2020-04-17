import * as React from 'react';

const s = require('./style.sass');

export interface IPinProps {
  value: string;
}

const Pin: React.SFC<IPinProps> = (props) => {
  const { value } = props;
  const symbols: string[] = [];

  for (let i = 0; i < value.length; i += 1) {
    const symbol = value.charAt(i);
    symbols.push(symbol);
  }

  return (
    <div className={s.pin}>
      {symbols.map((symbol, index) => (
        <div key={index}>
          {symbol}
        </div>
      ))}
    </div>
  );
};

export default Pin;
