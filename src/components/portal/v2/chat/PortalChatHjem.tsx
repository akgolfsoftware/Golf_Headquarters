"use client";

/**
 * PortalChatHjem — PlayerHQ "I dag", chat-først (designport steg 7 PR-A, mot
 * Paper-fasiten designsystem/paper/fase1/playerhq-chat-desktop.html/-mobil.html).
 * V2Shell (rail/bunn-nav) er uendret rundt denne komponenten.
 *
 * Matcher fasitens skall: hovedkolonne (tråd + composer, maks 720px lesebredde)
 * + fast artefaktkolonne 360px på desktop (≥1121px), som blir bunnark under
 * det. Se ArtefaktPanel/use-er-kompakt for grensen.
 *
 * Bygget med EKSISTERENDE v2-primitiver (SamtaleBoble/Skrivefelt/ForslagRad fra
 * components/v2/samtale.tsx) i stedet for å kopiere Paper sin egen rå CSS —
 * appen står fortsatt på v2-tokens (CLAUDE.md invariant 2).
 *
 * FØR/UNDER/ETTER er ekte lenker til dagens faktiske live-økt-ruter (ikke
 * inline modus-veksling som i fasiten) — de rutene finnes allerede og eier
 * sin egen sannhet; å bygge en parallell inline-tilstand ville duplisert den.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Mic } from "lucide-react";
import { T } from "@/lib/v2/tokens";
import { formatSg } from "@/lib/sg";
import { kategoriFraSnittscore } from "@/lib/domain/ak-kategori";
import { SamtaleBoble, SamtaleSkriver, SamtaleFeil, Skrivefelt, ForslagRad } from "@/components/v2/samtale";
import { MicButton } from "@/components/shared/mic-button";
import type { DashboardData } from "@/app/portal/actions";
import type { GjennomforeData } from "@/lib/portal-gjennomfore/gjennomfore-data";
import { usePortalChat } from "./use-portal-chat";
import { PortalStegListe } from "./PortalStegListe";
import { PortalHvorforDette } from "./PortalHvorforDette";
import { ArtefaktPanel } from "./ArtefaktPanel";
import { FangstModal } from "./FangstModal";
import { useErKompakt } from "./use-er-kompakt";
import type { PortalChatMessage } from "./types";

const FORSLAG = ["Hva skal jeg trene i dag?", "Hva var resultatet sist?", "Hva står på ukeplanen?"];

function meldingTekst(m: PortalChatMessage): string {
  return m.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
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
      {/* Artefaktpanel: ink/sekundær (fasit .btn.ink). Oransje «Én ting nå»
          lever kun i trådens NowBlock — aldri to accent-CTA samtidig. */}
      <Link
        href={okt.href}
        className="v2-press v2-focus"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 44,
          borderRadius: 10,
          background: T.fg,
          color: T.bg,
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

/** «Én ting nå» — systemet, uoppfordret. Fasit-mønster: KUN én accent-fylt
 * handling per skjermtilstand (KONTRAKT §3). Vises for kommende (upcoming)
 * ELLER aktiv (now) økt — ellers ærlig tom tilstand uten oransje CTA.
 * (Fix 2026-08-04: status "now" ble filtrert bort → 0 orange CTA på mobil når
 * økt allerede er startet; desktop fant knappen bare i artefaktpanelet.) */
function NowBlock({ gjennomfore, onSeMer }: { gjennomfore: GjennomforeData; onSeMer: () => void }) {
  const okt = gjennomfore.nesteOkt;
  if (!okt || (okt.status !== "upcoming" && okt.status !== "now")) return null;
  const erAktiv = okt.status === "now";
  return (
    <div
      style={{
        background: T.handlingSoft,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.09em", textTransform: "uppercase", color: T.mut, marginBottom: 8 }}>
        Én ting nå
      </div>
      <h3 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
        {erAktiv ? "Økta er i gang" : `Dagens økt starter ${okt.relTidTekst}`}
      </h3>
      <p style={{ margin: "0 0 16px", fontFamily: T.ui, fontSize: 14, color: T.mut, maxWidth: "52ch" }}>
        {okt.sted} · {okt.tid}. {okt.tittel}.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link
          href={okt.href}
          className="v2-press v2-focus"
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: 48,
            padding: "0 24px",
            borderRadius: 10,
            background: T.handling,
            color: T.onHandling,
            fontFamily: T.ui,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          {erAktiv ? "Fortsett økta" : "Start økta"}
        </Link>
        <button
          type="button"
          onClick={onSeMer}
          className="v2-press v2-focus"
          style={{
            minHeight: 44,
            padding: "0 16px",
            borderRadius: 10,
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
  );
}

/** Ærlig tom tilstand — coach har ikke publisert uken ennå. Aldri en blank
 * flate: alltid minst én reell vei videre (Enkelhet-regelen). */
function TomUkeState({
  ukenummer,
  onFangst,
  onForesla,
}: {
  ukenummer: number;
  onFangst: () => void;
  onForesla: (tekst: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 12,
        padding: "24px 20px",
        background: T.panel2,
        border: `1px dashed ${T.border}`,
        borderRadius: 12,
      }}
    >
      <h3 style={{ margin: 0, fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
        Anders har ikke publisert uke {ukenummer} ennå
      </h3>
      <p style={{ margin: 0, maxWidth: "46ch", fontFamily: T.ui, fontSize: 14, color: T.mut }}>
        Du har ingen økt i dag. Det betyr ikke at du står stille — her er tre ting du kan gjøre uansett.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onFangst}
          className="v2-press v2-focus"
          style={{
            minHeight: 48,
            padding: "0 20px",
            borderRadius: 10,
            border: `1px solid ${T.handling}`,
            background: T.handling,
            color: T.onHandling,
            fontFamily: T.ui,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Fang en observasjon
        </button>
        <button
          type="button"
          onClick={() => onForesla("Lag en 25-minutters økt")}
          className="v2-press v2-focus"
          style={{ minHeight: 44, padding: "0 16px", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: T.fg, fontFamily: T.ui, fontSize: 13, fontWeight: 500, cursor: "pointer" }}
        >
          Lag en 25-min økt selv
        </button>
        <Link
          href="/portal/planlegge"
          className="v2-press v2-focus"
          style={{ display: "inline-flex", alignItems: "center", minHeight: 44, padding: "0 16px", borderRadius: 10, border: `1px solid ${T.border}`, color: T.fg, fontFamily: T.ui, fontSize: 13, fontWeight: 500, textDecoration: "none" }}
        >
          Se forrige uke
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
  naaTekst: string;
}) {
  const { messages, status, error, sendMessage } = usePortalChat();
  const [input, setInput] = useState("");
  const [artefaktApen, setArtefaktApen] = useState(false);
  const [fangstApen, setFangstApen] = useState(false);
  const trådRef = useRef<HTMLDivElement>(null);
  const kompakt = useErKompakt();
  const busy = status === "streaming" || status === "submitted";

  useEffect(() => {
    trådRef.current?.scrollTo({ top: trådRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function send(tekst: string) {
    setInput("");
    await sendMessage(tekst);
  }

  const kategori = data.kpiStats.avgScore != null ? kategoriFraSnittscore(data.kpiStats.avgScore).kategori : null;
  const ukeHarOkter = data.week.some((d) => d.sessions.length > 0);
  const visTomUke = ukeHarOkter === false && messages.length === 0;

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0 }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {/* ── Topplinje ── */}
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
          <div>
            <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>I dag</h1>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.04em", color: T.mut, marginTop: 2 }}>
              {data.user.name}
              {kategori ? ` · kat. ${kategori}` : ""} · SG total {formatSg(data.kpiStats.sgTotal)} · {naaTekst}
            </div>
          </div>
          <LoopNav gjennomfore={gjennomfore} />
          {kompakt && (
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
              }}
            >
              Dagens økt
            </button>
          )}
          <button
            type="button"
            onClick={() => setFangstApen(true)}
            aria-label="Fang en observasjon"
            className="v2-press v2-focus"
            style={{
              width: 44,
              height: 44,
              display: "grid",
              placeItems: "center",
              borderRadius: 10,
              border: `1px solid ${T.border}`,
              background: "transparent",
              color: T.fg,
              cursor: "pointer",
            }}
          >
            <Mic size={17} />
          </button>
        </header>

        {/* ── Tråd ── */}
        <div ref={trådRef} style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "20px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
            {visTomUke ? (
              <TomUkeState ukenummer={data.weekNumber} onFangst={() => setFangstApen(true)} onForesla={send} />
            ) : (
              <>
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

                {!busy && <NowBlock gjennomfore={gjennomfore} onSeMer={() => setArtefaktApen(true)} />}
              </>
            )}
          </div>
        </div>

        {/* ── Composer ── */}
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

      <ArtefaktPanel open={artefaktApen} onClose={() => setArtefaktApen(false)} tittel="Dagens økt">
        <DagensOktInnhold gjennomfore={gjennomfore} />
      </ArtefaktPanel>

      <FangstModal open={fangstApen} onClose={() => setFangstApen(false)} />
    </div>
  );
}
