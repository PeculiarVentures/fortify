import * as React from "react";
import { t } from "../../../main/locale";
import { Align } from "../../components/align/index";
import { Button } from "../../components/button/index";
import { Content, Footer, Page } from "../../components/page/index";
import { WindowEvent } from "../../components/window_event";
import { WindowComponent } from "../../window";

const s = require("./style.sass");

export interface IRootProps { }
export interface IRootState {
    pin: string;
}

export class Root extends WindowComponent<IRootProps, IRootState> {

    constructor(props: IRootProps) {
        super(props);

        this.state = {
            pin: "",
        };
    }

    public componentDidMount() {
        (this.refs.pin as HTMLInputElement).focus();
    }

    public render() {

        return (
            <Page>
                <WindowEvent event="keydown" onCall={this.onKeyDown.bind(this)} />
                <Content>
                    <div className={s.content}>
                        <p>{t("p11-pin.1")}</p>
                        <p>{t("p11-pin.2")}</p>
                        <table className={s.input}>
                            <tbody>
                                <tr>
                                    <td className={s.cellImage}>
                                        <img src="../static/icons/smart_card.png" alt={t("smart.card")} width="64px" />
                                    </td>
                                    <td>
                                        <div className={s.label}>PIN</div>
                                        <div>
                                            <input ref="pin" type="password" id="input_pin" onChange={this.onPinChange.bind(this)} />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Content>
                <Footer>
                    <Align type="center">
                        <div>
                            <Button accept text={t("ok")} onClick={this.onOkClick.bind(this)} />
                            <Button text={t("cancel")} onClick={this.onCancelClick.bind(this)} />
                        </div>
                    </Align>
                </Footer>
            </Page >
        );
    }

    protected onPinChange(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            pin: e.currentTarget.value,
        });
    }

    protected ok() {
        this.params.pin = this.state.pin;
        this.close();
    }

    protected cancel() {
        this.params.pin = "";
        this.close();
    }

    protected onOkClick() {
        this.ok();
    }

    protected onCancelClick() {
        this.cancel();
    }

    protected onKeyDown(e: KeyboardEvent) {
        switch (e.keyCode) {
            case 13: // enter
                this.ok();
                break;
            case 27: // esc
                this.cancel();
                break;
        }
    }
}
