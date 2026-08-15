"use client";
import { T } from "@/lib/v2/tokens";

/**
 * Øktdetalj — én treningsøkt.
 *
 * Før var dette én lang loddrett stabel med lukkede trekkspill, og volumtallene
 * lå bak et klikk. På desktop ble det én smal kolonne midt på en tom skjerm.
 *
 * Nå: volumet står synlig på hver øvelse, desktop bruker to kolonner (hoveddel
 * til venstre, måling og kompetansemål til høyre), drill-nummeret bærer
 * periodefargen, og forrige/neste ligger nederst på mobil der tommelen er.
 */

import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

import { PERIOD_COL, type Okt } from "../_data/wang-plan";
import type { PeriodeFokus } from "../_data/fokusomraader";
import { AkChip, IconChip } from "./primitiver";
import { AkseChip, MaalStatusChip, formaterEgentid } from "./ak-primitiver";

export function OktDetalj({
  okt,
  naaIso,
  onBack,
  onPrev,
  onNext,
  forrigeLabel,
  nesteLabel,
  fokus = null,
}: {
  okt: Okt;
  naaIso: string;
  onBack: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  forrigeLabel?: string;
  nesteLabel?: string;
  /** Elevens fokusområder for perioden økta ligger i. */
  fokus?: PeriodeFokus | null;
}) {
  const [visAk, setVisAk] = useState(false);

  const erGjennomfort = okt.iso < naaIso;
  const erIDag = okt.iso === naaIso;
  const periodeFarge = PERIOD_COL[okt.periodKey] ?? "var(--wang-navy)";

  const navigasjon =
    onPrev || onNext ? (
      <div style={{ display: "inline-flex", gap: 8 }}>
        <NavKnapp
          label={forrigeLabel ? `Forrige: ${forrigeLabel}` : "Forrige økt"}
          onClick={onPrev}
          retning="forrige"
        />
        <NavKnapp
          label={nesteLabel ? `Neste: ${nesteLabel}` : "Neste økt"}
          onClick={onNext}
          retning="neste"
        />
      </div>
    ) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={onBack}
          className="wang-pressable"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            minHeight: 44,
            padding: "0 16px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            background: "var(--surface-card)",
            boxShadow: "var(--shadow-card-sm)",
            fontFamily: "var(--font-brand)",
            fontWeight: 600,
            fontSize: 13,
            color: "var(--text-primary)",
          }}
        >
          <ArrowLeft size={16} strokeWidth={2.2} aria-hidden /> Tilbake
        </button>

        {/* På desktop står navigasjonen øverst; på mobil gjentas den nederst. */}
        <span className="wang-skjul-mobil">{navigasjon}</span>
      </div>

      <section
        style={{
          background: "var(--grad-hero-line)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-hero)",
          padding: "clamp(22px,4vw,30px)",
          color: "var(--text-on-dark)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          <span className="t-label" style={{ color: "var(--wang-mint)" }}>
            {okt.longDate} · {okt.timeLabel}
          </span>
          {erGjennomfort ? (
            <StatusBadge farge="mint">Gjennomført</StatusBadge>
          ) : erIDag ? (
            <StatusBadge farge="hvit">I dag</StatusBadge>
          ) : (
            <StatusBadge farge="dempet">Kommende økt</StatusBadge>
          )}
        </div>
        <h1
          style={{
            margin: "0 0 12px",
            fontFamily: "var(--font-brand)",
            fontWeight: 800,
            fontSize: "clamp(22px,4vw,30px)",
            lineHeight: 1.15,
          }}
        >
          {okt.title}
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            lineHeight: 1.55,
            color: T.farge.hvitA90,
            maxWidth: 660,
          }}
        >
          {okt.goal}
        </p>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}
        >
          <Pill>{okt.typeLabel}</Pill>
          <Pill>{okt.locName}</Pill>
          <Pill>{okt.periodName}</Pill>
        </div>
      </section>

      {/* To kolonner på desktop, én på mobil. */}
      <div className="wang-okt-kolonner" style={{ display: "grid", gap: 18 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            minWidth: 0,
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
              <span
                className="t-label"
                style={{ color: "var(--text-secondary)" }}
              >
                Hoveddel · {okt.drills.length} øvelser
              </span>
              {okt.drills.some((d) => d.chips.length > 0) ? (
                <button
                  onClick={() => setVisAk((v) => !v)}
                  className="wang-pressable"
                  aria-pressed={visAk}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontFamily: "var(--font-brand)",
                    fontWeight: 700,
                    fontSize: 12,
                    color: "var(--wang-teal-text)",
                  }}
                >
                  {visAk ? "Skjul AK-detaljer" : "Vis AK-detaljer"}
                </button>
              ) : null}
            </div>

            {okt.drills.map((dr, i) => (
              <div
                key={dr.num}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom:
                    i === okt.drills.length - 1
                      ? "none"
                      : "1px solid var(--border-subtle)",
                  minWidth: 0,
                }}
              >
                {/* Nummeret bærer periodefargen, så økta kjennes igjen fra kalenderen. */}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    borderRadius: 10,
                    flex: "none",
                    background: periodeFarge,
                    color: "var(--text-on-dark)",
                    fontFamily: "var(--font-brand)",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {dr.num}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 13.5,
                      lineHeight: 1.45,
                      color: "var(--text-primary)",
                    }}
                  >
                    {dr.name}
                  </span>
                  {/* Volumet står synlig, ikke bak et trekkspill. */}
                  {dr.hasVol ? (
                    <span
                      className="wang-num"
                      style={{
                        display: "block",
                        marginTop: 4,
                        fontFamily: "var(--font-brand)",
                        fontWeight: 700,
                        fontSize: 11.5,
                        color: dr.fg,
                      }}
                    >
                      {dr.volLabel}: {dr.volValue}
                    </span>
                  ) : null}
                  {visAk && dr.chips.length > 0 ? (
                    <span
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        marginTop: 8,
                      }}
                    >
                      {dr.chips.map((c) => (
                        <AkChip
                          key={c.label}
                          label={c.label}
                          value={c.value}
                          tip={c.tip}
                          color={c.color}
                        />
                      ))}
                    </span>
                  ) : null}
                </span>
              </div>
            ))}
          </section>

          <Blokk tittel="Oppvarming">{okt.warmup}</Blokk>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            minWidth: 0,
          }}
        >
          {/* Koblingen til det andre sporet i årsplanen. */}
          {fokus && fokus.omraader.length > 0 ? (
            <section className="wang-card" style={{ padding: "16px 18px" }}>
              <span
                className="t-label"
                style={{
                  display: "block",
                  color: "var(--text-secondary)",
                  marginBottom: 4,
                }}
              >
                Fra din utviklingsplan
              </span>
              {fokus.omraader.map((f, i) => (
                <div
                  key={f.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "10px 0",
                    borderBottom:
                      i === fokus.omraader.length - 1
                        ? "none"
                        : "1px solid var(--border-subtle)",
                    minWidth: 0,
                  }}
                >
                  <AkseChip akse={f.akse} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        display: "block",
                        fontFamily: "var(--font-brand)",
                        fontWeight: 700,
                        fontSize: 13,
                        color: "var(--text-primary)",
                        lineHeight: 1.4,
                      }}
                    >
                      {f.tittel}
                    </span>
                    <span
                      className="wang-num"
                      style={{
                        display: "block",
                        marginTop: 2,
                        fontSize: 11.5,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {formaterEgentid(f.egentidMinUke)} egentrening i uka, i
                      tillegg til fellesøktene
                    </span>
                  </span>
                  <MaalStatusChip status={f.status} />
                </div>
              ))}
            </section>
          ) : null}

          <Blokk tittel="Test og måling">{okt.test}</Blokk>
          <Blokk tittel="Evaluering">{okt.eval}</Blokk>

          <section
            className="wang-card"
            style={{
              padding: "16px 18px",
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
            }}
          >
            <IconChip icon={okt.chipIcon} color={okt.chipColor} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="t-label"
                style={{ color: "var(--text-secondary)" }}
              >
                Kompetansemål per trinn
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                {(["VG1", "VG2", "VG3"] as const).map((vg) => (
                  <div
                    key={vg}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "baseline",
                      minWidth: 0,
                    }}
                  >
                    <b
                      style={{
                        flex: "none",
                        fontFamily: "var(--font-brand)",
                        fontWeight: 800,
                        fontSize: 11.5,
                        color: "var(--wang-navy)",
                      }}
                    >
                      {vg}
                    </b>
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {okt.comp[vg]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Mobil: navigasjonen nederst, der tommelen er. */}
      {navigasjon ? (
        <div className="wang-vis-mobil">
          <div style={{ display: "flex", justifyContent: "center" }}>
            {navigasjon}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ---- Deler -------------------------------------------------------------

function Blokk({
  tittel,
  children,
}: {
  tittel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="wang-card" style={{ padding: "16px 18px" }}>
      <span
        className="t-label"
        style={{
          display: "block",
          color: "var(--text-secondary)",
          marginBottom: 6,
        }}
      >
        {tittel}
      </span>
      <p
        style={{
          margin: 0,
          fontSize: 14,
          lineHeight: 1.55,
          color: "var(--text-secondary)",
        }}
      >
        {children}
      </p>
    </section>
  );
}

function StatusBadge({
  farge,
  children,
}: {
  farge: "mint" | "hvit" | "dempet";
  children: React.ReactNode;
}) {
  const bak =
    farge === "mint"
      ? "var(--wang-mint)"
      : farge === "hvit"
        ? "var(--white)"
        : T.farge.hvitA14;
  const tekst = farge === "dempet" ? "var(--text-on-dark)" : "var(--wang-navy)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 24,
        padding: "0 11px",
        borderRadius: 999,
        background: bak,
        color: tekst,
        fontFamily: "var(--font-brand)",
        fontWeight: 800,
        fontSize: 11,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 28,
        padding: "0 13px",
        borderRadius: 999,
        background: T.farge.hvitA14,
        color: "var(--text-on-dark)",
        fontFamily: "var(--font-brand)",
        fontWeight: 700,
        fontSize: 12,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function NavKnapp({
  label,
  onClick,
  retning,
}: {
  label: string;
  onClick?: () => void;
  retning: "forrige" | "neste";
}) {
  const av = !onClick;
  return (
    <button
      onClick={onClick}
      disabled={av}
      aria-label={label}
      className={av ? undefined : "wang-pressable"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minHeight: 44,
        padding: "0 14px",
        borderRadius: 999,
        border: "none",
        cursor: av ? "default" : "pointer",
        opacity: av ? 0.4 : 1,
        background: "var(--surface-card)",
        boxShadow: "var(--shadow-card-sm)",
        fontFamily: "var(--font-brand)",
        fontWeight: 600,
        fontSize: 12.5,
        color: "var(--text-primary)",
        maxWidth: 200,
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      {retning === "forrige" ? (
        <>
          <ChevronLeft size={15} strokeWidth={2.2} aria-hidden /> Forrige
        </>
      ) : (
        <>
          Neste <ChevronRight size={15} strokeWidth={2.2} aria-hidden />
        </>
      )}
    </button>
  );
}
