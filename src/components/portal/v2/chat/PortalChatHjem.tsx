"use client";

/**
 * PortalChatHjem — PlayerHQ "I dag", chat-først (designport steg 7 PR-A,
 * retter avviksliste A1 mot plan-designport-alle-skjermer.md).
 * Erstatter HjemV2 som innhold på /portal. V2Shell (rail/bunn-nav) er uendret
 * rundt denne komponenten — se src/app/portal/page.tsx.
 *
 * PP-1.1 (2026-08-09): loop ink underline, btn.ink=T.cta, mic 60px clay, composer bg canvas.
 * Matcher Paper-fasiten (designsystem/paper/fase1/playerhq-chat-desktop.html)
 * strukturelt: rail(V2Shell) + tråd(≤720px lesebredde) + FAST artefaktpanel
 * 360px ved ≥1121px, composer festet nederst. Bygget med EKSISTERENDE
 * v2-primitiver (SamtaleBoble/Skrivefelt/ForslagRad fra components/v2/samtale.tsx,
 * BunnArk) i stedet for å kopiere Paper sin egen rå CSS — appen står fortsatt
 * på v2-tokens (CLAUDE.md invariant 2).
 *
 * A1-rettelser (2026-08-06): (1) artefaktpanelet er nå en FAST grid-kolonne på
 * desktop — ikke en toggle (useErMobil delt med ArtefaktPanel, samme
 * brytepunkt 1120px som fasiten). (2) «Én ting nå»-systeminnlegget («Dagens
 * økt starter …» + «Start økta» som ink; mic i composer eier T.handling) vises når dagens økt
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

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { SamtaleBoble, SamtaleSkriver, SamtaleFeil, Skrivefelt, ForslagRad } from "@/components/v2/samtale";
import { Icon } from "@/components/v2/icon";
import { kategoriFraSnittscore } from "@/lib/domain/ak-kategori";
import { formatSg } from "@/lib/sg";
import type { DashboardData } from "@/app/portal/actions";
import type { GjennomforeData } from "@/lib/portal-gjennomfore/gjennomfore-data";
import { usePortalChat } from "./use-portal-chat";
import { PortalStegListe } from "./PortalStegListe";
import { PortalHvorforDette } from "./PortalHvorforDette";
import { ArtefaktPanel, useErMobil } from "./ArtefaktPanel";
import { FangstSheet } from "./FangstSheet";
import type { PortalChatMessage } from "./types";

const FORSLAG = ["Hva skal jeg trene i dag?", "Hva var resultatet sist?", "Hva står på ukeplanen?"];

/** Paper .cmini — hintene fasiten viser under skrivefeltet. */
const SNARVEIER = [
  { tegn: "/", merkelapp: "Kommandoer", odId: "toggle-slash" },
  { tegn: "@", merkelapp: "Øvelser og drills", odId: "toggle-at" },
] as const;

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
        borderBottom: `1px solid ${T.border}`,
        background: T.bg,
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
              background: on ? T.panel2 : "transparent",
              /* Paper .loop a[aria-current]: inset ink underline — clay is mic-only on Hjem */
              boxShadow: on ? `inset 0 -2px 0 0 ${T.fg}` : "none",
              color: on ? T.fg : T.mut,
              fontFamily: T.mono,
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
                fontFamily: T.ui,
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: 0,
                textTransform: "none",
                color: on ? T.fg2 : T.mut,
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
              <span style={{ color: T.mut, fontSize: 10, alignSelf: "center", padding: "0 2px", flex: "none" }} aria-hidden>
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
    return <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.mut }}>Ingen økt registrert i dag.</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div style={{ fontFamily: T.disp, fontSize: 14, fontWeight: 600, color: T.fg }}>{okt.tittel}</div>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, marginTop: 4 }}>{okt.meta}</div>
      </div>
      {okt.drillNavn.length > 0 && (
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
          {okt.drillNavn.map((navn, i) => (
            <li key={i} style={{ display: "flex", gap: 8, fontSize: 12.5, color: T.fg, padding: "6px 0", borderTop: i > 0 ? `1px solid ${T.border}` : undefined }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>{i + 1}</span>
              {navn}
            </li>
          ))}
        </ul>
      )}
      {/* T.lime — bekreftende, IKKE «Én ting nå»-monopolet (T.handling). Panelet
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
          background: T.cta,
          color: T.onCta,
          fontFamily: T.ui,
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
      <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>
        systemet, uoppfordret · {klokke}
      </div>
      <div
        style={{
          border: `1px solid ${T.border}`,
          borderRadius: T.rCard,
          background: T.panel2,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>Én ting nå</div>
        <h3 style={{ margin: 0, fontFamily: T.disp, fontSize: 16, fontWeight: 600, color: T.fg }}>
          Dagens økt {okt.relTidTekst.startsWith("Pågår") ? okt.relTidTekst.toLowerCase() : `starter ${okt.relTidTekst}`}
        </h3>
        <p style={{ margin: 0, fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.5 }}>
          {okt.sted} er booket <span style={{ fontFamily: T.mono }}>{okt.tid}</span>. Du trenger ikke gjøre noe før økta starter.
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
              borderRadius: T.rTag,
              /* Paper .btn.ink — ink CTA; mic owns T.handling on Hjem */
              background: T.cta,
              color: T.onCta,
              fontFamily: T.ui,
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
              borderRadius: T.rTag,
              border: `1px solid ${T.border}`,
              background: "transparent",
              color: T.fg,
              fontFamily: T.ui,
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
  onFangst,
  onForslag,
}: {
  ukeHarOkter: boolean;
  weekNumber: number;
  onFangst: () => void;
  onForslag: (s: string) => void;
}) {
  /* Paper .empty + .btn (ink/ghost) — not elevated white card */
  const btn: CSSProperties = {
    minHeight: 48,
    padding: "0 16px",
    borderRadius: T.rCard,
    border: `1px solid ${T.border}`,
    background: T.panel,
    color: T.fg,
    fontFamily: T.ui,
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
        borderRadius: T.rCard,
        border: `1px dashed ${T.border}`,
        background: T.panel2,
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
            fontFamily: T.disp,
            fontSize: 15,
            fontWeight: 600,
            color: T.fg,
            lineHeight: 1.3,
          }}
        >
          {ukeHarOkter ? "Ingen økt i dag" : `Ingen økter i uke ${weekNumber} ennå`}
        </h3>
        <p
          style={{
            margin: "8px 0 0",
            fontFamily: T.bodyFont,
            fontSize: 14,
            color: T.mut,
            lineHeight: 1.55,
            maxWidth: "46ch",
          }}
        >
          Det betyr ikke at du står stille — her er tre ting du kan gjøre uansett.
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={onFangst} className="v2-press v2-focus" data-od-id="empty-capture" style={btn}>
          Fang en observasjon
        </button>
        <button
          type="button"
          onClick={() => onForslag("Lag en 25-minutters økt")}
          className="v2-press v2-focus"
          data-od-id="empty-short"
          style={btn}
        >
          Lag en 25-min økt selv
        </button>
        <button
          type="button"
          onClick={() => onForslag("Vis forrige uke")}
          className="v2-press v2-focus"
          data-od-id="empty-lastweek"
          style={btn}
        >
          Se forrige uke
        </button>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Link
          href="/portal/planlegge"
          data-od-id="empty-link-plan"
          style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 500, color: T.mut, textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          Se ukeplanen
        </Link>
        <Link
          href="/portal/kalender"
          data-od-id="empty-link-kalender"
          style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 500, color: T.mut, textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          Kalender
        </Link>
        <Link
          href="/portal/utenfor-banen"
          data-od-id="empty-link-utenfor-banen"
          style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 500, color: T.mut, textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          Utenfor banen
        </Link>
      </div>
    </div>
  );
}

export function PortalChatHjem({
  data,
  gjennomfore,
  naaTekst,
}: {
  data: DashboardData;
  gjennomfore: GjennomforeData;
  /** Beregnet server-side i page.tsx (Oslo-korrekt) — se filkommentar. */
  naaTekst: { ukedag: string; dato: string; klokke: string };
}) {
  const { messages, status, error, sendMessage } = usePortalChat();
  const [input, setInput] = useState("");
  const [artefaktApen, setArtefaktApen] = useState(false);
  const [fangstApen, setFangstApen] = useState(false);
  const mobil = useErMobil();
  const trådRef = useRef<HTMLDivElement>(null);
  const busy = status === "streaming" || status === "submitted";

  useEffect(() => {
    trådRef.current?.scrollTo({ top: trådRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function send(tekst: string) {
    setInput("");
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
      <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, minWidth: 0, background: T.bg, borderRight: mobil ? undefined : `1px solid ${T.border}` }}>
        {/* ── Topplinje (Paper .top: tittel + loop + capture) ── */}
        <header
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
            padding: "10px 16px",
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            position: "sticky",
            top: 0,
            zIndex: 5,
          }}
        >
          <div style={{ minWidth: 0, flex: "1 1 160px" }}>
            <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
              I dag
            </h1>
            <div
              className="num"
              style={{
                fontFamily: T.mono,
                fontSize: 11,
                letterSpacing: "0.02em",
                color: T.mut,
                marginTop: 2,
              }}
            >
              {data.user.name} · kat. {kategori ?? "—"} · SG total {sgTekst} · {naaTekst.ukedag} {naaTekst.dato}{" "}
              {naaTekst.klokke}
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
                borderRadius: T.rCard,
                border: `1px solid ${T.border}`,
                background: T.panel,
                color: T.fg,
                fontFamily: T.ui,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Dagens økt
            </button>
          )}
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
              borderRadius: T.rCard,
              border: `1px solid ${T.border}`,
              background: "transparent",
              color: T.fg,
              cursor: "pointer",
              flex: "none",
            }}
          >
            <Icon name="mic" size={18} />
          </button>
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
            background: T.bg,
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
            {messages.length === 0 && heltTom && (
              <TomTilstand
                ukeHarOkter={ukeHarOkter}
                weekNumber={data.weekNumber}
                onFangst={() => setFangstApen(true)}
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
                    background: T.panel2,
                    border: `1px solid ${T.border}`,
                    fontFamily: T.ui,
                    fontSize: 12.5,
                    color: T.mut,
                  }}
                >
                  <Icon name="message-circle" size={14} style={{ color: T.mut }} />
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
          </div>
        </div>

        {/* ── Composer (Paper: ctxline + field + capture mic monopoly) ── */}
        <div
          data-paper-composer
          style={{
            flex: "none",
            borderTop: `1px solid ${T.border}`,
            background: T.bg,
            padding: "8px 12px max(12px, env(safe-area-inset-bottom))",
          }}
        >
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 10.5,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: T.mut,
                padding: "4px 4px 0",
              }}
              data-od-id="toggle-context"
            >
              Ser: min plan · uke {data.weekNumber}
              {gjennomfore.nesteOkt ? ` · neste ${gjennomfore.nesteOkt.tid}` : " · ingen økt i dag"}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              {/* Paper .cbox — rammen eier paddingen, textarea er naken inni */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: T.panel,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.rCard,
                  padding: "8px 12px",
                }}
              >
                <Skrivefelt
                  variant="bare"
                  value={input}
                  onChange={setInput}
                  onSend={() => send(input)}
                  sender={busy}
                  placeholder="Spør om hva som helst. / for kommandoer, @ for øvelse."
                />
                {/* Paper .cmini — hintene er trykkflater som setter tegnet i feltet */}
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  {SNARVEIER.map((snarvei) => (
                    <button
                      key={snarvei.tegn}
                      type="button"
                      onClick={() => setInput(input.endsWith(snarvei.tegn) ? input : input + snarvei.tegn)}
                      aria-label={snarvei.merkelapp}
                      data-od-id={snarvei.odId}
                      className="v2-press v2-focus"
                      style={{
                        width: 44,
                        height: 44,
                        minHeight: 44,
                        display: "grid",
                        placeItems: "center",
                        border: "none",
                        borderRadius: T.rRow,
                        background: "transparent",
                        color: T.mut,
                        fontFamily: T.mono,
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                    >
                      {snarvei.tegn}
                    </button>
                  ))}
                </div>
              </div>
              {/* Paper: mic = eneste T.handling på Hjem, og står FØR send */}
              <button
                type="button"
                onClick={() => setFangstApen(true)}
                data-od-id="open-capture"
                aria-label="Fang en observasjon"
                aria-haspopup="dialog"
                className="v2-press v2-focus"
                style={{
                  /* Paper .btn.now.mic — --p-tap-capture 60px, only clay on Hjem */
                  flex: "none",
                  width: 60,
                  height: 60,
                  minHeight: 60,
                  borderRadius: 9999,
                  border: "none",
                  background: T.handling,
                  color: T.onHandling,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 10px color-mix(in srgb, var(--v2-handling) 40%, transparent)",
                }}
                data-paper-en-ting="true"
              >
                <Icon name="mic" size={24} />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (input.trim() && !busy) void send(input);
                }}
                disabled={!input.trim() || busy}
                aria-label="Send"
                data-od-id="send-message"
                className="v2-press v2-focus"
                style={{
                  /* Paper .sendbtn — --p-tap 44px, ink (ikke clay) */
                  flex: "none",
                  width: 44,
                  height: 44,
                  minHeight: 44,
                  borderRadius: T.rCard,
                  border: "none",
                  background: input.trim() && !busy ? T.fg : T.panel3,
                  color: input.trim() && !busy ? T.bg : T.mut,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: input.trim() && !busy ? "pointer" : "default",
                }}
              >
                <Icon name="send" size={18} />
              </button>
            </div>
            {/* Paper .eyebrow under composeren */}
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                color: T.mut,
              }}
            >
              Enter sender · shift+enter ny linje
            </div>
          </div>
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
            borderTop: `1px solid ${T.border}`,
            fontFamily: T.ui,
            fontSize: 13,
            fontWeight: 500,
            color: T.mut,
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
    </div>
  );
}
