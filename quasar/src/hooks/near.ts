import { ContractMethods } from 'near-api-js/lib/contract';
import { getContract, getCurrentUser, getNear } from 'src/services/near';
import { useSWRV } from './swrv';

export const NEAR_SWRV_KEY = 'near:api';
const CONTRACT_NAME = 'aloin.testnet';

export function useNear() {
  // create a keyStore for signing transactions using the user's key
  // which is located in the browser local storage after user logs in
  return useSWRV(NEAR_SWRV_KEY, getNear);
}

export function useNearContract(
  contractName = CONTRACT_NAME,
  methods: ContractMethods = {
    // View methods are read-only – they don't modify the state, but usually return some value
    viewMethods: ['getMessages'],
    // Change methods can modify the state, but you don't receive the returned value when called
    changeMethods: ['addMessage'],
  }
) {
  const near = useNear();
  return useSWRV(
    () =>
      near.data.value
        ? [near.data.value.near, near.data.value.wallet, contractName, methods]
        : null,
    getContract
  );
}

export function useCurrentUser() {
  const near = useNear();
  const firebaseUser = {};

  return useSWRV(
    () =>
      near.data.value
        ? [near.data.value.near, near.data.value.wallet, firebaseUser]
        : null,
    getCurrentUser
  );
}
