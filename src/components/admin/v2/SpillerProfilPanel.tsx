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

const mono: CSSProperties = { fontFamily: "var(--p-mono)" };

function KildeLinje({ kilde }: { kilde: string }) {
  return (
    <span
      style={{
        ...mono,
        display: "block",
        fontSize: 9,
        color: "var(--p-mid)",
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
        border: "1px solid var(--p-border)",
        borderRadius: "var(--p-r)",
        background: "var(--p-surface)",
        marginBottom: "var(--p-s2)",
        overflow: "hidden",
      }}
    >
      <summary
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--p-s2)",
          minHeight: "var(--p-tap)",
          padding: "var(--p-s2) var(--p-s3)",
          cursor: "pointer",
          listStyle: "none",
          minWidth: 0,
        }}
      >
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>{s.tittel}</span>
          <KildeLinje kilde={s.kilde} />
        </span>
        <span style={{ ...mono, marginLeft: "auto", fontSize: 11, color: "var(--p-muted)", flex: "none" }}>
          {stub ? "" : (s.linjer?.length ?? 0) || "—"}
        </span>
      </summary>
      <div style={{ padding: "var(--p-s3)", borderTop: "1px solid var(--p-border)" }}>
        {stub ? (
          <p style={{ margin: 0, fontFamily: "var(--p-body)", fontSize: 12.5, color: "var(--p-muted)" }}>
            <b style={{ display: "block", color: "var(--p-fg)", fontFamily: "var(--p-ui)", fontWeight: 600 }}>
              Ikke koblet ennå
            </b>
            Seksjonen finnes i fasiten, men datakoblingen mot {s.kilde} er ikke bygget. Ingenting er
            skjult — det er bare ikke koblet.
          </p>
        ) : tom ? (
          <p style={{ margin: 0, fontFamily: "var(--p-body)", fontSize: 12.5, color: "var(--p-muted)" }}>
            <b style={{ display: "block", color: "var(--p-fg)", fontFamily: "var(--p-ui)", fontWeight: 600 }}>
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
                gap: "var(--p-s3)",
                padding: "var(--p-s2) 0",
                borderBottom: i === (s.linjer?.length ?? 0) - 1 ? 0 : "1px solid var(--p-border)",
                fontSize: 12.5,
                minWidth: 0,
              }}
            >
              <span style={{ color: "var(--p-muted)", minWidth: 0 }}>{l.k}</span>
              <span
                className="num"
                style={{
                  ...mono,
                  marginLeft: "auto",
                  textAlign: "right",
                  color: l.tone === "pos" ? "var(--p-up)" : l.tone === "neg" ? "var(--p-dn)" : "var(--p-fg)",
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

const ghostBtn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--p-s2)",
  minHeight: "var(--p-tap)",
  padding: "0 var(--p-s4)",
  fontFamily: "var(--p-ui)",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--p-fg)",
  background: "transparent",
  border: "1px solid var(--p-border)",
  borderRadius: "var(--p-r)",
  cursor: "pointer",
  textDecoration: "none",
  whiteSpace: "nowrap",
};

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
        style={{ position: "fixed", inset: 0, background: "var(--p-scrim)", zIndex: 92 }}
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
          background: "var(--p-bg)",
          color: "var(--p-fg)",
          fontFamily: "var(--p-ui)",
          fontSize: "var(--p-text-body-agency)",
          ...(smal
            ? {
                left: 0,
                right: 0,
                bottom: 0,
                maxHeight: "90vh",
                borderTop: "1px solid var(--p-border)",
                borderRadius: "var(--p-r-lg) var(--p-r-lg) 0 0",
                boxShadow: "var(--p-shadow)",
                paddingBottom: "env(safe-area-inset-bottom)",
              }
            : {
                top: 0,
                right: 0,
                bottom: 0,
                width: 380,
                maxWidth: "100vw",
                borderLeft: "1px solid var(--p-border)",
                boxShadow: "var(--p-shadow)",
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
              background: "var(--p-border)",
              margin: "var(--p-s3) auto var(--p-s1)",
            }}
          />
        )}

        {/* phead — kilde: User */}
        <header
          style={{
            flex: "none",
            padding: "var(--p-s4)",
            borderBottom: "1px solid var(--p-border)",
            background: "var(--p-surface)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--p-s3)", minWidth: 0 }}>
            <span
              aria-hidden
              style={{
                ...mono,
                width: 44,
                height: 44,
                flex: "none",
                borderRadius: 999,
                background: "var(--p-soft)",
                display: "grid",
                placeItems: "center",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--p-muted)",
              }}
            >
              {feil || !data ? "—" : data.initialer}
            </span>
            <div style={{ minWidth: 0, flex: "1 1 auto" }}>
              <h1
                style={{
                  margin: 0,
                  fontFamily: "var(--p-disp)",
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
                <span style={{ ...mono, display: "block", fontSize: 11, color: "var(--p-muted)" }}>
                  {data.subLinje}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "var(--p-s2)", flex: "none" }}>
              {data && !feil && (
                <Link
                  href={data.fullSideHref}
                  data-od-id="pp-full-side"
                  style={{ ...ghostBtn, fontSize: 12, padding: "0 var(--p-s3)" }}
                >
                  <ExternalLink size={14} />
                  Full side
                </Link>
              )}
              <button type="button" onClick={lukk} aria-label="Lukk profilen" data-od-id="pp-lukk" style={{ ...ghostBtn, width: "var(--p-tap)", padding: 0 }}>
                <X size={17} />
              </button>
            </div>
          </div>
        </header>

        {/* pbody */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "var(--p-s4)", ...(smal ? { maxHeight: "58vh" } : {}) }}>
          {feil || !data ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--p-s3)",
                padding: "var(--p-s5)",
                background: "var(--p-soft)",
                border: "1px dashed var(--p-border)",
                borderRadius: "var(--p-r)",
              }}
            >
              <span style={{ fontFamily: "var(--p-disp)", fontSize: 15, fontWeight: 600 }}>Noe gikk galt</span>
              <p style={{ margin: 0, fontFamily: "var(--p-body)", fontSize: 13.5, color: "var(--p-muted)", maxWidth: "46ch" }}>
                Klarte ikke å hente spillerprofilen. Prøv igjen, eller åpne spillerens fulle side.
              </p>
              <button type="button" onClick={() => router.refresh()} data-od-id="pp-retry" style={ghostBtn}>
                Prøv igjen
              </button>
            </div>
          ) : (
            <>
              {/* kpirad — kilde: Round · User.hcp · Booking · TrainingPlanSession */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "var(--p-s2)",
                  marginBottom: "var(--p-s3)",
                }}
              >
                {data.kpi.map((k) => (
                  <div
                    key={k.k}
                    style={{
                      padding: "var(--p-s3)",
                      background: "var(--p-surface)",
                      border: "1px solid var(--p-border)",
                      borderRadius: "var(--p-r)",
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
                        color: "var(--p-muted)",
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
                        color: k.tone === "pos" ? "var(--p-up)" : k.tone === "neg" ? "var(--p-dn)" : "var(--p-fg)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {k.v}
                    </span>
                    <span style={{ display: "block", fontSize: 10.5, color: "var(--p-muted)" }}>{k.w}</span>
                  </div>
                ))}
              </div>

              <p
                style={{
                  fontSize: 11.5,
                  color: "var(--p-muted)",
                  fontFamily: "var(--p-body)",
                  padding: "var(--p-s2) var(--p-s3)",
                  background: "var(--p-soft)",
                  borderRadius: "var(--p-r-sm)",
                  margin: "0 0 var(--p-s4)",
                }}
              >
                Profilen viser målinger, ikke dommer. Seksjoner merket «ikke koblet ennå» venter på
                datakobling.
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
            gap: "var(--p-s2)",
            padding: "var(--p-s3) var(--p-s4)",
            borderTop: "1px solid var(--p-border)",
            background: "var(--p-surface)",
            paddingBottom: "calc(var(--p-s3) + env(safe-area-inset-bottom))",
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
                background: "var(--p-cta)",
                color: "var(--p-on-cta)",
                borderColor: "var(--p-cta)",
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
