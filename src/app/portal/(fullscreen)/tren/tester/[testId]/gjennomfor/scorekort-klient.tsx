"use client";

/**
 * PlayerHQ · Test-gjennomføring — Paper-port PP-3 (fase 1).
 * Fasit: designsystem/paper/fase1/playerhq-test-gjennomfor.html.
 *
 * ETT skjermbilde (fasiten har ingen stegmaskin): protokoll-kortet
 * (beskrivelse-prosa + Scoring/Område/Foreslått mål med «Hvorfor dette
 * tallet»-details) og scorekortet på samme flate. Forsøksrad = nr | label |
 * én stor knapp som sykler uregistrert → OK → bom → uregistrert
 * (aria-pressed). Løpende score over radene. Clay-CTA «Lagre testen» i fast
 * bunn-dokk — blokkerer med toast når ingenting er registrert.
 *
 * Felter som ikke passer OK/bom-syklusen (målt verdi, poeng, flere felter)
 * beholder feltinput inline i raden — ingen funksjon fjernes. Kontekst og
 * notat består (sammenslått under scorekortet).
 *
 * Lagring: serveren krever verdi på alle innsendte forsøk, så «lagre når som
 * helst» sendes som de registrerte forsøkene alene — og kun når de er en
 * sammenhengende rekke fra forsøk 1 (avbrutt test = stoppet underveis). Da er
 * indeks-paringen mot protokollens mål per slag fortsatt korrekt for alle
 * scoring-typer. Hull i rekka → forklarende toast, aldri korrupt lagring.
 *
 * Live-økt (T5, TestSession): første registrering starter en IN_PROGRESS-økt;
 * hvert førte forsøk speiles dit (debounced, best effort — klient-staten er
 * fasit). Går du ut midt i testen, gjenopptas økta med det som var ført.
 * «Lagre testen» fullfører økta (TestResult + COMPLETED + talent-sync);
 * «Avbryt uten å lagre» setter den ABORTED.
 *
 * Ved suksess redirecter serveren til testsiden (?lagret=1) — kvitteringen
 * bor der (samme mønster som før porten).
 */

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { T, Knapp, TekstOmraade } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import type { ScorekortFelt, ScorekortForsok, ScorekortSpec } from "@/lib/portal-tester/protocol";
import { scoreTest } from "@/lib/portal-tester/test-scoring";
import {
  avbrytTestSession,
  fullforTestSession,
  lagreSteg,
  startTestSession,
} from "./actions";

/** Verdi-state: tallfelt som rå streng (norsk komma), checkbox som boolean.
 *  Fravær av nøkkel = uregistrert. */
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

/** Norsk desimal-parsing: «12,4» / «−3» → tall. Tom/ugyldig → null. */
function parseNorsk(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed.replace("−", "-").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

const fmt = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 });

function iDagISO(): string {
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

/* ── Delte stiler ─────────────────────────────────────────────── */

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
  omraade,
  sist,
  spec,
  protocol,
  gjenopptak,
}: {
  testId: string;
  beskrivelse: string | null;
  scoringRule: string;
  /** Fasitens Område-rad: «Putting · TEK» e.l. — pyramideområdet fra testen. */
  omraade: string;
  /** Forrige resultat for samme test (why-details) — null når ingen finnes. */
  sist: { score: number; dato: string } | null;
  spec: ScorekortSpec;
  /** Rå protokoll-JSON — sendes til motoren for live-score (samme som server). */
  protocol: unknown;
  /** Pågående TestSession (T5) — førte forsøk gjenopptas som utgangsstate. */
  gjenopptak: { sessionId: string; verdier: Verdier } | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [verdier, setVerdier] = useState<Verdier>(gjenopptak?.verdier ?? {});
  const [historikk, setHistorikk] = useState<Verdier[]>([]);
  const [notat, setNotat] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [kontekst, setKontekst] = useState<Kontekst>({
    dato: iDagISO(),
    lokasjon: "",
    vanskelighet: "",
    vaer: "",
    greenfart: "",
    greenfasthet: "",
  });

  function visToast(t: string) {
    setToast(t);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

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

  /** Hvilke forsøk som er ført (minst én gyldig verdi). */
  const fortMaske = useMemo(
    () => forsokData.map((f) => Object.values(f.verdier).some((v) => v !== null)),
    [forsokData],
  );
  const antallFort = fortMaske.filter(Boolean).length;
  const alleFort = antallFort === antallForsok;
  /** Registrerte forsøk er en sammenhengende rekke fra forsøk 1. */
  const erPrefiks = fortMaske.every((fort, i) => fort === (i < antallFort));

  // ── Live-økt (T5): speiling til TestSession — best effort ────────
  // Klient-staten er fasit; speilingens jobb er gjenopptak og «Pågår»-
  // banneret på tester-huben. Feil her velter aldri selve gjennomføringen.
  const sessionIdRef = useRef<string | null>(gjenopptak?.sessionId ?? null);
  const starterOkt = useRef(false);
  const skitneForsok = useRef<Set<number>>(new Set());
  const speilTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const forsokDataRef = useRef(forsokData);
  useEffect(() => {
    forsokDataRef.current = forsokData;
  }, [forsokData]);

  /** Merk et forsøk endret og planlegg debounced speiling til økta. */
  function speilForsok(nr: number) {
    skitneForsok.current.add(nr);
    if (speilTimer.current) clearTimeout(speilTimer.current);
    speilTimer.current = setTimeout(() => {
      void flushSpeiling();
    }, 600);
  }

  async function flushSpeiling() {
    if (skitneForsok.current.size === 0) return;
    let sid = sessionIdRef.current;
    if (!sid) {
      if (starterOkt.current) {
        // Økt-start pågår i et annet flush — prøv igjen straks.
        speilTimer.current = setTimeout(() => {
          void flushSpeiling();
        }, 600);
        return;
      }
      starterOkt.current = true;
      try {
        const res = await startTestSession({ testId });
        if (res.ok) sid = sessionIdRef.current = res.sessionId;
      } catch {
        // Offline/feil: prøves igjen ved neste endring — fullføringen sender alt.
      } finally {
        starterOkt.current = false;
      }
      if (!sid) return;
    }
    const nrs = [...skitneForsok.current];
    skitneForsok.current.clear();
    for (const nr of nrs) {
      const f = forsokDataRef.current.find((x) => x.nr === nr);
      if (!f) continue;
      try {
        await lagreSteg({ sessionId: sid, stegIndex: nr - 1, verdier: f.verdier });
      } catch {
        // Best effort — klient-staten er fasit til fullføring.
      }
    }
  }

  // Live-score via SAMME motor som serveren → preview kan ikke avvike fra fasit.
  const motor = useMemo(() => scoreTest(protocol, forsokData), [protocol, forsokData]);
  const scoringKind = motor.details.scoring;
  const erTelling = scoringKind === "count_ok";

  const antOk = useMemo(
    () =>
      forsokData.filter((f) => {
        const v = f.verdier["ok"] ?? f.verdier["sunket"];
        return v === true || v === 1;
      }).length,
    [forsokData],
  );

  const scoreEnhet = erTelling
    ? `av ${antallForsok}`
    : (motor.details.unit ?? spec.unit ?? null);

  /** Fasitens foreslåtte mål: forrige resultat pluss én (kun telle-tester). */
  const foreslaatt =
    erTelling && sist !== null
      ? Math.min(Math.round(sist.score) + 1, antallForsok)
      : null;

  // ── State-oppdatering med angre-historikk ──────────────────────
  function pushHistorikk() {
    setHistorikk((h) => [...h.slice(-(MAKS_HISTORIKK - 1)), verdier]);
  }

  function settVerdi(nr: number, key: string, verdi: string | boolean, medHistorikk: boolean) {
    if (medHistorikk) pushHistorikk();
    setVerdier((prev) => ({ ...prev, [nr]: { ...prev[nr], [key]: verdi } }));
    speilForsok(nr);
  }

  /** Syklus for én-checkbox-rader: uregistrert → OK → bom → uregistrert. */
  function syklus(nr: number, key: string) {
    pushHistorikk();
    setVerdier((prev) => {
      const rad = { ...prev[nr] };
      const v = rad[key];
      if (v === undefined) rad[key] = true;
      else if (v === true) rad[key] = false;
      else delete rad[key];
      return { ...prev, [nr]: rad };
    });
    speilForsok(nr);
  }

  function angreSiste() {
    if (historikk.length === 0) return;
    const forrige = historikk[historikk.length - 1];
    // Speil radene angringen faktisk endrer (normalt nøyaktig én).
    const nrs = new Set([...Object.keys(verdier), ...Object.keys(forrige)].map(Number));
    for (const nr of nrs) {
      if (JSON.stringify(verdier[nr] ?? null) !== JSON.stringify(forrige[nr] ?? null)) {
        speilForsok(nr);
      }
    }
    setVerdier(forrige);
    setHistorikk(historikk.slice(0, -1));
  }

  // ── Lagring — «du kan lagre når som helst», serverkontrakten uendret ──
  function lagre() {
    if (antallFort === 0) {
      visToast("Registrer minst ett forsøk først.");
      return;
    }
    if (!alleFort && !erPrefiks) {
      visToast("Fyll forsøkene i rekkefølge — du kan stoppe når som helst, men ikke hoppe over.");
      return;
    }
    setFeil(null);
    const kontekstInn = renKontekst(kontekst);
    // Avbrutt test: kun de registrerte forsøkene sendes (sammenhengende fra
    // forsøk 1, så protokoll-paringen per slag holder).
    const sendes = forsokData.filter((_, i) => fortMaske[i]);
    startTransition(async () => {
      try {
        const res = await fullforTestSession({
          testId,
          notes: notat.trim() === "" ? undefined : notat.trim(),
          ...(kontekstInn ? { kontekst: kontekstInn } : {}),
          forsok: sendes,
        });
        // Ved suksess redirecter action til testsiden (?lagret=1).
        if (res && !res.ok) setFeil(res.error);
      } catch {
        setFeil("Kunne ikke lagre resultatet. Prøv igjen.");
      }
    });
  }

  /** «Avbryt uten å lagre» — setter en påbegynt økt ABORTED før retur. */
  function avbryt() {
    if (speilTimer.current) clearTimeout(speilTimer.current);
    skitneForsok.current.clear();
    const sid = sessionIdRef.current;
    startTransition(async () => {
      if (sid) {
        try {
          await avbrytTestSession({ sessionId: sid });
        } catch {
          // Best effort — økta ryddes uansett ved neste fullføring.
        }
      }
      router.push(`/portal/tren/tester/${testId}`);
    });
  }

  const fellesLabel = spec.forsok.every((f) => f.label === spec.forsok[0]?.label)
    ? (spec.forsok[0]?.label ?? null)
    : null;

  // ── Feiltilstand — fasitens egen flate (Kontrakt §3: «Prøv igjen» er den ene
  //    aksenthandlingen). Alt du har registrert står urørt i scorekortet. ──
  if (feil) {
    return (
      <div
        data-paper-slug="playerhq-test-gjennomfor"
        data-od-id="playerhq-test-gjennomfor-feil"
        style={{ maxWidth: 720, margin: "0 auto", width: "100%", color: T.fg, minWidth: 0 }}
      >
        <div
          role="alert"
          style={{
            padding: "24px 16px",
            background: T.panel2,
            border: `1px dashed ${T.border}`,
            borderRadius: T.rCard,
            marginTop: 16,
          }}
        >
          <h3 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
            Klarte ikke å lagre testen
          </h3>
          <p style={{ margin: "0 0 12px", fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut, lineHeight: 1.55 }}>
            Resultatet ligger trygt på telefonen — ingenting av det du har
            registrert er tapt. Prøv å lagre på nytt når du er klar.
          </p>
          <Knapp
            full
            icon="check"
            onClick={lagre}
            disabled={pending}
            style={{ minHeight: 56, borderRadius: T.rCard }}
            data-paper-en-ting="true"
          >
            {pending ? "Lagrer…" : "Prøv igjen"}
          </Knapp>
        </div>
      </div>
    );
  }

  return (
    <div
      data-paper-slug="playerhq-test-gjennomfor"
      data-od-id="playerhq-test-gjennomfor"
      style={{ maxWidth: 720, margin: "0 auto", width: "100%", color: T.fg, minWidth: 0 }}
    >
      {/* ── Protokollen — kilde: TestDefinition ── */}
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: T.rCard, padding: 16, marginTop: 16 }}>
        <span style={lblStil}>Protokoll</span>
        {beskrivelse && (
          <p style={{ margin: "8px 0", fontFamily: T.bodyFont, fontSize: 13.5, lineHeight: 1.6, color: T.fg2 }}>
            {beskrivelse}
          </p>
        )}
        <ProtokollRad k="Scoring" v={scoringRule} />
        <ProtokollRad k="Område" v={omraade} />
        {foreslaatt !== null && (
          <ProtokollRad k="Foreslått mål" v={`${foreslaatt} av ${antallForsok}`} last />
        )}
        {foreslaatt !== null && sist !== null && (
          <details
            style={{ margin: "12px 0 0", border: `1px solid ${T.border}`, borderRadius: T.rCard }}
          >
            <summary
              className="v2-focus"
              style={{
                display: "flex",
                alignItems: "center",
                minHeight: 44,
                padding: "0 16px",
                cursor: "pointer",
                listStyle: "none",
                fontSize: 12.5,
                fontWeight: 500,
                color: T.mut,
              }}
            >
              Hvorfor dette tallet
            </summary>
            <ul
              style={{
                margin: 0,
                padding: "12px 16px 16px 26px",
                fontFamily: T.bodyFont,
                fontSize: 13,
                color: T.mut,
                lineHeight: 1.55,
              }}
            >
              <li style={{ marginBottom: 8 }}>
                Kilde: forrige resultat {sist.dato} — {fmt.format(sist.score)} av {antallForsok} — og IUP-en din.
              </li>
              <li style={{ marginBottom: 8 }}>Beregning: målet er forrige resultat pluss én.</li>
              <li>
                Forbehold: foreslått, aldri låst fasit. Testen er like gyldig uansett hva
                resultatet blir.
              </li>
            </ul>
          </details>
        )}
      </div>

      {/* ── Kontekst — funksjon beholdt, sammenslått på flata ── */}
      <details style={{ marginTop: 12, border: `1px solid ${T.border}`, borderRadius: T.rCard, background: T.panel }}>
        <summary
          className="v2-focus"
          style={{
            display: "flex",
            alignItems: "center",
            minHeight: 44,
            padding: "0 16px",
            cursor: "pointer",
            listStyle: "none",
            fontSize: 12.5,
            fontWeight: 500,
            color: T.mut,
          }}
        >
          Kontekst · valgfritt
        </summary>
        <div style={{ padding: "0 16px 16px" }}>
          <KontekstForm kontekst={kontekst} onSett={(k, v) => setKontekst((prev) => ({ ...prev, [k]: v }))} />
        </div>
      </details>

      {/* ── Scorekortet — løpende score + én rad per forsøk ── */}
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: T.rCard, padding: 16, marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={lblStil}>Scorekort</span>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            onClick={angreSiste}
            disabled={historikk.length === 0}
            className="v2-press v2-focus"
            style={{
              appearance: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              minHeight: 32,
              padding: "0 10px",
              background: "transparent",
              border: `1px solid ${T.borderS}`,
              borderRadius: 9999,
              cursor: historikk.length === 0 ? "default" : "pointer",
              fontFamily: T.mono,
              fontSize: 10.5,
              color: T.mut,
              opacity: historikk.length === 0 ? 0.4 : 1,
            }}
          >
            <Icon name="rotate-cw" size={12} />
            Angre siste
          </button>
        </div>

        {/* Løpende score — regnet fra radene under */}
        <div
          role="status"
          style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "8px 0 12px" }}
        >
          <span
            style={{
              fontFamily: T.mono,
              fontVariantNumeric: "tabular-nums",
              fontSize: 40,
              fontWeight: 500,
              lineHeight: 1,
              color: T.fg,
            }}
          >
            {erTelling ? antOk : antallFort === 0 ? "–" : fmt.format(motor.score)}
          </span>
          <span style={{ fontFamily: T.mono, fontSize: 13, color: T.mut }}>
            {erTelling
              ? `OK · ${antallFort} av ${antallForsok} registrert`
              : `${scoreEnhet ?? "score"} · ${antallFort} av ${antallForsok} registrert`}
          </span>
        </div>

        {fellesLabel && spec.forsok.some((f) => f.felter.length > 1) && (
          <span style={{ ...lblStil, display: "block", marginBottom: 6 }}>{fellesLabel}</span>
        )}

        {/* Én rad per forsøk — rendret fra ScorekortSpec */}
        {spec.forsok.map((f, i) => (
          <ForsokRad
            key={f.nr}
            forsok={f}
            last={i === spec.forsok.length - 1}
            verdier={verdier[f.nr]}
            onSyklus={(key) => syklus(f.nr, key)}
            onSett={(key, verdi, medHistorikk) => settVerdi(f.nr, key, verdi, medHistorikk)}
            onSnapshot={pushHistorikk}
          />
        ))}
      </div>

      {/* Notat — funksjon beholdt */}
      <div style={{ marginTop: 12 }}>
        <TekstOmraade
          label="Notat · valgfritt"
          value={notat}
          rows={3}
          placeholder="Forhold, følelse, hva du jobbet med…"
          onChange={(v) => setNotat(v.slice(0, 500))}
        />
      </div>

      <p style={{ margin: "12px 0 0", fontFamily: T.bodyFont, fontSize: 12.5, color: T.mut, lineHeight: 1.55 }}>
        Du kan lagre når som helst — også en avbrutt test. Det som er registrert,
        telles og merkes med antall forsøk.
      </p>

      <div style={{ marginTop: 8, display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          onClick={avbryt}
          disabled={pending}
          className="v2-focus"
          style={{
            appearance: "none",
            background: "transparent",
            border: 0,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            minHeight: 44,
            padding: "0 12px",
            fontFamily: T.ui,
            fontSize: 13,
            color: T.mut,
          }}
        >
          <Icon name="x" size={14} />
          Avbryt uten å lagre
        </button>
      </div>

      <FysPlassholderNote />

      {/* ── Fast bunn-dokk — skjermens ene clay-handling ── */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          marginTop: 12,
          padding: "12px 0 calc(12px + env(safe-area-inset-bottom) + var(--ak-cookie-h, 0px))",
          background: `linear-gradient(to top, ${T.bg} 70%, transparent)`,
        }}
      >
        <Knapp
          full
          icon="check"
          onClick={lagre}
          disabled={pending}
          style={{ minHeight: 56, borderRadius: 12 }}
          data-paper-en-ting="true"
        >
          {pending ? "Lagrer…" : "Lagre testen"}
        </Knapp>
      </div>

      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            left: "50%",
            bottom: 96,
            transform: "translateX(-50%)",
            zIndex: 100,
            background: T.fg,
            color: T.bg,
            padding: "12px 16px",
            borderRadius: 12,
            fontSize: 13,
            fontFamily: T.ui,
            maxWidth: "min(90vw, 420px)",
          }}
        >
          {toast}
        </div>
      )}

      {/* Klikkbar summary-markør skjules (fasit .why summary) */}
      <style>{`details > summary::-webkit-details-marker { display: none; }`}</style>
    </div>
  );
}

/* ── Sub-komponenter ──────────────────────────────────────────── */

function ProtokollRad({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        padding: "8px 0",
        borderBottom: last ? "none" : `1px solid ${T.border}`,
        fontSize: 13,
        minWidth: 0,
      }}
    >
      <span style={{ color: T.fg, flex: "none" }}>{k}</span>
      <span
        style={{
          marginLeft: "auto",
          fontFamily: T.mono,
          textAlign: "right",
          color: T.fg2,
          fontVariantNumeric: "tabular-nums",
          minWidth: 0,
        }}
      >
        {v}
      </span>
    </div>
  );
}

/** Bunn-note fra Live Test-fasit — gjør FYS-plassholder-status eksplisitt. */
function FysPlassholderNote() {
  return (
    <p style={{ margin: "20px 0 0", borderTop: `1px solid ${T.border}`, paddingTop: 14, textAlign: "center", fontFamily: T.mono, fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>
      FYS-resultater er plassholderverdier · formelen er ikke låst
    </p>
  );
}

/**
 * Én scorekortrad. Med nøyaktig ett checkbox-felt: fasitens store
 * syklus-knapp (uregistrert → OK → bom). Andre felt-varianter beholder
 * feltinput inline i raden.
 */
function ForsokRad({
  forsok,
  last,
  verdier,
  onSyklus,
  onSett,
  onSnapshot,
}: {
  forsok: ScorekortForsok;
  last: boolean;
  verdier: Record<string, string | boolean> | undefined;
  onSyklus: (key: string) => void;
  onSett: (key: string, verdi: string | boolean, medHistorikk: boolean) => void;
  onSnapshot: () => void;
}) {
  const enkelCheckbox = forsok.felter.length === 1 && forsok.felter[0].type === "checkbox";

  if (enkelCheckbox) {
    const key = forsok.felter[0].key;
    const v = verdier?.[key];
    const erOk = v === true;
    const erBom = v === false;
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "4px 0",
          borderBottom: last ? "none" : `1px solid ${T.border}`,
          minWidth: 0,
        }}
      >
        <span
          style={{
            flex: "none",
            width: 24,
            fontFamily: T.mono,
            fontSize: 11,
            color: T.mut,
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {forsok.nr}
        </span>
        <span
          style={{
            minWidth: 0,
            flex: 1,
            fontSize: 13,
            color: T.fg,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {forsok.label}
          {forsok.target && (
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut, marginLeft: 6 }}>
              mål {forsok.target}
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={() => onSyklus(key)}
          aria-pressed={erOk}
          aria-label={`${forsok.label}: ${
            erOk
              ? "OK — trykk for å endre"
              : erBom
                ? "ikke OK — trykk for å endre"
                : "ikke registrert — trykk for OK"
          }`}
          className="v2-press v2-focus"
          style={{
            flex: "none",
            minWidth: 64,
            minHeight: 44,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            border: `1px solid ${erOk ? T.up : T.borderS}`,
            borderRadius: 9999,
            background: erOk ? T.panel2 : "transparent",
            cursor: "pointer",
            fontFamily: T.mono,
            fontSize: 11,
            color: erOk ? T.up : erBom ? T.down : T.mut,
          }}
        >
          {erOk && <Icon name="check" size={14} style={{ color: T.up }} />}
          {erOk ? "OK" : erBom ? "bom" : "—"}
        </button>
      </div>
    );
  }

  // Felter som ikke passer syklusen — inline input i raden, ingen funksjon fjernet.
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "10px 0",
        borderBottom: last ? "none" : `1px solid ${T.border}`,
        minWidth: 0,
      }}
    >
      <span
        style={{
          flex: "none",
          width: 24,
          marginTop: 4,
          fontFamily: T.mono,
          fontSize: 11,
          color: T.mut,
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {forsok.nr}
      </span>
      <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontSize: 13, color: T.fg }}>
          {forsok.label}
          {forsok.target && (
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut, marginLeft: 6 }}>
              mål {forsok.target}
            </span>
          )}
        </span>
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
              background: on ? T.cta : T.panel2,
              border: `1px solid ${on ? "transparent" : T.borderS}`,
              color: on ? T.onCta : T.fg2,
            }}
          >
            {label}
          </button>
        );
      })}
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
      background: on ? T.cta : T.panel2,
      border: `1px solid ${on ? "transparent" : T.borderS}`,
      color: on ? T.onCta : T.fg2,
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
