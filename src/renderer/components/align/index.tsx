import * as React from "react";

const s = require("./style.sass") as Style;
interface Style {
    left: string;
    center: string;
    right: string;
}

export interface IAlignProps {
    type: "left" | "center" | "right";
}

export class Align extends React.Component<IAlignProps, {}> {

    public render() {
        let cls = s.left;
        switch (this.props.type) {
            case "center":
                cls = s.center;
                break;
            case "right":
                cls = s.center;
                break;
        }
        return (
            <div className={cls}>
                {this.props.children}
            </div>
        );
    }
}
