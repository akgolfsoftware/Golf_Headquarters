"use client";

/**
 * TE-06 — Inspill Basic-artefakt (C4/Loop 8). Live-tapper for PEI-protokoller
 * med ett till-mål-felt per slag (scoringMode "pei" + en avstandsfelt +
 * en till-mål-felt, se `detectLiveArtefaktKind` i src/lib/domain/tester-live.ts).
 * Matcher i dag «Inspill Basic» (shot_distance_m + till_hull_m).
 *
 * Fasit: designsystem/train-lock/TE-06 Live Innspill.dc.html — «til mål»
 * som eneste inntastede tall per slag, snitt-PEI to tall (%, desimal — ALDRI
 * ett brøktall). Ekte protokoller mangler faste avstandsgrupper (spilleren
 * fører BÅDE målavstand og till-mål per slag, se PROTOCOLS.inspill_basic i
 * prisma/scripts/seed-ngf-test-protocols.ts) — derfor er «målavstand» en
 * egen, liten stepper som beholder forrige verdi til den endres, i stedet
 * for fasitens forhåndsdefinerte «145/160 m»-rader. Avvik meldt i
 * docs/natt/LOOP-C4-DONE.md. Andre PEI-protokoller (Driver Basic m.fl.) er
 * urørt — de mangler et till-mål-felt og faller til ScorekortKlient.
 *
 * Ren TL.* — se presedens i gate-live-artefakt.tsx/GodkjenningKort.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TL } from "@/lib/v2/train-lock";
import {
  formatPei,
  peiForForsok,
  peiNesteIndeks,
  snittPei,
  tomtPeiForsok,
  type PeiForsok,
} from "@/lib/domain/tester-live";
import { avbrytTestSession, fullforTestSession, lagreSteg, startTestSession } from "./actions";

const TILL_MAL_STEG = 0.1;

function fmtM(n: number): string {
  return n.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}

export function PeiLiveArtefakt({
  testId,
  sessionId: gjenopptattSessionId,
  gjenopptattForsok,
  caption,
  shots,
  malAvstandNokkel,
  tillMalNokkel,
  startMalAvstand,
}: {
  testId: string;
  sessionId: string | null;
  gjenopptattForsok: PeiForsok[] | null;
  /** Caps-linjen i toppen, f.eks. «TEST · INSPILL BASIC · 10 SLAG». */
  caption: string;
  shots: number;
  malAvstandNokkel: string;
  tillMalNokkel: string;
  /** Startverdi for målavstand-steppern — beste gjett fra protokollen, alltid justerbar. */
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

  const idx = peiNesteIndeks(forsok);
  const ferdige = forsok.slice(0, idx);
  const snitt = snittPei(ferdige);

  async function sikreSesjon(): Promise<string | null> {
    if (sessionId) return sessionId;
    const res = await startTestSession({ testId });
    if (res.ok) {
      setSessionId(res.sessionId);
      return res.sessionId;
    }
    return null;
  }

  function lagreSlag() {
    if (idx >= shots || pending) return;
    const neste = [...forsok];
    neste[idx] = { malAvstandM: malAvstand, tillMalM: tillMal };
    setForsok(neste);
    setTillMal(0);

    void (async () => {
      const sid = await sikreSesjon();
      if (!sid) return;
      try {
        await lagreSteg({
          sessionId: sid,
          stegIndex: idx,
          verdier: { [malAvstandNokkel]: malAvstand, [tillMalNokkel]: tillMal },
        });
      } catch {
        // Best effort — klientstaten er fasit til fullføring.
      }
    })();

    if (idx + 1 >= shots) {
      const sendes = neste.map((f, i) => ({
        nr: i + 1,
        verdier: { [malAvstandNokkel]: f.malAvstandM, [tillMalNokkel]: f.tillMalM },
      }));
      startTransition(async () => {
        try {
          await fullforTestSession({ testId, forsok: sendes });
        } catch {
          router.push(`/portal/tren/tester/${testId}`);
        }
      });
    }
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
      router.push(`/portal/tren/tester/${testId}`);
    });
  }

  const sisteSlag = ferdige
    .map((f, i) => ({ nr: i + 1, f }))
    .slice(-2)
    .map(({ nr, f }) => {
      const pei = peiForForsok(f);
      return {
        nr,
        malAvstandM: f.malAvstandM ?? 0,
        tillMalM: f.tillMalM ?? 0,
        peiTekst: pei !== null ? formatPei(pei) : "—",
      };
    });

  return (
    <div style={{ minHeight: "100dvh", background: TL.scene, color: TL.text, fontFamily: TL.font.sans, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: "16px 20px 8px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          <span style={{ fontSize: TL.storrelse.caps, fontWeight: TL.vekt.caps, letterSpacing: TL.track.caps, textTransform: "uppercase", color: TL.mute }}>
            {caption}
          </span>
          <button type="button" onClick={avslutt} disabled={pending} style={{ appearance: "none", background: "transparent", border: 0, cursor: "pointer", fontSize: 13, fontWeight: 600, color: TL.mute }}>
            Avslutt
          </button>
        </div>

        <h1 style={{ margin: "10px 0 0", fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>
          {`Slag ${Math.min(idx + 1, shots)} av ${shots}`}
        </h1>
        <div style={{ marginTop: 4, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
          {snitt !== null ? `snitt ${formatPei(snitt)}` : "snitt — · ingen slag registrert ennå"}
        </div>

        <div style={{ marginTop: 28, display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontSize: 104, fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
            {Math.min(idx + 1, shots)}
          </span>
          <span style={{ fontSize: 26, color: TL.mute }}>{`av ${shots}`}</span>
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Array.from({ length: shots }, (_, i) => (
            <div
              key={i}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                background: i < idx ? TL.text : "transparent",
                color: i < idx ? TL.scene : TL.mute,
                boxShadow: i < idx ? "none" : `inset 0 0 0 1px ${TL.hair}`,
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {sisteSlag.length > 0 && (
          <>
            <div style={{ marginTop: 22, fontSize: TL.storrelse.caps, fontWeight: TL.vekt.caps, letterSpacing: TL.track.caps, textTransform: "uppercase", color: TL.mute }}>
              Siste slag · till mål
            </div>
            <div style={{ marginTop: 4 }}>
              {sisteSlag.map((s) => (
                <div key={s.nr} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${TL.hair}` }}>
                  <span style={{ fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{`${s.nr} · ${fmtM(s.malAvstandM)} m`}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{`${fmtM(s.tillMalM)} m · ${s.peiTekst}`}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ padding: "10px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: TL.mute, flex: "none" }}>Målavstand</span>
          <StepperLite verdi={malAvstand} steg={5} min={0} onEndre={setMalAvstand} enhet="m" />
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <RundKnapp label="−" onClick={() => setTillMal((v) => Math.max(0, Math.round((v - TILL_MAL_STEG) * 100) / 100))} />
          <div style={{ flex: 1, height: 64, borderRadius: TL.radius.card, background: TL.dock, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {`${fmtM(tillMal)} m`}
          </div>
          <RundKnapp label="+" onClick={() => setTillMal((v) => Math.round((v + TILL_MAL_STEG) * 100) / 100)} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            onClick={lagreSlag}
            disabled={pending || idx >= shots}
            style={{
              height: 48,
              width: "100%",
              borderRadius: 999,
              background: TL.fill,
              color: TL.onFill,
              border: "none",
              fontSize: 16,
              fontWeight: 700,
              cursor: pending ? "default" : "pointer",
              opacity: pending ? 0.6 : 1,
            }}
          >
            {pending ? "Lagrer…" : `Lagre slag ${Math.min(idx + 1, shots)}`}
          </button>
        </div>
        <div style={{ marginTop: 8, textAlign: "center", fontSize: 11, color: TL.mute }}>
          {`Slag ${Math.min(idx + 1, shots)} · mål ${fmtM(malAvstand)} m · juster till mål i meter`}
        </div>
        <div style={{ height: 30, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 8 }}>
          <div style={{ width: `${Math.max(20, (idx / shots) * 140)}px`, maxWidth: 140, height: 5, borderRadius: 3, background: TL.text, transition: `width ${TL.motion.kort} ${TL.motion.ease}` }} />
        </div>
      </div>
    </div>
  );
}

function RundKnapp({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 64,
        height: 64,
        flex: "none",
        borderRadius: TL.radius.card,
        background: TL.dock,
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        fontWeight: 700,
        color: TL.text,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function StepperLite({
  verdi,
  steg,
  min,
  enhet,
  onEndre,
}: {
  verdi: number;
  steg: number;
  min: number;
  enhet: string;
  onEndre: (v: number) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <button
        type="button"
        onClick={() => onEndre(Math.max(min, verdi - steg))}
        style={{ width: 28, height: 28, borderRadius: 8, background: TL.dock, border: "none", color: TL.text, cursor: "pointer", fontSize: 13, fontWeight: 700 }}
      >
        −
      </button>
      <span style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums", minWidth: 48, textAlign: "center" }}>
        {`${fmtM(verdi)} ${enhet}`}
      </span>
      <button
        type="button"
        onClick={() => onEndre(verdi + steg)}
        style={{ width: 28, height: 28, borderRadius: 8, background: TL.dock, border: "none", color: TL.text, cursor: "pointer", fontSize: 13, fontWeight: 700 }}
      >
        +
      </button>
    </div>
  );
}
