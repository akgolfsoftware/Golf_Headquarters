/**
 * Fanene Plan, Teknisk plan, IUP, Samtaler og Talent i Spiller 360 (AG-08).
 * Tegning: ui_kits/agencyos/screens/AG-360.jsx (PlanTab, TpTab, TalkTab,
 * TalentTab) og AG-08-IUP.jsx. Alt er ekte data; det som ikke finnes i basen
 * vises som «—» med en metalinje som sier hvorfor.
 */
import Link from "next/link";
import { Camera, Layers, ListChecks, Plus } from "lucide-react";
import { AkseMerke, KnappLenke, Meta, StatusPille } from "@/components/precision/pa";
import { Nokkelverdi } from "@/components/precision/pa-a4";
import { Dempet, Etikett, Liste, Rad, Seksjon, Stolpe, Talentradar, Verdi } from "@/components/precision/pa-spiller360";
import { AKSE_NAVN } from "@/components/precision/pa";
import { oktStatus } from "@/lib/admin-spiller/spiller360-visning";
import type { S360Iup, S360Plan, S360Samtaler, S360Talent, S360Tp } from "@/lib/admin-spiller/spiller360-typer";
import type { AkseKode } from "@/lib/admin-spiller/spiller360-visning";
import { TreningsvolumVisning } from "./TreningsvolumVisning";

/* ───────────────────────────── Plan ───────────────────────────── */

const UKEDAGER = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"] as const;
const AKSE_REKKE: AkseKode[] = ["fys", "tek", "slag", "spill", "turn"];
const timer = (min: number) => {
  const t = Math.floor(min / 60), m = Math.round(min % 60);
  return t && m ? `${t} t ${m}` : t ? `${t} t` : `${m} min`;
};
const GJORT = new Set(["COMPLETED"]);
const HOPPET = new Set(["SKIPPED", "CANCELLED"]);

export function AG08Plan({ d, tom, spillerId }: { d: S360Plan; tom: boolean; spillerId: string }) {
  const uke = tom ? [] : d.uke;
  const dager = UKEDAGER.map((dag) => ({ dag, okter: uke.filter((o) => o.dag.slice(0, 3).toLocaleLowerCase("nb-NO") === dag.toLocaleLowerCase("nb-NO")) }));
  const plan = uke.filter((o) => !HOPPET.has(o.status)).reduce((a, o) => a + o.minutter, 0);
  const gjort = uke.filter((o) => GJORT.has(o.status)).reduce((a, o) => a + o.minutter, 0);
  const perAkse = AKSE_REKKE.map((a) => ({
    a,
    plan: uke.filter((o) => o.akse === a && !HOPPET.has(o.status)).reduce((x, o) => x + o.minutter, 0),
    gjort: uke.filter((o) => o.akse === a && GJORT.has(o.status)).reduce((x, o) => x + o.minutter, 0),
  })).filter((x) => x.plan > 0 || x.gjort > 0);
  const maks = Math.max(1, ...perAkse.map((x) => Math.max(x.plan, x.gjort)));
  const turneringer = tom ? [] : [...d.kommende.map((t) => ({ ...t, status: "Meldt på", res: null as string | null })), ...d.resultater.map((t) => ({ navn: t.navn, dato: t.dato, status: "Spilt", res: [t.score != null ? String(t.score) : null, t.plassering != null ? `${t.plassering}. plass` : null].filter(Boolean).join(" · ") || null }))];
  return (
    <div className="s3-plan">
      <div className="s3-hoved">
        <section aria-label={d.ukeLabel} className="s3-seksjon">
          <div className="s3-sek-topp"><h2>{d.ukeLabel}</h2><span className="num">{uke.length ? `${timer(gjort)} av ${timer(plan)} gjennomført` : "—"}</span></div>
          {!uke.length ? <p className="s3-dempet">Ingen plan denne uka. <Link href={`/admin/workbench/${spillerId}`}>Legg inn i Workbench</Link></p> : (
            <div className="s3-uke" role="list" aria-label={`${d.ukeLabel}: ${uke.map((o) => `${o.dag} ${o.akse ? AKSE_NAVN[o.akse] : ""} ${o.tittel} ${o.minutter} min, ${oktStatus(o.status)[0]}`).join("; ")}`}>
              {dager.map((x) => <div key={x.dag} role="listitem" className="s3-dag">
                <span className="num">{x.dag}</span>
                {x.okter.length ? x.okter.map((o) => <span key={o.id} className={`s3-okt${o.akse ? ` a-${o.akse}` : " a-noy"}${GJORT.has(o.status) ? " gjort" : ""}${HOPPET.has(o.status) ? " hoppet" : ""}`} title={o.tittel}>
                  <b>{o.akse ? AKSE_NAVN[o.akse] : "—"}</b><span>{o.minutter} min</span>
                </span>) : <span className="s3-okt tom">—</span>}
              </div>)}
            </div>
          )}
          {uke.length > 0 && <span className="s3-forklar">Fylt = planlagt · lys = gjennomført · stiplet = hoppet over eller avlyst.</span>}
          <div><Link className="s3-lenke" href={`/admin/workbench/${spillerId}`}>Åpne hele planen i Workbench →</Link></div>
        </section>

        {perAkse.length > 0 && <section aria-label="Uka per akse" className="s3-seksjon">
          <div className="s3-sek-topp"><h2>Uka per akse</h2><span className="meta">Timer · denne uka</span></div>
          {perAkse.map((x) => <div key={x.a} className="s3-akse" role="img" aria-label={`${AKSE_NAVN[x.a]}: ${timer(x.gjort)} gjennomført av ${timer(x.plan)} planlagt`}>
            <b>{AKSE_NAVN[x.a]}</b>
            <span className="s3-akse-spor"><i className={`a-${x.a}`} style={{ width: `${(x.gjort / maks) * 100}%` }} /><em style={{ left: `calc(${(x.plan / maks) * 100}% - 1px)` }} /></span>
            <span className="num">{timer(x.gjort)} / {timer(x.plan)}</span>
          </div>)}
          <span className="s3-forklar">Fylt = gjennomført · strek = planlagt.</span>
        </section>}

        {(d.naa || (!tom && d.iDag.length > 0)) && <section aria-label="I dag" className="s3-seksjon">
          <div className="s3-sek-topp"><h2>I dag</h2>{d.naa && <span className="meta">Nå · {d.naa.tidspunkt}</span>}</div>
          {d.naa && <p className="s3-dempet">{d.naa.tittel}{d.naa.sted ? ` · ${d.naa.sted}` : ""}</p>}
          <div className="s3-rader">{d.iDag.map((o) => <div key={o.id} className="s3-rad"><b className="num">{o.klokke}</b><span><b>{o.tittel}</b><span>{[o.omrade, o.sted].filter(Boolean).join(" · ")}</span></span><span /></div>)}</div>
        </section>}

        <section aria-label="Turneringer" className="s3-seksjon">
          <div className="s3-sek-topp"><h2>Turneringer</h2><span className="meta">Påmelding bekreftes ikke her</span></div>
          {!turneringer.length ? <p className="s3-dempet">Ingen turneringer.</p> : <div className="s3-rader">
            {turneringer.map((t, i) => <div key={i} className="s3-rad"><b className="num">{t.dato.slice(0, 5)}</b><span><b>{t.navn}</b><span>{t.res ?? t.dato}</span></span><span className="s3-status">{t.status}</span></div>)}
          </div>}
        </section>
      </div>

      <aside className="s3-side">
        <section aria-label="Treningsplan og sesong" className="s3-boks">
          <b>Treningsplan og sesong</b>
          <Nokkelverdi items={[
            ["Aktiv plan", d.aktivPlan?.navn ?? null],
            ["Periode", d.aktivPlan?.periode ?? null, { mono: true }],
            ["Økter gjennomført", d.aktivPlan?.okter ?? null, { mono: true }],
            ["Venter på deg", d.aktivPlan?.venter ?? null],
            ["Sesong", d.sesong?.navn ?? null],
            ["Nå", d.sesong?.naa ? d.sesong.naa.navn : null, { hint: d.sesong?.naa ? `TIL ${d.sesong.naa.til}` : undefined }],
            ["Neste", d.sesong?.neste ? d.sesong.neste.navn : null, { hint: d.sesong?.neste ? `FRA ${d.sesong.neste.fra}` : undefined }],
          ]} />
        </section>
        <section aria-label="Hvilken standardplan virker" className="s3-seksjon">
          <b className="s3-b">Hvilken standardplan virker</b>
          <p className="s3-dempet">—</p>
          <span className="meta">Standardplanene er ikke skrevet inn i appen ennå</span>
        </section>
        <section aria-label="Permisjoner og fravær" className="s3-seksjon">
          <b className="s3-b">Permisjoner og fravær</b>
          {!d.permisjoner.length ? <p className="s3-dempet">Ingen permisjoner registrert.</p> : <div className="s3-rader">
            {d.permisjoner.map((p) => <div key={p.id} className="s3-rad"><b className="num">{p.fra.slice(0, 5)}</b><span><b>{p.aarsak}</b><span>{p.fra} – {p.til} · {p.beskrivelse}</span></span><span className="s3-status">{p.status}</span></div>)}
          </div>}
          <span className="meta">Helsedetaljer bare med samtykke</span>
        </section>
      </aside>
    </div>
  );
}

/* ─────────────────────────── Teknisk plan ─────────────────────────── */

export function AG08Tp({ d, tom, spillerId }: { d: S360Tp; tom: boolean; spillerId: string }) {
  const p = tom ? null : d.aktiv;
  const base = d.aktivId ? `/admin/spillere/${spillerId}/plan/${d.aktivId}` : null;
  return (
    <div className="a8-to">
      <Seksjon k="Teknisk plan" meta={p ? `${p.navn} · ${p.status}`.toUpperCase() : "P1.0–P10.0"}>
        {!p || !p.oppgaver.length ? <Dempet>Ingen teknisk plan ennå.</Dempet> : (
          <Liste>{p.oppgaver.map((o) => <Rad key={o.id}><Etikett a={`${o.pNummer} · ${o.tittel}`} sub={[o.omraade, o.fokus].filter((x) => x && x !== "—").join(" · ").toUpperCase()} /><StatusPille>{o.status}</StatusPille></Rad>)}</Liste>
        )}
        {p && <Meta>{`${p.gjort} AV ${p.maal ?? "—"} REPETISJONER · ${p.kilde}`}</Meta>}
        <div className="a8-knapper">
          {base ? <>
            <KnappLenke size="sm" variant="secondary" icon={ListChecks} iconName="list-checks" href={base}>Åpne teknisk plan</KnappLenke>
            <KnappLenke size="sm" variant="ghost" icon={Plus} iconName="plus" href={`${base}?oppgave=ny`}>Ny oppgave</KnappLenke>
            <KnappLenke size="sm" variant="ghost" icon={Camera} iconName="camera" href={`${base}/for-og-na`}>Før og nå</KnappLenke>
          </> : <KnappLenke size="sm" variant="secondary" icon={Layers} iconName="layers" href={`/admin/workbench/${spillerId}`}>Planlegg i Workbench</KnappLenke>}
        </div>
      </Seksjon>
      <div className="a8-stabel">
        <Seksjon k="Siste registreringer" meta={p?.sistRegistrert ? `SIST ${p.sistRegistrert}` : "—"}>
          {!p || !p.logg.length ? <Dempet>Ingen registreringer ennå.</Dempet> : (
            <Liste>{p.logg.map((l) => <Rad key={l.id}><Etikett a={`${l.pNummer} · ${l.oppgave}`} sub={`${l.dato} · ${l.kilde}`.toUpperCase()} /><Verdi>{l.reps} reps</Verdi></Rad>)}</Liste>
          )}
        </Seksjon>
        <Seksjon k="Alle planer" meta={`${d.planer.length} ${d.planer.length === 1 ? "PLAN" : "PLANER"}`}>
          {tom || !d.planer.length ? <Dempet>Ingen planer.</Dempet> : (
            <div role="list" className="a8-liste">
              {d.planer.map((pl) => (
                <Link key={pl.id} role="listitem" href={`/admin/spillere/${spillerId}/plan/${pl.id}`} className="a8-krav">
                  <Etikett a={pl.navn} sub={`${pl.status} · ${pl.periode} · OPPDATERT ${pl.oppdatert}`.toUpperCase()} />
                </Link>
              ))}
            </div>
          )}
        </Seksjon>
      </div>
    </div>
  );
}

/* ───────────────────────────── IUP ───────────────────────────── */

const IUP_REKKEFOLGE = ["Personinfo", "Evaluering", "Målsetting og oppfølging", "Prosessmål", "Årsplan", "Turneringsplan", "Ukeplan", "Treningsøkter", "Utviklingssjekk", "Tester", "Teknikkplan", "Fystester"] as const;

export function AG08Iup({ d, tom }: { d: S360Iup; tom: boolean }) {
  const T = (n: number) => IUP_REKKEFOLGE[n]!;
  const E = <Dempet>—</Dempet>;
  const maks = Math.max(1, ...(d.trening?.timer.map((t) => t.timer) ?? [1]));
  const totalt = d.trening?.timer.reduce((a, t) => a + t.timer, 0) ?? 0;
  const maalRader = (rader: S360Iup["resultatmaal"]) => !rader.length ? E : (
    <Liste>{rader.map((m) => <Rad key={m.id}><Etikett a={m.tittel} sub={m.frist ? `FRIST ${m.frist}` : "UTEN FRIST"} /><Verdi>{m.pct != null ? `${m.pct} %` : "—"}</Verdi></Rad>)}</Liste>
  );
  const seksjoner = [
    <Seksjon key={0} nr={1} k={T(0)} meta="FRA PLAYERHQ · MEG">
      <Nokkelverdi items={[
        ["Navn", d.person.navn], ["Født", d.person.fodt, { mono: true }], ["Klubb", d.person.klubb], ["Skole", d.person.skole],
        ["Hovedcoach", d.person.hovedcoach], ["Grupper", d.person.grupper.join(" · ") || null],
        ["Telefon", d.person.telefon, { mono: true }], ["E-post", d.person.epost], ["Spilt golf", d.person.spilteAar], ["Ambisjon", d.person.ambisjon],
      ]} />
      <Meta>FORESATTE</Meta>
      {!d.foreldre.length ? <Dempet>Ingen foresatte registrert.</Dempet> : <Liste>{d.foreldre.map((f) => <Rad key={f.id}><Etikett a={f.navn} sub={f.relasjon} /><Verdi>{f.kontakt ?? "—"}</Verdi></Rad>)}</Liste>}
      <Meta>RANKING</Meta>
      <Liste>{d.ranking.map((r) => <Rad key={r.navn}><Etikett a={r.navn} sub={r.kilde} /><Verdi>{r.verdi ?? "—"}</Verdi></Rad>)}</Liste>
    </Seksjon>,
    <Seksjon key={1} nr={2} k={T(1)} meta={d.ak ? "SESONGEVALUERING" : "FIREUKERSSJEKK"}>
      <Liste>
        <Rad><Etikett a="Sesongevaluering" sub="UKA FØR UKE 43" /><Verdi>—</Verdi></Rad>
        <Rad><Etikett a="Fireukerssjekk" sub={d.ak ? "BARE WANG OG TEAM NORWAY" : "FINNES IKKE I APPEN ENNÅ"} /><Verdi>—</Verdi></Rad>
      </Liste>
    </Seksjon>,
    <Seksjon key={2} nr={3} k={T(2)} meta="PLAN › MÅLSETNING">{tom ? E : maalRader(d.resultatmaal)}</Seksjon>,
    <Seksjon key={3} nr={4} k={T(3)} meta="PLAN › MÅLSETNING">{tom ? E : maalRader(d.prosessmaal)}</Seksjon>,
    <Seksjon key={4} nr={5} k={T(4)} meta="PLAN › ÅR · UKEVOLUM FRA PERIODEN">
      {tom || !d.perioder.length ? E : <Liste>{d.perioder.map((p, i) => <Rad key={i} variant="3"><Etikett a={p.navn} /><Meta>{p.uker.toUpperCase()}</Meta><Verdi>{p.timer}</Verdi></Rad>)}</Liste>}
    </Seksjon>,
    <Seksjon key={5} nr={6} k={T(5)} meta="PLAN › TURNERINGER">
      {tom || !d.turneringer.length ? E : <Liste>{d.turneringer.map((t, i) => <Rad key={i}><Etikett a={t.navn} sub={t.dato} /><Verdi>{t.resultat}</Verdi></Rad>)}</Liste>}
    </Seksjon>,
    <Seksjon key={6} nr={7} k={T(6)} meta="PLAN › DENNE UKA">
      {tom || !d.uke.length ? E : <Liste>{d.uke.map((u, i) => <Rad key={i} variant="dag"><Meta>{u.dag.toUpperCase()}</Meta><Etikett a={u.tittel} /><Verdi>{u.meta}</Verdi></Rad>)}</Liste>}
    </Seksjon>,
    <Seksjon key={7} nr={8} k={T(7)} meta={d.trening?.kilde ?? "WORKBENCH · 4 UKER"}>
      {tom || !d.trening ? E : d.trening.volumMetadata ? <TreningsvolumVisning volum={d.trening.volumMetadata} enhet="t" /> : <>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span className="a8-tall__v">{d.trening.gjennomfort} av {d.trening.planlagt}</span>
          <Meta>ØKTER GJENNOMFØRT · {String(Math.round(totalt * 10) / 10).replace(".", ",")} T</Meta>
        </div>
        <Liste>{d.trening.timer.map((t) => <Stolpe key={t.akse} merke={<AkseMerke axis={t.akse} size="sm" />} andel={t.timer / maks} verdi={`${String(t.timer).replace(".", ",")} t`} />)}</Liste>
      </>}
    </Seksjon>,
    <Seksjon key={8} nr={9} k={T(8)} meta={d.ak ? "GJELDER IKKE" : "SKALA 1–8"}>
      <Dempet>{d.ak
        ? "Utviklingssjekken og fireukerssjekken gjelder bare spillere i en WANG-gruppe (Ung eller Toppidrett) eller en Team Norway-gruppe."
        : "—"}</Dempet>
      {!d.ak && <Meta>UTVIKLINGSSJEKKEN FINNES IKKE I APPEN ENNÅ</Meta>}
    </Seksjon>,
    <Seksjon key={9} nr={10} k={T(9)} meta="STATS › TESTER · ETT BATTERI">
      {tom || !d.tester.length ? E : <Liste>{d.tester.map((t, i) => <Rad key={i}><Etikett a={t.navn} sub={t.kilde} /><Verdi>{t.verdi}</Verdi></Rad>)}</Liste>}
    </Seksjon>,
    <Seksjon key={10} nr={11} k={T(10)} meta={d.teknikkKilde ?? "TEKNISK PLAN"}>
      {tom || !d.teknikk.length ? E : <Liste>{d.teknikk.map((t, i) => <Rad key={i}><Etikett a={`${t.p} · ${t.tittel}`} /><StatusPille>{t.status}</StatusPille></Rad>)}</Liste>}
    </Seksjon>,
    <Seksjon key={11} nr={12} k={T(11)} meta="STATS › TESTER · FYS">
      {tom || !d.fys.length ? E : <Liste>{d.fys.map((t, i) => <Rad key={i}><Etikett a={t.navn} sub={t.kilde} /><Verdi>{t.verdi}</Verdi></Rad>)}</Liste>}
    </Seksjon>,
  ];
  const halv = Math.ceil(seksjoner.length / 2);
  return <>
    <Dempet>I Team Norways IUP-arks rekkefølge. Alt er hentet fra PlayerHQ og oppdateres når spilleren registrerer. Kompetansemål fra Udir vises ikke her.</Dempet>
    <div className="a8-to a8-to--lik">
      <div className="a8-stabel">{seksjoner.slice(0, halv)}</div>
      <div className="a8-stabel">{seksjoner.slice(halv)}</div>
    </div>
  </>;
}

/* ─────────────────────────── Samtaler ─────────────────────────── */

export function AG08Samtaler({ d, tom }: { d: S360Samtaler; tom: boolean }) {
  return (
    <div className="a8-to">
      <div className="a8-stabel">
        <Seksjon k="Samtaler" meta="MELDINGER · LIVE-ØKTER · COACH-AI">
          {tom || !d.traader.length ? <Dempet>Ingen samtaler ennå.</Dempet> : (
            <Liste>{d.traader.map((t) => <Rad key={t.id}><Etikett a={t.type} sub={`SIST ${t.sist}`} /><Verdi>{t.antall} meld.</Verdi></Rad>)}</Liste>
          )}
        </Seksjon>
        <Seksjon k="Coachvurdering" meta={d.notat ? `${d.notat.coach} · ${d.notat.dato}`.toUpperCase() : "—"}>
          {d.notat ? <p className="a8-tekst">{d.notat.tekst}</p> : <Dempet>Ingen vurdering skrevet.</Dempet>}
        </Seksjon>
      </div>
      <div className="a8-stabel">
        <Seksjon k="Videoer" meta={`${d.videoer.length} SISTE`}>
          {tom || !d.videoer.length ? <Dempet>Ingen videoer.</Dempet> : (
            <Liste>{d.videoer.map((v) => <Rad key={v.id}><Etikett a={v.tittel} sub={`${v.kilde} · ${v.dato}`.toUpperCase()} /><span /></Rad>)}</Liste>
          )}
          <div><KnappLenke size="sm" variant="ghost" href="/admin/videoer">Alle videoer</KnappLenke></div>
        </Seksjon>
        <Seksjon k="Caddie" meta="BARE COACH SER DETTE">
          <Liste>
            <Rad><Etikett a="Samtaler med Caddie" sub={d.caddie.sist ? `SIST ${d.caddie.sist}` : "—"} /><Verdi>{d.caddie.antall}</Verdi></Rad>
            <Rad><Etikett a="Siste samtale" /><Verdi>{d.caddie.sisteTittel ?? "—"}</Verdi></Rad>
          </Liste>
          <Meta>NAVN TAS UT FØR TEKSTEN SENDES TIL AI.</Meta>
        </Seksjon>
      </div>
    </div>
  );
}

/* ───────────────────────────── Talent ───────────────────────────── */

export function AG08Talent({ d, tom }: { d: S360Talent; tom: boolean }) {
  return (
    <div className="a8-to">
      <Seksjon k="Talentradar · 1–10" meta="BARE COACH · SPILLEREN SER ALDRI DETTE" gap={12}>
        {tom || !d.radar ? <Dempet>For lite data til talentradar.</Dempet> : <>
          <Talentradar akser={d.radar} />
          <Meta>{`${d.kilde} · KATEGORI C-LINJE: —`}</Meta>
        </>}
      </Seksjon>
      <Seksjon k="Talentprogram" meta="TALENTTRACKING">
        <Nokkelverdi items={[
          ["Nivå", d.niva], ["Region", d.region], ["Klubb", d.klubb], ["Inkludert fra", d.inkludertFra, { mono: true }],
        ]} />
        {d.notater && <p className="a8-tekst">{d.notater}</p>}
        <Meta>MILEPÆLER</Meta>
        {!d.milepaeler.length ? <Dempet>Ingen milepæler registrert.</Dempet> : (
          <Liste>{d.milepaeler.map((m, i) => <Rad key={i}><Etikett a={m.tittel} /><Verdi>{m.dato ?? "—"}</Verdi></Rad>)}</Liste>
        )}
      </Seksjon>
    </div>
  );
}
