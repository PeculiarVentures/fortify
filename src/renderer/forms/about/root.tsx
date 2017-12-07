import * as electron from "electron";
import * as fs from "fs";
import * as path from "path";
import * as React from "react";

import { t } from "../../../main/locale";
import { Align } from "../../components/align/index";
import { Button } from "../../components/button/index";
import { Link } from "../../components/link/index";
import { Content, Footer, Page } from "../../components/page/index";
import { WindowEvent } from "../../components/window_event";
import { WindowComponent } from "../../window";

const s = require("./style.sass") as Style;
interface Style {
    text: string;
    icon: string;
    info: string;
    copyright: string;
}

const PACKAGE_PATH = path.join(__dirname, "..", "..", "package.json");

export interface IRootProps { }
export interface IRootState { }

export class Root extends WindowComponent<IRootProps, IRootState> {

    public version: string;

    constructor(props: IRootProps) {
        super(props);

        this.state = {};

        this.version = this.getVersion();

        document.title = t("about");
    }

    public getVersion() {
        const json = fs.readFileSync(PACKAGE_PATH, { encoding: "utf8" });
        const data = JSON.parse(json);
        return data.version;
    }

    public render() {

        return (
            <Page>
                <WindowEvent event="keydown" onCall={this.onKeyDown.bind(this)} />
                <Content>
                    <div className={s.text}>
                        <div className={s.info}>
                            <div>
                                <p>
                                    <Link href="http://fortifyapp.com">Fortify</Link>
                                </p>
                                <p>
                                    {t("by")}: Peculiar Ventures
                                </p>
                                <p>
                                    {t("version")}: {this.version}
                                </p>
                            </div>
                            <div>
                                <img className={s.icon} src="../icons/icon.svg" />
                            </div>
                        </div>
                        <p className={s.copyright}>
                            {t("copyright")}.<br />
                            {t("all.rights")}.
                        </p>
                    </div>
                </Content>
                <Footer>
                    <Align type="center">
                        <Button accept text={t("close")} onClick={() => this.close()} />
                    </Align>
                </Footer>
            </Page >
        );
    }

    protected onKeyDown(e: KeyboardEvent) {
        switch (e.keyCode) {
            case 13: // enter
            case 27: // esc
                this.close();
                break;
        }
    }
}
