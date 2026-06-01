"use client";

/**
 * KortForm — mobil-først (430px) form for å legge til betalingskort.
 *
 * UI er en mockup av Stripe Elements-flyten med fire tilstander
 * (IDLE/LOADING/ERROR/SUCCESS). Selve Stripe-integrasjonen kobles opp i egen
 * runde — derfor simuleres innsending lokalt og leder tilbake til abonnement
 * ved suksess.
 *
 * Kun DS-token-klasser. Kort-preview bruker en forest-gradient (visuell
 * kort-mockup, ikke del av designsystemet). Pris: 300 kr/mnd (PRO).
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Lock, ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { AthleticButton } from "@/components/athletic";
import { Input } from "@/components/ui/input";

type State = "IDLE" | "LOADING" | "ERROR" | "SUCCESS";

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
  const [navn, setNavn] = useState(defaultNavn);
  const [, startTransition] = useTransition();

  const laast = state === "LOADING" || state === "SUCCESS";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("LOADING");
    // Mockup av Stripe-autorisasjon — erstattes av ekte Elements-kall.
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
      {/* Kort-preview */}
      <CardPreview navn={navn || "Kortholder"} />

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-border bg-card p-5"
      >
        {state !== "IDLE" ? <StateBanner state={state} /> : null}

        <Felt label="Kortnummer">
          <div className="flex h-11 items-center justify-between gap-2 rounded-md border border-input bg-card px-4 text-sm">
            <span className="text-muted-foreground/60">4242 4242 4242 4242</span>
            <span className="flex items-center gap-1">
              <Brand label="VISA" />
              <Brand label="MC" />
              <Brand label="AMEX" />
            </span>
          </div>
        </Felt>

        <div className="grid grid-cols-2 gap-3">
          <Felt label="Utløpsdato">
            <Input inputMode="numeric" placeholder="MM / ÅÅ" disabled={laast} />
          </Felt>
          <Felt label="CVC">
            <Input inputMode="numeric" placeholder="3 siffer" disabled={laast} />
          </Felt>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Felt label="Postnummer">
            <Input
              inputMode="numeric"
              pattern="[0-9]{4}"
              placeholder="0000"
              disabled={laast}
            />
          </Felt>
          <Felt label="Land">
            <select
              defaultValue="NO"
              disabled={laast}
              className="h-11 w-full rounded-md border border-input bg-card px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50"
            >
              <option value="NO">Norge</option>
              <option value="SE">Sverige</option>
              <option value="DK">Danmark</option>
            </select>
          </Felt>
        </div>

        <Felt label="Navn på kortet">
          <Input
            value={navn}
            onChange={(e) => setNavn(e.target.value)}
            placeholder="Som det står på kortet"
            disabled={laast}
          />
        </Felt>

        {/* Hovedkort-toggle */}
        <button
          type="button"
          onClick={() => setHovedkort((v) => !v)}
          disabled={laast}
          aria-pressed={hovedkort}
          className="flex w-full items-start gap-2.5 text-left disabled:opacity-50"
        >
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition ${
              hovedkort
                ? "border-primary bg-primary text-accent"
                : "border-input bg-card text-transparent"
            }`}
          >
            <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
          </span>
          <span className="text-[13px] leading-tight">
            <span className="block font-semibold text-foreground">Sett som hovedkort</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Brukes for fremtidige PRO-fakturaer (300 kr/mnd)
            </span>
          </span>
        </button>

        {/* Trygghet-note */}
        <div className="flex items-start gap-2.5 rounded-xl border border-border bg-secondary/40 p-3.5">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Vi lagrer aldri kortdata.</strong>{" "}
            Betalingen håndteres av Stripe — AK Golf får kun et token, kortnummeret
            forlater aldri din enhet ukryptert.
          </p>
        </div>

        {/* Handlinger */}
        <div className="flex flex-col gap-2 pt-1">
          <AthleticButton
            type="submit"
            variant="lime"
            size="lg"
            className="w-full"
            disabled={laast}
          >
            {state === "LOADING"
              ? "Verifiserer …"
              : state === "SUCCESS"
                ? "Lagt til"
                : "Legg til kort"}
          </AthleticButton>
          <AthleticButton
            type="button"
            variant="ghost-light"
            size="md"
            className="w-full"
            onClick={() => router.push("/portal/meg/abonnement")}
            disabled={laast}
          >
            Avbryt
          </AthleticButton>
        </div>
      </form>

      {/* Neste belastning */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
          Neste belastning
        </span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="font-display text-2xl font-bold tracking-[-0.02em] text-foreground">
            300 kr
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {formatNesteBelastning(nesteBelastning)}
          </span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          PRO · månedlig · fornyes automatisk. Kanselleres når som helst fra
          abonnement-siden.
        </p>
      </div>

      {/* Sikkerhet */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
          Sikkerhet
        </span>
        <ul className="mt-3 space-y-2 text-sm">
          {[
            "PCI-DSS Level 1",
            "3-D Secure 2 (Strong Customer Auth)",
            "Tokens roteres ved hver belastning",
          ].map((s) => (
            <li key={s} className="flex items-center gap-2.5">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
              </span>
              <span className="text-foreground">{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────── primitiver ──

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function Brand({ label }: { label: string }) {
  return (
    <span className="inline-flex h-5 items-center rounded-[4px] border border-border bg-card px-1.5 font-mono text-[9px] font-bold tracking-tight text-muted-foreground">
      {label}
    </span>
  );
}

function StateBanner({ state }: { state: State }) {
  if (state === "LOADING") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/[0.06] p-3.5">
        <Loader2 className="h-4 w-4 animate-spin text-primary" strokeWidth={2} aria-hidden />
        <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-primary">
          Sender til Stripe · venter på autorisasjon …
        </span>
      </div>
    );
  }
  if (state === "ERROR") {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-destructive/25 border-l-[3px] border-l-destructive bg-destructive/10 p-3.5">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" strokeWidth={2} aria-hidden />
        <span className="text-[13px] leading-relaxed text-foreground">
          Kortet ble avvist av banken. Prøv et annet kort, eller kontakt banken.
        </span>
      </div>
    );
  }
  if (state === "SUCCESS") {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-accent/55 bg-accent/30 p-3.5">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-accent">
          <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
        </span>
        <span className="text-[13px] text-foreground">
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
        background: "linear-gradient(135deg, #003A2A 0%, #005840 60%, #007054 100%)",
        aspectRatio: "1.586 / 1",
      }}
    >
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-accent/10 blur-2xl" aria-hidden />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="h-7 w-10 rounded-sm bg-gradient-to-br from-amber-300 to-amber-500/60" aria-hidden />
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
            AK GOLF · PRO
          </div>
        </div>
        <div className="font-mono text-base tracking-[0.18em] text-white/95">
          ••••&nbsp;&nbsp;••••&nbsp;&nbsp;••••&nbsp;&nbsp;4242
        </div>
        <div className="flex items-end justify-between text-[10px]">
          <div className="font-mono uppercase tracking-[0.14em] text-white/55">
            Kortholder
            <div className="mt-0.5 truncate font-display text-xs font-semibold text-white">
              {navn}
            </div>
          </div>
          <div className="font-mono uppercase tracking-[0.14em] text-white/55">
            Utløp
            <div className="mt-0.5 font-display text-xs font-semibold text-white">MM / ÅÅ</div>
          </div>
          <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={1.75} aria-hidden />
        </div>
      </div>
    </div>
  );
}
