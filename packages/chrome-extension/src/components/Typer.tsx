import { Fragment, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { useAtomValue } from "jotai";
import { userInfoAtom } from "../atoms";

import useFocusedSentence from "../hooks/useFocusedSentence";
import { likeSentence } from "../utils/firebase";
import { isKoreanComposing } from "../utils/string";
import { getGlowStyle } from "../utils/style";

const completeSound = new Audio("/activation-sound.mp3");

const Cursor = ({ isFocused }: { isFocused: boolean }) => {
  if (!isFocused) return null;

  return (
    <div
      className="animate-blink inline-block h-[1em]"
      style={{ outline: "1px solid #9CA3AF" }}
    ></div>
  );
};

export const Typer = ({ isVisible }: { isVisible: boolean }) => {
  const [inputText, setInputText] = useState("");
  const userId = useAtomValue(userInfoAtom);
  const { refreshRandom, selectedSentence, mutateAllLikes } =
    useFocusedSentence();
  const [likeCount, setLikeCount] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isEarlyEnter, setIsEarlyEnter] = useState(false);
  const earlyEnterTimeoutRef = useRef<NodeJS.Timeout>();


  useEffect(() => {
    if (isVisible) {
      inputRef.current?.focus();
    }
  }, [isVisible]);

  const userInfo = useAtomValue(userInfoAtom);

  useEffect(() => {
    if (selectedSentence) {
      setLikeCount(selectedSentence.myLikedCount);
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
  const disableOnChangeRef = useRef(false);

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
        onChange={(e) => {
          if (disableOnChangeRef.current) {
            return;
          }
          const newValue = e.target.value;
          if (
            selectedSentence &&
            newValue.length <= selectedSentence.content.length
          ) {
            setInputText(newValue);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            refreshRandom();
            setInputText("");
            return;
          }

          if (e.key === "Enter" && !e.shiftKey) {
            if(disableOnChangeRef.current) {
              return;
            }
            disableOnChangeRef.current = true;
            
            e.preventDefault();
            if (selectedSentence?.content !== inputText) {
              setIsEarlyEnter(true);
              return;
            }

            if (selectedSentence && userId) {
              likeSentence(selectedSentence?.id, userId?.userId);
              completeSound.play();
              // moveTextBackward();

              setIsLikeAnimating(true);
              setLikeCount(likeCount + 1);
              
              setInputText("");
              setTimeout(() => {
                setIsLikeAnimating(false);
                mutateAllLikes();
                disableOnChangeRef.current = false;    
              }, 1000);
            }
            
          }
        }}
        className="opacity-0 absolute w-full h-full"
        autoFocus
      />
      <div className="relative text-2xl flex items-center flex-wrap">
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
