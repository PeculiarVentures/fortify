import React, { Component } from 'react';
import Item from './item';
import s from './styles/root.sass';

export default class Root extends Component {
  constructor() {
    super();

    // default state for testing
    this.state = {
      keys: [
        {
          id: '1',
          name: 'Information about key 1'
        },
        {
          id: '2',
          name: 'Information about key 2'
        },
        {
          id: '3',
          name: 'Information about key 3'
        }
      ]
    };
  }

  componentWillMount() {
    // TODO: Need function for get keys!
    alert('Call function get keys');
  }

  handleAction = (payload) => {
    const { type, id } = payload;
    const { keys } = this.state;

    switch (type) {
      case 'KEY:REMOVE': {
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
              id={key.id}
              key={key.id}
              name={key.name}
              handleAction={this.handleAction}
            />
          ))
        ) : (
          <h3>
            You don't have keys
          </h3>
        )}
      </div>
    );
  }
}
