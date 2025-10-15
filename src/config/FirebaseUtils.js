import firebase from '@react-native-firebase/app';
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "@firebase/storage";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDR13dzlo4tZNpHIYLaOcSmIgSVvu-pWXE",
    authDomain: "axiroo-staging.firebaseapp.com",
    databaseURL : "https://axiroo-staging-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "axiroo-staging",
    
    storageBucket: "gs://axiroo-staging.appspot.com",
    messagingSenderId: "209621665667",
    appId: "1:209621665667:web:78f0ddb49ce1611656d8b6"
};

const app = initializeApp(firebaseConfig);
const Fires = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
const db = getFirestore(app);
const auth = getAuth(app);
const storages = getStorage(Fires)

export { db, auth, storages };