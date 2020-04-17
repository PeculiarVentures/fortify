import * as React from 'react';

const s = require('./style.sass');

export interface IPageProps {
  children: React.ReactNode;
}

export interface IContentProps {
  children: React.ReactNode;
}

export interface IFooterProps {
  children: React.ReactNode;
}

export const Page: React.SFC<IPageProps> = (props) => {
  const { children } = props;

  return (
    <div className={s.page}>
      {children}
    </div>
  );
};

export const Content: React.SFC<IContentProps> = (props) => {
  const { children } = props;

  return (
    <div className={s.content}>
      {children}
    </div>
  );
};

export const Footer: React.SFC<IFooterProps> = (props) => {
  const { children } = props;

  return (
    <div className={s.footer}>
      {children}
    </div>
  );
};
