<p align="center">
  <a href="https://fortifyapp.com/" rel="noopener" target="_blank"><img width="128" src="src/static/icons/tray/png/icon@16x.png" alt="Fortify logo"></a></p>
</p>

<h1 align="center">Fortify Desktop</h1>

<h4 align="center">Fortify enables web applications to use smart cards, local certificate stores and do certificate enrollment. For Mac, Windows, and Linux.</h4>

<p align="center">
  <a href="https://github.com/PeculiarVentures/fortify/blob/master/LICENSE"><img src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg" alt="License: AGPL v3"></a>
  <a href="https://github.com/PeculiarVentures/fortify/releases"><img src="https://img.shields.io/github/v/release/PeculiarVentures/fortify.svg" alt="github release version"></a>
  <a href="https://github.com/PeculiarVentures/fortify/releases"><img src="https://img.shields.io/github/downloads/PeculiarVentures/fortify/total.svg" alt="github release downloads"></a>
</p>

- [Background](#background)
- [Architecture](#architecture)
- [How does it work?](#how-does-it-work)
- [How can I use it?](#how-can-i-use-it)
- [Download](https://fortifyapp.com/#download)
- [Documentation](https://fortifyapp.com/docs/overview)
- [FAQ](https://fortifyapp.com/#faq)
- [Guides](https://fortifyapp.com/#guides)
- [Examples](https://fortifyapp.com/examples/certificate-enrollment)
- [Tools](https://tools.fortifyapp.com/)

## Background
Fortify is a client application that you install that runs in the background as a tray application in Windows, OSX, and Linux that provides these missing capabilities to authorized applications.

It does this by binding to 127.0.0.1 and listening to a high-order well-known port for incoming requests. Browsers allow web applications to initiate sessions to this address, over that session a Fortify enabled application establishes a secure session and if approved by the user is allowed to access these missing capabilities.

## Architecture
Fortify is a Node.js application based on Electron and it accesses all cryptographic implementations via node-webcrypto-p11. This library was designed to provide a WebCrypto compatible API to Node.js applications but it also extends the WebCrypto API to provide basic access to certificate stores.

It uses another Peculiar Ventures project called PVPKCS11 to access the OSX KeyStore, Mozilla NSS or Windows CryptoAPI via this PKCS#11 wrapper.

It also uses pcsclite to listen for a smart card or security token insertions and removals, when new insertions are detected it inspects the ATR of the card. If it is a known card the client attempts to load the PKCS#11 library associated with the card. If that succeeds events in the `webcrypto-socket` protocol are used to let the web application know about the availability of the new cryptographic and certificate provider.

Ironically, despite the complication of the PKCS#11 API, this approach enables the code to maintain a fairly easy to understand structure.

The application also includes a tray application that is used to help with debugging, access a test application and manage which domains can access the service.

## How does it work?
At the core of Fortify is a library called 2key-ratchet. This implements a `Double Ratchet` protocol similar to what is used by Signal. In this protocol each peer has an identity key pair, we use the public keys from each participant to compute a short numeric value since in the protocol the peers prove control of the respective private keys we know that once the keys are authenticated we are talking to the same “identity”.

Since 2key-ratchet uses WebCrypto we leverage the fact that keys generated in a web application are bound to the same origin, we also (when possible) utilize non-exportable keys to mitigate the risks of these approved keys from being stolen.

This gives us an origin bound identity for the web application that the Fortify client uses as the principal in an Access Control List. This means if you visit a new site (a new origin), even if operated by the same organization, you will need to approve their access to use Fortify.

For good measure (and browser compatibility) this exchange is also performed over a TLS session. At installation time a local CA is created, this CA is used to create an SSL certificate for 127.0.0.1. The private key of the CA is then deleted once the SSL certificate is created and the Root CA of the certificate chain is installed as a locally trusted CA. This prevents the CA from being abused to issue certificates for other origins.

The protocol used by Fortify use a /.wellknown/ (not yet registered) location for capability discovery. The core protocol itself is Protobuf based.

We call this protocol webcrypto-socket. You can think of the protocol as a Remote Procedure Call or (RPC) to the local cryptographic and certificate implementations in your operating system.

## How can I use it?

Since the client SDK that implements the `webcrypto-socket` protocol is a superset of WebCrypto, with slight modifications, if you have an web application that uses WebCrypto you can also use locally enrolled certificates and/or smart cards.

We have also created a number of web componentss that make using it easy, for example:

- [Certificate Enrollment](https://fortifyapp.com/examples/certificate-enrollment)
- [Certificate Selection](https://fortifyapp.com/examples/certificate-management)
- [Signing](https://fortifyapp.com/examples/signing)


## Installing

### Binaries

Visit the [the official website](https://fortifyapp.com/#download) to find the installer you need.

### Building from source

```
git clone git@github.com:PeculiarVentures/fortify.git
cd fortify
npm install
npm run build
npm start
```

