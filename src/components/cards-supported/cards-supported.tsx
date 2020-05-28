import { Component, Host, h, Prop } from '@stencil/core';

export interface ICard {
  name: string;
  win: boolean;
  mac: boolean;
}

@Component({
  tag: 'cards-supported',
  styleUrl: 'cards-supported.scss',
})
export class CardsSupported {
  @Prop({ reflect: true, mutable: true }) open: boolean = false;

  content?: ICard[] = [];

  async componentWillRender() {
    try {
      const response = await fetch('https://raw.githubusercontent.com/PeculiarVentures/webcrypto-local/master/packages/cards/lib/card.json');

      if (!response.ok) {
        throw response;
      };

      this.content = this.prepareData(await response.json());
    } catch (error) {
      console.log(error);
    }
  }

  private prepareData(content: any): ICard[] {
    if (!content) {
      return [];
    }

    return content.cards
      .sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;

        return 0;
      })
      .map(card => {
        const driver = content.drivers
          .find(driver => driver.id === card.driver);

        if (driver) {
          return {
            name: card.name || card.description,
            mac: !!(driver.file && driver.file.osx),
            win: !!(driver.file && driver.file.windows),
          };
        }

        return {
          name: card.name || card.description,
          mac: false,
          win: false,
        };
      });
  }

  toggleOpen = () => {
    this.open = !this.open;
  }

  renderTable() {
    return (
      <table class="table">
        <thead>
          <tr>
            <th>
              Card
            </th>
            <th>
              Mac OS
            </th>
            <th>
              Windows
            </th>
          </tr>
        </thead>
        <tbody>
          {this.content.map((card) => (
            <tr>
              <td>
                {card.name}
              </td>
              <td>
                {card.mac ? 1 : 0}
              </td>
              <td>
                {card.win ? 1 : 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  render() {
    return (
      <Host>
        {this.open && this.renderTable()}
        <button
          onClick={this.toggleOpen}
          class="button"
        >
          {this.open ? (
            'Collapse table'
          ) : (
            'Show smart cards that are currently supported'
          )}
        </button>
      </Host>
    );
  }
}
