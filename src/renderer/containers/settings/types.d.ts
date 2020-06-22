interface IKey {
  origin: string;
  created: Date;
  browsers: string[]
}

type IsFetchingType = 'pending' | 'resolved' | 'rejected';
