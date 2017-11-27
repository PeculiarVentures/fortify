import * as React from "react";

const s = require("./style.sass") as Style;
interface Style {
    page: string;
    content: string;
    footer: string;
}

export interface IPageProps { }
export interface IPageState { }

export class Page extends React.Component<IPageProps, IPageState> {

    public render() {
        return (
            <div className={s.page}>
                {this.props.children}
            </div>
        );
    }
}

export class Content extends React.Component<{}, {}> {

    public render() {
        return (
            <div className={s.content}>{this.props.children}</div>
        );
    }
}

export class Footer extends React.PureComponent {

    public render() {
        return (
            <div className={s.footer}>
                {this.props.children}
            </div>
        );
    }

}
