import { boot } from 'quasar/wrappers';
import * as nearAPI from 'near-api-js';
import { getConfig } from './config';
import { WalletConnection } from 'near-api-js';
import { BrowserLocalStorageKeyStore } from 'near-api-js/lib/key_stores';

export interface NearUser {
  accountId: string;
  balance: string;
}

let near: nearAPI.Near;
let wallet: WalletConnection;
let keyStore: BrowserLocalStorageKeyStore;

export const nearConfig = getConfig();

export default boot(async () => {
  const nearConfig = getConfig();
  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();

  // Initializing connection to the NEAR testnet
  near = await nearAPI.connect({ keyStore, ...nearConfig });

  // Initialize wallet connection
  wallet = new nearAPI.WalletConnection(near, null);
  console.log('NEAR CONNECTED');
});

export { wallet, near, keyStore };
