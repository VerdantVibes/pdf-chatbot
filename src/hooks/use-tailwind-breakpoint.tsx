import { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";

type TailwindBreakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface BreakpointReturn {
  breakpoint: TailwindBreakpoint;
  is2xl: boolean;
  isXl: boolean;
  isLg: boolean;
  isMd: boolean;
  isSm: boolean;
  isXs: boolean;
  atLeast2xl: boolean;
  atLeastXl: boolean;
  atLeastLg: boolean;
  atLeastMd: boolean;
  atLeastSm: boolean;
  atMostXs: boolean;
  atMostSm: boolean;
  atMostMd: boolean;
  atMostLg: boolean;
  atMostXl: boolean;
}

export function useTailwindBreakpoint(): BreakpointReturn {
  // Use SSR-safe implementation
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Tailwind's default breakpoints
  const is2xl = useMediaQuery({ minWidth: 1536 });
  const isXl = useMediaQuery({ minWidth: 1280, maxWidth: 1535 });
  const isLg = useMediaQuery({ minWidth: 1024, maxWidth: 1279 });
  const isMd = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isSm = useMediaQuery({ minWidth: 640, maxWidth: 767 });
  const isXs = useMediaQuery({ maxWidth: 639 });

  // Min-width queries (at least)
  const atLeast2xl = useMediaQuery({ minWidth: 1536 });
  const atLeastXl = useMediaQuery({ minWidth: 1280 });
  const atLeastLg = useMediaQuery({ minWidth: 1024 });
  const atLeastMd = useMediaQuery({ minWidth: 768 });
  const atLeastSm = useMediaQuery({ minWidth: 640 });

  // Max-width queries (at most)
  const atMostXs = useMediaQuery({ maxWidth: 639 });
  const atMostSm = useMediaQuery({ maxWidth: 767 });
  const atMostMd = useMediaQuery({ maxWidth: 1023 });
  const atMostLg = useMediaQuery({ maxWidth: 1279 });
  const atMostXl = useMediaQuery({ maxWidth: 1535 });

  // Determine current breakpoint
  let breakpoint: TailwindBreakpoint = "xs";
  if (!isClient) {
    // Return defaults for SSR
    return {
      breakpoint: "xs",
      is2xl: false,
      isXl: false,
      isLg: false,
      isMd: false,
      isSm: false,
      isXs: true,
      atLeast2xl: false,
      atLeastXl: false,
      atLeastLg: false,
      atLeastMd: false,
      atLeastSm: false,
      atMostXs: true,
      atMostSm: true,
      atMostMd: true,
      atMostLg: true,
      atMostXl: true,
    };
  }

  if (is2xl) breakpoint = "2xl";
  else if (isXl) breakpoint = "xl";
  else if (isLg) breakpoint = "lg";
  else if (isMd) breakpoint = "md";
  else if (isSm) breakpoint = "sm";
  else breakpoint = "xs";

  return {
    breakpoint,
    is2xl,
    isXl,
    isLg,
    isMd,
    isSm,
    isXs,
    atLeast2xl,
    atLeastXl,
    atLeastLg,
    atLeastMd,
    atLeastSm,
    atMostXs,
    atMostSm,
    atMostMd,
    atMostLg,
    atMostXl,
  };
}
