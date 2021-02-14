/// <reference path="./types.d.ts" />

import * as fs from 'fs';
import * as path from 'path';
import * as jose from 'jose-jwe-jws';
import { crypto } from './crypto';
import { getKeyPair } from './keys';

const {
  PRIVATE_KEY_BASE64,
  PUBLIC_KEY_BASE64,
  OUTPUT_FOLDER_PATH,
} = process.env;

async function signData(keys: CryptoKeyPairEx, data: any) {
  const cryptographer = new jose.Jose.WebCryptographer();
  cryptographer.setContentSignAlgorithm('RS256');
  const signer = new jose.JoseJWS.Signer(cryptographer);
  await signer.addSigner(keys.privateKey, keys.kid);

  const doc = await signer.sign(data);
  const jws = doc.CompactSerialize();

  return jws;
}

async function verifyData(keys: CryptoKeyPairEx, jws: string) {
  const cryptographer = new jose.Jose.WebCryptographer();
  cryptographer.setContentSignAlgorithm('RS256');

  const verifier = new jose.JoseJWS.Verifier(cryptographer, jws);
  await verifier.addRecipient(keys.publicKey, keys.kid);

  return verifier.verify();
}

async function signUpdateJSON(keys: CryptoKeyPairEx, info: IUpdateInfoJson) {
  const jws = await signData(keys, info);

  if (!await verifyData(keys, jws)) {
    throw new Error('JWS has bad signature');
  }

  return jws;
}

async function signCardJSON(keys: CryptoKeyPairEx, path: string) {
  // Read card.json
  const json = fs.readFileSync(path, 'utf8');
  const card = JSON.parse(json);

  // Sign data
  console.log('card.json version: %s', card.version);

  return signData(keys, card);
}

async function main() {
  const { version } = require('../../package.json');

  if (!PRIVATE_KEY_BASE64) {
    throw new Error('Missed required env variable "PRIVATE_KEY_BASE64".');
  }

  if (!PUBLIC_KEY_BASE64) {
    throw new Error('Missed required env variable "PUBLIC_KEY_BASE64".');
  }

  if (!OUTPUT_FOLDER_PATH) {
    throw new Error('Missed required env variable "OUTPUT_FOLDER_PATH".');
  }

  jose.setCrypto(crypto as any);

  const keys = await getKeyPair(PRIVATE_KEY_BASE64, PUBLIC_KEY_BASE64);
  const jws = await signUpdateJSON(keys, { version, createdAt: Date.now() });
  const jwsCard = await signCardJSON(keys, path.resolve('./node_modules/@webcrypto-local/cards/lib/card.json'));
  const outPath = path.resolve(OUTPUT_FOLDER_PATH);
  const outPathUpdateJws = path.join(outPath, './update.jws');
  const outPathCardJws = path.join(outPath, './card.jws')

  if (!fs.existsSync(outPath)) {
    fs.mkdirSync(outPath);
  }

  fs.writeFileSync(outPathUpdateJws, jws, { flag: 'w+' });
  console.log('\nupdate.jws created successfully:', outPathUpdateJws);

  fs.writeFileSync(outPathCardJws, jwsCard, { flag: 'w+' });
  console.log('\ncard.jws created successfully:', outPathCardJws);
}

main()
  .catch((error) => {
    console.log(error);

    process.exit(1);
  });
