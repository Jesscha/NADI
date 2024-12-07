import { useState } from "react";
import Modal from "./common/Modal";
import { useSetAtom } from "jotai";
import { sentenceAtom } from "../atoms";

import { useDashboard } from "../hooks/useDashboard";

export const DashboardModalButton = ({
  moveScroll,
}: {
  moveScroll: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const setSelectedSentence = useSetAtom(sentenceAtom);
  const { likedSentences, mySentences } = useDashboard();
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
