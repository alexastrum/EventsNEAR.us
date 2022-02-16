import { connect, Contract, Near, WalletConnection } from 'near-api-js';
import { BrowserLocalStorageKeyStore } from 'near-api-js/lib/key_stores';
import { NearConfig } from 'near-api-js/lib/near';
import { ContractMethods } from 'near-api-js/lib/contract';

export const NEAR_SWRV_KEY = 'near:api';
export const CONTRACT_NAME = 'aloin';

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
  return { near, wallet };
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

export interface FirebaseUser {
  uid?: string;
}

export async function getCurrentUser(
  near: Near,
  wallet: WalletConnection,
  firebaseUser: FirebaseUser
) {
  const nearConfig = near.config as NearConfig;
  const accountId = wallet.getAccountId() as string;

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
    // const key = await keyStore.getKey(
    //   nearConfig.networkId,
    //   currentUser.value.accountId
    // );
    // key?.sign(...)
    const sig = await near.connection.signer.signMessage(Buffer.from(nonce));
    return [
      nearConfig.nodeUrl,
      accountId,
      sig?.publicKey.toString(),
      nonce,
      btoa(new TextDecoder().decode(sig?.signature)), // hash
    ].join('.');
  }

  async function verifySignature(signature: string) {
    if (!accountId) {
      throw new Error('Verify failed: Unauthenticated');
    }
    const [nodeUrl, sigAccountId, publicKey, nonce, hash] =
      signature.split('.');
    if (nodeUrl !== nearConfig.nodeUrl) {
      throw new Error('Verify failed: Invalid nodeUrl');
    }
    if (sigAccountId !== accountId) {
      throw new Error('Verify failed: Invalid accountId');
    }
    const key = await near.connection.signer.getPublicKey();
    // Note that on server we should call `view_access_key` to verify publicKey association with accountId,
    // see github.com/mehtaphysical/orbit-db-near-iam/blob/b247fb31be9da40fa365a6bc9a03f65b24543b17/src/verify.js
    if (publicKey !== key.toString()) {
      throw new Error('Verify failed: Invalid public key');
    }
    return key?.verify(Buffer.from(nonce), Buffer.from(atob(hash)));
  }

  return accountId
    ? {
        ...firebaseUser,
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
