"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Composable dialog/modal-primitiv for AK Golf HQ.
 *
 * Bygd native (ingen Radix) for å matche prosjektets dependency-stil.
 * Mobil: slide-up sheet med rundet topp. Desktop: sentrert modal med fade+scale.
 *
 * Bruk:
 *   <Dialog open={open} onOpenChange={setOpen}>
 *     <DialogContent size="md">
 *       <DialogHeader>
 *         <DialogTitle>Ny økt</DialogTitle>
 *         <DialogDescription>Velg type og dato.</DialogDescription>
 *       </DialogHeader>
 *       <div>Innhold</div>
 *       <DialogFooter>
 *         <Button variant="ghost-light" onClick={() => setOpen(false)}>Avbryt</Button>
 *         <Button>Opprett</Button>
 *       </DialogFooter>
 *     </DialogContent>
 *   </Dialog>
 */

type DialogContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
};

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext(component: string) {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error(`${component} må brukes innenfor <Dialog>`);
  }
  return ctx;
}

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  // Esc lukker, body-scroll låses mens åpen.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = orig;
    };
  }, [open, onOpenChange]);

  return (
    <DialogContext.Provider
      value={{ open, onOpenChange, titleId, descriptionId }}
    >
      {children}
    </DialogContext.Provider>
  );
}

const sizeClasses = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  full: "sm:max-w-[calc(100vw-4rem)]",
} as const;

type DialogContentProps = {
  size?: keyof typeof sizeClasses;
  showCloseButton?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function DialogContent({
  size = "md",
  showCloseButton = true,
  className,
  children,
}: DialogContentProps) {
  const { open, onOpenChange, titleId, descriptionId } =
    useDialogContext("DialogContent");
  const contentRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        ref={contentRef}
        className={cn(
          "relative flex w-full max-h-[95vh] flex-col bg-card shadow-xl",
          "rounded-t-2xl animate-in slide-in-from-bottom duration-200",
          "sm:max-h-[90vh] sm:rounded-2xl sm:border sm:border-border sm:animate-in sm:fade-in sm:zoom-in-95",
          sizeClasses[size],
          className,
        )}
      >
        {showCloseButton && (
          <DialogClose
            className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X size={20} aria-hidden />
          </DialogClose>
        )}
        {children}
      </div>
    </div>
  );
}

type DialogHeaderProps = {
  className?: string;
  children: React.ReactNode;
};

export function DialogHeader({ className, children }: DialogHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-2 border-b border-border px-6 py-4 shrink-0",
        className,
      )}
    >
      {children}
    </header>
  );
}

type DialogTitleProps = {
  className?: string;
  children: React.ReactNode;
};

export function DialogTitle({ className, children }: DialogTitleProps) {
  const { titleId } = useDialogContext("DialogTitle");
  return (
    <h2
      id={titleId}
      className={cn("font-display text-lg font-bold leading-tight", className)}
    >
      {children}
    </h2>
  );
}

type DialogDescriptionProps = {
  className?: string;
  children: React.ReactNode;
};

export function DialogDescription({
  className,
  children,
}: DialogDescriptionProps) {
  const { descriptionId } = useDialogContext("DialogDescription");
  return (
    <p
      id={descriptionId}
      className={cn("text-sm text-muted-foreground", className)}
    >
      {children}
    </p>
  );
}

type DialogBodyProps = {
  className?: string;
  children: React.ReactNode;
};

export function DialogBody({ className, children }: DialogBodyProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-6 py-6", className)}>
      {children}
    </div>
  );
}

type DialogFooterProps = {
  className?: string;
  children: React.ReactNode;
};

export function DialogFooter({ className, children }: DialogFooterProps) {
  return (
    <footer
      className={cn(
        "flex items-center justify-end gap-2 border-t border-border px-6 py-4 pb-safe shrink-0",
        className,
      )}
    >
      {children}
    </footer>
  );
}

type DialogCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function DialogClose({
  onClick,
  children,
  ...rest
}: DialogCloseProps) {
  const { onOpenChange } = useDialogContext("DialogClose");
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) onOpenChange(false);
    },
    [onClick, onOpenChange],
  );
  return (
    <button type="button" onClick={handleClick} {...rest}>
      {children}
    </button>
  );
}
