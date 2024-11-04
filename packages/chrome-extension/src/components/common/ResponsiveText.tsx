import React, { useEffect, useState } from "react";

interface ResponsiveTextProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
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

  const calculateFontSize = () => {
    const baseSize = 64;
    const lengthAdjustment = targetLength * 1.5;
    const widthAdjustment = (viewportWidth / 100) * 0.7;
    return Math.max(baseSize - lengthAdjustment + widthAdjustment, 1);
  };

  return (
    <h1
      className={className}
      style={{
        fontSize: `${calculateFontSize()}px`,
        ...style,
      }}
    >
      {children}
    </h1>
  );
};

export default ResponsiveText;
