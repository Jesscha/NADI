import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDoc, doc, runTransaction } from "firebase/firestore";
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

function uploadSentence(content: string, authorId: string) {
  return addDoc(collection(db, "sentences"), {
    content: content,
    authorId: authorId,
    sharedWith: [],  // 공유될 유저 리스트
    likes: 0         // 좋아요 수
  }).then(docRef => {
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;  // 새 문장 ID 반환
  });
}

function getSentence(sentenceId: string) {
  return getDoc(doc(db, "sentences", sentenceId)).then(doc => {
    if (doc.exists()) {
      console.log("Sentence data:", doc.data());
      return doc.data();
    } else {
      console.log("No such document!");
    }
  });
}

function likeSentence(sentenceId: string) {
  const sentenceRef = doc(db, "sentences", sentenceId);

  return runTransaction(db, transaction => {
    return transaction.get(sentenceRef).then(doc => {
      if (!doc.exists) {
        throw "Document does not exist!";
      }
      // 좋아요 수 증가
      const newLikes = (doc.data()?.likes || 0) + 1;
      transaction.update(sentenceRef, { likes: newLikes });
    });
  }).then(() => {
    console.log("Like added!");
  }).catch(error => {
    console.error("Transaction failed: ", error);
  });
}


function getLikes(sentenceId: string) {
  return getDoc(doc(db, "sentences", sentenceId)).then(doc => {
    if (doc.exists()) {
      console.log("Likes:", doc.data().likes);
      return doc.data().likes;
    } else {
      console.log("No such document!");
    }
  });
}

navigator.serviceWorker.ready.then((registration) => {
  registration!.active!.postMessage(
    "Test message sent immediately after creation",
  );
});
const SERVICE_WORKER = globalThis?.navigator?.serviceWorker || null;


function App() {
  const [authData, setAuthData] = useState<any>(null);
  const [sentenceId, setSentenceId] = useState<string | null>(null);
  const [likes, setLikes] = useState<number | null>(null);

  useEffect(() => {
    // Listen for messages from the background script
    console.log("listening for auth messages...")
    chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
      if (message.type === 'auth-success') {
        setAuthData(message.authData);
        console.log('Received auth data:', message.authData);

        if (message.authData.user) {
          try {
           
            
          } catch (e) {
            console.error("Error adding document: ", e);
          }
        } else {
          console.log("User is not authenticated. Cannot add document.");
        }
      }
    });
  }, []);

  const handleFirebaseAuth = () => {
    // SERVICE_WORKER?.controller?.postMessage({
    //   topic: "getSecretKey",
    // });
    console.log("triggering firebase auth...")
    chrome.runtime.sendMessage({ type: 'trigger-firebase-auth' }, (response) => {
      console.log('Response from background:', response);
    });
  };

  const handleUploadSentence = async () => {
    if (authData?.user) {
      const id = await uploadSentence("Hello World", authData.user.uid);
      setSentenceId(id);
    }
  };

  const handleGetSentence = async () => {
    if (sentenceId) {
      const data = await getSentence(sentenceId);
      console.log("Fetched sentence:", data);
    }
  };

  const handleLikeSentence = async () => {
    if (sentenceId) {
      await likeSentence(sentenceId);
      const updatedLikes = await getLikes(sentenceId);
      setLikes(updatedLikes);
    }
  };

  return (
    <div>
      <h1>Firebase Auth Data</h1>
      {authData ? (
        <pre>{JSON.stringify(authData, null, 2)}</pre>
      ) : (
        <p>No auth data received yet.</p>
      )}
      <button onClick={handleFirebaseAuth}>Authenticate with Firebase</button>
      <button onClick={handleUploadSentence}>Upload Sentence</button>
      <button onClick={handleGetSentence}>Get Sentence</button>
      <button onClick={handleLikeSentence}>Like Sentence</button>
      {likes !== null && <p>Likes: {likes}</p>}
    </div>
  );
}

export default App;
