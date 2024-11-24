import React, { useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { useAtomValue } from "jotai";
import { userIdAtom } from "../atoms";
import { DEV_USER_ID } from "../constants";
import { arrayUnion, doc, runTransaction } from "firebase/firestore";
import { db } from "../firebase";
import useRandomSentence from "../hooks/useRandomSentence";
import { isElementNotCovered } from "../utils";

const typingSound = new Audio("/short-typing.mp3"); // Ensure you have a typing sound file
const completeSound = new Audio("/activation-sound.mp3");

async function likeSentence(sentenceId: string, userId: string) {
  const sentenceRef = doc(db, "sentences", sentenceId);

  await runTransaction(db, async (transaction) => {
    const docSnapshot = await transaction.get(sentenceRef);
    if (!docSnapshot.exists()) {
      throw "Document does not exist!";
    }
    const data = docSnapshot.data();
    const newLikes = (data?.likes || 0) + 1;
    const userLikes = (data?.likesByUser?.[userId] || 0) + 1;

    transaction.update(sentenceRef, {
      likes: newLikes,
      likedBy: arrayUnion(userId),
      likesByUser: {
        ...data?.likesByUser,
        [userId]: userLikes,
      },
    });
  });
  console.log("Like added!");
}

const LikeColors = [
  "gray", // 황금빛
  "darkorange", // 더 강렬한 오렌지
  "orangered", // 붉은 오렌지
  "tomato", // 토마토색
  "crimson", // 진한 빨간색
  "red", // 강렬한 빨간색
  "firebrick", // 어두운 빨간색
  "darkred", // 매우 어두운 빨간색
  "maroon", // 밤색
  "saddlebrown", // 짙은 갈색
];

export const Typer = ({ isVisible }: { isVisible: boolean }) => {
  const [inputText, setInputText] = useState("");
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isFadingIn, setIsFadingIn] = useState(false);
  const { refreshRandom, randomSentence } = useRandomSentence();

  const [likeCount, setLikeCount] = useState(0);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const originalTextRef = useRef<HTMLHeadingElement>(null);
  const isFetchingRef = useRef(false);
  const typedTextRef = useRef<HTMLDivElement>(null);

  const userInfo = useAtomValue(userIdAtom);

  const _originalText = randomSentence?.content || "";

  const [animateBackground, setAnimateBackground] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    setLikeCount(0);
  }, [randomSentence]);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    if (
      newValue.length > randomSentence?.content.length ||
      !randomSentence?.content.startsWith(newValue)
    ) {
      setShake(true); // Trigger shake animation
      setTimeout(() => setShake(false), 500); // Reset shake state after animation duration
      return; // Prevent updating the input if it doesn't match the start of the original text
    }
    setInputText(newValue);
    typingSound.play();
  };

  useEffect(() => {
    if (
      inputRef.current &&
      isVisible &&
      isElementNotCovered(originalTextRef.current)
    ) {
      inputRef.current.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [isVisible]);

  const triggerDisappear = useCallback(() => {
    const originalTextDom = originalTextRef.current;
    const typedTextDom = typedTextRef.current;

    if (originalTextDom && typedTextDom) {
      originalTextDom.style.transition = "opacity 0.5s ease-out";
    }
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
        setTimeout(() => {
          const typedTextDom = typedTextRef.current;
          if (typedTextDom) {
            // typedTextDom.style.opacity = "1";
          }
        }, 2000);
      }, 800);
    });
  }, []);

  const onNext = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setIsFadingOut(true); // Start fade-out animation
    await triggerDisappear();
    setIsFadingOut(false); // End fade-out animation

    setInputText("");
    refreshRandom();

    setIsFadingIn(true); // Start fade-in animation
    setTimeout(() => {
      setIsFadingIn(false); // End fade-in animation
      isFetchingRef.current = false;
    }, 2000);
  }, [triggerDisappear, refreshRandom]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault(); // Prevent default tab behavior
        onNext();
      }
      if (event.key === "Enter" && randomSentence?.content === inputText) {
        event.preventDefault(); // Prevent default enter behavior
        completeSound.play();
        triggerAnimation();
        likeSentence(randomSentence?.id || "", userInfo?.userId || DEV_USER_ID);
        setInputText("");
        setTimeout(() => {
          setLikeCount((prev) => prev + 1);
        }, 1000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [inputText, userInfo, randomSentence, onNext]);

  const triggerAnimation = () => {
    setAnimateBackground(true);
    setTimeout(() => setAnimateBackground(false), 1000); // Reset after animation duration
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
        {_originalText}
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
