import { useState, useEffect } from "react";
import {
  getDocs,
  collection,
  query,
  where,
  Firestore,
} from "firebase/firestore";
import { db } from "../firebase";
import { sentenceAtom } from "../atoms";
import { useAtom } from "jotai";
import { Likes, SentenceWidthIdAndLikes } from "../type";

const fetchSentences = async (db: Firestore) => {
  try {
    const querySnapshot = await getDocs(collection(db, "sentences"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching sentences:", error);
    return [];
  }
};

const fetchUserLikedSentences = async (
  db: Firestore,
  userId: string
): Promise<Likes> => {
  try {
    const q = query(collection(db, "likes"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const likedSentences = querySnapshot.docs.map(
      (doc) => doc.data().likedSentences
    );
    return likedSentences[0] || {};
  } catch (error) {
    console.error("Error fetching liked sentences:", error);
    return {};
  }
};

function useSentence(userId?: string) {
  const [sentences, setSentences] = useState<SentenceWidthIdAndLikes[]>([]);
  const [selectedSentence, setSelectedSentence] = useAtom(sentenceAtom);

  useEffect(() => {
    if (!userId) return;

    const updateSentences = async () => {
      try {
        const [fetchedSentences, likedSentences] = await Promise.all([
          fetchSentences(db),
          fetchUserLikedSentences(db, userId),
        ]);

        console.log(fetchedSentences);
        console.log(likedSentences);

        const sentencesWithLikes = fetchedSentences.map((sentence) => ({
          ...sentence,
          likeCount: likedSentences[sentence.id] || 0,
        })) as SentenceWidthIdAndLikes[];

        setSentences(sentencesWithLikes);

        // Select a new random sentence if none is selected
        if (!selectedSentence && sentencesWithLikes.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * sentencesWithLikes.length
          );
          setSelectedSentence(sentencesWithLikes[randomIndex]);
        }
      } catch (error) {
        console.error("Error updating sentences:", error);
      }
    };

    // Initial fetch
    updateSentences();

    // Set up interval for periodic updates
    const intervalId = setInterval(updateSentences, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(intervalId);
  }, [userId, selectedSentence, setSelectedSentence]);

  const refreshRandom = () => {
    if (sentences.length > 0) {
      const randomIndex = Math.floor(Math.random() * sentences.length);
      const randomDoc = sentences[randomIndex];

      setSelectedSentence(randomDoc);
    }
  };

  return { refreshRandom, selectedSentence };
}

export default useSentence;
