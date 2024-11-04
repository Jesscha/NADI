import {
  collection,
  addDoc,
  getDoc,
  doc,
  runTransaction,
  query,
  where,
  getDocs,
  arrayUnion,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Typer } from "./components/Typer";
import { db } from "./firebase";
import useRandomSentence from "./hooks/useRandomSentence";
import Writer from "./components/Writer";

function uploadSentence(content: string, authorId: string) {
  return addDoc(collection(db, "sentences"), {
    content: content,
    authorId: authorId,
    likes: 0, // 좋아요 수
  }).then((docRef) => {
    console.log("Document written with ID: ", docRef.id);
    return docRef.id; // 새 문장 ID 반환
  });
}

function getSentence(sentenceId: string) {
  return getDoc(doc(db, "sentences", sentenceId)).then((doc) => {
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
      likedBy: arrayUnion(userId), // Add userId to likedBy array
    });
  });
  console.log("Like added!");
}

function getLikes(sentenceId: string) {
  return getDoc(doc(db, "sentences", sentenceId)).then((doc) => {
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
    timestamp: new Date(),
  });
  console.log("Like record added!");
}

async function getSentencesByUser(userId: string) {
  const q = query(collection(db, "sentences"), where("authorId", "==", userId));
  const querySnapshot = await getDocs(q);
  const sentences = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  console.log("Sentences by user:", sentences);
  return sentences;
}

async function getLikedSentencesByUser(userId: string) {
  const q = query(
    collection(db, "sentences"),
    where("likedBy", "array-contains", userId)
  );
  const querySnapshot = await getDocs(q);
  const sentences = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  console.log("Sentences liked by user:", sentences);
  return sentences;
}

function App() {
  const [authData, setAuthData] = useState<any>(null);
  const { refreshRandom, randomSentence } = useRandomSentence();

  const [userInput, setUserInput] = useState<string>("");

  useEffect(() => {
    // Listen for messages from the background script
    chrome?.runtime?.onMessage?.addListener(
      async (message, sender, sendResponse) => {
        if (message.type === "auth-success") {
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
      }
    );
  }, []);

  const handleFirebaseAuth = () => {
    chrome.runtime.sendMessage(
      { type: "trigger-firebase-auth" },
      (response) => {
        console.log("Response from background:", response);
      }
    );
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

  const like = () => {
    if (randomSentence?.id) {
      likeSentence(randomSentence.id, "1111");
    }
  };

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide ">
      <div className="snap-start h-screen bg-gray-700 flex justify-center items-center">
        <Typer
          onNextText={refreshRandom}
          originalText={randomSentence?.content || ""}
          like={like}
        />
      </div>
      <div className="snap-start h-screen bg-gray-900 flex justify-center items-center">
        <Writer />
      </div>
    </div>
  );
}

export default App;
