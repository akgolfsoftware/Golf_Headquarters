"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
};

/**
 * Lightweight tooltip uten ekstra deps.
 *
 * Bruk:
 * <Tooltip content="Forklaring av dette feltet">
 *   <button>?</button>
 * </Tooltip>
 */
export function Tooltip({
  content,
  children,
  side = "top",
  delay = 200,
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const sideClasses = {
    top: "-top-1 left-1/2 -translate-x-1/2 -translate-y-full",
    bottom: "-bottom-1 left-1/2 -translate-x-1/2 translate-y-full",
    left: "left-0 top-1/2 -translate-x-full -translate-y-1/2 -ml-1",
    right: "right-0 top-1/2 translate-x-full -translate-y-1/2 -mr-1",
  } as const;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={cn(
            "absolute z-50 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md",
            sideClasses[side],
            className,
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
