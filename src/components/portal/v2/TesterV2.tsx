"use client";

/**
 * PlayerHQ Tester — v2 (retning C «Presis»). Komponert 1:1 fra
 * ui_kits/v2/datagolf-tester.jsx → funksjonen TesterScorekort (+ TabScorekort,
 * TabHistorikk, TestTabell, NivaBadge), men med EKTE data fra loadTesterScreen
 * (src/lib/portal-tester/tester-data.tsx) + tildelinger/resultat-logg fra siden.
 *
 * Kun v2-komponenter fra "@/components/v2"; ingen ad-hoc UI-primitiver. TestTabell
 * og NivaBadge er skjerm-lokale komposisjoner (som i mockupen) bygget av T.*-
 * tokens + v2-primitiver — ingen rå hex.
 *
 * Ærlighet: schemaet har ingen mål-verdi, ingen enhet, ingen benchmark/CS-nivå
 * per test og ingen kalibrert totalscore (FYS-formelen avventer). Disse feltene
 * vises som «—»/utelates, aldri fabrikkert. Se `gaps` i leveransen.
 *
 * V2Shell (montert i (v2preview)/v2-tester/page.tsx) eier chrome-en — denne
 * komponenten rendrer bare den indre innholds-stacken.
 */

import { Fragment, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  T,
  Caps,
  Tittel,
  CTAPill,
  Kort,
  TallHero,
  StatusPill,
  DeltaChip,
  Rad,
  InnsiktChip,
  PillTabs,
  TomTilstand,
} from "@/components/v2";

/* ── Datakontrakt (bygges serverside i page.tsx) ───────────────────── */

/** Endring vs forrige måling — fortegns-tekst + tone (mennesket avgjør). */
export type EndringVerdi = { text: string; tone: "pos" | "neg" | "flat" };

export type TesterRad = {
  test: string;
  /** Siste resultat, allerede tall-formatert (schemaet har ingen enhet). */
  res: string | null;
  /** Nest-siste resultat, formatert. */
  forrige: string | null;
  endring: EndringVerdi | null;
};

export type TesterSeksjon = {
  /** Akse-navn (Fysisk/Teknisk/…). */
  label: string;
  rader: TesterRad[];
};

export type TesterV2Data = {
  playerName: string;
  hcp: number | null;
  totalTests: number;
  testedCount: number;
  totalAttempts: number;
  lastResultLabel: string | null;
  /** Scorekort-seksjoner (kun tester med minst ett resultat). */
  seksjoner: TesterSeksjon[];
  /** Antall tester som ble bedre siden forrige måling. */
  improvedCount: number;
  /** Antall tester som har to+ målinger (dvs. kan vise endring). */
  withDeltaCount: number;
  /** Tildelte tester fra coach (TestAssignment OPEN). */
  kommende: { d: string; navn: string; sub: string }[];
  /** Kronologisk logg over de siste registrerte resultatene. */
  historikk: { d: string; navn: string; poeng: string; endring: EndringVerdi | null }[];
  /** AI-innsikt bygget fra ekte tall (mest forbedrede test), ellers null. */
  innsikt: string | null;
};

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/* ── Skjerm-lokale komposisjoner (1:1 fra mockup, v2-tokens) ────────── */

/**
 * NivaBadge — CS-nivåplassering per resultat. Schemaet har ingen benchmark, så
 * `niva` er alltid null her → «—». Beholdt for struktur-paritet med mockupen.
 */
function NivaBadge({ niva }: { niva: string | null }) {
  if (!niva) return <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>—</span>;
  return (
    <span
      style={{
        fontFamily: T.mono,
        fontSize: 8.5,
        fontWeight: 700,
        letterSpacing: "0.05em",
        color: T.fg2,
        background: T.panel2,
        border: `1px solid ${T.border}`,
        borderRadius: 5,
        padding: "3px 7px",
        whiteSpace: "nowrap",
      }}
    >
      {niva}
    </span>
  );
}

/** Liten endrings-visning: DeltaChip for reell endring, «±0»/«—» ellers. */
function EndringCelle({ endring }: { endring: EndringVerdi | null }) {
  if (!endring || endring.tone === "flat") {
    return (
      <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>
        {endring ? endring.text : "—"}
      </span>
    );
  }
  return <DeltaChip v={endring.text} dir={endring.tone === "neg" ? "down" : "up"} />;
}

/** Scorekort-tabellen (md+): rader = tester, kolonner = Resultat/Mål/Forrige/Endring/Nivå. */
function TestTabell({ seksjoner }: { seksjoner: TesterSeksjon[] }) {
  const th = {
    textAlign: "right" as const,
    padding: "4px 0 8px 10px",
    fontFamily: T.mono,
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: T.mut,
    whiteSpace: "nowrap" as const,
  };
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: "left", padding: "4px 0 8px" }}>Test</th>
            <th style={th}>Resultat</th>
            <th style={th}>Mål</th>
            <th style={th}>Forrige</th>
            <th style={th}>Endring</th>
            <th style={{ ...th, width: 84 }}>Nivå</th>
          </tr>
        </thead>
        <tbody>
          {seksjoner.map((sek) => (
            <Fragment key={sek.label}>
              <tr>
                <td colSpan={6} style={{ padding: "12px 0 6px", borderTop: `1px solid ${T.border}` }}>
                  <Caps size={9} color={T.fg2}>{sek.label}</Caps>
                </td>
              </tr>
              {sek.rader.map((r, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${T.border}` }}>
                  <td style={{ padding: "9px 0", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, whiteSpace: "nowrap" }}>{r.test}</td>
                  <td style={{ padding: "9px 0 9px 10px", textAlign: "right", fontFamily: T.mono, fontSize: 13.5, fontWeight: 700, color: r.res == null ? T.mut : T.fg, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{r.res ?? "—"}</td>
                  <td style={{ padding: "9px 0 9px 10px", textAlign: "right", fontFamily: T.mono, fontSize: 12, color: T.mut, fontVariantNumeric: "tabular-nums" }}>—</td>
                  <td style={{ padding: "9px 0 9px 10px", textAlign: "right", fontFamily: T.mono, fontSize: 12, color: T.fg2, fontVariantNumeric: "tabular-nums" }}>{r.forrige ?? "—"}</td>
                  <td style={{ padding: "9px 0 9px 10px", textAlign: "right" }}><EndringCelle endring={r.endring} /></td>
                  <td style={{ padding: "9px 0 9px 10px", textAlign: "right" }}><NivaBadge niva={null} /></td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Scorekort-liste (< md): samme datakontrakt som tabellen, kort-rad per test
    (Mål/Nivå er alltid «—»-plassholdere ennå og utelates derfor på mobil). */
function TestListeMobil({ seksjoner }: { seksjoner: TesterSeksjon[] }) {
  return (
    <div>
      {seksjoner.map((sek, si) => (
        <div key={sek.label}>
          <div style={{ padding: si === 0 ? "0 0 8px" : "14px 0 8px", borderTop: si === 0 ? "none" : `1px solid ${T.border}` }}>
            <Caps size={9} color={T.fg2}>{sek.label}</Caps>
          </div>
          {sek.rader.map((r, i) => (
            <Rad
              key={i}
              title={r.test}
              sub={r.forrige != null ? `Forrige ${r.forrige}` : undefined}
              meta={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 13.5, fontWeight: 700, color: r.res == null ? T.mut : T.fg, fontVariantNumeric: "tabular-nums" }}>{r.res ?? "—"}</span>
                  <EndringCelle endring={r.endring} />
                </span>
              }
              trailing={null}
              last={i === sek.rader.length - 1}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Testresultater: md+ = tabell, < md = kort-liste (delt datakontrakt). */
function TestResultater({ seksjoner }: { seksjoner: TesterSeksjon[] }) {
  return (
    <>
      <div className="hidden md:block">
        <TestTabell seksjoner={seksjoner} />
      </div>
      <div className="md:hidden">
        <TestListeMobil seksjoner={seksjoner} />
      </div>
    </>
  );
}

/* ── Faner ─────────────────────────────────────────────────────────── */

function TabScorekort({ data, mobile }: { data: TesterV2Data; mobile: boolean }) {
  const harResultat = data.seksjoner.length > 0;

  const scorekort = (
    <Kort
      eyebrow={data.lastResultLabel ? `Testresultater · sist ${data.lastResultLabel}` : "Testresultater"}
      action={<Caps size={9}>Mål og nivå ikke kalibrert</Caps>}
      pad="14px 20px 18px"
    >
      {harResultat ? (
        <>
          <TestResultater seksjoner={data.seksjoner} />
          {/* Footer: ærlig dekning — ingen fabrikkert totalscore (FYS-formelen avventer). */}
          <div style={{ borderTop: `2px solid ${T.borderS}`, marginTop: 4, paddingTop: 14 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <Caps size={9}>Dekning</Caps>
              <span style={{ fontFamily: T.mono, fontSize: 30, fontWeight: 700, color: T.lime, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{data.testedCount}</span>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>av {data.totalTests} tester tatt</span>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>· {data.totalAttempts} registreringer totalt</span>
            </div>
            <div style={{ marginTop: 10, fontFamily: T.ui, fontSize: 11, color: T.mut }}>
              Samlet testscore avventer kalibrering av FYS-formelen.
            </div>
          </div>
        </>
      ) : (
        <TomTilstand
          icon="target"
          title="Ingen tester tatt ennå"
          sub="Gjennomfør en test i katalogen for å bygge scorekortet ditt over tid."
        />
      )}
    </Kort>
  );

  const fremgang = (
    <Kort tint>
      {data.withDeltaCount > 0 ? (
        <TallHero
          label="Fremgang siden forrige måling"
          value={data.improvedCount}
          unit={data.improvedCount === 1 ? "test bedre" : "tester bedre"}
          size={mobile ? 38 : 42}
          sub={`${data.improvedCount} av ${data.withDeltaCount} tester med to+ målinger gikk fram`}
          action={<StatusPill tone={data.improvedCount > 0 ? "up" : "info"}>{data.improvedCount > 0 ? "Fremgang" : "Stabil"}</StatusPill>}
        />
      ) : (
        <TallHero
          label="Fremgang siden forrige måling"
          value="—"
          size={mobile ? 38 : 42}
          sub="Trenger minst to målinger på en test for å vise fremgang"
        />
      )}
    </Kort>
  );

  const kommende = (
    <Kort eyebrow="Tildelt deg">
      {data.kommende.length > 0 ? (
        data.kommende.map((k, i) => (
          <Rad
            key={i}
            leading={<span style={{ width: 46, flex: "none", fontFamily: T.mono, fontSize: 10, color: T.mut }}>{k.d}</span>}
            title={k.navn}
            sub={k.sub}
            trailing={null}
            last={i === data.kommende.length - 1}
          />
        ))
      ) : (
        <TomTilstand icon="clock" title="Ingen tildelte tester" sub="Coachen din har ingen åpne testtildelinger til deg akkurat nå." />
      )}
    </Kort>
  );

  const innsikt = data.innsikt ? <InnsiktChip cta="Se øvelsene" href="/portal/drills">{data.innsikt}</InnsiktChip> : null;

  const sideStack: ReactNode = (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {fremgang}
      {kommende}
      {innsikt}
    </div>
  );

  return mobile ? (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {scorekort}
      {fremgang}
      {kommende}
      {innsikt}
    </div>
  ) : (
    <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: T.gap, alignItems: "start" }}>
      {scorekort}
      {sideStack}
    </div>
  );
}

function TabHistorikk({ data }: { data: TesterV2Data }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Kort eyebrow="Resultater over tid" action={<Caps size={9}>Siste registreringer</Caps>}>
        {data.historikk.length > 0 ? (
          data.historikk.map((h, i) => (
            <Rad
              key={i}
              leading={<span style={{ width: 46, flex: "none", fontFamily: T.mono, fontSize: 10, color: T.mut }}>{h.d}</span>}
              title={h.navn}
              trailing={null}
              meta={
                <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <NivaBadge niva={null} />
                  <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.fg, minWidth: 28, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{h.poeng}</span>
                  <span style={{ width: 44, textAlign: "right" }}>
                    <EndringCelle endring={h.endring} />
                  </span>
                </span>
              }
              last={i === data.historikk.length - 1}
            />
          ))
        ) : (
          <TomTilstand icon="target" title="Ingen resultater ennå" sub="Registrerte testresultater dukker opp her, nyeste først." />
        )}
      </Kort>
    </div>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function TesterV2({ data }: { data: TesterV2Data }) {
  const mobile = useMobile();
  const [tab, setTab] = useState("scorekort");

  const undertittel =
    data.hcp != null
      ? `Tester · ${data.playerName} · hcp ${data.hcp.toLocaleString("nb-NO", { maximumFractionDigits: 1 })}`
      : `Tester · ${data.playerName}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps>{undertittel}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="scorekort">Ditt test-</Tittel>
          </div>
        </div>
        <CTAPill icon="plus">Registrer test</CTAPill>
      </div>
      <PillTabs
        tabs={[
          { id: "scorekort", l: "Scorekort" },
          { id: "historikk", l: "Historikk" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "scorekort" ? <TabScorekort data={data} mobile={mobile} /> : <TabHistorikk data={data} />}
    </div>
  );
}
