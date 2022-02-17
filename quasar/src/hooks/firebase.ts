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
  return useSWRV<D | undefined, string | (() => [string])>(
    () => [path()],
    getFirebaseDBObservable
  );
}

export function useFirestoreDoc<D>(collection: string, docId: () => string) {
  return useSWRV<D | undefined, () => [string, string]>(
    () => [collection, docId()],
    getFirestoreDocObservable
  );
}

export function useFirestoreCollection<D>(
  collection: string,
  query: () => FirestoreQuery<D> = () => ({})
) {
  return useSWRV<Map<string, D> | undefined, () => [string, FirestoreQuery<D>]>(
    () => [collection, query()],
    getFirestoreCollectionObservable
  );
}
