import * as React from 'react';
import { Select, SelectItem } from 'lib-react-components';
import { IntlContext } from '../../components/intl';

interface ILanguageProps {
  name: any;
  language: {
    onLanguageChange: (lang: string) => void;
  };
}

export class Language extends React.Component<ILanguageProps> {
  static contextType = IntlContext;

  context!: React.ContextType<typeof IntlContext>;

  render() {
    const { language } = this.props;
    const { list, lang } = this.context;

    return (
      <Select
        value={lang}
        size="large"
        bgType="stroke"
        color="grey_2"
        onChange={(_: Event, value: string | number) => language.onLanguageChange(value as string)}
      >
        {list.map((value) => (
          <SelectItem
            key={value}
            value={value}
          >
            {value}
          </SelectItem>
        ))}
      </Select>
    );
  }
}
