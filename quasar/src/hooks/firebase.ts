import {
  FirestoreQuery,
  getFirebaseDBObservable,
  getFirestoreCollectionObservable,
  getFirestoreDocObservable,
  getDownloadURL,
  getAuthStateChangeObservable,
  httpsCallable,
  HttpsCallableOptions,
} from 'src/services/firebase';
import { useSWRV } from './swrv';

export function useFirebaseUser() {
  return useSWRV('', getAuthStateChangeObservable);
}

export function useHttpsCallable<D, R>(
  name: string,
  data: () => D,
  options?: HttpsCallableOptions
) {
  return useSWRV<R, () => [D]>(() => [data()], httpsCallable(name, options));
}

export function useDownloadUrl(path: () => string) {
  return useSWRV(() => [path()], getDownloadURL);
}

export function useFirebaseDB<D>(path: () => string = () => '') {
  return useSWRV<D | undefined, string | (() => [string] | undefined)>(() => {
    const p = path();
    return p ? [p] : undefined;
  }, getFirebaseDBObservable);
}

export function useFirestoreDoc<D>(
  collection: string,
  docId: () => string | undefined
) {
  return useSWRV<D | undefined, () => [string, string] | undefined>(() => {
    const id = docId();
    return id ? [collection, id] : undefined;
  }, getFirestoreDocObservable);
}

export function useFirestoreCollection<D>(
  collection: string,
  query: () => FirestoreQuery<D> | undefined = () => ({})
) {
  return useSWRV<
    Map<string, D> | undefined,
    () => [string, FirestoreQuery<D>] | undefined
  >(() => {
    const q = query();
    return q ? [collection, q] : undefined;
  }, getFirestoreCollectionObservable);
}
