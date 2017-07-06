# Fortify
Desktop application

## Build

```
npm run build
```

> NOTE: webcrypto-local has uses dev link to pvpkcs11 lib. For application you have to copy compiled pvpkcs11 lib to project directory and update `node_modules/webcrypto-local/out/local/provider.js:155` and replace path for the lib to the `library = path.join(__dirname, "../../../../libpvpkcs11.dylib");`