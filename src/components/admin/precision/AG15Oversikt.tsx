"use client";

/**
 * AG-15 Tester: toppen av siden i designløftet 20.10.2026. Fasit: canvaset «AgencyOS
 * nøkkelskjermer» (https://claude.ai/artifact/SLdHBGbdK1hiJcep9e42Cy), tavlene Tester og
 * Tester-mobil (godkjent 20.10).
 *
 * Gruppevalg, fire nøkkeltall (testdekning, prioriterte oppfylt, til kontroll, neste
 * testdag), spillerne mot de 19 testene i batteriet, «Til kontroll» med «Merk kontrollert»,
 * og spillerne som mangler flest tester. Rust brukes ikke: ingenting her haster.
 *
 * Skrå-drakten 22.10 (bølge 2, pakke A5, skissen §4): topp med wedgebildet og fire tall (Tester denne
 * måneden, Til kontroll, Neste testdag, Tildelt), hovedkortet med neste testdag og «Start testdag»,
 * batteriet i tre deler i fast rekkefølge (Golfslag · Teknikk · Fysisk) og resten i hvite kort.
 * Testdekning og prioriterte oppfylt står nå i gruppekortet, ikke som egne tall i toppen.
 */
import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nedtrekk } from "@/components/precision/Nedtrekk";
import { SkraFlyt, SkraHelt, SkraKort, SkraStat, SkraTom, SkraTopp } from "@/components/precision/skra/Skra";
import { BATTERI_DELER, TESTBATTERI } from "@/lib/portal-tester/testbatteri";
import { DEL_ANTALL, manglerFlest } from "@/lib/admin/tester/oversikt-bygg";
import type { TesterOversiktSide } from "@/lib/admin/tester/oversikt-data";
import { merkTestKontrollert } from "@/app/admin/tester/actions";
import "@/styles/agencyos-ny-tester.css";
import "@/styles/agencyos-ny-a5-skra.css";

const ALLE = "alle";

/** «Merk kontrollert» for ett egenført resultat. Brukes også i testdagens «Til kontroll». */
export function Kontroller({ id }: { id: string }) {
  const router = useRouter();
  const [venter, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [ferdig, setFerdig] = useState(false);
  if (ferdig) return <span className="tst-ok">Kontrollert</span>;
  return <span className="tst-kontroll-knapp">
    <button type="button" className="knapp sek" disabled={venter} onClick={() => start(async () => {
      setFeil(null);
      const r = await merkTestKontrollert({ resultatId: id });
      if (!r.ok) { setFeil(r.error ?? "Testen ble ikke merket."); return; }
      setFerdig(true);
      router.refresh();
    })}>{venter ? "Merker …" : "Merk kontrollert"}</button>
    {feil && <span className="feiltekst" role="alert">{feil}</span>}
  </span>;
}

export function AG15Oversikt({ d, handling, maanedAntall = null, tildeltAntall = null, etter }: {
  d: TesterOversiktSide;
  handling?: ReactNode;
  /** Det som står under oversikten i samme flyt (resultatene og fanene i AG15Tester). */
  etter?: ReactNode;
  /** Tester registrert denne måneden (Oslo-tid). «null» vises som «—». */
  maanedAntall?: number | null;
  /** Tildelte tester som ikke er tatt. */
  tildeltAntall?: number | null;
}) {
  const router = useRouter();
  const [visAlle, setVisAlle] = useState(false);
  const gruppe = d.grupper.find((g) => g.id === d.gruppeId) ?? null;
  const t = d.tall;
  const mangler = manglerFlest(d.rader);
  const gruppeValg = [{ verdi: ALLE, navn: "Hele stallen" }, ...d.grupper.map((g) => ({ verdi: g.id, navn: g.navn, antall: String(g.antall) }))];
  const nt = d.nesteTestdag;
  const planlegg = `/admin/tester/testdag${d.gruppeId ? `?gruppe=${encodeURIComponent(d.gruppeId)}` : ""}`;

  return <>
    <SkraTopp
      bilde="/images/playerhq/naerspill-wedge.jpg"
      bildePosisjon="50% 50%"
      overlinje={`Spillere · tester · ${gruppe?.navn ?? "hele stallen"}`}
      tittel="Tester"
      etikett="Tester"
      handling={<div className="a5-topp-knapper">
        <Link href={planlegg} className="knapp pri">Planlegg testdag</Link>
        {handling}
      </div>}
      tall={<>
        <SkraStat verdi={maanedAntall == null ? "—" : String(maanedAntall)} etikett="Tester denne måneden" />
        <SkraStat verdi={String(d.tilKontroll.length)} etikett="Til kontroll" href="#til-kontroll" ariaLabel={`${d.tilKontroll.length} til kontroll`} />
        <SkraStat verdi={nt?.dato ?? "—"} etikett="Neste testdag" />
        <SkraStat verdi={tildeltAntall == null ? "—" : String(tildeltAntall)} etikett="Tildelt" />
      </>}
    />

    <SkraFlyt className="a5-flyt">
      {nt
        ? <SkraHelt etikett="Neste testdag" overlinje={`Testdag · ${nt.ukedag} ${nt.dato}${nt.dagerTil === 0 ? " · i dag" : ` · om ${nt.dagerTil} ${nt.dagerTil === 1 ? "dag" : "dager"}`}`}
          tid={nt.klokke ?? nt.dato} tittel={nt.gruppe} meta={`${nt.deltakere} ${nt.deltakere === 1 ? "spiller" : "spillere"}${nt.sted ? ` · ${nt.sted}` : ""}`}
          handlinger={nt.eventId ? [{ tekst: "Start testdag", href: `/admin/tester/testdag/${nt.eventId}` }] : [{ tekst: "Planlegg testdag", href: planlegg }]} />
        : <SkraKort tittel="Neste testdag"><SkraTom handling={<Link href={planlegg} className="knapp pri">Planlegg testdag</Link>}>Ingen testdag er planlagt{gruppe ? ` for ${gruppe.navn}` : ""}.</SkraTom></SkraKort>}

      <SkraKort tittel="Gruppe" meta={`${d.rader.length} ${d.rader.length === 1 ? "spiller" : "spillere"}`}>
        <div className="a5-gruppevalg">
          <Nedtrekk etikett="Gruppe" valg={gruppeValg} verdi={d.gruppeId ?? ALLE} onVelg={(v) => router.push(v === ALLE ? "/admin/tester" : `/admin/tester?gruppe=${encodeURIComponent(v)}`)} />
          <span className="kilde">Testdekning {t.dekning == null ? "—" : `${t.dekning} %`} · prioriterte oppfylt {t.spillere ? `${t.prioritertOppfylt} av ${t.spillere}` : "—"} · siste seks uker</span>
        </div>
      </SkraKort>

      <SkraKort tittel="Testbatteriet" meta="19 tester i tre deler">
        <div className="a5-batteri">
          {BATTERI_DELER.map((del) => {
            const tester = TESTBATTERI.filter((b) => b.del === del);
            return <div key={del} className={`a5-del del-${del.toLowerCase()}`}>
              <h3><i aria-hidden />{del}<span className="kilde num">{tester.length}</span></h3>
              <ol>{tester.map((b) => <li key={b.id}>{b.navn}{b.minst != null ? <span className="kilde"> · minst {b.minst}</span> : null}</li>)}</ol>
            </div>;
          })}
        </div>
        <p className="kilde">Trener og coach fører bare teknikk- og PEI-tester. Resten fører spilleren selv i PlayerHQ.</p>
      </SkraKort>

      <div className="tst">
        <section aria-label="Spillere mot testene" className="tst-seksjon">
          <div className="tst-sek-topp">
            <h2>Spillere mot testene</h2>
            <div className="tst-forklaring">
              <span><i className="c-K" />Kontrollert <b className="num">{t.kontrollert}</b></span>
              <span><i className="c-E" />Egenført <b className="num">{t.egenfort}</b></span>
              <span><i className="c-G" />Eldre enn 6 uker <b className="num">{t.eldre}</b></span>
              <span><i className="c-M">—</i>Mangler <b className="num">{t.mangler}</b></span>
            </div>
          </div>
          {!d.rader.length ? <p className="tst-dempet">Ingen spillere {gruppe ? "i gruppa" : "i stallen"} ennå.</p> : <div role="table" aria-label={`Spillere mot testene, ${gruppe?.navn ?? "hele stallen"}`} className="tst-matrise">
            <div className="tst-deler" aria-hidden>
              <span />
              {DEL_ANTALL.map(([del, n]) => <span key={del} className={`del-${del.toLowerCase()}`} style={{ gridColumn: `span ${n}` }}><i />{del}</span>)}
              <span />
            </div>
            <div role="row" className="tst-hode">
              <span role="columnheader" className="meta">Spiller</span>
              {TESTBATTERI.map((b) => <span key={b.id} role="columnheader" className={b.minst != null ? "pri" : undefined}><span>{b.navn}</span>{b.minst != null && <b className="num">{b.minst}</b>}</span>)}
              <span role="columnheader" className="meta tatt">Tatt</span>
            </div>
            {d.rader.map((r) => <Link key={r.id} href={`/admin/spillere/${r.id}?fane=test`} role="row" className="tst-rad">
              <span role="rowheader"><span className="tst-navn"><b>{r.navn}</b><b className="num tst-mob-tatt">{r.tatt} / 19</b></span><span className="tst-mob-mangler">{r.underMinste.length ? `Prioritert: ${r.underMinste.join(", ")}.` : "Prioriterte oppfylt."} {r.mangler.length ? `Mangler ${r.mangler.length} tester.` : "Alle tester tatt."}</span></span>
              {r.celler.map((c, i) => <span key={TESTBATTERI[i].id} role="cell" aria-label={c.aria} className={`tst-c c-${c.status}`}>{c.tekst.replace(" av ", "/")}</span>)}
              <b role="cell" className="num tatt">{r.tatt} / 19</b>
            </Link>)}
          </div>}
          <span className="meta">Golfslag og Teknikk (Team Norway 2026) og Fysisk · tall under navnet = minstekrav · «1/2» = tatt 1 av 2 ganger · ellers dato for siste gyldige test · teller bare når alle slag er registrert</span>
        </section>

        <div className="tst-to">
          <section id="til-kontroll" aria-label="Til kontroll" className="tst-seksjon">
            <div className="tst-sek-topp"><h2>Til kontroll <span className="num">{d.tilKontroll.length}</span></h2></div>
            {!d.tilKontroll.length ? <p className="tst-dempet">Ingen egenførte tester venter på deg.</p> : <div className="tst-liste">
              {(visAlle ? d.tilKontroll : d.tilKontroll.slice(0, 6)).map((k) => <div key={k.id} className="tst-linje">
                <Link href={`/admin/spillere/${k.spillerId}?fane=test`}><b>{k.spillerNavn} · {k.test}</b><span className="num">Egenført {k.dato} · {k.resultat}</span></Link>
                <Kontroller id={k.id} />
              </div>)}
            </div>}
            {d.tilKontroll.length > 6 && <button type="button" className="lenke" onClick={() => setVisAlle(!visAlle)}>{visAlle ? "Vis færre" : `Vis alle ${d.tilKontroll.length}`}</button>}
            <span className="tst-forklar">«Merk kontrollert» betyr at du har sett testen bli tatt eller sjekket scorekortet.</span>
          </section>
          <section aria-label="Mangler test" className="tst-seksjon">
            <div className="tst-sek-topp"><h2>Mangler flest tester</h2><span className="meta">Siste 6 uker</span></div>
            {!mangler.length ? <p className="tst-dempet">Alle spillerne har tatt alle testene.</p> : <div className="tst-liste">
              {mangler.map((r) => <Link key={r.id} href={`/admin/spillere/${r.id}?fane=test`} className="tst-linje">
                <span><b>{r.navn}</b><span>{r.mangler.slice(0, 6).join(", ")}{r.mangler.length > 6 ? ` og ${r.mangler.length - 6} til` : ""}</span></span>
                <b className="num">{r.tatt} / 19</b>
              </Link>)}
            </div>}
          </section>
        </div>
      </div>
      {etter}
    </SkraFlyt>
  </>;
}
