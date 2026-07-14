/**
 * AgencyOS v2 — AI Workspace (`/admin/ai`, AgencyOS Bølge 3.13, 2026-07-14).
 * Port fra `(legacy)/ai/page.tsx` — samme 3 faner (Kode-sesjoner/Chat/Agenter
 * 24/7), samme `AgentRun`/`PlanAction`-datamodell. Server-rendert (som
 * legacy-siden — ingen klient-JS trengtes der, kun native forms + Link-faner),
 * `applyAiAction` sendes ned som ekte server action fra page.tsx.
 *
 * MERK (funnet under porten, ikke fikset — utenfor skopet til en design-port):
 * Kode-sesjon-skjemaet poster til `/admin/ai/run`, som IKKE finnes noe sted i
 * koden (verifisert grep) — var allerede en død/broken handling i legacy-
 * siden også. Bevart uendret (samme atferd som før), meldt i
 * MASTER-SKJERMPLAN.md som en funnet feil, ikke stille reparert.
 */

import Link from "next/link";
import type { CSSProperties } from "react";
import { Caps, Tittel, Kort, Knapp, StatusPill, Icon, T } from "@/components/v2";

export type AiFane = "kode" | "chat" | "agenter";

export interface AiKjoringV2 {
  id: string;
  agentName: string;
  status: string;
  datoTekst: string;
}

export interface AiHandlingV2 {
  id: string;
  actionType: string;
  status: string;
  forslagTekst: string;
}

export interface AdminAiV2Data {
  fane: AiFane;
  siste: AiKjoringV2[];
  handlinger: AiHandlingV2[];
  applyAction: (formData: FormData) => Promise<void>;
}

const feltStil: CSSProperties = {
  width: "100%", boxSizing: "border-box", appearance: "none",
  background: T.panel2, border: `1px solid ${T.borderS}`, borderRadius: 11,
  padding: "10px 13px", fontFamily: T.ui, fontSize: 13.5, color: T.fg, outline: "none",
};

const FANER: { key: AiFane; label: string }[] = [
  { key: "kode", label: "Kode-sesjoner" },
  { key: "chat", label: "Chat" },
  { key: "agenter", label: "Agenter 24/7" },
];

function FaneRad({ aktiv }: { aktiv: AiFane }) {
  return (
    <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${T.border}` }}>
      {FANER.map((f) => (
        <Link
          key={f.key}
          href={`/admin/ai?tab=${f.key}`}
          style={{
            padding: "10px 16px", fontFamily: T.ui, fontSize: 13, fontWeight: 600, textDecoration: "none",
            color: f.key === aktiv ? T.lime : T.mut,
            borderBottom: f.key === aktiv ? `2px solid ${T.lime}` : "2px solid transparent",
            marginBottom: -1,
          }}
        >
          {f.label}
        </Link>
      ))}
    </div>
  );
}

function ChatMockV2() {
  return (
    <Kort>
      <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Chat med AI (Claude/Grok/Gemini)</div>
      <p style={{ marginTop: 4, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Mock chat for nå. I full, koble til caddie eller multi LLM.</p>
      <textarea placeholder="Skriv spørsmål om booking eller kode..." rows={4} style={{ ...feltStil, marginTop: 12, resize: "vertical" }} />
      <div style={{ marginTop: 10 }}>
        <Knapp icon="send">Send</Knapp>
      </div>
    </Kort>
  );
}

function AgenterInfoV2() {
  return (
    <Kort>
      <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Agenter 24/7</div>
      <p style={{ marginTop: 4, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
        Se <Link href="/admin/agents" style={{ color: T.lime }}>/admin/agents</Link> for full liste og manuell trigger. Cron kjører dem 24/7.
      </p>
    </Kort>
  );
}

function KodeSesjonV2() {
  return (
    <Kort>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <Icon name="bot" size={18} style={{ color: T.lime }} />
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Multi-modell kode-sesjoner</div>
      </div>
      <p style={{ marginTop: 4, fontFamily: T.ui, fontSize: 12.5, lineHeight: 1.6, color: T.mut }}>
        Velg modell og kjør full agent-sesjon direkte her. Kontekst fra akgolf-hq + akgolf-booking. Alle agenter
        (booking-optimizer, gap-filler, conflict-monitor, demand-predictor, ai-code-reviewer, alerts) produseres og
        trigges automatisk.
      </p>

      <form action="/admin/ai/run" method="POST" style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
        <label style={{ display: "block" }}>
          <Caps size={9} style={{ display: "block", marginBottom: 7 }}>Modell</Caps>
          <select name="model" defaultValue="claude" style={feltStil}>
            <option value="claude">Claude (Anthropic)</option>
            <option value="grok">Grok (xAI)</option>
            <option value="gemini">Gemini (Google)</option>
          </select>
        </label>
        <label style={{ display: "block" }}>
          <Caps size={9} style={{ display: "block", marginBottom: 7 }}>Repo / Område</Caps>
          <select name="repo" defaultValue="hq" style={feltStil}>
            <option value="hq">akgolf-hq (AgencyOS + PlayerHQ)</option>
            <option value="booking">akgolf-booking</option>
            <option value="both">Begge</option>
          </select>
        </label>
        <label style={{ display: "block" }}>
          <Caps size={9} style={{ display: "block", marginBottom: 7 }}>Task / Instruksjon</Caps>
          <textarea
            name="task"
            rows={4}
            defaultValue="Forbedre kalender i booking til å bruke ekte CoachAvailability + Booking data. Legg til bedre Plan-kobling i AgencyOS admin."
            style={{ ...feltStil, resize: "vertical" }}
          />
        </label>
        <div>
          <Knapp icon="sparkles" type="submit">Kjør kode-sesjon</Knapp>
        </div>
      </form>
    </Kort>
  );
}

function HandlingRadV2({ h, applyAction }: { h: AiHandlingV2; applyAction: (formData: FormData) => Promise<void> }) {
  return (
    <div style={{ borderRadius: 10, border: `1px solid ${T.border}`, padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>{h.actionType}</span>
        <StatusPill tone={h.status === "ACCEPTED" ? "up" : h.status === "REJECTED" ? "down" : "info"}>{h.status}</StatusPill>
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.forslagTekst}</div>
      {h.status === "PENDING" && (
        <form action={applyAction}>
          <input type="hidden" name="actionId" value={h.id} />
          <button
            type="submit"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: T.mono, fontSize: 11, color: T.lime, textDecoration: "underline" }}
          >
            Apply + log (godkjenn)
          </button>
        </form>
      )}
    </div>
  );
}

export function AdminAiV2({ fane, siste, handlinger, applyAction }: AdminAiV2Data) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps size={9}>AI Workspace</Caps>
        <Tittel em="kode-sesjoner">Claude · Grok · Gemini</Tittel>
      </div>

      <FaneRad aktiv={fane} />

      {fane === "kode" && <KodeSesjonV2 />}
      {fane === "chat" && <ChatMockV2 />}
      {fane === "agenter" && <AgenterInfoV2 />}

      <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>Sesjoner logges som AgentRun. Godkjenn forslag før apply.</div>

      <Kort>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>Forslag til flere agenter (24/7 for deg)</div>
        <ul style={{ marginTop: 8, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
          <li><strong style={{ color: T.fg }}>booking-optimizer</strong>: Analyserer bookinger, foreslår bedre availability. Kjør daglig via cron.</li>
          <li><strong style={{ color: T.fg }}>availability-24-7-monitor</strong>: Sjekker lav availability hver 15 min, lager alerts.</li>
          <li><strong style={{ color: T.fg }}>ai-code-reviewer</strong>: Ukentlig AI review av booking/calendar kode, foreslår forbedringer (bruk denne workspace).</li>
          <li><strong style={{ color: T.fg }}>booking-demand-predictor</strong>: Predikerer travle tider, auto-forslag til slots.</li>
          <li><strong style={{ color: T.fg }}>24-7-booking-alerts</strong>: Proactive varsler til spillere/coach via caddie når slots åpnes.</li>
        </ul>
        <p style={{ marginTop: 10, fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>
          Slik 24/7: Legg til i vercel.json cron (f.eks. &apos;*/15 * * * *&apos; for monitor). Agenter lager PlanAction/Signal, du ser i /admin/agents og caddie. AI workspace kan trigge manuelt eller via cron for kode tasks. Alt logges, proactive via Telegram/caddie.
        </p>
      </Kort>

      {siste.length > 0 && (
        <Kort>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>Siste AI kode-sesjoner</div>
          <ul style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            {siste.map((r) => (
              <li key={r.id} style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>{r.agentName} — {r.status} — {r.datoTekst}</li>
            ))}
          </ul>
        </Kort>
      )}

      {handlinger.length > 0 && (
        <Kort>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>AI kode-historikk &amp; apply</div>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {handlinger.map((h) => <HandlingRadV2 key={h.id} h={h} applyAction={applyAction} />)}
          </div>
        </Kort>
      )}
    </div>
  );
}
