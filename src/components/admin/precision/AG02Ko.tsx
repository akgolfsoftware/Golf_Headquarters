"use client";

/**
 * AG-02 Kø i Precision Athletics (Claude Design 7d7c2994,
 * arkiv/2026-09-30/agencyos/screens/AG-02.jsx, med utvidelser for
 * agentkø, tester, dubletter, moderering og godkjenninger).
 *
 * Én samlet kø for alle saker som krever beslutning fra trener/admin.
 * Ingenting sendes eller publiseres før det godkjennes.
 */
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  GitMerge,
  House,
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
import { utforKoHandling, type KoHandling, type KoResultat } from "./ag02-handlinger";
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
  /** Hvilken kilde saken kommer fra — styrer hvilke server actions knappene kaller. */
  kilde?: "agent" | "caddie" | "forespørsel";
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

/** Spillerforeslått test (TestDefinition) som venter på coachens godkjenning. */
export type TestSak = {
  id: string;
  who: string;
  test: string;
  src: string;
  at: string;
  beskrivelse?: string;
  scoring?: string;
};

/** Manuell turnering (A, slås inn) mot beste kandidat fra ekte kilde (B, beholdes). */
export type DublettSak = {
  id: string;
  match: string;
  /** Manuell turnering som flyttes over og markeres som dublett. */
  kildeId: string;
  /** Kanonisk turnering som beholdes. null = ingen automatisk match. */
  malId: string | null;
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
  type: "GDPR_SLETTING" | "RAPPORTERT_INNHOLD";
  /** APPROVED + GDPR_SLETTING = godkjent, venter på at slettingen bekreftes. */
  status: "OPEN" | "APPROVED";
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
  /** Fanene brukeren har tilgang til. Uten capability finnes fanen ikke. */
  faner?: (keyof AG02Data)[];
  /** Utfører handlingen mot serveren. Byttes bare ut i tester. */
  utfor?: (h: KoHandling) => Promise<KoResultat>;
};

const DUBLETT_FELTER: [string, string][] = [
  ["name", "Navn"],
  ["dato", "Dato"],
  ["bane", "Bane"],
  ["pamelding", "Påmeldte"],
  ["resultater", "Resultater"],
];

/** Tom kø. Produksjonsruten viser aldri demospillere — demodata bor i prøvefila. */
export const TOM_KO: AG02Data = {
  godkjenninger: [],
  agentko: [],
  tester: [],
  dubletter: [],
  moderering: [],
  epost: [],
};

const ALLE_FANER: (keyof AG02Data)[] = ["godkjenninger", "agentko", "tester", "dubletter", "moderering", "epost"];

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
  data = TOM_KO,
  faner = ALLE_FANER,
  utfor = utforKoHandling,
}: AG02KoProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [fane, setFane] = useState<keyof AG02Data>(() => {
    const onsket = normaliserFane(startFane);
    return faner.includes(onsket) ? onsket : (faner[0] ?? "godkjenninger");
  });
  const [valgtId, setValgtId] = useState<string | null>(null);
  const [behandlede, setBehandlede] = useState<Record<string, string>>({});
  /** Destruktiv handling som venter på bekreftelse i dialog (rust). */
  const [bekreft, setBekreft] = useState<{ tittel: string; tekst: string; knapp: string; handling: KoHandling; id: string; melding: string } | null>(null);
  const [epostNotat, setEpostNotat] = useState<Record<string, string>>({});
  const [varselTekst, setVarselTekst] = useState<{ tittel: string; meta?: string; feil?: boolean } | null>(null);

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

  /**
   * Kjører handlingen mot serveren. Saken lukkes og suksess vises FØRST når
   * serveren har svart ok; ellers står saken og feilen vises.
   */
  const kjor = (id: string, handling: KoHandling, melding: string) => {
    setVarselTekst(null);
    startTransition(async () => {
      const res = await utfor(handling);
      if (!res.ok) {
        setVarselTekst({ tittel: res.feil, meta: "INGENTING ER LAGRET", feil: true });
        return;
      }
      setBehandlede((prev) => ({ ...prev, [id]: melding }));
      setValgtId(null);
      setVarselTekst({ tittel: melding, meta: res.meta });
      router.refresh();
    });
  };

  const FANE_LABEL: Record<keyof AG02Data, string> = {
    godkjenninger: "Godkjenninger",
    agentko: "Agentforslag",
    tester: "Tester",
    dubletter: "Dubletter",
    moderering: "Moderering",
    epost: "E-postutkast",
  };
  const fanerKonfig = faner.map((f) => ({
    value: f,
    label: FANE_LABEL[f],
    count: data[f].filter((x) => !behandlede[x.id]).length,
  }));

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
      return (
        <>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <StatusPille tone="warn">Venter på godkjenning</StatusPille>
            <Meta>{t.src.toUpperCase()} · {t.at.toUpperCase()}</Meta>
          </div>
          <Nokkelverdi
            items={[
              ["Foreslått av", t.who],
              ["Test", t.test],
              ["Poengregel", t.scoring ?? "—"],
              ["Beskrivelse", t.beskrivelse ?? "—"],
            ]}
          />
        </>
      );
    }

    if (fane === "dubletter") {
      const d = sak as DublettSak;
      return (
        <>
          <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
            {d.malId
              ? "Påmeldinger, resultater og deltakere flyttes fra den manuelle turneringen (A) til turneringen fra kilden (B). A markeres som dublett."
              : "Ingen automatisk match. Sammenslåing gjøres fra Turnering."}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, minWidth: 0 }}>
            {(["a", "b"] as const).map((side) => (
              <div key={side} style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                <Meta>
                  {side === "a" ? "A · SLÅS INN" : "B · BEHOLDES"} · {(d[side].src ?? "—").toUpperCase()}
                </Meta>
                <Nokkelverdi items={DUBLETT_FELTER.map(([nokkel, etikett]) => [etikett, d[side][nokkel] || "—"])} />
              </div>
            ))}
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
              ["Type", m.type === "GDPR_SLETTING" ? "Slettforespørsel (GDPR)" : "Rapportert innhold"],
              ["Gjelder", m.where],
              ["Spiller", m.who],
              ["Begrunnelse", m.reason],
              ["Tidspunkt", m.at],
            ]}
          />
          {m.text && <div className="pa-a2-sunken">{m.text}</div>}
          {m.type === "GDPR_SLETTING" && (
            <Meta>
              {m.status === "APPROVED"
                ? "GODKJENT · SLETTINGEN MÅ BEKREFTES"
                : "TO STEG: GODKJENNING FØRST, SELVE SLETTINGEN BEKREFTES ETTERPÅ"}
            </Meta>
          )}
        </>
      );
    }

    if (fane === "epost") {
      const ep = sak as EpostSak;
      const notat = epostNotat[ep.id] ?? ep.note ?? "";
      return (
        <>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <StatusPille tone="neutral">Utkast</StatusPille>
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

  /* Handlingsknapper — hver knapp kaller en ekte server action (ag02-handlinger.ts).
     Handlinger uten action finnes ikke på skjermen. */
  function renderHandlinger(sak: KoSak | null) {
    if (!sak) return null;

    if (fane === "godkjenninger") {
      const g = sak as GodkjenningSak;
      const kilde = g.kilde ?? "agent";
      if (kilde === "caddie") {
        return (
          <div className="pa-a2-handling">
            <Knapp fullWidth icon={Send} disabled={pending} onClick={() => kjor(g.id, { type: "caddie-send", id: g.id }, "Utkastet er godkjent og utført")}>
              Send
            </Knapp>
            <Knapp variant="ghost" fullWidth disabled={pending} onClick={() => kjor(g.id, { type: "caddie-forkast", id: g.id }, "Utkastet er forkastet")}>
              Forkast
            </Knapp>
          </div>
        );
      }
      if (kilde === "forespørsel") {
        return (
          <div className="pa-a2-handling">
            <Knapp fullWidth icon={Check} disabled={pending} onClick={() => kjor(g.id, { type: "foresporsel-planlagt", id: g.id }, "Forespørselen er markert som planlagt")}>
              Legg i kalenderen
            </Knapp>
            <Knapp variant="ghost" fullWidth disabled={pending} onClick={() => kjor(g.id, { type: "foresporsel-avslaa", id: g.id }, "Forespørselen er avslått")}>
              Kan ikke
            </Knapp>
          </div>
        );
      }
      return (
        <div className="pa-a2-handling">
          <Knapp fullWidth icon={Check} disabled={pending} onClick={() => kjor(g.id, { type: "plan-godkjenn", id: g.id }, "Forslaget er godkjent")}>
            Godkjenn
          </Knapp>
          <Knapp variant="ghost" fullWidth disabled={pending} onClick={() => kjor(g.id, { type: "plan-avvis", id: g.id }, "Forslaget er avvist")}>
            Avvis
          </Knapp>
        </div>
      );
    }

    if (fane === "agentko") {
      const a = sak as AgentSak;
      return (
        <div className="pa-a2-handling">
          <Knapp fullWidth icon={Check} disabled={pending} onClick={() => kjor(a.id, { type: "plan-godkjenn", id: a.id }, "Forslaget er godkjent")}>
            Godkjenn
          </Knapp>
          <Knapp variant="ghost" fullWidth disabled={pending} onClick={() => kjor(a.id, { type: "plan-avvis", id: a.id }, "Forslaget er avvist")}>
            Avvis
          </Knapp>
        </div>
      );
    }

    if (fane === "tester") {
      const t = sak as TestSak;
      return (
        <div className="pa-a2-handling">
          <Knapp fullWidth icon={ShieldCheck} disabled={pending} onClick={() => kjor(t.id, { type: "test-godkjenn", id: t.id }, "Testen er godkjent")}>
            Godkjenn testen
          </Knapp>
          <Knapp
            variant="ghost"
            fullWidth
            icon={Trash2}
            disabled={pending}
            onClick={() =>
              setBekreft({
                id: t.id,
                tittel: "Avvise og slette testen?",
                tekst: `«${t.test}» slettes, og ${t.who} får beskjed om at den ble avvist. Dette kan ikke angres.`,
                knapp: "Avvis og slett",
                handling: { type: "test-avvis", id: t.id },
                melding: "Testen er avvist og slettet",
              })
            }
          >
            Avvis
          </Knapp>
        </div>
      );
    }

    if (fane === "dubletter") {
      const d = sak as DublettSak;
      if (!d.malId) return null;
      const malId = d.malId;
      return (
        <div className="pa-a2-handling">
          <Knapp
            fullWidth
            icon={GitMerge}
            disabled={pending}
            onClick={() => kjor(d.id, { type: "dublett-slaa-sammen", kildeId: d.kildeId, malId }, "Turneringene er slått sammen")}
          >
            Slå sammen
          </Knapp>
        </div>
      );
    }

    if (fane === "moderering") {
      const m = sak as ModereringSak;
      if (m.type === "GDPR_SLETTING" && m.status === "APPROVED") {
        return (
          <div className="pa-a2-handling">
            <Knapp
              variant="signal"
              fullWidth
              icon={Trash2}
              disabled={pending}
              onClick={() =>
                setBekreft({
                  id: m.id,
                  tittel: "Bekreft GDPR-sletting?",
                  tekst: `Profilen til ${m.who} anonymiseres: navnet blir «Slettet bruker», og e-post, telefon, profilbilde og fødselsdato fjernes. Treningsdata, bookinger og økter beholdes uten personopplysninger. Dette kan ikke angres.`,
                  knapp: "Bekreft sletting",
                  handling: { type: "moderering-gdpr-utfor", id: m.id },
                  melding: "Slettingen er utført",
                })
              }
            >
              Bekreft sletting
            </Knapp>
          </div>
        );
      }
      const gdpr = m.type === "GDPR_SLETTING";
      return (
        <div className="pa-a2-handling">
          <Knapp fullWidth icon={Check} disabled={pending} onClick={() => kjor(m.id, { type: "moderering-godkjenn", id: m.id }, "Saken er godkjent")}>
            {gdpr ? "Godkjenn forespørselen" : "Godkjenn rapporten"}
          </Knapp>
          <Knapp variant="ghost" fullWidth disabled={pending} onClick={() => kjor(m.id, { type: "moderering-avvis", id: m.id }, "Saken er avvist")}>
            Avvis
          </Knapp>
        </div>
      );
    }

    // E-postutkast har ingen sende-action ennå: ingen knapp som later som.
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
      </div>

      {varselTekst && (
        <div
          role={varselTekst.feil ? "alert" : "status"}
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
            <Ikon icon={varselTekst.feil ? TriangleAlert : CheckCircle2} size={18} />
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

      {/* Bekreftelsesdialog for destruktive handlinger */}
      {bekreft && (
        <div className="pa-sheet-layer" role="presentation">
          <div className="pa-sheet-scrim" onClick={() => setBekreft(null)} />
          <div
            className="pa-card"
            role="alertdialog"
            aria-modal="true"
            aria-label={bekreft.tittel}
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
            <h3 style={{ margin: 0, font: "var(--type-title-s)", color: "var(--text-primary)" }}>{bekreft.tittel}</h3>
            <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-secondary)" }}>{bekreft.tekst}</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <Knapp variant="ghost" onClick={() => setBekreft(null)}>
                Avbryt
              </Knapp>
              <Knapp
                variant="signal"
                disabled={pending}
                onClick={() => {
                  const b = bekreft;
                  setBekreft(null);
                  kjor(b.id, b.handling, b.melding);
                }}
              >
                {bekreft.knapp}
              </Knapp>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
