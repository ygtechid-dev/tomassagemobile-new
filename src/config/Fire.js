import { getStorage, ref } from '@firebase/storage';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/storage'
const config= {

//Simulasi

apiKey: "AIzaSyATe9-_d_hBtSCFtG3BI9-15ORcLdQqbpI",

authDomain: "ladjurepair.firebaseapp.com",

projectId: "ladjurepair",

storageBucket: "ladjurepair.firebasestorage.app",

messagingSenderId: "296950821808",

appId: "1:296950821808:web:0692eba323082148dbdc75",
databaseURL: "https://ladjurepair-default-rtdb.asia-southeast1.firebasedatabase.app/",


}




const Fire = !firebase.apps.length ? firebase.initializeApp(config) : firebase.app();
export const storage = getStorage(Fire)


export default Fire;