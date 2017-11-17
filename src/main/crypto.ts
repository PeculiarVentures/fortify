const CryptoOpenSSL = require("node-webcrypto-ossl");
export const crypto = new CryptoOpenSSL();

(global as any).crypto = crypto;
