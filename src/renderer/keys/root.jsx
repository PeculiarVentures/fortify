import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import Item from './item';
import s from './styles/root.sass';

export default class Root extends Component {
  constructor() {
    super();

    this.state = {
      keys: []
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

  render() {
    const { keys } = this.state;

    return (
      <div className={s.wrapper}>
        {keys.length ? (
          keys.map((key) => (
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
          <h3 className={s.empty_text}>
            You don't have keys yet
          </h3>
        )}
      </div>
    );
  }
}
