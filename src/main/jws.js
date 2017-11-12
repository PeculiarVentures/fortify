// @ts-check
import * as jose from 'jose-jwe-jws';
import * as winston from 'winston';
import {crypto} from './crypto';
jose.setCrypto(crypto);

async function GetPublicKey() {
  const rawB64 = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArKAm6+BnWqcIleidaAiqM9O74cNvgE23mzVRe7KqVM/eodvhSBU1c+GYVt9a6guHFwoGPrbVoVQmDW+50xH7rEL+MaKT7lrlMvIt0dh+6UqDZaXybjoLc19al9ZJkvB9/icvxvG6ax0TGI2WKn78nVVmBtx+zeyIYE7DGYxR3eFJ8EVSMJHIT5Tsp8j/2UyzQXViuSzydwZuTPWAznpKGXVHwiD56QGLLvHpXO0Au3Hj36rTnOUyh3qdabRu6WQo2GySGNR7jui5upAK+1qGcKwXs3BOkhD0+g/M2wdQkvg/FDqtCxngboCiDPkUPlxK89XkiE4AotSerQzf3nGe2wIDAQAB';
  const raw = Buffer.from(rawB64, 'base64');
  const key = await crypto.subtle.importKey('spki', raw, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, true, ['verify']);
  const hash = await crypto.subtle.digest('SHA-256', raw);
  const kid = Buffer.from(hash).toString('base64');
  return {
    kid,
    key,
  };
}

export async function GetContent(jws) {
  const fName = 'GetContent';
  const joseKey = await GetPublicKey();

  let joseCrypto, verifier, verifyRes;

  try {
    joseCrypto = new jose.Jose.WebCryptographer();
    joseCrypto.setContentSignAlgorithm('RS256');

    verifier = new jose.JoseJWS.Verifier(joseCrypto, jws);
  } catch (e) {
    winston.error(`${fName}: ${e.toString()}`);
    throw new Error('Unable to check JWS. Malformed update metadata.');
  }
  await verifier.addRecipient(joseKey.key, joseKey.kid);
  try {
    verifyRes = await verifier.verify();
  } catch (e) {
    winston.error(`${fName}: ${e.toString()}`);
    throw new Error('Unable to check JWS. Cannot verify JWS signature.');
  }
  if (verifyRes && verifyRes.length === 1 && verifyRes[0].verified) {
    const payload = verifyRes[0].payload;
    return JSON.parse(payload);
  } else {
    throw new Error('Unable to check JWS. Invalid signature on metadata.');
  }
}
