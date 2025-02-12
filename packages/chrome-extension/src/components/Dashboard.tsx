import { useState } from "react";
import Modal from "./common/Modal";
import { useSetAtom } from "jotai";
import { focusedSentenceAtom } from "../atoms";

import { useDashboard } from "../hooks/useDashboard";

export const DashboardModalButton = ({
  moveScroll,
}: {
  moveScroll: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const setSelectedSentence = useSetAtom(focusedSentenceAtom);
  const { myLikedSentences, myAuthoredPassedSentences, myAuthoredCandidates } =
    useDashboard();

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
            {myLikedSentences && myLikedSentences.length > 0 ? (
              myLikedSentences.map((sentence) => (
                <button
                  key={sentence.id}
                  className="bg-white p-4 mb-2 rounded shadow-md w-full text-start"
                  onClick={() => {
                    moveScroll();
                    setIsOpen(false);
                    setSelectedSentence({
                      id: sentence.id,
                      authorId: sentence.authorId,
                      content: sentence.content,
                      myLikedCount: sentence.myLikedCount,
                    });
                  }}
                >
                  <p>{sentence.content}</p>

                  <p className="text-sm text-gray-500">
                    Liked {sentence.myLikedCount || 0} times
                  </p>
                </button>
              ))
            ) : (
              <p className="text-gray-500">No liked sentences found.</p>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-4">My Sentences</h2>
          <div className="mb-8">
            {myAuthoredPassedSentences &&
            myAuthoredPassedSentences.length > 0 ? (
              myAuthoredPassedSentences.map((sentence) => (
                <div
                  key={sentence.id}
                  className="bg-white p-4 mb-2 rounded shadow-md w-full text-start cursor-pointer"
                  onClick={() => {
                    moveScroll();
                    setIsOpen(false);
                    setSelectedSentence({
                      id: sentence.id,
                      authorId: sentence.authorId,
                      content: sentence.content,
                      myLikedCount: sentence.myLikedCount,
                    });
                  }}
                >
                  <p>{sentence.content}</p>
                  <p className="text-sm text-gray-500">
                    Liked by {sentence.likedUserCount} people,{" "}
                    {sentence.totalLikesCount} times in total
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No sentences written by you.</p>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-4">
            <div>My Candidates</div>
            <span className="text-sm">
              (Will be moved to My Sentences once approved)
            </span>
          </h2>
          <div>
            {myAuthoredCandidates && myAuthoredCandidates.length > 0 ? (
              myAuthoredCandidates.map((sentence) => (
                <div
                  key={sentence.id}
                  className="bg-white p-4 mb-2 rounded shadow-md w-full text-start"
                >
                  {sentence.content}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No candidates.</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
