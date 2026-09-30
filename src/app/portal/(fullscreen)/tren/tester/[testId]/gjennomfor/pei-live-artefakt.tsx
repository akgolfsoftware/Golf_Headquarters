"use client";

/**
 * TE-06 — Inspill Basic (C4/Loop 8). Live-tapper for PEI-protokoller med ett
 * till-mål-felt per slag (scoringMode "pei" + et avstandsfelt + et till-mål-felt,
 * se `detectLiveArtefaktKind` i src/lib/domain/tester-live.ts).
 *
 * Visningen er PH-15 i Precision Athletics (src/components/portal/precision/
 * PH15TestGjennomfor.tsx). Denne fila eier bare logikken: lagring per slag
 * (best effort), gjenopptak, fullføring og avbrudd. Andre PEI-protokoller uten
 * till-mål-felt faller til ScorekortKlient.
 *
 * Tidligere fasit (utgått, bare sporbarhet): designsystem/train-lock/TE-06 Live Innspill.dc.html.
 *
 * Endring mot før: etter siste slag fullføres testen ikke av seg selv. Spilleren
 * ser resultatet og trykker «Lagre resultat» (som tegnet i PH-15), og kan angre
 * siste slag før det.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  formatPei,
  peiNesteIndeks,
  snittPei,
  tomtPeiForsok,
  type PeiForsok,
} from "@/lib/domain/tester-live";
import { PH15Innspill } from "@/components/portal/precision/PH15TestGjennomfor";
import { avbrytTestSession, fullforTestSession, lagreSteg, startTestSession } from "./actions";

export function PeiLiveArtefakt({
  testId,
  sessionId: gjenopptattSessionId,
  gjenopptattForsok,
  testNavn,
  shots,
  malAvstandNokkel,
  tillMalNokkel,
  startMalAvstand,
}: {
  testId: string;
  sessionId: string | null;
  gjenopptattForsok: PeiForsok[] | null;
  /** Testens navn, f.eks. «Inspill Basic». */
  testNavn: string;
  shots: number;
  malAvstandNokkel: string;
  tillMalNokkel: string;
  /** Startverdi for målavstand — beste gjett fra protokollen, alltid justerbar. */
  startMalAvstand: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [forsok, setForsok] = useState<PeiForsok[]>(
    gjenopptattForsok && gjenopptattForsok.length === shots ? gjenopptattForsok : tomtPeiForsok(shots),
  );
  const [sessionId, setSessionId] = useState<string | null>(gjenopptattSessionId);
  const [malAvstand, setMalAvstand] = useState(startMalAvstand);
  const [tillMal, setTillMal] = useState(0);
  const [feil, setFeil] = useState<string | null>(null);

  const testHref = `/portal/tren/tester/${testId}`;
  const idx = peiNesteIndeks(forsok);
  const ferdige = forsok.slice(0, idx);
  const snitt = snittPei(ferdige);
  const tilMalVerdier = ferdige.map((f) => f.tillMalM).filter((v): v is number => v !== null);
  const snittTilMal = tilMalVerdier.length ? tilMalVerdier.reduce((a, b) => a + b, 0) / tilMalVerdier.length : null;

  async function sikreSesjon(): Promise<string | null> {
    if (sessionId) return sessionId;
    const res = await startTestSession({ testId });
    if (res.ok) {
      setSessionId(res.sessionId);
      return res.sessionId;
    }
    return null;
  }

  function speil(stegIndex: number, verdier: Record<string, number | null>) {
    void (async () => {
      const sid = await sikreSesjon();
      if (!sid) return;
      try {
        await lagreSteg({ sessionId: sid, stegIndex, verdier });
      } catch {
        // Best effort — klientstaten er fasit til fullføring.
      }
    })();
  }

  function registrer() {
    if (idx >= shots || pending) return;
    const neste = [...forsok];
    neste[idx] = { malAvstandM: malAvstand, tillMalM: tillMal };
    setForsok(neste);
    setTillMal(0);
    setFeil(null);
    speil(idx, { [malAvstandNokkel]: malAvstand, [tillMalNokkel]: tillMal });
  }

  function angre() {
    if (idx <= 0 || pending) return;
    const siste = idx - 1;
    const neste = [...forsok];
    neste[siste] = { malAvstandM: null, tillMalM: null };
    setForsok(neste);
    setFeil(null);
    speil(siste, { [malAvstandNokkel]: null, [tillMalNokkel]: null });
  }

  function lagre() {
    if (idx < shots || pending) return;
    const sendes = forsok.map((f, i) => ({
      nr: i + 1,
      verdier: { [malAvstandNokkel]: f.malAvstandM, [tillMalNokkel]: f.tillMalM },
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

  return (
    <PH15Innspill
      tilstand={ferdige.length === 0 ? "tom" : "data"}
      tittel={testNavn}
      meta={`${testNavn} · ${shots} slag`}
      shots={shots}
      slag={ferdige.map((f) => ({ malAvstandM: f.malAvstandM ?? 0, tillMalM: f.tillMalM ?? 0 }))}
      snittPei={snitt !== null ? formatPei(snitt) : null}
      snittTilMal={snittTilMal}
      malAvstand={malAvstand}
      tillMal={tillMal}
      onMalAvstand={setMalAvstand}
      onTillMal={setTillMal}
      onRegistrer={registrer}
      onAngre={angre}
      onLagre={lagre}
      onAvslutt={avslutt}
      opptatt={pending}
      lagreFeil={feil ? { tittel: "Resultatet ble ikke lagret", tekst: feil, kode: "LAGRING · TEST" } : null}
    />
  );
}
