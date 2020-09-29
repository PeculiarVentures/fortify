import { Crypto } from '@peculiar/webcrypto';

export const crypto = new Crypto();

(global as any).crypto = crypto;
