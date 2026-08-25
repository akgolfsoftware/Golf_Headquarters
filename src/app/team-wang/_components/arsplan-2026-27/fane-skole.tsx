"use client";

// Skole-fanen: Timeplan + Kompetansemål + Prøver. Fasit:
// designsystem/wang/fasit/arsplan-2026-27/WANG Arsplan 2026-27.dc.html,
// seksjonene #skoleplan/#kompetansemaal/#prover.

import { Fragment, useState } from "react";

import {
  FORELDREMOTER,
  KLASSER,
  KM,
  KM_KRO,
  PROVER,
  SKOLERUTE,
  TIMER,
  DAGER,
  TRINN,
  TRINN_KRO,
  TRINN_ORD,
  moteTekst,
  type Trinn as TrinnType,
} from "../../_data/arsplan-fasit-2026-27";
import { PillGruppe, Seksjon, SeksjonHode, WangKort } from "./primitiver";

function Timeplan() {
  const [klasseId, setKlasseId] = useState(KLASSER[0].id);
  const klasse = KLASSER.find((k) => k.id === klasseId)!;

  return (
    <Seksjon id="skoleplan">
      <SeksjonHode nr={1} label="Ukeplan" tittel="Timeplan" ingress={"Kontaktlærer: " + klasse.kontakt} />
      <PillGruppe
        valg={KLASSER.map((k) => ({ label: k.id, aktiv: k.id === klasseId, onVelg: () => setKlasseId(k.id) }))}
      />
      <WangKort style={{ marginTop: 16, overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "110px repeat(5, minmax(0,1fr))", gap: 6, minWidth: 640 }}>
          <div />
          {DAGER.map((d) => (
            <div key={d} style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 12.5, textAlign: "center", padding: "6px 0" }}>
              {d}
            </div>
          ))}
          {TIMER.map(([label, tid], radI) => (
            <Fragment key={label}>
              <div style={{ fontSize: 11.5, color: "var(--text-secondary)", paddingTop: 8 }}>
                <div style={{ fontWeight: 700 }}>{label}</div>
                <div>{tid}</div>
              </div>
              {klasse.plan[radI]?.map((celle, dagI) => {
                const trening = celle === "Trening" || celle.startsWith("Trening /");
                const spisefri = celle === "Spisefri";
                return (
                  <div
                    key={dagI}
                    style={{
                      minWidth: 0,
                      fontSize: 11,
                      lineHeight: 1.35,
                      padding: "6px 8px",
                      borderRadius: 8,
                      background: trening ? "var(--tint-teal)" : spisefri ? "var(--neutral-50)" : "var(--neutral-50)",
                      color: trening ? "var(--wang-teal-text)" : "var(--text-secondary)",
                      fontWeight: trening ? 700 : 400,
                      overflowWrap: "anywhere",
                      whiteSpace: "normal",
                    }}
                  >
                    {celle || "–"}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </WangKort>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 16, marginTop: 16 }}>
        <WangKort>
          <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
            Skolerute 2026/27
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {SKOLERUTE.map(([maaned, tekst, uke]) => (
              <div key={tekst} style={{ display: "grid", gridTemplateColumns: "70px 1fr auto", gap: 8, fontSize: 12.5 }}>
                <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{maaned}</div>
                <div style={{ color: "var(--text-secondary)" }}>{tekst}</div>
                <div style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{uke}</div>
              </div>
            ))}
          </div>
        </WangKort>
        <WangKort>
          <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
            Foreldremøter · {klasse.trinn}
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {FORELDREMOTER[klasse.trinn].map((m) => (
              <div key={m} style={{ fontSize: 12.5, color: "var(--text-secondary)", paddingBottom: 6, borderBottom: "1px solid var(--border-subtle)" }}>
                {m}
              </div>
            ))}
          </div>
        </WangKort>
      </div>

      <div style={{ marginTop: 16, fontSize: 12.5, color: "var(--text-secondary)" }}>
        192 skoledager (84 høst, 107 vår) + oppstartsdag med overnatting for VG1.
      </div>
    </Seksjon>
  );
}

function Kompetansemaal({ trinn }: { trinn: TrinnType | "Alle trinn" }) {
  const trinnValgte: TrinnType[] = trinn === "Alle trinn" ? TRINN_ORD : [trinn];
  return (
    <Seksjon id="kompetansemaal">
      <SeksjonHode nr={2} label="Udir-mål" tittel="Kompetansemål" />
      {trinnValgte.map((t) => (
        <div key={t} style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 15, color: TRINN[t].farge, marginBottom: 10 }}>
            {t} · {TRINN[t].fag} og kroppsøving
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 16 }}>
            {[
              { info: TRINN[t], maal: KM[t] },
              { info: TRINN_KRO[t], maal: KM_KRO[t] },
            ].map((fag) => (
              <WangKort key={fag.info.fag}>
                <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 14, color: fag.info.farge }}>
                  {fag.info.fag}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginBottom: 8 }}>{fag.info.kode}</div>
                <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 10 }}>{fag.info.ingress}</p>
                <ol style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
                  {fag.maal.map((m) => (
                    <li key={m} style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                      {m}
                    </li>
                  ))}
                </ol>
              </WangKort>
            ))}
          </div>
        </div>
      ))}
    </Seksjon>
  );
}

function Prover({ trinn }: { trinn: TrinnType | "Alle trinn" }) {
  const [valgt, setValgt] = useState<TrinnType>(trinn === "Alle trinn" ? "VG1" : trinn);
  return (
    <Seksjon id="prover">
      <SeksjonHode nr={3} label="Prøveplan" tittel="Prøver og eksamen" />
      <PillGruppe valg={TRINN_ORD.map((t) => ({ label: t, aktiv: t === valgt, onVelg: () => setValgt(t) }))} />
      <WangKort style={{ marginTop: 16 }}>
        <div style={{ display: "grid", gap: 10 }}>
          {PROVER[valgt].map(([uke, tittel, detalj]) => (
            <div key={uke + tittel} style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 12, paddingBottom: 10, borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{uke}</div>
              <div>
                <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13.5 }}>{tittel}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{detalj}</div>
              </div>
            </div>
          ))}
        </div>
      </WangKort>
      <div style={{ marginTop: 12, fontSize: 12.5, color: "var(--text-secondary)" }}>
        {FORELDREMOTER[valgt].length ? valgt + " har " + moteTekst(FORELDREMOTER[valgt].length) + " i løpet av året." : null}
      </div>
    </Seksjon>
  );
}

export function FaneSkole({
  trinn,
}: {
  trinn: TrinnType | "Alle trinn";
  onTrinn: (t: TrinnType | "Alle trinn") => void;
}) {
  return (
    <div>
      <Timeplan />
      <Kompetansemaal trinn={trinn} />
      <Prover trinn={trinn} />
    </div>
  );
}
