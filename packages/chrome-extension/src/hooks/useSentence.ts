import { useEffect } from "react";
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
import useSWR from "swr";

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
  const [selectedSentence, setSelectedSentence] = useAtom(sentenceAtom);

  const { data: sentences = [] } = useSWR(
    userId ? ["sentences", userId] : null,
    async () => {
      const [fetchedSentences, likedSentences] = await Promise.all([
        fetchSentences(db),
        fetchUserLikedSentences(db, userId || ""),
      ]);

      return fetchedSentences.map((sentence) => ({
        ...sentence,
        likeCount: likedSentences[sentence.id] || 0,
      })) as SentenceWidthIdAndLikes[];
    },
    {
      refreshInterval: 30 * 60 * 1000, // 30 minutes
    }
  );

  useEffect(() => {
    if (!selectedSentence && sentences.length > 0) {
      const randomIndex = Math.floor(Math.random() * sentences.length);
      setSelectedSentence(sentences[randomIndex]);
    }
  }, [sentences, selectedSentence, setSelectedSentence]);

  const refreshRandom = () => {
    if (sentences.length > 0) {
      const randomIndex = Math.floor(Math.random() * sentences.length);
      setSelectedSentence(sentences[randomIndex]);
    }
  };

  return { refreshRandom, selectedSentence };
}

export default useSentence;
