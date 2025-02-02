import { useEffect, useState } from "react";

export function useIsVisible(ref: React.RefObject<HTMLElement>) {
    const [isVisible, setIsVisible] = useState(false);
  
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.isIntersecting);
        },
        {
          threshold: 1,
        }
      );
  
      if (ref.current) {
        observer.observe(ref.current);
      }
  
      return () => {
        observer.disconnect();
      };
    }, []);
  
    return isVisible;
  }
  