"use client";

// Global toast-system for AK Golf-portalen.
//
// Bruk:
//   const toast = useToast();
//   toast.success("Sendt til Anders");
//   toast.error("Kunne ikke lagre. Sjekk nett.");
//   toast.info("Coach Anders K leste meldingen din");
//
// Stack med maks 3 toasts. Auto-dismiss etter 3 sekunder.
// Pill-shape, bunn-senter, lime accent på success, danger på error.
// Animasjon: slide-up fra bunn + fade-out.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlertCircle, Check, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";

type ToastItem = {
  id: number;
  kind: ToastKind;
  text: string;
};

type ToastApi = {
  success: (text: string) => void;
  error: (text: string) => void;
  info: (text: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 3000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);
  const timersRef = useRef<Map<number, number>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (kind: ToastKind, text: string) => {
      counterRef.current += 1;
      const id = counterRef.current;
      setToasts((prev) => {
        const next = [...prev, { id, kind, text }];
        if (next.length > MAX_TOASTS) {
          const dropped = next.shift();
          if (dropped) {
            const t = timersRef.current.get(dropped.id);
            if (t) {
              window.clearTimeout(t);
              timersRef.current.delete(dropped.id);
            }
          }
        }
        return next;
      });
      const timer = window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
    };
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (text) => push("success", text),
      error: (text) => push("error", text),
      info: (text) => push("info", text),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <ToastPill key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastPill({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const palette =
    item.kind === "success"
      ? "border-accent/70 bg-[#F4FBE0] text-foreground"
      : item.kind === "error"
        ? "border-destructive/40 bg-destructive text-destructive-foreground"
        : "border-border bg-card text-foreground";

  const iconColor =
    item.kind === "success"
      ? "text-primary"
      : item.kind === "error"
        ? "text-destructive-foreground"
        : "text-primary";

  const KindIcon =
    item.kind === "success" ? Check : item.kind === "error" ? AlertCircle : Info;

  return (
    <div
      role="status"
      className={[
        "pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-full border px-4 py-2.5 shadow-lg transition-all duration-200",
        palette,
        mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      ].join(" ")}
    >
      <KindIcon
        width={18}
        height={18}
        strokeWidth={1.75}
        aria-hidden
        className={iconColor}
      />
      <span className="flex-1 text-sm font-medium leading-tight">{item.text}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Lukk varsel"
        className="grid h-6 w-6 place-items-center rounded-full opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X width={14} height={14} strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Sikker fallback uten provider — slik at lokale komponenter ikke krasjer.
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      console.warn(
        "useToast() ble kalt uten ToastProvider — wrap layout med <ToastProvider>.",
      );
    }
    return {
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return ctx;
}
