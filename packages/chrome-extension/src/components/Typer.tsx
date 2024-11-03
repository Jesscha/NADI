import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";

export const Typer = ({
  originalText,
  onNextText,
  like,
}: {
  originalText: string;
  onNextText: () => void;
  like: () => void;
}) => {
  const [inputText, setInputText] = useState("");
  const [morph, setMorph] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const typingSound = new Audio("/short-typing.mp3"); // Ensure you have a typing sound file

  const morphTime = 6;

  const _originalText = originalText || "     ";

  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    setShouldAnimate(true);
    setMorph(0);
  }, [originalText]);

  useEffect(() => {
    if (!shouldAnimate) return;
    let animationFrameId: number;
    const update = () => {
      setMorph((prevMorph) => prevMorph + 0.1);
      if (morph >= morphTime) {
        setShouldAnimate(false);
        setMorph(morphTime);
      }

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animationFrameId);
  }, [morph, shouldAnimate]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length > originalText.length) {
      return;
    }
    setInputText(event.target.value);
    typingSound.play();
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const fraction = morph / morphTime;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault(); // Prevent default tab behavior
        onNextText();
      }
      if (event.key === "Enter" && originalText === inputText) {
        event.preventDefault(); // Prevent default enter behavior
        like();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onNextText, originalText, inputText]);

  return (
    <div className="text-gray-300 flex flex-col items-center justify-center gap-[48px]">
      <h1
        className="font-mono text-[64px] animate-ripple h-[30px]"
        style={{
          filter: `url(#threshold) blur(0px)`,
        }}
      >
        <span
          style={{
            filter: `blur(${Math.min(8 / fraction - 8, 50)}px)`,
            opacity: `${Math.pow(fraction, 0.4) * 100}%`,
          }}
        >
          {originalText}
        </span>
      </h1>
      <input
        ref={inputRef}
        type="text"
        value={inputText}
        onChange={handleInputChange}
        tabIndex={-1}
        className="absolute left-[-9999px]"
      />
      <div
        className="flex gap-[5px] overflow-visible h-[50px] mt-[50px]"
        onClick={() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }}
      >
        {_originalText.split("").map((char, index) => (
          <div
            key={index}
            className={classNames(
              "w-[10px] font-mono h-[30px] border-b-solid border-b-black border-b-[1px] overflow-visible",
              {
                "animate-bounce ripple": inputText[index],
                "text-red-500": inputText[index] && inputText[index] !== char, // Add red color if not matching
                "animate-blink": index === inputText.length, // Add blinking cursor at the next position
              }
            )}
          >
            {inputText[index] || (index === inputText.length ? "|" : "")}
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center gap-[12px]">
        <button tabIndex={-1} onClick={onNextText}>
          Next
        </button>
      </div>
      <div>{originalText === inputText && <div>Press Enter to like</div>}</div>
      <svg id="filters">
        <defs>
          <filter id="threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};
