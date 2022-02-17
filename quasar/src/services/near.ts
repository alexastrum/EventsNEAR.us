import { connect, Contract, Near, WalletConnection } from 'near-api-js';
import {
  BrowserLocalStorageKeyStore,
  KeyStore,
} from 'near-api-js/lib/key_stores';
import { NearConfig } from 'near-api-js/lib/near';
import { ContractMethods } from 'near-api-js/lib/contract';
import { FirebaseUser, httpsCallable, signInWithCustomToken } from './firebase';
import { mutate } from 'src/hooks/swrv';

export const CONTRACT_NAME: ContractId = 'aloin';

export function getConfig(): NearConfig {
  if (process.env.PROD) {
    return {
      headers: {},
      networkId: 'mainnet',
      nodeUrl: 'https://rpc.mainnet.near.org',
      walletUrl: 'https://wallet.near.org',
      helperUrl: 'https://helper.mainnet.near.org',
    };
  } else {
    return {
      headers: {},
      networkId: 'testnet',
      nodeUrl: 'https://rpc.testnet.near.org',
      walletUrl: 'https://wallet.testnet.near.org',
      helperUrl: 'https://helper.testnet.near.org',
    };
  }
}

export function getKeyStore() {
  return new BrowserLocalStorageKeyStore();
}

export async function getNear() {
  const nearConfig = getConfig();
  const keyStore = getKeyStore();
  const near = await connect({ keyStore, ...nearConfig });
  const wallet = new WalletConnection(near, null);
  return { near, wallet, keyStore };
}

export type ContractId = string;

export function getContract(
  near: Near,
  wallet: WalletConnection,
  contractId: ContractId,
  methods: ContractMethods
) {
  const accountId = wallet.getAccountId() as string;
  const nearConfig = near.config as NearConfig;
  contractId = `${contractId}.${nearConfig.networkId}`;

  // Initializing our contract APIs by contract name and configuration
  const contract = accountId
    ? new Contract(
        // User's accountId as a string
        wallet.account(),
        // accountId of the contract we will be loading
        // NOTE: All contracts on NEAR are deployed to an account and
        // accounts can only have one contract deployed to them.
        contractId,
        { ...methods, sender: accountId } as ContractMethods
      )
    : undefined;

  async function signIn(): Promise<void> {
    await wallet.requestSignIn(
      {
        contractId,
        methodNames: methods.changeMethods,
      },
      contractId
    );
  }

  console.log('NEAR', near, wallet, contract);
  return {
    contract,
    signIn,
  };
}

interface SignInRequest {
  signature: string;
}

interface SignInResponse {
  profile: {
    // TODO
  };
  token: string;
}

export async function getCurrentUser(
  near: Near,
  wallet: WalletConnection,
  keyStore: KeyStore,
  firebaseUser: FirebaseUser | null
) {
  const nearConfig = near.config as NearConfig;
  const accountId = wallet.getAccountId() as string;
  const networkId = near.connection.networkId;
  const isAnonymous = firebaseUser === null;
  const isAuthenticated = !!firebaseUser;

  if (accountId && isAnonymous) {
    const signature = await signMessage('hello');
    await verifySignature(signature);
    const { profile, token } = await httpsCallable<
      SignInRequest,
      SignInResponse
    >('signIn')({ signature });
    await signInWithCustomToken(token);
    await mutate('profile', profile);
    console.log('signInWithCustomToken', signature, token, profile);
  }

  /**
   * Crypto proof helper for CustomToken Firebase Auth workflow
   *
   * @param message
   * @returns
   */
  async function signMessage(nonce: string) {
    if (!accountId) {
      throw new Error('Sign message failed: Unauthenticated');
    }
    const keyPair = await keyStore.getKey(networkId, accountId);
    const sig = keyPair.sign(Buffer.from(nonce));
    return JSON.stringify([
      nearConfig.nodeUrl,
      accountId,
      Buffer.from(sig?.publicKey.data).toString('hex'),
      nonce,
      Buffer.from(sig?.signature).toString('hex'), // hash
    ]);
  }

  async function verifySignature(signature: string) {
    if (!accountId) {
      throw new Error('Verify failed: Unauthenticated');
    }
    const [nodeUrl, sigAccountId, publicKey, nonce, hash] = JSON.parse(
      signature
    ) as string[];
    if (nodeUrl !== nearConfig.nodeUrl) {
      throw new Error('Verify failed: Invalid nodeUrl: ' + nodeUrl);
    }
    if (sigAccountId !== accountId) {
      throw new Error('Verify failed: Invalid accountId: ' + accountId);
    }
    const key = await near.connection.signer.getPublicKey(accountId, networkId);
    // Note that on server we should call `view_access_key` to verify publicKey association with accountId,
    // see github.com/mehtaphysical/orbit-db-near-iam/blob/b247fb31be9da40fa365a6bc9a03f65b24543b17/src/verify.js
    if (publicKey !== Buffer.from(key.data).toString('hex')) {
      throw new Error('Verify failed: Invalid public key: ' + publicKey);
    }
    const result = key.verify(Buffer.from(nonce), Buffer.from(hash, 'hex'));
    if (!result) {
      throw new Error('Verify failed: Invalid signature: ' + hash);
    }
  }

  return accountId
    ? {
        ...firebaseUser,
        isAnonymous,
        isAuthenticated,
        accountId,
        balance: (await wallet.account().state()).amount, // account().getAccountBalance().available
        signMessage,
        verifySignature,
        signOut: () => {
          wallet.signOut();
          location.reload();
        },
      }
    : undefined;
}
