import { useEffect, useState } from "react";
import Modal from "./common/Modal";
import { useAtomValue, useSetAtom } from "jotai";
import { sentenceAtom, userIdAtom } from "../atoms";
import {
  DocumentData,
  collection,
  documentId,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { DEV_USER_ID } from "../constants";

async function getLikedSentencesByUser(userId: string) {
  const q = query(collection(db, "likes"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const data = querySnapshot.docs[0].data();
    const likedSentenses = Object.keys(data.likedSentences);
    const sentenseQ = query(
      collection(db, "sentences"),
      where(documentId(), "in", likedSentenses)
    );

    const sentenseQuerySnapshot = await getDocs(sentenseQ);

    return sentenseQuerySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      likes: data.likedSentences[doc.id],
    }));
  }
  return [];
}

async function getMySentencesByUser(userId: string) {
  const q_candidates = query(
    collection(db, "sentences_candidates"),
    where("authorId", "==", userId)
  );
  const querySnapshot_candidates = await getDocs(q_candidates);
  const sentencesCandidates = querySnapshot_candidates.docs.map((doc) => ({
    id: doc.id,
    isCandidate: true,
    ...doc.data(),
  }));

  const q = query(collection(db, "sentences"), where("authorId", "==", userId));
  const querySnapshot = await getDocs(q);
  const sentences = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Fetch all likes
  const likesSnapshot = await getDocs(collection(db, "likes"));
  const likesData = likesSnapshot.docs.reduce((acc, doc) => {
    const data = doc.data();
    Object.keys(data.likedSentences).forEach((sentenceId) => {
      if (!acc[sentenceId]) {
        acc[sentenceId] = {
          totalLikes: 0,
          likedByCount: 0,
        };
      }
      acc[sentenceId].totalLikes += data.likedSentences[sentenceId];
      acc[sentenceId].likedByCount += 1; // Increment unique users count
    });
    return acc;
  }, {} as { [key: string]: { totalLikes: number; likedByCount: number } });

  // Update the mapping to include both metrics
  const sentencesWithLikes = sentences.map((sentence) => ({
    ...sentence,
    likes: likesData[sentence.id]?.totalLikes || 0,
    likedByCount: likesData[sentence.id]?.likedByCount || 0,
  }));

  const sentencesCandidatesWithLikes = sentencesCandidates.map((sentence) => ({
    ...sentence,
    likes: likesData[sentence.id]?.totalLikes || 0,
    likedByCount: likesData[sentence.id]?.likedByCount || 0,
  }));

  return [...sentencesWithLikes, ...sentencesCandidatesWithLikes];
}

export const DashboardModalButton = ({
  moveScroll,
}: {
  moveScroll: () => void;
}) => {
  const userId = useAtomValue(userIdAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [likedSentences, setLikedSentences] = useState<DocumentData[]>([]);
  const [mySentences, setMySentences] = useState<DocumentData[]>([]);
  const setSelectedSentence = useSetAtom(sentenceAtom);

  useEffect(() => {
    getLikedSentencesByUser(userId?.userId || DEV_USER_ID).then((sentences) => {
      setLikedSentences(sentences);
    });
    getMySentencesByUser(userId?.userId || DEV_USER_ID).then((sentences) => {
      setMySentences(sentences);
    });
  }, [userId, isOpen]);

  return (
    <div>
      <button
        className="font-mono p-[8px] text-gray-500 text-xl cursor-pointer rotate-90 focus:outline-none"
        onClick={() => setIsOpen(true)}
      >
        M
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="w-full h-full bg-gray-100 p-6 relative overflow-auto">
          <button
            className="text-gray-500 absolute top-[16px] right-[16px] text-[12px]"
            onClick={() => setIsOpen(false)}
          >
            Close(ESC)
          </button>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold mb-4">Liked Sentences</h2>
          </div>
          <div className="mb-8">
            {likedSentences.length > 0 ? (
              likedSentences.map((sentence) => (
                <button
                  key={sentence.id}
                  className="bg-white p-4 mb-2 rounded shadow-md w-full text-start"
                  onClick={() => {
                    moveScroll();
                    setIsOpen(false);
                    setSelectedSentence(sentence);
                  }}
                >
                  <p>{sentence.content}</p>

                  <p className="text-sm text-gray-500">
                    Liked{" "}
                    {sentence.likesByUser[userId?.userId || DEV_USER_ID] || 0}{" "}
                    times
                  </p>
                </button>
              ))
            ) : (
              <p className="text-gray-500">No liked sentences found.</p>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-4">My Sentences</h2>
          <div>
            {mySentences.length > 0 ? (
              mySentences.map((sentence) => (
                <button
                  key={sentence.id}
                  className="bg-white p-4 mb-2 rounded shadow-md w-full text-start"
                  onClick={() => {
                    moveScroll();
                    setIsOpen(false);
                    setSelectedSentence(sentence);
                  }}
                >
                  <p>{sentence.content}</p>
                  <p className="text-sm text-gray-500">
                    Liked by {sentence.likedByCount} people, {sentence.likes}{" "}
                    times in total
                  </p>
                  {sentence.isCandidate && (
                    <p className="text-sm text-gray-500">
                      (waiting to be published)
                    </p>
                  )}
                </button>
              ))
            ) : (
              <p className="text-gray-500">No sentences written by you.</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
