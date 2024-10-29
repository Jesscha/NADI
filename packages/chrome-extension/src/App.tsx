import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDoc, doc, runTransaction, query, where, getDocs, updateDoc, arrayUnion } from "firebase/firestore";
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

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);


function uploadSentence(content: string, authorId: string) {
  return addDoc(collection(db, "sentences"), {
    content: content,
    authorId: authorId,
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

async function likeSentence(sentenceId: string, userId: string) {
  const sentenceRef = doc(db, "sentences", sentenceId);

  await runTransaction(db, async (transaction) => {
    const docSnapshot = await transaction.get(sentenceRef);
    if (!docSnapshot.exists()) {
      throw "Document does not exist!";
    }
    const newLikes = (docSnapshot.data()?.likes || 0) + 1;
    transaction.update(sentenceRef, { 
      likes: newLikes,
      likedBy: arrayUnion(userId)  // Add userId to likedBy array
    });
  });
  console.log("Like added!");
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

async function addLikeRecord(sentenceId: string, userId: string) {
  await addDoc(collection(db, "likes"), {
    sentenceId: sentenceId,
    userId: userId,
    timestamp: new Date()
  });
  console.log("Like record added!");
}


async function getSentencesByUser(userId: string) {
  const q = query(collection(db, "sentences"), where("authorId", "==", userId));
  const querySnapshot = await getDocs(q);
  const sentences = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log("Sentences by user:", sentences);
  return sentences;
}

async function getLikedSentencesByUser(userId: string) {
  const q = query(collection(db, "sentences"), where("likedBy", "array-contains", userId));
  const querySnapshot = await getDocs(q);
  const sentences = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log("Sentences liked by user:", sentences);
  return sentences;
}

function App() {
  const [authData, setAuthData] = useState<any>(null);
  const [sentenceId, setSentenceId] = useState<string | null>(null);
  const [likes, setLikes] = useState<number | null>(null);

  useEffect(() => {
    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
      if (message.type === 'auth-success') {
        setAuthData(message.authData);
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
    if (sentenceId && authData?.user) {
      await likeSentence(sentenceId, authData.user.uid);
      await addLikeRecord(sentenceId, authData.user.uid);
      const updatedLikes = await getLikes(sentenceId);
      setLikes(updatedLikes);
    }
  };

  const handleGetSentencesByUser = async () => {
    if (authData?.user) {
      const sentences = await getSentencesByUser(authData.user.uid);
      console.log("Sentences by user:", sentences);
    }
  };

  const handleGetLikedSentencesByUser = async () => {
    if (authData?.user) {
      const sentences = await getLikedSentencesByUser(authData.user.uid);
      console.log("Sentences liked by user:", sentences);
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
      <button onClick={handleGetSentencesByUser}>Get My Sentences</button>
      <button onClick={handleGetLikedSentencesByUser}>Get Liked Sentences</button>
      {likes !== null && <p>Likes: {likes}</p>}
    </div>
  );
}

export default App;
