import { Observer } from 'src/hooks/swrv';

import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/functions';
import 'firebase/database';

export type FirebaseUser = firebase.User;

export type HttpsCallableOptions = firebase.functions.HttpsCallableOptions;

export async function signInWithCustomToken(token: string) {
  return firebase.auth().signInWithCustomToken(token);
}

export function httpsCallable<D, R>(
  name: string,
  options?: firebase.functions.HttpsCallableOptions
) {
  const callable = firebase.functions().httpsCallable(name, options);
  return async (data?: D) => {
    const result = await callable(data);
    return result.data as R;
  };
}

export function getAuthStateChangeObservable() {
  return (observer: Observer<FirebaseUser | null, firebase.auth.Error>) =>
    firebase.auth().onIdTokenChanged(observer.next, observer.error);
}

export function getDownloadURL(storagePath: string) {
  return firebase.storage().ref(storagePath).getDownloadURL();
}

export function getFirebaseDBObservable<D>(path: string) {
  return (observer: Observer<D | undefined>) => {
    const ref = firebase.database().ref(path);
    ref.on(
      'value',
      (snapshot) => {
        observer.next(snapshot.val() as D);
      },
      (error) => {
        observer.error(error);
        observer.complete();
      }
    );
    return () => {
      ref.off();
    };
  };
}

export function getFirestoreDocObservable<D>(
  collectionPath: string,
  docId: string
) {
  return (observer: Observer<D | undefined>) => {
    const collection = firebase
      .firestore()
      .collection(collectionPath) as firebase.firestore.CollectionReference<D>;
    return collection.doc(docId).onSnapshot(
      (snapshot) => {
        observer.next(snapshot.data());
      },
      observer.error,
      observer.complete
    );
  };
}

export interface FirestoreQuery<D> {
  where?: [
    // Single field condition
    (keyof D & string) | firebase.firestore.FieldPath,
    firebase.firestore.WhereFilterOp,
    D[keyof D]
  ];
  whereEquals?: {
    // Multi field conditions
    [K in keyof D & string]?: D[K];
  };
  orderBy?: [
    (keyof D & string) | firebase.firestore.FieldPath,
    firebase.firestore.OrderByDirection
  ];
  limit?: number;
}

export function getFirestoreCollectionObservable<D>(
  collectionPath: string,
  query: FirestoreQuery<D>
) {
  return (observer: Observer<Map<string, D> | undefined>) => {
    let collection: firebase.firestore.Query<D> = firebase
      .firestore()
      .collection(collectionPath) as firebase.firestore.CollectionReference<D>;

    if (query.where) {
      collection = collection.where(...query.where);
    }

    if (query.whereEquals) {
      collection = Object.entries(query.whereEquals).reduce(
        (col, [field, value]) => col.where(field, '==', value),
        collection
      );
    }

    if (query.orderBy) {
      collection = collection.orderBy(...query.orderBy);
    }
    if (query.limit) {
      collection = collection.limit(query.limit);
    }

    return collection.onSnapshot(
      (snapshot) => {
        observer.next(
          new Map(snapshot.docs.map((doc) => [doc.id, doc.data()]))
        );
      },
      observer.error,
      observer.complete
    );
  };
}
