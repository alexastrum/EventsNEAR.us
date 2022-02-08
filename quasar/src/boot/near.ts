import { boot } from 'quasar/wrappers';
import { connect, keyStores, WalletConnection } from 'near-api-js';
import { getConfig } from './config';
import { NearConfig } from 'near-api-js/lib/near';

export interface NearUser {
  accountId: string;
  balance: string;
}

let currentUser: NearUser,
  walletConnection: WalletConnection,
  nearConfig: NearConfig;
export default boot(async () => {
  nearConfig = getConfig();
  const keyStore = new keyStores.BrowserLocalStorageKeyStore();

  const near = await connect({
    keyStore,
    ...nearConfig,
  });

  walletConnection = new WalletConnection(near, null);

  if (walletConnection.getAccountId()) {
    currentUser = {
      accountId: walletConnection.getAccountId() as string,
      balance: (await walletConnection.account().state()).amount,
    };
  }
});

export { currentUser, nearConfig, walletConnection };
