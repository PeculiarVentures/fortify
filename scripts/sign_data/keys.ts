import { Convert } from 'pvtsutils';
import { crypto } from './crypto';

async function getKID(pubKey: CryptoKey) {
  const raw = await crypto.subtle.exportKey('spki', pubKey);

  console.log('\nPublic key:');
  console.log(Convert.ToBase64(raw));

  const hash = await crypto.subtle.digest('SHA-256', raw);

  return Buffer.from(hash).toString('base64');
}

async function getPrivateKey(keyJson: any) {
  const key = await crypto.subtle.importKey('jwk', keyJson.keyJwk, keyJson.algorithm, false, ['sign']);

  return key;
}

async function getPublicKey(keyJson: any) {
  const key = await crypto.subtle.importKey('jwk', keyJson.keyJwk, keyJson.algorithm, true, ['verify']);

  return key;
}

export async function getKeyPair(privateKeyJson: any, publicKeyJson: any) {
  const keyPair: CryptoKeyPair = {
    privateKey: await getPrivateKey(privateKeyJson),
    publicKey: await getPublicKey(publicKeyJson),
  };
  const kid = await getKID(keyPair.publicKey);

  // Update keys structure
  keyPair.privateKey.kid = kid;
  keyPair.publicKey.kid = kid;

  return keyPair;
}
