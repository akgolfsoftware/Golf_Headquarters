"use client";

/**
 * OppgraderFlytWizard — mobil-først (430px) oppgraderings-flyt til PRO.
 *
 * Steg på én skjerm: verdi → velg betaling (månedlig/årlig) → bekreft.
 * Bekreft åpner ekte Stripe Checkout via POST /api/stripe/checkout (samme
 * sti som UpgradeButton). Stripe styrer faktisk pris/plan — UI viser PRO.
 *
 * Kun DS-token-klasser. Ingen emoji (lucide). Pris: 300 kr/mnd.
 */

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Sparkles,
  Crosshair,
  Video,
  CalendarDays,
  BarChart3,
  Users,
  Check,
  Lock,
  ArrowRight,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { AthleticButton } from "@/components/athletic";

type Sykel = "monthly" | "yearly";

const FORDELER: { icon: LucideIcon; tittel: string; meta: string }[] = [
  { icon: Sparkles, tittel: "AI-coach 24/7", meta: "Svar tilpasset dine TrackMan-data" },
  { icon: Crosshair, tittel: "4 coaching-credits / mnd", meta: "1:1-time, video eller treningsuke" },
  { icon: Video, tittel: "Videoanalyse", meta: "Coach tegner linjer og vinkler" },
  { icon: CalendarDays, tittel: "Smart planlegger", meta: "Pyramide-balansert ukeplan" },
  { icon: BarChart3, tittel: "Komplett historikk", meta: "Alle runder og økter, ubegrenset" },
  { icon: Users, tittel: "Familiekonto", meta: "Opptil 3 sammenkoblinger" },
];

export function OppgraderFlytWizard() {
  const [sykel, setSykel] = useState<Sykel>("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBekreft() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const { url } = await res.json();
      if (!url) throw new Error("Mangler checkout-URL");
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke åpne checkout.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-20 sm:px-6">
      {/* Tilbake */}
      <Link
        href="/portal/meg/abonnement"
        className="inline-flex min-h-11 items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
        Abonnement
      </Link>

      {/* Header */}
      <header className="mt-3 space-y-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          PlayerHQ · Meg · Abonnement · Oppgrader
        </span>
        <h1 className="font-display text-[28px] font-bold leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[34px]">
          Løft spillet med{" "}
          <em
            className="not-italic"
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontStyle: "italic",
              color: "hsl(var(--primary))",
            }}
          >
            Pro
          </em>
        </h1>
        <p className="text-sm text-muted-foreground">
          AI-coach hele døgnet, videoanalyse og komplett historikk. Avbryt når som
          helst — første 30 dager er angreretten din.
        </p>
      </header>

      {/* Pris-hero */}
      <section className="mt-6 overflow-hidden rounded-2xl bg-primary p-6 text-accent">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-accent/70">
          Din pris
        </span>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-mono text-5xl font-extrabold leading-none tabular-nums">
            {sykel === "monthly" ? "300" : "3 060"}
          </span>
          <span className="font-mono text-base font-bold text-accent/70">
            {sykel === "monthly" ? "kr / mnd" : "kr / år"}
          </span>
        </div>
        <p className="mt-2 text-sm text-accent/80">
          {sykel === "monthly"
            ? "Alt inkludert. Fri pause, fri avbestilling."
            : "Spar ~14 % mot månedlig (3 600 kr). Faktureres årlig."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["AI-coach 24/7", "4 credits/mnd", "Videoanalyse", "Familiekonto"].map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em]"
            >
              <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden />
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* Betalingssyklus */}
      <h2 className="mb-3 mt-8 font-display text-base font-bold tracking-[-0.015em] text-foreground">
        Velg betaling
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <SykelKort
          valgt={sykel === "monthly"}
          onClick={() => setSykel("monthly")}
          tittel="Månedlig"
          pris="300 kr / mnd"
          note="Mest fleksibelt"
        />
        <SykelKort
          valgt={sykel === "yearly"}
          onClick={() => setSykel("yearly")}
          tittel="Årlig"
          pris="3 060 kr / år"
          note="Spar ~14 %"
          badge="Best verdi"
        />
      </div>

      {/* Fordeler */}
      <h2 className="mb-3 mt-8 font-display text-base font-bold tracking-[-0.015em] text-foreground">
        Dette får du
      </h2>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {FORDELER.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={f.tittel}
              className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}
            >
              <span className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-primary/[0.08] text-primary">
                <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="text-[14px] font-semibold leading-tight tracking-[-0.005em] text-foreground">
                  {f.tittel}
                </span>
                <span className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
                  {f.meta}
                </span>
              </span>
              <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
            </div>
          );
        })}
      </div>

      {/* Feil */}
      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      {/* Bekreft */}
      <div className="mt-6 space-y-3">
        <AthleticButton
          type="button"
          variant="lime"
          size="lg"
          className="w-full"
          onClick={handleBekreft}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden />
              Åpner Stripe …
            </>
          ) : (
            <>
              Fortsett til betaling
              <ArrowRight className="h-4 w-4" strokeWidth={2.2} aria-hidden />
            </>
          )}
        </AthleticButton>
        <p className="flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          <Lock className="h-3 w-3 text-primary" strokeWidth={2} aria-hidden />
          Sikker betaling · Stripe
        </p>
      </div>
    </div>
  );
}

function SykelKort({
  valgt,
  onClick,
  tittel,
  pris,
  note,
  badge,
}: {
  valgt: boolean;
  onClick: () => void;
  tittel: string;
  pris: string;
  note: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={valgt}
      className={`relative flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition ${
        valgt
          ? "border-primary bg-primary/[0.06] ring-1 ring-primary"
          : "border-border bg-card hover:bg-secondary/40"
      }`}
    >
      {badge ? (
        <span className="absolute right-3 top-3 rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-accent-foreground">
          {badge}
        </span>
      ) : null}
      <span className="font-display text-[15px] font-bold tracking-[-0.012em] text-foreground">
        {tittel}
      </span>
      <span className="font-mono text-[12px] font-bold tabular-nums text-foreground">{pris}</span>
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
        {note}
      </span>
      <span
        className={`mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full border ${
          valgt ? "border-primary bg-primary text-accent" : "border-input bg-card text-transparent"
        }`}
        aria-hidden
      >
        <Check className="h-2.5 w-2.5" strokeWidth={3} />
      </span>
    </button>
  );
}
