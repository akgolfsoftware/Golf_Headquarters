"use client";

/**
 * PortalChatHjem — PlayerHQ "I dag", chat-først (designport steg 7 PR-A).
 * Erstatter HjemV2 som innhold på /portal. V2Shell (rail/bunn-nav) er uendret
 * rundt denne komponenten — se src/app/portal/page.tsx.
 *
 * Matcher Paper-fasiten (designsystem/paper/fase1/playerhq-chat-desktop.html)
 * strukturelt: tråd (720-kolonne) + composer nederst + artefaktpanel som FAST
 * tredje kolonne på desktop (bunnark ≤1120px) + «Én ting nå»-innlegg + ærlig
 * tom tilstand + toppheader-kontekst + fangst-knapp i topplinja (avvik A1).
 * Bygget med EKSISTERENDE v2-primitiver — appen står på v2-tokens, ikke
 * Paper-markup direkte.
 *
 * «Én ting nå»-monopolet (fasit-kontrakt §3): maks ÉN aksentfarget handling
 * synlig. Den bor i nowblock (kommende økt) eller i tom tilstand — aldri
 * begge; artefaktpanelets Start-knapp er derfor blekk, ikke aksent.
 *
 * FØR/UNDER/ETTER er IKKE moduser i samme skjerm ennå — løkken lenker til
 * dagens faktiske live-økt-ruter når de finnes (uendret fra PR1).
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { T } from "@/lib/v2/tokens";
import { SamtaleBoble, SamtaleSkriver, SamtaleFeil, Skrivefelt, ForslagRad } from "@/components/v2/samtale";
import { MicButton } from "@/components/shared/mic-button";
import { kategoriFraSnittscore } from "@/lib/domain/ak-kategori";
import type { DashboardData } from "@/app/portal/actions";
import type { GjennomforeData } from "@/lib/portal-gjennomfore/gjennomfore-data";
import { usePortalChat } from "./use-portal-chat";
import { PortalStegListe } from "./PortalStegListe";
import { PortalHvorforDette } from "./PortalHvorforDette";
import { ArtefaktPanel, useErMobil } from "./ArtefaktPanel";
import type { PortalChatMessage } from "./types";

const FORSLAG = ["Hva skal jeg trene i dag?", "Hva var resultatet sist?", "Hva står på ukeplanen?"];

const OSLO_DATO_FMT = new Intl.DateTimeFormat("nb-NO", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  timeZone: "Europe/Oslo",
});

function meldingTekst(m: PortalChatMessage): string {
  return m.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

/** «Øyvind Rohjan · kat. D · SG total +2,92 · ons 06.08» — null-segmenter utelates ærlig. */
function kontekstLinje(data: DashboardData): string {
  const deler: string[] = [data.user.name];
  const snitt = data.kpiStats.avgScore;
  if (snitt != null) deler.push(`kat. ${kategoriFraSnittscore(snitt).kategori}`);
  const sg = data.kpiStats.sgTotal;
  if (sg != null) deler.push(`SG total ${sg >= 0 ? "+" : "−"}${Math.abs(sg).toFixed(2).replace(".", ",")}`);
  deler.push(OSLO_DATO_FMT.format(new Date()));
  return deler.join(" · ");
}

function LoopNav({ gjennomfore }: { gjennomfore: GjennomforeData }) {
  const under = gjennomfore.nesteOkt?.status === "now" ? gjennomfore.nesteOkt : null;
  const etter = gjennomfore.fullfortIdag.at(-1) ?? null;

  const stegStil = (aktiv: boolean, kan: boolean) => ({
    minHeight: 44,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    padding: "0 12px",
    borderRadius: 8,
    textDecoration: "none",
    color: aktiv ? T.fg : kan ? T.mut : T.border,
    fontFamily: T.mono,
    fontSize: 10,
    letterSpacing: "0.09em",
    textTransform: "uppercase" as const,
    background: aktiv ? T.panel2 : "transparent",
    pointerEvents: kan ? ("auto" as const) : ("none" as const),
  });

  return (
    <nav aria-label="Sløyfen før, under og etter økta" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
      <span style={stegStil(true, true)}>FØR</span>
      <span style={{ color: T.border, fontSize: 12 }} aria-hidden>→</span>
      {under ? (
        <Link href={under.href} style={stegStil(false, true)}>UNDER</Link>
      ) : (
        <span title="Ingen pågående økt akkurat nå" style={stegStil(false, false)}>UNDER</span>
      )}
      <span style={{ color: T.border, fontSize: 12 }} aria-hidden>→</span>
      {etter ? (
        <Link href={etter.href} style={stegStil(false, true)}>ETTER</Link>
      ) : (
        <span title="Ingen fullført økt å oppsummere i dag ennå" style={stegStil(false, false)}>ETTER</span>
      )}
    </nav>
  );
}

/** Blekk-knapp (bekreftende, men ikke «Én ting nå» — den er aksent og bor i nowblock). */
const inkKnappStil = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  padding: "0 16px",
  borderRadius: 10,
  background: T.fg,
  color: T.bg,
  border: 0,
  fontFamily: T.ui,
  fontSize: 13,
  fontWeight: 600,
  textDecoration: "none",
  cursor: "pointer",
} as const;

const ghostKnappStil = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  padding: "0 16px",
  borderRadius: 10,
  background: "transparent",
  color: T.fg,
  border: `1px solid ${T.border}`,
  fontFamily: T.ui,
  fontSize: 13,
  fontWeight: 500,
  textDecoration: "none",
  cursor: "pointer",
} as const;

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
      <Link href={okt.href} className="v2-press v2-focus" style={inkKnappStil}>
        {okt.status === "now" ? "Fortsett økta" : okt.status === "done" ? "Se oppsummering" : "Start økta"}
      </Link>
    </div>
  );
}

/** «Én ting nå»-innlegget — systemet, uoppfordret. Skjermens ENESTE aksenthandling. */
function EnTingNaa({ okt }: { okt: NonNullable<GjennomforeData["nesteOkt"]> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.09em", textTransform: "uppercase", color: T.mut }}>
        Én ting nå
      </div>
      <div
        style={{
          background: T.handlingSoft,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "flex-start",
        }}
      >
        <h3 style={{ margin: 0, fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
          {okt.status === "now" ? "Økta pågår nå" : "Dagens økt"}
        </h3>
        <p style={{ margin: 0, fontFamily: T.ui, fontSize: 13.5, color: T.mut, maxWidth: "52ch" }}>
          {okt.tittel} · {okt.meta}
        </p>
        <Link
          href={okt.href}
          className="v2-press v2-focus"
          style={{ ...inkKnappStil, minHeight: 48, background: T.handling, color: T.onHandling }}
        >
          {okt.status === "now" ? "Fortsett økta" : "Start økta"}
        </Link>
      </div>
    </div>
  );
}

/** Ærlig tom tilstand — «aldri en tom flate uten neste steg» (fasit .empty). */
function TomTilstand({ ukeNr, onForslag }: { ukeNr: number; onForslag: (tekst: string) => void }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 12,
        padding: "32px 24px",
        background: T.panel2,
        border: `1px dashed ${T.border}`,
        borderRadius: 12,
      }}
    >
      <h3 style={{ margin: 0, fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
        Ingen publisert plan for uke {ukeNr} ennå
      </h3>
      <p style={{ margin: 0, fontFamily: T.ui, fontSize: 13.5, color: T.mut, maxWidth: "46ch" }}>
        Du har ingen økt i dag. Det betyr ikke at du står stille — her er tre ting du kan gjøre uansett.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          className="v2-press v2-focus"
          onClick={() => onForslag("Lag en 25-minutters økt")}
          style={{ ...inkKnappStil, minHeight: 48, background: T.handling, color: T.onHandling }}
        >
          Lag en 25-min økt selv
        </button>
        <button
          type="button"
          className="v2-press v2-focus"
          onClick={() => onForslag("Hva trente jeg forrige uke?")}
          style={ghostKnappStil}
        >
          Se forrige uke
        </button>
        <Link href="/portal/planlegge" className="v2-press v2-focus" style={ghostKnappStil}>
          Åpne planen
        </Link>
      </div>
    </div>
  );
}

export function PortalChatHjem({
  data,
  gjennomfore,
}: {
  data: DashboardData;
  gjennomfore: GjennomforeData;
}) {
  const { messages, status, error, sendMessage } = usePortalChat();
  const [input, setInput] = useState("");
  const [artefaktApen, setArtefaktApen] = useState(false);
  const mobil = useErMobil();
  const trådRef = useRef<HTMLDivElement>(null);
  const busy = status === "streaming" || status === "submitted";

  const kommendeOkt = gjennomfore.nesteOkt;
  // Tom tilstand = ingen økt i dag OG ingen planlagte minutter i uka.
  const ukeErTom = !kommendeOkt && gjennomfore.fullfortIdag.length === 0 && data.weekProgress.plannedMin === 0;

  useEffect(() => {
    trådRef.current?.scrollTo({ top: trådRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function send(tekst: string) {
    setInput("");
    await sendMessage(tekst);
  }

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0 }}>
      {/* ── Midtkolonne (tråd + composer) ── */}
      <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {/* ── Topplinje: tittel + kontekst · sløyfe · fangst · (mobil) Dagens økt ── */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "12px 20px",
            borderBottom: `1px solid ${T.border}`,
            background: T.bg,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>I dag</h1>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 10.5,
                letterSpacing: "0.04em",
                color: T.mut,
                marginTop: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {kontekstLinje(data)} · uke {data.weekNumber}
            </div>
          </div>
          <LoopNav gjennomfore={gjennomfore} />
          {/* Fangst-knapp (A1): diktér en observasjon rett inn i composeren.
              Full fangst-modal med lagring til coach-innboks er egen PR. */}
          <MicButton
            variant="standalone"
            onResult={(tekst) => setInput((v) => (v ? `${v} ${tekst}` : tekst))}
            disabled={busy}
          />
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
                background: "transparent",
                color: T.fg,
                fontFamily: T.ui,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Dagens økt
            </button>
          )}
        </header>

        {/* ── Tråd ── */}
        <div ref={trådRef} style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "20px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
            {messages.length === 0 && (
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
                  <Sparkles size={14} style={{ color: T.lime }} />
                  Spør meg om treningen din — jeg henter ekte tall fra planen og loggen din.
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

            {/* Systemet, uoppfordret: «Én ting nå» ELLER ærlig tom tilstand — aldri begge. */}
            {kommendeOkt && <EnTingNaa okt={kommendeOkt} />}
            {ukeErTom && <TomTilstand ukeNr={data.weekNumber} onForslag={send} />}
          </div>
        </div>

        {/* ── Composer — festet nederst i midtkolonnen ── */}
        <div style={{ borderTop: `1px solid ${T.border}`, background: T.panel, padding: "12px 20px 16px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <Skrivefelt
                value={input}
                onChange={setInput}
                onSend={() => send(input)}
                sender={busy}
                placeholder="Spør om treningen din …"
              />
            </div>
            <MicButton variant="suffix" onResult={(tekst) => setInput((v) => (v ? `${v} ${tekst}` : tekst))} disabled={busy} />
          </div>
        </div>
      </div>

      {/* ── Artefaktpanel: fast kolonne på desktop, bunnark på mobil ── */}
      <ArtefaktPanel
        open={artefaktApen}
        onClose={() => setArtefaktApen(false)}
        tittel="Dagens økt"
        statusTag={kommendeOkt ? "Planlagt" : gjennomfore.fullfortIdag.length > 0 ? "Fullført" : null}
      >
        <DagensOktInnhold gjennomfore={gjennomfore} />
      </ArtefaktPanel>
    </div>
  );
}
