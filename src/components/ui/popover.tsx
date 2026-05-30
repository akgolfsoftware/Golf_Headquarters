"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

/**
 * Popover-primitiv for AK Golf HQ.
 *
 * Bygd native (ingen Radix). Klikk-utenfor + Esc lukker. Posisjonering
 * skjer relativt til trigger med side/align-API.
 *
 * Trigger renderer alltid en native `<button>`. For å få en `Button`-styled
 * trigger, bruk `buttonClasses({ variant: "ghost-light" })` som className.
 *
 * Bruk:
 *   <Popover>
 *     <PopoverTrigger className={buttonClasses({ variant: "ghost-light", size: "sm" })}>
 *       Filter
 *     </PopoverTrigger>
 *     <PopoverContent side="bottom" align="start">
 *       <div className="p-4">Filtervalg</div>
 *     </PopoverContent>
 *   </Popover>
 *
 * NB: Plassér wrapper-elementet (f.eks. `<div className="relative">`) selv
 * rundt `<Popover>` hvis du vil at PopoverContent skal posisjoneres mot
 * en spesifikk container — ellers bruker den nærmeste positioned ancestor.
 */

type PopoverSide = "top" | "right" | "bottom" | "left";
type PopoverAlign = "start" | "center" | "end";

type PopoverContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentId: string;
};

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext(component: string) {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error(`${component} må brukes innenfor <Popover>`);
  return ctx;
}

type PopoverProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function Popover({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const contentId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef, contentId }}>
      {children}
    </PopoverContext.Provider>
  );
}

type PopoverTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function PopoverTrigger({
  className,
  onClick,
  children,
  ...rest
}: PopoverTriggerProps) {
  const { open, setOpen, triggerRef, contentId } =
    usePopoverContext("PopoverTrigger");

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    e.stopPropagation();
    setOpen(!open);
  };

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={handleClick}
      aria-expanded={open}
      aria-controls={contentId}
      aria-haspopup="dialog"
      className={cn("inline-flex", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

const sideOffsetClasses: Record<PopoverSide, string> = {
  top: "bottom-full mb-2",
  right: "left-full ml-2",
  bottom: "top-full mt-2",
  left: "right-full mr-2",
};

const alignClasses: Record<PopoverSide, Record<PopoverAlign, string>> = {
  top: {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  },
  bottom: {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  },
  left: { start: "top-0", center: "top-1/2 -translate-y-1/2", end: "bottom-0" },
  right: {
    start: "top-0",
    center: "top-1/2 -translate-y-1/2",
    end: "bottom-0",
  },
};

type PopoverContentProps = {
  side?: PopoverSide;
  align?: PopoverAlign;
  className?: string;
  children: React.ReactNode;
};

export function PopoverContent({
  side = "bottom",
  align = "start",
  className,
  children,
}: PopoverContentProps) {
  const { open, setOpen, triggerRef, contentId } =
    usePopoverContext("PopoverContent");
  const contentRef = useRef<HTMLDivElement>(null);

  // Klikk-utenfor + Esc lukker.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        contentRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      )
        return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen, triggerRef]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      id={contentId}
      role="dialog"
      className={cn(
        "absolute z-50 min-w-[12rem] rounded-lg border border-border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in zoom-in-95 duration-100",
        sideOffsetClasses[side],
        alignClasses[side][align],
        className,
      )}
    >
      {children}
    </div>
  );
}
