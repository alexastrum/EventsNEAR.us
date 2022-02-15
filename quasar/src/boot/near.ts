import { boot } from 'quasar/wrappers';
import { connect, keyStores, WalletConnection, Contract } from 'near-api-js';
import { getConfig } from './config';
import { NearConfig } from 'near-api-js/lib/near';

export interface NearUser {
  accountId: string;
  balance: string;
}

let currentUser: NearUser, walletConnection: WalletConnection;

let contract: Contract;

export const nearConfig = getConfig();

export default boot(async () => {
  const nearConfig = getConfig();
  const keyStore = new keyStores.BrowserLocalStorageKeyStore();

  const near = await connect({
    keyStore,
    ...nearConfig,
  });
  console.log('NEAR CONNECTED');
  console.log(nearConfig);

  walletConnection = new WalletConnection(near, null);

  if (walletConnection.getAccountId()) {
    currentUser = {
      accountId: walletConnection.getAccountId() as string,
      balance: (await walletConnection.account().state()).amount,
    };
  }

  contract = new Contract(walletConnection.account(), 'CONTRACT NAME', {
    // View methods are read-only – they don't modify the state, but usually return some value
    viewMethods: ['getMessages'],
    // Change methods can modify the state, but you don't receive the returned value when called
    changeMethods: ['addMessage'],
  });
});

export { currentUser, contract, walletConnection };
