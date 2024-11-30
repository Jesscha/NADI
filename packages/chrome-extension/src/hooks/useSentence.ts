import { useState, useEffect } from "react";
import { getDocs, collection, DocumentData } from "firebase/firestore";
import { db } from "../firebase";
import { sentenceAtom } from "../atoms";
import { useAtom } from "jotai";

function useSentence() {
  const [sentences, setSentences] = useState<DocumentData[]>([]);
  const [selectedSentence, setSelectedSentence] = useAtom(sentenceAtom);

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
        } while (randomDoc.id === selectedSentence?.id);
        setSelectedSentence(randomDoc);
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
      } while (randomDoc.id === selectedSentence?.id);
      setSelectedSentence(randomDoc);
    }
  };

  return { refreshRandom, selectedSentence };
}

export default useSentence;
