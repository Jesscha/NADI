import React, { useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";

import classNames from "classnames";
import Modal from "./common/Modal";
import { DEV_USER_ID } from "../constants";
import { useAtomValue } from "jotai";
import { userIdAtom } from "../atoms";

const isDev = true;

function uploadSentence(content: string, authorId: string) {
  return addDoc(collection(db, "sentences"), {
    content: content,
    authorId: authorId,
    likes: 0, // 좋아요 수
    likedBy: [], // 좋아요 한 사람들
    likesByUser: {}, // 좋아요 한 사람들의 좋아요 수
  }).then((docRef) => {
    console.log("Document written with ID: ", docRef.id);
    return docRef.id; // 새 문장 ID 반환
  });
}

function Writer({ isVisible }: { isVisible: boolean }) {
  const [sentence, setSentence] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userId = useAtomValue(userIdAtom);

  useEffect(() => {
    if (inputRef.current && isVisible) {
      inputRef.current.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [isVisible]);

  if (!userId && !isDev) return <>please login</>;

  const handleSubmit = async (event: React.FormEvent) => {
    const _authId = userId || DEV_USER_ID;
    event.preventDefault();
    setIsLoading(true);
    try {
      const docId = await uploadSentence(sentence, _authId);
      console.log("Uploaded sentence with ID:", docId);
      setSentence(""); // Clear the input field after successful upload
      setIsSubmitted(true); // Set the submitted state to true
      setTimeout(() => {
        setIsSubmitted(false);
        setSentence("");
      }, 3000);
    } catch (error) {
      console.error("Error uploading sentence:", error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log([...sentence.split(""), ""]);

  return (
    <div className="flex flex-col items-start justify-start gap-[48px] text-black p-10 h-full w-full ">
      <div className="text-2xl font-lora">Drop you thought here</div>

      <div
        className="flex flex-row gap-[1px] flex-wrap"
        onClick={() => {
          inputRef.current?.focus();
        }}
      >
        {[...sentence.split(""), ""].map((char, index) => {
          return (
            <div
              key={index}
              className={classNames("font-lora border-b-solid text-[32px]", {
                ripple: sentence[index] && !isSubmitted,
                "animate-blink": index === sentence.length && !isSubmitted,
                smoky: isSubmitted,
                "smoky-mirror": isSubmitted && index % 2 === 0,
              })}
            >
              {char === " " && <div className="w-[0.5ch]"></div>}

              {index === sentence.length ? "|" : char}
            </div>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setIsModalOpen(true);
        }}
      >
        <input
          tabIndex={-1}
          className="absolute left-[-9999px]"
          type="text"
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          placeholder="Write your sentence here"
          disabled={isLoading}
          ref={inputRef}
        />
      </form>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="font-lora flex flex-col items-center justify-between h-full">
          <div className="flex flex-col items-center justify-center gap-2">
            Are you sure you want to submit this sentence?
            <div className="text-sm">Enter to proceed.</div>
          </div>

          <button
            className="bg-black text-white px-4 py-2 rounded-lg"
            onClick={(e) => {
              setIsModalOpen(false);
              handleSubmit(e);
            }}
          >
            Submit
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Writer;
