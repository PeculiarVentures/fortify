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