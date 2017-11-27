import * as React from "react";

import { t } from "../../../main/locale";
import { Align } from "../../components/align/index";
import { Button } from "../../components/button/index";
import { Content, Footer, Page } from "../../components/page/index";
import { WindowEvent } from "../../components/window_event";
import { WindowComponent } from "../../window";

const s = require("./style.sass") as Style;
interface Style {
    box: string;
    icon: string;
    text: string;
}

export interface IRootProps { }
export interface IRootState { }

export class Root extends WindowComponent<IRootProps, IRootState> {

    constructor(props: IRootProps) {
        super(props);

        this.state = {};
    }

    public renderButtons() {
        switch (this.params.type) {
            case "error":
            case "warning":
                return (
                    [
                        <Button key="close" accept text={t("close")} onClick={() => this.close()} />,
                    ]
                );
            case "question":
                return (
                    [
                        <Button accept text={t("yes")} onClick={this.onYesClick.bind(this)} />,
                        <Button text={t("no")} onClick={() => this.close()} />,
                    ]
                );
        }
    }

    public render() {

        return (
            <Page>
                <WindowEvent event="keydown" onCall={this.onWindowKeyDown.bind(this)} />
                <Content>
                    <div className={s.box}>
                        <div className={s.icon}>
                            <img src={`../icons/${this.params.type}.png`} width="96px" />
                        </div>
                        <div className={s.text}>
                            <h3>{t(this.params.type)}</h3>
                            <p>{this.params.text}</p>
                        </div>
                    </div>
                </Content>
                <Footer>
                    <Align type="center">
                        <div>
                            {this.renderButtons()}
                        </div>
                    </Align>
                </Footer>
            </Page >
        );
    }

    protected onYesClick() {
        this.params.result = 1;
        this.close();
    }

    protected onWindowKeyDown(e: KeyboardEvent) {
        switch (e.keyCode) {
            case 13: // enter
                if (this.params.type === "question") {
                    this.onYesClick();
                    break;
                }
            case 27: // esc
                this.close();
                break;
        }
    }
}
