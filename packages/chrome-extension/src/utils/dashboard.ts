import {
  collection,
  documentId,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

import { MySentence, SentenceWidthIdAndLikes } from "../type";

export async function getLikedSentencesByUser(userId: string) {
  const q = query(collection(db, "likes"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const data = querySnapshot.docs[0].data();
    const likedSentences = Object.keys(data.likedSentences);
    const sentenceQ = query(
      collection(db, "sentences"),
      where(documentId(), "in", likedSentences)
    );

    const sentenceQuerySnapshot = await getDocs(sentenceQ);

    return sentenceQuerySnapshot.docs.map((doc) => ({
      id: doc.id,
      authorId: doc.data().authorId,
      content: doc.data().content,
      likeCount: data.likedSentences[doc.id],
    })) as SentenceWidthIdAndLikes[];
  }
  return [];
}

export async function getMySentencesByUser(userId: string) {
  const q_candidates = query(
    collection(db, "sentences_candidates"),
    where("authorId", "==", userId)
  );
  const querySnapshot_candidates = await getDocs(q_candidates);
  const sentencesCandidates = querySnapshot_candidates.docs.map((doc) => ({
    id: doc.id,
    isCandidate: true,
    authorId: doc.data().authorId,
    content: doc.data().content,
  })) as Pick<MySentence, "id" | "isCandidate" | "authorId" | "content">[];

  const q = query(collection(db, "sentences"), where("authorId", "==", userId));
  const querySnapshot = await getDocs(q);
  const sentences = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    authorId: doc.data().authorId,
    content: doc.data().content,
  })) as Pick<MySentence, "id" | "authorId" | "content">[];

  // Fetch all likes
  const likesSnapshot = await getDocs(collection(db, "likes"));
  const likesData = likesSnapshot.docs.reduce((acc, doc) => {
    const data = doc.data();
    Object.keys(data.likedSentences).forEach((sentenceId) => {
      if (!acc[sentenceId]) {
        acc[sentenceId] = {
          totalLikesCount: 0,
          likeUserCount: 0,
        };
      }
      acc[sentenceId].totalLikesCount += data.likedSentences[sentenceId];
      acc[sentenceId].likeUserCount += 1; // Increment unique users count
    });
    return acc;
  }, {} as { [key: string]: { totalLikesCount: number; likeUserCount: number } });

  // Update the mapping to include both metrics
  const sentencesWithLikes = sentences.map((sentence) => ({
    ...sentence,
    totalLikesCount: likesData[sentence.id]?.totalLikesCount || 0,
    likeUserCount: likesData[sentence.id]?.likeUserCount || 0,
  }));

  const sentencesCandidatesWithLikes = sentencesCandidates.map((sentence) => ({
    ...sentence,
    totalLikesCount: likesData[sentence.id]?.totalLikesCount || 0,
    likeUserCount: likesData[sentence.id]?.likeUserCount || 0,
  }));

  return [
    ...sentencesWithLikes,
    ...sentencesCandidatesWithLikes,
  ] as MySentence[];
}
