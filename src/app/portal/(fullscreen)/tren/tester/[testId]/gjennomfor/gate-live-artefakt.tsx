"use client";

/**
 * TE-04/TE-05 — Gate (C4/Loop 8). Live-tapper for gate-protokoller (Putt Gate ·
 * Driver Gate · Wedge Gate · Nærspill Gate · VISA Express — scoringMode
 * "hit-rate", ett steg med checkbox-feltet «ok», se `detectLiveArtefaktKind`
 * i src/lib/domain/tester-live.ts). V|H ved Bom vises bare når protokollen har
 * et miss_side-felt (Putt Gate i dag).
 *
 * Visningen er PH-15 (Treff eller Bom) i Precision Athletics, se
 * src/components/portal/precision/PH15TestGjennomfor.tsx. Denne fila eier
 * bare logikken: lagring per slag (best effort), gjenopptak, fullføring og
 * avbrudd.
 *
 * Tidligere fasit (utgått, bare sporbarhet): designsystem/train-lock/TE-04 Live Gate.dc.html,
 * TE-04L Live Gate lys.dc.html og TE-05 Gate ferdig.dc.html.
 *
 * Endring mot før: «Gjennom» heter «Treff» (som tegnet), og resultatet vises
 * på samme flate med «Lagre resultat» i stedet for en egen «Gate ferdig»-side.
 * Spilleren kan angre siste slag før lagring.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  gateErFerdig,
  gateForrigeOkFraScore,
  gateNesteIndeks,
  gateOkTeller,
  tomtGateForsok,
  type GateForsok,
  type GateSide,
} from "@/lib/domain/tester-live";
import { PH15Treff } from "@/components/portal/precision/PH15TestGjennomfor";
import { avbrytTestSession, fullforTestSession, lagreSteg, startTestSession } from "./actions";

export function GateLiveArtefakt({
  testId,
  sessionId: gjenopptattSessionId,
  gjenopptattForsok,
  testNavn,
  shots,
  hasMissSide,
  maal,
  forrigeScore,
}: {
  testId: string;
  sessionId: string | null;
  /** Førte forsøk fra en pågående TestSession (T5-gjenopptak). */
  gjenopptattForsok: GateForsok[] | null;
  /** Testens navn, f.eks. «Putt Gate». */
  testNavn: string;
  shots: number;
  hasMissSide: boolean;
  /** Målet fra protokollens target-tekst («8» i «≥ 8 / 10»). Ingen tall → skjules. */
  maal: number | null;
  /** Forrige lagrede hit-rate-score (0–100) — null uten forrige forsøk. */
  forrigeScore: number | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [forsok, setForsok] = useState<GateForsok[]>(
    gjenopptattForsok && gjenopptattForsok.length === shots ? gjenopptattForsok : tomtGateForsok(shots),
  );
  const [sessionId, setSessionId] = useState<string | null>(gjenopptattSessionId);
  const [feil, setFeil] = useState<string | null>(null);

  const testHref = `/portal/tren/tester/${testId}`;
  const idx = gateNesteIndeks(forsok, hasMissSide);
  const ferdig = gateErFerdig(forsok, hasMissSide);
  const okCount = gateOkTeller(forsok);
  const venterPaaSide = hasMissSide && idx < shots && forsok[idx]?.ok === false;
  const forrigeOk = forrigeScore !== null ? gateForrigeOkFraScore(forrigeScore, shots) : null;

  async function sikreSesjon(): Promise<string | null> {
    if (sessionId) return sessionId;
    const res = await startTestSession({ testId });
    if (res.ok) {
      setSessionId(res.sessionId);
      return res.sessionId;
    }
    return null;
  }

  function speil(i: number, f: GateForsok) {
    void (async () => {
      const sid = await sikreSesjon();
      if (!sid) return;
      try {
        await lagreSteg({
          sessionId: sid,
          stegIndex: i,
          verdier: { ok: f.ok, ...(hasMissSide ? { miss_side: f.side } : {}) },
        });
      } catch {
        // Best effort — klientstaten er fasit til fullføring.
      }
    })();
  }

  function registrer(ok: boolean) {
    if (idx >= shots || pending || venterPaaSide) return;
    const neste = [...forsok];
    neste[idx] = { ok, side: null };
    setForsok(neste);
    setFeil(null);
    speil(idx, neste[idx]);
  }

  function velgSide(side: GateSide) {
    if (!venterPaaSide || pending) return;
    const neste = [...forsok];
    neste[idx] = { ...neste[idx], side };
    setForsok(neste);
    speil(idx, neste[idx]);
  }

  function angre() {
    if (pending || ferdig) return;
    // Bom som venter på side er det siste slaget; ellers er det forrige slag.
    const siste = venterPaaSide ? idx : idx - 1;
    if (siste < 0) return;
    const neste = [...forsok];
    neste[siste] = { ok: null, side: null };
    setForsok(neste);
    speil(siste, neste[siste]);
  }

  function lagre() {
    if (!ferdig || pending) return;
    const sendes = forsok.map((f, i) => ({
      nr: i + 1,
      verdier: { ok: f.ok, ...(hasMissSide ? { miss_side: f.side } : {}) },
    }));
    setFeil(null);
    startTransition(async () => {
      try {
        const res = await fullforTestSession({ testId, forsok: sendes });
        // Ved suksess redirecter handlingen; kommer vi hit er noe galt.
        if (res && res.ok === false) setFeil(res.error);
      } catch {
        router.push(testHref);
      }
    });
  }

  function avslutt() {
    startTransition(async () => {
      if (sessionId) {
        try {
          await avbrytTestSession({ sessionId });
        } catch {
          // Best effort.
        }
      }
      router.push(testHref);
    });
  }

  const slag = forsok.map((f) => (f.ok === null ? null : { ok: f.ok, side: f.side }));

  return (
    <PH15Treff
      tilstand={slag.every((s) => s === null) ? "tom" : "data"}
      tittel={testNavn}
      meta={`${testNavn} · ${shots} slag`}
      shots={shots}
      slag={slag}
      venterPaaSide={venterPaaSide}
      harSide={hasMissSide}
      maal={maal}
      deltaForrige={forrigeOk !== null ? okCount - forrigeOk : null}
      onTreff={() => registrer(true)}
      onBom={() => registrer(false)}
      onSide={velgSide}
      onAngre={angre}
      onLagre={lagre}
      onAvslutt={avslutt}
      opptatt={pending}
      lagreFeil={feil ? { tittel: "Resultatet ble ikke lagret", tekst: feil, kode: "LAGRING · TEST" } : null}
    />
  );
}
