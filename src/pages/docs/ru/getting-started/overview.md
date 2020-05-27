---
title: Обзор
---

Webcrypto socket module implements [WebCrypto](/) interface and uses [Fortify](/) application for crypto implementation.


#### Install ES6 module

```bash
npm i @webcrypto-local/client
```

#### Using browser version

To support cross-browser work (Chrome, Firefox, Safari, Edge, IE) you can apply some scripts to your HTML page. webcrypto-sockets.js exports global namespace WebcryptoSocket.

```html
<!-- Babel Polyfill -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/7.7.0/polyfill.min.js"></script>
<!-- WebCrypto Polyfill-->
<script src="https://cdnjs.cloudflare.com/ajax/libs/asmCrypto/2.3.2/asmcrypto.all.es5.min.js"></script>
<script src="https://cdn.rawgit.com/indutny/elliptic/master/dist/elliptic.min.js"></script>
<script src="https://unpkg.com/webcrypto-liner@1.1.4/build/webcrypto-liner.shim.min.js"></script>
<!-- WebCrypto Socket -->
<script src="https://cdn.rawgit.com/dcodeIO/protobuf.js/6.8.0/dist/protobuf.js"></script>
<script src="https://unpkg.com/@webcrypto-local/client@1.0.14/build/webcrypto-socket.min.js"></script>
```