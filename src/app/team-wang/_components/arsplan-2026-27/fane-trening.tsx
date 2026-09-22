"use client";

// Trening-fanen: Hero + Årshjul + Periodisering (pyramide) + Månedsplan +
// Ukeplan + Øktplaner. Restylet 22.09.2026 strukturelt mot Claude Design-
// prosjektet «Årsplan Golf WANG Golf Fredrikstad»
// (claude.ai/design/p/779d22c8-1828-46d6-ab11-9fad5472e06f,
// templates/wang-golf-fellesside/GolfTrening.dc.html) — todelt månedsgrid med
// ukenummer-piller og full ukertabell, 2-kolonners kort for månedsplan og
// den faste treningsuka, timet øktplan-tabell. Pyramiden er BEVISST forskjellig
// fra designets faste måltall — Anders valgte 22.09.2026 å beholde live
// beregning fra øktmalens blokker (se `beregnPyramide`), ikke periodebrevets
// faste prosenter.

import { useState } from "react";

import {
  AKSER,
  AKSE_ORD,
  ARSPLAN_EVENTS,
  FASER,
  MND,
  OKTER,
  OMRAADE_LABEL,
  PERIODER,
  TRINN,
  UKER,
  beregnPyramide,
  faseForPeriode,
  type Trinn as TrinnType,
} from "../../_data/arsplan-fasit-2026-27";
import { d, iso } from "../../_data/wang-plan";
import {
  Chip,
  PillGruppe,
  Seksjon,
  SeksjonHode,
  Wrap,
  WangKort,
  klampTilIntervall,
  leggTilDager,
  mandagAv,
  useOsloIdagIso,
} from "./primitiver";

const UKEDAG_NAVN = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

const SESONG_START = UKER[0][1];
const SESONG_SLUTT = (() => {
  const siste = d(UKER[UKER.length - 1][1]);
  siste.setUTCDate(siste.getUTCDate() + 6);
  return iso(siste);
})();

function Hero() {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(160deg, color-mix(in srgb, var(--wang-navy) 82%, white) 0%, var(--wang-navy) 55%, color-mix(in srgb, var(--wang-navy) 82%, black) 100%)",
        color: "var(--white)",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -80,
          right: -60,
          width: 420,
          height: 420,
          borderRadius: "50%",
          border: "1.5px solid var(--wang-mint)",
          opacity: 0.2,
          pointerEvents: "none",
        }}
      />
      <Wrap>
        <div style={{ padding: "clamp(40px,7vw,64px) 0 clamp(24px,4vw,32px)", position: "relative" }}>
          <div
            style={{
              fontFamily: "var(--font-brand)",
              fontWeight: 500,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--white)",
              marginBottom: 10,
            }}
          >
            Toppidrett golf · skoleåret 2026/27
          </div>
          <h1
            style={{
              fontFamily: "var(--font-brand)",
              fontWeight: 300,
              fontSize: "clamp(30px,6.5vw,44px)",
              letterSpacing: "-0.015em",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Hele treningsåret, slik vi har planlagt det
          </h1>
          <p style={{ fontSize: "clamp(15px,2.2vw,17px)", lineHeight: 1.55, color: "var(--text-on-dark-78)", maxWidth: 620, marginTop: 14 }}>
            Fem perioder, 44 uker og tre økter i uka. Vi bygger teknikk om vinteren,
            kalibrerer om våren og presterer i turnering — felles for VG1 til VG3,
            med egne mål per trinn.
          </p>
        </div>
        <div
          style={{
            position: "relative",
            borderTop: "1px solid var(--overlay-on-dark-12)",
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            padding: "18px 0 20px",
          }}
        >
          <div>
            <p style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 500, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--wang-mint)" }}>
              Sted
            </p>
            <p style={{ margin: "4px 0 0", fontFamily: "var(--font-brand)", fontWeight: 500, fontSize: 15 }}>
              GFGK · Treningslokalet
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 500, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--wang-mint)" }}>
              Sportssjef og trener
            </p>
            <p style={{ margin: "4px 0 0", fontFamily: "var(--font-brand)", fontWeight: 500, fontSize: 15 }}>
              Anders Kristiansen
            </p>
          </div>
        </div>
      </Wrap>
    </div>
  );
}

/** Uka man står i (Oslo-korrekt, klampet til sesongen), som UKER-indeks. */
function useNaIdx(): number {
  const naaIso = useOsloIdagIso(SESONG_START);
  const klampet = klampTilIntervall(naaIso, SESONG_START, SESONG_SLUTT);
  const mandag = mandagAv(klampet);
  const idx = UKER.findIndex(([, m]) => m === mandag);
  return idx >= 0 ? idx : 0;
}

function UkePreview({ idx }: { idx: number }) {
  const [uke, mandag, fase, type, notat] = UKER[idx];
  const f = FASER[fase];
  const dager = Array.from({ length: 7 }, (_, i) => leggTilDager(mandag, i));
  const okter = dager
    .map((isoDato, i) => ({
      isoDato,
      dagNavn: UKEDAG_NAVN[i],
      hendelser: (ARSPLAN_EVENTS[isoDato] ?? []).filter((h) => h.type === "okt"),
    }))
    .filter((d2) => d2.hendelser.length > 0);
  const sluttIso = leggTilDager(mandag, 6);

  return (
    <WangKort style={{ borderColor: "var(--wang-navy)", background: "var(--tint-navy)" }}>
      <p style={{ margin: "0 0 10px", fontFamily: "var(--font-brand)", fontWeight: 500, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
        Uka vi står i
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
        <div style={{ minWidth: 150 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 17 }}>Uke {uke}</span>
            <Chip farge={f.tekst} tint={f.tint}>
              {type}
            </Chip>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>
            {mandag.slice(8, 10)}.{mandag.slice(5, 7)}.–{sluttIso.slice(8, 10)}.{sluttIso.slice(5, 7)}
          </p>
          {notat ? <p style={{ margin: "8px 0 0", fontSize: 13.5, maxWidth: 260 }}>{notat}</p> : null}
        </div>
        <div style={{ flex: "1 1 260px", minWidth: 0, display: "flex", flexDirection: "column", gap: 7 }}>
          {okter.length ? (
            okter.map((d2) => (
              <div key={d2.isoDato} style={{ display: "grid", gridTemplateColumns: "62px minmax(0,1fr)", gap: 8, alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-brand)", fontWeight: 500, fontSize: 12, color: "var(--text-secondary)" }}>{d2.dagNavn}</span>
                <span style={{ minWidth: 0, fontSize: 13.5 }}>
                  {d2.hendelser.map((h) => h.label).join(" · ")}
                </span>
              </div>
            ))
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>Ingen økter denne uka.</p>
          )}
        </div>
      </div>
    </WangKort>
  );
}

function Arshjul() {
  const naIdx = useNaIdx();
  const [apenM, setApenM] = useState<number | null>(null);
  const [valgtUke, setValgtUke] = useState<number | null>(null);

  const apenMnd = apenM ?? new Date(UKER[naIdx][1] + "T00:00:00Z").getUTCMonth();
  const forsteMnd = new Date(UKER[0][1] + "T00:00:00Z").getUTCMonth();

  return (
    <Seksjon id="arsplan">
      <SeksjonHode label="Årshjulet" tittel="44 uker, uke 34 til uke 24" ingress="Uka du står i vises øverst. Velg en uke i rutenettet for å bytte, eller en måned for å se alle ukene i den måneden." />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        {(["TURN", "TEST", "GRUNN", "SPES", "FERIE"] as const).map((k) => (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--font-brand)", fontWeight: 500, fontSize: 12 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: FASER[k].farge, display: "inline-block" }} />
            {FASER[k].navn}
          </span>
        ))}
      </div>

      <UkePreview idx={valgtUke ?? naIdx} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginTop: 16 }}>
        {MND.map(([navn, faseKey], i) => {
          const uker = UKER.filter(([, mandag]) => new Date(mandag + "T00:00:00Z").getUTCMonth() === (i + forsteMnd) % 12);
          const apen = apenMnd === (i + forsteMnd) % 12;
          return (
            <WangKort
              key={navn}
              padding={16}
              style={{ cursor: "pointer", borderColor: apen ? "var(--wang-navy)" : undefined }}
            >
              <button
                type="button"
                onClick={() => setApenM((i + forsteMnd) % 12)}
                style={{ all: "unset", cursor: "pointer", display: "block", width: "100%" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 15 }}>{navn}</span>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{uker.length} uker</span>
                </div>
                <span style={{ display: "block", fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{FASER[faseKey].navn}</span>
                <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
                  {uker.map((u) => {
                    const uf = FASER[u[2]];
                    const idx = UKER.findIndex((x) => x[0] === u[0] && x[1] === u[1]);
                    const valgt = idx === (valgtUke ?? naIdx);
                    return (
                      <span
                        key={u[0] + u[1]}
                        style={{
                          flex: 1,
                          minWidth: 28,
                          textAlign: "center",
                          padding: "4px 2px",
                          borderRadius: 4,
                          border: valgt ? "2px solid var(--wang-navy)" : "1px solid transparent",
                          background: uf.tint,
                          fontFamily: "var(--font-brand)",
                          fontWeight: 500,
                          fontSize: 11,
                        }}
                      >
                        {u[0]}
                      </span>
                    );
                  })}
                </div>
              </button>
            </WangKort>
          );
        })}
      </div>

      <WangKort style={{ marginTop: 16 }}>
        <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
          {MND[(apenMnd - forsteMnd + 12) % 12]?.[0]}
        </div>
        <div style={{ overflowX: "hidden" }}>
          {UKER.filter(([, mandag]) => new Date(mandag + "T00:00:00Z").getUTCMonth() === apenMnd).map((u) => {
            const [uke, mandag, fase, type, notat] = u;
            const idx = UKER.findIndex((x) => x[0] === uke && x[1] === mandag);
            const f = FASER[fase];
            const sluttIso = leggTilDager(mandag, 6);
            return (
              <button
                key={uke + mandag}
                type="button"
                onClick={() => setValgtUke(idx)}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  display: "grid",
                  gridTemplateColumns: "64px minmax(0,1fr)",
                  gap: 12,
                  width: "100%",
                  padding: "12px 4px",
                  borderTop: "1px solid var(--neutral-100)",
                  boxSizing: "border-box",
                }}
              >
                <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 15 }}>{uke}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 12.5, color: "var(--text-secondary)" }}>
                    {mandag.slice(8, 10)}.{mandag.slice(5, 7)}–{sluttIso.slice(8, 10)}.{sluttIso.slice(5, 7)}.{mandag.slice(0, 4)}
                  </span>
                  <span style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 4 }}>
                    <Chip farge={f.tekst} tint={f.tint}>
                      {f.navn}
                    </Chip>
                    <span style={{ fontFamily: "var(--font-brand)", fontWeight: 500, fontSize: 13 }}>{type}</span>
                  </span>
                  {notat ? <span style={{ display: "block", fontSize: 13.5, marginTop: 4 }}>{notat}</span> : null}
                </span>
              </button>
            );
          })}
        </div>
      </WangKort>
    </Seksjon>
  );
}

function Periodisering() {
  const [pyr, setPyr] = useState<"GRUNN" | "SPES" | "TURN">("GRUNN");
  const beregnet = beregnPyramide(pyr);
  const nTimer = (m: number) => (Math.round((m / 60) * 10) / 10).toString().replace(".", ",") + " t";

  return (
    <Seksjon id="periodisering">
      <SeksjonHode label="Fem perioder" tittel="Perioder med hver sin hensikt" ingress="Periodene bestemmer hva øktene inneholder." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 24 }}>
        {PERIODER.map((p) => {
          const f = FASER[faseForPeriode(p.id)];
          return (
            <WangKort key={p.id} style={{ borderTop: `3px solid ${f.farge}` }}>
              <p style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 500, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                {p.uker}
              </p>
              <p style={{ margin: "2px 0 10px", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 19 }}>{p.navn}</p>
              <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-secondary)" }}>{p.datoer}</p>
              <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.5 }}>{p.fokus}</p>
            </WangKort>
          );
        })}
      </div>

      <SeksjonHode label="Pyramiden" tittel="Pyramiden i perioden" ingress="Fordelingen beregnes fra planlagte øvelser og egentrening — endres pyramiden i øktplanen, endres tallene her automatisk." />
      <PillGruppe
        valg={(["GRUNN", "SPES", "TURN"] as const).map((k) => ({
          label: k,
          aktiv: k === pyr,
          onVelg: () => setPyr(k),
        }))}
      />
      <WangKort style={{ marginTop: 16 }} key={pyr}>
        <div style={{ display: "grid", gap: 12 }}>
          {AKSER.map((ax, i) => {
            const pct = beregnet.pct[i];
            const min = beregnet.min[AKSE_ORD[i]];
            const kilder = beregnet.kilder[AKSE_ORD[i]];
            return (
              <div
                key={ax.kode}
                style={{ display: "grid", gridTemplateColumns: "minmax(84px,120px) 1fr", gap: 12, alignItems: "center" }}
              >
                <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13.5 }}>{ax.navn}</div>
                <div>
                  <div style={{ height: 10, borderRadius: 999, background: "var(--neutral-100)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: pct + "%", background: ax.farge, borderRadius: 999 }} />
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 4 }}>
                    {pct} % · {nTimer(min)} — {kilder.length ? kilder.join(" · ") : "Ikke planlagt i denne perioden"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 12 }}>
          {nTimer(beregnet.sum)} planlagt trening per uke
        </div>
      </WangKort>
    </Seksjon>
  );
}

function Manedsplan() {
  return (
    <Seksjon id="manedsplan">
      <SeksjonHode label="Tidslinje" tittel="Elleve måneder, kort fortalt" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
        {MND.map(([navn, faseKey, tema, hendelser]) => {
          const f = FASER[faseKey];
          return (
            <WangKort key={navn} padding={20}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 17 }}>{navn}</span>
                <Chip farge={f.tekst} tint={f.tint}>
                  {faseKey}
                </Chip>
              </div>
              <p style={{ margin: "6px 0 0", fontFamily: "var(--font-brand)", fontWeight: 500, fontSize: 13.5, color: "var(--text-secondary)" }}>{tema}</p>
              {hendelser?.length ? (
                <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {hendelser.map((h) => (
                    <li key={h} style={{ display: "flex", gap: 8, fontSize: 13.5, lineHeight: 1.4 }}>
                      <span style={{ color: "var(--wang-teal-text)" }}>·</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </WangKort>
          );
        })}
      </div>
    </Seksjon>
  );
}

function Ukeplan() {
  return (
    <Seksjon id="ukeplan">
      <SeksjonHode label="Den faste treningsuka" tittel="Mandag, onsdag og fredag 08:00–10:00" ingress="Øktene ligger i blokk 1 på timeplanen og er skoletid. Innholdet i den enkelte økta kommer fra trenerens plan og kan endres i løpet av uka." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        {[
          { dag: "Mandag", tema: "Teknikk og styrke" },
          { dag: "Onsdag", tema: "Slag og avstand" },
          { dag: "Fredag", tema: "Spill og turnering" },
        ].map((d2) => (
          <WangKort key={d2.dag} padding={20}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 18 }}>{d2.dag}</span>
              <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>08:00–10:00</span>
            </div>
            <p style={{ margin: "8px 0 0", fontFamily: "var(--font-brand)", fontWeight: 500, fontSize: 14, color: "var(--wang-teal-text)" }}>{d2.tema}</p>
            <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "var(--text-secondary)" }}>Kommer fra trenerens plan i AK Golf HQ.</p>
          </WangKort>
        ))}
      </div>
    </Seksjon>
  );
}

function Oktplaner({ trinn }: { trinn: TrinnType | "Alle trinn" }) {
  const trinnValgte: TrinnType[] = trinn === "Alle trinn" ? ["VG1", "VG2", "VG3"] : [trinn];
  return (
    <Seksjon id="oktplaner">
      <SeksjonHode label="Øktplaner" tittel="Tre maler, én per periode" ingress="Malene viser hvordan en økt er bygget opp i hver periode. Målene er ulike per trinn, og eleven jobber mot sitt eget i den individuelle utviklingsplanen." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {OKTER.map((okt) => {
          const f = FASER[okt.periode];
          const mal = okt.maal.filter((_, j) => trinnValgte.includes((["VG1", "VG2", "VG3"] as const)[j]));
          return (
            <WangKort key={okt.tittel} style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--neutral-100)", borderLeft: `3px solid ${f.farge}` }}>
                <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 17 }}>{okt.tittel}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 }}>{okt.meta}</div>
              </div>
              <div>
                {okt.blokker.map((b, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "58px minmax(0,1fr) auto",
                      gap: 10,
                      alignItems: "baseline",
                      padding: "9px 18px",
                      borderTop: i === 0 ? undefined : "1px solid var(--neutral-100)",
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-brand)", fontWeight: 500, fontSize: 12, color: "var(--text-secondary)" }}>{b.tid}</span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 13.5 }}>{b.del}</span>
                      <span style={{ display: "block", fontSize: 11.5, color: "var(--text-secondary)" }}>
                        {b.innhold}
                        {b.omraade ? " · " + OMRAADE_LABEL[b.omraade] : ""}
                        {b.min ? " · " + b.min + " min" : ""}
                      </span>
                    </span>
                    {b.akse ? (
                      <Chip farge={AKSER[AKSE_ORD.indexOf(b.akse)]?.farge ?? "var(--text-primary)"} tint="var(--neutral-50)">
                        {b.akse}
                      </Chip>
                    ) : null}
                  </div>
                ))}
              </div>
              <div style={{ padding: "16px 18px", background: "var(--neutral-50)" }}>
                <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 11.5, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 8 }}>
                  {trinn === "Alle trinn" ? "Mål per trinn" : "Mål for " + trinn}
                </div>
                {mal.map((m, j) => (
                  <p key={j} style={{ margin: "0 0 8px", fontSize: 13.5, lineHeight: 1.5 }}>
                    <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700 }}>{trinnValgte[j]}. </span>
                    {m.tekst} <span style={{ opacity: 0.7 }}>— {m.kilde}</span>
                  </p>
                ))}
              </div>
            </WangKort>
          );
        })}
      </div>
    </Seksjon>
  );
}

export function FaneTrening({
  trinn,
  onTrinn,
}: {
  trinn: TrinnType | "Alle trinn";
  onTrinn: (t: TrinnType | "Alle trinn") => void;
}) {
  return (
    <div>
      <Hero />
      <div style={{ marginTop: 24 }}>
        <Wrap>
          <PillGruppe
            valg={(["Alle trinn", "VG1", "VG2", "VG3"] as const).map((t) => ({
              label: t === "Alle trinn" ? t : t + " · " + TRINN[t].fag,
              aktiv: t === trinn,
              onVelg: () => onTrinn(t),
            }))}
            aktivBg="var(--wang-mint)"
            aktivFg="var(--wang-navy-deep-text)"
          />
        </Wrap>
      </div>
      <Arshjul />
      <Periodisering />
      <Manedsplan />
      <Ukeplan />
      <Oktplaner trinn={trinn} />
    </div>
  );
}
