"use client";

/**
 * SpillerProfilPanel — Paper-fasitens spillerprofil-artefakt (designsystem/
 * paper/fase1/spillerprofil.html), PP-3 skjelett + 6 kjerneseksjoner.
 *
 * Profilen er et ARTEFAKT, ikke en egen flate i rail-en (fasitens .bak-tekst):
 * den åpnes per spiller fra /admin/spillere (?profil=<id>) og følger
 * KonsollArtefakt-mønsteret — panelramme + innhold, gjenbrukbar fra Konsoll.
 * Fullskjerm-fallback er den eksisterende ruten /admin/spillere/[id]
 * («Full side» i hodet) — ingen nye ruter.
 *
 * Struktur fra fasiten: phead (avatar-initialer + sub av ekte felter) →
 * kpirad (4) → seksjoner (<details> med kilde:-linje per Prisma-modell) →
 * pfoot (Tilbake | Åpne i Workbench). De 6 kjerneseksjonene er koblet mot
 * eksisterende loadere; de 12 øvrige er ærlige stubber («ikke koblet ennå»).
 *
 * Fire tilstander: fylt/tom per seksjon (linjer vs tomTekst), feil via
 * `feil`-prop (side-level try/catch), laster via /admin/spillere/loading.tsx.
 *
 * Desktop >1180px: høyre-kolonnepanel. ≤1180px: bunn-ark med scrim (fasitens
 * bruddpunkt). Lukking navigerer tilbake til /admin/spillere uten query.
 */

import { useEffect, useSyncExternalStore, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, X } from "lucide-react";
import type { SpillerProfilPanelData, ProfilSeksjon } from "@/lib/admin-spiller/spiller-profil-panel-data";

const SMAL_QUERY = "(max-width: 1180px)";

function abonnerSmal(varsle: () => void): () => void {
  const mq = window.matchMedia(SMAL_QUERY);
  mq.addEventListener("change", varsle);
  return () => mq.removeEventListener("change", varsle);
}

/** Fasitens bruddpunkt ≤1180px — SSR-trygt via useSyncExternalStore. */
function useErSmal(): boolean {
  return useSyncExternalStore(
    abonnerSmal,
    () => window.matchMedia(SMAL_QUERY).matches,
    () => false,
  );
}

/** true først etter hydrering — createPortal krever document. */
function useMontert(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

const mono: CSSProperties = { fontFamily: "var(--tl-font-mono)" };

function KildeLinje({ kilde }: { kilde: string }) {
  return (
    <span
      style={{
        ...mono,
        display: "block",
        fontSize: 9,
        color: "var(--tl-mute)",
        letterSpacing: "0.04em",
      }}
    >
      kilde: {kilde}
    </span>
  );
}

function Seksjon({ s }: { s: ProfilSeksjon }) {
  const stub = s.linjer === null;
  const tom = !stub && s.linjer !== null && s.linjer.length === 0;
  return (
    <details
      open={Boolean(s.aapen) && !stub && !tom}
      data-od-id={`pp-sek-${s.id}`}
      style={{
        border: "1px solid var(--tl-hair)",
        borderRadius: "var(--tl-r-card)",
        background: "var(--tl-elev)",
        marginBottom: "8px",
        overflow: "hidden",
      }}
    >
      <summary
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          minHeight: "var(--tl-tap)",
          padding: "8px 12px",
          cursor: "pointer",
          listStyle: "none",
          minWidth: 0,
        }}
      >
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>{s.tittel}</span>
          <KildeLinje kilde={s.kilde} />
        </span>
        <span style={{ ...mono, marginLeft: "auto", fontSize: 11, color: "var(--tl-mute)", flex: "none" }}>
          {stub ? "" : (s.linjer?.length ?? 0) || "—"}
        </span>
      </summary>
      <div style={{ padding: "12px", borderTop: "1px solid var(--tl-hair)" }}>
        {stub ? (
          <p style={{ margin: 0, fontFamily: "var(--tl-text-body)", fontSize: 12.5, color: "var(--tl-mute)" }}>
            <b style={{ display: "block", color: "var(--tl-text)", fontFamily: "var(--tl-font-sans)", fontWeight: 600 }}>
              Ikke koblet ennå
            </b>
            Seksjonen finnes i fasiten, men datakoblingen mot {s.kilde} er ikke bygget. Ingenting er
            skjult — det er bare ikke koblet.
          </p>
        ) : tom ? (
          <p style={{ margin: 0, fontFamily: "var(--tl-text-body)", fontSize: 12.5, color: "var(--tl-mute)" }}>
            <b style={{ display: "block", color: "var(--tl-text)", fontFamily: "var(--tl-font-sans)", fontWeight: 600 }}>
              Ingenting registrert ennå
            </b>
            {s.tomTekst ?? `Når det finnes data for ${s.tittel.toLowerCase()}, vises den her.`}
          </p>
        ) : (
          s.linjer?.map((l, i) => (
            <div
              key={`${l.k}-${i}`}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "12px",
                padding: "8px 0",
                borderBottom: i === (s.linjer?.length ?? 0) - 1 ? 0 : "1px solid var(--tl-hair)",
                fontSize: 12.5,
                minWidth: 0,
              }}
            >
              <span style={{ color: "var(--tl-mute)", minWidth: 0 }}>{l.k}</span>
              <span
                className="num"
                style={{
                  ...mono,
                  marginLeft: "auto",
                  textAlign: "right",
                  color: l.tone === "pos" ? "var(--tl-ok)" : l.tone === "neg" ? "var(--tl-danger)" : "var(--tl-text)",
                }}
              >
                {l.v}
              </span>
            </div>
          ))
        )}
      </div>
    </details>
  );
}

/** kpirad fra fasiten — delt mellom panel (2 kol) og fullskjerm (4 kol ≥900px). */
function KpiFliser({ kpi, className }: { kpi: SpillerProfilPanelData["kpi"]; className?: string }) {
  return (
    <div
      className={className}
      style={
        className
          ? undefined
          : {
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "8px",
              marginBottom: "12px",
            }
      }
    >
      {kpi.map((k) => (
        <div
          key={k.k}
          style={{
            padding: "12px",
            background: "var(--tl-elev)",
            border: "1px solid var(--tl-hair)",
            borderRadius: "var(--tl-r-card)",
            minWidth: 0,
          }}
        >
          <span
            style={{
              ...mono,
              display: "block",
              fontSize: 9,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "var(--tl-mute)",
            }}
          >
            {k.k}
          </span>
          <span
            className="num"
            style={{
              ...mono,
              display: "block",
              fontSize: 21,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: k.tone === "pos" ? "var(--tl-ok)" : k.tone === "neg" ? "var(--tl-danger)" : "var(--tl-text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {k.v}
          </span>
          <span style={{ display: "block", fontSize: 10.5, color: "var(--tl-mute)" }}>{k.w}</span>
        </div>
      ))}
    </div>
  );
}

const MERKNAD =
  "Profilen viser målinger, ikke dommer. Seksjoner merket «ikke koblet ennå» venter på datakobling.";

const ghostBtn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  minHeight: "var(--tl-tap)",
  padding: "0 16px",
  fontFamily: "var(--tl-font-sans)",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--tl-text)",
  background: "transparent",
  border: "1px solid var(--tl-hair)",
  borderRadius: "var(--tl-r-card)",
  cursor: "pointer",
  textDecoration: "none",
  whiteSpace: "nowrap",
};

/**
 * SpillerProfilFull — fasitens `body.full`-modus (spillerprofil.html:312-317):
 * samme innhold som panelet, men i full bredde — kpirad i 4 kolonner og
 * seksjonene i CSS-spalter (2, 3 over 1700px, 1 på mobil; `break-inside:avoid`).
 * Rendres av /admin/spillere/[id] inne i V2Shell (skallet eier chrome).
 */
export function SpillerProfilFull({ data }: { data: SpillerProfilPanelData }) {
  return (
    <div
      data-paper-slug="spillerprofil"
      data-od-id="spiller-profil-full"
      style={{ fontFamily: "var(--tl-font-sans)", color: "var(--tl-text)", minWidth: 0 }}
    >
      <style>{`
        .pp-full-kpi{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:12px}
        @media (min-width:900px){.pp-full-kpi{grid-template-columns:repeat(4,minmax(0,1fr))}}
        .pp-full-sek{column-count:1;column-gap:16px}
        @media (min-width:1100px){.pp-full-sek{column-count:2}}
        @media (min-width:1700px){.pp-full-sek{column-count:3}}
        .pp-full-sek > details{break-inside:avoid}
      `}</style>

      {/* phead — kilde: User */}
      <header style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, marginBottom: "16px" }}>
        <span
          aria-hidden
          style={{
            ...mono,
            width: 44,
            height: 44,
            flex: "none",
            borderRadius: 999,
            background: "var(--tl-dim)",
            display: "grid",
            placeItems: "center",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--tl-mute)",
          }}
        >
          {data.initialer}
        </span>
        <div style={{ minWidth: 0, flex: "1 1 auto" }}>
          <h1 style={{ margin: 0, fontFamily: "var(--tl-font-sans)", fontSize: 17, fontWeight: 600 }}>{data.navn}</h1>
          <span style={{ ...mono, display: "block", fontSize: 11, color: "var(--tl-mute)" }}>{data.subLinje}</span>
        </div>
        <div style={{ display: "flex", gap: "8px", flex: "none" }}>
          <Link href="/admin/spillere" data-od-id="pp-full-tilbake" style={ghostBtn}>
            Tilbake til Spillere
          </Link>
          <Link
            href={data.workbenchHref}
            data-od-id="pp-full-workbench"
            style={{ ...ghostBtn, background: "var(--tl-fill)", color: "var(--tl-on-fill)", borderColor: "var(--tl-fill)" }}
          >
            Åpne i Workbench
          </Link>
        </div>
      </header>

      <KpiFliser kpi={data.kpi} className="pp-full-kpi" />

      <p
        style={{
          fontSize: 11.5,
          color: "var(--tl-mute)",
          fontFamily: "var(--tl-text-body)",
          padding: "8px 12px",
          background: "var(--tl-dim)",
          borderRadius: "var(--tl-r-row)",
          margin: "0 0 16px",
        }}
      >
        {MERKNAD}
      </p>

      <div className="pp-full-sek">
        {data.seksjoner.map((s) => (
          <Seksjon key={s.id} s={s} />
        ))}
      </div>
    </div>
  );
}

export function SpillerProfilPanel({
  data,
  feil = false,
}: {
  /** null kun sammen med feil=true. */
  data: SpillerProfilPanelData | null;
  /** Side-level lastefeil — panelet viser ærlig feiltilstand med vei videre. */
  feil?: boolean;
}) {
  const router = useRouter();
  const smal = useErSmal();
  const montert = useMontert();

  const lukk = () => router.push("/admin/spillere");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        router.push("/admin/spillere");
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [router]);

  if (!montert) return null;

  return createPortal(
    <>
      <div
        aria-hidden
        onClick={lukk}
        style={{ position: "fixed", inset: 0, background: "var(--tl-scrim)", zIndex: 92 }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Spillerprofil"
        data-paper-slug="spillerprofil"
        data-od-id="spiller-profil-panel"
        style={{
          position: "fixed",
          zIndex: 93,
          display: "flex",
          flexDirection: "column",
          background: "var(--tl-scene)",
          color: "var(--tl-text)",
          fontFamily: "var(--tl-font-sans)",
          fontSize: "var(--tl-text-body)",
          ...(smal
            ? {
                left: 0,
                right: 0,
                bottom: 0,
                maxHeight: "90vh",
                borderTop: "1px solid var(--tl-hair)",
                borderRadius: "var(--tl-r-sheet) var(--tl-r-sheet) 0 0",
                boxShadow: "none",
                paddingBottom: "env(safe-area-inset-bottom)",
              }
            : {
                top: 0,
                right: 0,
                bottom: 0,
                width: 380,
                maxWidth: "100vw",
                borderLeft: "1px solid var(--tl-hair)",
                boxShadow: "none",
              }),
        }}
      >
        {smal && (
          <div
            aria-hidden
            style={{
              width: 36,
              height: 4,
              flex: "none",
              borderRadius: 999,
              background: "var(--tl-hair)",
              margin: "12px auto 4px",
            }}
          />
        )}

        {/* phead — kilde: User */}
        <header
          style={{
            flex: "none",
            padding: "16px",
            borderBottom: "1px solid var(--tl-hair)",
            background: "var(--tl-elev)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <span
              aria-hidden
              style={{
                ...mono,
                width: 44,
                height: 44,
                flex: "none",
                borderRadius: 999,
                background: "var(--tl-dim)",
                display: "grid",
                placeItems: "center",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--tl-mute)",
              }}
            >
              {feil || !data ? "—" : data.initialer}
            </span>
            <div style={{ minWidth: 0, flex: "1 1 auto" }}>
              <h1
                style={{
                  margin: 0,
                  fontFamily: "var(--tl-font-sans)",
                  fontSize: 17,
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {feil || !data ? "Spillerprofil" : data.navn}
              </h1>
              {data && !feil && (
                <span style={{ ...mono, display: "block", fontSize: 11, color: "var(--tl-mute)" }}>
                  {data.subLinje}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px", flex: "none" }}>
              {data && !feil && (
                <Link
                  href={data.fullSideHref}
                  data-od-id="pp-full-side"
                  style={{ ...ghostBtn, fontSize: 12, padding: "0 12px" }}
                >
                  <ExternalLink size={14} />
                  Full side
                </Link>
              )}
              <button type="button" onClick={lukk} aria-label="Lukk profilen" data-od-id="pp-lukk" style={{ ...ghostBtn, width: "var(--tl-tap)", padding: 0 }}>
                <X size={17} />
              </button>
            </div>
          </div>
        </header>

        {/* pbody */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px", ...(smal ? { maxHeight: "58vh" } : {}) }}>
          {feil || !data ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "20px",
                background: "var(--tl-dim)",
                border: "1px dashed var(--tl-hair)",
                borderRadius: "var(--tl-r-card)",
              }}
            >
              <span style={{ fontFamily: "var(--tl-font-sans)", fontSize: 15, fontWeight: 600 }}>Noe gikk galt</span>
              <p style={{ margin: 0, fontFamily: "var(--tl-text-body)", fontSize: 13.5, color: "var(--tl-mute)", maxWidth: "46ch" }}>
                Klarte ikke å hente spillerprofilen. Prøv igjen, eller åpne spillerens fulle side.
              </p>
              <button type="button" onClick={() => router.refresh()} data-od-id="pp-retry" style={ghostBtn}>
                Prøv igjen
              </button>
            </div>
          ) : (
            <>
              {/* kpirad — kilde: Round · User.hcp · Booking · TrainingPlanSession */}
              <KpiFliser kpi={data.kpi} />

              <p
                style={{
                  fontSize: 11.5,
                  color: "var(--tl-mute)",
                  fontFamily: "var(--tl-text-body)",
                  padding: "8px 12px",
                  background: "var(--tl-dim)",
                  borderRadius: "var(--tl-r-row)",
                  margin: "0 0 16px",
                }}
              >
                {MERKNAD}
              </p>

              <div>
                {data.seksjoner.map((s) => (
                  <Seksjon key={s.id} s={s} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* pfoot */}
        <div
          style={{
            flex: "none",
            display: "flex",
            gap: "8px",
            padding: "12px 16px",
            borderTop: "1px solid var(--tl-hair)",
            background: "var(--tl-elev)",
            paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
          }}
        >
          <Link href="/admin/spillere" data-od-id="pp-tilbake" style={{ ...ghostBtn, flex: 1 }}>
            Tilbake til Spillere
          </Link>
          {data && !feil && (
            <Link
              href={data.workbenchHref}
              data-od-id="pp-workbench"
              style={{
                ...ghostBtn,
                flex: 1,
                background: "var(--tl-fill)",
                color: "var(--tl-on-fill)",
                borderColor: "var(--tl-fill)",
              }}
            >
              Åpne i Workbench
            </Link>
          )}
        </div>
      </aside>
    </>,
    document.body,
  );
}
