"use client";

/**
 * PlayerHQ Gjør — v2 Presis + opplevelse B-pakke.
 * Oversikt (status + tall) → én grønn start → detalj. Runde/fysisk er sekundært.
 * Ekte data fra getGjennomforeData. Låst følelse: RETNING-B-PAKKE.md
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { markerOktStatus } from "@/lib/portal-gjennomfore/okt-status-actions";
import type { GjennomforeData } from "@/lib/portal-gjennomfore/gjennomfore-data";
import {
  T,
  Caps,
  Tittel,
  StatusPill,
  Kort,
  Rad,
  TallHero,
  CTAPill,
  AkseChip,
  TomTilstand,
  Icon,
  ProgresjonsBar,
} from "@/components/v2";

function fmtTid(min: number): string {
  if (min >= 60) return `${(min / 60).toFixed(1).replace(".", ",")} t`;
  return `${min} min`;
}

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

function HurtigStatus({
  o,
  oppdaterer,
  onMarker,
}: {
  o: { id: string; kilde: "v2" | "plan" };
  oppdaterer: boolean;
  onMarker: (o: { id: string; kilde: "v2" | "plan" }, status: "COMPLETED" | "SKIPPED") => void;
}) {
  return (
    <span style={{ display: "inline-flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="v2-press v2-focus"
        disabled={oppdaterer}
        onClick={() => onMarker(o, "COMPLETED")}
        title="Marker som gjennomført"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontFamily: T.ui,
          fontSize: 11.5,
          fontWeight: 600,
          color: T.fg,
          background: T.panel3,
          border: `1px solid ${T.borderS}`,
          borderRadius: 9999,
          padding: "7px 12px",
          cursor: "pointer",
          minHeight: 32,
        }}
      >
        <Icon name="check" size={12} />
        Gjort
      </button>
      <button
        type="button"
        className="v2-press v2-focus"
        disabled={oppdaterer}
        onClick={() => onMarker(o, "SKIPPED")}
        title="Hopp over økten — coachen ser det i klarspråk"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontFamily: T.ui,
          fontSize: 11.5,
          fontWeight: 600,
          color: T.mut,
          background: "transparent",
          border: `1px solid ${T.border}`,
          borderRadius: 9999,
          padding: "7px 12px",
          cursor: "pointer",
          minHeight: 32,
        }}
      >
        Hopp over
      </button>
    </span>
  );
}

/** Sekundære innganger — aldri grønn primær (B: én accent-jobb). */
function SekundarHandlinger() {
  return (
    <Kort eyebrow="Annet i dag">
      <Link href="/portal/runde/live" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad
          leading={<Icon name="flag" size={16} style={{ color: T.mut }} />}
          title="Før runde slag for slag"
          sub="SG beregnes automatisk når du lagrer"
        />
      </Link>
      <Link href="/portal/runde/logg" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad
          leading={<Icon name="list" size={16} style={{ color: T.mut }} />}
          title="Logg tidligere runde"
          sub="Etterpå-føring"
        />
      </Link>
      <Link href="/portal/fysisk" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad
          leading={<Icon name="dumbbell" size={16} style={{ color: T.mut }} />}
          title="Logg fysisk-økt"
          sub="Styrke, mobilitet, kondisjon"
          last
        />
      </Link>
    </Kort>
  );
}

export function GjorV2({ data }: { data: GjennomforeData }) {
  const mobile = useMobile();
  const router = useRouter();
  const { datoTekst, antall, totalMin, nesteOkt, resteAvDagen, fullfortIdag } = data;
  const [oppdaterer, startOppdatering] = useTransition();
  const [oppdatererId, setOppdatererId] = useState<string | null>(null);
  const marker = (o: { id: string; kilde: "v2" | "plan" }, status: "COMPLETED" | "SKIPPED") => {
    setOppdatererId(o.id);
    startOppdatering(async () => {
      await markerOktStatus({ id: o.id, kilde: o.kilde, status });
      router.refresh();
    });
  };

  const live = nesteOkt?.status === "now";
  const fullfortPct = antall > 0 ? Math.round((fullfortIdag.length / antall) * 100) : 0;

  let headerCaps: string;
  let titelChildren: string;
  let titelEm: string;
  let headerStatus: ReactNode = null;
  if (nesteOkt && live) {
    headerCaps = `Pågående · startet ${nesteOkt.tid}`;
    titelChildren = `${nesteOkt.pyramidArea} ·`;
    titelEm = nesteOkt.tittel;
    headerStatus = <StatusPill tone="lime">Live</StatusPill>;
  } else if (nesteOkt) {
    headerCaps = `Neste · ${nesteOkt.relTidTekst}`;
    titelChildren = `${nesteOkt.pyramidArea} ·`;
    titelEm = nesteOkt.tittel;
    headerStatus = <StatusPill tone="info">kl {nesteOkt.tid}</StatusPill>;
  } else {
    headerCaps = datoTekst;
    titelChildren = "Dagens";
    titelEm = "program";
    if (antall > 0) headerStatus = <StatusPill tone="up">Alt fullført</StatusPill>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Caps>{headerCaps}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em={titelEm}>
              {titelChildren}
            </Tittel>
          </div>
        </div>
        {headerStatus}
      </div>

      {antall === 0 ? (
        <>
          {/* Tom dag — B: ærlig tom + én grønn vei */}
          <div className="grid grid-cols-3" style={{ gap: 8 }}>
            {(
              [
                { l: "Økter", v: "0" },
                { l: "Tid", v: "—" },
                { l: "Status", v: "Hvile" },
              ] as const
            ).map((k) => (
              <Kort key={k.l} pad="12px">
                <Caps size={9}>{k.l}</Caps>
                <div
                  style={{
                    fontFamily: T.mono,
                    fontWeight: 700,
                    fontSize: 16,
                    marginTop: 8,
                    color: T.fg,
                  }}
                >
                  {k.v}
                </div>
              </Kort>
            ))}
          </div>

          <Kort>
            <TomTilstand
              icon="calendar"
              title="Ingen økter i dag"
              sub="Nyt hviledagen — eller planlegg fra Workbench."
            />
          </Kort>

          <Link href="/portal/planlegge/workbench?zoom=uke" style={{ textDecoration: "none", display: "block" }}>
            <CTAPill icon="calendar" full>
              Åpne Workbench
            </CTAPill>
          </Link>
          <Link
            href="/portal/analysere"
            style={{
              textDecoration: "none",
              display: "block",
              textAlign: "center",
              fontFamily: T.ui,
              fontSize: 12,
              fontWeight: 600,
              color: T.mut,
              padding: "2px 0",
            }}
          >
            Se form og finn fokus →
          </Link>

          <SekundarHandlinger />
        </>
      ) : (
        <>
          {/* Status-tall først (B) */}
          <div className="grid grid-cols-3" style={{ gap: 8 }}>
            {(
              [
                { l: "Økter", v: String(antall) },
                { l: "Planlagt", v: fmtTid(totalMin) },
                { l: "Fullført", v: `${fullfortIdag.length}/${antall}` },
              ] as const
            ).map((k) => (
              <Kort key={k.l} pad="12px">
                <Caps size={9}>{k.l}</Caps>
                <div
                  style={{
                    fontFamily: T.mono,
                    fontWeight: 700,
                    fontSize: mobile ? 15 : 17,
                    marginTop: 8,
                    color: T.fg,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {k.v}
                </div>
              </Kort>
            ))}
          </div>

          {antall > 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, fontWeight: 600 }}>
                  Dagens gjennomføring
                </span>
                <span style={{ fontFamily: T.mono, fontSize: 11.5, fontWeight: 700 }}>{fullfortPct} %</span>
              </div>
              <ProgresjonsBar variant="bar" value={fullfortPct} max={100} showValue={false} label="" />
            </div>
          )}

          {/* Én primær CTA */}
          {nesteOkt && (
            <Link href={nesteOkt.href} style={{ textDecoration: "none", display: "block" }}>
              <CTAPill icon="play" full>
                {live ? "Fortsett økt" : "Start økt"}
              </CTAPill>
            </Link>
          )}

          {/* Detalj neste/live */}
          {nesteOkt && (
            <Kort tint eyebrow={live ? "Aktiv økt" : "Neste økt"}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
                <TallHero
                  value={nesteOkt.varighet}
                  unit="min"
                  size={mobile ? 40 : 44}
                  accent
                  sub={`${nesteOkt.sted} · ${nesteOkt.coachNavn}`}
                />
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
                <AkseChip a={nesteOkt.pyramidArea} />
                <StatusPill tone={live ? "lime" : "info"}>
                  {live ? `Live · kl ${nesteOkt.tid}` : nesteOkt.relTidTekst}
                </StatusPill>
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <HurtigStatus
                  o={nesteOkt}
                  oppdaterer={oppdaterer && oppdatererId === nesteOkt.id}
                  onMarker={marker}
                />
                <Link href={`${nesteOkt.href}?logg=1`} style={{ textDecoration: "none" }}>
                  <CTAPill ghost icon="send">
                    Avslutt og send
                  </CTAPill>
                </Link>
              </div>
            </Kort>
          )}

          {/* Øvelser */}
          {nesteOkt && (
            <Kort eyebrow="Øvelser i økta" action={<Caps size={9}>{nesteOkt.antallDrills} øvelser</Caps>}>
              {nesteOkt.drillNavn.length > 0 ? (
                nesteOkt.drillNavn.map((navn, i) => (
                  <Rad
                    key={i}
                    leading={
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 9999,
                          flex: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: T.panel2,
                          border: `1px solid ${T.border}`,
                        }}
                      >
                        <Icon name="circle" size={13} style={{ color: T.mut }} />
                      </span>
                    }
                    title={navn}
                    trailing={null}
                    last={i === nesteOkt.drillNavn.length - 1}
                  />
                ))
              ) : (
                <TomTilstand icon="list" title="Ingen øvelser lagt til" sub="Coachen legger til øvelser i Workbench." />
              )}
            </Kort>
          )}

          {resteAvDagen.length > 0 && (
            <Kort eyebrow="Resten av dagen" action={<Caps size={9}>{resteAvDagen.length} økter</Caps>}>
              {resteAvDagen.map((o, i) => (
                <Rad
                  key={o.id}
                  leading={
                    <span
                      style={{
                        width: 44,
                        flex: "none",
                        fontFamily: T.mono,
                        fontSize: 11,
                        fontWeight: 700,
                        color: T.mut,
                      }}
                    >
                      {o.tid}
                    </span>
                  }
                  title={o.tittel}
                  sub={o.meta}
                  meta={
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <AkseChip a={o.pyramidArea} />
                      <HurtigStatus
                        o={o}
                        oppdaterer={oppdaterer && oppdatererId === o.id}
                        onMarker={marker}
                      />
                    </span>
                  }
                  onClick={() => router.push(o.href)}
                  last={i === resteAvDagen.length - 1}
                />
              ))}
            </Kort>
          )}

          {fullfortIdag.length > 0 && (
            <Kort eyebrow="Fullført i dag" action={<Caps size={9}>{fullfortIdag.length} fullført</Caps>}>
              {fullfortIdag.map((o, i) => (
                <Rad
                  key={o.id}
                  leading={
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 9999,
                        flex: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: T.panel2,
                        border: "1px solid transparent",
                      }}
                    >
                      <Icon name="check" size={13} style={{ color: T.up }} />
                    </span>
                  }
                  title={o.tittel}
                  sub={`${o.tid} · ${o.varighet} min`}
                  trailing={
                    o.trengerLogg ? (
                      <StatusPill tone="warn">Trenger logg</StatusPill>
                    ) : (
                      <StatusPill tone="up">Logget</StatusPill>
                    )
                  }
                  onClick={() => router.push(o.trengerLogg ? `${o.href}?logg=1` : o.href)}
                  last={i === fullfortIdag.length - 1}
                />
              ))}
            </Kort>
          )}

          {/* Runde / fysisk nederst — sekundært */}
          <SekundarHandlinger />
        </>
      )}
    </div>
  );
}
