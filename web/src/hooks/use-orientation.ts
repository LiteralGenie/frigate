import { useEffect, useState } from "react";

export function useOrientation() {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const listener = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener("resize", listener);

    setTimeout(() => listener(), 50);

    setIsPortrait(true);

    return () => window.removeEventListener("resize", listener);
  }, []);

  return {
    isPortrait,
    isLandscape: !isPortrait
  }
}
