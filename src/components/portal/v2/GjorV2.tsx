"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ Gjør — v2 Presis + opplevelse B-pakke.
 * Oversikt (status + tall) → én grønn start → detalj. Runde/fysisk er sekundært.
 * Ekte data fra getGjennomforeData. Låst følelse: RETNING-B-PAKKE.md
 */

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { markerOktStatus } from "@/lib/portal-gjennomfore/okt-status-actions";
import type { GjennomforeData } from "@/lib/portal-gjennomfore/gjennomfore-data";
import { HurtigStatusKnapper } from "@/components/widgets";
import { FortsettRundeCta } from "@/components/portal/runde-logg/fortsett-runde-cta";
import { Caps, StatusPill, Kort, Rad, TallHero, CTAPill, AkseChip, HjelpTips, TomTilstand, Icon, ProgresjonsBar } from "@/components/v2";
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

/* HurtigStatus («Gjort»/«Hopp over») bor nå i widget-pakken —
   delt med DagensOkterWidget på Hjem. */

/** Sekundære innganger — aldri grønn primær (B: én accent-jobb). */
function SekundarHandlinger() {
  return (
    <Kort eyebrow="Annet i dag">
      <FortsettRundeCta />
      <Link href="/portal/runde/live" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad
          leading={<Icon name="flag" size={16} style={{ color: TL.mute }} />}
          title="Før runde slag for slag"
          sub="SG beregnes automatisk når du lagrer"
        />
      </Link>
      <Link href="/portal/runde/logg" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad
          leading={<Icon name="list" size={16} style={{ color: TL.mute }} />}
          title="Logg tidligere runde"
          sub="Etterpå-føring"
        />
      </Link>
      <Link href="/portal/mal/runder/ny" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad
          leading={<Icon name="upload" size={16} style={{ color: TL.mute }} />}
          title="Hurtig score / importer runde"
          sub="Ny runde eller score fra fil (UpGame) etter lagring"
        />
      </Link>
      <Link href="/portal/fysisk" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad
          leading={<Icon name="dumbbell" size={16} style={{ color: TL.mute }} />}
          title="Logg fysisk-økt"
          sub="Styrke, mobilitet, kondisjon"
          last
        />
      </Link>
    </Kort>
  );
}

const LAGRET_TEKST: Record<string, string> = {
  trening: "Treningsøkten er lagret.",
};

export function GjorV2({ data }: { data: GjennomforeData }) {
  const mobile = useMobile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lagretTekst = LAGRET_TEKST[searchParams.get("lagret") ?? ""];
  const { antall, totalMin, nesteOkt, resteAvDagen, fullfortIdag } = data;
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

  let headerStatus: ReactNode = null;
  if (nesteOkt && live) {
    headerStatus = <StatusPill tone="lime">Live</StatusPill>;
  } else if (nesteOkt) {
    headerStatus = <StatusPill tone="info">kl {nesteOkt.tid}</StatusPill>;
  } else if (antall > 0) {
    headerStatus = <StatusPill tone="up">Alt fullført</StatusPill>;
  }

  return (
    <div data-paper-wave-g="gjor" data-paper-pattern style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
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
          <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Gjør</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>Dagens økt</span>
        </div>
        </div>
        {headerStatus}
      </div>

      {lagretTekst && (
        <Kort tint>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <StatusPill tone="up">Lagret</StatusPill>
            <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text }}>{lagretTekst}</span>
          </div>
        </Kort>
      )}

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
                    fontFamily: TL.font.mono,
                    fontWeight: 700,
                    fontSize: 16,
                    marginTop: 8,
                    color: TL.text,
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
              fontFamily: TL.font.sans,
              fontSize: 12,
              fontWeight: 600,
              color: TL.mute,
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
                    fontFamily: TL.font.mono,
                    fontWeight: 700,
                    fontSize: mobile ? 15 : 17,
                    marginTop: 8,
                    color: TL.text,
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
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, fontWeight: 600 }}>
                  Dagens gjennomføring
                  <HjelpTips k="planEtterlevelse" size={11} />
                </span>
                <span style={{ fontFamily: TL.font.mono, fontSize: 11.5, fontWeight: 700 }}>{fullfortPct} %</span>
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
                <HjelpTips k="pyramideAkse" size={11} />
                <StatusPill tone={live ? "lime" : "info"}>
                  {live ? `Live · kl ${nesteOkt.tid}` : nesteOkt.relTidTekst}
                </StatusPill>
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <HurtigStatusKnapper
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
                          background: TL.dock,
                          border: `1px solid ${TL.hair}`,
                        }}
                      >
                        <Icon name="circle" size={13} style={{ color: TL.mute }} />
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
                        fontFamily: TL.font.mono,
                        fontSize: 11,
                        fontWeight: 700,
                        color: TL.mute,
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
                      <HurtigStatusKnapper
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
                        background: TL.dock,
                        border: "1px solid transparent",
                      }}
                    >
                      <Icon name="check" size={13} style={{ color: TL.ok }} />
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
