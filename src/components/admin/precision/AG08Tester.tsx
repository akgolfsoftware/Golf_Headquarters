"use client";

/**
 * Tester-fanen i Spiller 360 (tegning AG-360.jsx › TestTab), med alt den gamle
 * /admin/spillere/[id]/tester-siden viste: dekning per disiplin, testdager i
 * planen, tildelte tester, resultater med øvelsesforslag (legg i et fremtidig
 * øktutkast via leggTilOvelseFraTestForm) og Team Norway-resultater.
 */
import Link from "next/link";
import { useActionState } from "react";
import { ClipboardList } from "lucide-react";
import { AkseMerke, Knapp, KnappLenke, Meta, StatusPille } from "@/components/precision/pa";
import { Dempet, Etikett, Liste, Rad, Seksjon, TallFlis, Talentradar, Verdi } from "@/components/precision/pa-spiller360";
import { leggTilOvelseFraTestForm } from "@/lib/portal-tester/test-followup-actions";
import { akseFra } from "@/lib/admin-spiller/spiller360-visning";
import type { S360Tester } from "@/lib/admin-spiller/spiller360-typer";

function LeggIUtkast({ spillerId, resultId, ovelseId, okter }: { spillerId: string; resultId: string; ovelseId: string; okter: { id: string; label: string }[] }) {
  const [svar, handling, pending] = useActionState(leggTilOvelseFraTestForm, null);
  return (
    <form action={handling} className="a8-skjema">
      <input type="hidden" name="playerId" value={spillerId} />
      <input type="hidden" name="resultId" value={resultId} />
      <input type="hidden" name="ovelseId" value={ovelseId} />
      <div className="a8-skjema__rad">
        <label className="a8-etikett" style={{ flex: "1 1 220px" }}>Fremtidig økt
          <select name="sessionId" required defaultValue="" className="a8-felt">
            <option value="" disabled>Velg økt</option>
            {okter.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </label>
        <label className="a8-etikett" style={{ flex: "0 1 120px" }}>Minutter
          <input name="durationMinutes" type="number" min={1} max={120} required className="a8-felt a8-felt--mono" />
        </label>
        <Knapp type="submit" size="sm" variant="secondary" loading={pending} loadingText="Legger til …">Legg til i utkast</Knapp>
      </div>
      {svar && <p role="status" className="a8-dempet">{svar.ok ? "Øvelsen er lagt i øktutkastet. Publiser økten separat." : svar.error}</p>}
    </form>
  );
}

export function AG08Tester({ d, tom, spillerId }: { d: S360Tester; tom: boolean; spillerId: string }) {
  const p = d.profil;
  const tildel = `/admin/tester/tildel/${spillerId}`;
  const harMaalinger = !tom && p.measurements > 0;
  return <>
    <div className="a8-tall-rutenett">
      <TallFlis k="Tester gjennomført" v={tom ? "—" : `${p.testsDone}/${p.testsTotal}`} kilde="TESTRESULTAT" />
      <TallFlis k="Disipliner dekket" v={tom ? "—" : `${p.omraderDekket}/5`} kilde="FYS · TEK · SLAG · SPILL · TURN" />
      <TallFlis k="Målinger totalt" v={tom ? "—" : p.measurements} kilde={p.player.sistAktiv ? `SIST AKTIV ${p.player.sistAktiv}`.toUpperCase() : "—"} />
    </div>
    <div className="a8-to">
      <div className="a8-stabel">
        <Seksjon k="Dekning per disiplin" meta="TESTER MÅLT / TILGJENGELIG" gap={12}>
          {!harMaalinger ? <Dempet>Ingen tester tatt. Tildel en test for å bygge dekningsprofilen.</Dempet> : <>
            <Talentradar akser={p.omrader.map((o) => ({ akse: o.area, verdi: Math.round(o.coveragePct) / 10 }))} />
            <Meta>SKALA 0–100 % · VIST SOM 0–10</Meta>
          </>}
          <Liste>{p.omrader.map((o) => {
            const a = akseFra(o.area);
            const sub = [`${o.measured}/${o.available} tester`, o.bestLevel ? `nivå ${o.bestLevel}` : null, o.lastDate ? `sist ${o.lastDate}` : null].filter(Boolean).join(" · ").toUpperCase();
            return <Rad key={o.area} variant="merke">{a ? <AkseMerke axis={a} size="sm" /> : <Meta>{o.area}</Meta>}<Etikett a={o.label} sub={sub} /><Verdi>{tom ? "—" : `${o.coveragePct} %`}</Verdi></Rad>;
          })}</Liste>
          <Liste>
            <Rad><Etikett a="Sterkeste dekning" sub={p.sterkeste ? `${p.sterkeste.coveragePct} % DEKKET` : "INGEN MÅLINGER ENNÅ"} /><Verdi>{p.sterkeste?.label ?? "—"}</Verdi></Rad>
            <Rad><Etikett a="Svakeste dekning" sub={p.svakeste ? `${p.svakeste.measured} AV ${p.svakeste.available} TESTER TATT` : "INGEN MÅLINGER ENNÅ"} /><Verdi>{p.svakeste?.label ?? "—"}</Verdi></Rad>
          </Liste>
          <div><KnappLenke size="sm" variant="secondary" icon={ClipboardList} iconName="clipboard-list" href={tildel}>Tildel test</KnappLenke></div>
        </Seksjon>
        <Seksjon k="Testdager i planen" meta="WORKBENCH · I ÅR">
          {tom || !d.testdager.length ? <Dempet>Ingen testdag er lagt i årsplanens kalender i år.</Dempet> : (
            <Liste>{d.testdager.map((t) => <Rad key={t.id}><Etikett a={t.tittel} sub={t.dato} /><StatusPille tone={t.gjennomfort ? "ok" : "neutral"}>{t.gjennomfort ? "Gjennomført" : "Planlagt"}</StatusPille></Rad>)}</Liste>
          )}
        </Seksjon>
        <Seksjon k="Tildelte tester" meta="EN FRIST ER IKKE EN TIDSFESTET TESTDAG">
          {tom || !d.tildelinger.length ? <Dempet>Ingen åpne testtildelinger.</Dempet> : (
            <Liste>{d.tildelinger.map((t) => <Rad key={t.id}><Etikett a={t.navn} /><Verdi>{t.frist ? `Frist ${t.frist}` : "Uten frist"}</Verdi></Rad>)}</Liste>
          )}
        </Seksjon>
      </div>
      <div className="a8-stabel">
        <Seksjon k="Resultater og øvelsesforslag" meta="SISTE RESULTAT PER TEST" gap={12}>
          {tom || !d.resultater.length ? <Dempet>Ingen testresultater registrert. Et testforslag kommer først etter et resultat.</Dempet> : d.resultater.map((r) => (
            <div key={r.id} className="a8-stabel" style={{ gap: 8, paddingTop: 12, borderTop: "1px solid var(--border-hairline)" }}>
              <Rad><Etikett a={r.navn} sub={r.dato} /><Verdi>{r.score}</Verdi></Rad>
              <Dempet>{r.trend}</Dempet>
              <Meta>MENTAL · SOSIAL · TAKTIKK · FYSISK TILSTAND: IKKE VURDERT. FORHOLD Å VURDERE, IKKE ÅRSAKER SOM KAN LESES UT AV SCOREN.</Meta>
              {!r.forslag.length ? <Dempet>Ingen godkjent øvelse er koblet til dette testområdet ennå. Coachen vurderer videre trening.</Dempet> : r.forslag.map((f) => (
                <div key={f.id} className="a8-stabel" style={{ gap: 6, paddingLeft: 12, borderLeft: "2px solid var(--border-hairline)" }}>
                  <Etikett a={f.navn} sub={f.begrunnelse} />
                  {f.beskrivelse && <Dempet>{f.beskrivelse}</Dempet>}
                  {f.kanLeggesTil && f.okter.length > 0 && <LeggIUtkast spillerId={spillerId} resultId={r.id} ovelseId={f.id} okter={f.okter} />}
                  {f.kanLeggesTil && !f.okter.length && <div><Link href={d.workbenchHref} className="pa-btn pa-btn--ghost pa-btn--sm">Opprett et fremtidig øktutkast i Workbench</Link></div>}
                </div>
              ))}
            </div>
          ))}
        </Seksjon>
        <Seksjon k="Team Norway-resultater" meta="NY TESTUTGAVE">
          {tom || !d.tn.length ? <Dempet>Ingen resultater fra den nye testutgaven.</Dempet> : (
            <Liste>{d.tn.map((t) => <Rad key={t.id}><Etikett a={t.navn} sub={`${t.forsok} FORSØK · ${t.dato}`} /><Verdi>{t.score}</Verdi></Rad>)}</Liste>
          )}
        </Seksjon>
      </div>
    </div>
  </>;
}
