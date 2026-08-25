"use client";

// Foreldre-fanen: Ukessammendrag + Foreldremøter + Praktisk. Fasit:
// designsystem/wang/fasit/arsplan-2026-27/WANG Arsplan 2026-27.dc.html,
// seksjon #ukessammendrag/#foreldremoter/#praktisk.
//
// Anders' beslutning 25.08.2026: siden bygges 1:1 etter fasiten — ingen
// RSVP-knapp, ingen chat (fantes i den forrige, nå erstattede designen).

import { useState, useSyncExternalStore } from "react";

import { FORELDREMOTER, SKOLERUTE, TRINN, TRINN_ORD, UKESRAPPORTER, moteTekst, nesteFredagTekst } from "../../_data/arsplan-fasit-2026-27";
import { SPAN_START_ISO } from "../../_data/wang-plan";
import { Seksjon, SeksjonHode, WangKort } from "./primitiver";

function osloIdagIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date());
}
const tomAbonnement = () => () => {};
let naaCache: string | null = null;
function klientNaa(): string {
  naaCache ??= osloIdagIso();
  return naaCache;
}

function Ukessammendrag() {
  const [apen, setApen] = useState<number | null>(null);
  // Hydreringstrygt: server viser sesongstart, klient bytter til ekte Oslo-dato
  // rett etter mount (jf. samme mønster i wang-fellesside.tsx).
  const naaIso = useSyncExternalStore(tomAbonnement, klientNaa, () => SPAN_START_ISO);

  const siste = UKESRAPPORTER[0];
  const tidligere = UKESRAPPORTER.slice(1);

  return (
    <Seksjon id="ukessammendrag">
      <SeksjonHode nr={1} label="Hver fredag" tittel="Ukessammendrag" ingress="Publiseres av treneren senest kl. 16 hver fredag." />
      {!siste ? (
        <WangKort style={{ background: "var(--tint-teal)", boxShadow: "none" }}>
          <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 15, color: "var(--wang-teal-text)" }}>
            Første sammendrag kommer fredag {nesteFredagTekst(naaIso)}
          </div>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 6 }}>
            Trener publiserer en kort oppsummering av uken — hva som ble gjennomført, ett
            høydepunkt og hva som skjer neste uke.
          </p>
        </WangKort>
      ) : (
        <>
          <div
            style={{
              borderRadius: 26,
              padding: "clamp(22px,3.4vw,32px)",
              color: "var(--white)",
              background:
                "linear-gradient(160deg, color-mix(in srgb, var(--wang-navy) 82%, white) 0%, var(--wang-navy) 55%, color-mix(in srgb, var(--wang-navy) 82%, black) 100%)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--wang-mint)" }}>
                Uke {siste.uke} · {siste.datoer}
              </span>
              <span style={{ fontSize: 12.5, color: "var(--text-on-dark-78)" }}>{siste.periode}</span>
            </div>
            <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: "clamp(18px,2.8vw,24px)", marginTop: 10 }}>
              {siste.maalsetning}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {siste.fokus.map((f) => (
                <span key={f} style={{ background: "var(--overlay-on-dark-12)", borderRadius: 999, padding: "5px 12px", fontSize: 12.5 }}>
                  {f}
                </span>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginTop: 20 }}>
              <div>
                <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Gjennomført</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--text-on-dark-85)" }}>
                  {siste.gjennomfort.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Høydepunkt</div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-on-dark-85)" }}>{siste.hoydepunkt}</p>
                <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13, marginTop: 10, marginBottom: 6 }}>Neste uke</div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-on-dark-85)" }}>{siste.neste}</p>
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 12.5, color: "var(--wang-mint)", marginTop: 16 }}>
              {siste.trener}
            </div>
          </div>

          {tidligere.length ? (
            <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
              {tidligere.map((r, i) => {
                const rApen = apen === i;
                return (
                  <WangKort key={r.uke} style={{ padding: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", gap: 12 }}>
                      <div>
                        <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13.5 }}>Uke {r.uke}</div>
                        <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{r.maalsetning}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setApen(rApen ? null : i)}
                        style={{
                          minHeight: 40,
                          padding: "0 16px",
                          borderRadius: 999,
                          border: "1.5px solid var(--border-subtle)",
                          background: "transparent",
                          fontFamily: "var(--font-brand)",
                          fontWeight: 700,
                          fontSize: 12.5,
                          cursor: "pointer",
                        }}
                      >
                        {rApen ? "Skjul" : "Les"}
                      </button>
                    </div>
                    {rApen ? (
                      <div style={{ padding: "0 18px 16px" }}>
                        <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{r.gjennomfort.join(" · ")}</div>
                        <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 6 }}>Neste: {r.neste}</div>
                      </div>
                    ) : null}
                  </WangKort>
                );
              })}
            </div>
          ) : null}
        </>
      )}
    </Seksjon>
  );
}

function Foreldremoter() {
  return (
    <Seksjon id="foreldremoter">
      <SeksjonHode nr={2} label="Kl. 17:00" tittel="Foreldremøter" ingress="Alle møter på WANG Toppidrett Fredrikstad." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        {TRINN_ORD.map((t) => (
          <WangKort key={t} style={{ height: "100%", display: "flex", flexDirection: "column", borderTop: "3px solid " + TRINN[t].farge }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 17, color: TRINN[t].farge }}>{t}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{moteTekst(FORELDREMOTER[t].length)}</div>
            </div>
            <div style={{ display: "grid", marginTop: 10, flex: 1 }}>
              {FORELDREMOTER[t].map((m) => (
                <div key={m} style={{ fontSize: 13, color: "var(--text-secondary)", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  {m}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: "auto", paddingTop: 10 }}>
              {TRINN[t].fag}
            </div>
          </WangKort>
        ))}
      </div>
    </Seksjon>
  );
}

const PRAKTISK_KORT = [
  { tittel: "Treningstider", tekst: "Mandag, onsdag og fredag 08:00–10:00, hele skoleåret." },
  { tittel: "Sted", tekst: "Gamle Fredrikstad GK (utesesong) og Treningslokalet (uke 44–13)." },
  { tittel: "Kontakt", tekst: "Anders Kristiansen, sportssjef og trener golf." },
  { tittel: "Turneringer", tekst: "Følger terminlisten — se kalenderen for oppdaterte datoer." },
  { tittel: "Fravær og sykdom", tekst: "Meldes til trener så tidlig som mulig før økten." },
  { tittel: "Utstyr", tekst: "Eget sett og treningsklær tilpasset vær — regntøy ved utetrening." },
];

function Praktisk() {
  return (
    <Seksjon id="praktisk">
      <SeksjonHode nr={3} label="God å ha" tittel="Praktisk" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
        {PRAKTISK_KORT.map((k) => (
          <WangKort key={k.tittel}>
            <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 14 }}>{k.tittel}</div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6 }}>{k.tekst}</p>
          </WangKort>
        ))}
      </div>
      <WangKort style={{ marginTop: 16 }}>
        <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
          Fri, ferie og planleggingsdager
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 8 }}>
          {SKOLERUTE.map(([maaned, tekst, uke]) => (
            <div key={tekst} style={{ background: "var(--neutral-50)", borderRadius: 10, padding: 10, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)" }}>
                {maaned} · {uke}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-primary)", marginTop: 2, overflowWrap: "anywhere" }}>{tekst}</div>
            </div>
          ))}
        </div>
      </WangKort>
    </Seksjon>
  );
}

export function FaneForeldreArsplan() {
  return (
    <div>
      <Ukessammendrag />
      <Foreldremoter />
      <Praktisk />
    </div>
  );
}
