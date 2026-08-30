"use client";

/**
 * PortalChatHjem — PlayerHQ "I dag", chat-først (designport steg 7 PR-A,
 * retter avviksliste A1 mot plan-designport-alle-skjermer.md).
 * Erstatter HjemV2 som innhold på /portal. V2Shell (rail/bunn-nav) er uendret
 * rundt denne komponenten — se src/app/portal/page.tsx.
 * Lys: designsystem/train-lock/B3 Lys nøkkelskjermer.dc.html (Lys PH-01
 * I dag) — allerede tunet i C8 (#636); PX-7 (29.08.2026) verifiserte på
 * nytt at ingen ny hardkodet hex er lekket inn siden.
 *
 * PP-1.1 (2026-08-09): loop ink underline, btn.ink=TL.fill, mic 60px clay, composer bg canvas.
 * Matcher Paper-fasiten (designsystem/paper/fase1/playerhq-chat-desktop.html)
 * strukturelt: rail(V2Shell) + tråd(≤720px lesebredde) + FAST artefaktpanel
 * 360px ved ≥1121px, composer festet nederst. Bygget med EKSISTERENDE
 * v2-primitiver (SamtaleBoble/ForslagRad fra components/v2/samtale.tsx,
 * Composer fra components/v2/composer.tsx (PP-B3), BunnArk) i stedet for å
 * kopiere Paper sin egen rå CSS — appen står fortsatt på v2-tokens
 * (CLAUDE.md invariant 2).
 *
 * A1-rettelser (2026-08-06): (1) artefaktpanelet er nå en FAST grid-kolonne på
 * desktop — ikke en toggle (useErMobil delt med ArtefaktPanel, samme
 * brytepunkt 1120px som fasiten). (2) «Én ting nå»-systeminnlegget («Dagens
 * økt starter …» + «Start økta» som ink; mic i composer eier TL.fill) vises når dagens økt
 * ikke er startet. (3) Ærlig tom tilstand (ingen fabrikkerte påstander — kun
 * data.week/gjennomfore) med tre veier videre. (4) Toppheader viser
 * navn · kategori (ak-kategori.ts) · SG total (ekte kpiStats) · dato (Oslo,
 * beregnet server-side i page.tsx). (5) Fangst-knapp i topplinja åpner
 * FangstModal.
 *
 * FØR/UNDER/ETTER mode-strip (Paper loop) — lenker til reell økt når tilgjengelig (se
 * plan-designport-alle-skjermer.md steg 7 PR1, punkt 9) — løkken lenker til
 * dagens faktiske live-økt-ruter når de finnes, i stedet for å late som en
 * modus-veksling som ikke er bygget.
 */

import { useEffect, useRef, useState, useTransition, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TL } from "@/lib/v2/train-lock";
import { TemaHeaderKnapp } from "@/components/v2/tema";
import { useToppbarHoyde } from "@/components/v2/toppbar-hoyde";
import { SamtaleBoble, SamtaleSkriver, SamtaleFeil, ForslagRad } from "@/components/v2/samtale";
import { Composer } from "@/components/v2/composer";
import { Icon } from "@/components/v2/icon";
import { kategoriFraSnittscore } from "@/lib/domain/ak-kategori";
import { formatSg } from "@/lib/sg";
import type { DashboardData } from "@/app/portal/actions";
import type { GjennomforeData } from "@/lib/portal-gjennomfore/gjennomfore-data";
import type { PlayerDayResult, PlayerDaySession } from "@/lib/workbench/wb-actions";
import { resolvePlayerApproval } from "@/lib/workbench/wb-actions";
import type { SessionStatus } from "@/lib/domain/workbench/types";
import { UI as WB_UI, PYRAMID_LABEL, formatMinutes, formatTime } from "@/lib/domain/workbench/labels";
import { harHake, STATUS_CAPS } from "@/components/workbench/wb-visuelt";
import { usePortalChat } from "./use-portal-chat";
import { PortalStegListe } from "./PortalStegListe";
import { PortalHvorforDette } from "./PortalHvorforDette";
import { ArtefaktPanel, useErMobil } from "./ArtefaktPanel";
import { RundeLiveArtefakt } from "@/components/portal/runde-logg/runde-live-artefakt";
import { PushOptInBanner } from "@/components/portal/push-opt-in-banner";
import { FangstSheet } from "./FangstSheet";
import type { PortalChatMessage } from "./types";
import type { TrackManTeaser } from "@/lib/trackman/teaser";
import type { TesterLiveKort as TesterLiveKortData } from "@/lib/portal-tester/tester-live-kort";
import { IDagITidenArk } from "@/components/portal/v2/kalender/IDagITidenArk";
import type { KalenderHendelse } from "@/lib/domain/kalender-lag";

const FORSLAG = ["Hva skal jeg trene i dag?", "Hva var resultatet sist?", "Hva står på ukeplanen?"];

function meldingTekst(m: PortalChatMessage): string {
  return m.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function LoopNav({ gjennomfore }: { gjennomfore: GjennomforeData }) {
  /** Mode-style FØR/UNDER/ETTER (Paper live loop), with real session hrefs when available. */
  const under = gjennomfore.nesteOkt?.status === "now" ? gjennomfore.nesteOkt : null;
  const etter = gjennomfore.fullfortIdag.at(-1) ?? null;
  const forste = gjennomfore.nesteOkt;

  const aktiv: "for" | "under" | "etter" = under ? "under" : etter && !forste ? "etter" : "for";

  const steg: Array<{
    id: "for" | "under" | "etter";
    label: string;
    sub: string;
    href: string | null;
  }> = [
    {
      id: "for",
      label: "FØR",
      sub: "planlegg",
      href: forste && forste.status === "upcoming" ? forste.href : null,
    },
    {
      id: "under",
      label: "UNDER",
      sub: "live-økt",
      href: under?.href ?? null,
    },
    {
      id: "etter",
      label: "ETTER",
      sub: "oppsummer",
      href: etter?.href ?? null,
    },
  ];

  return (
    <nav
      aria-label="Sløyfen før, under og etter økta"
      data-od-id="loop-nav"
      data-paper-loop
      style={{
        display: "flex",
        alignItems: "stretch",
        width: "100%",
        borderBottom: `1px solid ${TL.hair}`,
        background: TL.scene,
      }}
    >
      {steg.map((s, i) => {
        const on = s.id === aktiv;
        const kan = Boolean(s.href);
        const cell = (
          <span
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 48,
              padding: "8px 6px",
              background: on ? TL.dock : "transparent",
              /* Paper .loop a[aria-current]: inset ink underline — clay is mic-only on Hjem */
              boxShadow: on ? `inset 0 -2px 0 0 ${TL.text}` : "none",
              color: on ? TL.text : TL.mute,
              fontFamily: TL.font.mono,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: kan || on ? 1 : 0.45,
              pointerEvents: kan || on ? "auto" : "none",
              textAlign: "center",
            }}
          >
            {s.label}
            <small
              style={{
                fontFamily: TL.font.sans,
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: 0,
                textTransform: "none",
                color: on ? TL.mute : TL.mute,
                marginTop: 2,
              }}
            >
              {s.sub}
            </small>
          </span>
        );
        return (
          <span key={s.id} style={{ display: "flex", flex: 1, alignItems: "stretch" }}>
            {s.href && !on ? (
              <Link href={s.href} style={{ textDecoration: "none", flex: 1, display: "flex" }} data-od-id={`loop-${s.id}`}>
                {cell}
              </Link>
            ) : (
              <span aria-current={on ? "step" : undefined} data-od-id={`loop-${s.id}`} style={{ flex: 1, display: "flex" }}>
                {cell}
              </span>
            )}
            {i < steg.length - 1 && (
              <span style={{ color: TL.mute, fontSize: 10, alignSelf: "center", padding: "0 2px", flex: "none" }} aria-hidden>
                →
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

function DagensOktInnhold({ gjennomfore }: { gjennomfore: GjennomforeData }) {
  const okt = gjennomfore.nesteOkt ?? gjennomfore.fullfortIdag[0] ?? null;
  if (!okt) {
    return <p style={{ fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute }}>Ingen økt registrert i dag.</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div style={{ fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600, color: TL.text }}>{okt.tittel}</div>
        <div style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute, marginTop: 4 }}>{okt.meta}</div>
      </div>
      {okt.drillNavn.length > 0 && (
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
          {okt.drillNavn.map((navn, i) => (
            <li key={i} style={{ display: "flex", gap: 8, fontSize: 12.5, color: TL.text, padding: "6px 0", borderTop: i > 0 ? `1px solid ${TL.hair}` : undefined }}>
              <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>{i + 1}</span>
              {navn}
            </li>
          ))}
        </ul>
      )}
      {/* TL.fill — bekreftende, IKKE «Én ting nå»-monopolet (TL.fill). Panelet
          er nå alltid synlig på desktop, så knappen her må aldri konkurrere
          med tråd-banneret under — matcher fasitens .btn.ink vs .btn.now. */}
      <Link
        href={okt.href}
        className="v2-press v2-focus"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 44,
          borderRadius: 10,
          background: TL.fill,
          color: TL.onFill,
          fontFamily: TL.font.sans,
          fontSize: 13,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        {okt.status === "now" ? "Fortsett økta" : okt.status === "done" ? "Se oppsummering" : "Start økta"}
      </Link>
    </div>
  );
}

/** «Én ting nå» — systemets uoppfordrede innlegg. Start = ink; accent = capture-mic. */
function EnTingNaBanner({ okt, klokke, onSePlan }: { okt: NonNullable<GjennomforeData["nesteOkt"]>; klokke: string; onSePlan: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontFamily: TL.font.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>
        systemet, uoppfordret · {klokke}
      </div>
      <div
        style={{
          border: `1px solid ${TL.hair}`,
          borderRadius: TL.radius.card,
          background: TL.dock,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ fontFamily: TL.font.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>Én ting nå</div>
        <h3 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 16, fontWeight: 600, color: TL.text }}>
          Dagens økt {okt.relTidTekst.startsWith("Pågår") ? okt.relTidTekst.toLowerCase() : `starter ${okt.relTidTekst}`}
        </h3>
        <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
          {okt.sted} er booket <span style={{ fontFamily: TL.font.mono }}>{okt.tid}</span>. Du trenger ikke gjøre noe før økta starter.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
          <Link
            href={okt.href}
            className="v2-press v2-focus"
            data-od-id="start-planned-session"
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: 44,
              padding: "0 16px",
              borderRadius: TL.radius.row,
              /* Paper .btn.ink — ink CTA; mic owns TL.fill on Hjem */
              background: TL.fill,
              color: TL.onFill,
              fontFamily: TL.font.sans,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Start økta
          </Link>
          <button
            type="button"
            onClick={onSePlan}
            className="v2-press v2-focus"
            style={{
              minHeight: 44,
              padding: "0 16px",
              borderRadius: TL.radius.row,
              border: `1px solid ${TL.hair}`,
              background: "transparent",
              color: TL.text,
              fontFamily: TL.font.sans,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Se hva som står i den
          </button>
        </div>
      </div>
    </div>
  );
}

/** Paper empty — outline acts only; accent lives on composer capture mic. */
function TomTilstand({
  ukeHarOkter,
  weekNumber,
  onForslag,
}: {
  ukeHarOkter: boolean;
  weekNumber: number;
  onForslag: (s: string) => void;
}) {
  /* Paper .empty + .btn (ink/ghost) — not elevated white card */
  const btn: CSSProperties = {
    minHeight: 48,
    padding: "0 16px",
    borderRadius: TL.radius.card,
    border: `1px solid ${TL.hair}`,
    background: TL.elev,
    color: TL.text,
    fontFamily: TL.font.sans,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  };
  return (
    <div
      data-od-id="state-empty"
      style={{
        alignSelf: "stretch",
        maxWidth: 520,
        width: "100%",
        padding: "32px 24px",
        borderRadius: TL.radius.card,
        border: `1px dashed ${TL.hair}`,
        background: TL.dock,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 16,
      }}
    >
      <div>
        <h3
          style={{
            margin: 0,
            fontFamily: TL.font.sans,
            fontSize: 15,
            fontWeight: 600,
            color: TL.text,
            lineHeight: 1.3,
          }}
        >
          {ukeHarOkter ? "Ingen økt i dag" : `Ingen økter i uke ${weekNumber} ennå`}
        </h3>
        <p
          style={{
            margin: "8px 0 0",
            fontFamily: TL.font.sans,
            fontSize: 14,
            color: TL.mute,
            lineHeight: 1.55,
            maxWidth: "46ch",
          }}
        >
          Det betyr ikke at du står stille. Lag en økt du rekker i dag, så
          bygger vi videre derfra.
        </p>
      </div>
      {/* Signering 12.08: tom tilstand hadde SEKS veier videre — tre knapper og
          tre lenker, alle like tunge. Fasiten har én. De andre veiene er ikke
          borte: planen og kalenderen ligger i bunn-navigasjonen, og fangst er
          mikrofonen i skrivefeltet, som er skjermens aksenthandling. */}
      <button
        type="button"
        onClick={() => onForslag("Lag en 25-minutters økt")}
        className="v2-press v2-focus"
        data-od-id="empty-short"
        style={{ ...btn, background: TL.text, color: TL.scene, border: "none" }}
      >
        Lag en 25-minutters økt
      </button>
    </div>
  );
}

/**
 * «Pågår test»-kortet på I dag (C4/Loop 8) — samme presedens som
 * GodkjenningKort under: pure TL.*, ingen T.*-visning å videreføre for et
 * helt nytt kort. Skjules helt uten en pågående gate-/PEI-test-live-økt
 * (`getTesterLiveKort`). Lenker rett inn i artefaktet (TE-04/06), som
 * gjenopptar økta der spilleren slapp (T5-gjenopptak).
 */
function TesterLiveKort({ testerLive }: { testerLive: TesterLiveKortData }) {
  return (
    <Link
      href={`/portal/tren/tester/${testerLive.testId}/gjennomfor`}
      data-od-id="ph-tester-live-kort"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        border: `1px solid ${TL.hair}`,
        borderRadius: TL.radius.card,
        background: TL.elev,
        padding: "12px 14px",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <span
        style={{
          fontFamily: TL.font.mono,
          fontSize: 10,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: TL.mute,
        }}
      >
        Pågår · {testerLive.testNavn} · {testerLive.fremdrift}
      </span>
      <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text }}>Fortsett testen ›</span>
    </Link>
  );
}

/**
 * PH-01c «TrackMan-kort på I dag» (B7). Dempet kort — hairline-kant, ingen
 * elev-fyllflate, dempet tekst — rett under Workbench-artefaktet.
 * Skjules HELT når spilleren ikke har noen TrackMan-økt (PH-01d): page.tsx
 * sender `null` som prop da, og komponenten kalles ikke i det hele tatt (se
 * kallstedet). Hele kortet er trykkbart → TM-11.
 *
 * C8: hele I dag-skjermen leser TL.* — ingen T.* her.
 */
function TrackManTeaserKort({ trackman }: { trackman: TrackManTeaser }) {
  return (
    <Link
      href={`/portal/analysere/trackman/${trackman.sessionId}`}
      data-od-id="ph-01c-trackman-kort"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        border: `1px solid ${TL.hair}`,
        borderRadius: TL.radius.card,
        background: "transparent",
        padding: "12px 14px",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <span style={{ fontFamily: TL.font.mono, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: TL.mute }}>
        Siste TrackMan · {trackman.club} · {trackman.dateText}
      </span>
      <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.4 }}>{trackman.sentence}</p>
      <span style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute }}>Se spredning ›</span>
    </Link>
  );
}

/**
 * Fasit: designsystem/train-lock/WB-04 Player godkjenning 3 skall.dc.html
 * (rammen «WB-04 iPhone forslag» — Mac/iPad-rammene i samme fil er Agency-
 * siden, PX-2-scope). Godkjenningskort (Loop 3T/B6, WB-10/WB-04-mønster) —
 * én økt med `needsPlayerApproval`. «Godta» er eneste sted #30D158 (TL.ok)
 * forekommer i denne flyten (CLAUDE.md invariant 2); «Avvis» er en nøytral
 * ghost-knapp, ALDRI rød. Avvis skjuler økten (hiddenByPlayer) — sletter
 * aldri.
 *
 * GAP mot fasiten (dokumentert, ikke bygget — data/motor mangler,
 * anti-scope): fasitens forslag-ark viser drill-linjene i klartekst og en
 * avatar+navn-linje («Anders la inn en ny økt · i går 20.14») — `PlayerDaySession`
 * har kun `drillsCount` (ikke drill-titler) og ingen forfatter-/tidsstempel-
 * felt. Etter-tilstandene («Godtatt»/«Avvist») i fasiten samler en
 * avvis-begrunnelse og tilbyr Angre — `resolvePlayerApproval` har ingen
 * slike parametre. Å legge dem til er domenearbeid utenfor PX-4 (piksel,
 * ikke funksjon). Kortet under bruker det som FINNES i dag (tittel, tid,
 * pyramide, coach-notat) i fasitens geometri.
 *
 * C8: hele I dag-skjermen leser TL.* — «Godta» er eneste TL.ok.
 */
function GodkjenningKort({ okt, onFerdig }: { okt: PlayerDaySession; onFerdig: (id: string) => void }) {
  const router = useRouter();
  const [travel, start] = useTransition();
  const [handling, setHandling] = useState<"ACCEPTED" | "REJECTED" | null>(null);

  const kilde = okt.origin === "GROUP" ? WB_UI.approvalFromGroup : WB_UI.approvalFromCoach;

  function svar(decision: "ACCEPTED" | "REJECTED") {
    setHandling(decision);
    start(async () => {
      try {
        const res = await resolvePlayerApproval({ sessionId: okt.id, decision });
        if (!res.ok) {
          toast.error(res.error);
          setHandling(null);
          return;
        }
        toast.success(decision === "ACCEPTED" ? WB_UI.approvalAccepted : WB_UI.approvalRejected);
        onFerdig(okt.id);
        router.refresh();
      } catch {
        toast.error(WB_UI.unknownError);
        setHandling(null);
      }
    });
  }

  return (
    <div
      data-od-id="wb-idag-godkjenning"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        border: `1px solid ${TL.hair}`,
        borderRadius: TL.radius.card,
        background: TL.elev,
        padding: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: TL.warm, flex: "none" }} aria-hidden="true" />
        <span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>
          {kilde}
        </span>
      </div>
      <div>
        <h3 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>
          {okt.title}
        </h3>
        <p style={{ margin: "5px 0 0", fontFamily: TL.font.mono, fontSize: 12, color: TL.mute }}>
          {formatTime(okt.startMinute)} · {formatMinutes(okt.durationMinutes)}
        </p>
      </div>
      <div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: 26,
            padding: "0 10px",
            borderRadius: TL.radius.pill,
            background: TL.fill,
            color: TL.onFill,
            fontFamily: TL.font.sans,
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {PYRAMID_LABEL[okt.pyramid as keyof typeof PYRAMID_LABEL] ?? okt.pyramid}
        </span>
      </div>
      {okt.notes && (
        <p
          style={{
            margin: 0,
            background: TL.dock,
            borderRadius: TL.radius.row,
            padding: "10px 12px",
            fontFamily: TL.font.sans,
            fontSize: 12.5,
            color: TL.text,
            lineHeight: 1.5,
          }}
        >
          «{okt.notes}»
        </p>
      )}
      <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, lineHeight: 1.5 }}>{WB_UI.approvalRejectHint}</p>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          type="button"
          className="v2-press v2-focus"
          disabled={travel}
          onClick={() => svar("ACCEPTED")}
          data-od-id="wb-idag-godkjenning-godta"
          style={{
            flex: 1,
            minHeight: 44,
            borderRadius: TL.radius.pill,
            border: "none",
            background: TL.ok,
            // Fasit (WB-04 «Godta = ok-grønn fyll med scene-tekst»): ingen
            // egen --tl-on-ok finnes. TL.scene følger temaet (hvit i lys,
            // sort i mørk) og gir samme par som fasitens faste sort-på-grønn
            // i sin egen (mørke) mockup — uten et nytt hardkodet hex-tall.
            color: TL.scene,
            fontFamily: TL.font.sans,
            fontSize: 13,
            fontWeight: 700,
            cursor: travel ? "default" : "pointer",
            opacity: travel && handling !== "ACCEPTED" ? 0.5 : 1,
          }}
        >
          {handling === "ACCEPTED" ? WB_UI.approvalAccepting : WB_UI.approvalAccept}
        </button>
        <button
          type="button"
          className="v2-press v2-focus"
          disabled={travel}
          onClick={() => svar("REJECTED")}
          data-od-id="wb-idag-godkjenning-avvis"
          style={{
            flex: 1,
            minHeight: 44,
            borderRadius: TL.radius.pill,
            border: `1px solid ${TL.hair}`,
            background: "transparent",
            color: TL.text,
            fontFamily: TL.font.sans,
            fontSize: 13,
            fontWeight: 600,
            cursor: travel ? "default" : "pointer",
            opacity: travel && handling !== "REJECTED" ? 0.5 : 1,
          }}
        >
          {handling === "REJECTED" ? WB_UI.approvalRejecting : WB_UI.approvalReject}
        </button>
      </div>
    </div>
  );
}

/** Kort-flate — PH-01e-mønster: TL.elev, TL.radius.card, ingen kant. */
const wbKortStil: CSSProperties = {
  background: TL.elev,
  borderRadius: TL.radius.card,
  padding: 20,
};

/** Workbench «I dag» (PH-01e): feil, hvile, pågår, publisert. DRAFT er filtrert. */
function WorkbenchIDagArtefakt({ workbenchDay }: { workbenchDay: PlayerDayResult }) {
  // Optimistisk skjuling av godkjenninger spilleren nettopp svarte på — det
  // faktiske resultatet kommer tilbake via router.refresh() i GodkjenningKort.
  const [besvart, setBesvart] = useState<Set<string>>(() => new Set());

  const eyebrow = (
    <div style={{ fontFamily: TL.font.mono, fontSize: 10, letterSpacing: TL.track.caps, textTransform: "uppercase", color: TL.mute }}>
      workbench
    </div>
  );

  if (!workbenchDay.ok) {
    return (
      <div data-od-id="wb-idag-feil" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {eyebrow}
        <div style={wbKortStil}>
          <div style={{ fontFamily: TL.font.mono, fontSize: 11, fontWeight: 700, letterSpacing: TL.track.capsSm, textTransform: "uppercase", color: TL.danger }}>
            Ingen forbindelse
          </div>
          <p style={{ margin: "10px 0 0", fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.45 }}>
            {workbenchDay.error}
          </p>
        </div>
      </div>
    );
  }

  const { sessions } = workbenchDay.data;
  const venterGodkjenning = sessions.filter((s) => s.needsPlayerApproval && !besvart.has(s.id));
  const okter = sessions.filter((s) => !s.needsPlayerApproval);
  const pagaende = okter.find((s) => s.status === "IN_PROGRESS") ?? null;

  const godkjenningskort = venterGodkjenning.length > 0 && (
    <div data-od-id="wb-idag-godkjenninger" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {venterGodkjenning.map((okt) => (
        <GodkjenningKort key={okt.id} okt={okt} onFerdig={(id) => setBesvart((prev) => new Set(prev).add(id))} />
      ))}
    </div>
  );

  if (okter.length === 0) {
    return (
      <div data-od-id="wb-idag-hvile" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {eyebrow}
        {godkjenningskort}
        <div style={wbKortStil}>
          <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
            {WB_UI.playerNoSessions}
          </p>
        </div>
      </div>
    );
  }

  if (pagaende) {
    return (
      <div data-od-id="wb-idag-pagar" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {eyebrow}
        {godkjenningskort}
        <div style={{ ...wbKortStil, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: TL.warm, flex: "none" }} aria-hidden="true" />
            <span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: TL.track.capsSm, textTransform: "uppercase", color: TL.warm }}>
              {STATUS_CAPS.IN_PROGRESS}
            </span>
          </div>
          <h3 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 16, fontWeight: 600, color: TL.text }}>{pagaende.title}</h3>
          <p style={{ margin: 0, fontFamily: TL.font.mono, fontSize: 12, color: TL.mute }}>
            Startet {formatTime(pagaende.startMinute)} · {formatMinutes(pagaende.durationMinutes)} ·{" "}
            {pagaende.drillsCount} øvelser
          </p>
          <Link
            href={`/portal/tren/wb/${pagaende.id}`}
            className="v2-press v2-focus"
            data-od-id="wb-idag-pagar-lenke"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 48,
              borderRadius: TL.radius.pill,
              background: TL.fill,
              color: TL.onFill,
              fontFamily: TL.font.sans,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              marginTop: 8,
            }}
          >
            Fortsett
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-od-id="wb-idag-publisert" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {eyebrow}
      {godkjenningskort}
      <div style={{ ...wbKortStil, padding: 0 }}>
        {okter.map((s, i) => {
          const status = s.status as SessionStatus;
          return (
            <Link
              key={s.id}
              href={`/portal/tren/wb/${s.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 20px",
                borderTop: i === 0 ? "none" : `1px solid ${TL.hair}`,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <span style={{ width: 44, flex: "none", fontFamily: TL.font.mono, fontSize: 12, fontWeight: 700, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
                {formatTime(s.startMinute)}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>{s.title}</span>
                <span style={{ display: "block", marginTop: 2, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>
                  {PYRAMID_LABEL[s.pyramid as keyof typeof PYRAMID_LABEL] ?? s.pyramid} · {formatMinutes(s.durationMinutes)}
                </span>
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  flex: "none",
                  fontFamily: TL.font.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: TL.track.capsSm,
                  color: harHake(status) ? TL.warm : TL.mute,
                }}
              >
                {harHake(status) && <Icon name="check" size={10} style={{ color: TL.warm }} />}
                {STATUS_CAPS[status]}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function PortalChatHjem({
  data,
  gjennomfore,
  naaTekst,
  workbenchDay,
  trackman,
  testerLive,
  dagITiden,
}: {
  data: DashboardData;
  gjennomfore: GjennomforeData;
  /** Beregnet server-side i page.tsx (Oslo-korrekt) — se filkommentar. */
  naaTekst: { ukedag: string; dato: string; klokke: string };
  /** Ekte Workbench-dag (Loop 3/B4) — se `WorkbenchIDagArtefakt`. */
  workbenchDay: PlayerDayResult;
  /** PH-01c: siste TrackMan-økt, eller null når spilleren ikke har noen (kortet skjules da helt). */
  trackman: TrackManTeaser | null;
  /** TE-04/06 (C4/Loop 8): pågående gate-/PEI-test-live-økt, eller null (kortet skjules da helt). */
  testerLive: TesterLiveKortData | null;
  /** KA-04 (Loop 7/C3): hele dagen på tvers av lagene — se `IDagITidenArk`. */
  dagITiden: { dagLabel: string; hendelser: KalenderHendelse[] };
}) {
  const { messages, status, error, sendMessage } = usePortalChat();
  const [artefaktApen, setArtefaktApen] = useState(false);
  const [fangstApen, setFangstApen] = useState(false);
  const [idagItidenApen, setIdagItidenApen] = useState(false);
  const mobil = useErMobil();
  const trådRef = useRef<HTMLDivElement>(null);
  // Sticky toppbar over dokumentrullen — publiser høyden (toppbar-hoyde.tsx).
  const toppRef = useToppbarHoyde<HTMLElement>();
  const busy = status === "streaming" || status === "submitted";

  useEffect(() => {
    trådRef.current?.scrollTo({ top: trådRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function send(tekst: string) {
    await sendMessage(tekst);
  }

  const kategori = data.kpiStats.avgScore != null ? kategoriFraSnittscore(data.kpiStats.avgScore).kategori : null;
  const sgTekst = formatSg(data.kpiStats.sgTotal);
  const ukeHarOkter = data.week.some((d) => d.sessions.length > 0);
  /** FangstSheet-kontekst: aktiv/neste økt, ellers siste fullførte i dag. */
  const fangstOkt = gjennomfore.nesteOkt ?? gjennomfore.fullfortIdag.at(-1) ?? null;
  const heltTom = gjennomfore.nesteOkt === null && gjennomfore.fullfortIdag.length === 0;
  const visEnTingNa = gjennomfore.nesteOkt !== null && gjennomfore.nesteOkt.status === "upcoming";

  return (
    <div
      data-paper-wave-a="chat-idag"
      data-paper-slug="playerhq-chat"
      data-od-id="playerhq-idag"
      data-paper-portal-hjem
      style={{
        display: "grid",
        gridTemplateColumns: mobil ? "1fr" : "minmax(0,1fr) 360px",
        height: "100%",
        minHeight: 0,
      }}
    >
      {/* ── Hovedkolonne: header + loop + tråd + composer ── */}
      <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, minWidth: 0, background: TL.scene, borderRight: mobil ? undefined : `1px solid ${TL.hair}` }}>
        {/* ── Topplinje (Paper .top: tittel + loop + capture) ── */}
        <header
          ref={toppRef}
          data-paper-topp
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
            padding: "10px 16px",
            background: TL.scene,
            borderBottom: `1px solid ${TL.hair}`,
            position: "sticky",
            top: 0,
            zIndex: 5,
          }}
        >
          <div style={{ minWidth: 0, flex: "1 1 160px" }}>
            <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
              I dag
            </h1>
            <div
              className="num"
              style={{
                fontFamily: TL.font.mono,
                fontSize: 11,
                letterSpacing: "0.02em",
                color: TL.mute,
                marginTop: 2,
              }}
            >
              {/* Fasitens mobil-header er flat: navn, kategori og SG. Dato og
                  klokke gjorde linja tre linjer høy på 390 px og dyttet
                  sløyfen ned — de står igjen på desktop, der det er plass. */}
              {data.user.name} · kat. {kategori ?? "—"} · SG total {sgTekst}
              {!mobil && ` · ${naaTekst.ukedag} ${naaTekst.dato} ${naaTekst.klokke}`}
            </div>
          </div>
          {!mobil && <LoopNav gjennomfore={gjennomfore} />}
          {mobil && (
            <button
              type="button"
              onClick={() => setArtefaktApen(true)}
              className="v2-press v2-focus"
              style={{
                minHeight: 44,
                padding: "0 12px",
                borderRadius: TL.radius.card,
                border: `1px solid ${TL.hair}`,
                background: TL.elev,
                color: TL.text,
                fontFamily: TL.font.sans,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Dagens økt
            </button>
          )}
          {/* Mikrofonen i headeren er desktop-fasitens (der composeren har en
              liten, nøytral mic). På mobil eier composeren den store
              clay-mikrofonen, og en ekstra her ble bare et duplikat som dyttet
              temabryteren ned på egen linje. */}
          {!mobil && (
            <button
              type="button"
              onClick={() => setFangstApen(true)}
              className="v2-press v2-focus"
              aria-label="Fang en observasjon"
              data-od-id="open-capture-top"
              style={{
                width: 44,
                height: 44,
                display: "grid",
                placeItems: "center",
                borderRadius: TL.radius.card,
                border: `1px solid ${TL.hair}`,
                background: "transparent",
                color: TL.text,
                cursor: "pointer",
                flex: "none",
              }}
            >
              <Icon name="mic" size={18} />
            </button>
          )}
          {/* KA-04 (Loop 7/C3): «I dag i tiden» — hele dagen på tvers av lagene
              (økt/skole/turnering/tester/booking), lesevisning. Ingen egen
              kalender-fane for spilleren — dette er inngangen. */}
          <button
            type="button"
            onClick={() => setIdagItidenApen(true)}
            className="v2-press v2-focus"
            aria-label="I dag i tiden"
            style={{
              width: 44,
              height: 44,
              display: "grid",
              placeItems: "center",
              borderRadius: TL.radius.card,
              border: `1px solid ${TL.hair}`,
              background: "transparent",
              color: TL.text,
              cursor: "pointer",
              flex: "none",
            }}
          >
            <Icon name="clock" size={18} />
          </button>
          {/* Paper har temabryteren i headeren på hver skjerm (mobil-fasitens
              `#themeToggle`). Den satt bare i desktop-railen før, altså
              utilgjengelig på telefon — der Øyvind faktisk bruker appen. */}
          <TemaHeaderKnapp />
        </header>
        {mobil && <LoopNav gjennomfore={gjennomfore} />}

        {/* ── Tråd ── */}
        <div
          ref={trådRef}
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            padding: "16px 16px 24px",
            display: "flex",
            flexDirection: "column",
            background: TL.scene,
          }}
        >
          <div
            style={{
              maxWidth: 720,
              width: "100%",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              flex: messages.length === 0 && heltTom ? 1 : undefined,
              justifyContent: messages.length === 0 && heltTom ? "center" : undefined,
              alignItems: messages.length === 0 && heltTom ? "stretch" : undefined,
            }}
          >
            <WorkbenchIDagArtefakt workbenchDay={workbenchDay} />
            <RundeLiveArtefakt />
            {testerLive && <TesterLiveKort testerLive={testerLive} />}
            {trackman && <TrackManTeaserKort trackman={trackman} />}

            {messages.length === 0 && heltTom && (
              <TomTilstand
                ukeHarOkter={ukeHarOkter}
                weekNumber={data.weekNumber}
                onForslag={send}
              />
            )}

            {messages.length === 0 && !heltTom && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    borderRadius: 999,
                    background: TL.dock,
                    border: `1px solid ${TL.hair}`,
                    fontFamily: TL.font.sans,
                    fontSize: 12.5,
                    color: TL.mute,
                  }}
                >
                  <Icon name="message-circle" size={14} style={{ color: TL.mute }} />
                  Spør om treningen din — svar baseres på plan og logg, ikke gjetning.
                </div>
                <ForslagRad items={FORSLAG} onPick={send} />
              </div>
            )}

            {messages.map((m) => {
              if (m.role !== "user" && m.role !== "assistant") return null;
              const tekst = meldingTekst(m);
              const toolCalls = m.parts.filter((p) => p.type === "tool-call").map((p) => p.toolCall);
              return (
                <SamtaleBoble key={m.id} rolle={m.role} initialer={data.user.name.slice(0, 2).toUpperCase()}>
                  {m.role === "assistant" && toolCalls.length > 0 && <PortalStegListe steg={toolCalls} />}
                  {tekst || (busy && m.role === "assistant" ? "…" : "")}
                  {m.role === "assistant" &&
                    toolCalls
                      .filter((tc) => tc.state === "result")
                      .map((tc) => <PortalHvorforDette key={tc.id} toolCall={tc} />)}
                </SamtaleBoble>
              );
            })}

            {busy && messages.at(-1)?.role === "user" && <SamtaleSkriver />}
            {error && <SamtaleFeil>Kunne ikke svare akkurat nå. Prøv igjen om litt.</SamtaleFeil>}

            {visEnTingNa && gjennomfore.nesteOkt && (
              <EnTingNaBanner okt={gjennomfore.nesteOkt} klokke={naaTekst.klokke} onSePlan={() => setArtefaktApen(true)} />
            )}

            {/* Første-besøk push-opt-in — viser seg kun til brukere som ikke har
                tatt stilling (localStorage + Notification.permission-sjekk i
                komponenten). Skjuler seg selv etter valg. */}
            <PushOptInBanner />
          </div>
        </div>

        {/* ── Composer — delt komponent (PP-B3), fasit-tro per brytepunkt:
            mobil = playerhq-chat-mobil.html (ctxline øverst, cbox + clay-mic +
            pilknapp — mic er skjermens ene TL.fill, Kontrakt §3), desktop =
            playerhq-chat-desktop.html (box + boxbar med nøytral .mic-knapp og
            «Send» som btn.ink, ctxline under). */}
        <div style={{ flex: "none" }}>
          <Composer
            mobil={mobil}
            label="Skriv til PlayerHQ"
            placeholder="Spør om hva som helst. / for kommandoer, @ for øvelse."
            onSend={send}
            sender={busy}
            kontekst={
              <>
                Ser: min plan · uke {data.weekNumber}
                {gjennomfore.nesteOkt ? ` · neste ${gjennomfore.nesteOkt.tid}` : " · ingen økt i dag"}
              </>
            }
            snarveier={{ slashLabel: "Kommandoer", atLabel: "Øvelser og drills" }}
            maksBredde={720}
            verktoy={
              mobil ? (
                /* Paper .btn.now.mic — --p-tap-capture 60px; clay er mic-ens
                   monopol på Hjem-mobil (Kontrakt §3). */
                <button
                  type="button"
                  onClick={() => setFangstApen(true)}
                  data-od-id="open-capture"
                  aria-label="Fang en observasjon"
                  aria-haspopup="dialog"
                  className="v2-press v2-focus"
                  data-paper-en-ting="true"
                  style={{
                    flex: "none",
                    width: 60,
                    height: 60,
                    minHeight: 60,
                    borderRadius: 9999,
                    border: "none",
                    background: TL.fill,
                    color: TL.onFill,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 10px color-mix(in srgb, var(--tl-fill) 40%, transparent)",
                  }}
                >
                  <Icon name="mic" size={24} />
                </button>
              ) : (
                /* Desktop-fasitens .mic — nøytral 60px-flate i boxbaren
                   (--tap-capture, soft bakgrunn); clay hører mobilen til. */
                <button
                  type="button"
                  onClick={() => setFangstApen(true)}
                  data-od-id="open-capture"
                  aria-label="Fang en observasjon"
                  aria-haspopup="dialog"
                  className="v2-press v2-focus"
                  style={{
                    flex: "none",
                    width: 60,
                    height: 60,
                    minHeight: 60,
                    display: "grid",
                    placeItems: "center",
                    background: TL.dock,
                    border: `1px solid ${TL.hair}`,
                    borderRadius: TL.radius.card,
                    color: TL.text,
                    cursor: "pointer",
                  }}
                >
                  <Icon name="mic" size={22} strokeWidth={1.6} />
                </button>
              )
            }
          />
        </div>
      </div>

      <ArtefaktPanel mobil={mobil} open={artefaktApen} onClose={() => setArtefaktApen(false)} tittel="Dagens økt">
        <DagensOktInnhold gjennomfore={gjennomfore} />
        {/* Inngang til hub-en «Utenfor banen» (Paper W2: playerhq-hjem-rest) */}
        <Link
          href="/portal/utenfor-banen"
          data-od-id="open-utenfor-banen"
          style={{
            display: "block",
            marginTop: 16,
            paddingTop: 12,
            borderTop: `1px solid ${TL.hair}`,
            fontFamily: TL.font.sans,
            fontSize: 13,
            fontWeight: 500,
            color: TL.mute,
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          Utenfor banen — fysisk · lag · utfordringer
        </Link>
      </ArtefaktPanel>

      {fangstApen && (
        <FangstSheet
          onClose={() => setFangstApen(false)}
          onLagre={(tekst) => {
            void send(tekst);
          }}
          formel={fangstOkt?.formel ?? null}
          oktLabel={fangstOkt ? `${fangstOkt.tittel} · ${fangstOkt.meta}` : null}
        />
      )}

      <IDagITidenArk
        open={idagItidenApen}
        onClose={() => setIdagItidenApen(false)}
        dagLabel={dagITiden.dagLabel}
        hendelser={dagITiden.hendelser}
      />
    </div>
  );
}
