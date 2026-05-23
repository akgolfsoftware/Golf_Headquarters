"use client";

/**
 * KortForm — to-kolonne form for å legge til betalingskort.
 *
 * Pixel-perfekt iht. Variant A i Claude Design-bundle Sg2FEKvykU45c4naIgQx6w.
 * State-strip (IDLE/LOADING/ERROR/SUCCESS) er synlig under utvikling så vi
 * kan iterere på alle tilstandene i preview. Fjernes når Stripe-integrasjon
 * er ferdig.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Lock, ShieldCheck } from "lucide-react";
import { AthleticButton } from "@/components/athletic";

type State = "IDLE" | "LOADING" | "ERROR" | "SUCCESS";

const ALL_STATES: State[] = ["IDLE", "LOADING", "ERROR", "SUCCESS"];

function formatNesteBelastning(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function KortForm({
  defaultNavn,
  nesteBelastning,
}: {
  defaultNavn: string;
  nesteBelastning: string | null;
}) {
  const router = useRouter();
  const [state, setState] = useState<State>("IDLE");
  const [hovedkort, setHovedkort] = useState(true);
  const [, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("LOADING");
    setTimeout(() => {
      setState("SUCCESS");
      setTimeout(() => {
        startTransition(() => {
          router.push("/portal/meg/abonnement?ok=kort-lagt-til");
        });
      }, 1200);
    }, 1400);
  }

  return (
    <div className="space-y-4">
      {/* State-strip — kun synlig i dev for å iterere på tilstander */}
      {process.env.NODE_ENV !== "production" ? (
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            STATE
          </span>
          <div className="flex gap-1 rounded-full border border-border bg-card p-1">
            {ALL_STATES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setState(s)}
                className={`font-mono rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] transition ${
                  state === s
                    ? "bg-primary text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-7 lg:grid-cols-[1.4fr_1fr]">
        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-7"
        >
          {state !== "IDLE" ? (
            <div className="mb-4">
              <StateBanner state={state} />
            </div>
          ) : null}

          <div className="space-y-4">
            <StripeField
              label="Kortnummer"
              placeholder="4242 4242 4242 4242"
              value={state !== "IDLE" ? "4242 4242 4242 4242" : ""}
              brands
              focused={state === "IDLE"}
            />

            <div className="grid grid-cols-2 gap-4">
              <StripeField
                label="Utløpsdato"
                placeholder="MM / ÅÅ"
                value={state !== "IDLE" ? "04 / 28" : ""}
              />
              <StripeField
                label="CVC"
                placeholder="3 siffer"
                value={state !== "IDLE" ? "•••" : ""}
                error={state === "ERROR" ? "Kortet ble avvist" : null}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FieldStack label="Postnummer">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  className="h-11 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue={state !== "IDLE" ? "0264" : ""}
                  placeholder="0000"
                />
              </FieldStack>
              <FieldStack label="Land">
                <select
                  defaultValue="NO"
                  className="h-11 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="NO">Norge</option>
                  <option value="SE">Sverige</option>
                  <option value="DK">Danmark</option>
                </select>
              </FieldStack>
            </div>

            <FieldStack label="Navn på kortet">
              <input
                type="text"
                className="h-11 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue={state !== "IDLE" ? defaultNavn : ""}
                placeholder="Som det står på kortet"
              />
            </FieldStack>

            <label className="flex cursor-pointer items-start gap-3 pt-1">
              <button
                type="button"
                onClick={() => setHovedkort((v) => !v)}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition ${
                  hovedkort
                    ? "border-primary bg-primary text-accent"
                    : "border-input bg-card text-transparent"
                }`}
                aria-pressed={hovedkort}
                aria-label="Sett som hovedkort"
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </button>
              <div className="text-sm leading-tight">
                <div className="font-medium text-foreground">Sett som hovedkort</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Brukes for fremtidige PRO-fakturaer (kr 249/mnd)
                </div>
              </div>
            </label>

            <div className="mt-2 flex items-start gap-3 rounded-md border border-border bg-muted/40 p-3">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="text-xs leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Vi lagrer aldri kortdata.</strong>{" "}
                Betalingen håndteres av Stripe. AK Golf får kun et token — kortnummeret
                forlater aldri din enhet ukryptert.
              </div>
            </div>
          </div>

          <div className="mt-7 flex items-center justify-end gap-2 border-t border-border pt-5">
            <AthleticButton
              type="button"
              variant="ghost-light"
              size="md"
              onClick={() => router.push("/portal/meg/abonnement")}
            >
              Avbryt
            </AthleticButton>
            <AthleticButton
              type="submit"
              variant="lime"
              size="md"
              disabled={state === "LOADING" || state === "SUCCESS"}
            >
              {state === "LOADING"
                ? "Verifiserer …"
                : state === "SUCCESS"
                  ? "Lagt til"
                  : "Legg til kort"}
            </AthleticButton>
          </div>
        </form>

        {/* SIDE: preview + summary */}
        <div className="flex flex-col gap-4">
          <CardPreview navn={defaultNavn || "Kortholder"} />

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              NESTE BELASTNING
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="font-display text-2xl font-bold tracking-tight">
                kr 249,–
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                {formatNesteBelastning(nesteBelastning)}
              </div>
            </div>
            <div className="font-mono mt-2 text-[11px] leading-relaxed text-muted-foreground">
              PRO · månedlig · fornyes automatisk. Kanselleres når som helst fra
              abonnement-siden.
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="font-mono mb-2 text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              SIKKERHET
            </div>
            <ul className="space-y-2 text-sm">
              {[
                "PCI-DSS Level 1",
                "3-D Secure 2 (Strong Customer Auth)",
                "Tokens roteres ved hver belastning",
              ].map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-foreground">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────── primitives ──

function FieldStack({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function StripeField({
  label,
  placeholder,
  value,
  brands = false,
  focused = false,
  error,
}: {
  label: string;
  placeholder: string;
  value?: string;
  brands?: boolean;
  focused?: boolean;
  error?: string | null;
}) {
  return (
    <FieldStack label={label}>
      <div
        className={`flex h-11 items-center justify-between rounded-md border bg-card px-3 text-sm transition ${
          focused ? "border-primary ring-2 ring-primary/15" : "border-input"
        } ${error ? "border-destructive ring-2 ring-destructive/15" : ""}`}
      >
        {value ? (
          <span className="text-foreground">{value}</span>
        ) : (
          <span className="text-muted-foreground/60">{placeholder}</span>
        )}
        {brands ? (
          <div className="flex items-center gap-1">
            <CardBrand label="VISA" colorClass="text-[#1A1F71]" />
            <CardBrand label="M" colorClass="text-[#EB001B]" />
            <CardBrand label="AMEX" colorClass="text-[#006FCF]" />
          </div>
        ) : null}
      </div>
      {error ? (
        <div className="font-mono text-[10px] uppercase tracking-[0.04em] text-destructive">
          {error}
        </div>
      ) : null}
    </FieldStack>
  );
}

function CardBrand({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span
      className={`font-mono inline-flex h-5 items-center rounded-sm border border-border bg-card px-1.5 text-[9px] font-bold tracking-tight ${colorClass}`}
    >
      {label}
    </span>
  );
}

function StateBanner({ state }: { state: State }) {
  if (state === "LOADING") {
    return (
      <div className="flex items-center gap-3 rounded-md border border-primary/20 bg-primary/5 p-3">
        <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-primary/40" />
        <span className="font-mono text-xs uppercase tracking-[0.04em] text-primary">
          Sender til Stripe · venter på autorisasjon …
        </span>
      </div>
    );
  }
  if (state === "ERROR") {
    return (
      <div className="flex items-start gap-3 rounded-md border border-destructive/25 border-l-[3px] border-l-destructive bg-destructive/10 p-3">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-destructive">
          Avvist:
        </span>
        <span className="text-sm leading-relaxed">
          Kortet ble avvist av banken (kode{" "}
          <code className="font-mono">card_declined</code>). Prøv et annet kort, eller
          kontakt banken.
        </span>
      </div>
    );
  }
  if (state === "SUCCESS") {
    return (
      <div className="flex items-center gap-3 rounded-md border border-accent/55 bg-accent/30 p-3">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-accent">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
        <span className="text-sm">
          <strong>Kort lagt til.</strong> Sender deg tilbake til abonnement …
        </span>
      </div>
    );
  }
  return null;
}

function CardPreview({ navn }: { navn: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
      style={{
        background:
          "linear-gradient(135deg, #003A2A 0%, #005840 60%, #007054 100%)",
        aspectRatio: "1.586 / 1",
      }}
    >
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-accent/10 blur-2xl" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="h-7 w-10 rounded-sm bg-gradient-to-br from-amber-300 to-amber-500/60" />
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
            AK GOLF · PRO
          </div>
        </div>
        <div className="font-mono text-base tracking-[0.18em] text-white/95">
          ••••  ••••  ••••  4242
        </div>
        <div className="flex items-end justify-between text-[10px]">
          <div className="font-mono uppercase tracking-[0.14em] text-white/55">
            Kortholder
            <div className="font-display mt-0.5 text-xs font-semibold text-white">
              {navn}
            </div>
          </div>
          <div className="font-mono uppercase tracking-[0.14em] text-white/55">
            Utløp
            <div className="font-display mt-0.5 text-xs font-semibold text-white">
              04 / 28
            </div>
          </div>
          <ShieldCheck className="h-4 w-4 text-accent" />
        </div>
      </div>
    </div>
  );
}
