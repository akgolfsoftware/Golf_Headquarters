"use client";

/**
 * AG-15 Tester i nytt design (designbrevet 13.10.2026) — /admin/tester.
 * Fasit: docs/design-system/utkast-agencyos/mer.html, skjerm «AG-15 Tester».
 *
 * Faner: Resultater · Tildelt · Normer · Poengskala. «Tildel test» åpner arket
 * og kaller samme handling som før (tildelTest: TestAssignment + varsel til spilleren).
 * En test teller først når alle forsøk er registrert (testResult finnes da).
 *
 * Test og spiller velges med den felles nedtrekksmenyen (søk på PC, ark på mobil).
 *
 * Avvik:
 *   - Arket tildeler til én spiller. Tildeling til en hel gruppe har ingen handling i appen.
 *   - Normene viser «Referanse ikke satt» for A–K: nivåtallene er ikke vedtatt (beslutninger.md §Åpent).
 *   - Tildelte TrackMan-økter har ingen datamodell og vises ikke.
 */
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { Avatar, Knapp, Pille, Tom, Topp, Varsel, type PilleTone } from "@/components/admin/agencyos-ny/ny";
import { Nedtrekk } from "@/components/precision/Nedtrekk";
import type { AdminTesterV2Data, AdminTesterStatus } from "@/components/admin/v2/AdminTesterV2";
import { tildelTest } from "@/app/admin/(legacy)/tester/tildel/[spillerId]/actions";
import "@/styles/agencyos-ny-mer.css";
import { AG15Oversikt } from "./AG15Oversikt";
import type { TesterOversiktSide } from "@/lib/admin/tester/oversikt-data";

export type AG15Tildelt = { id: string; spillerId: string; spillerNavn: string; testNavn: string; frist: string | null; tildelt: string };
export type AG15Valg = { tester: ReadonlyArray<{ id: string; navn: string }>; spillere: ReadonlyArray<{ id: string; navn: string }> };
export type AG15Fane = "resultater" | "tildelt" | "normer" | "skala";

export type AG15Props = {
  data: AdminTesterV2Data;
  tildelt?: readonly AG15Tildelt[];
  valg?: AG15Valg;
  startFane?: AG15Fane;
  /** Åpner arket med spilleren valgt (fra /admin/tester/tildel/[spillerId]). */
  tildelSpillerId?: string | null;
  /** Spillerne mot de 19 testene, til kontroll og neste testdag (designløftet 20.10). */
  oversikt?: TesterOversiktSide | null;
};

const FANER: ReadonlyArray<[AG15Fane, string]> = [["resultater", "Resultater"], ["tildelt", "Tildelt"], ["normer", "Normer"], ["skala", "Poengskala"]];
const KATEGORIER = "ABCDEFGHIJK".split("");

function tone(s: AdminTesterStatus): PilleTone {
  if (s === "Bedre") return "ok";
  if (s === "Svakere") return "feil";
  if (s === "Pågår") return "vent";
  return "noy";
}

function TildelArk({ valg, spillerId, onLukk }: { valg: AG15Valg; spillerId: string | null; onLukk: () => void }) {
  const router = useRouter();
  const [test, setTest] = useState(valg.tester[0]?.id ?? "");
  const [spiller, setSpiller] = useState(spillerId ?? valg.spillere[0]?.id ?? "");
  const [frist, setFrist] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, start] = useTransition();
  const send = () => start(async () => {
    setFeil(null);
    const r = await tildelTest({ spillerId: spiller, testId: test, dueDate: frist || undefined });
    if (!r.ok) { setFeil(r.error ?? "Testen ble ikke tildelt."); return; }
    onLukk();
    router.refresh();
  });
  return <div className="ark-lag" onClick={(e) => { if (e.target === e.currentTarget) onLukk(); }}>
    <div className="ark" role="dialog" aria-modal="true" aria-label="Tildel test">
      <div className="ark-topp"><h2>Tildel test</h2><button type="button" className="lukk" aria-label="Lukk" onClick={onLukk}><X className="ikon" aria-hidden /></button></div>
      {valg.tester.length === 0 || valg.spillere.length === 0 ? <p className="forklar">{valg.spillere.length === 0 ? "Du har ingen spillere å tildele til." : "Ingen tester finnes i katalogen."}</p> : <>
        <div className="felt"><Nedtrekk etikett="Test" bred valg={valg.tester.map((t) => ({ verdi: t.id, navn: t.navn }))} verdi={test} onVelg={setTest} /></div>
        <div className="felt"><Nedtrekk etikett="Spiller" bred valg={valg.spillere.map((s) => ({ verdi: s.id, navn: s.navn }))} verdi={spiller} onVelg={setSpiller} /></div>
        <div className="felt"><label htmlFor="td-frist">Frist</label><input id="td-frist" type="date" value={frist} onChange={(e) => setFrist(e.target.value)} /><span className="hjelp">Valgfri. Spilleren får varsel om testen.</span></div>
        {feil && <p className="feiltekst" role="alert">{feil}</p>}
        <Knapp stor disabled={venter || !test || !spiller} onClick={send}>{venter ? "Tildeler …" : "Tildel"}</Knapp>
      </>}
    </div>
  </div>;
}

export function AG15Tester({ data, tildelt = [], valg, startFane = "resultater", tildelSpillerId = null, oversikt = null }: AG15Props) {
  const [fane, setFane] = useState<AG15Fane>(startFane);
  const [ark, setArk] = useState<boolean>(!!tildelSpillerId && !!valg);
  const [filter, setFilter] = useState("alle");
  const rader = useMemo(() => filter === "alle" ? data.rader : data.rader.filter((r) => r.test === filter), [data.rader, filter]);

  return <div className="agn-s">
    {oversikt ? <>
      <AG15Oversikt d={oversikt} handling={valg ? <Knapp variant="sek" onClick={() => setArk(true)}>Tildel test</Knapp> : undefined} />
      <div className="sek-topp"><h2>Alle resultater</h2><span className="kilde">{data.kpis.map((k) => `${k.label} ${k.value}`).join(" · ")}</span></div>
    </> : <>
      <Topp dato="Mer · tester" tittel="Tester" ingress="En test teller først når spilleren har registrert alle forsøk."
        handlinger={valg ? <Knapp onClick={() => setArk(true)}>Tildel test</Knapp> : undefined} />
      <div className="teller-rad">
        {data.kpis.map((k) => <div key={k.label} className={k.varsle ? "teller signal" : "teller"}><span className="e">{k.label}</span><b className="t">{k.value}</b></div>)}
      </div>
    </>}

    <div className="faner" role="group" aria-label="Del">
      {FANER.map(([id, label]) => <button key={id} type="button" aria-pressed={fane === id} onClick={() => setFane(id)}>{label}{id === "tildelt" && tildelt.length > 0 ? <span className="antall">{tildelt.length}</span> : null}</button>)}
    </div>

    {fane === "resultater" && (data.rader.length === 0
      ? <Tom tittel="Ingen tester registrert ennå" tekst="Resultater dukker opp her når spillerne gjennomfører tester." />
      : <section className="seksjon" aria-label="Resultater">
        {data.tester.length > 1 && <div className="chips" role="group" aria-label="Test">
          {["alle", ...data.tester].map((t) => <button key={t} type="button" aria-pressed={filter === t} onClick={() => setFilter(t)}>{t === "alle" ? "Alle" : t}</button>)}
        </div>}
        <div className="kort rader">
          {rader.map((r) => <Link key={r.key} href={`/admin/spillere/${r.spillerId}`} className="mer-rad">
            <Avatar navn={r.navn} liten />
            <span><b>{r.navn} · {r.test}</b><span className="kilde">{r.dato}{r.delta ? ` · ${r.delta}` : ""}</span></span>
            <span className="hoyre"><span className="mono">{r.resultat}</span><Pille tone={tone(r.status)}>{r.status}</Pille></span>
          </Link>)}
        </div>
        <p className="kilde">Trykk en rad for spillerens side.</p>
      </section>)}

    {fane === "tildelt" && (tildelt.length === 0
      ? <Tom tittel="Ingen tester tildelt" tekst="Tildel en test til en spiller. Spilleren får varsel og finner testen i PlayerHQ."
        handling={valg ? <Knapp onClick={() => setArk(true)}>Tildel test</Knapp> : undefined} />
      : <section className="seksjon" aria-label="Tildelt">
        <div className="hoved"><strong>{tildelt.length}</strong><span className="forklar">tildelt og ikke tatt</span></div>
        <div className="kort rader">
          {tildelt.map((t) => <Link key={t.id} href={`/admin/spillere/${t.spillerId}`} className="mer-rad">
            <Avatar navn={t.spillerNavn} liten />
            <span><b>{t.spillerNavn} · {t.testNavn}</b><span className="kilde">Tildelt {t.tildelt}{t.frist ? ` · frist ${t.frist}` : ""}</span></span>
            <span className="hoyre"><Pille tone="vent">Ikke tatt</Pille><ChevronRight className="ikon" aria-hidden /></span>
          </Link>)}
        </div>
      </section>)}

    {fane === "normer" && <section className="seksjon" aria-label="Normer">
      <div className="normer">
        {KATEGORIER.map((k) => <div key={k} className="norm"><b>{k}</b><span>Kategori {k}</span><span className="v">Referanse ikke satt</span></div>)}
      </div>
      <p className="kilde">A–K-nivåtallene er ikke vedtatt. Normene fylles inn når de er det.</p>
    </section>}

    {fane === "skala" && <div className="seksjon">
      <section className="seksjon" aria-label="Putt 9 hull lengde">
        <div className="sek-topp"><h2>Putt 9 hull lengde</h2><span className="kilde">Restavstand i fot</span></div>
        <div className="skala-tab">
          {([["6", "senket"], ["3", "til 1 fot"], ["1", "til 2 fot"], ["0,5", "til 4 fot"], ["0", "over 4 fot"]] as const).map(([p, t]) => <div key={t}><b>{p}</b><span>{t}</span></div>)}
        </div>
      </section>
      <section className="seksjon" aria-label="8-ball">
        <div className="sek-topp"><h2>8-ball</h2><span className="kilde">Meter fra hullet</span></div>
        <div className="skala-tab">
          {([["5", "i hull"], ["3", "innen 1 m"], ["2", "innen 2 m"], ["1", "innen 3 m"], ["0", "lenger unna"]] as const).map(([p, t]) => <div key={t}><b>{p}</b><span>{t}</span></div>)}
        </div>
      </section>
      <Varsel tittel="Gate-testene">Nærspill Gate, Wedge Gate og VISA Express: 1 poeng gjennom porten, 4 poeng gjennom porten og i sonen, maks 36. Driver Gate og Putt Gate telles som OK: «X / 6 OK» og «X / 10 OK».</Varsel>
      <p className="kilde">Kilde: Team Norways scorekort-ark (fanen Referens), testbeskrivelsen 2026 og vedtakene 28.09, 14.10 og 20.10.</p>
    </div>}

    {ark && valg && <TildelArk valg={valg} spillerId={tildelSpillerId} onLukk={() => setArk(false)} />}
  </div>;
}
