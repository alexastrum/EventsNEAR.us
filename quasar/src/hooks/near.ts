import * as nearAPI from 'near-api-js';
import { ContractMethods } from 'near-api-js/lib/contract';
import { keyStore, nearConfig, wallet } from 'src/boot/near';
import { ref } from 'vue';

const CONTRACT_NAME = 'aloin.testnet'; //process.env.CONTRACT_NAME || 'guest-book.testnet';

interface NearFirebaseUser {
  accountId: string;
  balance: () => Promise<string>;
}

export function useNear(
  contractName = CONTRACT_NAME,
  methods: ContractMethods = {
    // View methods are read-only – they don't modify the state, but usually return some value
    viewMethods: ['getMessages'],
    // Change methods can modify the state, but you don't receive the returned value when called
    changeMethods: ['addMessage'],
  }
) {
  // create a keyStore for signing transactions using the user's key
  // which is located in the browser local storage after user logs in

  const currentUser = ref<NearFirebaseUser>();
  const updateCurrentUser = () => {
    currentUser.value = wallet.getAccountId()
      ? {
          // Gets the accountId as a string
          accountId: wallet.getAccountId() as string,
          // Gets the user's token balance
          balance: async () => (await wallet.account().state()).amount, // account().getAccountBalance().available
          // ...(await getFirebaseUser()),
        }
      : undefined;
  };
  updateCurrentUser();

  // Initializing our contract APIs by contract name and configuration
  const contract = () => {
    return (
      currentUser.value &&
      new nearAPI.Contract(
        // User's accountId as a string
        wallet.account(),
        // accountId of the contract we will be loading
        // NOTE: All contracts on NEAR are deployed to an account and
        // accounts can only have one contract deployed to them.
        contractName,
        { ...methods, sender: currentUser.value.accountId } as ContractMethods
      )
    );
  };

  async function signIn(): Promise<void> {
    await wallet.requestSignIn(
      {
        contractId: contractName,
        methodNames: methods.changeMethods,
      },
      'EventsNEAR.us'
    );
    updateCurrentUser();
  }

  function signOut(): void {
    wallet.signOut();
    updateCurrentUser();
  }
  /**
   * Crypto proof helper for CustomToken Firebase Auth workflow
   *
   * @param message
   * @returns
   */
  async function signMessage(nonce: string) {
    if (!currentUser.value) {
      throw new Error('Sign message failed: Unauthenticated');
    }
    const key = await keyStore.getKey(
      nearConfig.networkId,
      currentUser.value.accountId
    );
    const sig = key?.sign(Buffer.from(nonce));
    return [
      nearConfig.nodeUrl,
      currentUser.value.accountId,
      sig?.publicKey.toString(),
      nonce,
      btoa(new TextDecoder().decode(sig?.signature)), // hash
    ].join('.');
  }

  async function verify(signature: string) {
    if (!currentUser.value) {
      throw new Error('Verify failed: Unauthenticated');
    }
    const [nodeUrl, accountId, publicKey, nonce, hash] = signature.split('.');
    if (nodeUrl !== nearConfig.nodeUrl) {
      throw new Error('Verify failed: Invalid nodeUrl');
    }
    if (accountId !== currentUser.value.accountId) {
      throw new Error('Verify failed: Invalid accountId');
    }
    const key = await keyStore.getKey(
      nearConfig.networkId,
      currentUser.value.accountId
    );
    // Note that on server we should call `view_access_key` to verify publicKey association with accountId,
    // see github.com/mehtaphysical/orbit-db-near-iam/blob/b247fb31be9da40fa365a6bc9a03f65b24543b17/src/verify.js
    if (publicKey !== key.getPublicKey().toString()) {
      throw new Error('Verify failed: Invalid public key');
    }
    return key?.verify(Buffer.from(nonce), Buffer.from(atob(hash)));
  }

  return {
    contract,
    currentUser,
    wallet,
    signIn,
    signOut,
    signMessage,
    verify,
  };
}
