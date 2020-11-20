interface IKeyStorage {
  setItem(key: string, item: CryptoKey): void;
  getItem(key: string): CryptoKey | null;
}

declare interface Crypto {
  keyStorage: IKeyStorage;
}

declare interface CryptoKey {
  kid: string;
}

interface IUpdateInfoJson {
  version: string;
  min?: string;
}
