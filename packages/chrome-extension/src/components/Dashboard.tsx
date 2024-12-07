import { useEffect, useState } from "react";
import Modal from "./common/Modal";
import { useAtomValue, useSetAtom } from "jotai";
import { sentenceAtom, userIdAtom } from "../atoms";
import {
  collection,
  documentId,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { DEV_USER_ID } from "../constants";
import { MySentence, SentenceWidthIdAndLikes } from "../type";

async function getLikedSentencesByUser(userId: string) {
  const q = query(collection(db, "likes"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const data = querySnapshot.docs[0].data();
    const likedSentences = Object.keys(data.likedSentences);
    console.log(likedSentences);
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

async function getMySentencesByUser(userId: string) {
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

export const DashboardModalButton = ({
  moveScroll,
}: {
  moveScroll: () => void;
}) => {
  const userId = useAtomValue(userIdAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [likedSentences, setLikedSentences] = useState<
    SentenceWidthIdAndLikes[]
  >([]);
  const [mySentences, setMySentences] = useState<MySentence[]>([]);
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
                    Liked {sentence.likeCount || 0} times
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
                <div
                  key={sentence.id}
                  className="bg-white p-4 mb-2 rounded shadow-md w-full text-start"
                  // onClick={() => {
                  //   moveScroll();
                  //   setIsOpen(false);
                  //   setSelectedSentence({
                  //     id: sentence.id,
                  //     authorId: sentence.authorId,
                  //     content: sentence.content,
                  //     likeCount: 0,
                  //   });
                  // }}
                >
                  <p>{sentence.content}</p>
                  <p className="text-sm text-gray-500">
                    Liked by {sentence.likeUserCount} people,{" "}
                    {sentence.totalLikesCount} times in total
                  </p>
                  {sentence.isCandidate && (
                    <p className="text-sm text-gray-500">
                      (waiting to be published)
                    </p>
                  )}
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
