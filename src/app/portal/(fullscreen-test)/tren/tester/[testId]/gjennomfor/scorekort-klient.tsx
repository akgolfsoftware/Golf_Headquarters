"use client";

/**
 * PlayerHQ · Tren · Tester · Gjennomfør — scorekort-klient.
 *
 * Tre steg: Brief (m/kontekst) → Scorekort → Oppsummering.
 *
 * Scoren regnes via den FELLES motoren (test-scoring.ts) — samme funksjon
 * serveren bruker som fasit. Klienten sender kun rå slag-verdier + kontekst;
 * live-preview og lagret score kan derfor aldri avvike. Enheter/mål kommer
 * alltid fra protokollen (ingen hardkodede referanseverdier).
 */

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Minus,
  Play,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScorekortFelt, ScorekortForsok, ScorekortSpec } from "@/lib/portal-tester/protocol";
import { scoreTest } from "@/lib/portal-tester/test-scoring";
import { lagreTestResultat } from "./actions";

type Steg = "brief" | "scorekort" | "oppsummering";

/** Verdi-state: tallfelt lagres som rå streng (norsk komma), checkbox som boolean. */
type Verdier = Record<number, Record<string, string | boolean>>;

type Vanskelighet = "lett" | "middels" | "vanskelig";
type Fasthet = "myk" | "medium" | "hard";
type Kontekst = {
  dato: string;
  lokasjon: string;
  vanskelighet: Vanskelighet | "";
  vaer: string;
  greenfart: string;
  greenfasthet: Fasthet | "";
};

const MAKS_HISTORIKK = 50;
const MAKS_POENG = 999;

const lblCls =
  "font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground";
const pillCls =
  "inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-foreground transition-colors active:bg-secondary disabled:pointer-events-none disabled:opacity-40";
const ctaCls =
  "inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-primary-foreground shadow-[0_8px_20px_rgba(0,88,64,0.18)] transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60";

/** Norsk desimal-parsing: «12,4» / «−3» → tall. Tom/ugyldig → null. */
function parseNorsk(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed.replace("−", "-").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

const fmt = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 });

function iDagISO(): string {
  // Lokalt datostempel (YYYY-MM-DD) uten å dra inn tidssone-skjevhet.
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dag = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dag}`;
}

/** Stripper tomme kontekst-felter; returnerer undefined hvis alt er tomt. */
function renKontekst(k: Kontekst): Record<string, string> | undefined {
  const ut: Record<string, string> = {};
  if (k.dato) ut.dato = k.dato;
  if (k.lokasjon.trim()) ut.lokasjon = k.lokasjon.trim();
  if (k.vanskelighet) ut.vanskelighet = k.vanskelighet;
  if (k.vaer.trim()) ut.vaer = k.vaer.trim();
  if (k.greenfart.trim()) ut.greenfart = k.greenfart.trim();
  if (k.greenfasthet) ut.greenfasthet = k.greenfasthet;
  return Object.keys(ut).length > 0 ? ut : undefined;
}

export function ScorekortKlient({
  testId,
  beskrivelse,
  scoringRule,
  spec,
  protocol,
}: {
  testId: string;
  beskrivelse: string | null;
  scoringRule: string;
  spec: ScorekortSpec;
  /** Rå protokoll-JSON — sendes til motoren for live-score (samme som server). */
  protocol: unknown;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [steg, setSteg] = useState<Steg>("brief");
  const [verdier, setVerdier] = useState<Verdier>({});
  const [historikk, setHistorikk] = useState<Verdier[]>([]);
  const [notat, setNotat] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [kontekst, setKontekst] = useState<Kontekst>({
    dato: iDagISO(),
    lokasjon: "",
    vanskelighet: "",
    vaer: "",
    greenfart: "",
    greenfasthet: "",
  });

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [steg]);

  const antallForsok = spec.forsok.length;

  /** Rå verdi til JSON: tallfelt → tall (norsk komma), checkbox → boolean, ellers null. */
  function tilJsonVerdi(
    v: string | boolean | undefined,
    type: ScorekortFelt["type"],
  ): number | boolean | null {
    if (type === "checkbox") return typeof v === "boolean" ? v : null;
    return typeof v === "string" ? parseNorsk(v) : null;
  }

  /** Rå forsøk-liste — samme kontrakt som server-action og motoren får. */
  const forsokData = useMemo(
    () =>
      spec.forsok.map((f) => ({
        nr: f.nr,
        label: f.label,
        verdier: Object.fromEntries(
          f.felter.map((felt) => [felt.key, tilJsonVerdi(verdier[f.nr]?.[felt.key], felt.type)]),
        ),
      })),
    [verdier, spec],
  );

  /** Antall slag som er ført (minst én gyldig verdi). */
  const antallFort = useMemo(
    () => forsokData.filter((f) => Object.values(f.verdier).some((v) => v !== null)).length,
    [forsokData],
  );

  // Live-score via SAMME motor som serveren → preview kan ikke avvike fra fasit.
  const motor = useMemo(() => scoreTest(protocol, forsokData), [protocol, forsokData]);
  const score = antallFort === 0 ? null : motor.score;
  const scoringKind = motor.details.scoring;

  /** Enhet for totalscore-visning. Telle-tester vises som «av M». */
  const scoreEnhet =
    scoringKind === "count_ok"
      ? `av ${antallForsok}`
      : (motor.details.unit ?? spec.unit ?? null);
  /** Enhet i Brief-protokollkortet — protokollens egen. */
  const protokollEnhet = spec.unit ?? motor.details.unit ?? null;

  const alleFort = antallFort === antallForsok;

  // ── State-oppdatering med angre-historikk ──────────────────────
  function pushHistorikk() {
    setHistorikk((h) => [...h.slice(-(MAKS_HISTORIKK - 1)), verdier]);
  }

  function settVerdi(nr: number, key: string, verdi: string | boolean, medHistorikk: boolean) {
    if (medHistorikk) pushHistorikk();
    setVerdier((prev) => ({ ...prev, [nr]: { ...prev[nr], [key]: verdi } }));
  }

  function angreSiste() {
    if (historikk.length === 0) return;
    setVerdier(historikk[historikk.length - 1]);
    setHistorikk(historikk.slice(0, -1));
  }

  // ── Lagring ────────────────────────────────────────────────────
  function lagre() {
    if (!alleFort) {
      setFeil("Alle slag må føres før du kan lagre.");
      return;
    }
    setFeil(null);
    const kontekstInn = renKontekst(kontekst);
    startTransition(async () => {
      try {
        const res = await lagreTestResultat({
          testId,
          notes: notat.trim() === "" ? undefined : notat.trim(),
          ...(kontekstInn ? { kontekst: kontekstInn } : {}),
          forsok: forsokData,
        });
        // Ved suksess redirecter action til testsiden (?lagret=1).
        if (res && !res.ok) setFeil(res.error);
      } catch {
        setFeil("Kunne ikke lagre resultatet. Prøv igjen.");
      }
    });
  }

  function avbryt() {
    router.push(`/portal/tren/tester/${testId}`);
  }

  // ── Visnings-hjelpere ──────────────────────────────────────────
  const fellesLabel = spec.forsok.every((f) => f.label === spec.forsok[0]?.label)
    ? (spec.forsok[0]?.label ?? null)
    : null;
  const enkel = spec.forsok.every((f) => f.felter.length === 1);
  const harMaal = spec.forsok.some((f) => f.target !== undefined);
  const felterTekst = (spec.forsok[0]?.felter ?? [])
    .map((f) => (f.unit ? `${f.label} (${f.unit})` : f.label))
    .join(" · ");

  if (steg === "brief") {
    return (
      <div className="mt-4">
        {beskrivelse && (
          <p className="mb-4 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
            {beskrivelse}
          </p>
        )}

        <SectionHead>Protokoll</SectionHead>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <BriefRad label="Forsøk" verdi={`${antallForsok}`} />
          <BriefRad label="Per forsøk" verdi={felterTekst} />
          {protokollEnhet && <BriefRad label="Enhet" verdi={protokollEnhet} />}
          <BriefRad label="Scoring" verdi={scoringRule} />
        </div>

        {harMaal && (
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            Målverdier i protokollen er foreslått fra IUP — ikke låst fasit.
          </p>
        )}

        <KontekstForm kontekst={kontekst} onSett={(k, v) => setKontekst((prev) => ({ ...prev, [k]: v }))} />

        <button type="button" onClick={() => setSteg("scorekort")} className={cn(ctaCls, "mt-6")}>
          <Play className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          Start test
        </button>
        <Link
          href={`/portal/tren/tester/${testId}`}
          className={cn(pillCls, "mt-2.5 w-full border-transparent bg-transparent text-muted-foreground")}
        >
          Tilbake til testen
        </Link>
      </div>
    );
  }

  if (steg === "scorekort") {
    return (
      <div className="mt-4">
        {/* Accent-kort — løpende score (jf. runde-ny) */}
        <ScoreKort
          score={score}
          scoreEnhet={scoreEnhet}
          subline={`Forsøk ${antallFort} av ${antallForsok}`}
        />

        <SectionHead>{fellesLabel ?? "Scorekort"}</SectionHead>
        <div className={cn("grid gap-2", enkel ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2")}>
          {spec.forsok.map((f) => (
            <ForsokKort
              key={f.nr}
              forsok={f}
              visLabel={fellesLabel === null}
              verdier={verdier[f.nr]}
              onSett={(key, verdi, medHistorikk) => settVerdi(f.nr, key, verdi, medHistorikk)}
              onSnapshot={pushHistorikk}
            />
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={angreSiste}
            disabled={historikk.length === 0}
            className={pillCls}
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Angre siste
          </button>
          <button type="button" onClick={avbryt} className={pillCls}>
            <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Avbryt
          </button>
        </div>

        <button
          type="button"
          onClick={() => setSteg("oppsummering")}
          disabled={antallFort === 0}
          className={cn(ctaCls, "mt-4")}
        >
          Til oppsummering
          <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        </button>
      </div>
    );
  }

  // ── Steg C — Oppsummering ──────────────────────────────────────
  return (
    <div className="mt-4">
      <ScoreKort
        score={score}
        scoreEnhet={scoreEnhet}
        subline={`${antallFort} av ${antallForsok} slag ført`}
      />

      <SectionHead>Per forsøk</SectionHead>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {spec.forsok.map((f) => (
          <div
            key={f.nr}
            className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
          >
            <span className="w-7 shrink-0 font-mono text-[10px] font-extrabold tabular-nums text-muted-foreground">
              {String(f.nr).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
              {f.label}
            </span>
            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
              {forsokSammendrag(f, verdier[f.nr])}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <span className={lblCls}>Notat · valgfritt</span>
        <textarea
          value={notat}
          onChange={(e) => setNotat(e.target.value.slice(0, 500))}
          placeholder="Forhold, følelse, hva du jobbet med…"
          rows={3}
          className="min-h-[72px] w-full resize-none rounded-xl border border-input bg-card px-3.5 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-[3px] focus:ring-ring/20"
        />
      </div>

      {!alleFort && (
        <p className="mt-3 text-[11px] leading-relaxed text-warning">
          Før resultat på alle {antallForsok} slag før du lagrer ({antallFort} ført).
        </p>
      )}

      {feil && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
        >
          {feil}
        </div>
      )}

      <button type="button" onClick={lagre} disabled={pending || !alleFort} className={cn(ctaCls, "mt-6")}>
        <Check className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        {pending ? "Lagrer…" : "Lagre resultat"}
      </button>
      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setSteg("scorekort")}
          disabled={pending}
          className={pillCls}
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          Tilbake
        </button>
        <button
          type="button"
          onClick={avbryt}
          disabled={pending}
          className={cn(pillCls, "border-destructive/30 text-destructive active:bg-destructive/10")}
        >
          Forkast
        </button>
      </div>
    </div>
  );
}

/* ── Sub-komponenter ──────────────────────────────────────────── */

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5 mt-5 flex items-baseline gap-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
      <span>{children}</span>
      <span className="h-px flex-1 bg-border" aria-hidden />
    </div>
  );
}

function BriefRad({ label, verdi }: { label: string; verdi: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <span className={cn(lblCls, "shrink-0")}>{label}</span>
      <span className="min-w-0 text-right text-[13px] font-semibold leading-snug text-foreground">
        {verdi}
      </span>
    </div>
  );
}

/* ── Kontekst-header (dato/lokasjon/vanskelighet/vær/green) ───────── */

function KontekstForm({
  kontekst,
  onSett,
}: {
  kontekst: Kontekst;
  onSett: <K extends keyof Kontekst>(key: K, verdi: Kontekst[K]) => void;
}) {
  const inputCls =
    "h-11 w-full rounded-xl border border-input bg-card px-3 font-mono text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-[3px] focus:ring-ring/20";
  return (
    <>
      <SectionHead>Kontekst</SectionHead>
      <div className="grid grid-cols-2 gap-2.5">
        <Felt label="Dato">
          <input
            type="date"
            value={kontekst.dato}
            onChange={(e) => onSett("dato", e.target.value)}
            className={inputCls}
          />
        </Felt>
        <Felt label="Lokasjon">
          <input
            type="text"
            value={kontekst.lokasjon}
            onChange={(e) => onSett("lokasjon", e.target.value)}
            placeholder="Bane / anlegg"
            className={inputCls}
          />
        </Felt>
        <Felt label="Vanskelighetsgrad">
          <PillValg
            verdier={[
              ["lett", "Lett"],
              ["middels", "Middels"],
              ["vanskelig", "Vanskelig"],
            ]}
            valgt={kontekst.vanskelighet}
            onVelg={(v) => onSett("vanskelighet", kontekst.vanskelighet === v ? "" : (v as Vanskelighet))}
          />
        </Felt>
        <Felt label="Vær">
          <input
            type="text"
            value={kontekst.vaer}
            onChange={(e) => onSett("vaer", e.target.value)}
            placeholder="Vind, sol, regn…"
            className={inputCls}
          />
        </Felt>
        <Felt label="Fart på greener">
          <input
            type="text"
            value={kontekst.greenfart}
            onChange={(e) => onSett("greenfart", e.target.value)}
            placeholder="Stimp / rask–treig"
            className={inputCls}
          />
        </Felt>
        <Felt label="Green-fasthet">
          <PillValg
            verdier={[
              ["myk", "Myk"],
              ["medium", "Medium"],
              ["hard", "Hard"],
            ]}
            valgt={kontekst.greenfasthet}
            onVelg={(v) => onSett("greenfasthet", kontekst.greenfasthet === v ? "" : (v as Fasthet))}
          />
        </Felt>
      </div>
    </>
  );
}

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={lblCls}>{label}</span>
      {children}
    </div>
  );
}

function PillValg({
  verdier,
  valgt,
  onVelg,
}: {
  verdier: Array<[string, string]>;
  valgt: string;
  onVelg: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {verdier.map(([v, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => onVelg(v)}
          aria-pressed={valgt === v}
          className={cn(
            "inline-flex h-11 items-center justify-center rounded-lg border font-mono text-[10px] font-bold uppercase tracking-[0.05em] transition-colors",
            valgt === v
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground active:bg-secondary",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ScoreKort({
  score,
  scoreEnhet,
  subline,
}: {
  score: number | null;
  scoreEnhet: string | null;
  subline: string;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-border border-l-[3px] border-l-accent bg-card px-4 py-3.5">
      <span className="font-mono text-[30px] font-extrabold leading-none tracking-[-0.03em] tabular-nums text-foreground">
        {score === null ? "–" : fmt.format(score)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-mono text-base font-extrabold tabular-nums text-foreground">
          {scoreEnhet ?? "Score"}
        </div>
        <div className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
          {subline}
        </div>
      </div>
    </div>
  );
}

function ForsokKort({
  forsok,
  visLabel,
  verdier,
  onSett,
  onSnapshot,
}: {
  forsok: ScorekortForsok;
  visLabel: boolean;
  verdier: Record<string, string | boolean> | undefined;
  onSett: (key: string, verdi: string | boolean, medHistorikk: boolean) => void;
  onSnapshot: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
          Forsøk {forsok.nr}
        </span>
        {forsok.target && (
          <span className="truncate font-mono text-[9px] tabular-nums text-muted-foreground">
            mål {forsok.target}
          </span>
        )}
      </div>
      {visLabel && (
        <span className="text-[12.5px] font-semibold leading-snug text-foreground">
          {forsok.label}
        </span>
      )}
      {forsok.felter.map((felt) => (
        <FeltInput
          key={felt.key}
          felt={felt}
          forsokNr={forsok.nr}
          verdi={verdier?.[felt.key]}
          onSett={(verdi, medHistorikk) => onSett(felt.key, verdi, medHistorikk)}
          onSnapshot={onSnapshot}
        />
      ))}
    </div>
  );
}

function FeltInput({
  felt,
  forsokNr,
  verdi,
  onSett,
  onSnapshot,
}: {
  felt: ScorekortFelt;
  forsokNr: number;
  verdi: string | boolean | undefined;
  onSett: (verdi: string | boolean, medHistorikk: boolean) => void;
  onSnapshot: () => void;
}) {
  if (felt.type === "checkbox") {
    return (
      <div className="flex flex-col gap-1.5">
        <span className={lblCls}>{felt.label}</span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onSett(true, true)}
            aria-pressed={verdi === true}
            aria-label={`Treff, forsøk ${forsokNr}`}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-1 rounded-lg border font-mono text-[10px] font-bold uppercase tracking-[0.06em] transition-colors",
              verdi === true
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground active:bg-secondary",
            )}
          >
            <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Treff
          </button>
          <button
            type="button"
            onClick={() => onSett(false, true)}
            aria-pressed={verdi === false}
            aria-label={`Bom, forsøk ${forsokNr}`}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-1 rounded-lg border font-mono text-[10px] font-bold uppercase tracking-[0.06em] transition-colors",
              verdi === false
                ? "border-foreground/25 bg-secondary text-foreground"
                : "border-border bg-background text-muted-foreground active:bg-secondary",
            )}
          >
            <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Bom
          </button>
        </div>
      </div>
    );
  }

  if (felt.type === "poeng") {
    const tall = typeof verdi === "string" ? (parseNorsk(verdi) ?? 0) : 0;
    const fort = typeof verdi === "string" && parseNorsk(verdi) !== null;
    const stepp = (delta: number) => {
      const neste = Math.max(0, Math.min(MAKS_POENG, tall + delta));
      onSett(String(neste), true);
    };
    return (
      <div className="flex flex-col gap-1.5">
        <span className={lblCls}>
          {felt.label}
          {felt.unit ? ` · ${felt.unit}` : ""}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => stepp(-1)}
            disabled={!fort || tall <= 0}
            aria-label={`Trekk fra poeng, forsøk ${forsokNr}`}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors active:bg-secondary disabled:pointer-events-none disabled:opacity-35"
          >
            <Minus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </button>
          <span
            className={cn(
              "min-w-0 flex-1 text-center font-mono text-[22px] font-extrabold leading-none tracking-[-0.03em] tabular-nums",
              fort ? "text-foreground" : "text-muted-foreground/50",
            )}
          >
            {fort ? fmt.format(tall) : "–"}
          </span>
          <button
            type="button"
            onClick={() => stepp(1)}
            disabled={tall >= MAKS_POENG}
            aria-label={`Legg til poeng, forsøk ${forsokNr}`}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors active:bg-secondary disabled:pointer-events-none disabled:opacity-35"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  // number / meter — tallfelt med enhets-suffiks
  const enhet = felt.unit ?? (felt.type === "meter" ? "m" : null);
  return (
    <div className="flex flex-col gap-1.5">
      <span className={lblCls}>{felt.label}</span>
      <label className="flex h-12 items-center gap-2 rounded-xl border border-input bg-card px-3 transition-colors focus-within:border-primary focus-within:ring-[3px] focus-within:ring-ring/20">
        <input
          type="text"
          inputMode="decimal"
          value={typeof verdi === "string" ? verdi : ""}
          onFocus={onSnapshot}
          onChange={(e) => onSett(e.target.value, false)}
          placeholder="0"
          aria-label={`${felt.label}, forsøk ${forsokNr}`}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-[15px] font-bold tabular-nums text-foreground outline-none placeholder:text-muted-foreground/50"
        />
        {enhet && (
          <span className="shrink-0 font-mono text-[10px] font-bold text-muted-foreground">
            {enhet}
          </span>
        )}
      </label>
    </div>
  );
}

/* ── Oppsummerings-hjelper ────────────────────────────────────── */

function forsokSammendrag(
  forsok: ScorekortForsok,
  verdier: Record<string, string | boolean> | undefined,
): string {
  const deler = forsok.felter.map((felt) => {
    const v = verdier?.[felt.key];
    if (felt.type === "checkbox") {
      if (v === true) return "Treff";
      if (v === false) return "Bom";
      return "–";
    }
    const tall = typeof v === "string" ? parseNorsk(v) : null;
    if (tall === null) return "–";
    const enhet = felt.unit ?? (felt.type === "meter" ? "m" : null);
    return enhet ? `${fmt.format(tall)} ${enhet}` : fmt.format(tall);
  });
  return deler.join(" · ");
}
