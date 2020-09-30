import * as assert from 'assert';
import * as os from 'os';
import * as path from 'path';
import { NssCertUtils } from '../src/main/services/ssl/nss';
import { Firefox } from '../src/main/services/ssl/firefox';

context('NssCertUtils', () => {
  const resourcesFolder = path.join(__dirname, 'resources');
  const ca = path.join(resourcesFolder, 'ca.pem');
  const platform = os.platform();
  const certutil = platform === 'linux'
    ? 'certutil'
    : path.join(__dirname, '..', 'nss', 'utils', 'certutil');
  const profiles = Firefox.profiles();
  if (!profiles.length) {
    throw new Error('Cannot find any Mozilla Firefox profiles');
  }
  const profile = profiles[0];
  // eslint-disable-next-line no-console
  console.log('Mozilla Firefox profile:', profile);
  const nss = new NssCertUtils(certutil, `sql:${profile}`);

  it('list certificate', () => {
    const certs = nss.list();
    certs.forEach((o) => {
      assert.equal(!!o.name, true, 'Certificate name is empty');
      assert.equal(!!o.attrs, true, 'Certificate trusted attributes are empty');
    });
  });

  it('get cert', () => {
    const cert = nss.get('Amazon');
    assert.equal(/-----BEGIN CERTIFICATE/.test(cert), true, 'Certificate is not PEM');
  });

  it('exists', () => {
    assert.equal(nss.exists('Amazon'), true);
    assert.equal(nss.exists('Amazon!!!'), false);
  });

  it('add/remove cert', () => {
    const certName = 'Fortify test';
    try {
      nss.add(ca, certName, 'CT,c,');
    } finally {
      nss.remove(certName);
    }
  });
});
