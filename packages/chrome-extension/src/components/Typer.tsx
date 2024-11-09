import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classNames from "classnames";
import ResponsiveText from "./common/ResponsiveText";

const LikeColors = [
  "lightyellow", // 매우 부드러운 시작
  "khaki", // 약간 더 진한 노란색
  "gold", // 황금빛
  "orange", // 눈에 띄는 오렌지
  "darkorange", // 더 강렬한 오렌지
  "orangered", // 붉은 오렌지
  "tomato", // 토마토색
  "red", // 강렬한 빨간색
  "firebrick", // 어두운 빨간색
  "darkred", // 매우 어두운 빨간색
];

const Text = ({ children }: { children: React.ReactNode }) => {
  const [isAnimation, setIsAnimation] = useState(true);

  const randomDelay = useMemo(() => {
    return Math.random() * 0.5;
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setIsAnimation(false);
    }, 2300 + Math.floor(randomDelay / 1000));
  }, [randomDelay]);

  return (
    <span
      className={classNames({
        "smoky-appear": isAnimation,
        "smoky-mirror-appear": Math.random() > 0.5 && isAnimation,
      })}
      style={{
        animationDelay: `${randomDelay}s`,
      }}
    >
      {children}
    </span>
  );
};

export const Typer = ({
  originalText,
  onNextText,
  like,
  isVisible,
}: {
  originalText: string;
  onNextText: () => void;
  like: () => void;
  isVisible: boolean;
}) => {
  const [inputText, setInputText] = useState("");

  const [likeCount, setLikeCount] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const originalTextRef = useRef<HTMLHeadingElement>(null);
  const isFetchingRef = useRef(false);
  const typedTextRef = useRef<HTMLDivElement>(null);
  const typingSound = new Audio("/short-typing.mp3"); // Ensure you have a typing sound file

  const _originalText = originalText || "     ";

  const [animateBackground, setAnimateBackground] = useState(false);

  useEffect(() => {
    setLikeCount(0);
  }, [originalText]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length > originalText.length) {
      return;
    }
    setInputText(event.target.value);
    typingSound.play();
  };

  useEffect(() => {
    if (inputRef.current && isVisible) {
      inputRef.current.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [isVisible]);

  const triggerDisappear = useCallback(() => {
    const originalTextDom = originalTextRef.current;
    const typedTextDom = typedTextRef.current;

    if (originalTextDom && typedTextDom) {
      // originalTextDom.style.transition = "opacity 0.5s ease-out";
      // originalTextDom.style.opacity = "0";
      // typedTextDom.style.opacity = "0";
    }
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const originalTextDom = originalTextRef.current;
        if (originalTextDom) {
          // originalTextDom.style.transition = "";
          // originalTextDom.style.opacity = "1";
        }
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
    setInputText("");
    await triggerDisappear();
    onNextText();
    setTimeout(() => {
      isFetchingRef.current = false;
    }, 2000);
  }, [onNextText, triggerDisappear]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault(); // Prevent default tab behavior
        onNext();
      }
      if (event.key === "Enter" && originalText === inputText) {
        event.preventDefault(); // Prevent default enter behavior
        triggerAnimation();
        like();
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
  }, [originalText, inputText, like, onNext]);

  const triggerAnimation = () => {
    setAnimateBackground(true);
    setTimeout(() => setAnimateBackground(false), 1000); // Reset after animation duration
  };

  return (
    <div className="flex flex-col items-center justify-center gap-[48px] w-full">
      <ResponsiveText
        className="whitespace-pre-wrap"
        targetLength={originalText.length}
      >
        <h1
          className={classNames("font-mono ", {
            "animate-fillBackground": animateBackground,
          })}
          style={{
            color: "transparent", // Make the text color transparent
            backgroundClip: "text", // Use background-clip to apply background color to text
            WebkitBackgroundClip: "text", // For Webkit browsers
            backgroundImage: `linear-gradient(to right,${
              LikeColors[likeCount % LikeColors.length]
            } 50%, ${LikeColors[(likeCount + 1) % LikeColors.length]} 50%)`, // Set the gradient for the animation
            backgroundSize: "200% 100%", // Double the width for animation
            display: "inline-block",
          }}
        >
          {_originalText.split("").map((char, index) => (
            <Text key={index}>{char}</Text>
          ))}
        </h1>
      </ResponsiveText>

      <input
        ref={inputRef}
        type="text"
        value={inputText}
        onChange={handleInputChange}
        tabIndex={-1}
        className="absolute left-[-9999px]"
      />
      <ResponsiveText targetLength={originalText.length}>
        <div
          className="flex  overflow-visible h-[50px] mt-[50px] transition-all duration-700 w-full flex-wrap"
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }}
          ref={typedTextRef}
        >
          {_originalText.split("").map((char, index) => (
            <div
              key={index}
              className={classNames(
                "font-mono border-b-solid border-b-black border-b-[1px] overflow-visible",
                {
                  "animate-bounce ripple": inputText[index],
                  "text-red-500": inputText[index] && inputText[index] !== char, // Add red color if not matching
                  "animate-blink": index === inputText.length, // Add blinking cursor at the next position
                }
              )}
              style={{
                width: "1ch", // Set width to match the font size
                height: "1.5em", // Set height to match the font size
              }}
            >
              {inputText[index] || (index === inputText.length ? "|" : "")}
            </div>
          ))}
        </div>
      </ResponsiveText>
    </div>
  );
};
