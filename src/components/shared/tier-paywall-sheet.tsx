"use client";

// Tier-paywall-sheet — vises for GRATIS-brukere som prøver Pro-features.
//
// Bruk:
//   <TierPaywallSheet
//     open={open}
//     onClose={() => setOpen(false)}
//     feature="ai-foresla"
//   />
//
// `feature`-prop tilpasser tittel og subtitle. Komponenten er gjenbrukbar.

import Link from "next/link";
import { useEffect } from "react";
import { Check, Sparkles, X } from "lucide-react";

type ProFeature =
  | "ai-foresla"
  | "ai-coach"
  | "video-analyse"
  | "avansert-statistikk"
  | "ubegrenset-mal"
  | "generisk";

type FeatureCopy = {
  title: string;
  subtitle: string;
};

const FEATURE_COPY: Record<ProFeature, FeatureCopy> = {
  "ai-foresla": {
    title: "AI-foreslå er en Pro-feature",
    subtitle: "Lås opp AI-genererte øktforslag med Pro.",
  },
  "ai-coach": {
    title: "AI-coach er en Pro-feature",
    subtitle: "Få personlig coaching-respons hele døgnet med Pro.",
  },
  "video-analyse": {
    title: "Video-analyse er en Pro-feature",
    subtitle: "Last opp svinger og få instant feedback med Pro.",
  },
  "avansert-statistikk": {
    title: "Avansert statistikk er en Pro-feature",
    subtitle: "Drill ned i SG, banepoeng og trender med Pro.",
  },
  "ubegrenset-mal": {
    title: "Ubegrensede mål er en Pro-feature",
    subtitle: "Sett alle målene du vil, med oppfølging fra coach.",
  },
  generisk: {
    title: "Pro-feature",
    subtitle: "Oppgrader til Pro for å låse opp",
  },
};

const PRO_FORDELER: ReadonlyArray<string> = [
  "AI-coach 24/7 med personlig respons",
  "Video-analyse med svinge-feedback",
  "Avansert SG-statistikk og banepoeng",
  "Ubegrenset antall mål og milepæler",
  "AI-foreslå økter basert på data",
  "Tilgang til hele drill-biblioteket",
  "Personlig 21-dagers-plan før turnering",
  "Prioritert support fra coach",
];

type Props = {
  open: boolean;
  onClose: () => void;
  feature?: ProFeature;
};

export function TierPaywallSheet({ open, onClose, feature = "generisk" }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const copy = FEATURE_COPY[feature];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tier-paywall-title"
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border bg-secondary/40 px-6 py-6">
          <div className="flex items-start gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground">
              <Sparkles width={18} height={18} strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Pro-feature
              </span>
              <h2
                id="tier-paywall-title"
                className="font-display text-lg font-semibold leading-tight text-foreground"
              >
                {copy.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X width={16} height={16} strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <ul className="space-y-2">
            {PRO_FORDELER.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                  <Check width={12} height={12} strokeWidth={2} aria-hidden />
                </span>
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-4">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Pro-medlemskap
                </div>
                <div className="font-display text-2xl font-semibold text-foreground">
                  300 kr<span className="text-sm text-muted-foreground">/mnd</span>
                </div>
              </div>
              <span className="rounded-full bg-accent px-4 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-accent-foreground">
                Anbefalt
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Avbestilles når som helst. Ingen binding.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border bg-card px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Se mer
          </button>
          <Link
            href="/portal/meg/abonnement"
            onClick={onClose}
            className="rounded-full bg-accent px-6 py-2.5 text-center text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Oppgrader nå
          </Link>
        </div>
      </div>
    </div>
  );
}
