"use client";

/**
 * PortalChatHjem — PlayerHQ "I dag", chat-først (designport steg 7 PR-A,
 * retter avviksliste A1 mot plan-designport-alle-skjermer.md).
 * Erstatter HjemV2 som innhold på /portal. V2Shell (rail/bunn-nav) er uendret
 * rundt denne komponenten — se src/app/portal/page.tsx.
 *
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
import { FangstModal } from "./FangstModal";
import type { PortalChatMessage } from "./types";

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
      style={{ display: "flex", alignItems: "stretch", gap: 6, padding: "4px 0 8px" }}
      data-od-id="loop-nav"
    >
      {steg.map((s, i) => {
        const on = s.id === aktiv;
        const kan = Boolean(s.href);
        const inner = (
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              minHeight: 48,
              flex: 1,
              borderRadius: 10,
              background: on ? T.panel : "transparent",
              color: on ? T.fg : kan ? T.fg2 : T.mut,
              fontFamily: T.mono,
              fontSize: 11,
              fontWeight: on ? 600 : 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              border: on ? `1px solid ${T.border}` : "1px solid transparent",
              boxShadow: on ? "inset 0 -2px 0 0 " + T.fg : undefined,
              pointerEvents: kan || on ? "auto" : "none",
              opacity: kan || on ? 1 : 0.55,
            }}
          >
            <span style={{ fontWeight: 700 }}>{s.label}</span>
            <span style={{ fontSize: 9, opacity: 0.75, marginTop: 2, textTransform: "none", letterSpacing: 0 }}>
              {s.sub}
            </span>
          </span>
        );
        return (
          <span key={s.id} style={{ display: "contents" }}>
            {s.href && !on ? (
              <Link
                href={s.href}
                style={{ flex: 1, textDecoration: "none" }}
                data-od-id={`loop-${s.id}`}
              >
                {inner}
              </Link>
            ) : (
              <span
                style={{ flex: 1 }}
                aria-current={on ? "step" : undefined}
                data-od-id={`loop-${s.id}`}
              >
                {inner}
              </span>
            )}
            {i < steg.length - 1 && (
              <span style={{ alignSelf: "center", color: T.border, fontSize: 12, padding: "0 2px" }} aria-hidden>
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
          background: T.forest,
          color: T.onForest,
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
              /* Paper .btn.ink — NOT accent; mic owns T.handling on Hjem */
              background: T.forest,
              color: T.onForest,
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
  const btn: CSSProperties = {
    flex: "1 1 140px",
    minHeight: 48,
    padding: "0 16px",
    borderRadius: 12,
    border: `1px solid ${T.border}`,
    background: T.bg,
    color: T.fg,
    fontFamily: T.ui,
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 1px 0 rgba(20,20,19,0.04)",
  };
  return (
    <div
      data-od-id="state-empty"
      style={{
        margin: "auto 0",
        maxWidth: 480,
        width: "100%",
        padding: "28px 22px",
        borderRadius: 16,
        border: `1px solid ${T.border}`,
        background: T.panel,
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div>
        <h3
          style={{
            margin: 0,
            fontFamily: T.disp,
            fontSize: 18,
            fontWeight: 600,
            color: T.fg,
            letterSpacing: "-0.01em",
            lineHeight: 1.25,
          }}
        >
          {ukeHarOkter ? "Ingen økt i dag" : `Ingen økter i uke ${weekNumber} ennå`}
        </h3>
        <p
          style={{
            margin: "10px 0 0",
            fontFamily: T.ui,
            fontSize: 14,
            color: T.fg2,
            lineHeight: 1.55,
            maxWidth: "46ch",
          }}
        >
          Det betyr ikke at du står stille — her er tre ting du kan gjøre uansett.
        </p>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
          style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg2, textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          Se ukeplanen
        </Link>
        <Link
          href="/portal/kalender"
          data-od-id="empty-link-kalender"
          style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg2, textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          Kalender
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
  const heltTom = gjennomfore.nesteOkt === null && gjennomfore.fullfortIdag.length === 0;
  const visEnTingNa = gjennomfore.nesteOkt !== null && gjennomfore.nesteOkt.status === "upcoming";

  return (
    <div
      data-paper-portal-hjem
      style={{
        display: "grid",
        gridTemplateColumns: mobil ? "1fr" : "minmax(0,1fr) 360px",
        height: "100%",
        minHeight: 0,
      }}
    >
      {/* ── Hovedkolonne: header + loop + tråd + composer ── */}
      <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, minWidth: 0, background: T.bg }}>
        {/* ── Topplinje ── */}
        <header
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            columnGap: 16,
            rowGap: 8,
            padding: "14px 20px 10px",
            background: T.bg,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg, letterSpacing: "-0.01em" }}>
              I dag
            </h1>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 11,
                letterSpacing: "0.04em",
                color: T.mut,
                marginTop: 3,
              }}
            >
              {data.user.name} · kat. {kategori ?? "—"} · SG total {sgTekst} · {naaTekst.ukedag} {naaTekst.dato} {naaTekst.klokke}
            </div>
          </div>
          {mobil && (
            <button
              type="button"
              onClick={() => setArtefaktApen(true)}
              className="v2-press v2-focus"
              style={{
                minHeight: 36,
                padding: "0 12px",
                borderRadius: 8,
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
        </header>

        {/* Paper loop — full width under header */}
        <div style={{ padding: "0 16px 8px", borderBottom: `1px solid ${T.border}` }}>
          <LoopNav gjennomfore={gjennomfore} />
        </div>

        {/* ── Tråd ── */}
        <div
          ref={trådRef}
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            padding: "24px 20px",
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
              alignItems: messages.length === 0 && heltTom ? "center" : undefined,
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
          style={{
            flex: "none",
            borderTop: `1px solid ${T.border}`,
            background: T.bg,
            padding: "10px 16px max(14px, env(safe-area-inset-bottom))",
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
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: T.panel,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.rCard,
                  padding: "2px 4px",
                }}
              >
                <Skrivefelt
                  variant="bare"
                  value={input}
                  onChange={setInput}
                  onSend={() => send(input)}
                  sender={busy}
                  placeholder="Spør om hva som helst. / for kommandoer."
                />
              </div>
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
                  flex: "none",
                  width: 48,
                  height: 48,
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
              {/* Paper: mic = eneste T.handling på Hjem */}
              <button
                type="button"
                onClick={() => setFangstApen(true)}
                data-od-id="open-capture"
                aria-label="Fang en observasjon"
                aria-haspopup="dialog"
                className="v2-press v2-focus"
                style={{
                  flex: "none",
                  width: 52,
                  height: 52,
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
              >
                <Icon name="mic" size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ArtefaktPanel mobil={mobil} open={artefaktApen} onClose={() => setArtefaktApen(false)} tittel="Dagens økt">
        <DagensOktInnhold gjennomfore={gjennomfore} />
      </ArtefaktPanel>

      {fangstApen && (
        <FangstModal
          onClose={() => setFangstApen(false)}
          onLeggITraden={(tekst) => {
            void send(tekst);
          }}
        />
      )}
    </div>
  );
}
