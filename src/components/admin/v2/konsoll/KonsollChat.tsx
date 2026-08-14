"use client";

/**
 * AgencyOS Konsoll — samtaleflaten (PP-2.1).
 *
 * Fasit: designsystem/paper/fase1/agencyos-konsoll-desktop.html + -mobil.html.
 * Erstatter CockpitV2 sin kort-stabel. Formen er tre kolonner:
 * rail (leveres av V2Shell) · tråd · artefaktpanel 380px ved ≥1121px, bunnark
 * under — samme brytepunkt som PlayerHQ-hjem (useErMobil).
 *
 * INGENTING ER SLETTET fra den gamle cockpiten (brief PP-2.1, «Faste rammer»).
 * Hver av de ti kortene er flyttet, ikke fjernet:
 *   hode          → topplinja
 *   hurtig        → utgående handlinger i innleggene + artefaktpanelets sløyfe
 *   live          → «pågår nå»-innlegget
 *   AI-dispatch   → «Én ting nå» (sist i tråden) + AI-kø-tabellen
 *   koen          → «hvem trenger deg»-tabellen
 *   kpi (4)       → nøkkeltall-tabellen i dagsinnlegget
 *   fokus         → «foreslåtte spillere»-tabellen
 *   innboks       → innboks-innlegget
 *   timer         → artefaktpanelets dagkort
 *   stalluka      → artefaktpanelets «stallen siste 30 dager»
 *   stall-økter   → StallOkterWidget, uendret, som innhold i et innlegg
 *   innsikt       → artefaktpanelets bunnhandlinger
 *
 * Alle tall kommer fra CockpitData/FokusData/AiDispatchData. Ingen innlegg
 * rendres uten grunnlag: er lista tom, faller innlegget bort — og er ALT tomt,
 * vises fasitens tomtilstand med tre konkrete veier videre.
 *
 * Composeren streamer mot /api/caddie/chat, som krever ADMIN
 * (canAccessMissionControl). COACH får derfor et ærlig deaktivert felt i
 * stedet for et som svarer 401 — se `kanChatte`.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { T, type AkseKey } from "@/lib/v2/tokens";
import { AKSE_NAVN } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { ArtefaktPanel, useErMobil } from "@/components/portal/v2/chat/ArtefaktPanel";
import { useCaddieChat } from "@/components/admin/caddie/use-caddie-chat";
import { CaddieApprovalModal } from "@/components/admin/caddie/caddie-approval-modal";
import type { CaddieToolCall } from "@/components/admin/caddie/types";
import { SamtaleBoble, SamtaleSkriver } from "@/components/v2/samtale";
import { TemaHeaderKnapp } from "@/components/v2/tema";
import { useToppbarHoyde } from "@/components/v2/toppbar-hoyde";
import { StallOkterWidget } from "@/components/widgets";
import type { StallOkterData } from "@/lib/widgets/stall-okter-data";
import type { CockpitData } from "@/components/admin/cockpit/agency-cockpit";
import type { InnboksSammendrag } from "@/lib/innboks/data";
import type { FokusData } from "@/lib/agencyos/fokus-spillere";
import type { AiDispatchData } from "@/lib/agencyos/ai-dispatch-data";
import {
  SystemInnlegg,
  StegListe,
  Prosa,
  Tall,
  Hvorfor,
  Tabell,
  Handlinger,
  EnTingNa,
  ArtefaktKort,
} from "./KonsollDeler";
import { KonsollArtefakt } from "./KonsollArtefakt";

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

export function KonsollChat({
  data,
  innboks,
  fokus,
  aiDispatch,
  stallOkter,
  kanChatte,
  klokke,
}: {
  data: CockpitData;
  innboks?: InnboksSammendrag;
  fokus?: FokusData;
  aiDispatch?: AiDispatchData;
  stallOkter?: StallOkterData;
  /** ADMIN → composeren er koblet til Caddie. COACH → ærlig deaktivert felt. */
  kanChatte: boolean;
  /**
   * Klokkeslett formatert Oslo-korrekt på serveren (page.tsx). Beregnes IKKE
   * på klienten: serveren kjører UTC, så en klient-beregnet klokke ville gitt
   * hydreringsavvik (gotchas §Tidssone). Samme mønster som PortalChatHjem.
   */
  klokke: string;
}) {
  const mobil = useErMobil();
  const [artefaktApen, setArtefaktApen] = useState(false);
  const [input, setInput] = useState("");
  const bunnRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  // Toppbaren er sticky over dokumentrullen — publiser høyden så anker-hopp
  // lander under den (se components/v2/toppbar-hoyde.tsx).
  const toppRef = useToppbarHoyde<HTMLElement>();
  // Autoscroll er en chat-affordans som først gir mening etter at DU har sendt
  // noe. Ved sidelasting skal konsollen møte deg på toppen.
  const harSendt = useRef(false);

  const { messages, status, sendMessage, updateToolApproval } = useCaddieChat({ conversationId: "" });
  const [avvisteGodkjenninger, setAvvisteGodkjenninger] = useState<Set<string>>(() => new Set());
  const busy = status === "streaming" || status === "submitted";

  // Siden hele siden ruller (sticky composer, ikke fast-høyde flex), rulles
  // det til et ankerelement nederst i tråden — ikke på en scroll-container.
  //
  // Kjørte tidligere ubetinget på `messages.length`, og siden lagrede meldinger
  // kommer inn asynkront rett etter mount, dro den HELE dokumentet til bunn ved
  // sidelasting. Da lå de øverste 112 px av siste skjermbilde bak den sticky
  // toppbaren, og «Åpne AgenticOS» ble klippet på midten (målt i prod 14.08:
  // scrollY 2076 = maxScroll, lenka på top 93 under en header som slutter på
  // 112). Guarden gjør scrollen til det den skal være: et svar på DIN sending.
  useEffect(() => {
    if (!harSendt.current || messages.length === 0) return;
    bunnRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);


  const ventendeGodkjenning = useMemo<CaddieToolCall | null>(() => {
    for (const m of messages) {
      for (const p of m.parts) {
        if (p.type === "tool-call" && p.toolCall.needsApproval && !avvisteGodkjenninger.has(p.toolCall.id)) {
          return p.toolCall;
        }
      }
    }
    return null;
  }, [messages, avvisteGodkjenninger]);

  const avvis = (id: string) =>
    setAvvisteGodkjenninger((prev) => {
      const neste = new Set(prev);
      neste.add(id);
      return neste;
    });

  async function send(tekst: string) {
    const t = tekst.trim();
    if (!t || busy || !kanChatte) return;
    harSendt.current = true;
    setInput("");
    await sendMessage(t);
  }

  /** Fasitens `/`- og `@`-knapper (`toggle-slash`/`toggle-at`): setter inn
   * tegnet ved markøren og gir feltet fokus tilbake — samme mønster som
   * kommando-/spillerchip-ene i agencyos-konsoll-desktop.html. */
  function settInnTegn(tegn: string) {
    const el = taRef.current;
    if (!el) {
      setInput((v) => v + tegn);
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const neste = input.slice(0, start) + tegn + input.slice(end);
    setInput(neste);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + tegn.length;
    });
  }

  // ── Avledet ────────────────────────────────────────────────────────
  const aktiv =
    data.timeline.find((s) => data.now >= s.startMin && data.now < s.startMin + s.durMin) ?? null;
  const trengerDeg = data.focusCount ?? data.focus.length;
  const forslag = fokus ? [...fokus.pinnet.map((k) => ({ ...k, grunn: "Pinnet av deg" })), ...fokus.forslag] : [];
  const dispatchRader = aiDispatch?.rader ?? [];
  const nyeEposter = innboks?.antallNye ?? 0;

  const heltTom =
    data.timeline.length === 0 &&
    data.focus.length === 0 &&
    forslag.length === 0 &&
    dispatchRader.length === 0 &&
    (innboks?.siste.length ?? 0) === 0 &&
    !aiDispatch?.enTingNa;

  const enTingNaBlokk = aiDispatch?.enTingNa ? (
    <SystemInnlegg eyebrow="systemet, uoppfordret" klokke={klokke} odId="turn-now">
      <EnTingNa
        tekst={aiDispatch.enTingNa.tekst}
        primaer={{ label: "Gjør dette nå", href: aiDispatch.enTingNa.href, odId: "en-ting-na" }}
        sekundaer={{ label: "Se AI-køen først", href: "/admin/godkjenninger", odId: "en-ting-na-se" }}
      />
    </SystemInnlegg>
  ) : null;

  return (
    <div
      data-paper-wave-b="konsoll"
      data-paper-slug="agencyos-konsoll"
      data-od-id="agencyos-konsoll"
      style={{
        display: "grid",
        gridTemplateColumns: mobil ? "1fr" : "minmax(0,1fr) 380px",
        alignItems: "start",
        gap: mobil ? 0 : 16,
        minHeight: 0,
      }}
    >
      {/* ══ Midtkolonne: topplinje + tråd + composer ══
          Composeren er `sticky bottom` og topplinja `sticky top` framfor at
          hele skjermen er en fast-høyde flex-kolonne: V2Shell er `minHeight:
          100vh` med padding, ikke en høyde-container, så `height:100%` her
          hadde blitt `auto` og composeren endt nederst i et 1700px dokument
          (målt 10.08). Sticky gir fasitens oppførsel — tråden ruller, feltet
          blir stående — uten å endre skallet for alle andre skjermer. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          /* Desktop: kolonnen får viewport-høyde (minus skallets topp-/bunnluft,
             24 + 36 px) slik at composerens `marginTop:auto` fester feltet i
             bunnen også når tråden er kort. Mobil: composeren er fixed, så
             kolonnen skal ikke tvinges høy. */
          minHeight: mobil ? 0 : "calc(100dvh - 60px)",
          minWidth: 0,
          background: T.bg,
        }}
      >
        <header
          ref={toppRef}
          data-paper-topbar="konsoll"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            position: "sticky",
            top: 0,
            zIndex: 5,
            flex: "none",
          }}
        >
          <div style={{ minWidth: 0, flex: "1 1 180px" }}>
            <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>Konsoll</h1>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, marginTop: 2 }}>
              {data.dayLabel}
              {klokke ? ` · ${klokke}` : ""}
              {data.liveSessionsCount > 0 ? ` · ${pl(data.liveSessionsCount, "økt pågår", "økter pågår")}` : ""}
            </div>
          </div>

          {/* Søk i headeren (fasitens `.altbtn` på mobil, `.kbdhint` på desktop).
              Knappen sendte «cmd-palette:open» — et event INGEN lytter på i
              AgencyOS (CmdPalette er kun montert i PlayerHQ-providerne), så
              søket var dødt her. Riktig mottaker er GlobalSearchModal, som
              V2Shell monterer for AgencyOS. */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("global-search:open"))}
            className="v2-press v2-focus"
            data-od-id="open-palette"
            aria-label="Søk i spillere, sider og kommandoer"
            style={{
              minHeight: 40,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "0 12px",
              borderRadius: T.rTag,
              border: `1px solid ${T.border}`,
              background: T.panel,
              color: T.fg2,
              fontFamily: T.ui,
              fontSize: 12.5,
              cursor: "pointer",
              flex: "none",
            }}
          >
            <Icon name="search" size={16} strokeWidth={1.7} />
            {mobil ? (
              "Søk"
            ) : (
              <>
                Kommandoer <kbd style={{ fontFamily: T.mono, fontSize: 11 }}>⌘K</kbd>
              </>
            )}
          </button>

          {mobil && (
            <button
              type="button"
              onClick={() => setArtefaktApen(true)}
              className="v2-press v2-focus"
              data-od-id="artifact-open-sheet"
              style={{
                minHeight: 40,
                padding: "0 12px",
                borderRadius: T.rTag,
                border: `1px solid ${T.border}`,
                background: T.panel,
                color: T.fg,
                fontFamily: T.ui,
                fontSize: 12.5,
                fontWeight: 500,
                cursor: "pointer",
                flex: "none",
              }}
            >
              Dagen din
            </button>
          )}

          {/* Temabryteren står i headeren på hver Paper-skjerm (fasitens
              `#theme-toggle` på mobil, `#themeToggle` i railen på desktop).
              På konsollen manglet den helt på telefon. */}
          <TemaHeaderKnapp />
        </header>

        {/* ══ Tråden ══ */}
        <div
          role="log"
          aria-live="polite"
          aria-label="Samtale"
          style={{
            minHeight: 0,
            /* Mobil: composeren er fast og ligger utenfor flyten — tråden må ha
               luft under seg tilsvarende feltets høyde, ellers ligger siste
               innlegg bak den. */
            padding: mobil ? "16px 16px 140px" : "16px 16px 24px",
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 760,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 24,
              minWidth: 0,
              flex: heltTom && messages.length === 0 ? 1 : undefined,
              justifyContent: heltTom && messages.length === 0 ? "center" : undefined,
            }}
          >
            {/* Mobil: «Én ting nå» ØVERST (fasitens .daycard i
                agencyos-konsoll-mobil.html) — på telefon skal det viktigste
                møte deg med én gang, ikke etter fem skjermhøyder med tabeller. */}
            {mobil && enTingNaBlokk}

            {heltTom && messages.length === 0 ? (
              <TomKonsoll kanChatte={kanChatte} onForslag={send} />
            ) : (
              <>
                {/* ── Pågår nå ── */}
                {aktiv && (
                  <SystemInnlegg eyebrow="pågår nå" klokke={klokke} odId="turn-live">
                    <Prosa>
                      {aktiv.playerName} er i gang med{" "}
                      {AKSE_NAVN[aktiv.axisLabel as AkseKey] || aktiv.axisLabel} · {aktiv.title}. Økta startet{" "}
                      <Tall>{aktiv.time}</Tall> og varer <Tall>{aktiv.durMin} min</Tall>.
                    </Prosa>
                    {aktiv.href && (
                      <Handlinger lenker={[{ label: "Åpne økta", href: aktiv.href, odId: "open-live-session" }]} />
                    )}
                  </SystemInnlegg>
                )}

                {/* ── Dagen din: nøkkeltall ── */}
                <SystemInnlegg eyebrow="dagen din" klokke={klokke} odId="turn-dag">
                  <StegListe
                    steg={[
                      `Leste ${pl(data.timeline.length, "økt", "økter")} i kalenderen i dag`,
                      `Sjekket ${pl(data.activePlayersCount, "aktiv spiller", "aktive spillere")} i stallen`,
                      "Sammenstilte stall-tall siste 30 dager",
                    ]}
                  />
                  <Prosa>
                    Du har <Tall>{pl(data.timeline.length, "økt", "økter")}</Tall> i dag og{" "}
                    <Tall>{pl(data.activePlayersCount, "aktiv spiller", "aktive spillere")}</Tall> i stallen.{" "}
                    {trengerDeg > 0 ? (
                      <>
                        <Tall>{pl(trengerDeg, "spiller", "spillere")}</Tall> trenger deg nå — de står i tabellen
                        under.
                      </>
                    ) : (
                      "Ingen spillere har åpne saker akkurat nå."
                    )}
                  </Prosa>
                  <Tabell
                    caption={`Nøkkeltall for stallen, ${data.dayLabel}`}
                    kolonner={[
                      { nokkel: "navn", label: "Nøkkeltall" },
                      { nokkel: "verdi", label: "Verdi", tall: true },
                    ]}
                    rader={[
                      { navn: "Aktive spillere", verdi: data.activePlayersCount },
                      { navn: "Økter i dag", verdi: data.timeline.length },
                      { navn: "Trenger deg nå", verdi: trengerDeg },
                      { navn: "Stall-SG · snitt", verdi: data.stallSgKpi },
                      { navn: "Plan-etterlevelse", verdi: data.planAdherenceKpi },
                      ...(data.dagensVerdiKr != null
                        ? [{ navn: "Dagens bookingverdi", verdi: `${data.dagensVerdiKr.toLocaleString("nb-NO")} kr` }]
                        : []),
                    ]}
                    mobil={mobil}
                    odId="tbl-nokkeltall"
                  />
                  <Hvorfor
                    odId="why-nokkeltall"
                    punkter={[
                      <>
                        Stall-SG er snittet av <Tall>sgTotal</Tall> for alle registrerte runder i stallen siste{" "}
                        <Tall>30 dager</Tall>. «—» betyr at ingen runder er logget i perioden.
                      </>,
                      <>
                        Plan-etterlevelse er fullførte plan-økter delt på planlagte, samme <Tall>30 dager</Tall>.
                      </>,
                      <>
                        «Trenger deg nå» teller spillere med et åpent signal — ikke antall saker. Én spiller med tre
                        signaler teller <Tall>1</Tall>.
                      </>,
                    ]}
                  />
                  <Handlinger
                    lenker={[
                      { label: "Planlegg i Workbench", href: "/admin/planlegge", odId: "act-workbench" },
                      { label: "Se stallen", href: "/admin/spillere", odId: "act-spillere" },
                      { label: "Kalender", href: "/admin/kalender", odId: "act-kalender" },
                      { label: "Opptak", href: "/admin/recording", odId: "act-opptak" },
                    ]}
                  />
                </SystemInnlegg>

                {/* ── Hvem trenger deg ── */}
                {data.focus.length > 0 && (
                  <SystemInnlegg eyebrow="hvem trenger deg" klokke={klokke} odId="turn-triage">
                    <Prosa>
                      <Tall>{pl(data.focus.length, "spiller har", "spillere har")}</Tall> et åpent signal. De er
                      sortert med sterkeste signal først.
                    </Prosa>
                    <Tabell
                      caption="Spillere med åpent signal, sortert på styrke"
                      kolonner={[
                        { nokkel: "navn", label: "Spiller" },
                        { nokkel: "grunn", label: "Hvorfor" },
                        { nokkel: "signal", label: "Signal", tall: true },
                      ]}
                      rader={data.focus.map((p) => ({
                        navn: p.name,
                        grunn: p.reason.map((r) => r.text).join(""),
                        signal: p.signal.label,
                      }))}
                      mobil={mobil}
                      odId="tbl-triage"
                    />
                    <Handlinger
                      lenker={[
                        { label: "Åpne innboksen", href: "/admin/innboks", odId: "act-innboks" },
                        { label: "AI-kø", href: "/admin/godkjenninger", odId: "act-godkjenninger" },
                      ]}
                    />
                  </SystemInnlegg>
                )}

                {/* ── Foreslåtte spillere (fokus) ── */}
                {forslag.length > 0 && (
                  <SystemInnlegg eyebrow="foreslåtte spillere" odId="turn-fokus">
                    <Prosa>
                      Disse peker seg ut på plan-etterlevelse og Strokes Gained. Forslag, ikke pålegg — du velger
                      selv hvem du tar.
                    </Prosa>
                    <Tabell
                      caption="Spillere foreslått av systemet, med begrunnelse"
                      kolonner={[
                        { nokkel: "navn", label: "Spiller" },
                        { nokkel: "grunn", label: "Grunn" },
                      ]}
                      rader={forslag.map((f) => ({ navn: f.navn, grunn: f.grunn }))}
                      mobil={mobil}
                      odId="tbl-fokus"
                    />
                  </SystemInnlegg>
                )}

                {/* ── AI-kø ── */}
                {dispatchRader.length > 0 && (
                  <SystemInnlegg eyebrow="ai-kø" odId="turn-aiko">
                    <Prosa>
                      <Tall>{pl(dispatchRader.length, "oppgave", "oppgaver")}</Tall> ligger hos agentene. Du ser
                      hvem som gjør hva og når det er ferdig.
                    </Prosa>
                    <Tabell
                      caption="Oppgaver hos AI-agentene, med forventet ferdigtid"
                      kolonner={[
                        { nokkel: "til", label: "Hvem" },
                        { nokkel: "oppgave", label: "Oppgave" },
                        { nokkel: "nar", label: "Ferdig", tall: true },
                      ]}
                      rader={dispatchRader.map((r) => ({
                        til: r.tilLabel,
                        oppgave: r.oppgave,
                        nar: r.ferdigNar,
                      }))}
                      mobil={mobil}
                      odId="tbl-aiko"
                    />
                    <Handlinger
                      lenker={[{ label: "Åpne AgenticOS", href: "/admin/agents", odId: "act-agenticos" }]}
                    />
                  </SystemInnlegg>
                )}

                {/* ── Innboks ── */}
                {innboks && innboks.siste.length > 0 && (
                  <SystemInnlegg eyebrow="innboks" odId="turn-innboks">
                    <Prosa>
                      {nyeEposter > 0 ? (
                        <>
                          <Tall>{pl(nyeEposter, "ny e-post", "nye e-poster")}</Tall> til post@ siden sist.
                        </>
                      ) : (
                        "Ingen nye e-poster til post@ siden sist."
                      )}
                    </Prosa>
                    <Tabell
                      caption="Siste e-poster til post@"
                      kolonner={[
                        { nokkel: "fra", label: "Fra" },
                        { nokkel: "emne", label: "Emne" },
                        { nokkel: "nar", label: "Mottatt", tall: true },
                      ]}
                      rader={innboks.siste.map((e) => ({
                        fra: e.fraNavn ?? e.fraEpost,
                        emne: e.emne,
                        nar: e.mottattAt,
                      }))}
                      mobil={mobil}
                      odId="tbl-innboks"
                    />
                    <Handlinger
                      lenker={[{ label: "Åpne e-postinnboksen", href: "/admin/innboks-epost", odId: "act-epost" }]}
                    />
                  </SystemInnlegg>
                )}

                {/* ── Stallens økter i dag (widget beholdt uendret) ── */}
                {stallOkter && (
                  <SystemInnlegg eyebrow="stallens økter i dag" odId="turn-stallokter">
                    <StallOkterWidget data={stallOkter} />
                  </SystemInnlegg>
                )}

                {/* ── Dagen som artefakt (mobil: eneste vei inn i panelet) ── */}
                {mobil && (
                  <ArtefaktKort
                    navn={`Dagen din · ${data.dayLabel}`}
                    status={`${data.timeline.length} ${data.timeline.length === 1 ? "økt" : "økter"}`}
                    beskrivelse="Dagens økter, stall-tall og sløyfen — åpne som panel."
                    handlinger={[
                      { label: "Åpne i panel", onClick: () => setArtefaktApen(true), odId: "art-open-panel" },
                      { label: "Planlegg i Workbench", href: "/admin/planlegge", odId: "art-workbench" },
                    ]}
                  />
                )}

                {/* ── Samtalen med Caddie ──
                    `intro` er hookens faste velkomsthilsen, adressert til
                    Anders. Konsollen har allerede sin egen åpning i systeminn-
                    leggene over, og hilsenen ville dukket opp midt i tråden —
                    og med feil navn for en coach. Derfor filtrert bort her. */}
                {messages
                  .filter((m) => (m.role === "user" || m.role === "assistant") && m.id !== "intro")
                  .map((m) => (
                    <SamtaleBoble key={m.id} rolle={m.role as "user" | "assistant"} initialer="AK">
                      {m.parts
                        .filter((p): p is { type: "text"; text: string } => p.type === "text")
                        .map((p) => p.text)
                        .join("")}
                    </SamtaleBoble>
                  ))}
                {busy && messages.at(-1)?.role === "user" && <SamtaleSkriver />}

                {/* Desktop: «Én ting nå» avslutter tråden (fasitens tur 3). */}
                {!mobil && enTingNaBlokk}
              </>
            )}
            <div ref={bunnRef} aria-hidden />
          </div>
        </div>

        {/* ══ Composer ══
            Signering 12.08: «skrivefeltet skal ligge fast nederst, rett over
            fanelinjen». Sticky holdt ikke: V2Shell er `minHeight:100vh` med
            padding, ikke en høyde-container, så en kort tråd ga et felt som lå
            midt på skjermen. På mobil er feltet derfor FAST (fixed) og lagt
            nøyaktig oppå bunnfanenes overkant — 6+56+10 px nav + safe-area +
            cookie-bannerets høyde (gotchas §Cookie-banneret). På desktop er
            midtkolonnen gitt viewport-høyde, så `marginTop:auto` + sticky
            faktisk fester feltet i bunnen. */}
        <div
          data-paper-composer
          style={{
            position: mobil ? "fixed" : "sticky",
            ...(mobil
              ? {
                  left: 0,
                  right: 0,
                  bottom: "calc(72px + env(safe-area-inset-bottom) + var(--ak-cookie-h, 0px))",
                }
              : { bottom: 0 }),
            zIndex: 6,
            borderTop: `1px solid ${T.border}`,
            background: T.bg,
            padding: "8px 12px 12px",
            marginTop: "auto",
          }}
        >
          <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Fasitens `.box` + `.boxbar` (agencyos-konsoll-desktop.html):
                felt, deretter mikrofon · / · @ · spacer · Send i én rad. */}
            <div
              style={{
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderRadius: T.rCard,
                padding: 10,
              }}
            >
              <label htmlFor="konsoll-input" className="sr-only" style={srOnly}>
                Skriv til AgencyOS
              </label>
              <textarea
                id="konsoll-input"
                ref={taRef}
                value={input}
                disabled={!kanChatte}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                rows={1}
                placeholder={
                  kanChatte
                    ? "Skriv hva du vil ha gjort. / for kommandoer, @ for spiller."
                    : "Chat i konsollen er foreløpig åpen for administratorer."
                }
                data-od-id="composer-input"
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  background: "transparent",
                  color: T.fg,
                  fontFamily: T.bodyFont,
                  fontSize: 14.5,
                  lineHeight: 1.5,
                  minHeight: 32,
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                {/* Mikrofon: ingen fangst-/diktatmekanisme finnes i AgencyOS i
                    dag (kun FangstSheet i PlayerHQ, koblet til spillerens
                    øktnotat — ikke konsollens tråd). Synlig, ærlig deaktivert
                    fremfor utelatt, som fasiten krever. */}
                <button
                  type="button"
                  disabled
                  title="Diktering er ikke koblet til konsollen ennå"
                  aria-label="Start fangst og diktat"
                  data-od-id="open-capture"
                  style={{
                    width: 40,
                    height: 40,
                    flex: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: T.panel2,
                    border: `1px solid ${T.border}`,
                    borderRadius: T.rTag,
                    color: T.mut,
                    cursor: "not-allowed",
                  }}
                >
                  <Icon name="mic" size={18} strokeWidth={1.6} />
                </button>
                <button
                  type="button"
                  onClick={() => settInnTegn("/")}
                  disabled={!kanChatte}
                  aria-label="Sett inn kommando"
                  data-od-id="toggle-slash"
                  className="v2-press v2-focus"
                  style={{
                    minHeight: 36,
                    minWidth: 36,
                    padding: "0 12px",
                    flex: "none",
                    fontFamily: T.ui,
                    fontSize: 13,
                    fontWeight: 500,
                    color: T.fg,
                    background: "transparent",
                    border: `1px solid ${T.border}`,
                    borderRadius: T.rTag,
                    cursor: kanChatte ? "pointer" : "default",
                    opacity: kanChatte ? 1 : 0.45,
                  }}
                >
                  /
                </button>
                <button
                  type="button"
                  onClick={() => settInnTegn("@")}
                  disabled={!kanChatte}
                  aria-label="Nevn en spiller"
                  data-od-id="toggle-at"
                  className="v2-press v2-focus"
                  style={{
                    minHeight: 36,
                    minWidth: 36,
                    padding: "0 12px",
                    flex: "none",
                    fontFamily: T.ui,
                    fontSize: 13,
                    fontWeight: 500,
                    color: T.fg,
                    background: "transparent",
                    border: `1px solid ${T.border}`,
                    borderRadius: T.rTag,
                    cursor: kanChatte ? "pointer" : "default",
                    opacity: kanChatte ? 1 : 0.45,
                  }}
                >
                  @
                </button>
                <span style={{ flex: 1 }} />
                {/* Fasitens `.btn.ink` — blekkfylt tekstknapp, ikke pil-CTA. */}
                <button
                  type="button"
                  onClick={() => void send(input)}
                  disabled={!(kanChatte && Boolean(input.trim()) && !busy)}
                  data-od-id="send-message"
                  className="v2-press v2-focus"
                  style={{
                    minHeight: 36,
                    padding: "0 18px",
                    flex: "none",
                    fontFamily: T.ui,
                    fontSize: 13,
                    fontWeight: 500,
                    color: kanChatte && input.trim() && !busy ? T.onCta : T.mut,
                    background: kanChatte && input.trim() && !busy ? T.cta : T.panel3,
                    border: `1px solid ${kanChatte && input.trim() && !busy ? T.cta : T.border}`,
                    borderRadius: T.rTag,
                    cursor: kanChatte && input.trim() && !busy ? "pointer" : "default",
                  }}
                >
                  Send
                </button>
              </div>
            </div>

            {/* Fasitens `.ctxline` — kontekst-pill + tastatur-hint. */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "0 4px" }}>
              <span
                data-od-id="toggle-context"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  minHeight: 28,
                  padding: "0 10px",
                  fontFamily: T.mono,
                  fontSize: 10.5,
                  letterSpacing: "0.05em",
                  color: T.mut,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.rPill,
                }}
              >
                Ser: stallen · {data.activePlayersCount} spillere · {data.dayLabel}
              </span>
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: T.mut,
                }}
              >
                Enter sender · Shift+Enter ny linje
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Artefaktpanel — fast kolonne på desktop, bunnark på mobil ══
          Sticky av samme grunn som composeren: kolonnen skal følge med når
          tråden ruller, uten at skallet må bli en høyde-container. */}
      {mobil ? (
        <ArtefaktPanel
          mobil
          open={artefaktApen}
          onClose={() => setArtefaktApen(false)}
          tittel={`Dagen din · ${data.dayLabel}`}
        >
          <KonsollArtefakt data={data} />
        </ArtefaktPanel>
      ) : (
        <div
          style={{
            position: "sticky",
            top: 16,
            maxHeight: "calc(100dvh - 32px)",
            minWidth: 0,
            display: "flex",
            borderRadius: T.rCard,
            overflow: "hidden",
            border: `1px solid ${T.border}`,
          }}
        >
          <ArtefaktPanel
            mobil={false}
            open
            onClose={() => undefined}
            tittel={`Dagen din · ${data.dayLabel}`}
          >
            <KonsollArtefakt data={data} />
          </ArtefaktPanel>
        </div>
      )}

      <CaddieApprovalModal
        toolCall={ventendeGodkjenning}
        onApprove={async (id) => {
          if (!ventendeGodkjenning) return { status: "failed", error: "Mangler kontekst for handlingen" };
          const res = await updateToolApproval(id, true, {
            toolName: ventendeGodkjenning.toolName,
            toolInput: ventendeGodkjenning.input,
          });
          if (res.status === "done") avvis(id);
          return res;
        }}
        onReject={async (id) => {
          if (!ventendeGodkjenning) return { status: "failed", error: "Mangler kontekst for handlingen" };
          const res = await updateToolApproval(id, false, {
            toolName: ventendeGodkjenning.toolName,
            toolInput: ventendeGodkjenning.input,
          });
          avvis(id);
          return res;
        }}
        onClose={() => ventendeGodkjenning && avvis(ventendeGodkjenning.id)}
      />
    </div>
  );
}

const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

/** Fasitens .empty — ærlig tom tilstand med tre konkrete veier videre. */
function TomKonsoll({ kanChatte, onForslag }: { kanChatte: boolean; onForslag: (s: string) => void }) {
  return (
    <div
      data-od-id="state-empty"
      style={{
        alignSelf: "stretch",
        maxWidth: 560,
        padding: "32px 24px",
        borderRadius: T.rCard,
        border: `1px dashed ${T.border}`,
        background: T.panel2,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div>
        <h3 style={{ margin: 0, fontFamily: T.disp, fontSize: 16, fontWeight: 600, color: T.fg }}>
          Ingenting venter på deg nå
        </h3>
        <p
          style={{
            margin: "8px 0 0",
            fontFamily: T.bodyFont,
            fontSize: 14,
            color: T.mut,
            lineHeight: 1.6,
            maxWidth: "48ch",
          }}
        >
          Ingen økter i dag, ingen åpne signaler og tom kø. Bruk roen til én av disse.
        </p>
      </div>
      <Handlinger
        lenker={[
          { label: "Planlegg uka i Workbench", href: "/admin/planlegge", odId: "empty-workbench" },
          { label: "Se stallen", href: "/admin/spillere", odId: "empty-spillere" },
          { label: "Åpne kalenderen", href: "/admin/kalender", odId: "empty-kalender" },
        ]}
      />
      {kanChatte && (
        <Handlinger
          lenker={[
            {
              label: "Hvem har vært stille lengst?",
              onClick: () => onForslag("Hvem av spillerne mine har vært stille lengst?"),
              odId: "empty-suggest-stille",
            },
          ]}
        />
      )}
    </div>
  );
}
