import * as electron from "electron";
import * as React from "react";
import * as winston from "winston";

winston.add(new winston.transports.Console());

import { locale } from "../main/locale";

export class WindowComponent<P, S> extends React.Component<P, S> {

    public params: Assoc<any>;

    constructor(props: P) {
        super(props);

        const $window = electron.remote.getCurrentWindow() as any;
        if (!$window.lang) {
            $window.lang = "en";
        }
        locale.setLang($window.lang);

        this.params = $window.params || {};
    }

    public close() {
        this.onClose();
        electron.remote.getCurrentWindow().close();
    }

    protected onClose() {
        // nothing
    }

}
