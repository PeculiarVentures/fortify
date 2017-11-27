// import { ipcRenderer } from "electron";
import * as React from "react";

import { t } from "../../main/locale";
import { WindowComponent } from "../window";
import { Empty } from "./empty";
import { Item } from "./item";

const { ipcRenderer } = require("electron");
const s = require("./styles/root.sass") as StyleRoot;

export interface IRootProps {
}

export interface IRootState {
  keys?: IKey[];
  filterValue?: string;
}

export class Root extends WindowComponent<IRootProps, IRootState> {

  constructor(props: IRootProps) {
    super(props);

    this.state = {
      keys: [],
      filterValue: "",
    };

    this.onKeyList = this.onKeyList.bind(this);
    this.onKeyRemove = this.onKeyRemove.bind(this);
  }

  public onKeyList(event: string, keys: IKey[]) {
    this.setState({
      keys,
    });
  }

  public onKeyRemove(event: string, origin: string) {
    const keys = this.state.keys!.filter((key) => key.origin !== origin);

    this.setState({
      keys,
    });
  }

  public componentWillMount() {
    ipcRenderer.on("2key-list", this.onKeyList);
    ipcRenderer.on("2key-remove", this.onKeyRemove);
    ipcRenderer.send("2key-list");
  }

  public componentWillUnmount() {
    ipcRenderer.removeListener(`2key-list`, this.onKeyList);
    ipcRenderer.removeListener(`2key-remove`, this.onKeyRemove);
  }

  public handleAction(payload: IPayload) {
    const { type, origin } = payload;

    switch (type) {
      case "KEY:REMOVE": {
        ipcRenderer.send("2key-remove", origin);
        break;
      }

      default:
        return true;
    }
  }

  public handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      filterValue: e.currentTarget.value.toLowerCase(),
    });
  }

  public render() {
    const { filterValue } = this.state;
    const keys = this.state.keys!;
    const isEmpty = !keys.length;

    let filteredKeys = keys;
    if (filterValue) {
      filteredKeys = keys.filter((key) => {
        const origin = key.origin.toLowerCase();
        if (origin.indexOf(filterValue) !== -1) {
          return key;
        }
      });
    }

    return (
      <div className={s.wrapper}>
        {isEmpty ? (
          <Empty />
        ) : (
            <div>
              <input
                type="text"
                placeholder={t("search")}
                onChange={this.handleSearchChange}
                className={s.input}
              />
              <div className={s.content}>
                {filteredKeys.length ? (
                  filteredKeys.map((key, i) => (
                    <Item
                      key={i}
                      origin={key.origin}
                      created={key.created}
                      handleAction={this.handleAction}
                      browsers={key.browsers}
                    />
                  ))
                ) : (
                    <h4 className={s.empty_text}>
                      Result not found
                </h4>
                  )}
              </div>
            </div>
          )}
      </div>
    );
  }
}
