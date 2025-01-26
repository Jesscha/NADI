import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
  console.log("likeSentence", sentenceId, userId);

  const likesRef = doc(db, "likes", userId);
  await runTransaction(db, async (transaction) => {
    console.log("transaction");
    const docSnapshot = await transaction.get(likesRef);
    console.log("docSnapshot", docSnapshot);
    let data = {} as {
      userId: string;
      likedSentences: {
        [sentenceId: string]: number;
      };
    };
    console.log("data", data);
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

    console.log("data", data);

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

const Cursor = ({ isFocused }: { isFocused: boolean }) => {
  if (!isFocused) return null;

  return (
    <div
      className="animate-blink inline-block h-[1em]"
      style={{ outline: "1px solid #9CA3AF" }}
    ></div>
  );
};

const getGlowStyle = (likeCount: number) => {
  const colorIndex = Math.min(likeCount, LikeColors.length - 1);
  const color = LikeColors[colorIndex];
  const intensity = Math.min(likeCount * 2, 20); // Cap the glow intensity
  return {
    textShadow: `0 0 ${intensity}px ${color}`,
    color: likeCount > 0 ? color : undefined,
    transition: "text-shadow 0.3s ease, color 0.3s ease",
  };
};

export const Typer = ({ isVisible }: { isVisible: boolean }) => {
  const [inputText, setInputText] = useState("");
  const userId = useAtomValue(userIdAtom);
  const { refreshRandom, selectedSentence } = useSentence(userId?.userId);
  const [likeCount, setLikeCount] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isEarlyEnter, setIsEarlyEnter] = useState(false);
  const earlyEnterTimeoutRef = useRef<NodeJS.Timeout>();

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

  useEffect(() => {
    if (isEarlyEnter) {
      if (earlyEnterTimeoutRef.current) {
        clearTimeout(earlyEnterTimeoutRef.current);
      }
      earlyEnterTimeoutRef.current = setTimeout(() => {
        setIsEarlyEnter(false);
      }, 2000);
    }
    return () => {
      if (earlyEnterTimeoutRef.current) {
        clearTimeout(earlyEnterTimeoutRef.current);
      }
    };
  }, [isEarlyEnter]);

  // const moveTextBackward = useCallback(() => {
  //   if (inputText === "") {
  //     return;
  //   }
  //   requestAnimationFrame(() => {
  //     setInputText((prevText) => {
  //       const newText = prevText.slice(0, -1);
  //       if (newText.length > 0) {
  //         moveTextBackward();
  //       }
  //       return newText;
  //     });
  //   });
  // }, [inputText]);

  return (
    <div
      className="relative min-h-[100px] p-4"
      onClick={() => {
        inputRef.current?.focus();
      }}
      onFocus={() => setIsInputFocused(true)}
      onBlur={() => setIsInputFocused(false)}
    >
      <div className="absolute -top-8 left-0 w-full">
        <div
          className={classNames(
            "text-sm text-orange-300 text-center",
            "transition-opacity duration-300",
            isEarlyEnter ? "opacity-100" : "opacity-0"
          )}
        >
          Complete the word to like (or press Tab to skip)
        </div>
      </div>
      <textarea
        ref={inputRef}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();

            if (selectedSentence?.content !== inputText) {
              setIsEarlyEnter(true);
              return;
            }

            if (selectedSentence && userId) {
              likeSentence(selectedSentence?.id, userId?.userId);
              // moveTextBackward();
              setInputText("");
              setIsLikeAnimating(true);
              setLikeCount(likeCount + 1);
              setTimeout(() => {
                setIsLikeAnimating(false);
              }, 1000);
            }
          }
        }}
        className="opacity-0 absolute w-full h-full"
        autoFocus
      />
      <div className="relative text-2xl flex items-center">
        {selectedSentence?.content.split("").map((char, index) => {
          const isNoInput = inputText.length === 0;
          if (index < inputText.length) {
            const inputChar = inputText[index];
            const isLastChar = index === inputText.length - 1;
            if (inputChar === char || isKoreanComposing(char, inputChar)) {
              return (
                <span key={index} className="inline-flex items-center">
                  {inputChar === " " ? "\u00A0" : inputChar}
                  {isLastChar && <Cursor isFocused={isInputFocused} />}
                </span>
              );
            } else {
              return (
                <span
                  key={index}
                  className="text-red-500 inline-flex items-center"
                >
                  {inputChar?.trim()
                    ? inputChar
                    : char === " "
                    ? "\u00A0"
                    : char}
                  {isLastChar && <Cursor isFocused={isInputFocused} />}
                </span>
              );
            }
          }
          return (
            <Fragment key={index}>
              {isNoInput && index === 0 && (
                <Cursor isFocused={isInputFocused} />
              )}
              <span className="text-gray-400">
                {char === " " ? "\u00A0" : char}
              </span>
            </Fragment>
          );
        })}
        <div
          className={classNames(
            "text-sm absolute right-[-20px] top-[-10px]",
            isLikeAnimating && "animate-ping-once"
          )}
          style={getGlowStyle(likeCount)}
        >
          {likeCount > 0 && `+${likeCount}`}
        </div>
      </div>
    </div>
  );
};
