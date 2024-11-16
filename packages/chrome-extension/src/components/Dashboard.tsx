import { useEffect, useState } from "react";
import Modal from "./common/Modal";
import { useAtomValue } from "jotai";
import { userIdAtom } from "../atoms";
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
  console.log("Sentences liked by user:", sentences);
  return sentences;
}

async function getMySentencesByUser(userId: string) {
  const q = query(collection(db, "sentences"), where("authorId", "==", userId));
  const querySnapshot = await getDocs(q);
  const sentences = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  console.log("Sentences written by user:", sentences);
  return sentences;
}

export const DashboardModalButton = () => {
  const userId = useAtomValue(userIdAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [likedSentences, setLikedSentences] = useState<DocumentData[]>([]);
  const [mySentences, setMySentences] = useState<DocumentData[]>([]);

  useEffect(() => {
    if (isOpen) {
      getLikedSentencesByUser(userId || DEV_USER_ID).then((sentences) => {
        setLikedSentences(sentences);
      });
      getMySentencesByUser(userId || DEV_USER_ID).then((sentences) => {
        console.log("My sentences:", sentences);
        setMySentences(sentences);
      });
    }
  }, [isOpen, userId]);

  return (
    <div>
      <button
        className="font-mono p-[8px] text-gray-500 text-xl cursor-pointer rotate-90"
        onClick={() => setIsOpen(true)}
      >
        M
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="w-full h-full bg-gray-100 p-6">
          <h2 className="text-2xl font-bold mb-4">Liked Sentences</h2>
          <div className="mb-8">
            {likedSentences.length > 0 ? (
              likedSentences.map((sentence) => (
                <div
                  key={sentence.id}
                  className="bg-white p-4 mb-2 rounded shadow-md"
                >
                  <p>{sentence.content}</p>

                  <p className="text-sm text-gray-500">
                    Liked {sentence.likesByUser[userId || DEV_USER_ID] || 0}{" "}
                    times
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No liked sentences found.</p>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-4">My Sentences</h2>
          <div>
            {mySentences.length > 0 ? (
              mySentences.map((sentence) => (
                <div
                  key={sentence.id}
                  className="bg-white p-4 mb-2 rounded shadow-md"
                >
                  <p>{sentence.content}</p>
                  <p className="text-sm text-gray-500">
                    Liked by {sentence.likedBy.length} people, {sentence.likes}{" "}
                    times in total
                  </p>
                </div>
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
