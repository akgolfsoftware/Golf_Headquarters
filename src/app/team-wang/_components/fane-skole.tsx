"use client";

/**
 * Skole-fanen: Skoleår, Timeplan og Vurdering.
 *
 * Tre endringer fra før:
 *  - Skoleåret skiller ferie, fridag og milepæl med fargeprikk. Før var alt
 *    én liste med samme vekt.
 *  - Timeplanen var et 620px rutenett som måtte sidescrolles på mobil. Nå er
 *    det ett kort per dag på mobil; rutenettet finnes bare der det er plass.
 *  - Vurderingen hadde tre nivåer av trekkspill. Nå er område og mål alltid
 *    åpne, og bare kjennetegnene per kode kan foldes ut.
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  EXAM_PLAN,
  KM,
  KM_LEVEL_COLORS,
  SCHOOL,
  TIMETABLE,
  TT_DAYS,
  TT_TIMES,
  type FagKey,
  type Trinn,
} from "../_data/wang-plan";
import type { WangLiveData } from "../_data/hent-wang-gruppe";
import { grupperSkoleDager } from "@/lib/domain/wang-skolerute";
import { IconChip, Tabs, yearPillStyle } from "./primitiver";

const OMR_IKON: Record<string, string> = {
  Ferdighetstrening: "target",
  Basistrening: "dumbbell",
  Konkurransetrening: "trophy",
  "Idrett- og bevegelsesaktivitet": "activity",
  "Helsefremmende livsstil": "heart-pulse",
};

type SkoleSub = "Skoleår" | "Timeplan" | "Vurdering";

export function FaneSkole({ live = null }: { live?: WangLiveData | null }) {
  const [sub, setSub] = useState<SkoleSub>("Skoleår");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-brand)",
            fontWeight: 700,
            fontSize: 24,
            color: "var(--text-primary)",
          }}
        >
          Skole
        </h1>
        <Tabs
          options={["Skoleår", "Timeplan", "Vurdering"]}
          value={sub}
          onChange={(v) => setSub(v as SkoleSub)}
        />
      </div>
      {sub === "Skoleår" ? (
        <Skoleaar live={live} />
      ) : sub === "Timeplan" ? (
        <Timeplan />
      ) : (
        <Vurdering />
      )}
    </div>
  );
}

// ---- Skoleår -----------------------------------------------------------

const MND_KORT = [
  "jan",
  "feb",
  "mar",
  "apr",
  "mai",
  "jun",
  "jul",
  "aug",
  "sep",
  "okt",
  "nov",
  "des",
];

/** Fargeprikk per type — det som skiller ferie fra fridag fra milepæl. */
const SKOLE_FARGE: Record<string, string> = {
  Ferie: "var(--neutral-300)",
  Elevfri: "var(--cat-yellow)",
  Fridag: "var(--cat-yellow)",
  Oppstart: "var(--wang-mint)",
  Avslutning: "var(--wang-mint)",
};

function kortDato(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}. ${MND_KORT[m - 1]} ${y}`;
}
function Skoleaar({ live }: { live: WangLiveData | null }) {
  const synket = !!live && live.skoleDager.length > 0;
  // Grupperingen gir spenn i ISO; visningsdatoen formateres her.
  const liste: { iso: string; dato: string; name: string; type: string }[] =
    synket
      ? grupperSkoleDager(live!.skoleDager).map((g) => ({
          iso: g.iso,
          dato:
            g.startIso === g.sluttIso
              ? kortDato(g.startIso)
              : `${kortDato(g.startIso)} – ${kortDato(g.sluttIso)}`,
          name: g.name,
          type: g.type,
        }))
      : SCHOOL;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
        gap: 22,
        alignItems: "start",
      }}
    >
      <section className="wang-card" style={{ padding: "16px 18px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 4,
          }}
        >
          <span className="t-label" style={{ color: "var(--text-secondary)" }}>
            Skoleruta 2026–2027
          </span>
          {synket ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                height: 24,
                padding: "0 11px",
                borderRadius: 999,
                background: "var(--tint-teal)",
                color: "var(--wang-teal-text)",
                fontFamily: "var(--font-brand)",
                fontWeight: 700,
                fontSize: 11,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: "var(--wang-mint)",
                }}
              />
              Synket fra AgencyOS
            </span>
          ) : null}
        </div>
        {liste.map((s, i) => (
          <div
            key={s.iso + s.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              minHeight: 44,
              padding: "9px 0",
              borderBottom:
                i === liste.length - 1
                  ? "none"
                  : "1px solid var(--border-subtle)",
              minWidth: 0,
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 999,
                flex: "none",
                background: SKOLE_FARGE[s.type] ?? "var(--neutral-300)",
              }}
            />
            <span style={{ flex: 1, minWidth: 0 }}>
              <b
                style={{
                  display: "block",
                  fontFamily: "var(--font-brand)",
                  fontWeight: 700,
                  fontSize: 13.5,
                  color: "var(--text-primary)",
                }}
              >
                {s.name}
              </b>
              <span
                className="wang-num"
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  marginTop: 1,
                }}
              >
                {s.dato}
              </span>
            </span>
            <span
              style={{
                flex: "none",
                fontFamily: "var(--font-brand)",
                fontWeight: 700,
                fontSize: 11,
                color: "var(--text-secondary)",
              }}
            >
              {s.type}
            </span>
          </div>
        ))}
      </section>

      <section className="wang-card" style={{ padding: "16px 18px" }}>
        <span
          className="t-label"
          style={{
            display: "block",
            color: "var(--text-secondary)",
            marginBottom: 4,
          }}
        >
          Prøveplan
        </span>
        {EXAM_PLAN.map((e, i) => (
          <div
            key={e.iso + e.fag}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              minHeight: 44,
              padding: "9px 0",
              borderBottom:
                i === EXAM_PLAN.length - 1
                  ? "none"
                  : "1px solid var(--border-subtle)",
              minWidth: 0,
            }}
          >
            <span style={{ flex: 1, minWidth: 0 }}>
              <b
                style={{
                  display: "block",
                  fontFamily: "var(--font-brand)",
                  fontWeight: 700,
                  fontSize: 13.5,
                  color: "var(--text-primary)",
                }}
              >
                {e.fag}
              </b>
              <span
                className="wang-num"
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  marginTop: 1,
                }}
              >
                {e.type} · {e.dato}
              </span>
            </span>
            {/* Trinnmerket er en chip så eleven kan skanne etter sitt eget. */}
            <span
              className="wang-num"
              style={{
                flex: "none",
                display: "inline-flex",
                alignItems: "center",
                height: 24,
                padding: "0 10px",
                borderRadius: 999,
                background: "var(--tint-navy)",
                color: "var(--wang-navy)",
                fontFamily: "var(--font-brand)",
                fontWeight: 700,
                fontSize: 11,
              }}
            >
              {e.klasse}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}

// ---- Timeplan ----------------------------------------------------------

function Timeplan() {
  const [klasse, setKlasse] = useState<Trinn>("VG1");
  const rader = TIMETABLE[klasse];

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(["VG1", "VG2", "VG3"] as Trinn[]).map((n) => (
          <button
            key={n}
            onClick={() => setKlasse(n)}
            className="wang-pressable"
            style={yearPillStyle(klasse === n)}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Mobil: ett kort per dag, loddrett timeliste. Ingen sidescroll.
          Ytre div har bevisst INGEN inline display — .wang-vis-mobil skjuler
          med `display: none` uten !important, og en inline display ville
          overstyrt den og lekket visningen inn på desktop. */}
      <div className="wang-vis-mobil">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {TT_DAYS.map((dag, dagIdx) => (
            <div
              key={dag}
              className="wang-card"
              style={{ padding: "12px 14px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  paddingBottom: 6,
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <span
                  className="t-label"
                  style={{ color: "var(--text-primary)", fontWeight: 800 }}
                >
                  {dag}
                </span>
              </div>
              {TT_TIMES.map((tid, tidIdx) => {
                const celle = rader[tidIdx][dagIdx];
                return (
                  <div
                    key={tid}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      minHeight: 44,
                      padding: "7px 0",
                      minWidth: 0,
                    }}
                  >
                    <span
                      className="wang-num"
                      style={{
                        width: 96,
                        flex: "none",
                        fontSize: 12,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {tid}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontFamily: "var(--font-brand)",
                        fontWeight: celle.g ? 700 : 500,
                        fontSize: 13,
                        color: celle.g
                          ? "var(--wang-teal-text)"
                          : "var(--text-primary)",
                      }}
                    >
                      {celle.t}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: rutenettet, der det er plass til det. */}
      <div className="wang-vis-desktop wang-card" style={{ padding: 18 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `110px repeat(${TT_DAYS.length},minmax(0,1fr))`,
            gap: 6,
            marginBottom: 6,
          }}
        >
          <span />
          {TT_DAYS.map((d) => (
            <span
              key={d}
              className="t-label"
              style={{ color: "var(--text-secondary)", textAlign: "center" }}
            >
              {d}
            </span>
          ))}
        </div>
        {TT_TIMES.map((tid, i) => (
          <div
            key={tid}
            style={{
              display: "grid",
              gridTemplateColumns: `110px repeat(${TT_DAYS.length},minmax(0,1fr))`,
              gap: 6,
              marginBottom: 6,
            }}
          >
            <span
              className="wang-num"
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              {tid}
            </span>
            {rader[i].map((c, ci) => (
              <span
                key={ci}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  minHeight: 52,
                  padding: "6px 8px",
                  borderRadius: 12,
                  boxSizing: "border-box",
                  fontSize: 12.5,
                  lineHeight: 1.25,
                  minWidth: 0,
                  background: c.g ? "var(--tint-teal)" : "var(--neutral-50)",
                  color: c.g ? "var(--wang-teal-text)" : "var(--text-primary)",
                  fontWeight: c.g ? 700 : 500,
                }}
              >
                {c.t}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

// ---- Vurdering ---------------------------------------------------------

function Vurdering() {
  const [fag, setFag] = useState<FagKey>("top");
  const [nivaa, setNivaa] = useState<Trinn>("VG1");
  const [kodeApen, setKodeApen] = useState<string | null>(null);

  const L = KM[fag].levels[nivaa];

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {(Object.keys(KM) as FagKey[]).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFag(f);
              setKodeApen(null);
            }}
            className="wang-pressable"
            style={navPill(fag === f)}
          >
            {KM[f].label}
          </button>
        ))}
        <span
          style={{ width: 1, height: 24, background: "var(--border-subtle)" }}
        />
        {(["VG1", "VG2", "VG3"] as Trinn[]).map((n) => (
          <button
            key={n}
            onClick={() => {
              setNivaa(n);
              setKodeApen(null);
            }}
            className="wang-pressable"
            style={yearPillStyle(nivaa === n)}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Skalaen forklares ÉN gang her, ikke per rad. */}
      <div className="wang-card" style={{ padding: "14px 16px" }}>
        <b
          style={{
            display: "block",
            fontFamily: "var(--font-brand)",
            fontWeight: 800,
            fontSize: 17,
            color: "var(--text-primary)",
          }}
        >
          {L.fagnavn}
        </b>
        <span
          style={{
            display: "block",
            fontSize: 12.5,
            color: "var(--text-secondary)",
            marginTop: 2,
          }}
        >
          {nivaa} · fra WANGs vurderingsdokument
          {L.laerer ? ` · lærer ${L.laerer}` : ""}
        </span>
        <div
          style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}
        >
          {L.skala.map((lab, i) => (
            <span
              key={lab}
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 26,
                padding: "0 12px",
                borderRadius: 999,
                background: KM_LEVEL_COLORS[i][0],
                color: KM_LEVEL_COLORS[i][1],
                fontFamily: "var(--font-brand)",
                fontWeight: 700,
                fontSize: 11.5,
                whiteSpace: "nowrap",
              }}
            >
              {lab}
            </span>
          ))}
        </div>
      </div>

      {/* Målområdene er ALLTID åpne — ingen trekkspill her lenger. */}
      {L.omraader.map((o) => {
        const nKod = o.delmaal.reduce((a, dm) => a + dm.koder.length, 0);
        return (
          <div
            key={o.navn}
            className="wang-card"
            style={{ padding: "14px 16px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                minWidth: 0,
              }}
            >
              <IconChip
                icon={OMR_IKON[o.navn] ?? "target"}
                color="navy"
                size={38}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--font-brand)",
                    fontWeight: 700,
                    fontSize: 14.5,
                    color: "var(--text-primary)",
                  }}
                >
                  {o.navn}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    marginTop: 1,
                  }}
                >
                  {o.delmaal.length} kompetansemål · {nKod} delkompetanser
                </div>
              </div>
              {/* Måloppnåelse per område kommer fra faglærer. Vi har den ikke i
                  basen, og en oppdiktet karakter er verre enn ingen. */}
              <span
                style={{
                  flex: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  height: 24,
                  padding: "0 11px",
                  borderRadius: 999,
                  background: "var(--neutral-100)",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-brand)",
                  fontWeight: 700,
                  fontSize: 11,
                  whiteSpace: "nowrap",
                }}
              >
                Ikke vurdert
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 12,
              }}
            >
              {o.delmaal.map((dm, di) => (
                <div
                  key={di}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "var(--neutral-50)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-brand)",
                      fontWeight: 700,
                      fontSize: 12.5,
                      color: "var(--wang-navy)",
                    }}
                  >
                    {dm.t}
                  </div>
                  {/* Kompetansemålteksten står ordrett. Ingen omskriving. */}
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {dm.mal}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Eneste trekkspill som står igjen: kjennetegn per kompetansekode. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="t-label" style={{ color: "var(--text-secondary)" }}>
          Kjennetegn på måloppnåelse
        </div>
        {Object.keys(L.koder).map((k) => {
          const v = L.koder[k];
          const apen = kodeApen === k;
          return (
            <div
              key={k}
              style={{
                borderRadius: 14,
                border: "1px solid var(--border-subtle)",
                overflow: "hidden",
                background: "var(--surface-card)",
              }}
            >
              <button
                onClick={() => setKodeApen(apen ? null : k)}
                className="wang-pressable"
                aria-expanded={apen}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  minHeight: 44,
                  padding: "12px 14px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  className="wang-num"
                  style={{
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 34,
                    height: 24,
                    padding: "0 8px",
                    borderRadius: 8,
                    background: "var(--tint-navy)",
                    color: "var(--wang-navy)",
                    fontFamily: "var(--font-brand)",
                    fontWeight: 800,
                    fontSize: 11,
                  }}
                >
                  {k}
                </span>
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 13,
                    lineHeight: 1.45,
                    color: "var(--text-primary)",
                  }}
                >
                  {v[0]}
                </span>
                <ChevronDown
                  size={18}
                  strokeWidth={2}
                  aria-hidden
                  style={{
                    flexShrink: 0,
                    color: "var(--text-secondary)",
                    transition: "transform var(--dur) ease",
                    transform: apen ? "rotate(180deg)" : undefined,
                  }}
                />
              </button>
              {apen ? (
                <div
                  style={{
                    padding: "0 14px 14px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                    gap: 10,
                  }}
                >
                  {L.skala.map((lab, i) => {
                    const txt = v[i + 1];
                    return (
                      <div
                        key={lab}
                        style={{
                          borderRadius: 12,
                          padding: "12px 14px",
                          background: txt
                            ? KM_LEVEL_COLORS[i][0]
                            : "var(--neutral-50)",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "var(--font-brand)",
                            fontWeight: 700,
                            fontSize: 11,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            color: txt
                              ? KM_LEVEL_COLORS[i][1]
                              : "var(--text-secondary)",
                          }}
                        >
                          {lab.split(" · ")[0]}
                        </div>
                        <p
                          style={{
                            margin: "6px 0 0",
                            fontSize: 12.5,
                            lineHeight: 1.5,
                            color: txt
                              ? "var(--text-primary)"
                              : "var(--text-secondary)",
                            fontStyle: txt ? "normal" : "italic",
                          }}
                        >
                          {txt ||
                            "Kjennetegn ikke fastsatt i kildedokumentet ennå."}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function navPill(active: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    height: 40,
    padding: "0 16px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "var(--font-brand)",
    fontWeight: 600,
    fontSize: 13,
    background: active ? "var(--wang-navy)" : "var(--neutral-50)",
    color: active ? "var(--white)" : "var(--text-secondary)",
  };
}
