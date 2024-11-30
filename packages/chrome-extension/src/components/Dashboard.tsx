import { useEffect, useState } from "react";
import Modal from "./common/Modal";
import { useAtomValue, useSetAtom } from "jotai";
import { sentenceAtom, userIdAtom } from "../atoms";
import {
  DocumentData,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { DEV_USER_ID } from "../constants";

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
  return sentences;
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

  return [...sentences, ...sentencesCandidates];
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
    if (isOpen) {
      getLikedSentencesByUser(userId?.userId || DEV_USER_ID).then(
        (sentences) => {
          setLikedSentences(sentences);
        }
      );
      getMySentencesByUser(userId?.userId || DEV_USER_ID).then((sentences) => {
        setMySentences(sentences);
      });
    }
  }, [isOpen, userId]);

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
                    Liked by {sentence.likedBy.length} people, {sentence.likes}{" "}
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
