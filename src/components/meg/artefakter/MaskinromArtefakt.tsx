"use client";

/**
 * Maskinrommet-artefaktet — Jarvis' egen helse. Fasit: jarvis/meg-maskinrom.html
 * («sysrad»-rader: form + farge for OK/FEILET, venstre kant + myk bakgrunn på
 * feilede rader — «skal skrike», ikke bare rødt).
 *
 * Bevisst avvik fra fasiten (ærlig-tomme-tilstander-prinsippet, se
 * src/lib/jarvis/repository.ts): fasiten viser fem innsamlere (Gmail,
 * iMessage, Telegram, Kalender, Anrop) og en alltid-grønn Ollama/LaunchAgent-
 * rad. I kode finnes kun to ekte innsamlere (Gmail, iMessage) med et faktisk
 * AgentRun-spor — resten er ikke bygget, og Ollama/LaunchAgent-helse kan
 * aldri leses fra Vercel (Tailscale-only, se .claude/rules/gotchas.md). Disse
 * vises derfor som egne, tydelig merkede seksjoner i stedet for oppdiktede
 * statussirkler.
 */
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { InspektorBlokk, InspektorLinje } from "@/components/v2/inspektorpanel";
import type { InnsamlerStatus, SystemHelse } from "@/lib/jarvis/types";

function relativTid(iso: string | null, na: Date): string {
  if (!iso) return "aldri";
  const ms = na.getTime() - new Date(iso).getTime();
  const min = Math.round(ms / 60000);
  if (min < 1) return "akkurat nå";
  if (min < 60) return `${min} min siden`;
  const t = Math.floor(min / 60);
  return `${t}t ${min % 60}min siden`;
}

function StatusRad({ innsamler, na }: { innsamler: InnsamlerStatus; na: Date }) {
  const feilet = innsamler.helse === "FEILET";
  const ukjent = innsamler.helse === "UKJENT";
  return (
    <div
      data-od-id={`panel-innsamler-${innsamler.id}`}
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        background: feilet ? T.panel2 : T.panel,
        border: `1px solid ${T.border}`,
        borderLeft: feilet ? `3px solid ${T.down}` : `1px solid ${T.border}`,
        borderRadius: T.rTag,
        padding: feilet ? "10px 10px 10px 8px" : "10px",
      }}
    >
      <span style={{ flex: "none", width: 14, display: "flex", justifyContent: "center" }}>
        {innsamler.helse === "OK" && (
          <span style={{ width: 8, height: 8, borderRadius: T.rPill, background: T.up, display: "block" }} />
        )}
        {feilet && <Icon name="triangle-alert" size={14} strokeWidth={2} style={{ color: T.down }} />}
        {ukjent && <span style={{ fontFamily: T.mono, fontSize: 12, color: T.mut }}>—</span>}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontFamily: T.disp,
            fontSize: 13,
            fontWeight: 600,
            color: feilet ? T.down : T.fg,
          }}
        >
          {innsamler.navn}
          {feilet && ` — feilet ${relativTid(innsamler.sistKjort, na)}`}
        </span>
        <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>
          {innsamler.frekvens ?? "ukjent kjøreplan"} · sist {relativTid(innsamler.sistKjort, na)}
          {innsamler.feilmelding ? ` · ${innsamler.feilmelding}` : ""}
        </span>
      </span>
    </div>
  );
}

const IKKE_BYGGET: { navn: string; forklaring: string }[] = [
  { navn: "Kalendervakt", forklaring: "Ingen avviks-agent bygget ennå — se jarvis/meg-kalendervakt.html for planlagt design." },
  { navn: "Anrop-logg", forklaring: "Ingen samtaleloggintegrasjon finnes i kode ennå." },
  { navn: "Telegram", forklaring: "Botten svarer via webhook (alltid på) — ingen kjøreplan å måle helse mot." },
];

export function MaskinromArtefakt({ data, na }: { data: SystemHelse; na: Date }) {
  const antallFeilet = data.innsamlere.filter((i) => i.helse === "FEILET").length;

  return (
    <div data-od-id="panel-maskinrom" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          fontFamily: T.mono,
          fontSize: 11,
          color: antallFeilet > 0 ? T.down : T.up,
          fontWeight: 600,
        }}
      >
        {antallFeilet > 0
          ? `${antallFeilet} av ${data.innsamlere.length} innsamlere feilet`
          : `alle ${data.innsamlere.length} innsamlere OK`}
      </div>

      <InspektorBlokk label="Innsamlere">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {data.innsamlere.map((i) => (
            <StatusRad key={i.id} innsamler={i} na={na} />
          ))}
        </div>
      </InspektorBlokk>

      <InspektorBlokk label="Ikke bygget ennå">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {IKKE_BYGGET.map((r) => (
            <div
              key={r.navn}
              data-od-id={`panel-ikke-bygget-${r.navn.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                border: `1px dashed ${T.border}`,
                borderRadius: T.rTag,
                padding: "8px 10px",
              }}
            >
              <span style={{ fontFamily: T.disp, fontSize: 12.5, fontWeight: 600, color: T.mut }}>{r.navn}</span>
              <span style={{ fontFamily: T.ui, fontSize: 11, color: T.mut }}>{r.forklaring}</span>
            </div>
          ))}
        </div>
      </InspektorBlokk>

      <InspektorBlokk label="Agent og kjøretid — siste 7 dager">
        {data.aiKostSum.antallKall === 0 ? (
          <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>
            Ingen AI-kostnad registrert for Jarvis ennå.
          </span>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <InspektorLinje label="Kall" verdi={<span style={{ fontFamily: T.mono }}>{data.aiKostSum.antallKall}</span>} />
            <InspektorLinje
              label="Tokens (inn/ut)"
              verdi={
                <span style={{ fontFamily: T.mono }}>
                  {data.aiKostSum.inputTokens.toLocaleString("nb-NO")} / {data.aiKostSum.outputTokens.toLocaleString("nb-NO")}
                </span>
              }
            />
            <InspektorLinje
              label="Kostnad"
              verdi={
                <span style={{ fontFamily: T.mono }}>
                  {data.aiKostSum.costUsd != null ? `$${data.aiKostSum.costUsd.toFixed(2)}` : "ukjent pris"}
                </span>
              }
            />
          </div>
        )}
      </InspektorBlokk>

      <InspektorBlokk label="Ollama · LaunchAgents (Mac Mini)">
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
            border: `1px dashed ${T.border}`,
            borderRadius: T.rTag,
            padding: "8px 10px",
          }}
        >
          <Icon name="wifi" size={14} strokeWidth={1.8} style={{ color: T.mut, flex: "none", marginTop: 1 }} />
          <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>
            Ukjent herfra — Ollama og LaunchAgents kjører lokalt på Mac Minien over Tailscale, og Vercel når
            aldri det nettet. Sjekk direkte på maskinen (Terminal/LaunchAgent-status) inntil et lokalt
            helsesjekk-endepunkt finnes.
          </span>
        </div>
      </InspektorBlokk>
    </div>
  );
}
