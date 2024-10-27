import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import React, { useEffect, useState } from 'react';


export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};


 
const app = initializeApp(firebaseConfig);

console.log(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
console.log(db);
 

function App() {
  const [authData, setAuthData] = useState(null);

  useEffect(() => {
    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
        if (message.type === 'auth-success') {
            setAuthData(message.authData);
            // You can now use authData to post to Firebase
            console.log('Received auth data:', message.authData);

            if (message.authData.user) { // Check if authData is present
              try {
                const docRef = await addDoc(collection(db, "users"), {
                  first: "Ada",
                  last: "Lovelace",
                  born: 1815,
                  userId: message.authData.user.uid // Assuming authData contains a user ID
                });
                console.log("Document written with ID: ", docRef.id);
              } catch (e) {
                console.error("Error adding document: ", e);
              }
            } else {
              console.log("User is not authenticated. Cannot add document.");
            }
        }
    });
}, []);

  return (
    <div>
    <h1>Firebase Auth Data</h1>
    {authData ? (
        <pre>{JSON.stringify(authData, null, 2)}</pre>
    ) : (
        <p>No auth data received yet.</p>
    )}
</div>
  );
}

export default App;
