// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxT0pit9owv7HJZhy4XTpW0dfeQN9zNE0",
  authDomain: "stella-e8c71.firebaseapp.com",
  projectId: "stella-e8c71",
  storageBucket: "stella-e8c71.firebasestorage.app",
  messagingSenderId: "968853138647",
  appId: "1:968853138647:web:e180efeb0b00ebf9a0d492",
  measurementId: "G-1JY0Y2B525",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);

export { firebaseApp };
