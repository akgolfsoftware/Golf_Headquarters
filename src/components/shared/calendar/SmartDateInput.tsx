"use client";

// SmartDateInput — input som oversetter naturlig språk til dato via /api/parse-date.
//
// Brukes for ankere, økt-oppretting og bulk-generering. Viser tolket dato +
// konfidens umiddelbart mens brukeren skriver.

import { useEffect, useRef, useState } from "react";
import { Sparkles, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  /** Initiell verdi (visning). */
  defaultValue?: string;
  /** Kalles når brukeren har skrevet en gyldig dato. */
  onChange?: (dato: Date | null, forklaring: string) => void;
  /** Spiller-id som brukes for turnering-ankere ("2 uker før Bossum Open"). */
  spilllerId?: string;
  placeholder?: string;
  className?: string;
  id?: string;
};

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; dato: Date; konfidens: number; forklaring: string }
  | { kind: "feil"; forklaring: string };

export function SmartDateInput({
  defaultValue = "",
  onChange,
  spilllerId,
  placeholder = "f.eks. neste mandag, 2 uker før Bossum Open",
  className,
  id,
}: Props) {
  const [tekst, setTekst] = useState(defaultValue);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (tekst.trim().length === 0) {
      setStatus({ kind: "idle" });
      onChange?.(null, "");
      return;
    }

    setStatus({ kind: "loading" });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/parse-date", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: tekst, spilllerId }),
        });
        if (!res.ok) {
          setStatus({ kind: "feil", forklaring: "Tjenesten svarte ikke" });
          return;
        }
        const data = (await res.json()) as {
          dato: string | null;
          konfidens: number;
          forklaring: string;
        };
        if (data.dato) {
          const d = new Date(data.dato);
          setStatus({
            kind: "ok",
            dato: d,
            konfidens: data.konfidens,
            forklaring: data.forklaring,
          });
          onChange?.(d, data.forklaring);
        } else {
          setStatus({ kind: "feil", forklaring: data.forklaring });
          onChange?.(null, data.forklaring);
        }
      } catch (err) {
        console.error(err);
        setStatus({ kind: "feil", forklaring: "Kunne ikke tolke" });
      }
    }, 350);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tekst, spilllerId]);

  return (
    <div className={cn("flex w-full flex-col gap-1", className)}>
      <div className="relative">
        <Sparkles
          size={16}
          strokeWidth={1.5}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          id={id}
          type="text"
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-md border border-input bg-card pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {status.kind === "loading" && (
            <span className="text-xs text-muted-foreground">…</span>
          )}
          {status.kind === "ok" && (
            <Check size={16} strokeWidth={1.5} className="text-pyr-fys" />
          )}
          {status.kind === "feil" && (
            <AlertCircle size={16} strokeWidth={1.5} className="text-destructive" />
          )}
        </span>
      </div>

      {status.kind === "ok" && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {status.dato.toLocaleDateString("no-NO", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span>· {status.forklaring}</span>
          <span className="tabular-nums">({(status.konfidens * 100).toFixed(0)}%)</span>
        </div>
      )}
      {status.kind === "feil" && (
        <div className="text-xs text-destructive">{status.forklaring}</div>
      )}
    </div>
  );
}
