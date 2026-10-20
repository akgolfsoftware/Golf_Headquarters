"use client";

/**
 * AG-15 Tester: toppen av siden i designløftet 20.10.2026. Fasit: canvaset «AgencyOS
 * nøkkelskjermer» (https://claude.ai/artifact/SLdHBGbdK1hiJcep9e42Cy), tavlene Tester og
 * Tester-mobil (godkjent 20.10).
 *
 * Gruppevalg, fire nøkkeltall (testdekning, prioriterte oppfylt, til kontroll, neste
 * testdag), spillerne mot de 19 testene i batteriet, «Til kontroll» med «Merk kontrollert»,
 * og spillerne som mangler flest tester. Rust brukes ikke: ingenting her haster.
 */
import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nedtrekk } from "@/components/precision/Nedtrekk";
import { TESTBATTERI } from "@/lib/portal-tester/testbatteri";
import { DEL_ANTALL, manglerFlest } from "@/lib/admin/tester/oversikt-bygg";
import type { TesterOversiktSide } from "@/lib/admin/tester/oversikt-data";
import { merkTestKontrollert } from "@/app/admin/tester/actions";
import "@/styles/agencyos-ny-tester.css";

const ALLE = "alle";

function Kontroller({ id }: { id: string }) {
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

export function AG15Oversikt({ d, handling }: { d: TesterOversiktSide; handling?: ReactNode }) {
  const router = useRouter();
  const [visAlle, setVisAlle] = useState(false);
  const gruppe = d.grupper.find((g) => g.id === d.gruppeId) ?? null;
  const t = d.tall;
  const mangler = manglerFlest(d.rader);
  const gruppeValg = [{ verdi: ALLE, navn: "Hele stallen" }, ...d.grupper.map((g) => ({ verdi: g.id, navn: g.navn, antall: String(g.antall) }))];

  return <div className="tst">
    <header className="tst-topp">
      <span className="meta">Testbatteriet · {gruppe?.navn ?? "Hele stallen"}</span>
      <h1>Tester</h1>
      <div className="tst-valg">
        <Nedtrekk etikett="Gruppe" valg={gruppeValg} verdi={d.gruppeId ?? ALLE} onVelg={(v) => router.push(v === ALLE ? "/admin/tester" : `/admin/tester?gruppe=${encodeURIComponent(v)}`)} />
        <Link href={`/admin/tester/testdag${d.gruppeId ? `?gruppe=${encodeURIComponent(d.gruppeId)}` : ""}`} className="knapp pri">Planlegg testdag</Link>
        {handling}
      </div>
    </header>

    <section aria-label="Nøkkeltall" className="tst-kpi">
      <div className="tst-k">
        <span className="e">Testdekning</span>
        <b className="t">{t.dekning == null ? "—" : <>{t.dekning}<small> %</small></>}</b>
        <span className="tst-bar" role="img" aria-label={`${t.tatt} av ${t.mulig} tester tatt siste seks uker`}><i style={{ width: `${t.dekning ?? 0}%` }} /></span>
        <span className="s">{t.tatt} av {t.mulig} siste seks uker</span>
      </div>
      <div className="tst-k">
        <span className="e">Prioriterte tester oppfylt</span>
        <b className="t">{t.spillere ? <>{t.prioritertOppfylt}<small> av {t.spillere}</small></> : "—"}</b>
        <span className="s">Alle fem prioriterte minst så mange ganger som kreves</span>
      </div>
      <a href="#til-kontroll" className="tst-k">
        <span className="e">Til kontroll</span>
        <b className="t">{d.tilKontroll.length}</b>
        <span className="s">Egenført av spilleren, venter på deg</span>
      </a>
      <div className="tst-k">
        <span className="e">Neste testdag</span>
        <b className="t">{d.nesteTestdag?.dato ?? "—"}</b>
        <span className="s">{d.nesteTestdag
          ? `${d.nesteTestdag.ukedag}${d.nesteTestdag.sted ? ` · ${d.nesteTestdag.sted}` : ""} · ${d.nesteTestdag.deltakere} spillere · ${d.nesteTestdag.dagerTil === 0 ? "i dag" : `om ${d.nesteTestdag.dagerTil} dager`}`
          : "Ingen planlagt"}</span>
      </div>
    </section>

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
  </div>;
}
