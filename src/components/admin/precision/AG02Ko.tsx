"use client";

/**
 * Kø (AG-02) i nytt design: /admin/ko. Én samlet kø for alt som krever beslutning fra coach/admin.
 * Ingenting sendes eller publiseres før det godkjennes. Hver knapp kaller en ekte server action
 * (ag02-handlinger.ts); handlinger uten action finnes ikke på skjermen.
 * Tegning: canvaset «AgencyOS nøkkelskjermer», raden «Kø, oppgaver, innsikt, Jarvis …».
 */
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Feil, Knapp, KnappLenke, Laster, Nokkelverdier, Pille, Seksjon, Tom, Topp, Varsel } from "@/components/admin/agencyos-ny/ny";
import type { Akse } from "@/components/precision/pa";
import { utforKoHandling, type KoHandling, type KoResultat } from "./ag02-handlinger";
import "@/styles/agencyos-ny-mer.css";
import "@/styles/agencyos-ny-ko.css";

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

  const topp = <Topp dato={`Daglig · ${dagLabel}`} tittel="Kø" ingress="Alt som venter på en beslutning fra deg. Ingenting sendes før du godkjenner." />;

  if (tilstand === "laster") return <div className="agn-s">{topp}<Laster tekst="Henter køen …" /></div>;
  if (tilstand === "feil") {
    return <div className="agn-s">{topp}<Feil tittel="Køen kunne ikke hentes" tekst="Ingen saker er godkjent eller avvist. Kontroller forbindelsen og prøv igjen." kode="FEIL 502 · KØ" /></div>;
  }

  /** Saken lukkes og suksess vises FØRST når serveren har svart ok; ellers står saken og feilen vises. */
  const kjor = (id: string, handling: KoHandling, melding: string) => {
    setVarselTekst(null);
    startTransition(async () => {
      const res = await utfor(handling);
      if (!res.ok) {
        setVarselTekst({ tittel: res.feil, meta: "Ingenting er lagret", feil: true });
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
  const antallPer = (f: keyof AG02Data) => data[f].filter((x) => !behandlede[x.id]).length;
  const venterTotalt = tilstand === "tom" ? 0 : faner.reduce((n, f) => n + antallPer(f), 0);
  const aktivInfo = aktivSak ? hentSakInfo(aktivSak, fane) : null;

  function detaljInnhold(sak: KoSak | null) {
    if (!sak) return null;

    if (fane === "godkjenninger") {
      const g = sak as GodkjenningSak;
      return (
        <>
          <p className="kilde mono">{g.from} · {g.at}{g.axis ? ` · ${g.axis.toUpperCase()}` : ""}</p>
          <Nokkelverdier rader={[["Spiller", g.who], ["Gruppe", g.grp ?? "—"], ["Kilde", g.from], ["Frist", g.due ?? "I dag"], ["Sammendrag", g.sum ?? "—"]]} />
          {g.lines && g.lines.length > 0 && (
            <div className="liste">
              {g.lines.map(([dag, tek, min], idx) => (
                <div key={idx} className="ko-linje"><span className="mono kilde">{dag}</span><span>{tek}</span><span className="mono">{min}</span></div>
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
          <p className="kilde mono">{a.agent} · {a.t} · Utkast</p>
          <p className="forklar">{a.body}</p>
          <Nokkelverdier rader={a.facts.map(([k, v, h]) => [k, v, h] as const)} />
          <p className="ko-boks">Går ut som: {a.out}</p>
        </>
      );
    }

    if (fane === "tester") {
      const t = sak as TestSak;
      return (
        <>
          <p className="kilde mono">{t.src} · {t.at} · Venter på godkjenning</p>
          <Nokkelverdier rader={[["Foreslått av", t.who], ["Test", t.test], ["Poengregel", t.scoring ?? "—"], ["Beskrivelse", t.beskrivelse ?? "—"]]} />
        </>
      );
    }

    if (fane === "dubletter") {
      const d = sak as DublettSak;
      return (
        <>
          <p className="forklar">
            {d.malId
              ? "Påmeldinger, resultater og deltakere flyttes fra den manuelle turneringen (A) til turneringen fra kilden (B). A markeres som dublett."
              : "Ingen automatisk match. Sammenslåing gjøres fra Turnering."}
          </p>
          <div className="ko-par">
            {(["a", "b"] as const).map((side) => (
              <div key={side}>
                <p className="kilde mono">{side === "a" ? "A · slås inn" : "B · beholdes"} · {d[side].src ?? "—"}</p>
                <Nokkelverdier rader={DUBLETT_FELTER.map(([nokkel, etikett]) => [etikett, d[side][nokkel] || "—"] as const)} />
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
          <Nokkelverdier rader={[["Type", m.type === "GDPR_SLETTING" ? "Slettforespørsel (GDPR)" : "Rapportert innhold"], ["Gjelder", m.where], ["Spiller", m.who], ["Begrunnelse", m.reason], ["Tidspunkt", m.at]]} />
          {m.text && <p className="ko-boks">{m.text}</p>}
          {m.type === "GDPR_SLETTING" && (
            <p className="kilde">
              {m.status === "APPROVED" ? "Godkjent. Slettingen må bekreftes." : "To steg: godkjenning først, selve slettingen bekreftes etterpå."}
            </p>
          )}
        </>
      );
    }

    if (fane === "epost") {
      const ep = sak as EpostSak;
      const notat = epostNotat[ep.id] ?? ep.note ?? "";
      return (
        <>
          <p className="kilde mono">{ep.tpl} · laget av {ep.by} {ep.at} · Utkast</p>
          <Nokkelverdier rader={[["Mottaker", `${ep.to} (${ep.email})`], ["Gjelder", ep.svc], ["Mal", `${ep.tpl} · Takk etter coachingtime`]]} />
          <label className="felt">
            <span className="etikett">Dine linjer til eleven</span>
            <textarea aria-label="Dine linjer til eleven" rows={4} value={notat} onChange={(e) => setEpostNotat((prev) => ({ ...prev, [ep.id]: e.target.value }))} />
            <span className="hjelp">To–tre personlige linjer om hva dere trente på i dag.</span>
          </label>
          <p className="ko-boks" style={{ whiteSpace: "pre-wrap" }}>
            <strong>Forhåndsvisning:</strong>
            {"\n\n"}Hei {ep.to}!{"\n"}Takk for god innsats under økten «{ep.svc}».{"\n\n"}
            {notat}
            {"\n\nHilsen Anders Kristiansen · AK Golf"}
          </p>
        </>
      );
    }

    return null;
  }

  /* Hver knapp kaller en ekte server action. E-postutkast har ingen sende-action ennå: ingen knapp som later som. */
  function handlinger(sak: KoSak | null) {
    if (!sak) return null;

    if (fane === "godkjenninger") {
      const g = sak as GodkjenningSak;
      const kilde = g.kilde ?? "agent";
      if (kilde === "caddie") {
        return (
          <div className="knapper">
            <Knapp disabled={pending} onClick={() => kjor(g.id, { type: "caddie-send", id: g.id }, "Utkastet er godkjent og utført")}>Send</Knapp>
            <Knapp variant="sek" disabled={pending} onClick={() => kjor(g.id, { type: "caddie-forkast", id: g.id }, "Utkastet er forkastet")}>Forkast</Knapp>
          </div>
        );
      }
      if (kilde === "forespørsel") {
        return (
          <div className="knapper">
            <Knapp disabled={pending} onClick={() => kjor(g.id, { type: "foresporsel-planlagt", id: g.id }, "Forespørselen er markert som planlagt")}>Legg i kalenderen</Knapp>
            <Knapp variant="sek" disabled={pending} onClick={() => kjor(g.id, { type: "foresporsel-avslaa", id: g.id }, "Forespørselen er avslått")}>Kan ikke</Knapp>
          </div>
        );
      }
      return (
        <div className="knapper">
          <Knapp disabled={pending} onClick={() => kjor(g.id, { type: "plan-godkjenn", id: g.id }, "Forslaget er godkjent")}>Godkjenn</Knapp>
          <Knapp variant="sek" disabled={pending} onClick={() => kjor(g.id, { type: "plan-avvis", id: g.id }, "Forslaget er avvist")}>Avvis</Knapp>
        </div>
      );
    }

    if (fane === "agentko") {
      const a = sak as AgentSak;
      return (
        <div className="knapper">
          <Knapp disabled={pending} onClick={() => kjor(a.id, { type: "plan-godkjenn", id: a.id }, "Forslaget er godkjent")}>Godkjenn</Knapp>
          <Knapp variant="sek" disabled={pending} onClick={() => kjor(a.id, { type: "plan-avvis", id: a.id }, "Forslaget er avvist")}>Avvis</Knapp>
        </div>
      );
    }

    if (fane === "tester") {
      const t = sak as TestSak;
      return (
        <div className="knapper">
          <Knapp disabled={pending} onClick={() => kjor(t.id, { type: "test-godkjenn", id: t.id }, "Testen er godkjent")}>Godkjenn testen</Knapp>
          <Knapp
            variant="sek"
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
        <div className="knapper">
          <Knapp disabled={pending} onClick={() => kjor(d.id, { type: "dublett-slaa-sammen", kildeId: d.kildeId, malId }, "Turneringene er slått sammen")}>Slå sammen</Knapp>
        </div>
      );
    }

    if (fane === "moderering") {
      const m = sak as ModereringSak;
      if (m.type === "GDPR_SLETTING" && m.status === "APPROVED") {
        return (
          <div className="knapper">
            <Knapp
              variant="rust"
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
        <div className="knapper">
          <Knapp disabled={pending} onClick={() => kjor(m.id, { type: "moderering-godkjenn", id: m.id }, "Saken er godkjent")}>{gdpr ? "Godkjenn forespørselen" : "Godkjenn rapporten"}</Knapp>
          <Knapp variant="sek" disabled={pending} onClick={() => kjor(m.id, { type: "moderering-avvis", id: m.id }, "Saken er avvist")}>Avvis</Knapp>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="agn-s" data-testid="ag02-ko">
      {topp}

      <div className="teller-rad">
        <div className="teller"><span className="e">Venter på deg</span><b className="t">{venterTotalt}</b><span className="s">Alle faner</span></div>
        <div className="teller"><span className="e">I denne fanen</span><b className="t">{tilstand === "tom" ? 0 : sakerForFane.length}</b><span className="s">{FANE_LABEL[fane]}</span></div>
        <div className="teller"><span className="e">Behandlet nå</span><b className="t">{Object.keys(behandlede).length}</b></div>
      </div>

      <nav className="valg" aria-label="Kø">
        {faner.map((f) => {
          const n = antallPer(f);
          return <button key={f} type="button" aria-pressed={fane === f} onClick={() => { setFane(f); setValgtId(null); }}>{n > 0 ? `${FANE_LABEL[f]} · ${n}` : FANE_LABEL[f]}</button>;
        })}
      </nav>

      {varselTekst && (
        <Varsel tone={varselTekst.feil ? "advarsel" : "ok"} tittel={varselTekst.tittel}>
          {varselTekst.meta}
          <span className="ko-lukk"><Knapp variant="sek" aria-label="Lukk varsel" onClick={() => setVarselTekst(null)}>Lukk</Knapp></span>
        </Varsel>
      )}

      {sakerForFane.length === 0 ? (
        <Tom
          tittel="Ingen saker venter"
          tekst="Alt i denne fanen er ferdig behandlet. Nye saker kommer fra utøvere, foreldre og agentene."
          handling={<KnappLenke href="/admin/agencyos">Til Cockpit</KnappLenke>}
        />
      ) : (
        <div className="to-del bred-v">
          <Seksjon tittel={FANE_LABEL[fane]} kilde={`${sakerForFane.length} ${sakerForFane.length === 1 ? "sak" : "saker"}`}>
            <div className="liste" aria-label="Liste over ventende saker">
              {sakerForFane.map((sak: KoSak) => {
                const info = hentSakInfo(sak, fane);
                return (
                  <button key={sak.id} type="button" className="drift-rad" aria-pressed={aktivSak?.id === sak.id} onClick={() => setValgtId(sak.id)}>
                    <span><b>{info.hvem} · {info.tittel}</b><span className="kilde">{info.kilde}{info.akse ? ` · ${info.akse.toUpperCase()}` : ""}</span></span>
                    <span aria-hidden />
                    {info.status ? <Pille tone={info.status === "Signert" ? "ok" : "noy"}>{info.status}</Pille> : <span aria-hidden />}
                  </button>
                );
              })}
            </div>
          </Seksjon>

          {aktivSak && aktivInfo && (
            <Seksjon tittel={`${aktivInfo.hvem} · ${aktivInfo.tittel}`} kilde={FANE_LABEL[fane]}>
              <div className="kort" aria-label="Detaljvisning av sak">
                {detaljInnhold(aktivSak)}
                {handlinger(aktivSak)}
              </div>
            </Seksjon>
          )}
        </div>
      )}

      {bekreft && (
        <div className="dialog-lag">
          <div role="alertdialog" aria-modal="true" aria-label={bekreft.tittel} className="dialog">
            <h2>{bekreft.tittel}</h2>
            <p className="forklar">{bekreft.tekst}</p>
            <div className="knapper">
              <Knapp
                variant="rust"
                stor
                disabled={pending}
                onClick={() => {
                  const b = bekreft;
                  setBekreft(null);
                  kjor(b.id, b.handling, b.melding);
                }}
              >
                {bekreft.knapp}
              </Knapp>
              <Knapp variant="sek" stor onClick={() => setBekreft(null)}>Avbryt</Knapp>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
