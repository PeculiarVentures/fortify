import * as React from 'react';

const s = require('./style.sass');

export interface IButtonProps {
  text: string;
  accept?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export default class Button extends React.Component<IButtonProps> {
  constructor(props: IButtonProps) {
    super(props);

    this.state = {};
  }

  public render() {
    const { text, accept, onClick } = this.props;

    const cls: string[] = [s.btn];

    if (accept) {
      cls.push(s.accept);
    }

    return (
      <button
        className={cls.join(' ')}
        onClick={onClick}
        type="button"
      >
        {text}
      </button>
    );
  }
}
