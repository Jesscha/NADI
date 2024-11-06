import React, { useEffect, useMemo, useState } from "react";

interface ResponsiveTextProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactElement<{ fontSize?: number }>;
  targetLength: number;
}

const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  className,
  style,
  children,
  targetLength,
}) => {
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const fontSize = useMemo(() => {
    const baseSize = 64;
    const lengthAdjustment = targetLength * 1.5;
    const widthAdjustment = (viewportWidth / 100) * 0.7;
    return Math.max(baseSize - lengthAdjustment + widthAdjustment, 20);
  }, [targetLength, viewportWidth]);

  return (
    <div
      className={className}
      style={{
        fontSize: `${fontSize}px`,
        ...style,
      }}
    >
      {React.isValidElement(children)
        ? React.cloneElement(children, { fontSize: fontSize })
        : children}
    </div>
  );
};

export default ResponsiveText;
