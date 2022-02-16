import { ContractMethods } from 'near-api-js/lib/contract';
import {
  CONTRACT_NAME,
  getContract,
  getCurrentUser,
  getNear,
  NEAR_SWRV_KEY,
} from 'src/services/near';
import { useSWRV } from './swrv';

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
    changeMethods: ['addMessage', 'createEvent'],
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
