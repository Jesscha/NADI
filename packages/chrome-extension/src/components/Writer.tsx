import React, { useEffect, useRef, useState } from "react";

import { DEV_USER_ID, isDev } from "../constants";
import { useAtomValue } from "jotai";
import { userInfoAtom } from "../atoms";
import { TypingModal } from "./common/TypingModal";
import { isElementNotCovered } from "../utils";
import { useMyAuthoredCandidates } from "../hooks/useMyAuthroedCandidates";
import { uploadSentence } from "../utils/firebase";

const ConfirmModal = ({
  isOpen,
  onClose,
  upLoadSentence,
}: {
  isOpen: boolean;
  onClose: () => void;
  upLoadSentence: () => void;
}) => {
  return (
    <TypingModal
      topArea={
        <h1 className="text-2xl font-bold mb-[16px]">
          Your words' journey begins
        </h1>
      }
      isOpen={isOpen}
      onClose={onClose}
      firstWord="OK"
      secondWord="NO"
      placeholder="OK to share, NO to cancel"
      firstAction={upLoadSentence}
      secondAction={onClose}
    />
  );
};

function Writer({ isVisible }: { isVisible: boolean }) {
  const [sentence, setSentence] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userInfo = useAtomValue(userInfoAtom);
  const { mutate } = useMyAuthoredCandidates();

  useEffect(() => {
    if (
      inputRef.current &&
      isVisible &&
      isElementNotCovered(inputRef.current) &&
      !isModalOpen
    ) {
      inputRef.current.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [isVisible, isModalOpen]);

  if (!userInfo && !isDev) return <>please login</>;

  const handleSubmit = async () => {
    const _authId = userInfo?.userId || DEV_USER_ID;
    setIsLoading(true);
    try {
      const trimmedSentence = sentence.trim();
      await uploadSentence(trimmedSentence, _authId);
      mutate();

      setIsFading(true);
      setTimeout(() => {
        setSentence("");
        setIsFading(false);
      }, 500);
    } catch (error) {
      console.error("Error uploading sentence:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      setIsModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col items-start justify-start gap-[48px] text-black p-10 h-full w-full ">
      <div className="text-2xl font-lora">Drop you thought here</div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setIsModalOpen(true);
        }}
        className="flex flex-col items-start justify-start gap-[48px] text-gray-600  h-full w-full "
      >
        <textarea
          className={`font-lora focus:outline-none bg-transparent w-[100%] h-[100%] text-[24px] resize-none transition-opacity duration-500 ${
            isFading ? "opacity-0" : "opacity-100"
          }`}
          tabIndex={-1}
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Write your sentence here"
          disabled={isLoading}
          ref={inputRef}
        />
      </form>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        upLoadSentence={() => {
          handleSubmit();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}

export default Writer;
