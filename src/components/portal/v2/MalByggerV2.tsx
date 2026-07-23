"use client";

/**
 * PlayerHQ · AI mal-bygger (/portal/mal/bygger) — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  T,
  Icon,
  Kort,
  Caps,
  Tittel,
  Knapp,
  KpiFlis,
  StatusPill,
  Rad,
  FordelingHode,
  FordelingRad,
  InnsiktChip,
  HjelpTips,
  AKSE_NAVN,
} from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";
import type { HjelpNokkel } from "@/lib/v2/hjelpetekster";
import {
  anbefalMal,
  genererPlanForslag,
  lagrePlan,
  sendTilGodkjenning,
} from "@/app/portal/mal/bygger/actions";
import type {
  AnbefalingerResultat,
  ByggerKontekst,
  ByggerMaltype,
  GenerertForslag,
  MalAnbefaling,
} from "@/lib/plan-builder";
import type {
  PlanForslag,
  PlanForslagOkt,
  OktDag,
} from "@/lib/ai-plan/schema";

type Step = 1 | 2 | 3 | 4 | 5;

const STEG_NAVN: Record<Step, string> = {
  1: "Velg mål",
  2: "Få mal-anbefaling",
  3: "AI tilpasser",
  4: "Forhåndsvis",
  5: "Send til godkjenning",
};

const DAG_NAVN: Record<OktDag, string> = {
  MAN: "Man",
  TIR: "Tir",
  ONS: "Ons",
  TOR: "Tor",
  FRE: "Fre",
  LOR: "Lør",
  SON: "Søn",
};

const DAGER_REKKEFOLGE: OktDag[] = [
  "MAN",
  "TIR",
  "ONS",
  "TOR",
  "FRE",
  "LOR",
  "SON",
];

/* Økt-type → pyramide-akse (samme mapping som lib/plan-builder og
   PlanByggerV2). Kun for farge/navn i UI — datanøklene er uendret. */
const TYPE_TIL_AKSE: Record<string, AkseKey> = {
  RANGE: "TEK",
  NARESPILL: "TEK",
  PUTTING: "TEK",
  SPILL: "SPILL",
  FYSISK: "FYS",
  MENTAL: "SPILL",
  SPESIAL: "TEK",
  TURNERING: "TURN",
};

const AKSE_KODER: AkseKey[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  appearance: "none",
  background: T.panel2,
  border: `1px solid ${T.border}`,
  borderRadius: 10,
  padding: "9px 11px",
  color: T.fg,
  fontFamily: T.ui,
  fontSize: 13,
  outline: "none",
};

export interface MalByggerV2Props {
  kontekst: ByggerKontekst;
}

export function MalByggerV2({ kontekst }: MalByggerV2Props) {
  const [steg, setSteg] = useState<Step>(1);
  const [pending, startTransition] = useTransition();

  // Steg 1
  const [maltype, setMaltype] = useState<ByggerMaltype | null>(null);
  const [turneringId, setTurneringId] = useState<string | null>(null);
  const [egendefinertTekst, setEgendefinertTekst] = useState("");

  // Steg 2
  const [anbefalinger, setAnbefalinger] =
    useState<AnbefalingerResultat | null>(null);
  const [valgtTemplate, setValgtTemplate] = useState<MalAnbefaling | null>(
    null,
  );
  const [visAlternativer, setVisAlternativer] = useState(false);

  // Steg 3 + 4
  const [generert, setGenerert] = useState<GenerertForslag | null>(null);
  const [redigertForslag, setRedigertForslag] = useState<PlanForslag | null>(
    null,
  );
  const [genererFeil, setGenererFeil] = useState<string | null>(null);

  // Steg 5
  const [lagretPlanId, setLagretPlanId] = useState<string | null>(null);
  const [sendtTilGodkjenning, setSendtTilGodkjenning] = useState(false);

  const erGratis = kontekst.spiller.tier === "GRATIS";

  function nullstill() {
    setSteg(1);
    setMaltype(null);
    setTurneringId(null);
    setEgendefinertTekst("");
    setAnbefalinger(null);
    setValgtTemplate(null);
    setVisAlternativer(false);
    setGenerert(null);
    setRedigertForslag(null);
    setGenererFeil(null);
    setLagretPlanId(null);
    setSendtTilGodkjenning(false);
  }

  function gaaTilSteg2() {
    if (!maltype) return;
    startTransition(async () => {
      const res = await anbefalMal({ maltype, turneringId });
      setAnbefalinger(res);
      setValgtTemplate(res.anbefalt);
      setSteg(2);
    });
  }

  function gaaTilSteg3() {
    setSteg(3);
    if (!maltype) return;
    startTransition(async () => {
      try {
        const res = await genererPlanForslag({
          maltype,
          turneringId,
          egendefinertTekst,
          valgtTemplateId: valgtTemplate?.templateId ?? null,
        });
        setGenerert(res);
        setRedigertForslag(res.forslag);
        setGenererFeil(null);
        setSteg(4);
      } catch (err) {
        setGenererFeil(
          err instanceof Error ? err.message : "Ukjent feil ved AI-generering.",
        );
      }
    });
  }

  function lagre(status: "DRAFT" | "PENDING_COACH") {
    if (!generert || !redigertForslag) return;
    startTransition(async () => {
      try {
        const startDato = new Date().toISOString().slice(0, 10);
        const res = await lagrePlan({
          generationId: generert.generationId,
          forslag: redigertForslag,
          status,
          startDato,
        });
        setLagretPlanId(res.planId);
        if (status === "PENDING_COACH") {
          await sendTilGodkjenning(res.planId);
          setSendtTilGodkjenning(true);
        }
        setSteg(5);
      } catch (err) {
        setGenererFeil(
          err instanceof Error ? err.message : "Kunne ikke lagre plan.",
        );
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Topp */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Caps>Mål · AI mal-bygger</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="mal-bygger">AI</Tittel>
          </div>
          <p
            style={{
              fontFamily: T.ui,
              fontSize: 13,
              color: T.fg2,
              lineHeight: 1.6,
              margin: "10px 0 0",
              maxWidth: 560,
            }}
          >
            Vi bruker plan-templates kodifisert fra Anders&apos; coach-arbeid og
            tilpasser dem til din SG-data, mål og periodiseringsfase.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Caps size={9} color={T.mut}>
            Steg {steg} av 5
          </Caps>
          <Knapp ghost onClick={nullstill}>
            Start på nytt
          </Knapp>
        </div>
      </div>

      <StegRad steg={steg} />

      {steg === 1 && (
        <Steg1VelgMal
          kontekst={kontekst}
          maltype={maltype}
          setMaltype={setMaltype}
          turneringId={turneringId}
          setTurneringId={setTurneringId}
          egendefinertTekst={egendefinertTekst}
          setEgendefinertTekst={setEgendefinertTekst}
          pending={pending}
          onNeste={gaaTilSteg2}
        />
      )}
      {steg === 2 && anbefalinger && (
        <Steg2Anbefaling
          anbefalinger={anbefalinger}
          valgtTemplate={valgtTemplate}
          setValgtTemplate={setValgtTemplate}
          visAlternativer={visAlternativer}
          setVisAlternativer={setVisAlternativer}
          pending={pending}
          onTilbake={() => setSteg(1)}
          onNeste={gaaTilSteg3}
        />
      )}
      {steg === 3 && (
        <Steg3AiTilpasser
          kontekst={kontekst}
          valgtTemplate={valgtTemplate}
          pending={pending}
          feil={genererFeil}
          onProvIgjen={gaaTilSteg3}
          onTilbake={() => setSteg(2)}
        />
      )}
      {steg === 4 && redigertForslag && (
        <Steg4Forhandsvis
          forslag={redigertForslag}
          setForslag={setRedigertForslag}
          erGratis={erGratis}
          pending={pending}
          feil={genererFeil}
          onTilbake={() => setSteg(2)}
          onNullstill={nullstill}
          onLagreUtkast={() => lagre("DRAFT")}
          onSendGodkjenning={() => lagre("PENDING_COACH")}
        />
      )}
      {steg === 5 && (
        <Steg5Bekreftelse
          sendtTilGodkjenning={sendtTilGodkjenning}
          planId={lagretPlanId}
          onLagEnTil={nullstill}
        />
      )}
    </div>
  );
}

/* ── Steg-indikator ─────────────────────────────────────────────────
   Ren indikator (som legacy-progressbaren): navigasjon skjer kun via
   Tilbake/Neste-knappene i stegene, aldri ved klikk på pillene. */
function StegRad({ steg }: { steg: Step }) {
  const alle: Step[] = [1, 2, 3, 4, 5];
  return (
    <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
      {alle.map((n) => {
        const aktiv = n === steg;
        const ferdig = n < steg;
        return (
          <span
            key={n}
            style={{
              flex: "1 0 auto",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              padding: "9px 13px",
              borderRadius: 9999,
              border: `1px solid ${aktiv ? "transparent" : T.border}`,
              background: aktiv ? T.lime : T.panel,
              color: aktiv ? T.onLime : ferdig ? T.fg : T.mut,
            }}
          >
            <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, display: "inline-flex" }}>
              {ferdig ? <Icon name="check" size={11} /> : n}
            </span>
            <span
              className="hidden sm:inline"
              style={{ fontFamily: T.ui, fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap" }}
            >
              {STEG_NAVN[n]}
            </span>
          </span>
        );
      })}
    </div>
  );
}

/* ── Steg 1 — Velg mål ─────────────────────────────────────────────── */

function Steg1VelgMal(props: {
  kontekst: ByggerKontekst;
  maltype: ByggerMaltype | null;
  setMaltype: (t: ByggerMaltype) => void;
  turneringId: string | null;
  setTurneringId: (id: string | null) => void;
  egendefinertTekst: string;
  setEgendefinertTekst: (s: string) => void;
  pending: boolean;
  onNeste: () => void;
}) {
  const {
    kontekst,
    maltype,
    setMaltype,
    turneringId,
    setTurneringId,
    egendefinertTekst,
    setEgendefinertTekst,
    pending,
    onNeste,
  } = props;

  const kanGaaVidere =
    maltype !== null &&
    (maltype !== "TURNERING" || turneringId !== null) &&
    (maltype !== "EGENDEFINERT" || egendefinertTekst.trim().length >= 10);

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <InnsiktChip>
        Hva vil du oppnå med neste treningsplan, {kontekst.spiller.fornavn}?
      </InnsiktChip>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: T.gap,
        }}
      >
        <MalValgKort
          icon="trophy"
          tittel="Forberedelse til turnering"
          beskrivelse="Spisset plan mot en konkret turnering i kalenderen."
          valgt={maltype === "TURNERING"}
          onClick={() => setMaltype("TURNERING")}
        />
        <MalValgKort
          icon="target"
          tittel="Forbedre svakeste område"
          beskrivelse={
            kontekst.svakhet
              ? `Din svakhet: ${kontekst.svakhet.skillArea}${kontekst.svakhet.sgDelta !== null ? ` (${kontekst.svakhet.sgDelta.toFixed(2)})` : ""}.`
              : "AI finner din SG-svakhet og fokuserer planen rundt det."
          }
          hjelp="skillArea"
          valgt={maltype === "SVAKHET"}
          onClick={() => setMaltype("SVAKHET")}
        />
        <MalValgKort
          icon="layers"
          tittel="Generell utvikling"
          beskrivelse={
            kontekst.aktivLPhase
              ? `Følger din aktive fase: ${kontekst.aktivLPhase}.`
              : "Balansert utvikling på tvers av pyramiden."
          }
          hjelp="lFase"
          valgt={maltype === "GENERELL"}
          onClick={() => setMaltype("GENERELL")}
        />
        <MalValgKort
          icon="pencil"
          tittel="Egendefinert"
          beskrivelse="Beskriv selv hva du vil jobbe med."
          valgt={maltype === "EGENDEFINERT"}
          onClick={() => setMaltype("EGENDEFINERT")}
        />
      </div>

      {maltype === "TURNERING" && (
        <Kort eyebrow="Velg turnering">
          {kontekst.kommendeTurneringer.length === 0 ? (
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: 0 }}>
              Du har ingen planlagte turneringer. Legg til en under{" "}
              <Link
                href="/portal/tren/turneringer"
                style={{ color: T.lime, fontWeight: 600, textDecoration: "none" }}
              >
                Turneringer
              </Link>
              .
            </p>
          ) : (
            kontekst.kommendeTurneringer.map((t, i) => (
              <Rad
                key={t.id}
                title={t.navn}
                sub={[t.kategori, t.dato ?? "Uten dato"].filter(Boolean).join(" · ")}
                meta={turneringId === t.id ? <StatusPill>Valgt</StatusPill> : undefined}
                trailing={null}
                onClick={() => setTurneringId(t.id)}
                last={i === kontekst.kommendeTurneringer.length - 1}
              />
            ))
          )}
        </Kort>
      )}

      {maltype === "EGENDEFINERT" && (
        <Kort eyebrow="Beskriv hva du vil jobbe med (minst 10 tegn)">
          <textarea
            id="egendefinert"
            value={egendefinertTekst}
            onChange={(e) => setEgendefinertTekst(e.target.value)}
            rows={4}
            placeholder="F.eks. Wedge-spill 50-100m, blokk-treninger først, deretter random …"
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </Kort>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Knapp
          icon={pending ? "loader" : "arrow-right"}
          onClick={onNeste}
          disabled={!kanGaaVidere || pending}
        >
          {pending ? "Henter anbefaling …" : "Neste"}
        </Knapp>
      </div>
    </section>
  );
}

function MalValgKort(props: {
  icon: string;
  tittel: string;
  beskrivelse: string;
  hjelp?: HjelpNokkel;
  valgt: boolean;
  onClick: () => void;
}) {
  const { icon, tittel, beskrivelse, hjelp, valgt, onClick } = props;
  return (
    <div onClick={onClick} style={{ cursor: "pointer" }}>
      <Kort
        style={{
          border: `1px solid ${valgt ? `color-mix(in srgb, ${T.lime} 45%, transparent)` : T.border}`,
          height: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              flex: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: valgt
                ? `color-mix(in srgb, ${T.lime} 14%, transparent)`
                : T.panel2,
            }}
          >
            <Icon name={icon} size={15} style={{ color: valgt ? T.lime : T.fg2 }} />
          </span>
          <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg, flex: 1 }}>
            {tittel}
          </span>
          {valgt && <Icon name="check" size={15} style={{ color: T.lime }} />}
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.55, margin: "9px 0 0" }}>
          {beskrivelse}
          {hjelp && (
            <span
              onClick={(e) => e.stopPropagation()}
              style={{ marginLeft: 5, display: "inline-flex", verticalAlign: "middle" }}
            >
              <HjelpTips k={hjelp} size={12} />
            </span>
          )}
        </p>
      </Kort>
    </div>
  );
}

/* ── Steg 2 — Mal-anbefaling ───────────────────────────────────────── */

function Steg2Anbefaling(props: {
  anbefalinger: AnbefalingerResultat;
  valgtTemplate: MalAnbefaling | null;
  setValgtTemplate: (m: MalAnbefaling) => void;
  visAlternativer: boolean;
  setVisAlternativer: (b: boolean) => void;
  pending: boolean;
  onTilbake: () => void;
  onNeste: () => void;
}) {
  const {
    anbefalinger,
    valgtTemplate,
    setValgtTemplate,
    visAlternativer,
    setVisAlternativer,
    pending,
    onTilbake,
    onNeste,
  } = props;

  if (!anbefalinger.anbefalt && anbefalinger.alternativer.length === 0) {
    return (
      <Kort eyebrow="Ingen mal funnet">
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: 0 }}>
          Vi fant ingen plan-template som matcher din kategori og fase. Du kan
          fortsatt la AI-en lage en plan fra scratch.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          <Knapp ghost icon="arrow-left" onClick={onTilbake}>
            Tilbake
          </Knapp>
          <Knapp icon="arrow-right" onClick={onNeste}>
            Gå videre uten mal
          </Knapp>
        </div>
      </Kort>
    );
  }

  const anbefaltMal = anbefalinger.anbefalt;
  const alternativer = anbefalinger.alternativer;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <InnsiktChip>
        Basert på din NGF-kategori og aktive fase fant jeg denne malen til deg:
      </InnsiktChip>

      {anbefaltMal && (
        <MalKortV2
          mal={anbefaltMal}
          valgt={valgtTemplate?.templateId === anbefaltMal.templateId}
          erAnbefalt
          onClick={() => setValgtTemplate(anbefaltMal)}
        />
      )}

      {visAlternativer && alternativer.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Caps>Andre alternativer ({alternativer.length})</Caps>
          {alternativer.map((m) => (
            <MalKortV2
              key={m.templateId}
              mal={m}
              valgt={valgtTemplate?.templateId === m.templateId}
              onClick={() => setValgtTemplate(m)}
            />
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Knapp ghost icon="arrow-left" onClick={onTilbake}>
            Tilbake
          </Knapp>
          {!visAlternativer && alternativer.length > 0 && (
            <Knapp ghost onClick={() => setVisAlternativer(true)}>
              Vis andre alternativer ({alternativer.length})
            </Knapp>
          )}
        </div>
        <Knapp
          icon="arrow-right"
          onClick={onNeste}
          disabled={!valgtTemplate || pending}
        >
          Bruk denne malen
        </Knapp>
      </div>
    </section>
  );
}

function MalKortV2(props: {
  mal: MalAnbefaling;
  valgt: boolean;
  erAnbefalt?: boolean;
  onClick: () => void;
}) {
  const { mal, valgt, erAnbefalt, onClick } = props;
  const fordelingEntries = AKSE_KODER.map((a) => ({
    a,
    pct: Math.round((mal.disciplinFordeling[a] ?? 0) * 100),
  })).filter((e) => e.pct > 0);

  return (
    <div onClick={onClick} style={{ cursor: "pointer" }}>
      <Kort
        tint={erAnbefalt}
        eyebrow={erAnbefalt ? "Anbefalt for deg" : undefined}
        action={
          erAnbefalt ? (
            <StatusPill>Anbefalt</StatusPill>
          ) : valgt ? (
            <StatusPill>Valgt</StatusPill>
          ) : undefined
        }
        style={{
          border: `1px solid ${valgt ? `color-mix(in srgb, ${T.lime} 45%, transparent)` : T.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, color: T.fg, flex: 1, minWidth: 0 }}>
            {mal.navn}
          </span>
          {valgt && erAnbefalt && (
            <Icon name="check" size={15} style={{ color: T.lime, flex: "none" }} />
          )}
        </div>
        {mal.beskrivelse && (
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "8px 0 0", maxWidth: 600 }}>
            {mal.beskrivelse}
          </p>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: T.gap,
            margin: "14px 0",
          }}
        >
          <KpiFlis label="Varighet" value={`${mal.varighetUker} uker`} />
          <KpiFlis label="Økter per uke" value={String(mal.ukentligOktAntall)} />
        </div>
        {fordelingEntries.length > 0 && (
          <div>
            <FordelingHode />
            {fordelingEntries.map((e, i) => (
              <FordelingRad
                key={e.a}
                code={e.a}
                label={AKSE_NAVN[e.a]}
                pct={e.pct}
                value={`${e.pct} %`}
                last={i === fordelingEntries.length - 1}
              />
            ))}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 12,
            flexWrap: "wrap",
            fontFamily: T.ui,
            fontSize: 12,
            color: T.fg2,
          }}
        >
          <span>
            Brukt{" "}
            <strong style={{ fontWeight: 600, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
              {mal.usageCount}
            </strong>{" "}
            ganger
          </span>
          {mal.effectivenessAvg !== null && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              Snitt-effekt:{" "}
              <strong style={{ fontFamily: T.mono, fontWeight: 700, color: T.lime, fontVariantNumeric: "tabular-nums" }}>
                {mal.effectivenessAvg >= 0 ? "+" : ""}
                {mal.effectivenessAvg.toFixed(2)}
              </strong>{" "}
              SG-Total
              <span onClick={(e) => e.stopPropagation()} style={{ display: "inline-flex" }}>
                <HjelpTips k="sgTotal" size={12} />
              </span>
            </span>
          )}
        </div>
      </Kort>
    </div>
  );
}

/* ── Steg 3 — AI tilpasser (loading) ───────────────────────────────── */

function Steg3AiTilpasser(props: {
  kontekst: ByggerKontekst;
  valgtTemplate: MalAnbefaling | null;
  pending: boolean;
  feil: string | null;
  onProvIgjen: () => void;
  onTilbake: () => void;
}) {
  const { kontekst, valgtTemplate, pending, feil, onProvIgjen, onTilbake } =
    props;

  const bullets: { tekst: string; hjelp?: HjelpNokkel }[] = [];
  if (kontekst.svakhet) {
    bullets.push({
      tekst: `Din SG-svakhet: ${kontekst.svakhet.skillArea}${kontekst.svakhet.sgDelta !== null ? ` (${kontekst.svakhet.sgDelta.toFixed(2)})` : ""}`,
      hjelp: "skillArea",
    });
  }
  if (kontekst.aktivLPhase) {
    bullets.push({ tekst: `Aktiv L-fase: ${kontekst.aktivLPhase}`, hjelp: "lFase" });
  }
  if (valgtTemplate) {
    bullets.push({
      tekst: `Baseline-mal: ${valgtTemplate.navn} (brukt ${valgtTemplate.usageCount} ganger)`,
    });
  }
  if (kontekst.kommendeTurneringer.length > 0) {
    const t = kontekst.kommendeTurneringer[0];
    bullets.push({ tekst: `Neste turnering: ${t.navn}${t.dato ? ` (${t.dato})` : ""}` });
  }
  bullets.push({ tekst: "Pyramide-balanse fra siste 4 ukers økter" });

  return (
    <Kort pad="32px 24px">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          textAlign: "center",
        }}
      >
        {feil ? (
          <>
            <span
              style={{
                width: 56,
                height: 56,
                borderRadius: 9999,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: `color-mix(in srgb, ${T.down} 12%, transparent)`,
              }}
            >
              <Icon name="triangle-alert" size={24} style={{ color: T.down }} />
            </span>
            <div>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 21, color: T.fg }}>
                AI klarte ikke å fullføre
              </div>
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "8px 0 0", maxWidth: 480 }}>
                {feil}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <Knapp ghost icon="arrow-left" onClick={onTilbake}>
                Tilbake
              </Knapp>
              <Knapp icon="rotate-cw" onClick={onProvIgjen}>
                Prøv igjen
              </Knapp>
            </div>
          </>
        ) : (
          <>
            <span style={{ position: "relative", display: "inline-flex" }}>
              <span
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 9999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `color-mix(in srgb, ${T.lime} 14%, transparent)`,
                }}
              >
                <Icon name="sparkles" size={28} style={{ color: T.lime }} />
              </span>
              <Icon
                name="loader"
                size={20}
                className="animate-spin"
                style={{ position: "absolute", right: -4, bottom: -4, color: T.lime }}
              />
            </span>
            <div>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 22, color: T.fg }}>
                Anders&apos;{" "}
                <em style={{ fontStyle: "italic", color: T.lime }}>AI tilpasser</em>{" "}
                malen til deg …
              </div>
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, margin: "8px 0 0" }}>
                Dette tar typisk 10-15 sekunder.
              </p>
            </div>
            <ul
              style={{
                width: "100%",
                maxWidth: 460,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                textAlign: "left",
                listStyle: "none",
                margin: 0,
                padding: 0,
              }}
            >
              {bullets.map((b, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    borderRadius: 10,
                    border: `1px solid ${T.border}`,
                    background: T.panel2,
                    padding: "10px 12px",
                  }}
                >
                  <Icon
                    name="check-circle"
                    size={14}
                    style={{ color: T.lime, flex: "none", marginTop: 2 }}
                  />
                  <span style={{ fontFamily: T.ui, fontSize: 12.5, lineHeight: 1.5, color: T.fg }}>
                    {b.tekst}
                    {b.hjelp && (
                      <span style={{ marginLeft: 5, display: "inline-flex", verticalAlign: "middle" }}>
                        <HjelpTips k={b.hjelp} size={12} />
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            {pending && <Caps size={9}>Genererer …</Caps>}
          </>
        )}
      </div>
    </Kort>
  );
}

/* ── Steg 4 — Forhåndsvis ──────────────────────────────────────────── */

function Steg4Forhandsvis(props: {
  forslag: PlanForslag;
  setForslag: (p: PlanForslag) => void;
  erGratis: boolean;
  pending: boolean;
  feil: string | null;
  onTilbake: () => void;
  onNullstill: () => void;
  onLagreUtkast: () => void;
  onSendGodkjenning: () => void;
}) {
  const {
    forslag,
    setForslag,
    erGratis,
    pending,
    feil,
    onTilbake,
    onNullstill,
    onLagreUtkast,
    onSendGodkjenning,
  } = props;

  function oppdaterNavn(navn: string) {
    setForslag({ ...forslag, navn });
  }

  function fjernOkt(idx: number) {
    const nyOkter = forslag.okter.filter((_, i) => i !== idx);
    setForslag({ ...forslag, okter: nyOkter });
  }

  // Disciplin-fordeling fra økter (beregning uendret fra legacy)
  const disciplinFordeling = beregnDisciplinFordeling(forslag.okter);
  const akseFordeling = tilAkseFordeling(disciplinFordeling);
  const akseEntries = AKSE_KODER.map((a) => ({
    a,
    pct: Math.round((akseFordeling[a] ?? 0) * 100),
  })).filter((e) => e.pct > 0);

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr]" style={{ gap: T.gap, alignItems: "start" }}>
        {/* Venstre — Plan-oversikt */}
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <Kort eyebrow="Plan-navn">
            <input
              id="plannavn"
              type="text"
              value={forslag.navn}
              onChange={(e) => oppdaterNavn(e.target.value)}
              style={{ ...inputStyle, fontFamily: T.disp, fontWeight: 700, fontSize: 16 }}
            />
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "10px 0 0" }}>
              {forslag.beskrivelse}
            </p>
          </Kort>

          <Kort eyebrow="Nøkkeltall">
            <NokkelRad label="Varighet" verdi={`${forslag.periodeUker} uker`} />
            <NokkelRad label="Antall økter" verdi={forslag.okter.length.toString()} />
            <NokkelRad
              label="Snitt/uke"
              verdi={(forslag.okter.length / Math.max(forslag.periodeUker, 1)).toFixed(1)}
              last
            />
          </Kort>

          {forslag.fokusOmrader.length > 0 && (
            <Kort eyebrow="Fokus-områder">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {forslag.fokusOmrader.map((f) => (
                  <StatusPill key={f}>{f}</StatusPill>
                ))}
              </div>
            </Kort>
          )}

          {akseEntries.length > 0 && (
            <Kort eyebrow="Disciplin-fordeling">
              <FordelingHode />
              {akseEntries.map((e, i) => (
                <FordelingRad
                  key={e.a}
                  code={e.a}
                  label={AKSE_NAVN[e.a]}
                  pct={e.pct}
                  value={`${e.pct} %`}
                  last={i === akseEntries.length - 1}
                />
              ))}
            </Kort>
          )}
        </div>

        {/* Høyre — Ukentlig grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, color: T.fg }}>
              Ukentlig grid
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Icon name="pencil" size={11} style={{ color: T.mut }} />
              <Caps size={9}>Klikk for å redigere</Caps>
            </span>
          </div>

          {Array.from({ length: forslag.periodeUker }, (_, ukeIdx) => {
            const uke = ukeIdx + 1;
            const okterIuken = forslag.okter
              .map((okt, idx) => ({ okt, idx }))
              .filter(({ okt }) => okt.uke === uke);
            return (
              <UkeKort key={uke} ukeNr={uke} okter={okterIuken} onFjern={fjernOkt} />
            );
          })}
        </div>
      </div>

      {feil && (
        <div
          style={{
            border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`,
            background: `color-mix(in srgb, ${T.down} 8%, transparent)`,
            borderRadius: 12,
            padding: "10px 14px",
            fontFamily: T.ui,
            fontSize: 12.5,
            color: T.down,
          }}
        >
          {feil}
        </div>
      )}

      {erGratis && (
        <Kort eyebrow="Abonnement">
          <div style={{ display: "flex", gap: 9 }}>
            <Icon name="lock" size={14} style={{ color: T.mut, flex: "none", marginTop: 2 }} />
            <p style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.6, margin: 0 }}>
              <strong style={{ fontWeight: 600, color: T.fg }}>GRATIS-konto:</strong>{" "}
              Du kan se forslaget, men ikke lagre det.{" "}
              <Link
                href="/portal/meg/abonnement"
                style={{ color: T.lime, fontWeight: 600, textDecoration: "none" }}
              >
                Oppgrader til PRO
              </Link>{" "}
              for å lagre planer.
            </p>
          </div>
        </Kort>
      )}

      {/* Bunn-rad */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Knapp ghost icon="arrow-left" onClick={onTilbake}>
            Tilbake
          </Knapp>
          <Knapp ghost onClick={onNullstill}>
            Start på nytt
          </Knapp>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Knapp
            ghost
            icon="file-text"
            onClick={onLagreUtkast}
            disabled={pending || erGratis}
          >
            Lagre som utkast
          </Knapp>
          <Knapp
            icon={pending ? "loader" : "send"}
            onClick={onSendGodkjenning}
            disabled={pending || erGratis}
          >
            {pending ? "Sender …" : "Send til Anders"}
          </Knapp>
        </div>
      </div>
    </section>
  );
}

function NokkelRad({ label, verdi, last }: { label: string; verdi: string; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: "8px 0",
        borderBottom: last ? "none" : `1px solid ${T.border}`,
      }}
    >
      <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>{label}</span>
      <span style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
        {verdi}
      </span>
    </div>
  );
}

function UkeKort(props: {
  ukeNr: number;
  okter: { okt: PlanForslagOkt; idx: number }[];
  onFjern: (idx: number) => void;
}) {
  const { ukeNr, okter, onFjern } = props;
  const [aapenIdx, setAapenIdx] = useState<number | null>(null);

  return (
    <Kort
      eyebrow={`Uke ${ukeNr}`}
      action={<Caps size={9}>{okter.length} {okter.length === 1 ? "økt" : "økter"}</Caps>}
      pad="14px 16px"
    >
      <div className="grid grid-cols-1 sm:grid-cols-7" style={{ gap: 8 }}>
        {DAGER_REKKEFOLGE.map((dag) => {
          const ipDag = okter.filter(({ okt }) => okt.dag === dag);
          return (
            <div
              key={dag}
              style={{
                minHeight: 80,
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                background: T.panel2,
                padding: 8,
                minWidth: 0,
              }}
            >
              <Caps size={9}>{DAG_NAVN[dag]}</Caps>
              {ipDag.length === 0 ? (
                <div
                  style={{
                    marginTop: 8,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    border: `1px dashed ${T.border}`,
                  }}
                >
                  <Icon name="plus" size={12} style={{ color: T.mut }} />
                </div>
              ) : (
                <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                  {ipDag.map(({ okt, idx }) => (
                    <OktBoks
                      key={idx}
                      okt={okt}
                      aapen={aapenIdx === idx}
                      onToggle={() => setAapenIdx(aapenIdx === idx ? null : idx)}
                      onFjern={() => onFjern(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Kort>
  );
}

function OktBoks(props: {
  okt: PlanForslagOkt;
  aapen: boolean;
  onToggle: () => void;
  onFjern: () => void;
}) {
  const { okt, aapen, onToggle, onFjern } = props;
  const akse = TYPE_TIL_AKSE[okt.type] ?? "TEK";
  const farge = T.ax[akse] ?? T.mut;
  return (
    <div
      style={{
        overflow: "hidden",
        borderRadius: 8,
        border: `1px solid ${T.border}`,
        background: T.panel,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="v2-focus"
        style={{
          appearance: "none",
          cursor: "pointer",
          display: "flex",
          width: "100%",
          alignItems: "flex-start",
          gap: 6,
          padding: "5px 6px",
          textAlign: "left",
          background: "transparent",
          border: "none",
        }}
      >
        <span
          title={AKSE_NAVN[akse]}
          style={{
            marginTop: 4,
            width: 6,
            height: 6,
            flex: "none",
            borderRadius: 9999,
            background: farge,
          }}
        />
        <span style={{ minWidth: 0, flex: 1 }}>
          <span
            style={{
              display: "block",
              fontFamily: T.ui,
              fontSize: 10.5,
              fontWeight: 600,
              lineHeight: 1.3,
              color: T.fg,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {okt.fokus}
          </span>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut, fontVariantNumeric: "tabular-nums" }}>
            {okt.varighetMin} min
          </span>
        </span>
      </button>
      {aapen && (
        <div style={{ borderTop: `1px solid ${T.border}`, background: T.panel2, padding: "8px" }}>
          <Caps size={9}>Drills ({okt.drills.length})</Caps>
          <ul style={{ margin: "4px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
            {okt.drills.map((d, i) => (
              <li key={i} style={{ fontFamily: T.ui, fontSize: 10.5, lineHeight: 1.4, color: T.fg }}>
                <strong style={{ fontWeight: 600 }}>{d.navn}</strong>
                {(d.sets ?? d.antallSet) !== undefined &&
                  (d.reps ?? d.antallRep) !== undefined && (
                    <span style={{ marginLeft: 4, fontFamily: T.mono, color: T.mut, fontVariantNumeric: "tabular-nums" }}>
                      {d.sets ?? d.antallSet}×{d.reps ?? d.antallRep}
                    </span>
                  )}
                {d.csTarget !== undefined && (
                  <span style={{ marginLeft: 4, fontFamily: T.mono, color: T.lime, fontVariantNumeric: "tabular-nums" }}>
                    @{d.csTarget}%
                  </span>
                )}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFjern();
            }}
            className="v2-focus"
            style={{
              appearance: "none",
              cursor: "pointer",
              marginTop: 8,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: "transparent",
              border: "none",
              padding: 0,
              fontFamily: T.mono,
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: T.down,
            }}
          >
            <Icon name="trash-2" size={11} />
            Slett økt
          </button>
        </div>
      )}
    </div>
  );
}

function beregnDisciplinFordeling(
  okter: PlanForslagOkt[],
): Record<string, number> {
  if (okter.length === 0) return {};
  const totalt = okter.reduce((s, o) => s + o.varighetMin, 0);
  if (totalt === 0) return {};
  const acc: Record<string, number> = {};
  for (const o of okter) {
    const k = o.type;
    acc[k] = (acc[k] ?? 0) + o.varighetMin;
  }
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(acc)) {
    out[k] = v / totalt;
  }
  return out;
}

/* Visuell aggregering av økt-type-fordelingen til pyramide-akser (T.ax).
   Kun display — beregnDisciplinFordeling over er uendret fra legacy. */
function tilAkseFordeling(
  fordeling: Record<string, number>,
): Partial<Record<AkseKey, number>> {
  const ut: Partial<Record<AkseKey, number>> = {};
  for (const [k, v] of Object.entries(fordeling)) {
    const akse = TYPE_TIL_AKSE[k] ?? "TEK";
    ut[akse] = (ut[akse] ?? 0) + v;
  }
  return ut;
}

/* ── Steg 5 — Bekreftelse ──────────────────────────────────────────── */

function Steg5Bekreftelse(props: {
  sendtTilGodkjenning: boolean;
  planId: string | null;
  onLagEnTil: () => void;
}) {
  const { sendtTilGodkjenning, onLagEnTil } = props;
  return (
    <Kort tint pad="40px 24px">
      <div
        style={{
          margin: "0 auto",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          textAlign: "center",
        }}
      >
        <span
          style={{
            width: 64,
            height: 64,
            borderRadius: 9999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: `color-mix(in srgb, ${T.lime} 14%, transparent)`,
          }}
        >
          <Icon name="check-circle" size={30} style={{ color: T.lime }} />
        </span>
        <div>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 26, letterSpacing: "-0.02em", color: T.fg }}>
            {sendtTilGodkjenning ? "Sendt til Anders!" : "Lagret som utkast"}
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.6, margin: "8px 0 0" }}>
            {sendtTilGodkjenning
              ? "Anders svarer vanligvis innen 24 timer. Du får varsel når planen er godkjent."
              : "Planen ligger nå som utkast under Mål-fanen. Du kan redigere eller sende den til godkjenning når du vil."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/portal/mal" style={{ textDecoration: "none" }}>
            <Knapp icon="arrow-right">Tilbake til Mål</Knapp>
          </Link>
          <Knapp ghost onClick={onLagEnTil}>
            Lag en plan til
          </Knapp>
        </div>
      </div>
    </Kort>
  );
}
