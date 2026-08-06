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
 * økt starter …» + «Start økta», T.handling-monopolet) vises når dagens økt
 * ikke er startet. (3) Ærlig tom tilstand (ingen fabrikkerte påstander — kun
 * data.week/gjennomfore) med tre veier videre. (4) Toppheader viser
 * navn · kategori (ak-kategori.ts) · SG total (ekte kpiStats) · dato (Oslo,
 * beregnet server-side i page.tsx). (5) Fangst-knapp i topplinja åpner
 * FangstModal.
 *
 * FØR/UNDER/ETTER er IKKE bygget om til moduser i denne skjermen ennå (se
 * plan-designport-alle-skjermer.md steg 7 PR1, punkt 9) — løkken lenker til
 * dagens faktiske live-økt-ruter når de finnes, i stedet for å late som en
 * modus-veksling som ikke er bygget.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { T } from "@/lib/v2/tokens";
import { SamtaleBoble, SamtaleSkriver, SamtaleFeil, Skrivefelt, ForslagRad } from "@/components/v2/samtale";
import { MicButton } from "@/components/shared/mic-button";
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
    <nav aria-label="Sløyfen før, under og etter økta" style={{ display: "flex", alignItems: "center", gap: 4 }}>
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
          background: T.lime,
          color: T.onLime,
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

/** «Én ting nå» — systemets uoppfordrede innlegg, T.handling-monopolet (maks én gang per skjerm). */
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
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: 44,
              padding: "0 16px",
              borderRadius: T.rTag,
              background: T.handling,
              color: T.onHandling,
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

/** Ærlig tom tilstand — ingen fabrikkerte påstander, kun det vi faktisk vet (week/gjennomfore). */
function TomTilstand({ ukeHarOkter, weekNumber, onFangst, onForslag }: { ukeHarOkter: boolean; weekNumber: number; onFangst: () => void; onForslag: (s: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h3 style={{ margin: 0, fontFamily: T.disp, fontSize: 16, fontWeight: 600, color: T.fg }}>
          {ukeHarOkter ? "Ingen økt i dag" : `Ingen økter i uke ${weekNumber} ennå`}
        </h3>
        <p style={{ margin: "6px 0 0", fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.5 }}>
          Det betyr ikke at du står stille — her er tre ting du kan gjøre uansett.
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onFangst}
          className="v2-press v2-focus"
          style={{
            minHeight: 44,
            padding: "0 16px",
            borderRadius: T.rTag,
            border: "none",
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
          onClick={() => onForslag("Lag en 25-minutters økt")}
          className="v2-press v2-focus"
          style={{ minHeight: 44, padding: "0 16px", borderRadius: T.rTag, border: `1px solid ${T.border}`, background: "transparent", color: T.fg, fontFamily: T.ui, fontSize: 13, fontWeight: 500, cursor: "pointer" }}
        >
          Lag en 25-min økt selv
        </button>
        <button
          type="button"
          onClick={() => onForslag("Vis forrige uke")}
          className="v2-press v2-focus"
          style={{ minHeight: 44, padding: "0 16px", borderRadius: T.rTag, border: `1px solid ${T.border}`, background: "transparent", color: T.fg, fontFamily: T.ui, fontSize: 13, fontWeight: 500, cursor: "pointer" }}
        >
          Se forrige uke
        </button>
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
      style={{
        display: "grid",
        gridTemplateColumns: mobil ? "1fr" : "minmax(0,1fr) 360px",
        height: "100%",
        minHeight: 0,
      }}
    >
      {/* ── Hovedkolonne: header + tråd + composer ── */}
      <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, minWidth: 0 }}>
        {/* ── Topplinje ── */}
        <header
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            columnGap: 16,
            rowGap: 8,
            padding: "12px 20px",
            borderBottom: `1px solid ${T.border}`,
            background: T.bg,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>I dag</h1>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.04em", color: T.mut, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {data.user.name} · kat. {kategori ?? "—"} · SG total {sgTekst} · {naaTekst.ukedag} {naaTekst.dato} {naaTekst.klokke}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LoopNav gjennomfore={gjennomfore} />
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
            <button
              type="button"
              onClick={() => setFangstApen(true)}
              aria-label="Fang en observasjon"
              aria-haspopup="dialog"
              aria-expanded={fangstApen}
              className="v2-press v2-focus"
              style={{
                minHeight: 36,
                minWidth: 36,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                background: "transparent",
                color: T.fg,
                cursor: "pointer",
              }}
            >
              <Icon name="mic" size={16} />
            </button>
          </div>
        </header>

        {/* ── Tråd ── */}
        <div ref={trådRef} style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "20px" }}>
          <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
            {messages.length === 0 && heltTom && (
              <TomTilstand ukeHarOkter={ukeHarOkter} weekNumber={data.weekNumber} onFangst={() => setFangstApen(true)} onForslag={send} />
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

            {visEnTingNa && gjennomfore.nesteOkt && (
              <EnTingNaBanner okt={gjennomfore.nesteOkt} klokke={naaTekst.klokke} onSePlan={() => setArtefaktApen(true)} />
            )}
          </div>
        </div>

        {/* ── Composer ── */}
        <div style={{ borderTop: `1px solid ${T.border}`, background: T.panel, padding: "12px 20px 16px" }}>
          <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", gap: 8, alignItems: "flex-end" }}>
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
