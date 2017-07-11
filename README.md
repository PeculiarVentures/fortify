# Fortify
Desktop application

## Install dependencies

```
npm install
```

> NOTE: `.npmrc` has `opessl_dir` param. Update it to your local path before `install` script run


## Build

```
npm run build
```

> NOTE: Put compiled `pvpkcs11.dylib` to project folder

> NOTE: PKIjs has [issuer](https://github.com/PeculiarVentures/PKI.js/issues/113). Use [instruction](https://github.com/PeculiarVentures/webcrypto-local#build--server) to fix it