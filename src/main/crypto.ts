import { Crypto } from '@peculiar/webcrypto';

export const crypto = new Crypto() as globalThis.Crypto;

(global as any).crypto = crypto;
