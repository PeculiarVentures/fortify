interface IKey {
  origin: string;
  created: Date;
  browsers: string[]
}

type IsFetchingType = 'pending' | 'resolved' | 'rejected';

type ThemeType = ('system' | 'dark' | 'light');

type UpdateInfoType = {
  version: string;
  createdAt: number;
};

type TabType = 'sites' | 'settings' | 'updates' | 'about';
