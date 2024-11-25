import { useLayoutEffect, useRef, useState } from "react";
import Modal from "./Modal";

interface TypingModalProps {
  isOpen: boolean;
  onClose?: () => void;
  topArea: React.ReactNode;
  firstWord: string;
  secondWord: string;
  placeholder: string;
  firstAction: () => void;
  secondAction: () => void;
}

export const TypingModal = ({
  isOpen,
  onClose = () => {},
  topArea,
  firstWord,
  secondWord,
  placeholder,
  firstAction,
  secondAction,
}: TypingModalProps) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toUpperCase();
    setInputValue(value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (inputValue === firstWord) {
        firstAction();
        setTimeout(() => {
          setInputValue("");
        }, 500);
      } else if (inputValue === secondWord) {
        secondAction();
        setTimeout(() => {
          setInputValue("");
        }, 500);
      }
    }
  };

  useLayoutEffect(() => {
    if (inputRef.current && isOpen) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getPlaceholderText = () => {
    if (inputValue === "") {
      return placeholder;
    }

    if (firstWord.startsWith(inputValue)) {
      return firstWord;
    } else if (secondWord.startsWith(inputValue)) {
      return secondWord;
    }
    return placeholder;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center justify-center bg-white p-[32px] rounded-lg">
        {topArea}
        <div className="relative mt-6">
          <input
            type="text"
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="relative p-3 w-[240px] focus:outline-none border-2 border-gray-300 rounded-lg text-gray-800 z-10 bg-transparent"
          />
          <span className="w-[240px] p-3 absolute left-0 top-1/2 border-2 border-transparent transform  -translate-y-1/2 text-gray-200 pointer-events-none">
            {getPlaceholderText()}
          </span>
          {
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 transition-opacity duration-300"
              style={{
                opacity:
                  inputValue === firstWord || inputValue === secondWord ? 1 : 0,
              }}
            >
              Press Enter
            </span>
          }
        </div>
      </div>
    </Modal>
  );
};
