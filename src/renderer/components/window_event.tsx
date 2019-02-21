import * as React from "react";

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
        window.addEventListener(this.props.event, this.props.onCall);
    }

    public componentWillUnmount() {
        window.removeEventListener(this.props.event, this.props.onCall);
    }

    public render() {
        return null;
    }
}
