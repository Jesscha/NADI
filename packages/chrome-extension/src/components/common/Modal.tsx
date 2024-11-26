import React, { ReactNode, useEffect } from "react";
import ReactDOM from "react-dom";

// ... existing code ...

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className={`font-lora w-screen h-screen bg-black/50 fixed top-0 left-0 flex items-center justify-center z-50 transition-opacity duration-500 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      {children}
    </div>,
    document.getElementById("modal-root") as HTMLElement // Type assertion for TypeScript
  );
};

export default Modal;
