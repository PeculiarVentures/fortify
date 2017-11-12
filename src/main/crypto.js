const CryptoOssl = require('node-webcrypto-ossl');
export const crypto = new CryptoOssl();
// @ts-ignore
global.crypto = crypto;
