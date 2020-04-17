interface IPayload {
  type: string;
  origin: string;
}

interface IKey {
  origin: string;
  created: Date;
  browsers: string[]
}
