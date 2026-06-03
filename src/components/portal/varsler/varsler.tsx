/**
 * Varsler — PlayerHQ varsel-senter (/portal/varsler), presentasjonell variant.
 *
 * Pixel-port av fasiten public/design-handover/_screens/pl-varsler.png
 * (kalibrert mot tokenene i public/design-handover/playerhq/components-varsler.html).
 *
 * Elementliste fra fasiten (rekkefølge oppe → ned):
 *   1. Header-rad:   display-tittel "Varsler · N nye" ("N nye" i primary) +
 *                    "Mark alle"-pill (mono, primary, check-check-ikon) til høyre.
 *   2. Demo-bar:     mono-caps notis på sand-bakgrunn (kun når demo=true).
 *   3. Dag-grupper:  "I DAG" / "I GÅR" — hver med dag-bar (mono-caps + teller)
 *                    og varsel-rader under.
 *   4. Varsel-rad:   ikon-flis (lucide, tonet DS-token-bakgrunn) + mono-eyebrow
 *                    (agent/kilde) + melding (bold lead + normal forts.) +
 *                    relativ tid (mono-caps) + lime ulest-prikk øverst til høyre.
 *   5. Vis eldre:    sentrert mono-knapp med chevron-down (kun når harEldre=true).
 *
 * Props-drevet, ingen Prisma/DB/auth — kun presentasjon. DS-tokens +
 * lucide-ikoner, ingen hardkodet hex. UI på norsk bokmål.
 */

import Link from "next/link";
import {
  CheckCheck,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Visuelt tema for ikon-flisen per varsel-kategori (DS-token-klasser). */
export type VarselTone =
  | "melding"
  | "plan"
  | "drill"
  | "milepael"
  | "runde"
  | "turnering"
  | "credit"
  | "system";

const TONE_CLASS: Record<VarselTone, string> = {
  melding: "bg-info/10 text-info",
  plan: "bg-accent/30 text-primary",
  drill: "bg-primary/10 text-primary",
  milepael: "bg-accent/30 text-primary",
  runde: "bg-primary/10 text-primary",
  turnering: "bg-destructive/10 text-destructive",
  credit: "bg-warning/15 text-warning",
  system: "bg-secondary text-muted-foreground",
};

export type VarselItem = {
  id: string;
  /** Ikon (lucide) for ikon-flisen. */
  icon: LucideIcon;
  /** Fargetema for ikon-flisen. */
  tone: VarselTone;
  /** Mono-eyebrow over meldingen — agent/kilde, f.eks. "Coach-melding fra Anders". */
  eyebrow: string;
  /** Bold lead-setning i meldingen. */
  title: string;
  /** Resten av meldingen (normal vekt) — vises etter title. */
  body?: string;
  /** Relativ tid, mono-caps i fasiten, f.eks. "5T" / "1 D SIDEN". */
  time: string;
  /** Om varselet er ulest (lime prikk + full opacitet). */
  unread: boolean;
  /** Valgfri lenke — hele raden blir klikkbar. */
  href?: string;
};

export type VarselGroup = {
  /** Dag-bar-etikett, f.eks. "I DAG" / "I GÅR". */
  label: string;
  items: VarselItem[];
};

export type VarslerData = {
  /** Antall uleste — vises som "N nye" i headeren. */
  ulestAntall: number;
  /** Synlige dag-grupper i rekkefølge. */
  grupper: VarselGroup[];
  /** Om "Vis eldre"-knappen skal vises (eldre arkiv finnes). */
  harEldre: boolean;
  /** Viser demo-bar + deaktiverer "Mark alle". */
  demo?: boolean;
  /** Lenke "Vis eldre" peker på. */
  eldreHref?: string;
};

// ── Varsel-rad ──────────────────────────────────────────────────
function VarselRad({ v }: { v: VarselItem }) {
  const Icon = v.icon;

  const inner = (
    <div className="relative grid grid-cols-[36px_1fr] gap-3 px-[18px] py-[13px] transition-colors hover:bg-primary/[0.02]">
      <span
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]",
          TONE_CLASS[v.tone],
        )}
        aria-hidden
      >
        <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
      </span>

      <div className="min-w-0">
        <p
          className={cn(
            "font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground",
            !v.unread && "opacity-[0.62]",
          )}
        >
          {v.eyebrow}
        </p>
        <p
          className={cn(
            "mt-[3px] text-[13.5px] font-medium leading-[1.4] tracking-[-0.005em] text-foreground",
            !v.unread && "opacity-[0.62]",
          )}
        >
          <span className="font-bold">{v.title}</span>
          {v.body ? <> {v.body}</> : null}
        </p>
        <p className="mt-[5px] font-mono text-[9.5px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
          {v.time}
        </p>
      </div>

      {v.unread && (
        <span
          className="absolute right-4 top-4 h-[9px] w-[9px] rounded-full bg-accent shadow-[0_0_0_3px_hsl(var(--card))]"
          aria-label="Ulest"
        />
      )}
    </div>
  );

  return (
    <li className="border-b border-border last:border-b-0">
      {v.href ? (
        <Link
          href={v.href}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          {inner}
        </Link>
      ) : (
        inner
      )}
    </li>
  );
}

// ── Dag-bar ─────────────────────────────────────────────────────
function DagBar({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-border bg-background px-[18px] py-[9px]">
      <span className="font-mono text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className="ml-auto inline-flex items-center rounded-full border border-border bg-card px-[7px] py-px font-mono text-[8.5px] font-bold tracking-[0.04em] text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

export function Varsler({ data }: { data: VarslerData }) {
  const { ulestAntall, grupper, harEldre, demo = false, eldreHref } = data;
  const markAlleDisabled = demo || ulestAntall === 0;

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 py-6 sm:py-8">
      <div className="overflow-hidden rounded-xl border border-border bg-card pb-2">
        {/* Header — tittel + «N nye» + Mark alle */}
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <span className="font-display text-[17px] font-bold leading-tight tracking-[-0.015em] text-foreground">
            Varsler
            {ulestAntall > 0 && (
              <>
                {" · "}
                <span className="text-primary">{ulestAntall} nye</span>
              </>
            )}
          </span>
          <button
            type="button"
            disabled={markAlleDisabled}
            className={cn(
              "ml-auto inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/[0.06] px-2.5 py-1.5 font-mono text-[9.5px] font-extrabold uppercase tracking-[0.04em] text-primary transition-opacity",
              markAlleDisabled && "pointer-events-none opacity-50",
            )}
          >
            <CheckCheck className="h-3 w-3" strokeWidth={2} aria-hidden />
            Mark alle
          </button>
        </div>

        {demo && (
          <div className="border-b border-border bg-secondary/40 px-[18px] py-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Demo-data · ekte varsler vises her etter hvert
          </div>
        )}

        {/* Dag-grupper */}
        {grupper.map((g) => (
          <div key={g.label}>
            <DagBar label={g.label} count={g.items.length} />
            <ul>
              {g.items.map((v) => (
                <VarselRad key={v.id} v={v} />
              ))}
            </ul>
          </div>
        ))}

        {/* Vis eldre */}
        {harEldre && (
          <div className="px-[18px] py-[18px] text-center">
            {eldreHref ? (
              <Link
                href={eldreHref}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.06em] text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                Vis eldre
                <ChevronDown className="h-3 w-3" strokeWidth={2.5} aria-hidden />
              </Link>
            ) : (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.06em] text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                Vis eldre
                <ChevronDown className="h-3 w-3" strokeWidth={2.5} aria-hidden />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
