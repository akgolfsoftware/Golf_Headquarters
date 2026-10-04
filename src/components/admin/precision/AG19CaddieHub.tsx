"use client";

/**
 * Precision Athletics — Caddie og Jarvis AI-hub (AG-19).
 *
 * Kilde: Claude Design AG-19 (arkiv/2026-09-30/agencyos/screens/AG-19.jsx).
 * Ruter: /admin/caddie, /admin/jarvis, /admin/agents/[agentId].
 *
 * 4 faner:
 * 1. ko: Agentkø med kjøringer, steg, godkjenning og feilhåndtering
 * 2. prosj: Prosjekter med oppgaver og status
 * 3. skills: Skills og automatiseringsregler med aktiv/av-bryter
 * 4. chat: Caddie-samtale med kildehenvisning og utkast-lagring
 */

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  MessageSquare,
  Pencil,
  RotateCcw,
  Save,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  FeilTilstand,
  Ikon,
  Knapp,
  LasterTilstand,
  Meta,
  Sidehode,
  StatusPille,
  TomTilstand,
} from "@/components/precision/pa";
import {
  Bryter,
  Faner,
  Kort,
  KortHode,
  Nokkelverdi,
} from "@/components/precision/pa-a5";
import "@/styles/precision-a19.css";

export type AgentKjoringSteg = [string, string, string]; // [tid, handling, kilde]

export type AgentKjoring = {
  id: string;
  agent: string;
  skill: string;
  st: "Venter på coach" | "Godkjent" | "Feilet";
  t: string;
  dur: string;
  out: string;
  by?: string | null;
  err?: string;
  steps: AgentKjoringSteg[];
};

export type AgentProsjekt = [string, string, string]; // [tittel, oppgaver, status]
export type AgentSkill = [string, string, string, boolean]; // [id, navn, frekvens, aktiv]
export type ChatMelding = [string, string, string, string?]; // [avsender, tid, tekst, kilde]

export type AG19Data = {
  runs: AgentKjoring[];
  projects: AgentProsjekt[];
  skills: AgentSkill[];
  chat: ChatMelding[];
};

export type AG19Tilstand = "data" | "tom" | "laster" | "feil";

export type AG19CaddieHubProps = {
  tilstand?: AG19Tilstand;
  data?: AG19Data;
  startFane?: string;
  startKjoringId?: string;
  onGodkjenn?: (kjoringId: string) => void;
  onAvvis?: (kjoringId: string) => void;
};

const STANDARD_DATA: AG19Data = {
  runs: [
    {
      id: "j1",
      agent: "Belastningsagent",
      skill: "acwr-sjekk",
      st: "Venter på coach",
      t: "13:48",
      dur: "4 s",
      out: "Endring i plan + melding til Tobias Lindvik",
      steps: [
        ["13:48:02", "Leste øktlogg 28 dager", "ØKTLOGG · 26.09.2026"],
        ["13:48:03", "Regnet ACWR 1,58 for Tobias Lindvik", "BELASTNING · 26.09.2026"],
        ["13:48:04", "Laget utkast: hviledag torsdag 01.10", "UTKAST · IKKE SENDT"],
      ],
    },
    {
      id: "j2",
      agent: "Oppfølgingsagent",
      skill: "inaktiv-spiller",
      st: "Venter på coach",
      t: "09:05",
      dur: "2 s",
      out: "Melding til Oskar Vik",
      steps: [
        ["09:05:10", "Fant 1 spiller uten økt i 11 dager", "ØKTLOGG · 26.09.2026"],
        ["09:05:11", "Laget meldingsutkast", "UTKAST · IKKE SENDT"],
      ],
    },
    {
      id: "j3",
      agent: "Fraværsagent",
      skill: "skolefravær",
      st: "Godkjent",
      t: "08:12",
      dur: "3 s",
      out: "Ny tid til Jonas Lie",
      by: "Anders Kristiansen · 08:40",
      steps: [
        ["08:12:00", "Leste fravær fra WANG Toppidrett", "WANG · 25.09.2026"],
        ["08:12:03", "Fant ledig tid ti 29.09 17:00", "KALENDER · 26.09.2026"],
      ],
    },
    {
      id: "j4",
      agent: "Rapportagent",
      skill: "ukerapport-forelder",
      st: "Feilet",
      t: "06:00",
      dur: "12 s",
      out: "Ukerapport til 18 foreldre",
      err: "Mal «Ukeplan til forelder» mangler feltet {{plan.timer}} for 3 spillere uten publisert plan.",
      steps: [
        ["06:00:00", "Hentet 18 spillere", "STALL · 26.09.2026"],
        ["06:00:12", "Stoppet · 3 spillere mangler plan", "FEIL"],
      ],
    },
  ],
  projects: [
    ["Sesongslutt 2026", "6 oppgaver", "Jarvis følger opp frister"],
    ["Vinterplan WANG", "4 oppgaver", "Utkast til periodeplan"],
    ["Rekruttering Mini", "3 oppgaver", "Utkast til foreldrebrev"],
  ],
  skills: [
    ["acwr-sjekk", "Belastning", "Hver morgen 06:00", true],
    ["inaktiv-spiller", "Oppfølging", "Hver morgen 06:00", true],
    ["skolefravær", "Fravær", "Ved ny melding", true],
    ["ukerapport-forelder", "Rapport", "Lørdag 06:00", true],
    ["turnering-påmelding", "Turnering", "Ved ny turnering", false],
  ],
  chat: [
    ["coach", "13:50", "Hvem i WANG bør ha lettere uke 40?"],
    [
      "caddie",
      "13:50",
      "To spillere ligger over ACWR 1,5: Tobias Lindvik (1,58) og Magnus Aasheim (1,52). Jeg foreslår å kutte én SLAG-økt hos begge og legge inn bevegelighet.",
      "BELASTNING · 26.09.2026 · 28 DAGER ØKTLOGG",
    ],
  ],
};

const TONE_MAP: Record<AgentKjoring["st"], "neutral" | "ok" | "warn"> = {
  "Venter på coach": "neutral",
  Godkjent: "ok",
  Feilet: "warn",
};

export function AG19CaddieHub({
  tilstand = "data",
  data = STANDARD_DATA,
  startFane = "ko",
  startKjoringId,
  onGodkjenn,
  onAvvis,
}: AG19CaddieHubProps) {
  const [aktivFane, setAktivFane] = useState(startFane);
  const [runs, setRuns] = useState<AgentKjoring[]>(tilstand === "tom" ? [] : data.runs);
  const [valgtId, setValgtId] = useState<string>(startKjoringId || runs[0]?.id || "j1");
  const [skills, setSkills] = useState<AgentSkill[]>(data.skills);
  const [chat, setChat] = useState<ChatMelding[]>(data.chat);
  const [sporsmal, setSporsmal] = useState("");
  const [utkastLagret, setUtkastLagret] = useState(false);
  const [bekreftelse, setBekreftelse] = useState<string | null>(null);

  if (tilstand === "laster") {
    return (
      <div className="pa-a19" data-testid="ag19-laster">
        <Sidehode
          kicker="Caddie · Jarvis"
          title="Caddie"
          sub="Jarvis og agentene forbereder alt. Ingenting går ut til et menneske før du har godkjent utkastet."
        />
        <LasterTilstand text="Henter agentkøen …" />
      </div>
    );
  }

  if (tilstand === "feil") {
    return (
      <div className="pa-a19" data-testid="ag19-feil">
        <Sidehode
          kicker="Caddie · Jarvis"
          title="Caddie"
          sub="Jarvis og agentene forbereder alt. Ingenting går ut til et menneske før du har godkjent utkastet."
        />
        <FeilTilstand
          icon={AlertTriangle}
          title="Caddie svarer ikke"
          text="Ingen utkast er sendt eller slettet. Prøv igjen om litt."
          code="FEIL 503 · AGENTER"
        />
      </div>
    );
  }

  const aktivKjoring = runs.find((r) => r.id === valgtId) || runs[0];
  const ventendeAntall = runs.filter((r) => r.st === "Venter på coach").length;

  const handleGodkjenn = (kjoring: AgentKjoring) => {
    const tid = new Date().toTimeString().slice(0, 5);
    setRuns((prev) =>
      prev.map((r) =>
        r.id === kjoring.id
          ? { ...r, st: "Godkjent" as const, by: `Anders Kristiansen · ${tid}` }
          : r
      )
    );
    setBekreftelse(`Godkjent: ${kjoring.out}`);
    onGodkjenn?.(kjoring.id);
  };

  const handleForkast = (kjoringId: string) => {
    setRuns((prev) => prev.filter((r) => r.id !== kjoringId));
    setBekreftelse("Kjøringen ble forkastet. Ingenting sendt.");
    onAvvis?.(kjoringId);
  };

  const handleSendSporsmal = () => {
    if (!sporsmal.trim()) return;
    const tid = new Date().toTimeString().slice(0, 5);
    const nyMelding: ChatMelding = ["coach", tid, sporsmal.trim()];
    const caddieSvar: ChatMelding = [
      "caddie",
      tid,
      "Jeg har laget et utkast: bevegelighet 30 min i stedet for Innspill ca. 150 m torsdag for Tobias og Magnus. Ingenting er sendt eller endret.",
      "PLAN UKE 40 · 26.09.2026",
    ];
    setChat((prev) => [...prev, nyMelding, caddieSvar]);
    setSporsmal("");
    setUtkastLagret(false);
  };

  const faner = [
    { value: "ko", label: "Agentkø", count: ventendeAntall > 0 ? ventendeAntall : undefined },
    { value: "prosj", label: "Prosjekter" },
    { value: "skills", label: "Skills" },
    { value: "chat", label: "Samtale" },
  ];

  return (
    <div className="pa-a19" data-testid="ag19-caddie-hub">
      <Sidehode
        kicker="Caddie · Jarvis"
        title="Caddie"
        sub="Jarvis og agentene forbereder alt. Ingenting går ut til et menneske før du har godkjent utkastet."
      />

      <Faner faner={faner} value={aktivFane} onChange={setAktivFane} />

      {bekreftelse && (
        <div
          role="status"
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-card, 8px)",
            background: "var(--surface-sunken)",
            border: "1px solid var(--border-hairline)",
            fontSize: "13px",
            color: "var(--text-primary)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{bekreftelse}</span>
          <Knapp
            variant="ghost"
            size="sm"
            onClick={() => setBekreftelse(null)}
            aria-label="Lukk varsel"
          >
            Lukk
          </Knapp>
        </div>
      )}

      {/* Fane 1: Agentkø */}
      {aktivFane === "ko" && (
        <>
          {runs.length === 0 ? (
            <TomTilstand
              icon={Sparkles}
              title="Ingen kjøringer i dag"
              text="Agentene kjører hver morgen kl. 06:00. Du kan også spørre Caddie direkte."
              actions={
                <Knapp icon={MessageSquare} onClick={() => setAktivFane("chat")}>
                  Åpne samtale
                </Knapp>
              }
            />
          ) : (
            <div className="pa-a19__layout">
              {/* Venstre: liste over kjøringer */}
              <div className="pa-a19__run-list" aria-label="Agentkjøringer">
                {runs.map((r) => {
                  const erAktiv = r.id === valgtId;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      aria-pressed={erAktiv}
                      onClick={() => setValgtId(r.id)}
                      className={`pa-a19__run-item ${erAktiv ? "pa-a19__run-item--active" : ""}`}
                    >
                      <div className="pa-a19__run-info">
                        <span className="pa-a19__run-title">
                          {r.agent} · {r.skill}
                        </span>
                        <Meta>
                          26.09 {r.t} · {r.dur} · {r.out.toUpperCase()}
                        </Meta>
                      </div>
                      <StatusPille tone={TONE_MAP[r.st]}>{r.st}</StatusPille>
                    </button>
                  );
                })}
              </div>

              {/* Høyre: Kjøringsdetalj */}
              {aktivKjoring && (
                <Kort>
                  <KortHode
                    tittel="Kjøringsdetalj"
                    aside={`26.09 ${aktivKjoring.t} · ${aktivKjoring.dur}`}
                  />
                  <div style={{ fontSize: "16px", fontWeight: 600 }}>
                    {aktivKjoring.agent} · {aktivKjoring.skill}
                  </div>

                  {aktivKjoring.err && (
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        padding: 12,
                        borderRadius: "var(--radius-card, 8px)",
                        background: "var(--warn-tint)",
                        color: "var(--warn)",
                      }}
                    >
                      <Ikon icon={AlertTriangle} size={16} name="alert-triangle" />
                      <span style={{ fontSize: "13px" }}>{aktivKjoring.err}</span>
                    </div>
                  )}

                  {/* Stegliste */}
                  <div>
                    {aktivKjoring.steps.map(([tid, handling, kilde], i) => (
                      <div key={i} className="pa-a19__step-row">
                        <span className="pa-a19__step-time">{tid}</span>
                        <div className="pa-a19__step-content">
                          <span className="pa-a19__step-text">{handling}</span>
                          <Meta>{kilde}</Meta>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Nokkelverdi
                    items={[
                      ["Går ut som", aktivKjoring.out],
                      ["Godkjent av", aktivKjoring.by || "Ikke godkjent ennå"],
                    ]}
                  />

                  <Meta>JARVIS SENDER OG ENDRER INGENTING SELV</Meta>

                  {/* Handlinger avhengig av status */}
                  <div className="pa-a19__action-bar">
                    {aktivKjoring.st === "Venter på coach" && (
                      <>
                        <Knapp
                          icon={Check}
                          onClick={() => handleGodkjenn(aktivKjoring)}
                        >
                          Godkjenn og send
                        </Knapp>
                        <Link href="/admin/ko" style={{ textDecoration: "none" }}>
                          <Knapp variant="secondary" icon={Pencil}>
                            Rediger i Kø
                          </Knapp>
                        </Link>
                        <Knapp
                          variant="ghost"
                          icon={Trash2}
                          onClick={() => handleForkast(aktivKjoring.id)}
                        >
                          Forkast
                        </Knapp>
                      </>
                    )}

                    {aktivKjoring.st === "Feilet" && (
                      <Knapp
                        variant="secondary"
                        icon={RotateCcw}
                        onClick={() =>
                          setBekreftelse(
                            "Kjører på nytt for 15 spillere med plan · 3 hoppes over"
                          )
                        }
                      >
                        Kjør for de 15 som har plan
                      </Knapp>
                    )}
                  </div>
                </Kort>
              )}
            </div>
          )}
        </>
      )}

      {/* Fane 2: Prosjekter */}
      {aktivFane === "prosj" && (
        <div className="pa-a19__prosjekt-grid" data-testid="ag19-prosjekter">
          {data.projects.map(([tittel, oppgaver, status]) => (
            <Kort key={tittel}>
              <div style={{ fontSize: "16px", fontWeight: 600 }}>{tittel}</div>
              <Meta>{oppgaver.toUpperCase()}</Meta>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                {status}
              </div>
              <div style={{ paddingTop: 8 }}>
                <Link href="/admin/oppgaver" style={{ textDecoration: "none" }}>
                  <Knapp variant="ghost" size="sm" icon={ArrowRight}>
                    Åpne i Oppgaver
                  </Knapp>
                </Link>
              </div>
            </Kort>
          ))}
        </div>
      )}

      {/* Fane 3: Skills */}
      {aktivFane === "skills" && (
        <Kort data-testid="ag19-skills">
          {skills.map(([id, navn, frekvens, aktiv], i) => (
            <div key={id} className="pa-a19__skill-row">
              <div className="pa-a19__skill-info">
                <span className="pa-a19__skill-name">{id}</span>
                <Meta>
                  {navn.toUpperCase()} · {frekvens.toUpperCase()}
                </Meta>
              </div>
              <Bryter
                label={aktiv ? "Aktiv" : "Av"}
                checked={aktiv}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSkills((prev) =>
                    prev.map((s, idx) =>
                      idx === i ? [s[0], s[1], s[2], checked] : s
                    )
                  );
                }}
              />
            </div>
          ))}
        </Kort>
      )}

      {/* Fane 4: Samtale med Caddie */}
      {aktivFane === "chat" && (
        <div className="pa-a19__chat-card" data-testid="ag19-chat">
          <Kort>
            <KortHode
              tittel="Caddie · samtale"
              aside="SVARER MED KILDE OG DATO"
            />

            <div className="pa-a19__chat-feed">
              {chat.map(([avsender, tid, tekst, kilde], i) => {
                const erCoach = avsender === "coach";
                const erSisteCaddie = !erCoach && i === chat.length - 1;

                return (
                  <div
                    key={i}
                    className={`pa-a19__chat-bubble ${
                      erCoach
                        ? "pa-a19__chat-bubble--coach"
                        : "pa-a19__chat-bubble--caddie"
                    }`}
                  >
                    <Meta>
                      {erCoach ? "ANDERS KRISTIANSEN" : "CADDIE"} · {tid}
                    </Meta>
                    <div className="pa-a19__chat-text">{tekst}</div>
                    {kilde && <Meta>KILDE · {kilde}</Meta>}

                    {erSisteCaddie && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          flexWrap: "wrap",
                          paddingTop: 6,
                        }}
                      >
                        <span className="pa-a19__draft-tag">
                          {utkastLagret ? "Lagret som utkast" : "Forslag"}
                        </span>
                        {!utkastLagret && (
                          <Knapp
                            variant="secondary"
                            size="sm"
                            icon={Save}
                            onClick={() => {
                              setUtkastLagret(true);
                              setBekreftelse(
                                "Lagret som utkast i Workbench · Ikke publisert, du godkjenner."
                              );
                            }}
                          >
                            Lagre som utkast
                          </Knapp>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <textarea
              className="pa-a19__textarea"
              value={sporsmal}
              onChange={(e) => setSporsmal(e.target.value)}
              placeholder="Spør Caddie om stallen, planer eller tall"
              aria-label="Spørsmål til Caddie"
            />

            <div>
              <Knapp
                icon={Send}
                disabled={!sporsmal.trim()}
                onClick={handleSendSporsmal}
              >
                Spør Caddie
              </Knapp>
            </div>
          </Kort>
        </div>
      )}
    </div>
  );
}
