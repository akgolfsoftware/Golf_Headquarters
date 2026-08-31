"use client";

/**
 * TE-04/TE-05 — Gate-artefakt (C4/Loop 8). Live-tapper for gate-protokoller
 * (Putt Gate · Driver Gate · Wedge Gate · Nærspill Gate · VISA Express —
 * scoringMode "hit-rate", ett steg med checkbox-feltet «ok», se
 * `detectLiveArtefaktKind` i src/lib/domain/tester-live.ts).
 *
 * Fasit: designsystem/train-lock/TE-04 Live Gate.dc.html
 * Fasit: designsystem/train-lock/TE-04L Live Gate lys.dc.html
 * Fasit: designsystem/train-lock/TE-05 Gate ferdig.dc.html — 10-prikk-rekke,
 * Gjennom/Bom, V|H kun når protokollen har et miss_side-felt (kun Putt Gate
 * i dag). Fullført er ALDRI grønn (TL.warm + hake, CLAUDE.md invariant 2).
 * PX-3 (28.08): sammenlignet mot TE-04L pixel for pixel — én reell feil
 * funnet og rettet: pending-prikkens og V|H-knappenes ring brukte `TL.hair`
 * (8 % kant, delelinjer) der fasiten bruker en sterkere 24 %-kant
 * (`#0000003D` lys / `#FFFFFF3D` mørk) — det finnes allerede som
 * `TL.draftBorder` (samme verdier, se train-lock-tokens.css), brukt der nå.
 * Ingen ny token. Øvrige verdier (TL.dock på tap-knappene, TL.text/TL.scene
 * på fylte prikker, TL.mute på caps/meta) stemte allerede eksakt mot begge
 * tema. TL er ren token-referanse — lys kommer automatisk via
 * `html[data-v2-tema]`-kaskaden, ingen egen lys-gren i denne filen.
 *
 * Artefakt uten dock: siden ligger allerede i (fullscreen)-gruppen — ingen
 * ny rute, kun riktig visuelt uttrykk for gate-protokollene. Andre
 * protokolltyper er urørt (ScorekortKlient, «ikke hele TN-batteriet»).
 *
 * Ren TL.* (Train-lock) — komponenten er ny og har ingen T.*-visning å
 * videreføre, se presedens i GodkjenningKort (PortalChatHjem.tsx, Loop 3T/B6).
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import {
  gateBomTeller,
  gateErFerdig,
  gateForrigeOkFraScore,
  gateNesteIndeks,
  gateOkTeller,
  tomtGateForsok,
  type GateForsok,
  type GateSide,
} from "@/lib/domain/tester-live";
import { avbrytTestSession, fullforTestSession, lagreSteg, startTestSession } from "./actions";

export function GateLiveArtefakt({
  testId,
  sessionId: gjenopptattSessionId,
  gjenopptattForsok,
  caption,
  shots,
  hasMissSide,
  maal,
  forrigeScore,
}: {
  testId: string;
  sessionId: string | null;
  /** Førte forsøk fra en pågående TestSession (T5-gjenopptak). */
  gjenopptattForsok: GateForsok[] | null;
  /** Caps-linjen i toppen, f.eks. «TEST · PUTT GATE · 6 CM PORT · 40 CM · SONE 50 CM». */
  caption: string;
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
  const [ferdig, setFerdig] = useState(false);

  const idx = gateNesteIndeks(forsok, hasMissSide);
  const okCount = gateOkTeller(forsok);
  const bomCount = gateBomTeller(forsok);
  const venterPaaSide = hasMissSide && idx < shots && forsok[idx]?.ok === false;

  async function sikreSesjon(): Promise<string | null> {
    if (sessionId) return sessionId;
    const res = await startTestSession({ testId });
    if (res.ok) {
      setSessionId(res.sessionId);
      return res.sessionId;
    }
    return null;
  }

  function lagreForsokBestEffort(i: number, neste: GateForsok[]) {
    void (async () => {
      const sid = await sikreSesjon();
      if (!sid) return;
      const f = neste[i];
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
    if (idx >= shots || pending) return;
    const neste = [...forsok];
    neste[idx] = { ok, side: null };
    setForsok(neste);
    lagreForsokBestEffort(idx, neste);
    // Gjennom, eller Bom uten miss_side-krav → gå videre. Bom MED miss_side venter på V|H.
    if (ok || !hasMissSide) {
      if (gateErFerdig(neste, hasMissSide)) setFerdig(true);
    }
  }

  function velgSide(side: GateSide) {
    if (!venterPaaSide || pending) return;
    const neste = [...forsok];
    neste[idx] = { ...neste[idx], side };
    setForsok(neste);
    lagreForsokBestEffort(idx, neste);
    if (gateErFerdig(neste, hasMissSide)) setFerdig(true);
  }

  const forrigeOk = forrigeScore !== null ? gateForrigeOkFraScore(forrigeScore, shots) : null;

  function lukk() {
    const sendes = forsok.map((f, i) => ({
      nr: i + 1,
      verdier: { ok: f.ok, ...(hasMissSide ? { miss_side: f.side } : {}) },
    }));
    startTransition(async () => {
      try {
        await fullforTestSession({ testId, forsok: sendes });
      } catch {
        // fullforTestSession redirecter ved suksess (kaster NEXT_REDIRECT) —
        // en reell feil lander her og vises som toast på testsiden ved retry.
        router.push(`/portal/tren/tester/${testId}`);
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
      router.push(`/portal/tren/tester/${testId}`);
    });
  }

  if (ferdig) {
    return (
      <GateFerdigArtefakt
        okCount={okCount}
        shots={shots}
        forrigeOk={forrigeOk}
        pending={pending}
        onLukk={lukk}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: TL.scene,
        color: TL.text,
        fontFamily: TL.font.sans,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, padding: "16px 20px 8px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          <span
            style={{
              fontSize: TL.storrelse.caps,
              fontWeight: TL.vekt.caps,
              letterSpacing: TL.track.caps,
              textTransform: "uppercase",
              color: TL.mute,
            }}
          >
            {caption}
          </span>
          <button
            type="button"
            onClick={avslutt}
            disabled={pending}
            style={{
              appearance: "none",
              background: "transparent",
              border: 0,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: TL.mute,
            }}
          >
            Avslutt
          </button>
        </div>

        <h1 style={{ margin: "10px 0 0", fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>
          {`Putt ${Math.min(idx + 1, shots)} av ${shots}`}
        </h1>
        <div style={{ marginTop: 4, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
          {`OK ${okCount} · Bom ${bomCount}`}
          {maal !== null && ` · mål ${maal} OK`}
        </div>

        <div style={{ marginTop: 28, display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontSize: 104, fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
            {Math.min(idx + 1, shots)}
          </span>
          <span style={{ fontSize: 26, color: TL.mute }}>{`av ${shots}`}</span>
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {forsok.map((f, i) => (
            <GateDot key={i} nr={i + 1} tilstand={i < idx ? (f.ok ? "ok" : "bom") : "pending"} />
          ))}
        </div>
      </div>

      <div style={{ padding: "10px 20px 0" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <TapKnapp label="Gjennom" onClick={() => registrer(true)} disabled={pending || idx >= shots || venterPaaSide} />
          <TapKnapp label="Bom" onClick={() => registrer(false)} disabled={pending || idx >= shots || venterPaaSide} />
        </div>
        {hasMissSide && (
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <SideKnapp label="V" aktiv={venterPaaSide} onClick={() => velgSide("V")} />
            <SideKnapp label="H" aktiv={venterPaaSide} onClick={() => velgSide("H")} />
          </div>
        )}
        <div style={{ marginTop: 8, textAlign: "center", fontSize: 11, color: TL.mute }}>
          {venterPaaSide
            ? "Bom registrert · velg V eller H"
            : `Registrer putt ${Math.min(idx + 1, shots)} · OK eller Bom${hasMissSide ? " · ved Bom velg V | H" : ""}`}
        </div>
        <div style={{ height: 30, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 8 }}>
          <div
            style={{
              width: `${Math.max(20, (idx / shots) * 140)}px`,
              maxWidth: 140,
              height: 5,
              borderRadius: 3,
              background: TL.text,
              transition: `width ${TL.motion.kort} ${TL.motion.ease}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function GateDot({ nr, tilstand }: { nr: number; tilstand: "ok" | "bom" | "pending" }) {
  const fylt = tilstand !== "pending";
  return (
    <div
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
        background: fylt ? TL.text : "transparent",
        color: fylt ? TL.scene : TL.mute,
        boxShadow: fylt ? "none" : `inset 0 0 0 1px ${TL.draftBorder}`,
        opacity: tilstand === "bom" ? 0.55 : 1,
      }}
    >
      {nr}
    </div>
  );
}

function TapKnapp({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        height: 64,
        borderRadius: TL.radius.card,
        background: TL.dock,
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        fontWeight: 700,
        color: TL.text,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {label}
    </button>
  );
}

function SideKnapp({ label, aktiv, onClick }: { label: string; aktiv: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!aktiv}
      style={{
        flex: 1,
        height: 44,
        borderRadius: TL.radius.card,
        background: "transparent",
        boxShadow: `inset 0 0 0 1px ${TL.draftBorder}`,
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 700,
        color: TL.mute,
        cursor: aktiv ? "pointer" : "default",
        opacity: aktiv ? 1 : 0.4,
      }}
    >
      {label}
    </button>
  );
}

/** TE-05 — Gate ferdig. Fullført er ALDRI grønn: TL.warm-ring + hake. */
function GateFerdigArtefakt({
  okCount,
  shots,
  forrigeOk,
  pending,
  onLukk,
}: {
  okCount: number;
  shots: number;
  forrigeOk: number | null;
  pending: boolean;
  onLukk: () => void;
}) {
  const delta = forrigeOk !== null ? okCount - forrigeOk : null;
  const deltaTekst = useMemo(() => {
    if (delta === null) return "Første gjennomføring registrert.";
    if (delta > 0) return `+${delta} OK mot forrige.`;
    if (delta < 0) return `${delta} OK mot forrige.`;
    return "Samme som forrige forsøk.";
  }, [delta]);

  const dato = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Oslo" }).format(new Date());

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: TL.scene,
        color: TL.text,
        fontFamily: TL.font.sans,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, padding: "16px 20px 8px", overflowY: "auto" }}>
        <span
          style={{
            fontSize: TL.storrelse.caps,
            fontWeight: TL.vekt.caps,
            letterSpacing: TL.track.caps,
            textTransform: "uppercase",
            color: TL.mute,
          }}
        >
          {`Test levert · ${dato}`}
        </span>
        <h1 style={{ margin: "6px 0 0", fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Gate
        </h1>

        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              boxShadow: `inset 0 0 0 1px ${TL.warm}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="check" size={34} style={{ color: TL.warm }} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 72, fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
              {okCount}
            </span>
            <span style={{ fontSize: 26, color: TL.mute }}>{`OK av ${shots}`}</span>
          </div>
          <div style={{ fontSize: 15, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{deltaTekst}</div>
        </div>

        <div style={{ marginTop: 30, background: TL.elev, borderRadius: TL.radius.card, padding: "14px 18px" }}>
          <div
            style={{
              fontSize: TL.storrelse.caps,
              fontWeight: TL.vekt.caps,
              letterSpacing: TL.track.caps,
              textTransform: "uppercase",
              color: TL.mute,
            }}
          >
            Til Anders
          </div>
          <div style={{ marginTop: 6, fontSize: 15, lineHeight: 1.5 }}>
            Resultatet ligger i Tester-hub og i stallen.
          </div>
        </div>
      </div>

      <div style={{ padding: "10px 20px 0" }}>
        <button
          type="button"
          onClick={onLukk}
          disabled={pending}
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
          {pending ? "Lagrer…" : "Lukk"}
        </button>
        <div style={{ height: 30 }} />
      </div>
    </div>
  );
}
