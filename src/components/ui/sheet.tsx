"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Side-slide sheet-primitiv for AK Golf HQ.
 *
 * Brukt for mobile nav-drawer, filter-paneler, kommando-paletter,
 * og alle sider med kontekstuell innholdsliste fra venstre eller høyre.
 *
 * Bruk:
 *   <Sheet open={open} onOpenChange={setOpen}>
 *     <SheetContent side="right" size="md">
 *       <SheetHeader>
 *         <SheetTitle>Filtre</SheetTitle>
 *       </SheetHeader>
 *       <div className="flex-1 overflow-y-auto p-6">…</div>
 *       <SheetFooter>
 *         <Button>Bruk filtre</Button>
 *       </SheetFooter>
 *     </SheetContent>
 *   </Sheet>
 */

type SheetSide = "left" | "right" | "top" | "bottom";

type SheetContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
};

const SheetContext = createContext<SheetContextValue | null>(null);

function useSheetContext(component: string) {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error(`${component} må brukes innenfor <Sheet>`);
  return ctx;
}

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  const titleId = useId();
  const descriptionId = useId();

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
    <SheetContext.Provider
      value={{ open, onOpenChange, titleId, descriptionId }}
    >
      {children}
    </SheetContext.Provider>
  );
}

const sideClasses: Record<SheetSide, string> = {
  left: "left-0 top-0 h-full border-r animate-in slide-in-from-left duration-200",
  right:
    "right-0 top-0 h-full border-l animate-in slide-in-from-right duration-200",
  top: "left-0 right-0 top-0 w-full border-b animate-in slide-in-from-top duration-200",
  bottom:
    "left-0 right-0 bottom-0 w-full border-t animate-in slide-in-from-bottom duration-200",
};

const sizeClasses = {
  sm: { x: "max-w-xs", y: "max-h-[30vh]" },
  md: { x: "max-w-sm", y: "max-h-[50vh]" },
  lg: { x: "max-w-md", y: "max-h-[70vh]" },
  xl: { x: "max-w-xl", y: "max-h-[85vh]" },
} as const;

type SheetContentProps = {
  side?: SheetSide;
  size?: keyof typeof sizeClasses;
  className?: string;
  showCloseButton?: boolean;
  children: React.ReactNode;
};

export function SheetContent({
  side = "right",
  size = "md",
  showCloseButton = true,
  className,
  children,
}: SheetContentProps) {
  const { open, onOpenChange, titleId, descriptionId } =
    useSheetContext("SheetContent");

  if (!open) return null;

  const isHorizontal = side === "left" || side === "right";
  const dimensionClass = isHorizontal
    ? `w-full ${sizeClasses[size].x}`
    : `h-full ${sizeClasses[size].y}`;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        className={cn(
          "absolute flex flex-col bg-card shadow-xl border-border",
          sideClasses[side],
          dimensionClass,
          className,
        )}
      >
        {showCloseButton && (
          <SheetClose
            className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X size={20} aria-hidden />
          </SheetClose>
        )}
        {children}
      </div>
    </div>
  );
}

type SheetHeaderProps = {
  className?: string;
  children: React.ReactNode;
};

export function SheetHeader({ className, children }: SheetHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-1 border-b border-border px-6 py-4 shrink-0",
        className,
      )}
    >
      {children}
    </header>
  );
}

export function SheetTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { titleId } = useSheetContext("SheetTitle");
  return (
    <h2
      id={titleId}
      className={cn("font-display text-lg font-bold leading-tight", className)}
    >
      {children}
    </h2>
  );
}

export function SheetDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { descriptionId } = useSheetContext("SheetDescription");
  return (
    <p
      id={descriptionId}
      className={cn("text-sm text-muted-foreground", className)}
    >
      {children}
    </p>
  );
}

export function SheetFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
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

type SheetCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function SheetClose({ onClick, children, ...rest }: SheetCloseProps) {
  const { onOpenChange } = useSheetContext("SheetClose");
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
