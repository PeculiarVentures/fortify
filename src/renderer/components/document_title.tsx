import * as React from 'react';
import { IntlContext } from './intl';

interface IDocumentTitleProps {
  titleKey: string | any[];
}

export default class DocumentTitle extends React.Component<IDocumentTitleProps> {
  static contextType = IntlContext;

  context!: React.ContextType<typeof IntlContext>;

  render() {
    const { titleKey } = this.props;
    const { intl } = this.context;

    if (titleKey) {
      let title: string;

      if (Array.isArray(titleKey)) {
        const [key, ...other] = titleKey;

        title = intl(key, ...other);
      } else {
        title = intl(titleKey);
      }

      if (title) {
        document.title = title;
      }
    }

    return null;
  }
}
