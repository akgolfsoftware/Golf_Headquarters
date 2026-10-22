"use client";

/**
 * AG-15 Planlegg testdag og testdagen (designløftet 20.10.2026). Fasit: canvaset
 * «AgencyOS nøkkelskjermer», tavlene Testdag og Testdag-mobil (godkjent 20.10).
 *
 * Planlegg: gruppe, dato, tid, sted og testene (bare de en trener fører: Teknikk og
 * PEI). «Legg inn testdagen» lager én stasjon per test med alle aktive spillere i
 * gruppa. Ingen e-post sendes. Testdagen: stasjonene med spillerne og status.
 *
 * Skrå-drakten 22.10 (bølge 2, pakke A5, skissen §4): lav topp med wedgebildet. Testdagen har
 * deltakerne som liste og registreringen til høyre på PC (`?deltaker=`, samme skjema og samme
 * lagring som /admin/tester/registrer), og «Til kontroll» med egenførte resultater i gruppa.
 *
 * Avvik: /admin/tester/testdag er planleggingsskjemaet. Appen har ingen liste over alle testdager.
 */
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Topp } from "@/components/admin/agencyos-ny/ny";
import { Nedtrekk } from "@/components/precision/Nedtrekk";
import { Kontroller } from "./AG15Oversikt";
import { RegistrerSkjema, TEST_BILDE } from "./AG15Registrer";
import type { TesterOversiktSide } from "@/lib/admin/tester/oversikt-data";
import { planleggTestdag } from "@/app/admin/tester/testdag-actions";
import type { RegistreringData, StasjonsTest, TestdagVisning } from "@/lib/admin/tester/testdag-data";
import { BATTERI_DELER } from "@/lib/portal-tester/testbatteri";
import "@/styles/agencyos-ny-testdag.css";
import "@/styles/agencyos-ny-tester.css";
import "@/styles/agencyos-ny-a5-skra.css";

export function AG15Planlegg({ grupper, tester, startGruppe = null, idag }: {
  grupper: { id: string; navn: string; antall: number }[];
  tester: StasjonsTest[];
  startGruppe?: string | null;
  /** «YYYY-MM-DD» i Oslo-tid, laveste dato som kan velges. */
  idag: string;
}) {
  const router = useRouter();
  const [gruppe, setGruppe] = useState<string | null>(startGruppe && grupper.some((g) => g.id === startGruppe) ? startGruppe : grupper[0]?.id ?? null);
  const [dato, setDato] = useState("");
  const [klokke, setKlokke] = useState("16:00");
  const [sted, setSted] = useState("");
  const [valgt, setValgt] = useState<ReadonlySet<string>>(new Set());
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, start] = useTransition();
  const g = grupper.find((x) => x.id === gruppe) ?? null;
  const perDel = useMemo(() => BATTERI_DELER.map((del) => ({ del, tester: tester.filter((t) => t.del === del) })).filter((x) => x.tester.length), [tester]);
  const bytt = (id: string) => setValgt((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const klar = !!gruppe && !!dato && !!klokke && valgt.size > 0;

  const send = () => start(async () => {
    setFeil(null);
    if (!gruppe) return;
    const r = await planleggTestdag({ gruppeId: gruppe, start: `${dato}T${klokke}`, sted: sted.trim() || undefined, protokoller: [...valgt] });
    if (!r.ok) { setFeil(r.error); return; }
    router.push(`/admin/tester/testdag/${r.eventId}`);
  });

  return <div className="agn-s tdg agn-a5-under">
    <Topp tilbake={{ href: "/admin/tester", tekst: "Tester" }} bilde={TEST_BILDE} dato="Tester · testdag" tittel="Planlegg testdag"
      ingress="Testdagen legges inn i Tester for gruppa. Ingen e-post sendes." />
    {!grupper.length ? <section className="seksjon" aria-label="Planlegg testdag"><p className="tdg-dempet">Du er ikke trener for noen gruppe ennå.</p></section> : <div className="tdg-to">
      <div className="tdg-skjema a5-hvit">
        <div className="tdg-felt"><span className="etikett">Gruppe</span>
          <Nedtrekk etikett="Gruppe" bred valg={grupper.map((x) => ({ verdi: x.id, navn: x.navn, antall: String(x.antall) }))} verdi={gruppe} onVelg={setGruppe} /></div>
        <div className="tdg-rad">
          <label className="tdg-felt"><span className="etikett">Dato</span><input type="date" min={idag} value={dato} onChange={(e) => setDato(e.target.value)} /></label>
          <label className="tdg-felt"><span className="etikett">Start</span><input type="time" step={900} value={klokke} onChange={(e) => setKlokke(e.target.value)} /></label>
        </div>
        <label className="tdg-felt"><span className="etikett">Sted</span><input type="text" maxLength={120} placeholder="For eksempel Mulligan" value={sted} onChange={(e) => setSted(e.target.value)} /></label>
        <fieldset className="tdg-tester">
          <legend>Testene</legend>
          <p className="tdg-forklar">Du fører Teknikk- og PEI-testene. Putt 1–3 m, 9 hull lengde og Fysisk fører spilleren selv i PlayerHQ, og du kan merke dem kontrollert i Tester.</p>
          {perDel.map(({ del, tester: liste }) => <div key={del} className="tdg-del">
            <b className={`tdg-del-navn del-${del.toLowerCase()}`}><i aria-hidden />{del}</b>
            {liste.map((t) => <label key={t.protokollId} className="tdg-valg">
              <input type="checkbox" checked={valgt.has(t.protokollId)} onChange={() => bytt(t.protokollId)} />
              <span>{t.navn}</span><span className="num">{t.slag} slag</span>
            </label>)}
          </div>)}
        </fieldset>
      </div>
      <aside className="tdg-oppsummering" aria-label="Oppsummering">
        <span className="meta">{dato ? new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${dato}T00:00:00Z`)) : "Dato ikke valgt"}{sted.trim() ? ` · ${sted.trim()}` : ""}</span>
        <b className="num tdg-klokke">{klokke || "—"}</b>
        <span>{g ? `${g.antall} spillere` : "—"} · {valgt.size} {valgt.size === 1 ? "test" : "tester"} · {valgt.size} {valgt.size === 1 ? "stasjon" : "stasjoner"}</span>
        <span className="tdg-forklar">Hver test blir én stasjon med alle spillerne i gruppa. Du fører resultatene stasjon for stasjon.</span>
        {feil && <p className="feiltekst" role="alert">{feil}</p>}
        <button type="button" className="knapp pri stor" disabled={!klar || venter} onClick={send}>{venter ? "Legger inn …" : "Legg inn testdagen"}</button>
      </aside>
    </div>}
  </div>;
}

const STATUS: Record<string, string> = { PENDING: "Venter", DONE: "Lagret", SKIPPED: "Hoppet over", ABSENT: "Ikke møtt" };

type TilKontroll = TesterOversiktSide["tilKontroll"][number];

export function AG15TestdagVis({ d, valgt = null, tilKontroll = [] }: {
  d: TestdagVisning;
  /** Spilleren som registreres nå (`?deltaker=`), vist til høyre på PC og øverst på mobil. */
  valgt?: RegistreringData | null;
  /** Egenførte resultater i gruppa som venter på kontroll. */
  tilKontroll?: readonly TilKontroll[];
}) {
  const ferdig = d.stasjoner.reduce((a, s) => a + s.deltakere.filter((x) => x.status === "DONE").length, 0);
  const alle = d.stasjoner.reduce((a, s) => a + s.deltakere.length, 0);
  const her = `/admin/tester/testdag/${d.id}`;
  return <div className="agn-s tdg agn-a5-under">
    <Topp tilbake={{ href: "/admin/tester", tekst: "Tester" }} bilde={TEST_BILDE}
      dato={`${d.gruppe} · ${d.dato} · ${d.klokke}${d.sted ? ` · ${d.sted}` : ""}`} tittel={d.tittel}
      ingress={`${ferdig} av ${alle} registreringer lagret`} />
    <div className="a5-testdag">
      <div className="a5-testdag-liste">
        {d.stasjoner.length === 0 ? <section className="seksjon" aria-label="Deltakere"><p className="tdg-dempet">Testdagen har ingen stasjoner.</p></section> : null}
        <div className="tdg-stasjoner">
          {d.stasjoner.map((s, i) => <section key={s.id} aria-label={s.navn} className="tdg-stasjon">
            <div className="tdg-sek-topp"><h2>{s.navn}</h2><span className="meta">Stasjon {i + 1} · {s.deltakere.length} deltakere</span></div>
            <div className="tdg-liste">
              {s.deltakere.map((x) => <Link key={x.id} href={`${her}?deltaker=${encodeURIComponent(x.id)}`} aria-current={valgt?.deltakerId === x.id ? "true" : undefined} className="tdg-linje">
                <b>{x.spiller}</b>
                <span className="num">{x.status === "DONE" ? x.resultat ?? "Lagret" : STATUS[x.status]}</span>
              </Link>)}
            </div>
          </section>)}
        </div>
      </div>
      <div className="a5-testdag-side">
        {valgt
          ? <RegistrerSkjema key={valgt.deltakerId} d={valgt} nesteHref={(id) => `${her}?deltaker=${encodeURIComponent(id)}`} ferdigHref={her} />
          : <section className="seksjon a5-velg-hint" aria-label="Registrer">
            <h2 className="undertittel">Registrer</h2>
            <p className="forklar">Velg en spiller i lista for å føre testen. Bare teknikk- og PEI-tester føres av trener; resten fører spilleren selv.</p>
          </section>}
        <section id="til-kontroll" className="seksjon a5-kontroll" aria-label="Til kontroll">
          <div className="tdg-sek-topp"><h2>Til kontroll <span className="num">{tilKontroll.length}</span></h2></div>
          {tilKontroll.length === 0
            ? <p className="tdg-dempet">Ingen egenførte tester i gruppa venter på deg.</p>
            : <div className="tst-liste">
              {tilKontroll.slice(0, 8).map((k) => <div key={k.id} className="tst-linje">
                <Link href={`/admin/spillere/${k.spillerId}?fane=test`}><b>{k.spillerNavn} · {k.test}</b><span className="num">Egenført {k.dato} · {k.resultat}</span></Link>
                <Kontroller id={k.id} />
              </div>)}
            </div>}
          {tilKontroll.length > 8 && <Link href={`/admin/tester?gruppe=${encodeURIComponent(d.gruppeId)}#til-kontroll`} className="lenke">Se alle {tilKontroll.length} i Tester</Link>}
        </section>
      </div>
    </div>
  </div>;
}
