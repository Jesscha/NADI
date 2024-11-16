import React, { useEffect, useState, useRef } from "react";
import { Typer } from "./components/Typer";

import Writer from "./components/Writer";
import { Instruction } from "./components/Instruction";
import { DashboardModalButton } from "./components/Dashboard";

function useIsVisible(ref: React.RefObject<HTMLElement>) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 1 } // Adjust threshold as needed
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return isVisible;
}

function App() {
  const typerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HTMLDivElement>(null);

  const isTyperVisible = useIsVisible(typerRef);
  const isWriterVisible = useIsVisible(writerRef);

  // const { triggerAuth } = useFirebaseAuth();

  return (
    <>
      <div className="fixed top-0 left-0 z-10">
        <DashboardModalButton />
      </div>
      <div className="fixed bottom-0 right-0 z-10">
        <Instruction focusZone={isTyperVisible ? "type" : "write"} />
      </div>
      <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide absolute">
        <div
          ref={typerRef}
          className="snap-start h-screen flex justify-center items-center"
        >
          <Typer isVisible={isTyperVisible} />
        </div>
        <div
          ref={writerRef}
          className="snap-start h-screen flex justify-center items-center"
        >
          <Writer isVisible={isWriterVisible} />
        </div>
      </div>
    </>
  );
}

export default App;
