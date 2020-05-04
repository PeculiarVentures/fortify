import * as React from 'react';
import { Select, SelectItem } from 'lib-react-components';
import { IntlContext } from '../../components/intl';
import { ISO_LANGS } from '../../conts';

interface ILanguageProps {
  name: any;
  language: {
    onLanguageChange: (lang: string) => void;
  };
}

export class Language extends React.Component<ILanguageProps> {
  static contextType = IntlContext;

  context!: React.ContextType<typeof IntlContext>;

  onChangeSelect = (_: Event, value: string | number) => {
    const { language } = this.props;

    language.onLanguageChange(value as string);
  };

  render() {
    const { list, lang } = this.context;

    return (
      <Select
        value={lang}
        size="large"
        bgType="stroke"
        color="grey_2"
        onChange={this.onChangeSelect}
      >
        {list.map((value) => {
          const isoLang = ISO_LANGS[value];

          return (
            <SelectItem
              key={value}
              value={value}
            >
              {isoLang ? isoLang.nativeName : value}
            </SelectItem>
          );
        })}
      </Select>
    );
  }
}
