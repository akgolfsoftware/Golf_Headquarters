"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "info" | "success" | "warning" | "danger";

type Toast = {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
};

type ToastContextValue = {
  showToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast må brukes innenfor <ToastProvider>");
  return ctx;
}

const variantConfig: Record<
  ToastVariant,
  { icon: typeof Info; bgClass: string; iconClass: string }
> = {
  info: {
    icon: Info,
    bgClass: "bg-card border-info/40",
    iconClass: "text-info",
  },
  success: {
    icon: CheckCircle,
    bgClass: "bg-card border-success/40",
    iconClass: "text-success",
  },
  warning: {
    icon: AlertTriangle,
    bgClass: "bg-card border-warning/40",
    iconClass: "text-warning",
  },
  danger: {
    icon: AlertCircle,
    bgClass: "bg-card border-destructive/40",
    iconClass: "text-destructive",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    const duration = toast.duration ?? 5000;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const config = variantConfig[t.variant];
          const IconComponent = config.icon;
          return (
            <div
              key={t.id}
              role="status"
              aria-live="polite"
              className={cn(
                "pointer-events-auto flex items-start gap-2 rounded-xl border p-4 shadow-lg",
                "animate-in slide-in-from-right fade-in duration-200",
                config.bgClass,
              )}
            >
              <IconComponent
                size={18}
                strokeWidth={1.75}
                className={cn("mt-0.5 shrink-0", config.iconClass)}
                aria-hidden
              />
              <div className="flex-1 space-y-0.5 min-w-0">
                <p className="font-semibold text-sm leading-tight">{t.title}</p>
                {t.description && (
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Lukk varsel"
              >
                <X size={14} aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
