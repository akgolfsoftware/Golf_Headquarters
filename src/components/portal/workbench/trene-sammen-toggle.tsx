"use client";

/**
 * TreneSammenToggle — gjenbrukbar form-komponent for "Trene alene eller
 * invitere kompiser?"-valget i ny-okt-flyten.
 *
 * Kontrollert komponent. Eier ikke state — gir et felles UI for å velge
 * privat/delt + maks antall deltakere. Brukes både i wizards og i
 * sesjons-detaljside hvor host vil endre delt-status (TODO i v2).
 */

import { Lock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export type TreneSammenValue = {
  /** false = privat (default), true = delt med inviterte kompiser */
  isShared: boolean;
  /** Maks antall deltakere inkl. host. Null = ingen grense. */
  maxParticipants: number | null;
};

export type TreneSammenToggleProps = {
  value: TreneSammenValue;
  onChange: (v: TreneSammenValue) => void;
  className?: string;
};

const MAX_VALG = [2, 3, 4, 6, 8] as const;

export function TreneSammenToggle({
  value,
  onChange,
  className,
}: TreneSammenToggleProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        Hvem trener du med?
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <ToggleCard
          icon={Lock}
          tittel="Trene alene"
          undertekst="Privat økt, kun synlig for deg og din coach."
          selected={!value.isShared}
          onClick={() =>
            onChange({ ...value, isShared: false, maxParticipants: null })
          }
        />
        <ToggleCard
          icon={Users}
          tittel="Invitere kompiser"
          undertekst="Del økta med 1–7 andre spillere."
          selected={value.isShared}
          onClick={() =>
            onChange({
              ...value,
              isShared: true,
              maxParticipants: value.maxParticipants ?? 4,
            })
          }
        />
      </div>

      {value.isShared && (
        <div className="rounded-md border border-border bg-secondary/40 p-4">
          <label className="block">
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              Maks deltakere (inkl. deg)
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {MAX_VALG.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() =>
                    onChange({ ...value, maxParticipants: n })
                  }
                  aria-pressed={value.maxParticipants === n}
                  className={cn(
                    "inline-flex min-h-9 items-center rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                    value.maxParticipants === n
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground border border-border hover:bg-muted",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            Etter at økten er opprettet kan du invitere spillere fra
            sesjons-siden.
          </p>
        </div>
      )}
    </div>
  );
}

function ToggleCard({
  icon: Icon,
  tittel,
  undertekst,
  selected,
  onClick,
}: {
  icon: typeof Lock;
  tittel: string;
  undertekst: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex items-start gap-2 rounded-lg border-2 p-4 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:bg-secondary/40",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          selected
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-foreground",
        )}
      >
        <Icon size={16} strokeWidth={2} aria-hidden />
      </span>
      <span>
        <span className="block text-sm font-semibold text-foreground">
          {tittel}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {undertekst}
        </span>
      </span>
    </button>
  );
}
