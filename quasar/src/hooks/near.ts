import * as nearAPI from 'near-api-js';
import { ContractMethods } from 'near-api-js/lib/contract';

const CONTRACT_NAME = process.env.CONTRACT_NAME || 'guest-book.testnet';

function getConfig(env: string) {
  switch (env) {
    case 'mainnet':
    case 'near':
      return {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
      };
    // This is an example app so production is set to testnet.
    // You can move production to mainnet if that is applicable.
    case 'production':
    case 'development':
    case 'testnet':
      return {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
      };
    case 'betanet':
      return {
        networkId: 'betanet',
        nodeUrl: 'https://rpc.betanet.near.org',
        walletUrl: 'https://wallet.betanet.near.org',
        helperUrl: 'https://helper.betanet.near.org',
      };
    case 'local':
      return {
        networkId: 'local',
        nodeUrl: 'http://localhost:3030',
        keyPath: `${process.env.HOME || '.'}/.near/validator_key.json`,
        walletUrl: 'http://localhost:4000/wallet',
      };
    case 'test':
    case 'ci':
      return {
        networkId: 'shared-test',
        nodeUrl: 'https://rpc.ci-testnet.near.org',
        masterAccount: 'test.near',
      };
    case 'ci-betanet':
      return {
        networkId: 'shared-test-staging',
        nodeUrl: 'https://rpc.ci-betanet.near.org',
        masterAccount: 'test.near',
      };
    default:
      throw Error(`Unconfigured environment '${env}'.`);
  }
}

export async function useNear(
  contractName = CONTRACT_NAME,
  methods: ContractMethods = {
    // View methods are read-only – they don't modify the state, but usually return some value
    viewMethods: ['getMessages'],
    // Change methods can modify the state, but you don't receive the returned value when called
    changeMethods: ['addMessage'],
  }
) {
  const env = contractName.split('.')[1];

  // get network configuration values from config.js
  // based on the network ID we pass to getConfig()
  const config = getConfig(env);

  // create a keyStore for signing transactions using the user's key
  // which is located in the browser local storage after user logs in
  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();

  // Initializing connection to the NEAR testnet
  const near = await nearAPI.connect({ keyStore, headers: {}, ...config });

  // Initialize wallet connection
  const wallet = new nearAPI.WalletConnection(near, null);

  const currentUser = wallet.getAccountId()
    ? {
        // Gets the accountId as a string
        accountId: wallet.getAccountId() as string,
        // Gets the user's token balance
        balance: async () => (await wallet.account().state()).amount, // account().getAccountBalance().available
        // ...(await getFirebaseUser()),
      }
    : null;

  // Initializing our contract APIs by contract name and configuration
  const contract =
    currentUser &&
    new nearAPI.Contract(
      // User's accountId as a string
      wallet.account(),
      // accountId of the contract we will be loading
      // NOTE: All contracts on NEAR are deployed to an account and
      // accounts can only have one contract deployed to them.
      contractName,
      { ...methods, sender: currentUser.accountId } as ContractMethods
    );

  async function signIn() {
    await wallet.requestSignIn(
      {
        contractId: contractName,
        methodNames: methods.changeMethods,
      },
      'EventsNEAR.us'
    );
  }

  /**
   * Crypto proof helper for CustomToken Firebase Auth workflow
   *
   * @param message
   * @returns
   */
  async function signMessage(nonce: string) {
    if (!currentUser) {
      throw new Error('Sign message failed: Unauthenticated');
    }
    const key = await keyStore.getKey(config.networkId, currentUser.accountId);
    const sig = key?.sign(Buffer.from(nonce));
    return [
      config.nodeUrl,
      currentUser.accountId,
      sig?.publicKey.toString(),
      nonce,
      btoa(new TextDecoder().decode(sig?.signature)), // hash
    ].join('.');
  }

  async function verify(signature: string) {
    if (!currentUser) {
      throw new Error('Verify failed: Unauthenticated');
    }
    const [nodeUrl, accountId, publicKey, nonce, hash] = signature.split('.');
    if (nodeUrl !== config.nodeUrl) {
      throw new Error('Verify failed: Invalid nodeUrl');
    }
    if (accountId !== currentUser.accountId) {
      throw new Error('Verify failed: Invalid accountId');
    }
    const key = await keyStore.getKey(config.networkId, currentUser.accountId);
    // Note that on server we should call `view_access_key` to verify publicKey association with accountId,
    // see github.com/mehtaphysical/orbit-db-near-iam/blob/b247fb31be9da40fa365a6bc9a03f65b24543b17/src/verify.js
    if (publicKey !== key.getPublicKey().toString()) {
      throw new Error('Verify failed: Invalid public key');
    }
    return key?.verify(Buffer.from(nonce), Buffer.from(atob(hash)));
  }

  return { near, contract, currentUser, wallet, signIn, signMessage, verify };
}
