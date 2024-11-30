import React, { useState, useEffect } from "react";
import {
  DocumentData,
  addDoc,
  collection,
  getDocs,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";

const auth = getAuth();
const provider = new GoogleAuthProvider();

// Function to fetch candidate sentences
const queryCandidateSentence = async () => {
  const q_candidates = query(collection(db, "sentences_candidates"));
  const querySnapshot_candidates = await getDocs(q_candidates);
  return querySnapshot_candidates.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Function to upload a sentence
const uploadSentence = async (content: DocumentData) => {
  await addDoc(collection(db, "sentences"), {
    ...content,
  });
};

// Function to delete a sentence
const deleteSentence = async (id: string) => {
  const docRef = doc(db, "sentences_candidates", id);
  await deleteDoc(docRef);
};

export const App = () => {
  const [candidates, setCandidates] = useState<DocumentData[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchCandidates = async () => {
        const data = await queryCandidateSentence();
        setCandidates(data);
      };
      fetchCandidates();
    }
  }, [user]);

  const handleSelect = (id: string) => {
    setSelected((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };

  const handleUpload = async () => {
    const uploadedIds = new Set<string>();
    for (const id of selected) {
      const sentence = candidates.find((candidate) => candidate.id === id);
      if (sentence) {
        await uploadSentence(sentence);
        await deleteSentence(id); // Delete the sentence after uploading
        uploadedIds.add(id);
      }
    }
    // Remove uploaded sentences from candidates
    setCandidates((prevCandidates) =>
      prevCandidates.filter((candidate) => !uploadedIds.has(candidate.id))
    );
    setSelected(new Set()); // Clear selection after upload
    setShowConfirm(false); // Close confirmation dialog
  };

  const handleConfirm = () => {
    setShowConfirm(true);
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  return (
    <div>
      {!user ? (
        <button onClick={handleLogin}>Login with Google</button>
      ) : (
        <>
          <button onClick={handleLogout}>Logout</button>
          <h1>Candidate Sentences</h1>
          <ul>
            {candidates.map((candidate) => (
              <li key={candidate.id}>
                <input
                  type="checkbox"
                  checked={selected.has(candidate.id)}
                  onChange={() => handleSelect(candidate.id)}
                />
                {candidate.content}
              </li>
            ))}
          </ul>
          <button onClick={handleConfirm} disabled={selected.size === 0}>
            Upload Selected Sentences
          </button>

          {showConfirm && (
            <div className="confirmation-dialog">
              <p>Are you sure you want to upload the selected sentences?</p>
              <button onClick={handleUpload}>Yes</button>
              <button onClick={() => setShowConfirm(false)}>No</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
