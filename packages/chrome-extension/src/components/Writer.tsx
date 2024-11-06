import React, { useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import ResponsiveText from "./common/ResponsiveText";
import classNames from "classnames";

const isDev = true;

function uploadSentence(content: string, authorId: string) {
  return addDoc(collection(db, "sentences"), {
    content: content,
    authorId: authorId,
    likes: 0, // 좋아요 수
  }).then((docRef) => {
    console.log("Document written with ID: ", docRef.id);
    return docRef.id; // 새 문장 ID 반환
  });
}

function Writer({
  authorId,
  isVisible,
}: {
  authorId: string;
  isVisible: boolean;
}) {
  const [sentence, setSentence] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current && isVisible) {
      inputRef.current.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [isVisible]);

  if (!authorId && !isDev) return <>please login</>;

  const handleSubmit = async (event: React.FormEvent) => {
    const _authId = authorId || "dev";
    event.preventDefault();
    setIsLoading(true);
    try {
      const docId = await uploadSentence(sentence, _authId);
      console.log("Uploaded sentence with ID:", docId);
      setSentence(""); // Clear the input field after successful upload
    } catch (error) {
      console.error("Error uploading sentence:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-[48px] text-gray-300">
      <h2>Writer Component</h2>
      {/* <ResponsiveText targetLength={sentence.length}>
        <h1 className="font-mono h-[30px]">{sentence}</h1>
      </ResponsiveText> */}
      <ResponsiveText targetLength={sentence.length}>
        <div
          className="flex flex-row gap-[1px] flex-wrap"
          onClick={() => {
            inputRef.current?.focus();
          }}
        >
          {sentence.split("").map((char, index) => {
            return (
              <div
                key={index}
                className={classNames("font-mono border-b-solid ", {
                  "animate-bounce ripple": sentence[index],
                  "animate-blink": index === sentence.length, // Add blinking cursor at the next position
                })}
                style={{
                  width: "1ch", // Set width to match the font size
                }}
              >
                {sentence[index] || (index === sentence.length ? "|" : "")}
              </div>
            );
          })}
        </div>
      </ResponsiveText>

      <form onSubmit={handleSubmit}>
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
    </div>
  );
}

export default Writer;
