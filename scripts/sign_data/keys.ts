/// <reference path="./types.d.ts" />

import { Convert } from 'pvtsutils';
import { crypto } from './crypto';

async function getKID(pubKey: CryptoKey) {
  const raw = await crypto.subtle.exportKey('spki', pubKey);
  const hash = await crypto.subtle.digest('SHA-256', raw);

  return Convert.ToBase64(hash);
}

async function getPrivateKey(privateKey: string) {
  const json = JSON.parse(Convert.ToString(Convert.FromBase64(privateKey)));
  const key = await crypto.subtle.importKey('jwk', json.keyJwk, json.algorithm, false, ['sign']);

  return key;
}

async function getPublicKey(publicKey: any) {
  const json = JSON.parse(Convert.ToString(Convert.FromBase64(publicKey)));
  const key = await crypto.subtle.importKey('jwk', json.keyJwk, json.algorithm, true, ['verify']);

  return key;
}

export async function getKeyPair(privateKey: any, publicKey: any) {
  const keyPair: CryptoKeyPairEx = {
    privateKey: await getPrivateKey(privateKey),
    publicKey: await getPublicKey(publicKey),
    kid: '',
  };
  const kid = await getKID(keyPair.publicKey);

  // Update keys structure
  keyPair.kid = kid;

  return keyPair;
}
