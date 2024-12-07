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

export const Typer = ({ isVisible }: { isVisible: boolean }) => {
  const [inputText, setInputText] = useState("");
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isFadingIn, setIsFadingIn] = useState(true);
  const userId = useAtomValue(userIdAtom);
  const { refreshRandom, selectedSentence } = useSentence(userId?.userId);
  const [likeCount, setLikeCount] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const originalTextRef = useRef<HTMLHeadingElement>(null);
  const isFetchingRef = useRef(false);

  const userInfo = useAtomValue(userIdAtom);

  useEffect(() => {
    if (selectedSentence) {
      setLikeCount(selectedSentence.likeCount);
    } else {
      setLikeCount(0);
    }
  }, [selectedSentence, userInfo]);

  const [animateBackground, setAnimateBackground] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    setInputText("");
  }, [selectedSentence]);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const typingSound = new Audio("/short-typing.mp3"); // Ensure you have a typing sound file
    typingSound.playbackRate = 2.0;
    typingSound.play();
    const newValue = event.target.value;

    const isKorean = /[\u3131-\uD79D]/.test(newValue);

    if (
      !isKorean &&
      (newValue.length > (selectedSentence?.content?.length || 0) ||
        !selectedSentence?.content?.startsWith(newValue))
    ) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setInputText(newValue);
  };

  useEffect(() => {
    if (
      inputRef.current &&
      isVisible &&
      isElementNotCovered(originalTextRef.current)
    ) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  useEffect(() => {
    if (userId) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  }, [userId, selectedSentence]);

  const onNext = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsFadingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsFadingOut(false);
    setInputText("");
    refreshRandom();
    setIsFadingIn(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsFadingIn(false);
    isFetchingRef.current = false;
  }, [refreshRandom]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        console.log("next");
        onNext();
      }

      if (event.key === "Enter") {
        event.preventDefault();
        if (selectedSentence?.content.trim() === inputText.trim()) {
          completeSound.play();
          triggerAnimation();
          likeSentence(
            selectedSentence?.id || "",
            userInfo?.userId || DEV_USER_ID
          );
          setInputText("");
          setTimeout(() => {
            setLikeCount((prev) => prev + 1);
          }, 1000);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [inputText, userInfo, selectedSentence, onNext]);

  const triggerAnimation = () => {
    setAnimateBackground(true);
    setTimeout(() => setAnimateBackground(false), 1000);
  };

  return (
    <div
      className={classNames(
        "flex flex-col items-start justify-center gap-[48px]  relative",
        {
          "animate-shake": shake,
        }
      )}
    >
      <div
        className={classNames(
          "font-lora text-[24px] w-[100%] relative h-[100%] z-1",
          {
            "animate-fillBackground": animateBackground,
            "animate-fadeIn": isFadingIn,
            "animate-fadeOut": isFadingOut,
          }
        )}
        style={{
          color: "transparent",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          backgroundImage: `linear-gradient(to right,${
            LikeColors[likeCount % LikeColors.length]
          } 50%, ${LikeColors[(likeCount + 1) % LikeColors.length]} 50%)`,
          backgroundSize: "200% 100%",
          display: "inline-block",
        }}
        ref={originalTextRef}
      >
        {selectedSentence?.content}
      </div>
      <textarea
        ref={inputRef}
        value={inputText}
        onChange={handleInputChange}
        className={classNames(
          "font-lora focus:outline-none bg-transparent w-[100%] h-[100%] text-[24px] z-10 resize-none absolute top-0 left-0"
        )}
      />
    </div>
  );
};
