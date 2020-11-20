/// <reference path="./types.d.ts" />

import * as fs from 'fs';
import * as path from 'path';
import * as jose from 'jose-jwe-jws';
import { crypto } from './crypto';
import { getKeyPair } from './keys';

const {
  SIGN_BASE64,
  VERIFY_BASE64,
} = process.env;

async function signData(keys: CryptoKeyPair, data: any) {
  const cryptographer = new jose.Jose.WebCryptographer();
  cryptographer.setContentSignAlgorithm('RS256');
  const signer = new jose.JoseJWS.Signer(cryptographer);
  await signer.addSigner(keys.privateKey, keys.privateKey.kid);

  const doc = await signer.sign(data);
  const jws = doc.CompactSerialize();

  return jws;
}

async function verifyData(keys: CryptoKeyPair, jws: string) {
  const cryptographer = new jose.Jose.WebCryptographer();
  cryptographer.setContentSignAlgorithm('RS256');

  const verifier = new jose.JoseJWS.Verifier(cryptographer, jws);
  await verifier.addRecipient(keys.publicKey, keys.publicKey.kid);

  return verifier.verify();
}

async function signUpdateJSON(keys: CryptoKeyPair, info: IUpdateInfoJson) {
  const jws = await signData(keys, info);

  if (!await verifyData(keys, jws)) {
    throw new Error('JWS has bad signature');
  }

  return jws;
}

async function signCardJSON(keys: CryptoKeyPair, path: string) {
  // Read card.json
  const json = fs.readFileSync(path, 'utf8');
  const card = JSON.parse(json);

  // Sign data
  console.log('card.json version: %s', card.version);

  return signData(keys, card);
}

async function main() {
  const { version } = require('../../package.json');

  if (!SIGN_BASE64) {
    throw new Error('Missed required env variable "SIGN_BASE64".');
  }

  if (!VERIFY_BASE64) {
    throw new Error('Missed required env variable "VERIFY_BASE64".');
  }

  jose.setCrypto(crypto as any);

  const keys = await getKeyPair(SIGN_BASE64, VERIFY_BASE64);
  const jws = await signUpdateJSON(keys, { version });

  console.log('\nupdate.jws');
  console.log(jws);

  // console.log('\nupdate.jws');
  // fs.writeFileSync('update.jws', jws, { flag: 'w+' });

  const jwsCard = await signCardJSON(keys, path.resolve('./node_modules/@webcrypto-local/cards/lib/card.json'));

  console.log('\ncard.jws');
  console.log(jwsCard);

  // fs.writeFileSync('card.jws', jwsCard, { flag: 'w+' });
}

main()
  .catch((error) => {
    console.log(error);

    process.exit(1);
  });
