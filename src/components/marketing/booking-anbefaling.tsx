"use client";

/**
 * BookingAnbefaling — kort anbefalingsquiz som åpnes fra "Book"-CTA-en.
 *
 * Anders' ønske: ved trykk på "book" svarer besøkende på et par spørsmål
 * (bor du i Fredrikstad-området? hvor ofte trener du?) og får en konkret
 * anbefaling om hvilken time/tjeneste som passer best. Anbefalingen lenker
 * til ekte ruter: Flex-time via /booking/[slug], pakker via /coaching og
 * /kontakt, PlayerHQ via /playerhq. Ingen død knapp, ingen fabrikkert pris.
 *
 * NB (forretningslogikk): mappingen under er en sensibel v1. Anders skal
 * godkjenne hvilke svar som peker til hvilken tjeneste.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";

type Freq = "sjelden" | "ukentlig" | "ofte";

type Anbefaling = {
  title: string;
  reason: string;
  cta: string;
  href: string;
};

function anbefal(local: boolean, freq: Freq): Anbefaling {
  if (!local) {
    return {
      title: "PlayerHQ",
      reason:
        "Bor du utenfor Fredrikstad-området, får du mest ut av PlayerHQ. Treningsplan, statistikk og AI-coach i appen uansett hvor du er, og du kan booke en drop-in når du er innom.",
      cta: "Få PlayerHQ",
      href: "/playerhq",
    };
  }
  if (freq === "sjelden") {
    return {
      title: "Flex 50 min med Anders",
      reason:
        "Trener du sjelden, er en grundig enkelt-time det beste startpunktet. Ingen binding, og vi kartlegger hvor du står.",
      cta: "Book Flex 50 min",
      href: "/booking/anders-flex-50",
    };
  }
  if (freq === "ukentlig") {
    return {
      title: "Performance",
      reason:
        "Trener du én til to ganger i uka, gir Performance deg fast oppfølging, en periodisert plan og PlayerHQ inkludert.",
      cta: "Se Performance",
      href: "/coaching",
    };
  }
  return {
    title: "Performance Pro",
    reason:
      "Trener du tre ganger i uka eller mer, passer Performance Pro best. Full analyse av hver runde, fysisk program i planen og turneringsforberedelser.",
    cta: "Søk opptak",
    href: "/kontakt",
  };
}

const FREKVENS: { key: Freq; label: string; hint: string }[] = [
  { key: "sjelden", label: "Sjelden", hint: "Av og til, ingen fast rutine" },
  { key: "ukentlig", label: "1 til 2 ganger i uka", hint: "Jevn trening" },
  { key: "ofte", label: "3 ganger eller mer", hint: "Satser for fullt" },
];

export function BookingAnbefaling({
  triggerClassName,
  triggerLabel = "Book coachingtime",
  withArrow = true,
}: {
  triggerClassName?: string;
  triggerLabel?: string;
  withArrow?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<boolean | null>(null);
  const [freq, setFreq] = useState<Freq | null>(null);

  // Lukk på Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function reset() {
    setLocal(null);
    setFreq(null);
  }

  function close() {
    setOpen(false);
    // La utgangs-animasjon/innhold stå til neste åpning; nullstill ved ny start.
    setTimeout(reset, 200);
  }

  const result = local !== null && freq !== null ? anbefal(local, freq) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "inline-flex h-[52px] items-center justify-center gap-1.5 rounded-full bg-accent px-6 font-display text-[16px] font-bold tracking-[-0.005em] text-accent-foreground shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:-translate-y-px hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        }
      >
        {triggerLabel}
        {withArrow && <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.5} />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Finn riktig coachingtime"
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Lukk"
            onClick={close}
            className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-[460px] overflow-hidden rounded-t-3xl border border-border bg-card shadow-2xl sm:rounded-3xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Finn din coachingtime
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Lukk"
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="px-6 py-6">
              {/* Steg 1 */}
              <div className="mb-6">
                <p className="font-display text-[18px] font-bold tracking-[-0.015em] text-foreground">
                  Bor du i Fredrikstad-området?
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { v: true, label: "Ja" },
                    { v: false, label: "Nei" },
                  ].map((o) => (
                    <button
                      key={o.label}
                      type="button"
                      onClick={() => setLocal(o.v)}
                      className={`rounded-xl border px-4 py-3 text-[15px] font-semibold transition ${
                        local === o.v
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:bg-secondary"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Steg 2 */}
              <div>
                <p className="font-display text-[18px] font-bold tracking-[-0.015em] text-foreground">
                  Hvor ofte trener du?
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {FREKVENS.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFreq(f.key)}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                        freq === f.key
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:bg-secondary"
                      }`}
                    >
                      <span>
                        <span className="block text-[15px] font-semibold text-foreground">
                          {f.label}
                        </span>
                        <span className="block text-[12px] text-muted-foreground">
                          {f.hint}
                        </span>
                      </span>
                      {freq === f.key && (
                        <Check className="h-[18px] w-[18px] shrink-0 text-primary" strokeWidth={2} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resultat */}
              {result && (
                <div className="mt-6 rounded-2xl border border-primary/25 bg-secondary/60 p-5">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                    Anbefalt for deg
                  </span>
                  <p className="mt-1.5 font-display text-[22px] font-bold leading-[1.1] tracking-[-0.02em] text-foreground">
                    {result.title}
                  </p>
                  <p className="mt-2 text-[14px] leading-[1.55] text-muted-foreground">
                    {result.reason}
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link
                      href={result.href}
                      onClick={close}
                      className="inline-flex h-12 items-center justify-center gap-1.5 rounded-full bg-accent px-5 font-display text-[15px] font-bold text-accent-foreground transition hover:brightness-105"
                    >
                      {result.cta}
                      <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    </Link>
                    <Link
                      href="/booking"
                      onClick={close}
                      className="inline-flex h-11 items-center justify-center rounded-xl px-5 font-display text-[14px] font-semibold text-primary ring-1 ring-inset ring-primary/40 transition hover:bg-primary/5"
                    >
                      Se alle tjenester
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
