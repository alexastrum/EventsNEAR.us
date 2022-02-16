export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

export interface Event {
  title: string;
  description: string;
  image: string;
}
export interface FirestoreDocument<T> {
  data: T;
  id: string;
}

import firebase from 'firebase';
import 'firebase/firestore';

firebase;
export const wrapSnapToDocument = <T>(
  snap: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>
) => (snap.exists ? { data: snap.data() as T, id: snap.id } : undefined);
