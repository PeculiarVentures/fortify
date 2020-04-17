import { shell } from 'electron';
import * as React from 'react';

export interface ILinkProps {
  href: string;
  children: React.ReactNode;
}

const Link: React.SFC<ILinkProps> = (props) => {
  const { href, children } = props;

  return (
    <a href="#" onClick={() => shell.openExternal(href)}>{children}</a>
  );
};

export default Link;
