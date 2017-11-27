import { shell } from "electron";
import * as React from "react";

export interface ILinkProps {
    href: string;
}

export class Link extends React.Component<ILinkProps, {}> {

    public render() {
        const { href, children } = this.props;

        return (
            <a href="#" onClick={() => shell.openExternal(href)}>{children}</a>
        );
    }
}
