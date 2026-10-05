"use client";

/**
 * PH-13 Øvelsesbank — Precision Athletics.
 * Kilde: Claude Design ui_kits/playerhq/screens/PH-13.jsx
 *
 * Full responsiv øvelsesbank med AK-formelvisning, søk, aksefilter,
 * Caddie-utkast, Putting Break-tabell og detaljpanel.
 */

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import {
  AkseMerke,
  FeilTilstand,
  Ikon,
  LasterTilstand,
  Meta,
  Sidehode,
  StatusPille,
  TomTilstand,
} from "@/components/precision/pa";
import {
  beregnBreakCm,
  filtrerDrills,
  PH13_AKSER,
  type PH13Drill,
} from "@/lib/portal-drills/ph13-drills-data";
import { PH13DrillDetalj } from "./PH13DrillDetalj";
import { usePaToast } from "@/components/precision/pa-toast";

export type PH13DrillBankProps = {
  initialDrills: PH13Drill[];
  initialDrafts?: PH13Drill[];
  state?: "data" | "tom" | "laster" | "feil";
  onRetry?: () => void;
};

const BREAK_FOT = [3, 5, 10, 15, 20, 25];
const BREAK_SLOPES = [1, 2, 3, 4];

export function PH13DrillBank({
  initialDrills,
  initialDrafts = [],
  state = initialDrills.length === 0 ? "tom" : "data",
  onRetry,
}: PH13DrillBankProps) {
  const [bank, setBank] = useState<PH13Drill[]>(initialDrills);
  const [drafts, setDrafts] = useState<PH13Drill[]>(initialDrafts);
  const [q, setQ] = useState("");
  const [ax, setAx] = useState<string>("alle");
  const [src, setSrc] = useState<string>("Alle");
  const [sel, setSel] = useState<string | null>(initialDrills[0]?.id ?? null);
  const [visMobilModal, setVisMobilModal] = useState(false);
  const [stimp, setStimp] = useState<"8" | "10" | "12">("10");
  const paToast = usePaToast();

  function visToast(tittel: string, tekst?: string) {
    paToast.vis(tittel, tekst);
  }

  function handleAcceptDraft(c: PH13Drill) {
    setDrafts((prev) => prev.filter((x) => x.id !== c.id));
    const accepted: PH13Drill = {
      ...c,
      draft: false,
      src: "mine",
      bruktTekst: "ny for deg",
    };
    setBank((prev) => [accepted, ...prev]);
    visToast("Lagt i øvelsesbanken", "MERKET SOM DIN · ANDERS SER DEN");
  }

  function handleDiscardDraft(c: PH13Drill) {
    setDrafts((prev) => prev.filter((x) => x.id !== c.id));
    if (sel === c.id) {
      setSel(null);
      setVisMobilModal(false);
    }
    visToast("Utkastet er forkastet", "CADDIE FORESLÅR IKKE DENNE IGJEN");
  }

  function handleAddToSession(drill: PH13Drill) {
    visToast("Lagt til i økt", `${drill.name.toUpperCase()} · WORKBENCH`);
  }

  // Filtrering
  const alleKildeDrills = bank.filter(
    (o) =>
      src === "Alle" ||
      (src === "Fra coach" ? o.src === "coach" : o.src === "mine")
  );

  const hits = filtrerDrills(bank, src, ax, q);

  // Nåværende valgte øvelse (fra bank eller drafts)
  const currentDrill =
    [...bank, ...drafts].find((o) => o.id === sel) ?? bank[0] ?? null;

  // Akse-tellere
  const akseValg = [
    { value: "alle", label: "Alle", count: alleKildeDrills.length },
    ...PH13_AKSER.map((a) => ({
      value: a,
      label: a.toUpperCase(),
      count: alleKildeDrills.filter((o) => o.axis === a).length,
    })),
  ];

  if (state === "laster") {
    return (
      <div
        className="pa-side"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          maxWidth: 1320,
          margin: "0 auto",
        }}
      >
        <Sidehode
          kicker="Plan · Øvelsesbank"
          title="Øvelsesbank"
          sub="Alle øvelser er navngitt etter AK-formelen."
        />
        <LasterTilstand text="Henter øvelsesbanken …" />
      </div>
    );
  }

  if (state === "feil") {
    return (
      <div
        className="pa-side"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          maxWidth: 1320,
          margin: "0 auto",
        }}
      >
        <Sidehode
          kicker="Plan · Øvelsesbank"
          title="Øvelsesbank"
          sub="Alle øvelser er navngitt etter AK-formelen."
        />
        <FeilTilstand
          icon={RotateCcw}
          title="Øvelsesbanken kunne ikke hentes"
          text="Ingen øvelser er slettet. Prøv igjen om litt."
          code="FEIL 503 · ØVELSER"
          retry={
            onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="pa-btn pa-btn--primary"
              >
                Prøv igjen
              </button>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <div
      className="pa-side"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        maxWidth: 1320,
        margin: "0 auto",
      }}
    >
      {/* Toast-varsel */}
      {paToast.el}

      {/* Sidehode */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <Sidehode
          kicker={`Plan · ${bank.length} øvelser`}
          title="Øvelsesbank"
          sub="Alle øvelser er navngitt etter AK-formelen. Caddie-forslag er utkast til du legger dem i banken."
        />
        <Link
          href="/portal/ai/foresla-drill"
          className="pa-btn pa-btn--secondary"
          style={{ textDecoration: "none" }}
        >
          <Ikon icon={Plus} size={16} name="plus" />
          <span>Ny øvelse</span>
        </Link>
      </div>

      {/* 2-kolonners rutenett: venstre innholds-stack + høyre sticky detaljpanel på desktop */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 540px), 1fr))",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Venstre kolonne: Caddie-utkast, søk, filtre, drill-liste, break-tabell */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* Caddie foreslår utkast */}
          {drafts.length > 0 && (
            <section
              aria-label="Caddie forslag"
              className="pa-card"
              style={{
                padding: 16,
                gap: 12,
                border: "1px dashed var(--border-strong)",
                background: "var(--surface-flat)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Ikon icon={Sparkles} size={16} name="sparkles" />
                <span className="kicker" style={{ flex: 1 }}>
                  Caddie foreslår · {drafts.length} utkast
                </span>
                <Meta>BYGGER PÅ SG OG TRACKMAN SISTE 30 DAGER</Meta>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {drafts.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      padding: 12,
                      borderRadius: 8,
                      background: "var(--surface-card)",
                      border: "1px solid var(--border-hairline)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <AkseMerke axis={c.axis} size="sm" />
                          <StatusPille tone="neutral">Utkast</StatusPille>
                        </div>
                        <span
                          style={{
                            font: "600 14px/1.3 var(--font-sans)",
                            color: "var(--text-primary)",
                          }}
                        >
                          {c.name}
                        </span>
                        {c.why && (
                          <span
                            style={{
                              font: "var(--type-body-s)",
                              color: "var(--text-secondary)",
                              textWrap: "pretty",
                            }}
                          >
                            {c.why}
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => handleAcceptDraft(c)}
                          className="pa-btn pa-btn--secondary pa-btn--sm"
                        >
                          <Ikon icon={Check} size={14} name="check" />
                          <span>Legg i banken</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSel(c.id);
                            setVisMobilModal(true);
                          }}
                          className="pa-btn pa-btn--ghost pa-btn--sm"
                        >
                          <span>Se detaljer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Søk og kildevalg */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {/* Søkefelt */}
              <div
                style={{
                  flex: "1 1 240px",
                  minWidth: 0,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    pointerEvents: "none",
                    color: "var(--text-muted)",
                  }}
                >
                  <Ikon icon={Search} size={16} name="search" />
                </span>
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Søk øvelse, område eller kode"
                  aria-label="Søk i øvelsesbanken"
                  style={{
                    width: "100%",
                    height: "var(--control-h)",
                    paddingLeft: 38,
                    paddingRight: 40,
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--border-strong)",
                    background: "var(--surface-card)",
                    font: "var(--type-body-s)",
                    color: "var(--text-primary)",
                  }}
                />
                {q && (
                  <span
                    style={{
                      position: "absolute",
                      right: 12,
                      font: "600 11px/1 var(--font-mono)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {hits.length}
                  </span>
                )}
              </div>

              {/* Segmentert kilde-filter (Alle / Fra coach / Mine) */}
              <div
                role="group"
                aria-label="Filtrer etter kilde"
                style={{
                  display: "inline-flex",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border-strong)",
                  background: "var(--surface-sunken)",
                  padding: 2,
                }}
              >
                {(["Alle", "Fra coach", "Mine"] as const).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSrc(label)}
                    aria-pressed={src === label}
                    className="v2-press"
                    style={{
                      border: "none",
                      background: src === label ? "var(--surface-card)" : "transparent",
                      color: src === label ? "var(--text-primary)" : "var(--text-secondary)",
                      font: "600 12px/1 var(--font-sans)",
                      padding: "8px 12px",
                      borderRadius: "calc(var(--radius) - 2px)",
                      cursor: "pointer",
                      boxShadow: src === label ? "0 1px 3px var(--scrim-modal)" : "none",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Segmentert akse-filter */}
            <div
              role="group"
              aria-label="Filtrer etter akse"
              style={{
                display: "flex",
                gap: 6,
                overflowX: "auto",
                paddingBottom: 4,
              }}
            >
              {akseValg.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAx(opt.value)}
                  aria-pressed={ax === opt.value}
                  className="v2-press"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: "var(--radius)",
                    border: `1px solid ${
                      ax === opt.value ? "var(--border-ink)" : "var(--border-hairline)"
                    }`,
                    background:
                      ax === opt.value ? "var(--surface-flat)" : "transparent",
                    color:
                      ax === opt.value
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                    font: "600 12px/1.3 var(--font-mono)",
                    cursor: "pointer",
                  }}
                >
                  <span>{opt.label}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
                    {opt.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Drill-liste */}
          <div
            className="pa-card"
            style={{
              padding: 0,
              overflow: "hidden",
              border: "1px solid var(--border-hairline)",
            }}
          >
            {hits.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {hits.map((o, i) => {
                  const on = o.id === sel;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => {
                        setSel(o.id);
                        setVisMobilModal(true);
                      }}
                      aria-pressed={on}
                      style={{
                        all: "unset",
                        cursor: "pointer",
                        display: "grid",
                        gridTemplateColumns: "4px minmax(0,1fr) auto",
                        gap: 12,
                        alignItems: "center",
                        padding: "12px 16px 12px 12px",
                        borderTop: i ? "1px solid var(--border-hairline)" : "none",
                        background: on ? "var(--surface-flat)" : "transparent",
                        boxShadow: on ? "inset 2px 0 0 var(--border-ink)" : "none",
                        minHeight: 56,
                      }}
                    >
                      {/* Vertikal aksefargestripe */}
                      <span
                        style={{
                          alignSelf: "stretch",
                          borderRadius: 2,
                          background: `var(--axis-${o.axis})`,
                        }}
                      />

                      {/* Tittel og AK-formel kode */}
                      <span
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            font: "500 14px/1.3 var(--font-sans)",
                            color: "var(--text-primary)",
                            textWrap: "pretty",
                          }}
                        >
                          {o.name}
                        </span>
                        <span
                          style={{
                            font: "500 11px/1.3 var(--font-mono)",
                            color: "var(--text-muted)",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {o.code}
                        </span>
                      </span>

                      {/* Varighet og mengde */}
                      <span
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: 4,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          style={{
                            font: "600 13px/1.3 var(--font-mono)",
                            color: "var(--text-primary)",
                          }}
                        >
                          {o.min} min
                        </span>
                        <Meta>{o.qty.split(" · ")[0].toUpperCase()}</Meta>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: 24 }}>
                <TomTilstand
                  icon={Search}
                  title={bank.length === 0 ? "Øvelsesbanken er tom" : "Ingen øvelser passer filteret"}
                  text={
                    bank.length === 0
                      ? "Anders har ikke delt øvelser med deg ennå. Du kan lage din egen eller be Caddie foreslå."
                      : "Prøv en annen akse eller nullstill søket for å se flere øvelser."
                  }
                  actions={
                    <button
                      type="button"
                      onClick={() => {
                        setQ("");
                        setAx("alle");
                        setSrc("Alle");
                      }}
                      className="pa-btn pa-btn--secondary"
                    >
                      <Ikon icon={RotateCcw} size={14} name="rotate-ccw" />
                      <span>Nullstill filter</span>
                    </button>
                  }
                />
              </div>
            )}
          </div>

          {/* Putting Break-tabell (vises ved 'alle' eller 'slag') */}
          {(ax === "alle" || ax === "slag") && (
            <section
              aria-label="Putting Break-tabell"
              className="pa-card"
              style={{
                padding: 16,
                gap: 12,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <span className="kicker">Putting · Break-tabell</span>
                <Meta>CM BREAK VED HELNING · ESTIMAT</Meta>
              </div>

              {/* Stimp-velger */}
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Meta>STIMP</Meta>
                <div
                  role="group"
                  aria-label="Velg stimp"
                  style={{
                    display: "inline-flex",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--border-strong)",
                    background: "var(--surface-sunken)",
                    padding: 2,
                  }}
                >
                  {(["8", "10", "12"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStimp(s)}
                      aria-pressed={stimp === s}
                      className="v2-press"
                      style={{
                        border: "none",
                        background: stimp === s ? "var(--surface-card)" : "transparent",
                        color: stimp === s ? "var(--text-primary)" : "var(--text-secondary)",
                        font: "600 12px/1 var(--font-sans)",
                        padding: "6px 12px",
                        borderRadius: "calc(var(--radius) - 2px)",
                        cursor: "pointer",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rutenett for break */}
              <div
                role="table"
                aria-label={`Break i cm, stimp ${stimp}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1.2fr) repeat(4, minmax(0, 1fr))",
                  gap: "0 8px",
                  fontSize: 13,
                }}
              >
                <Meta style={{ padding: "6px 0" }}>AVSTAND</Meta>
                {BREAK_SLOPES.map((s) => (
                  <Meta key={s} style={{ padding: "6px 0", textAlign: "right" }}>
                    {s} %
                  </Meta>
                ))}

                {BREAK_FOT.map((ft) => (
                  <div
                    key={ft}
                    style={{
                      display: "contents",
                    }}
                  >
                    <span
                      style={{
                        font: "600 13px/1 var(--font-mono)",
                        color: "var(--text-primary)",
                        padding: "10px 0",
                        borderTop: "1px solid var(--border-hairline)",
                      }}
                    >
                      {ft} fot
                    </span>
                    {BREAK_SLOPES.map((s) => (
                      <span
                        key={s}
                        style={{
                          font: "500 13px/1 var(--font-mono)",
                          color: "var(--text-primary)",
                          textAlign: "right",
                          padding: "10px 0",
                          borderTop: "1px solid var(--border-hairline)",
                        }}
                      >
                        {beregnBreakCm(ft, s, parseInt(stimp, 10))}
                      </span>
                    ))}
                  </div>
                ))}
              </div>

              <Meta>SIKT UT FRA HULLET · TOMMELFINGERREGEL, IKKE MÅLT PÅ DIN GREEN</Meta>
            </section>
          )}
        </div>

        {/* Høyre kolonne (Desktop detaljpanel) */}
        <aside
          aria-label="Øvelsedetaljer"
          className="pa-card"
          style={{
            position: "sticky",
            top: 24,
            minWidth: 0,
            padding: 0,
            overflow: "hidden",
            border: "1px solid var(--border-hairline)",
          }}
        >
          {currentDrill ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  padding: "16px 16px 12px",
                  borderBottom: "1px solid var(--border-hairline)",
                }}
              >
                <span className="kicker">Øvelse</span>
                <div
                  style={{
                    font: "var(--type-title-s)",
                    color: "var(--text-primary)",
                    marginTop: 6,
                    textWrap: "pretty",
                  }}
                >
                  {currentDrill.name}
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <PH13DrillDetalj
                  drill={currentDrill}
                  onAcceptDraft={handleAcceptDraft}
                  onDiscardDraft={handleDiscardDraft}
                  onAddToSession={handleAddToSession}
                />
              </div>
            </div>
          ) : (
            <div style={{ padding: 24, textAlign: "center" }}>
              <Meta>Velg en øvelse for å se AK-formelen, mengde og mål.</Meta>
            </div>
          )}
        </aside>
      </div>

      {/* Mobil Modal / Bottom Sheet for valgt øvelse */}
      {visMobilModal && currentDrill && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={currentDrill.name}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 0,
            background: "var(--scrim-modal)",
          }}
        >
          <div
            className="pa-card"
            style={{
              width: "100%",
              maxWidth: 540,
              maxHeight: "85vh",
              overflowY: "auto",
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              padding: 20,
              background: "var(--surface-card)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              boxShadow: "0 -8px 24px var(--scrim-modal)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div>
                <span className="kicker">Øvelse</span>
                <h3
                  style={{
                    font: "var(--type-title-s)",
                    color: "var(--text-primary)",
                    margin: "4px 0 0",
                  }}
                >
                  {currentDrill.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVisMobilModal(false)}
                className="pa-btn pa-btn--ghost pa-btn--sm"
                aria-label="Lukk detaljer"
              >
                <Ikon icon={X} size={18} name="x" />
              </button>
            </div>

            <PH13DrillDetalj
              drill={currentDrill}
              onClose={() => setVisMobilModal(false)}
              onAcceptDraft={(c) => {
                handleAcceptDraft(c);
                setVisMobilModal(false);
              }}
              onDiscardDraft={(c) => {
                handleDiscardDraft(c);
                setVisMobilModal(false);
              }}
              onAddToSession={(c) => {
                handleAddToSession(c);
                setVisMobilModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
