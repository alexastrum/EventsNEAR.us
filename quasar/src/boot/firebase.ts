import { boot } from 'quasar/wrappers';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/functions';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(({ app }) => {
  app.use(() => {
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: 'AIzaSyBHU_t5ghSJuvbZaodwfkKo02_lWcBoH-Y',
        authDomain: 'events-near-us.firebaseapp.com',
        projectId: 'events-near-us',
        storageBucket: 'events-near-us.appspot.com',
        messagingSenderId: '641981748914',
        appId: '1:641981748914:web:ec753d2ba7c16d4df3dbab',
        measurementId: 'G-7KVN8NGT89',
      });

      firebase.firestore().settings({ ignoreUndefinedProperties: true });

      if (/localhost:/.exec(location.host)) {
        firebase.functions().useEmulator('localhost', 5001);
      }
    }
  });
});
