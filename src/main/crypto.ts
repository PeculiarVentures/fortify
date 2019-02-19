const CryptoOSSL = require("node-webcrypto-ossl");
export const crypto = new CryptoOSSL();
(global as any).crypto = crypto;
