import * as React from "react";

interface Style {
    btn: string;
    accept: string;
}
const s = require("./style.sass") as Style;

export interface IButtonProps {
    text: string;
    accept?: boolean;
    onClick?: React.MouseEventHandler<HTMLElement>;
}
export interface IButtonState { }

export class Button extends React.Component<IButtonProps, IButtonState> {

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
            <button className={cls.join(" ")} onClick={onClick}>{text}</button>
        );
    }
}
