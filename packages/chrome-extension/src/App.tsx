import { useRef } from "react";
import { Typer } from "./components/Typer";
import Writer from "./components/Writer";
import { Instruction } from "./components/Instruction";
import { DashboardModalButton } from "./components/Dashboard";

// import { LoginModal } from "./components/LoginModal";
import { useIsVisible } from "./hooks/useIsVisible";
import { useAuth } from "./hooks/useAuth";
import { SRWProvider } from "./provider";

function App() {
  const typerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HTMLDivElement>(null);
  useAuth();
  const isTyperVisible = useIsVisible(typerRef);
  const isWriterVisible = useIsVisible(writerRef);

  const moveScrollToTyper = () => {
    if (typerRef.current) {
      typerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <SRWProvider>
      <div className="fixed top-0 left-0 z-10">
        <DashboardModalButton moveScroll={moveScrollToTyper} />
      </div>
      <div className="fixed bottom-0 right-0 z-10">
        <Instruction focusZone={isTyperVisible ? "type" : "write"} />
      </div>
      <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide absolute  font-lora">
        <div
          ref={typerRef}
          className="snap-start h-screen flex justify-center items-center p-5"
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
      {/* <LoginModal /> */}
    </SRWProvider>
  );
}

export default App;
