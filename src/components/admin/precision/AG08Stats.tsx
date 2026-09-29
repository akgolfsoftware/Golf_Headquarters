"use client";

/**
 * Stats-fanen i Spiller 360: tegningens fire deler (AG-360.jsx › StatsTab)
 * Snittscore · Strokes Gained · Trening · Tester, fylt med innholdet fra
 * AG-A02 Spilleranalyse samlet, AG-A04 Plan mot faktisk og AG-RD-01
 * Rundeanalyse for én spiller. Erstatter /admin/spillere/[id]/analyse.
 *
 * Kun brutto score. Nok data: under 4 runder ingen konklusjon, 4–7 «foreløpig».
 * Neste nivå er Broadie-stigen per HCP og merkes ESTIMAT. Sammenligning med
 * stallen er bare coach (hele /admin er coach og admin).
 */
import { useEffect, useState } from "react";
import { AkseMerke, AKSE_NAVN, Meta, StatusPille } from "@/components/precision/pa";
import { Dempet, Etikett, Liste, Rad, Seksjon, Stolpe, TallFlis, Valg, Verdi } from "@/components/precision/pa-spiller360";
import { hentTreningsHistorikkFiltrert } from "@/app/portal/analysere/actions";
import { PERIODE_LABEL, PERIODE_VALG, type PeriodeValg } from "@/lib/portal-analyse/periode-vindu";
import { MILJO_GRUPPER, MILJO_GRUPPE_LABEL, type MiljoGruppe } from "@/lib/taxonomy";
import type { HistorikkOppsummering, TreningsKilde, TreningsRad } from "@/lib/portal-analyse/trenings-historikk";
import { DATAGRUNNLAG_TEKST, desimal, kortDato, sg, akseFra, type AkseKode } from "@/lib/admin-spiller/spiller360-visning";
import type { S360Stats } from "@/lib/admin-spiller/spiller360-typer";

const DELER = [["snitt", "Snittscore"], ["sg", "Strokes Gained"], ["tren", "Trening"], ["test", "Tester"]] as const;
type Del = (typeof DELER)[number][0];

function Snittscore({ d }: { d: S360Stats }) {
  const s = d.snitt;
  const foreløpig = s.grunnlag === "forelopig" ? " · FORELØPIG" : "";
  return (
    <div className="a8-to">
      <div className="a8-stabel">
        <Seksjon k="Snittscore" meta={s.kilde}>
          <Liste>
            <Rad><Etikett a="Snitt siste 10 runder" sub={`${s.kategori ? `KATEGORI ${s.kategori} · ${s.kategoriNavn}`.toUpperCase() : "KATEGORI —"} · 10 RUNDER FØR ${desimal(s.forrige10)}${foreløpig}`} /><Verdi>{s.grunnlag === "ingen" ? "—" : desimal(s.siste10)}</Verdi></Rad>
            <Rad><Etikett a={s.neste ? `Til Kategori ${s.neste.kategori}` : "Til neste kategori"} sub={s.neste ? `UNDER ${desimal(s.neste.grense)}` : "—"} /><Verdi>{s.neste ? `${desimal(s.neste.slag)} slag` : "—"}</Verdi></Rad>
          </Liste>
          <Meta>{`${DATAGRUNNLAG_TEKST[s.grunnlag].toUpperCase()} · BRUTTO · NI HULL TELLER IKKE`}</Meta>
        </Seksjon>
        <Seksjon k="Tiger 5" meta="SISTE RUNDE">
          {!d.tigerFive.length ? <Dempet>Ingen runder med hullkort.</Dempet> : (
            <Liste>{d.tigerFive.map((t) => <Rad key={t.navn}><Etikett a={t.navn} /><StatusPille tone={t.status === "god" ? "ok" : t.status === "noytral" ? "neutral" : "warn"}>{t.verdi}</StatusPille></Rad>)}</Liste>
          )}
        </Seksjon>
        <Seksjon k="Utvikling per sesong" meta="SNITT TIL PAR · BARE COACH">
          {!d.vekstrate.harSvar ? <Dempet>{d.vekstrate.grunnlag}</Dempet> : (
            <Liste>
              <Rad><Etikett a="Egen utvikling" sub={`${d.vekstrate.fraAar ?? "—"}–${d.vekstrate.tilAar ?? "—"} · SLAG PER SESONG`} /><Verdi>{sg(d.vekstrate.egenRate)}</Verdi></Rad>
              <Rad><Etikett a="Årskullet" sub={d.vekstrate.harKohort ? "SAMME FØDSELSÅR" : "INGEN KOHORTDATA"} /><Verdi>{sg(d.vekstrate.kohortRate)}</Verdi></Rad>
            </Liste>
          )}
        </Seksjon>
      </div>
      <div className="a8-stabel">
        <Seksjon k={`Runder · ${d.runder.length}`} meta="BRUTTO · RUNDEANALYSE">
          {!d.runder.length ? <Dempet>Ingen runder registrert ennå.</Dempet> : (
            <Liste>{d.runder.map((r) => (
              <Rad key={r.id} variant="3">
                <Etikett a={r.bane} sub={`${r.dato} · ${r.type} · ${r.grunnlag}${r.hull ? ` · ${r.hull} HULL` : ""}`.toUpperCase()} />
                <Verdi>{r.brutto} ({r.tilPar})</Verdi>
                <Meta style={{ minWidth: 72, textAlign: "right" }}>SG {sg(r.sg)}</Meta>
              </Rad>
            ))}</Liste>
          )}
          <Meta>SG «—» = IKKE NOK DATA. SCOREKORTNIVÅ GIR ALDRI BEREGNET SG.</Meta>
        </Seksjon>
        <Seksjon k="Turneringshistorikk" meta={d.turneringer.kilder.length ? d.turneringer.kilder.join(" · ") : "—"}>
          {!d.turneringer.antall ? <Dempet>{d.turneringer.tomGrunn || "Ingen turneringer."}</Dempet> : <>
            <Liste>
              <Rad><Etikett a="Turneringer" /><Verdi>{d.turneringer.antall}</Verdi></Rad>
              <Rad><Etikett a="Beste plassering" /><Verdi>{d.turneringer.bestePlassering != null ? `${d.turneringer.bestePlassering}.` : "—"}</Verdi></Rad>
            </Liste>
            {d.turneringer.aar.slice(0, 2).map((a) => (
              <div key={a.aar} className="a8-stabel" style={{ gap: 4 }}>
                <Meta>{a.aar}</Meta>
                <Liste>{a.rader.slice(0, 8).map((t, i) => <Rad key={i}><Etikett a={t.navn} sub={t.dato} /><Verdi>{t.plassering != null ? `${t.plassering}.` : "—"}{t.motPar != null ? ` · ${t.motPar > 0 ? "+" : t.motPar < 0 ? "−" : "±"}${Math.abs(t.motPar)}` : ""}</Verdi></Rad>)}</Liste>
              </div>
            ))}
          </>}
        </Seksjon>
      </div>
    </div>
  );
}

function StrokesGained({ d }: { d: S360Stats }) {
  const g = d.sg;
  const ingen = g.datagrunnlag === "ingen";
  return (
    <div className="a8-to">
      <div className="a8-stabel">
        <Seksjon k="Strokes Gained · PGA Tour alltid på" meta={`${g.baseline} · ${g.grunnlag ?? "—"}`.toUpperCase()}>
          <div className="a8-tall-rutenett">
            <TallFlis k="SG totalt" v={ingen ? "—" : g.verdi ?? "—"} kilde={`${g.runder} RUNDER · ${g.kilde ?? "—"}`} />
            <TallFlis k="Trend" v={ingen ? "—" : g.trend ?? "—"} kilde={DATAGRUNNLAG_TEKST[g.datagrunnlag].toUpperCase()} />
          </div>
          <Liste>{g.omrader.map((o) => (
            <Rad key={o.kode} variant="3">
              <Etikett a={o.navn} sub={o.motNeste != null ? `MOT NESTE NIVÅ (HCP ${o.nesteNivaa ?? "—"}) ${sg(-o.motNeste)} · ESTIMAT` : "MOT NESTE NIVÅ — · ESTIMAT"} />
              <Verdi>{ingen ? "—" : sg(o.sg)}</Verdi>
              <Meta style={{ minWidth: 96, textAlign: "right" }}>STALLEN {sg(o.stallen)}</Meta>
            </Rad>
          ))}</Liste>
          <Meta>{`STALLEN = SNITT AV EGNE SPILLERE · BARE COACH SER DETTE · ${g.stallKilde}`}</Meta>
        </Seksjon>
        <Seksjon k="Mot seg selv" meta={g.motSegSelv.verst ? `STØRST TILBAKEGANG · ${g.motSegSelv.verst}`.toUpperCase() : "INGEN TILBAKEGANG"}>
          {!g.motSegSelv.harSvar ? <Dempet>{g.motSegSelv.grunnlag}</Dempet> : <>
            <Liste>{g.motSegSelv.akser.map((a) => <Rad key={a.navn} variant="3"><Etikett a={a.navn} sub={`NÅ ${sg(a.nylig, 2)} · FØR ${sg(a.tidligere, 2)}`} /><Verdi>{sg(a.endring, 2)}</Verdi><span /></Rad>)}</Liste>
            <Meta>{g.motSegSelv.grunnlag.toUpperCase()}</Meta>
          </>}
        </Seksjon>
      </div>
      <div className="a8-stabel">
        <Seksjon k="Neste fokus" meta={g.nesteFokus?.grunnlag.toUpperCase() ?? "—"}>
          {!g.nesteFokus ? <Dempet>For lite data til å peke ut et område.</Dempet> : <>
            <Etikett a={g.nesteFokus.omrade} sub={`SG-TAP ${g.nesteFokus.sgTap}`} />
            <Liste>{g.nesteFokus.lekkasje.map((b) => <Rad key={b.label}><Etikett a={b.label} /><Verdi>{sg(b.sg, 2)}</Verdi></Rad>)}</Liste>
          </>}
        </Seksjon>
        <Seksjon k="SG per område siste 8 uker" meta="SISTE RUNDE · ENDRING MOT FORRIGE">
          {!g.uker.length ? <Dempet>Ingen runder med SG siste åtte uker.</Dempet> : (
            <Liste>{g.uker.map((u) => <Rad key={u.kode} variant="3"><Etikett a={u.navn} sub={`${u.antall} RUNDER`} /><Verdi>{sg(u.siste, 2)}</Verdi><Meta style={{ minWidth: 72, textAlign: "right" }}>{u.trend == null ? "—" : sg(u.trend, 2)}</Meta></Rad>)}</Liste>
          )}
        </Seksjon>
        <Seksjon k="Putting per avstand" meta={d.putting.baseline.toUpperCase()}>
          {!d.putting.band.length ? <Dempet>Ingen puttdata.</Dempet> : (
            <Liste>{d.putting.band.map((b) => <Stolpe key={b.band} merke={<Meta>{b.band}</Meta>} andel={b.pct / 100} verdi={`${Math.round(b.pct)} %`} />)}</Liste>
          )}
        </Seksjon>
        {d.progresjon && (
          <Seksjon k={`Nivå · ${d.progresjon.nivaa}`} meta={d.progresjon.nesteNivaa ? `NESTE ${d.progresjon.nesteNivaa}`.toUpperCase() : "—"}>
            <Liste>{d.progresjon.krav.map((k) => <Rad key={k.navn}><Etikett a={k.navn} sub={k.mal ? `MÅL ${k.mal}`.toUpperCase() : undefined} /><StatusPille tone={k.bestatt ? "ok" : "neutral"}>{k.verdi ?? (k.bestatt ? "Nådd" : "—")}</StatusPille></Rad>)}</Liste>
          </Seksjon>
        )}
      </div>
    </div>
  );
}

type Historikk = { rader: TreningsRad[]; oppsummering: HistorikkOppsummering; vinduLabel: string; ingenAktivPeriode: boolean };

function Treningsfilter({ spillerId }: { spillerId: string }) {
  const [periode, setPeriode] = useState<PeriodeValg>("maned");
  const [kilde, setKilde] = useState<TreningsKilde | "ALLE">("ALLE");
  const [akser, setAkser] = useState<string[]>([]);
  const [miljo, setMiljo] = useState<MiljoGruppe[]>([]);
  const [hist, setHist] = useState<Historikk | null>(null);
  const [status, setStatus] = useState<"laster" | "klar" | "feil">("laster");

  useEffect(() => {
    let aktiv = true;
    hentTreningsHistorikkFiltrert({
      userId: spillerId,
      periode,
      filtre: { kilde, pyramide: akser.length ? akser : undefined, miljoGrupper: miljo.length ? miljo : undefined },
    })
      .then((r) => { if (!aktiv) return; setHist(r && "oppsummering" in r ? (r as Historikk) : null); setStatus("klar"); })
      .catch(() => { if (aktiv) setStatus("feil"); });
    return () => { aktiv = false; };
  }, [spillerId, periode, kilde, akser, miljo]);

  const veksle = <T,>(liste: T[], v: T) => (liste.includes(v) ? liste.filter((x) => x !== v) : [...liste, v]);
  const o = hist?.oppsummering;
  const maks = Math.max(1, ...(o?.perPyramide.map((p) => p.minutter) ?? [1]));
  return (
    <Seksjon k="Treningshistorikk" meta={hist?.vinduLabel ? `${hist.vinduLabel}`.toUpperCase() : "—"} gap={12}>
      <div className="a8-faner" role="group" aria-label="Periode">{PERIODE_VALG.map((p) => <Valg key={p} valgt={periode === p} onClick={() => setPeriode(p)}>{PERIODE_LABEL[p]}</Valg>)}</div>
      <div className="a8-faner" role="group" aria-label="Kilde">{([["ALLE", "Alt"], ["GOLF", "Golf"], ["FYS", "Fysisk"]] as const).map(([k, l]) => <Valg key={k} valgt={kilde === k} onClick={() => setKilde(k)}>{l}</Valg>)}</div>
      <div className="a8-faner" role="group" aria-label="Akse">{(["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const).map((a) => <Valg key={a} valgt={akser.includes(a)} onClick={() => setAkser((l) => veksle(l, a))}>{a}</Valg>)}</div>
      <div className="a8-faner" role="group" aria-label="Miljø">{MILJO_GRUPPER.map((m) => <Valg key={m} valgt={miljo.includes(m)} onClick={() => setMiljo((l) => veksle(l, m))}>{MILJO_GRUPPE_LABEL[m]}</Valg>)}</div>
      {hist?.ingenAktivPeriode && <Meta>INGEN AKTIV PERIODE I ÅRSPLANEN · VISER MÅNED</Meta>}
      {status === "feil" ? <Dempet>Treningshistorikken kunne ikke hentes. Prøv igjen.</Dempet>
        : status === "laster" && !hist ? <Dempet>Henter trening …</Dempet>
        : !o || o.antallRader === 0 ? <Dempet>Ingen gjennomført trening med dette filteret.</Dempet>
        : <>
          <div className="a8-tall-rutenett">
            <TallFlis k="Treningsvolum" v={desimal(o.totaltMinutter / 60)} enhet="t" kilde={`${o.antallOkter} ØKTER · ${o.antallRader} ØVELSER`} />
            <TallFlis k="Målt tid" v={Math.round(o.andelMaalt * 100)} enhet="%" kilde="LIVE-TIMER" />
          </div>
          <Liste>{o.perPyramide.map((p) => {
            const a = akseFra(p.akse);
            return <Stolpe key={p.akse} merke={a ? <AkseMerke axis={a} size="sm" /> : <Meta>{p.akse}</Meta>} andel={p.minutter / maks} verdi={`${p.minutter} min`} />;
          })}</Liste>
          {o.perMiljoGruppe.length > 0 && <Liste>{o.perMiljoGruppe.map((m) => <Rad key={m.gruppe}><Etikett a={MILJO_GRUPPE_LABEL[m.gruppe]} /><Verdi>{m.minutter} min</Verdi></Rad>)}</Liste>}
          <Meta>SISTE ØVELSER</Meta>
          <Liste>{hist!.rader.slice(0, 10).map((r) => <Rad key={r.id} variant="3"><Etikett a={r.navn} sub={`${kortDato(new Date(r.dato))} · ${r.oktTittel}`.toUpperCase()} /><Meta>{r.pyramide}</Meta><Verdi>{r.minutter} min</Verdi></Rad>)}</Liste>
        </>}
    </Seksjon>
  );
}

function Trening({ d, spillerId }: { d: S360Stats; spillerId: string }) {
  const t = d.trening;
  const maks = Math.max(1, ...t.planMotFaktisk.flatMap((r) => [r.plan, r.faktisk]));
  const avvik = (r: { plan: number; faktisk: number }) => { const v = r.faktisk - r.plan; return `${v > 0 ? "+" : v < 0 ? "−" : "±"}${Math.abs(v)} min`; };
  return (
    <div className="a8-to">
      <div className="a8-stabel">
        <Seksjon k="Plan mot faktisk" meta={t.planKilde}>
          {!t.planMotFaktisk.length ? <Dempet>Ingen plan denne uka.</Dempet> : <>
            <Liste>{t.planMotFaktisk.map((r) => <Stolpe key={r.akse} merke={<AkseMerke axis={r.akse as AkseKode} size="sm" />} andel={r.faktisk / maks} plan={r.plan / maks} verdi={`${r.faktisk} / ${r.plan}`} />)}</Liste>
            <Liste>{t.planMotFaktisk.map((r) => <Rad key={r.akse}><Etikett a={AKSE_NAVN[r.akse as AkseKode]} sub={`PLAN ${r.plan} MIN · FAKTISK ${r.faktisk} MIN`} /><Verdi>{avvik(r)}</Verdi></Rad>)}</Liste>
            <Meta>STREKEN ER PLANEN · MINUTTER</Meta>
          </>}
        </Seksjon>
        <Treningsfilter spillerId={spillerId} />
      </div>
      <div className="a8-stabel">
        <Seksjon k="Gjennomføring 30 dager" meta="ØKTLOGG · DRILLER">
          {!t.analyse ? <Dempet>Ingen økter i perioden.</Dempet> : (
            <div className="a8-tall-rutenett">
              <TallFlis k="Økter" v={`${t.analyse.gjennomforteOkter}/${t.analyse.planlagteOkter}`} kilde="GJENNOMFØRT / PLANLAGT" />
              <TallFlis k="Etterlevelse" v={t.analyse.etterlevelsePct ?? "—"} enhet={t.analyse.etterlevelsePct != null ? "%" : null} kilde="ØKTER" />
              <TallFlis k="Repetisjoner" v={`${t.analyse.faktiskeReps}/${t.analyse.planlagteReps}`} kilde="FAKTISK / PLAN" />
              <TallFlis k="Baller slått" v={t.analyse.ballerSlatt} kilde={`SVINGER UTEN BALL ${t.analyse.svingerUtenBall}`} />
            </div>
          )}
        </Seksjon>
        <Seksjon k="Treningsvolum per område" meta={`TRENINGSLOGG · 8 UKER · ${t.volumTotal} MIN`}>
          {!t.volumOmrader.length ? <Dempet>Ingen treningslogg siste åtte uker.</Dempet> : (
            <Liste>{t.volumOmrader.map((v) => <Rad key={v.kode}><Etikett a={v.navn} /><Verdi>{v.minutter} min</Verdi></Rad>)}</Liste>
          )}
          {t.volumUker.length > 0 && <Meta>{t.volumUker.map((u) => `${u.uke} ${u.minutter}`).join(" · ")}</Meta>}
        </Seksjon>
        <Seksjon k="Trening mot SG-fremgang" meta="PEARSON R · 16 UKER">
          {!t.korrelasjon.length ? <Dempet>For lite data til å se en sammenheng.</Dempet> : (
            <Liste>{t.korrelasjon.map((k) => <Rad key={k.navn}><Etikett a={k.navn} sub={`${k.datapunkter} UKER · ${k.tolkning}`.toUpperCase()} /><Verdi>{k.r == null ? "—" : desimal(k.r, 2)}</Verdi></Rad>)}</Liste>
          )}
        </Seksjon>
        <Seksjon k="TrackMan" meta={d.trackman.okter[0] ? `SISTE ØKT ${d.trackman.okter[0].dato}` : "—"}>
          {!d.trackman.koller.length ? <Dempet>Ingen TrackMan-økter.</Dempet> : (
            <Liste>{d.trackman.koller.map((c) => <Rad key={c.club} variant="3"><Etikett a={c.club} sub={`${c.shots} SLAG · SMASH ${desimal(c.avgSmash, 2)}`} /><Verdi>{c.avgTotal != null ? `${Math.round(c.avgTotal)} m` : "—"}</Verdi><Meta style={{ minWidth: 88, textAlign: "right" }}>BALL {c.avgBallSpeed != null ? Math.round(c.avgBallSpeed) : "—"}</Meta></Rad>)}</Liste>
          )}
          {d.trackman.okter.length > 0 && <>
            <Meta>TRACKMAN-ØKTER</Meta>
            <Liste>{d.trackman.okter.map((o) => <Rad key={o.id}><Etikett a={o.kolle ? `TrackMan-økt · ${o.kolle}` : "TrackMan-økt"} sub={o.dato} /><Verdi>{o.slag} slag</Verdi></Rad>)}</Liste>
          </>}
          <Meta>SNITT PER KØLLE · SLAG-FOR-SLAG LAGRES IKKE AV IMPORTEN</Meta>
        </Seksjon>
      </div>
    </div>
  );
}

function Tester({ d }: { d: S360Stats }) {
  return (
    <Seksjon k="Tester · ett batteri" meta="SISTE RESULTATER">
      {!d.tester.length ? <Dempet>Ingen tester tatt.</Dempet> : (
        <Liste>{d.tester.map((t) => <Rad key={t.id}><Etikett a={t.navn} sub={t.dato} /><Verdi>{t.score}</Verdi></Rad>)}</Liste>
      )}
      <Meta>TESTDAGER, TILDELINGER OG ØVELSESFORSLAG LIGGER I FANEN TESTER</Meta>
    </Seksjon>
  );
}

export function tilStatsDel(v: string | null | undefined): Del {
  return DELER.some(([k]) => k === v) ? (v as Del) : "sg";
}

export function AG08Stats({ d, tom, spillerId, start }: { d: S360Stats; tom: boolean; spillerId: string; start?: string | null }) {
  const [del, setDel] = useState<Del>(() => tilStatsDel(start));
  if (tom) return <Seksjon k="Stats"><Dempet>Ingen runder registrert ennå.</Dempet></Seksjon>;
  return <>
    <div role="group" aria-label="Stats-del" className="a8-faner">
      {DELER.map(([k, l]) => <Valg key={k} valgt={del === k} onClick={() => setDel(k)}>{l}</Valg>)}
    </div>
    <Meta>SAMME STATS SOM SPILLEREN · PGA TOUR ALLTID PÅ FOR COACH · BRUTTO SCORE</Meta>
    {del === "snitt" && <Snittscore d={d} />}
    {del === "sg" && <StrokesGained d={d} />}
    {del === "tren" && <Trening d={d} spillerId={spillerId} />}
    {del === "test" && <Tester d={d} />}
  </>;
}
