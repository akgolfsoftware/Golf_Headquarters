"use client";

/**
 * Precision Athletics — Caddie og Jarvis AI-hub (AG-19).
 *
 * Kilde: Claude Design AG-19 (arkiv/2026-09-30/agencyos/screens/AG-19.jsx).
 * Ruter: /admin/caddie, /admin/jarvis, /admin/agents/[agentId].
 *
 * 4 faner:
 * 1. ko: Agentkjøringer fra loggen (AgentRun)
 * 2. prosj: Prosjekter (ligger i Notion)
 * 3. skills: Skills, bare visning
 * 4. chat: Samtale (ikke koblet ennå)
 */

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Pencil,
  Send,
  Sparkles,
} from "lucide-react";
import {
  FeilTilstand,
  Ikon,
  Knapp,
  KnappLenke,
  LasterTilstand,
  Meta,
  Sidehode,
  StatusPille,
  TomTilstand,
} from "@/components/precision/pa";
import {
  Faner,
  Kort,
  KortHode,
  Nokkelverdi,
} from "@/components/precision/pa-a5";
import "@/styles/precision-a19.css";

export type AgentKjoring = {
  id: string;
  agent: string;
  /** «Kjørt» = ferdig uten feil. Godkjenning skjer i Kø, ikke her. */
  st: "Kjørt" | "Feilet";
  /** «dd.mm tt:mm» */
  t: string;
  /** «4 s» eller «—» */
  dur: string;
  err?: string | null;
};

export type AgentProsjekt = [string, string, string]; // [tittel, oppgaver, status]
export type AgentSkill = [string, string, string, boolean]; // [id, navn, beskrivelse, på]

export type AG19Data = {
  runs: AgentKjoring[];
  projects: AgentProsjekt[];
  skills: AgentSkill[];
};

export type AG19Tilstand = "data" | "tom" | "laster" | "feil";

export type AG19CaddieHubProps = {
  tilstand?: AG19Tilstand;
  data?: AG19Data;
  startFane?: string;
  startKjoringId?: string;
};

const TOM_DATA: AG19Data = { runs: [], projects: [], skills: [] };

const TONE_MAP: Record<AgentKjoring["st"], "ok" | "warn"> = {
  Kjørt: "ok",
  Feilet: "warn",
};

const SIDEHODE_SUB =
  "Jarvis og agentene forbereder alt. Ingenting går ut til et menneske før du har godkjent utkastet.";

export function AG19CaddieHub({
  tilstand = "data",
  data = TOM_DATA,
  startFane = "ko",
  startKjoringId,
}: AG19CaddieHubProps) {
  const [aktivFane, setAktivFane] = useState(startFane);
  const [valgtId, setValgtId] = useState<string | undefined>(startKjoringId);

  if (tilstand === "laster") {
    return (
      <div className="pa-a19" data-testid="ag19-laster">
        <Sidehode kicker="Caddie · Jarvis" title="Caddie" sub={SIDEHODE_SUB} />
        <LasterTilstand text="Henter agentkjøringer …" />
      </div>
    );
  }

  if (tilstand === "feil") {
    return (
      <div className="pa-a19" data-testid="ag19-feil">
        <Sidehode kicker="Caddie · Jarvis" title="Caddie" sub={SIDEHODE_SUB} />
        <FeilTilstand
          icon={AlertTriangle}
          title="Agentkjøringene kunne ikke hentes"
          text="Ingen utkast er sendt eller slettet. Prøv igjen om litt."
          code="AGENTER"
        />
      </div>
    );
  }

  const runs = tilstand === "tom" ? [] : data.runs;
  const aktivKjoring = runs.find((r) => r.id === valgtId) ?? runs[0];
  const feilet = runs.filter((r) => r.st === "Feilet").length;

  const faner = [
    { value: "ko", label: "Kjøringer", count: feilet > 0 ? feilet : undefined },
    { value: "prosj", label: "Prosjekter" },
    { value: "skills", label: "Skills" },
    { value: "chat", label: "Samtale" },
  ];

  return (
    <div className="pa-a19" data-testid="ag19-caddie-hub">
      <Sidehode kicker="Caddie · Jarvis" title="Caddie" sub={SIDEHODE_SUB} />

      <Faner faner={faner} value={aktivFane} onChange={setAktivFane} />

      {aktivFane === "ko" && (
        <>
          {runs.length === 0 ? (
            <TomTilstand
              icon={Sparkles}
              title="Ingen agentkjøringer"
              text="Kjøringer vises her når en agent har kjørt. Utkast som venter på deg ligger i Kø."
              actions={<KnappLenke href="/admin/ko" icon={ArrowRight}>Åpne Kø</KnappLenke>}
            />
          ) : (
            <div className="pa-a19__layout">
              <div className="pa-a19__run-list" aria-label="Agentkjøringer">
                {runs.map((r) => {
                  const erAktiv = r.id === aktivKjoring?.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      aria-pressed={erAktiv}
                      onClick={() => setValgtId(r.id)}
                      className={`pa-a19__run-item ${erAktiv ? "pa-a19__run-item--active" : ""}`}
                    >
                      <div className="pa-a19__run-info">
                        <span className="pa-a19__run-title">{r.agent}</span>
                        <Meta>
                          {r.t} · {r.dur}
                        </Meta>
                      </div>
                      <StatusPille tone={TONE_MAP[r.st]}>{r.st}</StatusPille>
                    </button>
                  );
                })}
              </div>

              {aktivKjoring && (
                <Kort>
                  <KortHode tittel="Kjøringsdetalj" aside={`${aktivKjoring.t} · ${aktivKjoring.dur}`} />
                  <div style={{ fontSize: "16px", fontWeight: 600 }}>{aktivKjoring.agent}</div>

                  {aktivKjoring.err && (
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        padding: 12,
                        borderRadius: "var(--radius)",
                        background: "var(--warn-tint)",
                        color: "var(--warn)",
                      }}
                    >
                      <Ikon icon={AlertTriangle} size={16} name="alert-triangle" />
                      <span style={{ fontSize: "13px" }}>{aktivKjoring.err}</span>
                    </div>
                  )}

                  <Nokkelverdi
                    items={[
                      ["Status", aktivKjoring.st],
                      ["Tid", aktivKjoring.t],
                      ["Varighet", aktivKjoring.dur],
                    ]}
                  />

                  <Meta>JARVIS SENDER OG ENDRER INGENTING SELV</Meta>

                  <div className="pa-a19__action-bar">
                    <KnappLenke href="/admin/ko" variant="secondary" icon={Pencil}>
                      Godkjenn og rediger i Kø
                    </KnappLenke>
                  </div>
                </Kort>
              )}
            </div>
          )}
        </>
      )}

      {aktivFane === "prosj" &&
        (data.projects.length === 0 ? (
          <TomTilstand
            icon={Sparkles}
            title="Prosjekter ligger i Notion"
            text="Oppgaver og prosjekter har Notion som eneste kilde."
            actions={<KnappLenke href="/admin/oppgaver" icon={ArrowRight}>Åpne Oppgaver</KnappLenke>}
          />
        ) : (
          <div className="pa-a19__prosjekt-grid" data-testid="ag19-prosjekter">
            {data.projects.map(([tittel, oppgaver, status]) => (
              <Kort key={tittel}>
                <div style={{ fontSize: "16px", fontWeight: 600 }}>{tittel}</div>
                <Meta>{oppgaver.toUpperCase()}</Meta>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{status}</div>
              </Kort>
            ))}
          </div>
        ))}

      {aktivFane === "skills" &&
        (data.skills.length === 0 ? (
          <TomTilstand icon={Sparkles} title="Ingen skills" text="Skills vises her når de er satt opp." />
        ) : (
          <Kort data-testid="ag19-skills">
            {data.skills.map(([id, navn, beskrivelse, aktiv]) => (
              <div key={id} className="pa-a19__skill-row">
                <div className="pa-a19__skill-info">
                  <span className="pa-a19__skill-name">{navn}</span>
                  <Meta>{beskrivelse.toUpperCase()}</Meta>
                </div>
                <StatusPille tone={aktiv ? "ok" : "neutral"}>{aktiv ? "På" : "Av"}</StatusPille>
              </div>
            ))}
            <Meta>BARE VISNING · ENDRING ER IKKE KOBLET ENNÅ</Meta>
          </Kort>
        ))}

      {aktivFane === "chat" && (
        <div className="pa-a19__chat-card" data-testid="ag19-chat">
          <Kort>
            <KortHode tittel="Caddie · samtale" aside="IKKE KOBLET ENNÅ" />
            <TomTilstand
              icon={MessageSquare}
              title="Samtalen er ikke koblet ennå"
              text="Spørsmål til Caddie besvares når samtalen er koblet til stallens data. Ingen svar lages før da."
            />
            <textarea
              className="pa-a19__textarea"
              disabled
              placeholder="Spør Caddie om stallen, planer eller tall"
              aria-label="Spørsmål til Caddie"
            />
            <div>
              <Knapp icon={Send} disabled>
                Spør Caddie
              </Knapp>
            </div>
          </Kort>
        </div>
      )}
    </div>
  );
}
