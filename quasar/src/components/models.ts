export interface Event {
  title?: string;
  description?: string;
  image?: string;
  created: Date;
  featured?: boolean;
}
export interface FirestoreDocument<T> {
  data: T;
  id: string;
}

import firebase from 'firebase';
import 'firebase/firestore';

export const wrapSnapToDocument = <T>(
  snap: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>
) => (snap.exists ? { data: snap.data() as T, id: snap.id } : undefined);
