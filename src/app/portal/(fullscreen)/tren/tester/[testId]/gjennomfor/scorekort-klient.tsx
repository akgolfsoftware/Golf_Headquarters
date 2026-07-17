"use client";

/**
 * PlayerHQ · Tren · Tester · Gjennomfør — scorekort-klient (v2).
 * v2-port 17. juli 2026 (Team D2): flyttet fra (fullscreen-test) og restylet
 * til v2 (T-tokens + v2-primitiver), samme fullskjerm-konvensjon som
 * live-familien (chrome-løs, egen flate).
 *
 * Tre steg: Brief (m/kontekst) → Scorekort → Oppsummering.
 *
 * Scoren regnes via den FELLES motoren (test-scoring.ts) — samme funksjon
 * serveren bruker som fasit. Klienten sender kun rå slag-verdier + kontekst;
 * live-preview og lagret score kan derfor aldri avvike. Enheter/mål kommer
 * alltid fra protokollen (ingen hardkodede referanseverdier). Logikken er
 * uendret fra legacy-klienten — kun presentasjonslaget er nytt.
 */

import { useEffect, useMemo, useState, useTransition } from "react";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { T, Caps, Knapp, CTAPill, TekstOmraade } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
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

/** Stegene i flyten — drives status-stripens teller (jf. Live Test «Øvelse N av M»). */
const STEG_REKKE: Steg[] = ["brief", "scorekort", "oppsummering"];
const STEG_LABEL: Record<Steg, string> = {
  brief: "Klargjøring",
  scorekort: "Live nå",
  oppsummering: "Oppsummering",
};

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

/* ── Delte stiler (v2) ─────────────────────────────────── */

const lblStil: CSSProperties = {
  fontFamily: T.mono,
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: T.mut,
};

const inputStil: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  appearance: "none",
  height: 44,
  background: T.panel2,
  border: `1px solid ${T.borderS}`,
  borderRadius: 11,
  padding: "0 13px",
  fontFamily: T.mono,
  fontSize: 13,
  color: T.fg,
  outline: "none",
};

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
      <div>
        <StatusStrip steg="brief" progressPct={0} live={false} />

        {beskrivelse && (
          <p style={{ margin: "18px 0 14px", maxWidth: "62ch", fontFamily: T.ui, fontSize: 13.5, lineHeight: 1.6, color: T.fg2 }}>
            {beskrivelse}
          </p>
        )}

        <SectionHead>Protokoll</SectionHead>
        <div style={{ overflow: "hidden", borderRadius: 16, border: `1px solid ${T.border}`, background: T.panel }}>
          <BriefRad label="Forsøk" verdi={`${antallForsok}`} />
          <BriefRad label="Per forsøk" verdi={felterTekst} />
          {protokollEnhet && <BriefRad label="Enhet" verdi={protokollEnhet} />}
          <BriefRad label="Scoring" verdi={scoringRule} last />
        </div>

        {harMaal && (
          <p style={{ margin: "10px 0 0", fontFamily: T.ui, fontSize: 11.5, lineHeight: 1.6, color: T.mut }}>
            Målverdier i protokollen er foreslått fra IUP — ikke låst fasit.
          </p>
        )}

        <KontekstForm kontekst={kontekst} onSett={(k, v) => setKontekst((prev) => ({ ...prev, [k]: v }))} />

        <div style={{ marginTop: 22 }}>
          <Knapp full icon="play" onClick={() => setSteg("scorekort")} style={{ minHeight: 48 }}>
            Start test
          </Knapp>
        </div>
        <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
          <Link href={`/portal/tren/tester/${testId}`} style={{ textDecoration: "none" }}>
            <CTAPill ghost icon="arrow-left">Tilbake til testen</CTAPill>
          </Link>
        </div>

        <FysPlassholderNote />
      </div>
    );
  }

  if (steg === "scorekort") {
    return (
      <div>
        <StatusStrip
          steg="scorekort"
          progressPct={antallForsok === 0 ? 0 : (antallFort / antallForsok) * 100}
          live
        />

        {/* Accent-kort — løpende score (jf. runde-ny) */}
        <div style={{ marginTop: 18 }}>
          <ScoreKort
            score={score}
            scoreEnhet={scoreEnhet}
            subline={`Forsøk ${antallFort} av ${antallForsok}`}
          />
        </div>

        <SectionHead>{fellesLabel ?? "Scorekort"}</SectionHead>
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: enkel ? "repeat(auto-fill, minmax(150px, 1fr))" : "repeat(auto-fill, minmax(260px, 1fr))" }}>
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

        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Knapp ghost icon="rotate-cw" onClick={angreSiste} disabled={historikk.length === 0} style={{ minHeight: 44 }}>
            Angre siste
          </Knapp>
          <Knapp ghost icon="x" onClick={avbryt} style={{ minHeight: 44 }}>
            Avbryt
          </Knapp>
        </div>

        <div style={{ marginTop: 16 }}>
          <Knapp full icon="arrow-right" onClick={() => setSteg("oppsummering")} disabled={antallFort === 0} style={{ minHeight: 48 }}>
            Til oppsummering
          </Knapp>
        </div>

        <FysPlassholderNote />
      </div>
    );
  }

  // ── Steg C — Oppsummering ──────────────────────────────────────
  return (
    <div>
      <StatusStrip steg="oppsummering" progressPct={100} live={false} />

      <div style={{ marginTop: 18 }}>
        <ScoreKort
          score={score}
          scoreEnhet={scoreEnhet}
          subline={`${antallFort} av ${antallForsok} slag ført`}
        />
      </div>

      <SectionHead>Per forsøk</SectionHead>
      <div style={{ overflow: "hidden", borderRadius: 16, border: `1px solid ${T.border}`, background: T.panel }}>
        {spec.forsok.map((f, i) => (
          <div
            key={f.nr}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: i === spec.forsok.length - 1 ? "none" : `1px solid ${T.border}` }}
          >
            <span style={{ width: 28, flex: "none", fontFamily: T.mono, fontSize: 10, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.mut }}>
              {String(f.nr).padStart(2, "0")}
            </span>
            <span style={{ minWidth: 0, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>
              {f.label}
            </span>
            <span style={{ flex: "none", fontFamily: T.mono, fontSize: 12, fontVariantNumeric: "tabular-nums", color: T.fg2 }}>
              {forsokSammendrag(f, verdier[f.nr])}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <TekstOmraade
          label="Notat · valgfritt"
          value={notat}
          rows={3}
          placeholder="Forhold, følelse, hva du jobbet med…"
          onChange={(v) => setNotat(v.slice(0, 500))}
        />
      </div>

      {!alleFort && (
        <p style={{ margin: "12px 0 0", fontFamily: T.ui, fontSize: 11.5, lineHeight: 1.6, color: T.warn }}>
          Før resultat på alle {antallForsok} slag før du lagrer ({antallFort} ført).
        </p>
      )}

      {feil && (
        <div
          role="alert"
          style={{ marginTop: 16, borderRadius: 11, border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`, background: `color-mix(in srgb, ${T.down} 10%, transparent)`, padding: "10px 14px", fontFamily: T.ui, fontSize: 13, color: T.down }}
        >
          {feil}
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <Knapp full icon="check" onClick={lagre} disabled={pending || !alleFort} style={{ minHeight: 48 }}>
          {pending ? "Lagrer…" : "Lagre resultat"}
        </Knapp>
      </div>
      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Knapp ghost icon="chevron-left" onClick={() => setSteg("scorekort")} disabled={pending} style={{ minHeight: 44 }}>
          Tilbake
        </Knapp>
        <Knapp
          ghost
          onClick={avbryt}
          disabled={pending}
          style={{ minHeight: 44, color: T.down, borderColor: `color-mix(in srgb, ${T.down} 35%, transparent)` }}
        >
          Forkast
        </Knapp>
      </div>

      <FysPlassholderNote />
    </div>
  );
}

/* ── Sub-komponenter ──────────────────────────────────────────── */

/** Bunn-note fra Live Test-fasit — gjør FYS-plassholder-status eksplisitt. */
function FysPlassholderNote() {
  return (
    <p style={{ margin: "26px 0 0", borderTop: `1px solid ${T.border}`, paddingTop: 16, textAlign: "center", fontFamily: T.mono, fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>
      FYS-resultater er plassholderverdier · formelen er ikke låst
    </p>
  );
}

/**
 * Terminal status-stripe (Live Test-idiom). Venstre: live-puls + stegstatus.
 * Høyre: «Steg N av 3». Under: framdriftslinje.
 */
function StatusStrip({
  steg,
  progressPct,
  live,
}: {
  steg: Steg;
  progressPct: number;
  live: boolean;
}) {
  const stegNr = STEG_REKKE.indexOf(steg) + 1;
  return (
    <div style={{ marginTop: 16, borderRadius: 16, border: `1px solid ${T.border}`, background: T.panel, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            aria-hidden
            style={{ width: 8, height: 8, flex: "none", borderRadius: 9999, background: live ? T.lime : T.mut, boxShadow: live ? `0 0 0 3px color-mix(in srgb, ${T.lime} 30%, transparent)` : "none" }}
          />
          <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: live ? T.lime : T.mut }}>
            {STEG_LABEL[steg]}
          </span>
        </div>
        <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.mut }}>
          Steg {stegNr} av {STEG_REKKE.length}
        </span>
      </div>
      <div style={{ marginTop: 12, height: 3, overflow: "hidden", borderRadius: 9999, background: T.track }}>
        <div
          style={{ height: "100%", borderRadius: 9999, background: T.lime, width: `${Math.max(0, Math.min(100, progressPct))}%`, transition: `width 500ms ${T.ease}` }}
        />
      </div>
    </div>
  );
}

function SectionHead({ children }: { children: ReactNode }) {
  return (
    <div style={{ margin: "20px 0 10px", display: "flex", alignItems: "baseline", gap: 10 }}>
      <Caps size={9}>{children}</Caps>
      <span aria-hidden style={{ height: 1, flex: 1, background: T.border }} />
    </div>
  );
}

function BriefRad({ label, verdi, last }: { label: string; verdi: string; last?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, borderBottom: last ? "none" : `1px solid ${T.border}`, padding: "11px 16px" }}>
      <span style={{ ...lblStil, flex: "none" }}>{label}</span>
      <span style={{ minWidth: 0, textAlign: "right", fontFamily: T.ui, fontSize: 13, fontWeight: 600, lineHeight: 1.4, color: T.fg }}>
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
  return (
    <>
      <SectionHead>Kontekst</SectionHead>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        <Felt label="Dato">
          <input
            type="date"
            value={kontekst.dato}
            onChange={(e) => onSett("dato", e.target.value)}
            className="v2-focus"
            style={inputStil}
          />
        </Felt>
        <Felt label="Lokasjon">
          <input
            type="text"
            value={kontekst.lokasjon}
            onChange={(e) => onSett("lokasjon", e.target.value)}
            placeholder="Bane / anlegg"
            className="v2-focus"
            style={inputStil}
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
            className="v2-focus"
            style={inputStil}
          />
        </Felt>
        <Felt label="Fart på greener">
          <input
            type="text"
            value={kontekst.greenfart}
            onChange={(e) => onSett("greenfart", e.target.value)}
            placeholder="Stimp / rask–treig"
            className="v2-focus"
            style={inputStil}
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

function Felt({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={lblStil}>{label}</span>
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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
      {verdier.map(([v, label]) => {
        const on = valgt === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onVelg(v)}
            aria-pressed={on}
            className="v2-press v2-focus"
            style={{
              appearance: "none",
              cursor: "pointer",
              display: "inline-flex",
              height: 44,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 11,
              fontFamily: T.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              background: on ? T.lime : T.panel2,
              border: `1px solid ${on ? "transparent" : T.borderS}`,
              color: on ? T.onLime : T.fg2,
            }}
          >
            {label}
          </button>
        );
      })}
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
    <div style={{ display: "flex", alignItems: "center", gap: 14, borderRadius: 14, border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.lime}`, background: T.panel, padding: "14px 16px" }}>
      <span style={{ fontFamily: T.mono, fontSize: 30, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", color: T.fg }}>
        {score === null ? "–" : fmt.format(score)}
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: T.mono, fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.fg }}>
          {scoreEnhet ?? "Score"}
        </div>
        <div style={{ marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: T.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut }}>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 8, borderRadius: 14, border: `1px solid ${T.border}`, background: T.panel, padding: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <span style={lblStil}>Forsøk {forsok.nr}</span>
        {forsok.target && (
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: T.mono, fontSize: 9, fontVariantNumeric: "tabular-nums", color: T.mut }}>
            mål {forsok.target}
          </span>
        )}
      </div>
      {visLabel && (
        <span style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, lineHeight: 1.4, color: T.fg }}>
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
    const valgStil = (on: boolean): CSSProperties => ({
      appearance: "none",
      cursor: "pointer",
      display: "inline-flex",
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      borderRadius: 11,
      fontFamily: T.mono,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      background: on ? T.lime : T.panel2,
      border: `1px solid ${on ? "transparent" : T.borderS}`,
      color: on ? T.onLime : T.fg2,
    });
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={lblStil}>{felt.label}</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <button
            type="button"
            onClick={() => onSett(true, true)}
            aria-pressed={verdi === true}
            aria-label={`Treff, forsøk ${forsokNr}`}
            className="v2-press v2-focus"
            style={valgStil(verdi === true)}
          >
            <Icon name="check" size={14} />
            Treff
          </button>
          <button
            type="button"
            onClick={() => onSett(false, true)}
            aria-pressed={verdi === false}
            aria-label={`Bom, forsøk ${forsokNr}`}
            className="v2-press v2-focus"
            style={{
              ...valgStil(false),
              ...(verdi === false
                ? { background: T.panel3, border: `1px solid ${T.borderS}`, color: T.fg }
                : null),
            }}
          >
            <Icon name="x" size={14} />
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
    const steppStil: CSSProperties = {
      appearance: "none",
      cursor: "pointer",
      display: "inline-flex",
      width: 44,
      height: 44,
      flex: "none",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 11,
      background: T.panel3,
      border: `1px solid ${T.borderS}`,
      color: T.fg,
    };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={lblStil}>
          {felt.label}
          {felt.unit ? ` · ${felt.unit}` : ""}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            onClick={() => stepp(-1)}
            disabled={!fort || tall <= 0}
            aria-label={`Trekk fra poeng, forsøk ${forsokNr}`}
            className="v2-press v2-focus"
            style={{ ...steppStil, ...((!fort || tall <= 0) ? { opacity: 0.35, pointerEvents: "none" } : null) }}
          >
            <Icon name="minus" size={15} />
          </button>
          <span style={{ minWidth: 0, flex: 1, textAlign: "center", fontFamily: T.mono, fontSize: 22, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", color: fort ? T.fg : T.mut }}>
            {fort ? fmt.format(tall) : "–"}
          </span>
          <button
            type="button"
            onClick={() => stepp(1)}
            disabled={tall >= MAKS_POENG}
            aria-label={`Legg til poeng, forsøk ${forsokNr}`}
            className="v2-press v2-focus"
            style={{ ...steppStil, ...(tall >= MAKS_POENG ? { opacity: 0.35, pointerEvents: "none" } : null) }}
          >
            <Icon name="plus" size={15} />
          </button>
        </div>
      </div>
    );
  }

  // number / meter — tallfelt med enhets-suffiks
  const enhet = felt.unit ?? (felt.type === "meter" ? "m" : null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={lblStil}>{felt.label}</span>
      <label style={{ display: "flex", height: 48, alignItems: "center", gap: 8, borderRadius: 11, border: `1px solid ${T.borderS}`, background: T.panel2, padding: "0 13px" }}>
        <input
          type="text"
          inputMode="decimal"
          value={typeof verdi === "string" ? verdi : ""}
          onFocus={onSnapshot}
          onChange={(e) => onSett(e.target.value, false)}
          placeholder="0"
          aria-label={`${felt.label}, forsøk ${forsokNr}`}
          style={{ minWidth: 0, flex: 1, border: 0, background: "transparent", padding: 0, outline: "none", fontFamily: T.mono, fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.fg }}
        />
        {enhet && (
          <span style={{ flex: "none", fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut }}>
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
