import classNames from "classnames";

import { useState, useEffect } from "react";

type FocusZone = "type" | "write";

export const Instruction = ({ focusZone }: { focusZone: FocusZone }) => {
  const [twinkle, setTwinkle] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTwinkle(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={classNames(
        "cursor-help p-8 pb-8 flex flex-col items-start justify-start gap-[8px] opacity-[0.2] hover:opacity-100 transition-opacity duration-500",
        {
          "animate-twinkle": twinkle,
        }
      )}
    >
      {focusZone === "type" && (
        <div className="text-[12px] font-lora">Tab to renew</div>
      )}
      {focusZone === "type" && (
        <div className="text-[12px] font-lora">Repeat to taste</div>
      )}

      {focusZone === "type" && (
        <div className="text-[12px] font-lora">Enter to like</div>
      )}

      {focusZone === "write" && (
        <div className="text-[12px] font-lora">Enter to share</div>
      )}

      <div className="text-[12px] font-lora">Breath to live</div>
    </div>
  );
};
