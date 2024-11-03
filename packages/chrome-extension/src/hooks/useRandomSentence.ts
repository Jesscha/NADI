import { useState, useEffect } from "react";
import { getDocs, collection, DocumentData } from "firebase/firestore";
import { db } from "../firebase";

function useRandomSentence() {
  const [sentences, setSentences] = useState<DocumentData[]>([]);
  const [randomSentence, setRandomSentence] = useState<DocumentData | null>(
    null
  );

  useEffect(() => {
    const fetchSentences = async () => {
      const querySnapshot = await getDocs(collection(db, "sentences"));
      const fetchedSentences = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSentences(fetchedSentences);
      selectRandomSentence(fetchedSentences);
    };

    const selectRandomSentence = (sentences: DocumentData[]) => {
      if (sentences.length > 0) {
        let randomIndex;
        let randomDoc;
        do {
          randomIndex = Math.floor(Math.random() * sentences.length);
          randomDoc = sentences[randomIndex];
        } while (randomDoc.id === randomSentence?.id);
        console.log("randomDoc", randomDoc);
        setRandomSentence(randomDoc);
      }
    };

    fetchSentences();

    const intervalId = setInterval(() => {
      fetchSentences();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(intervalId);
  }, []);

  const refreshRandom = () => {
    if (sentences.length > 0) {
      let randomIndex;
      let randomDoc;
      do {
        randomIndex = Math.floor(Math.random() * sentences.length);
        randomDoc = sentences[randomIndex];
      } while (randomDoc.id === randomSentence?.id);
      setRandomSentence(randomDoc);
    }
  };

  return { refreshRandom, randomSentence };
}

export default useRandomSentence;
