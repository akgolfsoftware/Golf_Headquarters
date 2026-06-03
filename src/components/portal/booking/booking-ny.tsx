/**
 * PlayerHQ — Ny booking-wizard (steg: velg tjeneste → velg tid → bekreft).
 * Portet FRA v10-fasit:
 *   - Visuell fasit: public/design-handover/_screens/pl-booking-ny.png (mobil 430px)
 *   - Innhold/verdier: public/design-handover/_ui-kits/booking/index.html (PACKAGES, slots)
 *   - Manifest: docs/skjerm-manifest-playerhq.md §7 (/portal/booking/ny)
 *
 * Presentasjonell komponent — all data via props (`BookingNyData`). INGEN
 * Prisma/DB/auth her. Mobil er primær-fasit (pixel mot PNG); desktop utvider
 * responsivt i sentrert lesbar kolonne (skall leveres av rute-laget).
 *
 * Vertikal stack (topp → bunn), eksakt rekkefølge fra pl-booking-ny.png:
 *   1. Eyebrow (lime dot + PLAYERHQ · BOOK NY TIME) + hero "Bruk månedens timer"
 *      (italic «månedens») + subtekst om gjenstående timer.
 *   2. Steg-indikator: ① Tjeneste — ② Tid — ③ Bekreft.
 *   3. Gate-kort «Booking krever Pro» (lås-ikon, body, lime «Oppgrader»-pill).
 *      Vises kun for free-konto (gated = true).
 *   4. «Min saldo»-kort: stor mono-verdi «N / M igjen» + M dash-segmenter.
 *   5. «1 · Velg tjeneste» — radio-kort med navn, varighet, beskrivelse, pris.
 *   6. «2 · Velg tid» — VELG DAG (dag-strip, NESTE 14 DAGER) + valgt dag-tittel +
 *      coach-navn + tids-grid (3 kolonner, mono-klokkeslett).
 *
 * Athletic-/DS-tokens (globals.css). Ingen hardkodet hex, ingen emoji (kun
 * lucide-ikoner). All tekst norsk bokmål.
 */

import Link from "next/link";
import { ArrowUpRight, Check, Clock, Coins, CalendarDays, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────────────────────
// Datamodell
// ────────────────────────────────────────────────────────────────────────────

export type BookingService = {
  id: string;
  /** Tittel, f.eks. "Flex 20 min — Anders" */
  navn: string;
  /** Varighet vist i mono til høyre, f.eks. "20 MIN" */
  varighet: string;
  /** Kort beskrivelse under tittel. */
  beskrivelse: string;
  /** Pris vist i mono, f.eks. "1300 kr" eller "1 credit". */
  pris: string;
};

export type BookingDay = {
  id: string;
  /** Ukedag-kort, f.eks. "MA" */
  ukedag: string;
  /** Dato-tall, f.eks. "1" */
  dato: string;
  /** Måned-kort, f.eks. "JUN" */
  maaned: string;
};

export type BookingNyData = {
  eyebrow: string; // f.eks. "PLAYERHQ · BOOK NY TIME"
  /** Hero-tittel delt i tre for italic-midtdel: "Bruk" / "månedens" / "timer". */
  heroFor: string;
  heroItalic: string;
  heroEtter: string;
  /** Subtekst under hero. */
  intro: string;
  /** Steg-etiketter (3 steg). aktivtSteg = 1-indeksert. */
  steg: string[];
  aktivtSteg: number;
  /** Gate-kort for free-konto. null = ingen gate (Pro/abonnement). */
  gate: {
    tittel: string;
    body: string;
    cta: { label: string; href: string };
  } | null;
  /** Saldo-kort. */
  saldo: {
    label: string;
    /** Gjenstående timer/credits. */
    igjen: number;
    /** Totalt antall (= antall dash-segmenter). */
    total: number;
    /** Suffiks etter verdi, f.eks. "igjen". */
    suffiks: string;
  };
  /** Seksjonstittel for tjeneste-steg, f.eks. "Velg tjeneste". */
  tjenesteTittel: string;
  tjenester: BookingService[];
  /** Id på valgt tjeneste (radio). */
  valgtTjenesteId: string | null;
  /** Seksjonstittel for tid-steg, f.eks. "Velg tid". */
  tidTittel: string;
  dagStripLabel: string; // "VELG DAG"
  dagStripHint: string; // "NESTE 14 DAGER"
  dager: BookingDay[];
  valgtDagId: string | null;
  /** Tittel over slots, f.eks. "Mandag 1. juni". */
  valgtDagTittel: string;
  /** Coach-navn under dag-tittel, f.eks. "Anders Kristiansen". */
  valgtDagCoach: string;
  /** Tilgjengelige klokkeslett, f.eks. "12:00". */
  tider: string[];
  valgtTid: string | null;
};

// ────────────────────────────────────────────────────────────────────────────
// Delkomponenter
// ────────────────────────────────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className="h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-primary"
      />
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {children}
      </span>
    </div>
  );
}

function StegIndikator({ steg, aktivt }: { steg: string[]; aktivt: number }) {
  return (
    <ol className="flex items-center" aria-label="Booking-steg">
      {steg.map((label, i) => {
        const nr = i + 1;
        const erAktivt = nr === aktivt;
        const erFerdig = nr < aktivt;
        return (
          <li
            key={label}
            className={cn("flex items-center", i < steg.length - 1 && "flex-1")}
            aria-current={erAktivt ? "step" : undefined}
          >
            <span
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-full font-mono text-[13px] font-bold",
                erAktivt && "bg-foreground text-white",
                erFerdig && "bg-primary text-white",
                !erAktivt && !erFerdig && "bg-secondary text-muted-foreground",
              )}
            >
              {nr}
            </span>
            <span
              className={cn(
                "ml-3 whitespace-nowrap text-[15px]",
                erAktivt
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < steg.length - 1 && (
              <span
                aria-hidden
                className="mx-4 h-px flex-1 bg-border"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function GateKort({ gate }: { gate: NonNullable<BookingNyData["gate"]> }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex gap-4">
        <span
          aria-hidden
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-warning-bg text-warning"
        >
          <Lock className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-[19px] font-semibold leading-tight tracking-[-0.01em] text-foreground">
            {gate.tittel}
          </h2>
          <p className="mt-1.5 text-[15px] leading-snug text-muted-foreground">
            {gate.body}
          </p>
          <Link
            href={gate.cta.href}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            {gate.cta.label}
          </Link>
        </div>
      </div>
    </div>
  );
}

function SaldoKort({ saldo }: { saldo: BookingNyData["saldo"] }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary p-5">
      <div className="flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        <Coins className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        {saldo.label}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-[44px] font-bold leading-none text-foreground [font-feature-settings:'tnum']">
          {saldo.igjen}
        </span>
        <span className="font-mono text-[20px] text-muted-foreground [font-feature-settings:'tnum']">
          / {saldo.total} {saldo.suffiks}
        </span>
      </div>
      <div className="mt-4 flex gap-2" aria-hidden>
        {Array.from({ length: saldo.total }).map((_, i) => {
          const fylt = i < saldo.igjen;
          // Siste fylte segment markeres lime, resten av fylte forest.
          const erSiste = i === saldo.igjen - 1;
          return (
            <span
              key={i}
              className={cn(
                "h-2 w-9 rounded-full",
                !fylt && "bg-border",
                fylt && erSiste && "bg-accent",
                fylt && !erSiste && "bg-primary",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

function SeksjonTittel({ nr, tittel }: { nr: number; tittel: string }) {
  return (
    <h2 className="flex items-baseline gap-2.5">
      <span className="font-mono text-[15px] text-muted-foreground">{nr}</span>
      <span aria-hidden className="text-muted-foreground">
        ·
      </span>
      <span className="font-display text-[22px] font-semibold tracking-[-0.01em] text-foreground">
        {tittel}
      </span>
    </h2>
  );
}

function TjenesteKort({
  tjeneste,
  valgt,
}: {
  tjeneste: BookingService;
  valgt: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={valgt}
      className={cn(
        "w-full rounded-2xl border border-border p-5 text-left transition-colors",
        valgt
          ? "bg-primary/[0.06] ring-2 ring-inset ring-primary"
          : "bg-card hover:border-primary/40",
      )}
    >
      <div className="flex items-start gap-3.5">
        <span
          aria-hidden
          className={cn(
            "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full",
            valgt
              ? "bg-success text-success-foreground"
              : "border-2 border-border",
          )}
        >
          {valgt && <Check className="h-4 w-4" strokeWidth={3} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-[19px] font-semibold leading-tight tracking-[-0.01em] text-foreground">
              {tjeneste.navn}
            </h3>
            <span className="flex shrink-0 items-center gap-1.5 font-mono text-[14px] text-muted-foreground [font-feature-settings:'tnum']">
              <Clock className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              {tjeneste.varighet}
            </span>
          </div>
          <p className="mt-1.5 text-[15px] leading-snug text-muted-foreground">
            {tjeneste.beskrivelse}
          </p>
          <p className="mt-3 font-mono text-[15px] font-semibold text-foreground [font-feature-settings:'tnum']">
            {tjeneste.pris}
          </p>
        </div>
      </div>
    </button>
  );
}

function DagStrip({
  label,
  hint,
  dager,
  valgtId,
}: {
  label: string;
  hint: string;
  dager: BookingDay[];
  valgtId: string | null;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <span className="font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {hint}
        </span>
      </div>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {dager.map((dag) => {
          const valgt = dag.id === valgtId;
          return (
            <button
              key={dag.id}
              type="button"
              aria-pressed={valgt}
              className={cn(
                "flex h-[90px] w-[88px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border transition-colors",
                valgt
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/40",
              )}
            >
              <span
                className={cn(
                  "font-mono text-[13px] font-bold uppercase tracking-[0.08em]",
                  valgt ? "text-accent" : "text-muted-foreground",
                )}
              >
                {dag.ukedag}
              </span>
              <span className="font-display text-[28px] font-semibold leading-none [font-feature-settings:'tnum']">
                {dag.dato}
              </span>
              <span
                className={cn(
                  "font-mono text-[13px] font-bold uppercase tracking-[0.08em]",
                  valgt ? "text-accent" : "text-muted-foreground",
                )}
              >
                {dag.maaned}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TidsGrid({
  tittel,
  coach,
  tider,
  valgtTid,
}: {
  tittel: string;
  coach: string;
  tider: string[];
  valgtTid: string | null;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 font-mono text-[15px] font-bold uppercase tracking-[0.08em] text-foreground">
        <CalendarDays className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        {tittel}
      </div>
      <div className="mt-4 font-mono text-[15px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {coach}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3.5">
        {tider.map((tid) => {
          const valgt = tid === valgtTid;
          return (
            <button
              key={tid}
              type="button"
              aria-pressed={valgt}
              className={cn(
                "grid h-[68px] place-items-center rounded-xl border font-mono text-[18px] [font-feature-settings:'tnum'] transition-colors",
                valgt
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/40",
              )}
            >
              {tid}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Hovedkomponent
// ────────────────────────────────────────────────────────────────────────────

export function BookingNy({ data }: { data: BookingNyData }) {
  return (
    <div className="mx-auto w-full max-w-[460px] space-y-7 px-4 py-5 sm:px-0 md:max-w-[720px]">
      {/* 1 — Hero */}
      <header className="space-y-3">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <h1 className="font-display text-[40px] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground">
          {data.heroFor}{" "}
          <span className="font-normal italic text-muted-foreground">
            {data.heroItalic}
          </span>{" "}
          {data.heroEtter}
        </h1>
        <p className="text-[17px] leading-snug text-muted-foreground">
          {data.intro}
        </p>
      </header>

      {/* 2 — Steg-indikator */}
      <StegIndikator steg={data.steg} aktivt={data.aktivtSteg} />

      {/* 3 — Gate (kun free-konto) */}
      {data.gate && <GateKort gate={data.gate} />}

      {/* 4 — Saldo */}
      <SaldoKort saldo={data.saldo} />

      {/* 5 — Velg tjeneste */}
      <section className="space-y-4">
        <SeksjonTittel nr={1} tittel={data.tjenesteTittel} />
        <div className="space-y-4">
          {data.tjenester.map((t) => (
            <TjenesteKort
              key={t.id}
              tjeneste={t}
              valgt={t.id === data.valgtTjenesteId}
            />
          ))}
        </div>
      </section>

      {/* 6 — Velg tid */}
      <section className="space-y-5">
        <SeksjonTittel nr={2} tittel={data.tidTittel} />
        <DagStrip
          label={data.dagStripLabel}
          hint={data.dagStripHint}
          dager={data.dager}
          valgtId={data.valgtDagId}
        />
        <TidsGrid
          tittel={data.valgtDagTittel}
          coach={data.valgtDagCoach}
          tider={data.tider}
          valgtTid={data.valgtTid}
        />
      </section>
    </div>
  );
}
