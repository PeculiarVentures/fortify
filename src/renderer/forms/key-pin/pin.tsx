import * as React from "react";

const s = require("./style.sass") as Style;
interface Style {
    pin: string;
}

export interface IPinProps {
    value: string;
}

export class Pin extends React.Component<IPinProps, {}> {

    public render() {
        const { value } = this.props;

        const symbols: string[] = [];
        for (let i = 0; i < value.length; i++) {
            const symbol = value.charAt(i);
            symbols.push(symbol);
        }
        return (
            <div className={s.pin}>
                {
                    symbols.map((symbol, index) =>
                        <div key={index}>{symbol}</div>,
                    )
                }
            </div>
        );
    }

}
