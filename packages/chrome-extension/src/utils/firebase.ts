import {
  Likes,
  SentenceBase,
  UserLikes,
  SentenceWithLikeInfo,
  SentenceWidthIdAndLikes,
} from "../type";
import {
  collection,
  documentId,
  getDocs,
  query,
  where,
  doc,
  runTransaction,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export const fetchAllSentences = async (): Promise<SentenceBase[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "sentences"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SentenceBase[];
  } catch (error) {
    console.error("Error fetching sentences:", error);
    return [];
  }
};

export const fetchAllLikes = async (): Promise<UserLikes[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "likes"));
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
    })) as UserLikes[];
  } catch (error) {
    console.error("Error fetching likes:", error);
    return [];
  }
};

export const fetchUserLikedSentences = async (
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
      myLikedCount: data.likedSentences[doc.id],
    })) as SentenceWidthIdAndLikes[];
  }
  return [];
}

export async function getUserAuthoredCandidateSentences(userId: string) {
  const q_candidates = query(
    collection(db, "sentences_candidates"),
    where("authorId", "==", userId)
  );
  const querySnapshot_candidates = await getDocs(q_candidates);
  const sentencesCandidates = querySnapshot_candidates.docs.map((doc) => ({
    id: doc.id,
    authorId: doc.data().authorId,
    content: doc.data().content,
  })) as Pick<SentenceWithLikeInfo, "id" | "authorId" | "content">[];

  return sentencesCandidates;
}

export async function likeSentence(sentenceId: string, userId: string) {
  const likesRef = doc(db, "likes", userId);
  await runTransaction(db, async (transaction) => {
    const docSnapshot = await transaction.get(likesRef);
    let data = {} as {
      userId: string;
      likedSentences: {
        [sentenceId: string]: number;
      };
    };

    if (!docSnapshot.exists()) {
      transaction.set(likesRef, {
        userId,
        likedSentences: {},
      });
      data = {
        userId,
        likedSentences: {},
      };
    } else {
      data = docSnapshot.data() as {
        userId: string;
        likedSentences: {
          [sentenceId: string]: number;
        };
      };
    }
    data.likedSentences[sentenceId] =
      (data.likedSentences[sentenceId] || 0) + 1;

    transaction.update(likesRef, data);
  });
}

export async function uploadSentence(content: string, authorId: string) {
  return addDoc(collection(db, "sentences_candidates"), {
    content: content,
    authorId: authorId,
  }).then((docRef) => {
    return docRef.id; 
  });
}
