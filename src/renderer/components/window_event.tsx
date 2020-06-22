import * as React from 'react';

export interface IWindowEventProps {
  event: string;
  onCall: (e: any) => void;
}
export interface IWindowEventState { }

export class WindowEvent extends React.Component<IWindowEventProps, IWindowEventState> {
  constructor(props: IWindowEventProps) {
    super(props);

    this.state = {};
  }

  public componentDidMount() {
    const { event, onCall } = this.props;

    window.addEventListener(event, onCall);
  }

  public componentWillUnmount() {
    const { event, onCall } = this.props;

    window.removeEventListener(event, onCall);
  }

  public render() {
    return null;
  }
}
