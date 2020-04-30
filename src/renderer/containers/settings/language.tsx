import * as React from 'react';
import { Select, SelectItem } from 'lib-react-components';
// import * as s from './styles/language.sass';

interface ILanguageProps {
  name: any;
  language: {
    list: string[],
    current: string;
  };
}

// TODO: Need to add handler for change lang
export class Language extends React.Component<ILanguageProps> {
  render() {
    const { language } = this.props;

    return (
      <Select
        value={language.current}
        size="large"
        bgType="stroke"
        color="grey_2"
      >
        {language.list.map((value) => (
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
