import * as React from 'react';
import { Select, SelectItem } from 'lib-react-components';

interface ILanguageProps {
  name: any;
  language: {
    list: string[],
    current: string;
    onLanguageChange: (lang: string) => void;
  };
}

export const Language: React.SFC<ILanguageProps> = (props) => {
  const { language } = props;

  return (
    <Select
      value={language.current}
      size="large"
      bgType="stroke"
      color="grey_2"
      onChange={(_: Event, value: string | number) => language.onLanguageChange(value as string)}
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
};
