import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import Item from './item';
import s from './styles/root.sass';

export default class Root extends Component {
  constructor() {
    super();

    this.state = {
      keys: [],
      filterValue: '',
    };

    this.onKeyList = this.onKeyList.bind(this);
    this.onKeyRemove = this.onKeyRemove.bind(this);
  }

  onKeyList(event, arg) {
    this.setState({
      keys: arg
    });
  }

  onKeyRemove(event, id) {
    const { keys } = this.state;
    const newArray = [];
    keys.map((key) => {
      if (key.id !== id) {
        newArray.push(key)
      }
      return true;
    });
    this.setState({
      keys: newArray
    });
  }

  componentWillMount() {
    ipcRenderer.on('2key-list', this.onKeyList);
    ipcRenderer.on('2key-remove', this.onKeyRemove);
    ipcRenderer.send('2key-list')
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(`2key-list`, this.onKeyList);
    ipcRenderer.removeListener(`2key-remove`, this.onKeyRemove);
  }

  handleAction = (payload) => {
    const { type, id } = payload;

    switch (type) {
      case 'KEY:REMOVE': {
        ipcRenderer.send('2key-remove', id);
        break;
      }

      default:
        return true;
    }
  };

  handleSearchChange = (e) => {
    this.setState({
      filterValue: e.target.value,
    });
  };

  render() {
    const { keys, filterValue } = this.state;
    const isEmpty = !keys.length;

    let filteredKeys = keys;
    if (filterValue) {
      filteredKeys = keys.filter((key) => {
        if (
          key.origin.indexOf(filterValue) !== -1 ||
          key.browser.indexOf(filterValue) !== -1
        ) {
          return key;
        }
      })
    }

    return (
      <div className={s.wrapper}>
        {isEmpty ? (
          <h4 className={s.empty_text}>
            You don't have keys yet
          </h4>
        ) : (
          <div>
            <input
              type="text"
              placeholder="Search"
              onChange={this.handleSearchChange}
              className={s.input}
            />
            <div className={s.content}>
              {filteredKeys.length ? (
                filteredKeys.map((key) => (
                  <Item
                    key={key.id}
                    id={key.id}
                    origin={key.origin}
                    browser={key.browser}
                    created={key.created}
                    handleAction={this.handleAction}
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
