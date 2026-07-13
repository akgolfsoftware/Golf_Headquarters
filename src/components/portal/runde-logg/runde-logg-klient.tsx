"use client";

/**
 * Runde-logg-klient — eier av kladd og stegmaskin for slag-for-slag-føring.
 *
 * Steg: oppsett → føring (m/ hull-oversikt og SG-panel som undervisninger)
 * → oppsummering. Modus «live» (på banen, dato = i dag) eller «etterpaa»
 * (samme flyt, valgfri dato). Kladden autolagres i localStorage etter hver
 * mutasjon og gjenopprettes ved reload/crash («Fortsett fra hull N?»).
 * Å lukke siden mister aldri slag — kladden slettes først ved bekreftet lagring.
 */

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { LoggetHull, LoggetSlag } from "@/lib/runde-logg/types";
import {
  lesKladdCached,
  lesKladdServer,
  lagreKladd,
  slettKladd,
} from "@/lib/runde-logg/draft";

/** Kladden endres aldri utenfra mens siden er åpen — tom subscribe. */
const abonnerIngen = () => () => {};
import { T, Icon } from "@/components/v2";
import { OppsettSteg, type OppsettVerdi } from "./oppsett-steg";
import { HullForing } from "./hull-foring";
import { HullOversikt } from "./hull-oversikt";
import { SgPanel } from "./sg-panel";
import { Oppsummering } from "./oppsummering";

type Steg = "oppsett" | "foring" | "oppsummering";
type Visning = "foring" | "oversikt" | "sg";

type RundeLoggKlientProps = {
  modus: "live" | "etterpaa";
  baner: Array<{ id: string; name: string }>;
};

function erFerdig(h: LoggetHull): boolean {
  return h.slag.at(-1)?.resultat.iHull === true;
}

export function RundeLoggKlient({ modus, baner }: RundeLoggKlientProps) {
  const router = useRouter();
  const [steg, setSteg] = useState<Steg>("oppsett");
  const [visning, setVisning] = useState<Visning>("foring");
  const [oppsett, setOppsett] = useState<Omit<OppsettVerdi, "hull"> | null>(null);
  const [hullData, setHullData] = useState<LoggetHull[]>([]);
  const [aktivtHullIdx, setAktivtHullIdx] = useState(0);
  const [kladdHandtert, setKladdHandtert] = useState(false);

  // Gjenoppretting: les kladd hydration-trygt (server ser alltid null,
  // klienten leser localStorage cachet via draft-modulen).
  const lagretKladd = useSyncExternalStore(abonnerIngen, lesKladdCached, lesKladdServer);
  const kladd = kladdHandtert ? null : lagretKladd;

  // Autolagre kladd etter hver mutasjon (kun etter at føringen er i gang).
  const startet = steg !== "oppsett" && oppsett != null;
  useEffect(() => {
    if (!startet || !oppsett) return;
    lagreKladd({
      versjon: 1,
      modus,
      steg,
      oppsett: {
        courseId: oppsett.courseId,
        courseNavn: oppsett.courseNavn,
        roundType: oppsett.roundType,
        hullValg: oppsett.hullValg,
        playedAt: oppsett.playedAt,
      },
      hullData,
      aktivtHullIdx,
    });
  }, [startet, modus, steg, oppsett, hullData, aktivtHullIdx]);

  const start = (verdi: OppsettVerdi) => {
    setOppsett({
      courseId: verdi.courseId,
      courseNavn: verdi.courseNavn,
      roundType: verdi.roundType,
      hullValg: verdi.hullValg,
      playedAt: verdi.playedAt,
    });
    setHullData(
      verdi.hull.map((h) => ({
        holeNumber: h.holeNumber,
        par: h.par,
        lengdeMeter: h.lengdeMeter,
        slag: [],
      })),
    );
    setAktivtHullIdx(0);
    setSteg("foring");
    setKladdHandtert(true);
  };

  const gjenopprett = () => {
    if (!kladd) return;
    setOppsett({
      courseId: kladd.oppsett.courseId ?? "",
      courseNavn: kladd.oppsett.courseNavn,
      roundType: kladd.oppsett.roundType,
      hullValg: kladd.oppsett.hullValg,
      playedAt: kladd.oppsett.playedAt,
    });
    setHullData(kladd.hullData);
    setAktivtHullIdx(Math.min(kladd.aktivtHullIdx, Math.max(kladd.hullData.length - 1, 0)));
    setSteg(kladd.steg === "oppsett" ? "foring" : kladd.steg);
    setKladdHandtert(true);
  };

  const forkastKladd = () => {
    slettKladd();
    setKladdHandtert(true);
  };

  const aktivtHull = hullData[aktivtHullIdx];

  const leggTilSlag = (slag: LoggetSlag) => {
    setHullData((data) =>
      data.map((h, i) => (i === aktivtHullIdx ? { ...h, slag: [...h.slag, slag] } : h)),
    );
  };

  const angre = () => {
    setHullData((data) =>
      data.map((h, i) => (i === aktivtHullIdx ? { ...h, slag: h.slag.slice(0, -1) } : h)),
    );
  };

  const nesteHull = () => {
    // Neste uferdige hull ETTER aktivt (wrap-around); ingen igjen → oppsummering.
    const n = hullData.length;
    for (let steg2 = 1; steg2 <= n; steg2++) {
      const idx = (aktivtHullIdx + steg2) % n;
      if (!erFerdig(hullData[idx])) {
        setAktivtHullIdx(idx);
        return;
      }
    }
    setSteg("oppsummering");
  };

  // Score hittil (fullførte hull) relativt til par.
  const scoreHittil = useMemo(() => {
    const ferdige = hullData.filter(erFerdig);
    if (ferdige.length === 0) return "E";
    const score = ferdige.reduce(
      (sum, h) => sum + h.slag.length + h.slag.filter((s) => s.straffe).length,
      0,
    );
    const par = ferdige.reduce((sum, h) => sum + h.par, 0);
    const diff = score - par;
    return diff === 0 ? "E" : diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`;
  }, [hullData]);

  // Vind vedvarer per hull: sist registrerte vind i aktivt hull.
  const sisteVind = useMemo(
    () => aktivtHull?.slag.findLast((s) => s.vind != null)?.vind,
    [aktivtHull],
  );

  const antallFerdige = hullData.filter(erFerdig).length;

  // Lukk (tilbake til runde-lista) — kladden består.
  const lukk = () => router.push("/portal/mal/runder");

  return (
    <div style={{ minHeight: "100dvh", background: T.bg }}>
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          paddingTop: "max(14px, env(safe-area-inset-top))",
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: "max(32px, env(safe-area-inset-bottom))",
        }}
      >
        {/* Topplinje */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: T.mut,
            }}
          >
            {modus === "live" ? "Live-føring" : "Etterregistrering"}
            {oppsett ? ` · ${oppsett.courseNavn}` : ""}
          </span>
          <button
            type="button"
            onClick={lukk}
            aria-label="Lukk føringen — kladden beholdes"
            className="v2-press v2-focus"
            style={{
              appearance: "none",
              cursor: "pointer",
              width: 32,
              height: 32,
              borderRadius: 10,
              background: T.panel2,
              border: `1px solid ${T.border}`,
              color: T.fg2,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="x" size={15} />
          </button>
        </div>

        {steg === "oppsett" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {kladd && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "color-mix(in srgb, var(--v2-warn) 8%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--v2-warn) 35%, transparent)",
                }}
              >
                <Icon name="clock" size={16} style={{ color: T.warn, flex: "none" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 700, color: T.fg }}>
                    Uferdig runde funnet
                  </div>
                  <div style={{ fontFamily: T.ui, fontSize: 11, color: T.fg2 }}>
                    {kladd.oppsett.courseNavn} · {kladd.hullData.filter(erFerdig).length} hull ført —
                    lagret på denne enheten
                  </div>
                </div>
                <button
                  type="button"
                  onClick={gjenopprett}
                  className="v2-press v2-focus"
                  style={{
                    appearance: "none",
                    cursor: "pointer",
                    padding: "8px 14px",
                    borderRadius: 10,
                    background: T.warn,
                    border: "none",
                    fontFamily: T.ui,
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.onLime,
                  }}
                >
                  Fortsett
                </button>
                <button
                  type="button"
                  onClick={forkastKladd}
                  className="v2-press v2-focus"
                  style={{
                    appearance: "none",
                    cursor: "pointer",
                    padding: "8px 10px",
                    borderRadius: 10,
                    background: "transparent",
                    border: `1px solid ${T.border}`,
                    fontFamily: T.ui,
                    fontSize: 12,
                    fontWeight: 600,
                    color: T.mut,
                  }}
                >
                  Forkast
                </button>
              </div>
            )}
            <OppsettSteg modus={modus} baner={baner} onStart={start} />
          </div>
        )}

        {steg === "foring" && oppsett && aktivtHull && (
          <>
            {visning === "foring" && (
              <HullForing
                hull={aktivtHull}
                antallHull={hullData.length}
                ferdigeFor={antallFerdige}
                scoreHittil={scoreHittil}
                sisteVind={sisteVind}
                onSlag={leggTilSlag}
                onAngre={aktivtHull.slag.length > 0 ? angre : null}
                onNesteHull={nesteHull}
                onVisOversikt={() => setVisning("oversikt")}
                onVisSg={() => setVisning("sg")}
              />
            )}
            {visning === "oversikt" && (
              <HullOversikt
                hullData={hullData}
                aktivtHullIdx={aktivtHullIdx}
                onVelgHull={(idx) => {
                  setAktivtHullIdx(idx);
                  setVisning("foring");
                }}
                onLukk={() => setVisning("foring")}
                onAvslutt={antallFerdige > 0 ? () => setSteg("oppsummering") : null}
              />
            )}
            {visning === "sg" && <SgPanel hullData={hullData} onLukk={() => setVisning("foring")} />}
          </>
        )}

        {steg === "oppsummering" && oppsett && (
          <Oppsummering
            courseId={oppsett.courseId}
            courseNavn={oppsett.courseNavn}
            playedAt={oppsett.playedAt}
            roundType={oppsett.roundType}
            hullData={hullData}
            onTilbake={() => {
              setSteg("foring");
              setVisning("foring");
            }}
          />
        )}
      </div>
    </div>
  );
}
