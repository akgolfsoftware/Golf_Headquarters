/**
 * PILOT — PlayerHQ TrackMan Import (3-stegs modal)
 * Bygd direkte fra wireframe/design-files-v2/modaler-D/d03–d05-trackman-import-*.html
 * URL: /demos/trackman-import/1 | /2 | /3 (under (internal) → ADMIN-only)
 *
 * Dynamic route med [steg]. Steg validert til "1" | "2" | "3", ellers notFound().
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  X,
  FileText,
  Image as ImageIcon,
  Info,
  Upload,
  Check,
  ArrowRight,
  ArrowLeft,
  Clock,
} from "lucide-react";

const BACKDROP = "fixed inset-0 z-0 bg-[rgba(10,31,24,0.5)]" as const;

type Steg = "1" | "2" | "3";

export default async function TrackmanImportDemo({
  params,
}: {
  params: Promise<{ steg: string }>;
}) {
  const { steg } = await params;
  if (steg !== "1" && steg !== "2" && steg !== "3") {
    notFound();
  }
  const current = steg as Steg;

  return (
    <div className="relative min-h-screen bg-background">
      <div className={BACKDROP} aria-hidden="true" />

      <div className="relative z-10 mx-auto my-8 w-full max-w-[720px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <Header current={current} />
        <Stepper current={current} />

        <div className="px-8 pb-2 pt-2">
          {current === "1" && <StepOne />}
          {current === "2" && <StepTwo />}
          {current === "3" && <StepThree />}
        </div>

        <Footer current={current} />
      </div>
    </div>
  );
}

function Header({ current }: { current: Steg }) {
  const titles: Record<Steg, { eyebrow: string; h: string; p: string }> = {
    "1": {
      eyebrow: "PlayerHQ · TrackMan Performance Studio · Steg 1 av 3",
      h: "Importer TrackMan-data",
      p: "Velg metode for opplasting — du kan endre senere.",
    },
    "2": {
      eyebrow: "PlayerHQ · TrackMan-import · Steg 2 av 3",
      h: "Last opp CSV-fil",
      p: "Filen leses lokalt — ingen data forlater enheten før du bekrefter.",
    },
    "3": {
      eyebrow: "PlayerHQ · TrackMan-import · Steg 3 av 3",
      h: "Verifiser data før import",
      p: "14 køller · 168 slag · session 10. mai. Korrigeringer lagres automatisk.",
    },
  };
  const t = titles[current];
  return (
    <header className="flex items-start justify-between gap-4 border-b border-border px-8 pb-5 pt-6">
      <div>
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
          {t.eyebrow}
        </div>
        <h2 className="mt-1.5 font-display text-[26px] font-semibold leading-tight tracking-tight text-foreground">
          {t.h}
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{t.p}</p>
      </div>
      <Link
        href="/"
        aria-label="Lukk"
        className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <X className="h-5 w-5" strokeWidth={1.75} />
      </Link>
    </header>
  );
}

function Stepper({ current }: { current: Steg }) {
  const steps: { n: Steg; label: string }[] = [
    { n: "1", label: "Metode" },
    { n: "2", label: "Last opp" },
    { n: "3", label: "Verifiser" },
  ];
  return (
    <div className="flex items-center gap-1.5 px-8 pt-4">
      {steps.map((s, i) => {
        const cur = Number(current);
        const my = Number(s.n);
        const state: "done" | "active" | "todo" =
          my < cur ? "done" : my === cur ? "active" : "todo";
        const dot =
          state === "active"
            ? "bg-accent text-primary border-primary ring-4 ring-primary/10"
            : state === "done"
              ? "bg-primary text-accent border-primary"
              : "bg-card text-muted-foreground border-border";
        const label =
          state === "active"
            ? "text-primary"
            : state === "done"
              ? "text-foreground"
              : "text-muted-foreground";
        return (
          <span key={s.n} className="flex items-center gap-1.5">
            <span
              className={`grid h-6 w-6 place-items-center rounded-full border-[1.5px] font-mono text-[11px] font-bold ${dot}`}
            >
              {state === "done" ? <Check className="h-3 w-3" strokeWidth={3} /> : s.n}
            </span>
            <span className={`font-mono text-[10px] font-bold uppercase tracking-[0.06em] ${label}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span
                className={`mx-2 inline-block h-px max-w-[60px] flex-1 ${
                  Number(steps[i + 1].n) <= Number(current) ? "bg-primary" : "bg-border"
                }`}
                style={{ width: 40 }}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}

function StepOne() {
  return (
    <div className="pt-4">
      <div className="grid grid-cols-2 gap-3.5 pt-2">
        <Method
          selected
          icon={<FileText className="h-7 w-7" strokeWidth={1.5} />}
          name="CSV-opplasting"
          desc="Last opp .csv eksportert fra TrackMan Performance Studio. Mest presis — alle data hentes direkte."
          meta={["~5 sek", "100 % presisjon", "Anbefalt"]}
        />
        <Method
          icon={<ImageIcon className="h-7 w-7" strokeWidth={1.5} />}
          name="Screenshot · OCR"
          desc="Last opp screenshot av session-summary fra appen — vi henter ut data automatisk via tekstgjenkjenning."
          meta={["~15 sek", "~92 % presisjon", "Manuell verifisering"]}
        />
      </div>

      <div className="mt-5 flex items-start gap-2.5 rounded-md bg-secondary px-4 py-3.5 text-[13px] leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" strokeWidth={2} />
        <div>
          Du finner CSV-eksport i TrackMan Performance Studio under{" "}
          <strong className="font-semibold text-foreground">Reports → Export Session</strong>. Velg formatet{" "}
          <strong className="font-semibold text-foreground">Detailed (per shot)</strong>.{" "}
          <a href="#" className="font-semibold text-primary no-underline">
            Trinn-for-trinn-guide →
          </a>
        </div>
      </div>
    </div>
  );
}

function Method({
  selected,
  icon,
  name,
  desc,
  meta,
}: {
  selected?: boolean;
  icon: React.ReactNode;
  name: string;
  desc: string;
  meta: string[];
}) {
  return (
    <div
      className={`relative flex min-h-[220px] flex-col gap-3.5 rounded-xl border-[1.5px] p-6 transition-colors ${
        selected ? "border-primary bg-primary/5 border-2 p-[23px]" : "border-border bg-card hover:border-muted-foreground"
      }`}
    >
      {selected && (
        <div className="absolute right-3.5 top-3.5 grid h-6 w-6 place-items-center rounded-full bg-primary">
          <Check className="h-3.5 w-3.5 text-accent" strokeWidth={3} />
        </div>
      )}
      <div className={`grid h-14 w-14 place-items-center rounded-xl text-primary ${selected ? "bg-background" : "bg-secondary"}`}>
        {icon}
      </div>
      <div>
        <div className="font-display text-[17px] font-semibold -tracking-[0.005em] text-foreground">{name}</div>
      </div>
      <div className="flex-1 text-[13px] leading-relaxed text-muted-foreground">{desc}</div>
      <div className="flex flex-wrap gap-1.5">
        {meta.map((m) => (
          <span
            key={m}
            className={`rounded-sm px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground ${
              selected ? "bg-card" : "bg-background"
            }`}
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

function StepTwo() {
  return (
    <div className="pt-4">
      <div className="rounded-xl border-2 border-dashed border-primary bg-primary/5 px-6 py-7 text-center">
        <div className="mx-auto mb-3.5 grid h-14 w-14 place-items-center rounded-xl bg-background text-primary">
          <Upload className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div className="font-display text-[16px] font-semibold text-foreground">
          Slipp .csv her, eller klikk for å velge
        </div>
        <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
          Maks 10 mb · format: TrackMan PS Detailed export
        </div>
        <button
          type="button"
          className="mt-3.5 inline-block rounded-full border-[1.5px] border-border bg-background px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-foreground"
        >
          Velg fil fra Mac
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border-[1.5px] border-[rgba(22,163,74,0.45)] bg-card px-4 py-3.5">
        <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-md bg-[rgba(22,163,74,0.12)] text-[#16A34A]">
          <FileText className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-[14px] font-semibold text-foreground">
            trackman-session-2026-05-10.csv
          </div>
          <div className="mt-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
            82,4 kb · 168 slag · 14 køller · 10. mai 2026, 18:42
          </div>
        </div>
        <div className="grid h-6.5 w-6.5 flex-shrink-0 place-items-center rounded-full bg-[#16A34A] text-white" style={{ height: 26, width: 26 }}>
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </div>
        <button type="button" aria-label="Fjern" className="ml-1 p-1.5 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-secondary px-4 py-4">
        <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          Oppdaget i filen
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { v: "14", l: "Køller" },
            { v: "168", l: "Slag" },
            { v: "52 min", l: "Session-lengde" },
            { v: "100 %", l: "Datakvalitet" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-[22px] font-semibold leading-none -tracking-tight text-foreground">
                {s.v}
              </div>
              <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ClubRow {
  name: string;
  carry: string;
  total: string;
  ballSpeed: string;
  spin: string;
  launch: string;
  shots: string;
}

const CLUBS: ClubRow[] = [
  { name: "Driver", carry: "234,5", total: "252,8", ballSpeed: "72,3", spin: "2 580", launch: "13,2", shots: "14" },
  { name: "3-wood", carry: "212,1", total: "225,4", ballSpeed: "68,7", spin: "3 120", launch: "11,8", shots: "10" },
  { name: "5-wood", carry: "198,4", total: "208,0", ballSpeed: "65,9", spin: "3 640", launch: "13,1", shots: "8" },
  { name: "4-iron", carry: "182,7", total: "189,3", ballSpeed: "62,4", spin: "4 280", launch: "14,5", shots: "12" },
  { name: "5-iron", carry: "172,0", total: "178,2", ballSpeed: "60,1", spin: "4 720", launch: "15,8", shots: "12" },
  { name: "6-iron", carry: "161,5", total: "166,8", ballSpeed: "57,8", spin: "5 140", launch: "17,2", shots: "14" },
  { name: "7-iron", carry: "149,8", total: "154,2", ballSpeed: "54,9", spin: "5 680", launch: "18,9", shots: "14" },
  { name: "8-iron", carry: "138,4", total: "141,9", ballSpeed: "52,1", spin: "6 124", launch: "20,4", shots: "14" },
  { name: "9-iron", carry: "127,2", total: "130,1", ballSpeed: "49,3", spin: "6 580", launch: "22,1", shots: "14" },
  { name: "Pitching-wedge", carry: "114,7", total: "117,0", ballSpeed: "46,5", spin: "7 120", launch: "24,8", shots: "14" },
  { name: "Gap-wedge · 50°", carry: "102,1", total: "103,8", ballSpeed: "43,2", spin: "7 680", launch: "27,5", shots: "10" },
  { name: "Sand-wedge · 54°", carry: "88,3", total: "89,4", ballSpeed: "40,1", spin: "8 240", launch: "30,2", shots: "10" },
  { name: "Lob-wedge · 58°", carry: "72,6", total: "73,2", ballSpeed: "36,8", spin: "8 780", launch: "33,4", shots: "10" },
  { name: "Putter", carry: "—", total: "—", ballSpeed: "—", spin: "—", launch: "—", shots: "12" },
];

function StepThree() {
  return (
    <div className="pt-4">
      <div className="flex items-start gap-2.5 rounded-md border border-primary/15 bg-primary/5 px-4 py-3 text-[13px] leading-relaxed text-muted-foreground">
        <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" strokeWidth={2} />
        <div>
          Klikk på en celle for å justere snittverdiene før import. CSV-data har 100 % presisjon — endre kun hvis noe ser åpenbart feil ut.
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border-[1.5px] border-border font-mono tabular-nums">
        <div
          className="grid items-center border-b-[1.5px] border-border bg-secondary text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground"
          style={{ gridTemplateColumns: "1.4fr 0.9fr 0.9fr 1.1fr 0.9fr 1fr 0.7fr" }}
        >
          <div className="px-3 py-2.5 text-left">Kølle</div>
          <div className="px-3 py-2.5 text-right">
            Carry <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">m</span>
          </div>
          <div className="px-3 py-2.5 text-right">
            Total <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">m</span>
          </div>
          <div className="px-3 py-2.5 text-right">
            Ball-speed <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">m/s</span>
          </div>
          <div className="px-3 py-2.5 text-right">
            Spin <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">rpm</span>
          </div>
          <div className="px-3 py-2.5 text-right">
            Launch <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">°</span>
          </div>
          <div className="px-3 py-2.5 text-right">Slag</div>
        </div>
        {CLUBS.map((c) => (
          <div
            key={c.name}
            className="grid items-center border-b border-border text-[12px] text-foreground last:border-b-0 hover:bg-secondary"
            style={{ gridTemplateColumns: "1.4fr 0.9fr 0.9fr 1.1fr 0.9fr 1fr 0.7fr" }}
          >
            <div className="px-3 py-2.5 text-left font-bold">{c.name}</div>
            <div className="px-3 py-2.5 text-right">{c.carry}</div>
            <div className="px-3 py-2.5 text-right">{c.total}</div>
            <div className="px-3 py-2.5 text-right">{c.ballSpeed}</div>
            <div className="px-3 py-2.5 text-right">{c.spin}</div>
            <div className="px-3 py-2.5 text-right">{c.launch}</div>
            <div className="px-3 py-2.5 text-right">{c.shots}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer({ current }: { current: Steg }) {
  const prev = current === "1" ? null : (String(Number(current) - 1) as Steg);
  const next = current === "3" ? null : (String(Number(current) + 1) as Steg);
  const primaryLabel =
    current === "1" ? "Neste — Last opp CSV" : current === "2" ? "Neste — Verifiser data" : "Importer · 14 køller";

  return (
    <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-8 py-4">
      <Link
        href="/"
        className="rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
      >
        Avbryt
      </Link>
      <div className="flex gap-2">
        {prev && (
          <Link
            href={`/demos/trackman-import/${prev}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Tilbake
          </Link>
        )}
        {next ? (
          <Link
            href={`/demos/trackman-import/${next}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {primaryLabel}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {primaryLabel}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
      </div>
    </footer>
  );
}
