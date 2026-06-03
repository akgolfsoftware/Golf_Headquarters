"use client";

/**
 * TurneringDetalj — PlayerHQ turnering-detalj (bane / dato / resultat).
 *
 * Presentasjonell, props-drevet. Portet fra design-fasiten:
 *   - Pixel-mål: public/design-handover/_screens/pl-turnering.png (IKKE PÅMELDT-tilstand)
 *   - Eksakte verdier: public/design-handover/playerhq/components-turnering-detalj.html
 *
 * Fasiten (_screens) viser tom-/ikke-påmeldt-tilstanden: dark forest banner med
 * trofé-eyebrow + tittel + dato, "IKKE PÅMELDT"-pill, avkryssbar forberedelse-
 * checklist (0/4 klart), og én "Turneringsplan"-CTA. Komponenten støtter også
 * påmeldt-tilstanden fra components-HTML-en (din status, historikk, starttid,
 * avmeld) via props — disse rendres kun når data finnes.
 *
 * Mobil-først: layouten matcher 412px-telefonrammen i fasiten. På desktop legges
 * den i preview-skallets sentrerte kolonne.
 *
 * Checklist-tilstand lever i klient-state — det finnes ingen persisteringsmodell
 * for huskelista i schemaet, så ingen falsk «lagret»-påstand. Punktene seedes fra
 * `done`-flagget i props.
 *
 * INGEN Prisma/DB/auth her — kun presentasjon.
 */

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Trophy,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Props ────────────────────────────────────────────────────────────────────

export type ForberedelsePunkt = {
  id: string;
  label: string;
  done: boolean;
};

export type DinStatusFelt = {
  /** Kort etikett, f.eks. "Klasse" */
  key: string;
  /** Verdi, f.eks. "Herre A" */
  value: string;
  /** Positiv tone (grønn verdi), f.eks. for forventet HCP-fremgang */
  positive?: boolean;
};

export type TidligereResultat = {
  /** Årstall, f.eks. "2025" */
  ar: string;
  /** Resultat-etikett, f.eks. "topp" */
  label: string;
  /** Uthevet verdi, f.eks. "8" */
  value: string;
};

export type TurneringDetaljData = {
  /** Eyebrow over tittelen i banneret, f.eks. "Srixon Tour #2" */
  eyebrow: string;
  /** Turneringstittel, f.eks. "Bergen GK – Region Tour Vestland" */
  tittel: string;
  /** Dato/sted-linje under tittelen, f.eks. "23. MAI" */
  meta: string;
  /** Påmeldingsstatus — styrer status-pill og CTA-rad */
  pameldt: boolean;
  /** Starttid (vises kun når påmeldt), f.eks. "Fredag 11:24" */
  starttid?: string;
  /** Din status-rutenett (vises kun når feltene finnes / påmeldt) */
  dinStatus?: DinStatusFelt[];
  /** Forberedelse-checklist */
  forberedelse: ForberedelsePunkt[];
  /** Historikk — rendres kun når den finnes */
  tidligere?: TidligereResultat[];
  /** Navigasjonsruter */
  hrefs: {
    /** Tilbake til turneringslista */
    tilbake: string;
    /** Turneringsplan (vises i ikke-påmeldt-tilstand) */
    plan: string;
    /** Se starttid (vises når påmeldt) */
    starttid: string;
    /** Avmeld (vises når påmeldt) */
    avmeld: string;
  };
};

// ── Underkomponenter ─────────────────────────────────────────────────────────

function Banner({
  eyebrow,
  tittel,
  meta,
}: {
  eyebrow: string;
  tittel: string;
  meta: string;
}) {
  return (
    <div
      className="relative flex h-[150px] items-end"
      style={{
        // Skog-grønn topp → dyp-forest bunn, med diagonale striper over.
        // Matcher fasit-banneret (_screens/pl-turnering.png): topp ~#0A5F39,
        // bunn ~#0A2B1D. Uttrykt med eksisterende tokens (primary = forest,
        // player-sidebar = dyp forest) — ingen nye farger.
        backgroundImage: [
          "repeating-linear-gradient(135deg, rgba(0,88,64,0.18) 0 14px, rgba(0,88,64,0.04) 14px 28px)",
          "linear-gradient(180deg, var(--color-primary) 0%, var(--color-player-sidebar) 100%)",
        ].join(", "),
      }}
    >
      <div className="relative w-full px-[18px] py-4">
        <span className="inline-flex items-center gap-[7px] font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-accent">
          <Trophy className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
          {eyebrow}
        </span>
        <h1 className="mb-[3px] mt-1.5 font-display text-[21px] font-bold leading-tight tracking-[-0.02em] text-white">
          {tittel}
        </h1>
        <p className="font-mono text-[10px] font-bold tracking-[0.04em] text-white/80">
          {meta}
        </p>
      </div>
    </div>
  );
}

function StatusBar({
  pameldt,
  starttid,
}: {
  pameldt: boolean;
  starttid?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-border px-[18px] py-3">
      {pameldt ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success-tint-bg)] px-2.5 py-[5px] font-mono text-[10px] font-extrabold uppercase tracking-[0.06em] text-success">
          <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} aria-hidden />
          Påmeldt
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-[5px] font-mono text-[10px] font-extrabold uppercase tracking-[0.06em] text-muted-foreground">
          Ikke påmeldt
        </span>
      )}

      {pameldt && starttid && (
        <span className="ml-auto text-right font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
          START
          <b className="block text-[13px] font-extrabold text-foreground">
            {starttid}
          </b>
        </span>
      )}
    </div>
  );
}

function SectionLabel({
  children,
  trailing,
}: {
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
      <span>{children}</span>
      {trailing}
    </div>
  );
}

function DinStatusGrid({ felter }: { felter: DinStatusFelt[] }) {
  return (
    <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[11px] border border-border bg-border">
      {felter.map((f) => (
        <div key={f.key} className="bg-card px-3 py-[11px]">
          <div className="font-mono text-[8.5px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
            {f.key}
          </div>
          <div
            className={cn(
              "mt-[3px] font-mono text-[15px] font-extrabold tracking-[-0.01em]",
              f.positive ? "text-success" : "text-foreground",
            )}
          >
            {f.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function ForberedelseChecklist({
  punkter,
}: {
  punkter: ForberedelsePunkt[];
}) {
  const [done, setDone] = useState<boolean[]>(() =>
    punkter.map((p) => p.done),
  );
  const doneCount = done.filter(Boolean).length;

  function toggle(i: number) {
    setDone((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  return (
    <section className="border-b border-border px-[18px] py-4">
      <SectionLabel
        trailing={
          <span className="font-extrabold tabular-nums text-primary">
            {doneCount} / {punkter.length} klart
          </span>
        }
      >
        Forberedelse
      </SectionLabel>

      <ul className="flex flex-col gap-[7px]">
        {punkter.map((p, i) => {
          const isDone = done[i];
          return (
            <li key={p.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={isDone}
                onClick={() => toggle(i)}
                className={cn(
                  "grid min-h-[46px] w-full grid-cols-[24px_1fr] items-center gap-3 rounded-[11px] border border-border bg-card px-3 py-[11px] text-left transition-colors hover:bg-secondary",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 motion-reduce:transition-none",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] border-2 transition-colors motion-reduce:transition-none",
                    isDone
                      ? "border-primary bg-primary text-accent"
                      : "border-input bg-card text-transparent",
                  )}
                >
                  {isDone && (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  )}
                </span>
                <span
                  className={cn(
                    "text-[13.5px] font-semibold leading-tight tracking-[-0.005em]",
                    isDone
                      ? "text-muted-foreground line-through"
                      : "text-foreground",
                  )}
                >
                  {p.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function TidligereAar({ rader }: { rader: TidligereResultat[] }) {
  return (
    <section className="px-[18px] py-4">
      <SectionLabel>Tidligere år</SectionLabel>
      <div className="flex flex-col overflow-hidden rounded-[11px] border border-border">
        {rader.map((r) => (
          <div
            key={r.ar}
            className="flex items-center gap-2.5 border-b border-border px-3 py-2.5 last:border-b-0"
          >
            <span className="font-mono text-[12px] font-extrabold tabular-nums text-foreground">
              {r.ar}
            </span>
            <span className="ml-auto font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
              {r.label} <b className="font-extrabold text-foreground">{r.value}</b>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Hovedkomponent ───────────────────────────────────────────────────────────

export function TurneringDetalj({ data }: { data: TurneringDetaljData }) {
  const { pameldt, dinStatus, tidligere, hrefs } = data;

  return (
    <div className="mx-auto w-full max-w-[412px] overflow-hidden bg-card lg:rounded-2xl lg:border lg:border-border lg:shadow-sm">
      {/* Topbar — tilbake til turneringslista */}
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <Link
          href={hrefs.tilbake}
          className="inline-flex items-center gap-1.5 rounded font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          <ChevronLeft className="h-[13px] w-[13px]" strokeWidth={2.5} aria-hidden />
          Turneringer
        </Link>
      </div>

      {/* Banner */}
      <Banner eyebrow={data.eyebrow} tittel={data.tittel} meta={data.meta} />

      {/* Status */}
      <StatusBar pameldt={pameldt} starttid={data.starttid} />

      {/* Din status — kun når påmeldt og felter finnes */}
      {pameldt && dinStatus && dinStatus.length > 0 && (
        <section className="border-b border-border px-[18px] py-4">
          <SectionLabel>Din status</SectionLabel>
          <DinStatusGrid felter={dinStatus} />
        </section>
      )}

      {/* Forberedelse */}
      <ForberedelseChecklist punkter={data.forberedelse} />

      {/* Tidligere år — kun når historikk finnes */}
      {tidligere && tidligere.length > 0 && <TidligereAar rader={tidligere} />}

      {/* CTA-rad */}
      <div className="flex gap-[9px] px-4 pb-[18px] pt-3">
        {pameldt ? (
          <>
            <Link
              href={hrefs.avmeld}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-card font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-destructive transition-colors hover:bg-destructive/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              Avmeld
            </Link>
            <Link
              href={hrefs.starttid}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-accent shadow-[0_8px_20px_rgba(0,88,64,0.18)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <Clock className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              Se starttid
            </Link>
          </>
        ) : (
          <Link
            href={hrefs.plan}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <Clock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Turneringsplan
          </Link>
        )}
      </div>
    </div>
  );
}
