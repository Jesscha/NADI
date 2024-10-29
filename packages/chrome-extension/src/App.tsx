import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDoc, doc, runTransaction, query, where, getDocs, updateDoc, arrayUnion } from "firebase/firestore";
import React, { useEffect, useState } from 'react';
import { Typer } from "./components/Typer";


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
  const [likes, setLikes] = useState<number | null>(null);
  const [randomSentence, setRandomSentence] = useState<string | null>(null);
  const [randomSentenceId, setRandomSentenceId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<string>("");

  useEffect(() => {
    // Listen for messages from the background script
    chrome?.runtime?.onMessage?.addListener(async (message, sender, sendResponse) => {
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
    if (authData?.user && userInput.trim()) {
      await uploadSentence(userInput, authData.user.uid);
      setUserInput(""); // Clear the input after uploading
    } else {
      console.log("User is not authenticated or input is empty.");
    }
  };

  const handleGetLikedSentencesByUser = async () => {
    if (authData?.user) {
      const sentences = await getLikedSentencesByUser(authData.user.uid);
      console.log("Sentences liked by user:", sentences);
    }
  };

  const fetchRandomSentence = async () => {
    const sentences = await getDocs(collection(db, "sentences"));
    const randomIndex = Math.floor(Math.random() * sentences.docs.length);
    const randomDoc = sentences.docs[randomIndex];
    setRandomSentence(randomDoc.data().content);
    setRandomSentenceId(randomDoc.id);
  };

  const handleUserInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
  };

  const handleSubmitInput = async () => {
    if (userInput === randomSentence && randomSentenceId && authData?.user) {
      const updatedLikes = await getLikes(randomSentenceId);
      setLikes(updatedLikes);
      console.log("Correct input! Likes for the sentence:", updatedLikes);
    } else {
      console.log("Incorrect input. Try again.");
    }
  };

  return (
    <div>
      <h1>Welcome</h1>
      {authData?.user ? (
        <p>User: {authData.user.displayName || "Anonymous"}</p>
      ) : (
        <p>No user authenticated.</p>
      )}
      <button onClick={handleFirebaseAuth}>Authenticate with Firebase</button>
      <input
        type="text"
        value={userInput}
        onChange={handleUserInput}
        placeholder="Write your sentence here"
      />
      <button onClick={handleUploadSentence}>Upload Sentence</button>
      <button onClick={handleGetLikedSentencesByUser}>Get Liked Sentences</button>
      <button onClick={fetchRandomSentence}>Show Random Sentence</button>
      {randomSentence && (
        <div>
          <p>Type this sentence: {randomSentence}</p>
          <input type="text" value={userInput} onChange={handleUserInput} />
          <button onClick={handleSubmitInput}>Submit</button>
        </div>
      )}
      {likes !== null && <p>Likes: {likes}</p>}
      <Typer />
    </div>
  );
}

export default App;
