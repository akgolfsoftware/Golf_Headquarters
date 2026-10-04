"use client";

/**
 * AG-02 Kø i Precision Athletics (Claude Design 7d7c2994,
 * arkiv/2026-09-30/agencyos/screens/AG-02.jsx, med utvidelser for
 * agentkø, tester, dubletter, moderering og godkjenninger).
 *
 * Én samlet kø for alle saker som krever beslutning fra trener/admin.
 * Ingenting sendes eller publiseres før det godkjennes.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  Check,
  CheckCircle2,
  GitMerge,
  House,
  MessageSquare,
  Pencil,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  AkseMerke,
  FeilTilstand,
  Ikon,
  Knapp,
  LasterTilstand,
  Meta,
  Sidehode,
  StatusPille,
  TomTilstand,
  type Akse,
} from "@/components/precision/pa";
import { Ark, Faner, Felt, Nokkelverdi } from "@/components/precision/pa-a5";
import "@/styles/precision-a2.css";

export type AG02Tilstand = "data" | "tom" | "laster" | "feil";

export type GodkjenningSak = {
  id: string;
  who: string;
  grp?: string;
  title: string;
  kind: string;
  from: string;
  at: string;
  status: string;
  axis?: Akse;
  due?: string;
  sum?: string;
  lines?: [string, string, string][];
};

export type AgentSak = {
  id: string;
  who: string;
  title: string;
  agent: string;
  t: string;
  body: string;
  facts: [string, string, string?][];
  out: string;
  axis?: Akse;
};

export type TestSak = {
  id: string;
  who: string;
  test: string;
  src: string;
  at: string;
  done: number;
  of: number;
  result?: string;
  prev?: string;
  witness?: string;
};

export type DublettSak = {
  id: string;
  match: string;
  a: Record<string, string>;
  b: Record<string, string>;
};

export type ModereringSak = {
  id: string;
  where: string;
  who: string;
  reason: string;
  at: string;
  text: string;
};

export type EpostSak = {
  id: string;
  to: string;
  email: string;
  tpl: string;
  by: string;
  at: string;
  svc: string;
  ready: string;
  note?: string;
};

export type KoSak = GodkjenningSak | AgentSak | TestSak | DublettSak | ModereringSak | EpostSak;

export type AG02Data = {
  godkjenninger: GodkjenningSak[];
  agentko: AgentSak[];
  tester: TestSak[];
  dubletter: DublettSak[];
  moderering: ModereringSak[];
  epost: EpostSak[];
};

export type AG02KoProps = {
  tilstand?: AG02Tilstand;
  dagLabel?: string;
  startFane?: string;
  data?: AG02Data;
  onGodkjenn?: (id: string, fane: string) => void;
  onAvvis?: (id: string, fane: string) => void;
};

const DUBLETT_FELTER: [string, string][] = [
  ["name", "Navn"],
  ["born", "Fødselsår"],
  ["email", "E-post"],
  ["phone", "Telefon"],
  ["club", "Klubb"],
  ["parent", "Forelder"],
];

const STANDARD_DATA: AG02Data = {
  godkjenninger: [
    {
      id: "g1",
      who: "Magnus Aasheim",
      grp: "WANG Toppidrett",
      title: "PlanAction · hviledag torsdag",
      kind: "PlanAction",
      from: "Belastningsagent",
      at: "I dag 08:30",
      status: "Venter",
      axis: "fys",
      due: "14:00",
      sum: "ACWR 1,62 → 1,31 etter endring",
      lines: [
        ["To 01.10", "SLAG · Innspill 150–200 m → hvile", "−90 min"],
        ["Ma 05.10", "SLAG · Innspill 150–200 m", "90 min"],
      ],
    },
    {
      id: "g2",
      who: "Emil Solberg",
      grp: "Talent U16",
      title: "Samtykke · samling Oslo GK",
      kind: "Samtykke",
      from: "Forelder · Kari Solberg",
      at: "I går 11:42",
      status: "Signert",
      axis: "spill",
      due: "I dag 18:00",
      sum: "Signert med BankID",
      lines: [
        ["Samling", "Oslo GK · overnatting og transport", "2 døgn"],
        ["Deling", "TrackMan-data med NGF region", "Ja"],
      ],
    },
    {
      id: "g3",
      who: "Thea Nilsen",
      grp: "Talent U16",
      title: "Bytte FYS-økt med 9 hull",
      kind: "Økt",
      from: "Spiller",
      at: "I går 19:15",
      status: "Venter",
      axis: "spill",
      due: "I dag",
      sum: "«Vil teste gameplanen før klubbmesterskapet.»",
      lines: [
        ["Lø 03.10", "FYS · Kondisjon", "45 min"],
        ["Erstattes av", "SPILL · 9 hull Borregaard", "120 min"],
      ],
    },
  ],
  agentko: [
    {
      id: "a1",
      who: "Ingrid Berg",
      title: "Juster innspillstrening etter turnering",
      agent: "Caddie AI",
      t: "08:14",
      body: "Ingrid bommet 9 av 14 greentreff fra 50–100 m i helgens runde. Foreslår 2 ekstra wedge-økter denne uken.",
      facts: [
        ["Anbefaling", "2 × 45 min wedge", "SLAG"],
        ["Bakgrunn", "Strokes Gained APP −0,9", "3 RUNDER"],
      ],
      out: "Forslag til ukeplan uke 40",
      axis: "slag",
    },
    {
      id: "a2",
      who: "Sara Holm",
      title: "Utslagstester og TrackMan-oppfølging",
      agent: "Teknikkagent",
      t: "I går",
      body: "Club Path har beveget seg +3,8° mot høyre. Bør booke en kort sjekk før helgens kretsfinale.",
      facts: [
        ["Avvik", "Club Path +3,8°", "TRACKMAN"],
        ["Tiltak", "Sjekk startretning P6–P7", "TEK"],
      ],
      out: "Notat til neste privattime",
      axis: "tek",
    },
  ],
  tester: [
    {
      id: "t1",
      who: "Eira Solvang",
      test: "Testbatteri Putting 3–6–9 fot",
      src: "Spiller",
      at: "I dag 09:15",
      done: 30,
      of: 30,
      result: "84 % treff",
      prev: "76 %",
      witness: "Jonas Brekke (trener)",
    },
    {
      id: "t2",
      who: "Kasper Moen",
      test: "Køllehastighet Driver",
      src: "TrackMan",
      at: "I går 16:40",
      done: 6,
      of: 10,
      result: "108,4 mph snitt",
      prev: "106,1 mph",
      witness: "—",
    },
  ],
  dubletter: [
    {
      id: "d1",
      match: "To spillere med likt navn og klubb funnet",
      a: {
        name: "Mathias Tveit",
        born: "2008",
        email: "mathias.t@example.com",
        phone: "+47 912 34 567",
        club: "Borregaard GK",
        parent: "Kari Tveit",
        src: "GolfBox-synk",
      },
      b: {
        name: "Mathias Tveit",
        born: "2008",
        email: "m.tveit@skole.no",
        phone: "+47 912 34 567",
        club: "Borregaard GK",
        parent: "Kari Tveit",
        src: "Manuell påmelding",
      },
    },
  ],
  moderering: [
    {
      id: "m1",
      where: "Gruppesamtale · Talent U16",
      who: "Anonym deltaker",
      reason: "Upassende språkbruk i fellestråd",
      at: "I går 21:05",
      text: "«Dette opplegget er helt ubrukelig, ingen gidder å møte opp på morgentrening kl 07.»",
    },
  ],
  epost: [
    {
      id: "ep1",
      to: "Mari Solvang",
      email: "mari.s@example.com",
      tpl: "EP-05",
      by: "Caddie",
      at: "I går 15:05",
      svc: "Privattime 60 min · fredag 25.09 kl. 14:00",
      ready: "Klar til sending — timen var i går kl. 14.00",
      note: "Flott økt med fokus på nærspill og wedger. Husk å opprettholde tempo i baksvingen.",
    },
  ],
};

function normaliserFane(raw?: string): keyof AG02Data {
  if (!raw) return "godkjenninger";
  if (raw === "agent" || raw === "agentgodkjenn" || raw === "agentko") return "agentko";
  if (raw === "test" || raw === "tester") return "tester";
  if (raw === "dublett" || raw === "dubletter") return "dubletter";
  if (raw === "moderering") return "moderering";
  if (raw === "epost") return "epost";
  return "godkjenninger";
}

function hentSakInfo(
  sak: KoSak | null | undefined,
  aktivFane: keyof AG02Data
): { hvem: string; tittel: string; kilde: string; akse?: Akse; status?: string } {
  if (!sak) return { hvem: "Sak", tittel: "Detalj", kilde: "System" };
  if (aktivFane === "godkjenninger") {
    const g = sak as GodkjenningSak;
    return { hvem: g.who, tittel: g.title, kilde: g.from, akse: g.axis, status: g.status };
  }
  if (aktivFane === "agentko") {
    const a = sak as AgentSak;
    return { hvem: a.who, tittel: a.title, kilde: a.agent, akse: a.axis };
  }
  if (aktivFane === "tester") {
    const t = sak as TestSak;
    return { hvem: t.who, tittel: t.test, kilde: t.src, akse: undefined };
  }
  if (aktivFane === "dubletter") {
    const d = sak as DublettSak;
    return { hvem: d.a?.name ?? "Deltaker", tittel: d.match, kilde: "Mulig dublett", akse: undefined };
  }
  if (aktivFane === "moderering") {
    const m = sak as ModereringSak;
    return { hvem: m.who, tittel: m.reason, kilde: m.where, akse: undefined };
  }
  if (aktivFane === "epost") {
    const ep = sak as EpostSak;
    return { hvem: ep.to, tittel: ep.svc, kilde: ep.by, akse: undefined };
  }
  return { hvem: "Sak", tittel: "Detalj", kilde: "System" };
}

export function AG02Ko({
  tilstand = "data",
  dagLabel = "tirsdag 29. september",
  startFane,
  data = STANDARD_DATA,
  onGodkjenn,
  onAvvis,
}: AG02KoProps) {
  const [fane, setFane] = useState<keyof AG02Data>(() => normaliserFane(startFane));
  const [valgtId, setValgtId] = useState<string | null>(null);
  const [sorterPrio, setSorterPrio] = useState(false);
  const [behandlede, setBehandlede] = useState<Record<string, string>>({});
  const [fjernDialogApen, setFjernDialogApen] = useState(false);
  const [dublettValg, setDublettValg] = useState<Record<string, Record<string, "a" | "b">>>({});
  const [epostNotat, setEpostNotat] = useState<Record<string, string>>({});
  const [varselTekst, setVarselTekst] = useState<{ tittel: string; meta?: string } | null>(null);

  const sakerForFane = useMemo(() => {
    if (tilstand === "tom") return [];
    const rawList = data[fane] || [];
    return rawList.filter((it) => !behandlede[it.id]);
  }, [data, fane, tilstand, behandlede]);

  const aktivSak = useMemo(() => {
    if (!sakerForFane.length) return null;
    return sakerForFane.find((s) => s.id === valgtId) || sakerForFane[0];
  }, [sakerForFane, valgtId]);

  if (tilstand === "laster") {
    return <LasterTilstand text="Henter køen …" />;
  }

  if (tilstand === "feil") {
    return (
      <FeilTilstand
        icon={TriangleAlert}
        title="Køen kunne ikke hentes"
        text="Ingen saker er godkjent eller avvist. Kontroller forbindelsen og prøv igjen."
        code="FEIL 502 · KØ"
      />
    );
  }

  const lukkSak = (id: string, melding: string, meta?: string) => {
    setBehandlede((prev) => ({ ...prev, [id]: melding }));
    setVarselTekst({ tittel: melding, meta });
    if (onGodkjenn) onGodkjenn(id, fane);
  };

  const avvisSak = (id: string, melding: string, meta?: string) => {
    setBehandlede((prev) => ({ ...prev, [id]: melding }));
    setVarselTekst({ tittel: melding, meta });
    if (onAvvis) onAvvis(id, fane);
  };

  const fanerKonfig = [
    { value: "godkjenninger", label: "Godkjenninger", count: data.godkjenninger.filter((x) => !behandlede[x.id]).length },
    { value: "agentko", label: "Agentforslag", count: data.agentko.filter((x) => !behandlede[x.id]).length },
    { value: "tester", label: "Tester", count: data.tester.filter((x) => !behandlede[x.id]).length },
    { value: "dubletter", label: "Dubletter", count: data.dubletter.filter((x) => !behandlede[x.id]).length },
    { value: "moderering", label: "Moderering", count: data.moderering.filter((x) => !behandlede[x.id]).length },
    { value: "epost", label: "E-postutkast", count: data.epost.filter((x) => !behandlede[x.id]).length },
  ];

  const aktivInfo = aktivSak ? hentSakInfo(aktivSak, fane) : null;

  /* Detalj-rendering etter fane */
  function renderDetaljInnhold(sak: KoSak | null) {
    if (!sak) return null;

    if (fane === "godkjenninger") {
      const g = sak as GodkjenningSak;
      return (
        <>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {g.axis && <AkseMerke axis={g.axis} />}
            <StatusPille tone={g.status === "Signert" ? "ok" : "warn"}>{g.status}</StatusPille>
            <Meta>{g.from.toUpperCase()} · {g.at.toUpperCase()}</Meta>
          </div>
          <Nokkelverdi
            items={[
              ["Spiller", g.who],
              ["Gruppe", g.grp ?? "—"],
              ["Kilde", g.from],
              ["Frist", g.due ?? "I dag"],
              ["Sammendrag", g.sum ?? "—"],
            ]}
          />
          {g.lines && g.lines.length > 0 && (
            <div className="pa-a2-linjer">
              {g.lines.map(([dag, tek, min], idx) => (
                <div key={idx} className="pa-a2-linje">
                  <Meta>{dag.toUpperCase()}</Meta>
                  <span style={{ font: "var(--type-body-s)", color: "var(--text-primary)" }}>{tek}</span>
                  <span style={{ font: "var(--type-num-s)" }}>{min}</span>
                </div>
              ))}
            </div>
          )}
        </>
      );
    }

    if (fane === "agentko") {
      const a = sak as AgentSak;
      return (
        <>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Ikon icon={Sparkles} size={16} />
            <span style={{ font: "600 11px/1 var(--font-mono)", letterSpacing: ".06em", color: "var(--text-secondary)", textTransform: "uppercase" }}>
              {a.agent} · {a.t}
            </span>
            <span style={{ border: "1px dashed var(--border-control)", borderRadius: 4, padding: "2px 6px", font: "600 10px/1 var(--font-mono)", textTransform: "uppercase", color: "var(--text-secondary)" }}>
              Utkast
            </span>
          </div>
          <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-primary)", lineHeight: 1.5 }}>
            {a.body}
          </p>
          <Nokkelverdi items={a.facts.map(([k, v, h]) => [k, v, h])} />
          <div style={{ padding: "8px 12px", background: "var(--surface-sunken)", borderRadius: "var(--radius)" }}>
            <Meta>GÅR UT SOM · {a.out.toUpperCase()}</Meta>
          </div>
        </>
      );
    }

    if (fane === "tester") {
      const t = sak as TestSak;
      const fullfort = t.done >= t.of;
      return (
        <>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <StatusPille tone={fullfort ? "ok" : "warn"}>
              {fullfort ? "Til attestering" : `${t.done} av ${t.of} slag`}
            </StatusPille>
            <Meta>{t.src.toUpperCase()} · {t.at.toUpperCase()}</Meta>
          </div>
          <Nokkelverdi
            items={[
              ["Spiller", t.who],
              ["Test", t.test],
              ["Resultat", t.result ?? "Ikke fullført"],
              ["Forrige", t.prev ?? "—"],
              ["Registrert", `${t.done} av ${t.of} slag`],
              ["Vitne", t.witness ?? "—"],
            ]}
          />
          {!fullfort && (
            <div style={{ display: "flex", gap: 10, padding: 12, borderRadius: "var(--radius)", background: "var(--warn-tint)", alignItems: "center" }}>
              <Ikon icon={TriangleAlert} size={18} />
              <span style={{ font: "var(--type-body-s)", color: "var(--text-primary)" }}>
                {t.of - t.done} slag mangler. Testen teller først når samtlige slag er fullført.
              </span>
            </div>
          )}
        </>
      );
    }

    if (fane === "dubletter") {
      const d = sak as DublettSak;
      const valgte = dublettValg[d.id] || {};
      return (
        <>
          <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
            {d.match}. Velg hvilke opplysninger som skal beholdes per felt. Historikk fra begge kilder beholdes.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {DUBLETT_FELTER.map(([nokkel, etikett]) => {
              const verdiA = d.a[nokkel] || "—";
              const verdiB = d.b[nokkel] || "—";
              const erLik = verdiA === verdiB;
              const valgtSide = valgte[nokkel] || (verdiA === "—" ? "b" : "a");

              return (
                <div key={nokkel} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <Meta>{etikett.toUpperCase()}{erLik ? " · LIK" : ""}</Meta>
                  <div role="radiogroup" aria-label={etikett} className="pa-a2-radiogroup">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={valgtSide === "a"}
                      disabled={erLik || verdiA === "—"}
                      onClick={() =>
                        setDublettValg((prev) => ({
                          ...prev,
                          [d.id]: { ...(prev[d.id] || {}), [nokkel]: "a" },
                        }))
                      }
                      className="pa-a2-valgknapp"
                    >
                      A: {verdiA}
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={valgtSide === "b"}
                      disabled={erLik || verdiB === "—"}
                      onClick={() =>
                        setDublettValg((prev) => ({
                          ...prev,
                          [d.id]: { ...(prev[d.id] || {}), [nokkel]: "b" },
                        }))
                      }
                      className="pa-a2-valgknapp"
                    >
                      B: {verdiB}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Meta>KILDE A: {d.a.src?.toUpperCase() ?? "A"}</Meta>
            <Meta>KILDE B: {d.b.src?.toUpperCase() ?? "B"}</Meta>
          </div>
        </>
      );
    }

    if (fane === "moderering") {
      const m = sak as ModereringSak;
      return (
        <>
          <Nokkelverdi
            items={[
              ["Hvor", m.where],
              ["Skrevet av", m.who],
              ["Årsak til varsel", m.reason],
              ["Tidspunkt", m.at],
            ]}
          />
          <div className="pa-a2-sunken">{m.text}</div>
          <Meta>NAVN ER ANONYMISERT · SAKEN GJELDER UTØVERE UNDER 18 ÅR</Meta>
        </>
      );
    }

    if (fane === "epost") {
      const ep = sak as EpostSak;
      const notat = epostNotat[ep.id] ?? ep.note ?? "";
      return (
        <>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <StatusPille tone="ok">Klar til sending</StatusPille>
            <Meta>{ep.tpl} · LAGET AV {ep.by.toUpperCase()} {ep.at.toUpperCase()}</Meta>
          </div>
          <Nokkelverdi
            items={[
              ["Mottaker", `${ep.to} (${ep.email})`],
              ["Gjelder", ep.svc],
              ["Mal", `${ep.tpl} · Takk etter coachingtime`],
            ]}
          />
          <Felt label="Dine linjer til eleven" hint="To–tre personlige linjer om hva dere trente på i dag.">
            <textarea
              aria-label="Dine linjer til eleven"
              className="pa-a7-textarea"
              value={notat}
              onChange={(e) => setEpostNotat((prev) => ({ ...prev, [ep.id]: e.target.value }))}
            />
          </Felt>
          <div className="pa-a2-sunken" style={{ whiteSpace: "pre-wrap" }}>
            <strong>Forhåndsvisning:</strong>
            {"\n\n"}Hei {ep.to}!{"\n"}Takk for god innsats under økten «{ep.svc}».{"\n\n"}
            {notat}
            {"\n\nHilsen Anders Kristiansen · AK Golf"}
          </div>
        </>
      );
    }

    return null;
  }

  /* Handlingsknapper */
  function renderHandlinger(sak: KoSak | null) {
    if (!sak) return null;

    if (fane === "godkjenninger") {
      const g = sak as GodkjenningSak;
      return (
        <div className="pa-a2-handling">
          <Knapp
            fullWidth
            icon={Check}
            onClick={() => lukkSak(g.id, "Godkjent", `${g.who} · ${g.title}`.toUpperCase())}
          >
            {g.kind === "Samtykke" ? "Registrer samtykke" : "Godkjenn"}
          </Knapp>
          <Knapp
            variant="secondary"
            fullWidth
            onClick={() => avvisSak(g.id, "Sendt tilbake med kommentar", "UTKAST LAGRET I INNBOKS")}
          >
            Send tilbake
          </Knapp>
        </div>
      );
    }

    if (fane === "agentko") {
      const a = sak as AgentSak;
      return (
        <div className="pa-a2-handling">
          <Knapp
            fullWidth
            icon={Check}
            onClick={() => lukkSak(a.id, "Godkjent og planlagt", a.out.toUpperCase())}
          >
            Godkjenn og send
          </Knapp>
          <Knapp
            variant="secondary"
            fullWidth
            icon={Pencil}
            onClick={() => setVarselTekst({ tittel: "Åpnet som utkast i planbygger", meta: "REDIGER FØR GODKJENNING" })}
          >
            Rediger utkast
          </Knapp>
          <Knapp
            variant="ghost"
            fullWidth
            onClick={() => avvisSak(a.id, "Forslaget er avvist", "INGENTING SENDT")}
          >
            Avvis
          </Knapp>
        </div>
      );
    }

    if (fane === "tester") {
      const t = sak as TestSak;
      const fullfort = t.done >= t.of;
      return (
        <div className="pa-a2-handling">
          {fullfort ? (
            <>
              <Knapp
                fullWidth
                icon={ShieldCheck}
                onClick={() => lukkSak(t.id, "Testen er attestert", `${t.who} · ${t.test}`.toUpperCase())}
              >
                Attester resultat
              </Knapp>
              <Knapp
                variant="ghost"
                fullWidth
                onClick={() => avvisSak(t.id, "Sendt tilbake til spiller", "SPILLEREN TAR TESTEN PÅ NYTT")}
              >
                Be om ny test
              </Knapp>
            </>
          ) : (
            <Knapp
              variant="secondary"
              fullWidth
              icon={MessageSquare}
              onClick={() => setVarselTekst({ tittel: "Påminnelse klargjort i Innboks", meta: "IKKE SENDT ENNÅ" })}
            >
              Påminn spilleren
            </Knapp>
          )}
        </div>
      );
    }

    if (fane === "dubletter") {
      const d = sak as DublettSak;
      return (
        <div className="pa-a2-handling">
          <Knapp
            fullWidth
            icon={GitMerge}
            onClick={() => lukkSak(d.id, "Profilene er slått sammen", `${d.a.name || "Spiller"} · KAN ANGRES I 30 DAGER`.toUpperCase())}
          >
            Slå sammen
          </Knapp>
          <Knapp
            variant="ghost"
            fullWidth
            onClick={() => avvisSak(d.id, "Merket som ikke dublett", "BEGGE PROFILER BEHOLDES")}
          >
            Ikke dublett
          </Knapp>
        </div>
      );
    }

    if (fane === "moderering") {
      const m = sak as ModereringSak;
      return (
        <div className="pa-a2-handling">
          <Knapp
            variant="secondary"
            fullWidth
            onClick={() => lukkSak(m.id, "Innlegget er beholdt", "VARSELET ER LUKKET")}
          >
            Behold innlegget
          </Knapp>
          <Knapp
            variant="signal"
            fullWidth
            icon={Trash2}
            onClick={() => setFjernDialogApen(true)}
          >
            Fjern innlegget
          </Knapp>
        </div>
      );
    }

    if (fane === "epost") {
      const ep = sak as EpostSak;
      const notat = epostNotat[ep.id] ?? ep.note ?? "";
      return (
        <div className="pa-a2-handling">
          <Knapp
            fullWidth
            icon={Send}
            disabled={!notat.trim()}
            onClick={() => lukkSak(ep.id, "E-posten er sendt", `TIL ${ep.to.toUpperCase()} · ${ep.tpl}`)}
          >
            Send e-post
          </Knapp>
          <Knapp
            variant="ghost"
            fullWidth
            onClick={() => avvisSak(ep.id, "Utkastet er forkastet", "INGEN E-POST SENDT")}
          >
            Forkast
          </Knapp>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="pa-a2-side">
      <Sidehode
        kicker={`Kø · ${dagLabel}`}
        title="Kø"
        sub="Alt som venter på en beslutning fra deg. Ingenting sendes før du godkjenner."
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Faner faner={fanerKonfig} value={fane} onChange={(f) => { setFane(f as keyof AG02Data); setValgtId(null); }} />
        <Knapp
          variant="secondary"
          size="sm"
          icon={ArrowUpDown}
          onClick={() => setSorterPrio((prev) => !prev)}
        >
          {sorterPrio ? "Ferdig med sortering" : "Sorter prioritet"}
        </Knapp>
      </div>

      {varselTekst && (
        <div
          role="status"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 16px",
            borderRadius: "var(--radius)",
            background: "var(--surface-sunken)",
            border: "1px solid var(--border-hairline)",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Ikon icon={CheckCircle2} size={18} />
            <span style={{ font: "var(--type-body-s)", color: "var(--text-primary)" }}>{varselTekst.tittel}</span>
            {varselTekst.meta && <Meta>· {varselTekst.meta}</Meta>}
          </div>
          <button
            type="button"
            className="pa-iconbtn"
            style={{ width: 44, height: 44 }}
            aria-label="Lukk varsel"
            onClick={() => setVarselTekst(null)}
          >
            <Ikon icon={X} size={16} />
          </button>
        </div>
      )}

      {sakerForFane.length === 0 ? (
        <TomTilstand
          icon={Check}
          title={`Ingen saker venter`}
          text="Alt i denne fanen er ferdig behandlet. Nye saker kommer fra utøvere, foreldre og agentene."
          actions={
            <Link
              href="/admin/agencyos"
              className="pa-btn pa-btn--secondary pa-btn--icon-l"
              style={{ minHeight: 44, minWidth: 44, display: "inline-flex", alignItems: "center" }}
            >
              <Ikon icon={House} size={18} />
              Til Cockpit
            </Link>
          }
        />
      ) : (
        <div className="pa-a2-layout">
          {/* Venstre kolonne: Liste med saker */}
          <div className="pa-a2-liste" aria-label="Liste over ventende saker">
            {sakerForFane.map((sak: KoSak) => {
              const erValgt = aktivSak?.id === sak.id;
              const sakInfo = hentSakInfo(sak, fane);

              return (
                <button
                  key={sak.id}
                  type="button"
                  aria-pressed={erValgt}
                  onClick={() => setValgtId(sak.id)}
                  className="pa-a2-item"
                >
                  {sakInfo.akse && <span className={`pa-a2-stripe pa-a2-stripe--${sakInfo.akse}`} aria-hidden />}
                  <div className="pa-a2-item__tekst">
                    <span className="pa-a2-item__tittel">
                      {sakInfo.hvem} · {sakInfo.tittel}
                    </span>
                    <Meta>{sakInfo.kilde.toUpperCase()}</Meta>
                  </div>
                  {sakInfo.status && (
                    <StatusPille tone={sakInfo.status === "Signert" ? "ok" : "neutral"}>
                      {sakInfo.status}
                    </StatusPille>
                  )}
                </button>
              );
            })}
          </div>

          {/* Høyre kolonne: Detaljpanel på desktop */}
          {aktivSak && aktivInfo && (
            <div className="pa-a2-detalj" aria-label="Detaljvisning av sak">
              <div>
                <span className="kicker">
                  {fanerKonfig.find((f) => f.value === fane)?.label.toUpperCase()}
                </span>
                <h2 style={{ font: "var(--type-title-s)", color: "var(--text-primary)", margin: "4px 0 0" }}>
                  {aktivInfo.hvem} · {aktivInfo.tittel}
                </h2>
              </div>

              {renderDetaljInnhold(aktivSak)}
              {renderHandlinger(aktivSak)}
            </div>
          )}
        </div>
      )}

      {/* Skuff for mobil (Sheet) */}
      {aktivSak && aktivInfo && (
        <Ark
          open={!!valgtId}
          onClose={() => setValgtId(null)}
          kicker={fanerKonfig.find((f) => f.value === fane)?.label}
          tittel={`${aktivInfo.hvem} · ${aktivInfo.tittel}`}
          footer={renderHandlinger(aktivSak)}
        >
          {renderDetaljInnhold(aktivSak)}
        </Ark>
      )}

      {/* Bekreftelsesdialog for fjerning av innlegg */}
      {fjernDialogApen && (
        <div className="pa-sheet-layer" role="presentation">
          <div className="pa-sheet-scrim" onClick={() => setFjernDialogApen(false)} />
          <div
            className="pa-card"
            role="alertdialog"
            aria-modal="true"
            aria-label="Fjerne innlegget?"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(420px, calc(100vw - 32px))",
              background: "var(--surface-card)",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              zIndex: 110,
              boxShadow: "var(--shadow-modal)",
            }}
          >
            <h3 style={{ margin: 0, font: "var(--type-title-s)", color: "var(--text-primary)" }}>Fjerne innlegget?</h3>
            <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-secondary)" }}>
              Innlegget slettes permanent for alle deltakere i gruppen. Dette kan ikke angres.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <Knapp variant="ghost" onClick={() => setFjernDialogApen(false)}>
                Avbryt
              </Knapp>
              <Knapp
                variant="signal"
                onClick={() => {
                  setFjernDialogApen(false);
                  if (aktivSak) avvisSak(aktivSak.id, "Innlegget er fjernet", "VARSLER ER SENDT");
                }}
              >
                Fjern innlegg
              </Knapp>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
