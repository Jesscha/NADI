import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import Modal from "./common/Modal";

// The log-in flow that I want
// if choose no log in -> local mode
// if choose log in -> login
// later implement migration feature by email
//

export const LoginModal = () => {
  const { userId, triggerGoogleAuth, triggerLocalAuth } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toUpperCase();
    const connectSequence = "CONNECT";
    const tryOutSequence = "TRY OUT";

    if (connectSequence.startsWith(value)) {
      setInputValue(value);
    } else if (tryOutSequence.startsWith(value)) {
      setInputValue(value);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (inputValue === "CONNECT") {
        triggerGoogleAuth();
      } else if (inputValue === "TRY OUT") {
        triggerLocalAuth();
      }
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const getPlaceholderText = () => {
    if (inputValue.startsWith("C")) {
      return "CONNECT";
    } else if (inputValue.startsWith("T")) {
      return "TRY OUT";
    }
    return "CONNECT OR TRY OUT";
  };

  console.log(userId);

  return (
    <Modal isOpen={userId === null} onClose={() => {}}>
      <div className="flex flex-col items-center justify-center bg-white p-[32px] rounded-lg">
        <h1 className="text-2xl font-bold mb-[16px]">
          Start your journey with...
        </h1>
        <p className="text-sm text-gray-500 mb-[8px]">
          <b>Connect</b> will remember you any time any where
        </p>
        <p className="text-sm text-gray-500 mb-[8px]">
          <b>Try out</b> will remember you on this browser
        </p>
        <p className="text-[12px] text-gray-400 mb-[12px]">
          (migration feature will be added later)
        </p>

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
          {(inputValue === "CONNECT" || inputValue === "TRY OUT") && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              Press Enter
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
};
