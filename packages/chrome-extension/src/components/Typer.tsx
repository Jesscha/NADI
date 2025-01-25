import React, { useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { useAtomValue } from "jotai";
import { userIdAtom } from "../atoms";
import { DEV_USER_ID } from "../constants";
import { doc, runTransaction } from "firebase/firestore";
import { db } from "../firebase";
import useSentence from "../hooks/useSentence";
import { isElementNotCovered } from "../utils";

const completeSound = new Audio("/activation-sound.mp3");

async function likeSentence(sentenceId: string, userId: string) {
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
const LikeColors = [
  "gray",
  "darkred",
  "darkorange",
  "goldenrod",
  "darkgreen",
  "darkcyan",
  "darkblue",
  "darkviolet",
  "darkmagenta",
  "darkslateblue",
  "darkorchid",
];

function isKoreanComposing(target: string, input: string): boolean {
  if (target === input) return true;

  const targetChar = target.charCodeAt(0);
  const inputChar = input.charCodeAt(0);

  // Check if target is Hangul syllable
  const isTargetKorean = targetChar >= 0xac00 && targetChar <= 0xd7a3;
  const isInputKorean =
    (inputChar >= 0x1100 && inputChar <= 0x11ff) || // Jamo
    (inputChar >= 0x3130 && inputChar <= 0x318f) || // Compatibility Jamo
    (inputChar >= 0xac00 && inputChar <= 0xd7a3); // Syllables

  if (!isTargetKorean || !isInputKorean) return false;

  const targetJamo = target.normalize("NFD");
  const inputJamo = input.normalize("NFD");

  // For compatibility Jamo (ㅎ), convert to the corresponding lead consonant range
  if (inputChar >= 0x3130 && inputChar <= 0x318f) {
    // Convert compatibility Jamo to lead consonant
    const compatibilityToLeadConsonant: { [key: string]: string } = {
      ㄱ: "ᄀ",
      ㄲ: "ᄁ",
      ㄴ: "ᄂ",
      ㄷ: "ᄃ",
      ㄸ: "ᄄ",
      ㄹ: "ᄅ",
      ㅁ: "ᄆ",
      ㅂ: "ᄇ",
      ㅃ: "ᄈ",
      ㅅ: "ᄉ",
      ㅆ: "ᄊ",
      ㅇ: "ᄋ",
      ㅈ: "ᄌ",
      ㅉ: "ᄍ",
      ㅊ: "ᄎ",
      ㅋ: "ᄏ",
      ㅌ: "ᄐ",
      ㅍ: "ᄑ",
      ㅎ: "ᄒ",
    };
    const convertedInput = compatibilityToLeadConsonant[input] || input;
    return targetJamo.startsWith(convertedInput);
  }

  return targetJamo.startsWith(inputJamo);
}

export const Typer = ({ isVisible }: { isVisible: boolean }) => {
  const [inputText, setInputText] = useState("");
  const userId = useAtomValue(userIdAtom);
  const { refreshRandom, selectedSentence } = useSentence(userId?.userId);
  const [likeCount, setLikeCount] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const userInfo = useAtomValue(userIdAtom);

  useEffect(() => {
    if (selectedSentence) {
      setLikeCount(selectedSentence.likeCount);
    } else {
      setLikeCount(0);
    }
  }, [selectedSentence, userInfo]);

  useEffect(() => {
    if (userId) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  }, [userId, selectedSentence]);

  return (
    <div
      className="relative min-h-[100px] p-4"
      onClick={() => inputRef.current?.focus()}
    >
      <textarea
        ref={inputRef}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="opacity-0 absolute w-full h-full"
        autoFocus
      />
      <div className="relative text-2xl">
        {"한글 로 ".split("").map((char, index) => {
          if (index < inputText.length) {
            const inputChar = inputText[index];
            if (inputChar === char || isKoreanComposing(char, inputChar)) {
              return (
                <span key={index} className="text-black">
                  {inputChar}
                </span>
              );
            } else {
              return (
                <span key={index} className="text-red-500">
                  {inputChar?.trim() ? inputChar : char}
                </span>
              );
            }
          }
          return (
            <span key={index} className="text-gray-400">
              {char}
            </span>
          );
        })}
      </div>
    </div>
  );
};
