import * as wsServer from '@webcrypto-local/server';
import {
  inject,
  injectable,
} from 'tsyringe';
import { Server } from './server';

interface Identity {
  browser: string;
  userAgent: string;
  created: Date;
  id: string;
  origin: string | 'edge' | 'ie' | 'chrome' | 'safari' | 'firefox' | 'other';
}

interface CurrentIdentity {
  origin: string | null;
  created: Date | null;
  browsers: string[];
}

/**
 *
 * @param {WebCryptoLocal.RemoteIdentityEx} identity
 */
function PrepareIdentity(identity: wsServer.RemoteIdentity) {
  const userAgent = identity.userAgent!;
  const res: Identity = {} as any;

  if (/edge\/([\d.]+)/i.exec(userAgent)) {
    res.browser = 'edge';
  } else if (/msie/i.test(userAgent)) {
    res.browser = 'ie';
  } else if (/Trident/i.test(userAgent)) {
    res.browser = 'ie';
  } else if (/chrome/i.test(userAgent)) {
    res.browser = 'chrome';
  } else if (/safari/i.test(userAgent)) {
    res.browser = 'safari';
  } else if (/firefox/i.test(userAgent)) {
    res.browser = 'firefox';
  } else {
    res.browser = 'Other';
  }

  res.created = identity.createdAt;
  res.origin = identity.origin!;

  return res;
}

@injectable()
export class ServerStorage {
  constructor(
    @inject('server') public server: Server,
  ) {}

  async getIdentities() {
    const storage = this.server.server.server.storage as wsServer.FileStorage;

    if (!Object.keys(storage.remoteIdentities).length) {
      // NOTE: call protected method of the storage
      // @ts-ignore
      await storage.loadRemote();
    }

    const identities = storage.remoteIdentities;
    const preparedList = [];

    for (const i in identities) {
      const identity = PrepareIdentity(identities[i]);

      preparedList.push(identity);
    }

    // sort identities
    preparedList.sort((a, b) => {
      if (a.origin > b.origin) {
        return 1;
      } if (a.origin < b.origin) {
        return -1;
      }
      if (a.browser > b.browser) {
        return 1;
      } if (a.browser < b.browser) {
        return -1;
      }

      return 0;
    });

    // prepare data
    const res: CurrentIdentity[] = [];
    let currentIdentity: CurrentIdentity = {
      origin: null,
      created: null,
      browsers: [],
    };

    preparedList.forEach((identity) => {
      if (currentIdentity.origin !== identity.origin) {
        if (currentIdentity.origin !== null) {
          res.push(currentIdentity);
        }

        currentIdentity = {
          origin: identity.origin,
          created: identity.created,
          browsers: [identity.browser],
        };
      } else {
        if (currentIdentity.created! > identity.created) {
          currentIdentity.created = identity.created;
        }

        if (!currentIdentity.browsers.some((browser) => browser === identity.browser)) {
          currentIdentity.browsers.push(identity.browser);
        }
      }
    });

    if (currentIdentity.origin !== null) {
      res.push(currentIdentity);
    }

    return res;
  }

  async removeIdentity(origin: string) {
    const storage = this.server.server.server.storage as wsServer.FileStorage;
    const remList = [];

    for (const i in storage.remoteIdentities) {
      const identity = storage.remoteIdentities[i];

      if (identity.origin === origin) {
        remList.push(i);
      }
    }

    remList.forEach((item) => {
      delete storage.remoteIdentities[item];
    });

    await storage.removeRemoteIdentity(origin);
  }
}
