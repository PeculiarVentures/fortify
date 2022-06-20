## [1.8.4](https://github.com/PeculiarVentures/fortify/releases/tag/1.8.4) (20.06.2022)

### Features

- Update `electron` dependency to `13.6.9`.

### Bug Fixes

- Fix ERR_CERT_AUTHORITY_INVALID exception on Mac ([#475](https://github.com/PeculiarVentures/fortify/issues/475)).
- Fix Firefox in Ubuntu can't communicate with Fortify ([#461](https://github.com/PeculiarVentures/fortify/issues/461)).
- Fix Unable to open fortify tools in Chrome ([#409](https://github.com/PeculiarVentures/fortify/issues/409)).
- Fix App doesn't install CA certificate to Firefox ([#327](https://github.com/PeculiarVentures/fortify/issues/327)).
- Fix Fortify modals stay open if client vanishes ([#485](https://github.com/PeculiarVentures/fortify/issues/485)).
- Fix Fortify is not valid win32 application ([#440](https://github.com/PeculiarVentures/fortify/issues/440)).
- Fix CardConfig ignores cards from options ([#272](https://github.com/PeculiarVentures/webcrypto-local/pull/272)).

### Other Changes

- Update `minimist ` dependency to `1.2.6`.
- Update `@webcrypto-local/*` dependency to `1.7.2`.
- Update `typescript` dependency to `4.6.4`.
- Update `asn1js` dependency to `3.0.3`.
- Update `ts-node` dependency to `10.7.0`.
- Update `protobufjs` dependency to `6.11.3`.
- Use `nanoid` instead of `uuid`.
- Update `it.json` ([#492](https://github.com/PeculiarVentures/fortify/issues/492)).


## [1.8.3](https://github.com/PeculiarVentures/fortify/releases/tag/1.8.3) (27.10.2021)

### Features

- Add support to use custom driver ([#439](https://github.com/PeculiarVentures/fortify/issues/439)).
- Update `electron` dependency to `11.5.0`.
- Use `ts-loader` instead of `awesome-typescript-loader`.
- Update `webcrypto-core` version to `1.3.0`.
- Update `pvtsutils` version to `1.2.1`.
- Update `pkijs` version to `2.2.1`.
- Update `pkcs11js` version to `1.2.6`.
- Update `asn1js` version to `2.1.1`.
- Update `@peculiar/asn1-*` version to `2.0.38`.
- Update `@webcrypto-local` version to `1.6.8`.

### Bug Fixes

- Fix startup error in Ubuntu ([#436](https://github.com/PeculiarVentures/fortify/issues/436)).
- Fortify is not valid win32 application ([#440](https://github.com/PeculiarVentures/fortify/issues/440)).
- Fix PIN entered not shown until window moves ([#453](https://github.com/PeculiarVentures/fortify/issues/453)).

## [1.8.2](https://github.com/PeculiarVentures/fortify/releases/tag/1.8.2) (05.07.2021)

### Bug Fixes

- Fix error on `ossl` property reading of null object.
- Change driver for the `3BDF18008131FE7D006B020C0182011101434E53103180FC` token ([#423](https://github.com/PeculiarVentures/fortify/issues/423)).
- Fix error on key generation ([#422](https://github.com/PeculiarVentures/fortify/issues/422)).
- Fix error on IDPrime card removing ([#421](https://github.com/PeculiarVentures/fortify/issues/421)).

## [1.8.1](https://github.com/PeculiarVentures/fortify/releases/tag/1.8.1) (01.06.2021)

### Features

- Added log with `PKCS#11` information.
```json
{"source":"provider","library":"/usr/local/lib/libsoftokn3.dylib","manufacturerId":"Mozilla Foundation","cryptokiVersion":{"major":2,"minor":40},"libraryVersion":{"major":3,"minor":64},"firmwareVersion":{"major":0,"minor":0},"level":"info","message":"PKCS#11 library information","timestamp":"2021-05-26T09:57:30.827Z"}
```
- Supported configuration for `PKCS#11` templates.
```json
{
  "id": "39b3d7a3662c4b48bb120d008dd18648",
  "name": "SafeNet Authentication Client",
  "config": {
    "template": {
      "copy": {
        "private": {
          "token": true,
          "sensitive": true,
          "extractable": false
        }
      }
    }
  }
}
```
- Updated `PKCS#11` lib. It doesn't show System certificates.

## [1.8.0](https://github.com/PeculiarVentures/fortify/releases/tag/1.8.0) (17.02.2021)

### Features

- Update preferences window UI ([#395](https://github.com/PeculiarVentures/fortify/pull/395)).
- Update `electron` dependency to `11.2.3` ([#397](https://github.com/PeculiarVentures/fortify/pull/397).

## [1.7.0](https://github.com/PeculiarVentures/fortify/releases/tag/1.7.0) (08.02.2021)

### Features

- Implement analytics ([#374](https://github.com/PeculiarVentures/fortify/pull/374)).
- Update `@webcrypto-local` dependency to `1.6.0` ([#390](https://github.com/PeculiarVentures/fortify/pull/390), [#387](https://github.com/PeculiarVentures/fortify/issues/387)).

### Bug Fixes

- Update `electron` dependency to `9.4.1` ([#388](https://github.com/PeculiarVentures/fortify/pull/388), [#386](https://github.com/PeculiarVentures/fortify/pull/386)).


## [1.5.0](https://github.com/PeculiarVentures/fortify/releases/tag/1.5.0) (23.11.2020)

### Features

- Add scripts to create `update.jw`s and `card.jws`.
- Add CI workflow to create installers for `macOS`, `linux (ubuntu)` and `windows (x64, x86)`.

### Bug Fixes

- Update `@webcrypto-local/server` dependency to `1.5.2`.