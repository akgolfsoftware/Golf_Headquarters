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
import { TreningsvolumVisning } from "./TreningsvolumVisning";

/* ───────────────────────────── Plan ───────────────────────────── */

export function AG08Plan({ d, tom, spillerId }: { d: S360Plan; tom: boolean; spillerId: string }) {
  const uke = tom ? [] : d.uke;
  return (
    <div className="a8-to">
      <div className="a8-stabel">
        <Seksjon k={d.ukeLabel} meta="PLAN · WORKBENCH">
          {!uke.length ? <Dempet>Ingen plan ennå.</Dempet> : (
            <Liste>{uke.map((o) => {
              const [st, tone] = oktStatus(o.status);
              return <Rad key={o.id} variant="dag"><Meta>{o.dag.toUpperCase()}</Meta><Etikett a={o.tittel} sub={`${o.akse ? AKSE_NAVN[o.akse] : "—"} · ${o.minutter} MIN`} /><StatusPille tone={tone}>{st}</StatusPille></Rad>;
            })}</Liste>
          )}
          <div><KnappLenke size="sm" variant="secondary" icon={Layers} iconName="layers" href={`/admin/workbench/${spillerId}`}>Åpne hele planen i Workbench</KnappLenke></div>
        </Seksjon>
        <Seksjon k="I dag" meta={d.naa ? `NÅ · ${d.naa.tidspunkt}`.toUpperCase() : "ØKTLOGG"}>
          {d.naa && <Etikett a={d.naa.tittel} sub={d.naa.sted?.toUpperCase()} />}
          {tom || !d.iDag.length ? <Dempet>Ingen økter i dag.</Dempet> : (
            <Liste>{d.iDag.map((o) => <Rad key={o.id} variant="dag"><Meta>{o.klokke}</Meta><Etikett a={o.tittel} sub={[o.omrade, o.sted].filter(Boolean).join(" · ").toUpperCase()} /><span /></Rad>)}</Liste>
          )}
        </Seksjon>
        <Seksjon k="Hvilken standardplan virker" meta="ESTIMAT TIL NOK DATA">
          <Dempet>—</Dempet>
          <Meta>STANDARDPLANENE ER IKKE SKREVET INN I APPEN ENNÅ</Meta>
        </Seksjon>
      </div>
      <div className="a8-stabel">
        <Seksjon k="Turneringer" meta="PÅMELDINGER BEKREFTES IKKE HER">
          {tom || (!d.kommende.length && !d.resultater.length) ? <Dempet>Ingen turneringer.</Dempet> : (
            <Liste>
              {d.kommende.map((t, i) => <Rad key={`k${i}`}><Etikett a={t.navn} sub={t.dato} /><Verdi>Påmeldt</Verdi></Rad>)}
              {d.resultater.map((t, i) => <Rad key={`r${i}`}><Etikett a={t.navn} sub={t.dato} /><Verdi>{[t.score ?? null, t.plassering != null ? `${t.plassering}. plass` : null].filter((x) => x != null).join(" · ") || "—"}</Verdi></Rad>)}
            </Liste>
          )}
        </Seksjon>
        <Seksjon k="Treningsplan og sesong" meta="TRAININGPLAN · SEASONPLAN">
          <Nokkelverdi items={[
            ["Aktiv plan", d.aktivPlan?.navn ?? null],
            ["Periode", d.aktivPlan?.periode ?? null, { mono: true }],
            ["Økter gjennomført", d.aktivPlan?.okter ?? null, { mono: true }],
            ["Venter på deg", d.aktivPlan?.venter ?? null],
            ["Sesong", d.sesong?.navn ?? null],
            ["Nå", d.sesong?.naa ? d.sesong.naa.navn : null, { hint: d.sesong?.naa ? `TIL ${d.sesong.naa.til}` : undefined }],
            ["Neste", d.sesong?.neste ? d.sesong.neste.navn : null, { hint: d.sesong?.neste ? `FRA ${d.sesong.neste.fra}` : undefined }],
          ]} />
        </Seksjon>
        <Seksjon k="Permisjoner og fravær" meta="HELSEDETALJER BARE MED SAMTYKKE">
          {!d.permisjoner.length ? <Dempet>Ingen permisjoner registrert.</Dempet> : (
            <Liste>{d.permisjoner.map((p) => <Rad key={p.id} variant="3"><Etikett a={p.aarsak} sub={`${p.fra} – ${p.til}`} /><Meta>{p.beskrivelse.toUpperCase()}</Meta><StatusPille tone={p.status === "Pågående" ? "warn" : "neutral"}>{p.status}</StatusPille></Rad>)}</Liste>
          )}
        </Seksjon>
      </div>
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
