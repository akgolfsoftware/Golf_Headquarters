"use client";

// Trening-fanen: Hero + Årshjul + Periodisering (pyramide) + Månedsplan +
// Ukeplan + Øktplaner. Fasit: designsystem/wang/fasit/arsplan-2026-27/
// WANG Arsplan 2026-27.dc.html, seksjonene #arsplan–#oktplaner.

import { useState } from "react";

import {
  AKSER,
  AKSE_ORD,
  FASER,
  MND,
  OKTER,
  OMRAADE_LABEL,
  PERIODER,
  TRINN,
  beregnPyramide,
  faseForPeriode,
  oktFormler,
  type Trinn as TrinnType,
} from "../../_data/arsplan-fasit-2026-27";
import { Chip, PillGruppe, Seksjon, SeksjonHode, Wrap, WangKort } from "./primitiver";

const MND_KORT = ["Aug", "Sep", "Okt", "Nov", "Des", "Jan", "Feb", "Mar", "Apr", "Mai", "Jun"];

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
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 20,
          right: 60,
          width: 250,
          height: 250,
          borderRadius: "50%",
          border: "1.5px solid var(--wang-mint)",
          opacity: 0.2,
          pointerEvents: "none",
        }}
      />
      <Wrap>
        <div style={{ padding: "clamp(40px,7vw,72px) 0 0", position: "relative" }}>
          <div
            style={{
              fontFamily: "var(--font-brand)",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--wang-mint)",
              marginBottom: 12,
            }}
          >
            WANG Toppidrett Fredrikstad · Toppidrett golf
          </div>
          <h1
            style={{
              fontFamily: "var(--font-brand)",
              fontWeight: 800,
              fontSize: "clamp(30px,6.5vw,52px)",
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            Årsplan 2026/27
          </h1>
          <p style={{ fontSize: "clamp(15px,2.2vw,17px)", color: "var(--text-on-dark-78)", maxWidth: 620, marginTop: 16 }}>
            Hele treningsåret samlet: årshjul, periodisering, månedsplan, den faste
            treningsuken og øktplaner med kompetansemål per trinn.
          </p>
        </div>
        <div
          style={{
            marginTop: "clamp(28px,5vw,44px)",
            padding: "18px 0",
            background: "var(--overlay-on-dark-06)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 17 }}>Gruppen</div>
            <div style={{ fontSize: 13.5, color: "var(--text-on-dark-78)", marginTop: 4 }}>
              14 elever · VG1–VG3 samlet · 16–19 år
            </div>
            <div style={{ fontSize: 13.5, color: "var(--text-on-dark-78)" }}>
              Man · ons · fre 08:00–10:00 · Gamle Fredrikstad GK
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 14, color: "var(--wang-mint)" }}>
            Sammen lykkes vi
          </div>
        </div>
      </Wrap>
    </div>
  );
}

function Arshjul() {
  const [pekM, setPekM] = useState<number | null>(null);
  const [apenP, setApenP] = useState<string>("TURN");
  const pm = pekM ?? 0;
  const fase = FASER[MND[pm][1]];
  const [navn, , tema, hendelser] = MND[pm];

  return (
    <Seksjon id="arsplan">
      <SeksjonHode nr={1} label="Årshjulet" tittel="Årsplan uke 34 → uke 24" ingress="Pek eller trykk på en måned for å se fase, tema og hendelser." />
      <WangKort>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gap: 6, alignItems: "end", height: 90 }}>
          {MND.map(([, f], i) => {
            const aktiv = pekM === i || (pekM === null && i === 0);
            return (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setPekM(i)}
                onMouseLeave={() => setPekM(null)}
                onClick={() => setPekM(i)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: 0,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: aktiv ? 40 : 30,
                    borderRadius: 6,
                    background: FASER[f].farge,
                    opacity: aktiv ? 1 : 0.42,
                    transition: "height 200ms, opacity 200ms",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-brand)",
                    fontSize: 11,
                    fontWeight: aktiv ? 800 : 600,
                    color: aktiv ? "var(--wang-navy)" : "var(--text-secondary)",
                  }}
                >
                  {MND_KORT[i]}
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 20, padding: 16, borderRadius: 14, background: fase.tint }}>
          <Chip farge={fase.tekst} tint="var(--text-on-dark-dim)">
            {fase.navn}
          </Chip>
          <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 16, marginTop: 8 }}>{navn}</div>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>{tema}</p>
          {hendelser?.length ? (
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13.5, color: "var(--text-secondary)" }}>
              {hendelser.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </WangKort>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {PERIODER.map((p) => {
          const f = FASER[faseForPeriode(p.id)];
          const apen = apenP === p.id;
          return (
            <WangKort key={p.id} style={{ padding: 0, overflow: "hidden" }}>
              <button
                type="button"
                onClick={() => setApenP(apen ? "" : p.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <Chip farge={f.tekst} tint={f.tint}>
                    {p.navn}
                  </Chip>
                  <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 15, marginTop: 6 }}>
                    {p.uker} · {p.datoer}
                  </div>
                </div>
                <span style={{ fontSize: 20, color: "var(--text-secondary)" }}>{apen ? "−" : "+"}</span>
              </button>
              {apen ? (
                <div style={{ padding: "0 20px 20px" }}>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>{p.fokus}</p>
                  <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13.5, color: "var(--text-secondary)" }}>
                    {p.nokkel.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </WangKort>
          );
        })}
      </div>
    </Seksjon>
  );
}

function Periodisering() {
  const [pyr, setPyr] = useState<"GRUNN" | "SPES" | "TURN">("GRUNN");
  const beregnet = beregnPyramide(pyr);
  const nTimer = (m: number) => (Math.round((m / 60) * 10) / 10).toString().replace(".", ",") + " t";

  return (
    <Seksjon id="periodisering">
      <SeksjonHode nr={2} label="Pyramiden" tittel="Periodisering" ingress="Fordelingen beregnes fra planlagte øvelser og egentrening — endres pyramiden i øktplanen, endres tallene her automatisk." />
      <PillGruppe
        valg={(["GRUNN", "SPES", "TURN"] as const).map((k) => ({
          label: k + " · " + FASER[k].navn,
          aktiv: k === pyr,
          onVelg: () => setPyr(k),
        }))}
      />
      <WangKort style={{ marginTop: 16 }} key={pyr}>
        <div style={{ display: "grid", gap: 14 }}>
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
      <SeksjonHode nr={3} label="Tidslinje" tittel="Månedsplan" />
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        {(["okt", "prove", "skole", "hendelse"] as const).map((t) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-secondary)" }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background:
                  t === "okt" ? "var(--wang-teal)" : t === "prove" ? "var(--cat-purple)" : t === "skole" ? "var(--cat-blue)" : "var(--cat-orange)",
              }}
            />
            {t === "okt" ? "Trening" : t === "prove" ? "Test/prøve" : t === "skole" ? "Skole/ferie" : "Konkurranse"}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gap: 0 }}>
        {MND.map(([navn, faseKey, tema], i) => {
          const f = FASER[faseKey];
          const formler = oktFormler(faseKey as "GRUNN" | "SPES" | "TURN");
          return (
            <div key={navn} style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: f.farge, marginTop: 4 }} />
                {i < MND.length - 1 ? <div style={{ flex: 1, width: 2, background: "var(--border-subtle)" }} /> : null}
              </div>
              <div style={{ paddingBottom: 24 }}>
                <Chip farge={f.tekst} tint={f.tint}>
                  {f.navn}
                </Chip>
                <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 15, marginTop: 6 }}>{navn}</div>
                <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 2 }}>{tema}</p>
                {formler.length ? (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    {formler.map((form) => (
                      <Chip key={form.id} farge="var(--text-primary)" tint="var(--neutral-50)">
                        {form.omrade}
                        {form.reps ? " · " + form.reps : ""}
                      </Chip>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Seksjon>
  );
}

function Ukeplan() {
  return (
    <Seksjon id="ukeplan">
      <SeksjonHode nr={4} label="Fast mal" tittel="Ukeplan" />
      <WangKort style={{ borderTop: "4px solid var(--wang-mint)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 15 }}>
            VG1–VG3 samlet · 3 økter/uke · 6 timer
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Skoleåret 2026/27</div>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {["Mandag", "Onsdag", "Fredag"].map((dag) => (
            <div key={dag} style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", alignItems: "baseline", minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13.5, minWidth: 72 }}>{dag}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", minWidth: 90 }}>08:00–10:00</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", flex: "1 1 220px", minWidth: 0 }}>
                Felles øktmal: oppvarming, tre øvelser etter periodens pyramide, KPI og dagbok
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: 12, borderRadius: 12, background: "var(--neutral-50)", fontSize: 12.5, color: "var(--text-secondary)" }}>
          Individuell FYS/egentrening kommer i tillegg — omfang følger periodens pyramide.
        </div>
      </WangKort>
    </Seksjon>
  );
}

function Oktplaner({ trinn }: { trinn: TrinnType | "Alle trinn" }) {
  const trinnValgte: TrinnType[] = trinn === "Alle trinn" ? ["VG1", "VG2", "VG3"] : [trinn];
  return (
    <Seksjon id="oktplaner">
      <SeksjonHode nr={5} label="Per periode" tittel="Øktplaner" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 16 }}>
        {OKTER.map((okt) => {
          const f = FASER[okt.periode];
          const mal = okt.maal.filter((_, j) => trinnValgte.includes((["VG1", "VG2", "VG3"] as const)[j]));
          return (
            <WangKort key={okt.tittel} style={{ borderTop: "4px solid " + f.farge }}>
              <Chip farge={f.tekst} tint={f.tint}>
                {f.navn}
              </Chip>
              <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 16, marginTop: 8 }}>{okt.tittel}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{okt.meta}</div>
              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 6 }}>{okt.fokus}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                {okt.blokker
                  .filter((b) => b.omraade)
                  .map((b, i) => (
                    <Chip
                      key={i}
                      farge={AKSER[AKSE_ORD.indexOf(b.akse!)]?.farge ?? "var(--text-primary)"}
                      tint="var(--neutral-50)"
                    >
                      {b.omraade ? OMRAADE_LABEL[b.omraade] : ""} · {b.reps}
                    </Chip>
                  ))}
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
                <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 12.5, marginBottom: 6 }}>
                  {trinn === "Alle trinn" ? "Mål per trinn" : "Mål for " + trinn}
                </div>
                {mal.map((m, j) => (
                  <div key={j} style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 4 }}>
                    {m.tekst} <span style={{ opacity: 0.7 }}>— {m.kilde}</span>
                  </div>
                ))}
              </div>
            </WangKort>
          );
        })}
      </div>
      <div style={{ marginTop: 16, fontSize: 12.5, color: "var(--text-secondary)" }}>
        Ny teknikk starter alltid i kropp/arm, aldri rett på ball. Minimum CS50 i balltrening.
        KPI og dagbok inngår i hver økt. Testuker overtar hele øktmalen.
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
      <div style={{ marginTop: 8 }}>
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
