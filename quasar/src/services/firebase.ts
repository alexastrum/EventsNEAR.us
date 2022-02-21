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

export async function signOut() {
  return firebase.auth().signOut();
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
        console.log('db', snapshot);
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
        observer.next(unpackFirestoreData(snapshot.data()));
      },
      observer.error,
      observer.complete
    );
  };
}

export type FirestoreQuery<D> = {
  where?: [
    // Single field condition
    (keyof D & string) | firebase.firestore.FieldPath,
    firebase.firestore.WhereFilterOp,
    D[keyof D]
  ];
  whereEquals?: Partial<D>;
  orderBy?: [
    (keyof D & string) | firebase.firestore.FieldPath,
    firebase.firestore.OrderByDirection
  ];
  limit?: number;
};

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
          new Map(
            snapshot.docs.map((doc) => [
              doc.id,
              unpackFirestoreData(doc.data()),
            ])
          )
        );
      },
      observer.error,
      observer.complete
    );
  };
}

export type DocumentData = firebase.firestore.DocumentData;

function unpackFirestoreField<T>(val: T, maxDepth: number) {
  if (maxDepth <= 0) {
    return val;
  }
  if (val instanceof firebase.firestore.Timestamp) {
    // Convert Timestamp to Date for interoperability with other collection implementations.
    return val.toDate();
  }
  if (val instanceof firebase.firestore.DocumentReference) {
    // Firebase SDK has a bug preventing onSnapshot from working on referenced docs.
    // Convert DocumentReference to string for interoperability with other collection implementations.
    // To load a referenced doc, use `const otherDoc = registry.watchDoc(() => thisDoc.value.data.otherDocPath)`
    return val.path;
  }
  if (typeof val === 'object') {
    return unpackFirestoreData(val, maxDepth - 1);
  }
  return val;
}

export function unpackFirestoreData<T>(data: T, maxDepth = 10): T {
  if (Array.isArray(data)) {
    return data.map((val: undefined) =>
      unpackFirestoreField(val, maxDepth)
    ) as unknown as T;
  }
  if (typeof data !== 'object') {
    return data;
  }
  const keys = Object.keys(data);
  const result: DocumentData = {};
  // Make a copy of the object
  keys.forEach((key) => {
    result[key] = unpackFirestoreField(
      (data as DocumentData)[key],
      maxDepth
    ) as undefined;
  });
  return result as T;
}
