/**
 * Data Golf for coach i nytt design (AgencyOS pakke 10) — /admin/datagolf/*.
 * Fasit: docs/design-system/utkast-agencyos/datagolf.html og
 * docs/design-system/datagolf-coach-datakart-og-skjermliste.md.
 *
 * Bare for coach og admin (`krevDataGolfBruker`). «Powered by Data Golf» der tallene vises.
 * Ingen eksport. Alle tall har kilde og dato; mangler et tall, står «—».
 *
 * Avvik:
 *   - DG-05 Spiller mot proff, DG-06 Innspill-tak og DG-07 Fra funn til forslag har ikke egne
 *     sider ennå. Oversikten lenker til stasjonen (innspill mot proffens tall) som finnes.
 *   - DG-08 viser norske proffers siste resultater og kommende turneringer; live-stilling
 *     fra LeaderboardSnapshot er ikke koblet.
 *   - Tallene er Data Golfs modellerte ferdighetstall (skill ratings) med kildedato; de er
 *     merket som det.
 */
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { KnappLenke, Pille, Seksjon, Tom, Topp, Nokkelverdier } from "@/components/admin/agencyos-ny/ny";
import type { DgProffRad } from "@/lib/admin/datagolf/coach-data";
import "@/styles/agencyos-ny-datagolf.css";

const nb = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short", year: "numeric" });
export const dato = (d: Date | null | undefined) => (d ? nb.format(d) : "—");
export const sg = (v: number | null | undefined) => (v == null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(2).replace(".", ",")}`);
export const tall = (v: number | null | undefined, d = 1) => (v == null ? "—" : v.toFixed(d).replace(".", ","));

export function PoweredBy() {
  return <p className="dg-powered">Powered by <a href="https://datagolf.com" target="_blank" rel="noopener noreferrer">Data Golf</a> · ingen eksport</p>;
}

export function DgFaner({ aktiv }: { aktiv: "oversikt" | "katalog" | "topplister" | "norske" | "kilde" }) {
  const f: ReadonlyArray<[typeof aktiv, string, string]> = [
    ["oversikt", "Oversikt", "/admin/datagolf"], ["katalog", "Proffer", "/admin/datagolf/proffer"],
    ["topplister", "Topplister", "/admin/datagolf/topplister"], ["norske", "Norske proffer", "/admin/datagolf/norske"],
    ["kilde", "Kilde og dekning", "/admin/datagolf/kilde"],
  ];
  return <nav className="faner" aria-label="Data Golf">{f.map(([id, l, h]) => <Link key={id} href={h} aria-current={aktiv === id ? "page" : undefined}>{l}</Link>)}</nav>;
}

function ProffListe({ rader }: { rader: readonly DgProffRad[] }) {
  return <div className="kort rader">
    {rader.map((p) => <Link key={p.dgId} href={`/admin/datagolf/proffer/${p.dgId}`} className="dg-rad">
      <span className="dg-rang mono">{p.dgRang ?? "—"}</span>
      <span><b>{p.navn}</b><span className="kilde">{[p.land, p.tour?.toUpperCase()].filter(Boolean).join(" · ") || "—"}{p.norsk ? " · norsk" : ""}</span></span>
      <span className="hoyre"><span className="mono">{sg(p.sgTotal)}</span><ChevronRight className="ikon" aria-hidden /></span>
    </Link>)}
  </div>;
}

/* DG-01 Oversikt */
export function DG01Oversikt({ d }: { d: { antallProffer: number; kildedato: Date | null; sistSynk: Date | null; feiletSynk: number; endepunkter: number; norske: DgProffRad[]; forsinket: boolean } }) {
  return <div className="agn-s">
    <Topp dato="Drift · Data Golf · bare coach" tittel="Data Golf" ingress="Proffenes målte og modellerte tall, til å sette spillerens gap og trening i sammenheng." />
    <DgFaner aktiv="oversikt" />
    {d.antallProffer === 0
      ? <Tom tittel="Ingen synk ennå" tekst="Data Golf-tallene hentes ukentlig. Når første synk er gjort, vises de her." />
      : <>
        <div className="teller-rad">
          <div className="teller"><span className="e">Proffer med tall</span><b className="t">{d.antallProffer}</b><span className="s">kildedato {dato(d.kildedato)}</span></div>
          <div className={d.feiletSynk > 0 ? "teller signal" : "teller"}><span className="e">Siste synk</span><b className="t" style={{ fontSize: 22 }}>{dato(d.sistSynk)}</b><span className="s">{d.feiletSynk > 0 ? `${d.feiletSynk} endepunkt feilet` : `${d.endepunkter} endepunkter`}</span></div>
          <div className="teller"><span className="e">Norske proffer</span><b className="t">{d.norske.length}</b><span className="s">koblet til spillerprofil</span></div>
          <div className="teller"><span className="e">Status</span><span>{d.forsinket ? <Pille tone="vent">Forsinket</Pille> : <Pille tone="ok">Oppdatert</Pille>}</span><span className="s">{d.forsinket ? "Eldre enn 14 dager" : "Innen 14 dager"}</span></div>
        </div>
        <div className="to-del bred-v">
          <Seksjon tittel="Norske proffer" kilde="SG total, modellert">
            {d.norske.length === 0 ? <p className="forklar">Ingen norske proffer er koblet ennå.</p> : <ProffListe rader={d.norske} />}
          </Seksjon>
          <Seksjon tittel="Gå til">
            <div className="liste">
              {([["/admin/datagolf/proffer", "Proffkatalog", "Søk og filter på tour og land"], ["/admin/datagolf/topplister", "Topplister", "Seks kategorier per tour og år"], ["/admin/datagolf/norske", "Norske proffer", "Resultater og kommende turneringer"], ["/portal/analysere/datagolf/stasjon", "Innspill mot proff", "Stasjonen med proffens nærhet som sirkel"], ["/admin/datagolf/kilde", "Kilde og dekning", "Per endepunkt: sist synket og rader"]] as const).map(([h, t, k]) =>
                <Link key={h} href={h}><span className="ikonboks"><Search className="ikon" aria-hidden /></span><span><b>{t}</b><span className="kilde">{k}</span></span><ChevronRight className="ikon" aria-hidden /></Link>)}
            </div>
          </Seksjon>
        </div>
      </>}
    <PoweredBy />
  </div>;
}

/* DG-02 Proffkatalog */
export function DG02Katalog({ rader, turer, valg }: { rader: DgProffRad[]; turer: string[]; valg: { sok?: string; tour?: string; norskForst?: boolean } }) {
  return <div className="agn-s">
    <Topp dato="Data Golf" tittel="Proffer" />
    <DgFaner aktiv="katalog" />
    <form className="dg-filter" action="/admin/datagolf/proffer">
      <div className="felt"><label htmlFor="dg-sok">Søk</label><input id="dg-sok" name="sok" type="search" defaultValue={valg.sok ?? ""} placeholder="Navn" /></div>
      <div className="felt"><label htmlFor="dg-tour">Tour</label><select id="dg-tour" name="tour" defaultValue={valg.tour ?? ""}><option value="">Alle</option>{turer.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}</select></div>
      <div className="felt"><label htmlFor="dg-norske">Rekkefølge</label><select id="dg-norske" name="norske" defaultValue={valg.norskForst ? "1" : ""}><option value="">SG total</option><option value="1">Norske først</option></select></div>
      <button type="submit" className="knapp pri">Vis</button>
    </form>
    {rader.length === 0 ? <Tom tittel="Ingen treff" tekst="Prøv et annet navn eller fjern filteret." /> : <>
      <p className="kilde">{rader.length} proffer · sortert på SG total (modellert)</p>
      <ProffListe rader={rader} />
    </>}
    <PoweredBy />
  </div>;
}

type Tak = { name: string; country: string | null; primaryTour: string | null; asOf: Date; sgTotal: number | null; sgOtt: number | null; sgApp: number | null; sgArg: number | null; sgPutt: number | null; drivingDistY: number | null; drivingAcc: number | null; dgRank: number | null; owgrRank: number | null; bands: { band: string; lie: string; proximityMeters: number | null; girRate: number | null; shotCount: number | null }[] };
type Sesong = { tour: string; year: number; rounds: number | null; avgScore: number | null; fairwayPct: number | null; girPct: number | null; puttsPerRound: number | null; sgTotal: number | null };
const BAND: Record<string, string> = { innspill50: "50–100 yds", innspill100: "100–150 yds", innspill150: "150–200 yds", innspill200: "200+ yds" };

/* DG-03 Proffprofil */
export function DG03Proff({ tak, sesonger }: { tak: Tak; sesonger: Sesong[] }) {
  const felt: ReadonlyArray<[string, number | null, string]> = [["Utslag", tak.sgOtt, "a-tek"], ["Innspill", tak.sgApp, "a-slag"], ["Nærspill", tak.sgArg, "a-spill"], ["Putting", tak.sgPutt, "a-fys"]];
  return <div className="agn-s">
    <Topp tilbake={{ href: "/admin/datagolf/proffer", tekst: "Proffer" }} dato={[tak.country, tak.primaryTour?.toUpperCase(), `kildedato ${dato(tak.asOf)}`].filter(Boolean).join(" · ")} tittel={tak.name} />
    <div className="to-del bred-v">
      <div>
        <section className="kort" aria-label="Strokes Gained">
          <div className="hoved"><strong>{sg(tak.sgTotal)}</strong><span className="forklar">SG total per runde, modellert</span></div>
          <div className="dg-sg">{felt.map(([l, v]) => <div key={l}><span className="kilde">{l}</span><b className="mono">{sg(v)}</b></div>)}</div>
          <Nokkelverdier rader={[["Driver", tak.drivingDistY == null ? "—" : `${tall(tak.drivingDistY, 0)} yds`], ["Driver treff", tak.drivingAcc == null ? "—" : `${tall(tak.drivingAcc * (tak.drivingAcc <= 1 ? 100 : 1), 0)} %`], ["DG-rang", tak.dgRank ?? "—"], ["OWGR", tak.owgrRank ?? "—"]]} />
        </section>
        <Seksjon tittel="Sesongtall" kilde="Per tour og år">
          {sesonger.length === 0 ? <p className="forklar">Ingen sesongtall lagret.</p> : <div className="kort rader">
            {sesonger.map((s) => <div key={`${s.tour}-${s.year}`} className="dg-rad">
              <span className="mono kilde">{s.year}</span>
              <span><b>{s.tour.toUpperCase()}</b><span className="kilde">{s.rounds ?? "—"} runder · snitt {tall(s.avgScore, 2)} · fairway {tall(s.fairwayPct, 0)} % · GIR {tall(s.girPct, 0)} %</span></span>
              <span className="mono">{sg(s.sgTotal)}</span>
            </div>)}
          </div>}
        </Seksjon>
      </div>
      <Seksjon tittel="Innspill per avstand" kilde="Nærhet til hullet">
        {tak.bands.length === 0 ? <p className="forklar">Proffen har ingen innspillsdata.</p> : <div className="kort rader">
          {tak.bands.slice().sort((a, b) => a.band.localeCompare(b.band) || a.lie.localeCompare(b.lie)).map((b) => <div key={`${b.band}-${b.lie}`} className="dg-rad">
            <span className="mono kilde">{BAND[b.band] ?? b.band}</span>
            <span><b>{b.lie === "fairway" ? "Fairway" : "Rough"}</b><span className="kilde">{b.shotCount ?? "—"} slag · GIR {b.girRate == null ? "—" : `${tall(b.girRate * 100, 0)} %`}</span></span>
            <span className="mono">{b.proximityMeters == null ? "—" : `${tall(b.proximityMeters)} m`}</span>
          </div>)}
        </div>}
        <KnappLenke href="/portal/analysere/datagolf/stasjon">Øv mot proffens tall</KnappLenke>
      </Seksjon>
    </div>
    <PoweredBy />
  </div>;
}

/* DG-04 Topplister */
export function DG04Topplister({ kategorier, aktiv, tour, aar, aarValg, turValg, rader, oppdatert }: {
  kategorier: ReadonlyArray<{ id: string; label: string }>; aktiv: string; tour: string; aar: number; aarValg: number[]; turValg: string[];
  rader: { dgId: number; navn: string; land: string | null; runder: number | null; verdi: number | null }[]; oppdatert: Date | null;
}) {
  const lenke = (k: string, t = tour, a = aar) => `/admin/datagolf/topplister?kategori=${k}&tour=${t}&aar=${a}`;
  return <div className="agn-s">
    <Topp dato="Data Golf" tittel="Topplister" />
    <DgFaner aktiv="topplister" />
    <div className="chips" role="group" aria-label="Kategori">{kategorier.map((k) => <Link key={k.id} href={lenke(k.id)} aria-current={k.id === aktiv ? "page" : undefined}>{k.label}</Link>)}</div>
    <div className="chips" role="group" aria-label="Tour og år">
      {turValg.map((t) => <Link key={t} href={lenke(aktiv, t)} aria-current={t === tour ? "page" : undefined}>{t.toUpperCase()}</Link>)}
      {aarValg.map((a) => <Link key={a} href={lenke(aktiv, tour, a)} aria-current={a === aar ? "page" : undefined}>{a}</Link>)}
    </div>
    {rader.length === 0 ? <Tom tittel="Ingen tall for valget" tekst="Velg en annen tour eller et annet år." /> : <>
      <p className="kilde">Oppdatert {dato(oppdatert)} · minst 20 runder der runder er kjent</p>
      <div className="kort rader">
        {rader.map((r, i) => <Link key={r.dgId} href={`/admin/datagolf/proffer/${r.dgId}`} className="dg-rad">
          <span className="dg-rang mono">{i + 1}</span>
          <span><b>{r.navn}</b><span className="kilde">{r.land ?? "—"} · {r.runder ?? "—"} runder</span></span>
          <span className="mono">{aktiv === "sgTotal" ? sg(r.verdi) : tall(r.verdi, aktiv === "avgScore" || aktiv === "puttsPerRound" ? 2 : 1)}</span>
        </Link>)}
      </div>
    </>}
    <PoweredBy />
  </div>;
}

/* DG-08 Norske proffer */
export function DG08Norske({ spillere, kommende }: {
  spillere: { id: string; name: string; entries: { id: string; position: number | null; scoreToPar: number | null; tournament: { name: string; startDate: Date } }[] }[];
  kommende: { id: string; name: string; startDate: Date; tour: string | null }[];
}) {
  const tilPar = (n: number | null) => (n == null ? "—" : n === 0 ? "E" : n > 0 ? `+${n}` : `−${Math.abs(n)}`);
  return <div className="agn-s">
    <Topp dato="Data Golf" tittel="Norske proffer" />
    <DgFaner aktiv="norske" />
    <div className="to-del bred-v">
      <Seksjon tittel="Siste resultater" kilde="Målt, brutto">
        {spillere.length === 0 ? <p className="forklar">Ingen norske proffer er koblet til Data Golf ennå.</p> : <div className="kort rader">
          {spillere.map((s) => <div key={s.id} className="dg-rad">
            <span className="dg-rang mono">{s.entries[0]?.position ?? "—"}</span>
            <span><b>{s.name}</b><span className="kilde">{s.entries.length === 0 ? "Ingen resultater lagret" : s.entries.map((e) => `${e.tournament.name} (${dato(e.tournament.startDate)}) ${tilPar(e.scoreToPar)}`).join(" · ")}</span></span>
            <span className="mono">{tilPar(s.entries[0]?.scoreToPar ?? null)}</span>
          </div>)}
        </div>}
      </Seksjon>
      <Seksjon tittel="Kommende turneringer">
        {kommende.length === 0 ? <p className="forklar">Ingen kommende turneringer i kalenderen.</p> : <div className="kort rader">
          {kommende.map((t) => <div key={t.id} className="dg-rad"><span className="mono kilde">{dato(t.startDate)}</span><span><b>{t.name}</b><span className="kilde">{t.tour?.toUpperCase() ?? "—"}</span></span><span /></div>)}
        </div>}
      </Seksjon>
    </div>
    <PoweredBy />
  </div>;
}

/* DG-09 Kilde og dekning */
export function DG09Kilde({ rader }: { rader: { endepunkt: string; rader: number | null; status: number | null; feil: string | null; sist: Date | null }[] }) {
  return <div className="agn-s">
    <Topp dato="Data Golf" tittel="Kilde og dekning" ingress="Hva som hentes, når, og hvor mange rader. Modellprognoser og odds hentes ikke og vises ikke." />
    <DgFaner aktiv="kilde" />
    {rader.length === 0 ? <Tom tittel="Ingen synk registrert" tekst="Synkstatus skrives når pipelines henter fra Data Golf." /> :
      <div className="kort rader">
        {rader.map((r, i) => <div key={`${r.endepunkt}-${i}`} className="dg-rad">
          <span className="mono kilde">{dato(r.sist)}</span>
          <span><b>{r.endepunkt}</b><span className="kilde">{r.rader ?? "—"} rader{r.feil ? ` · ${r.feil}` : ""}</span></span>
          <Pille tone={r.status != null && r.status >= 400 ? "feil" : r.sist ? "ok" : "noy"}>{r.status != null && r.status >= 400 ? "Feilet" : r.sist ? "OK" : "Ikke kjørt"}</Pille>
        </div>)}
      </div>}
    <Seksjon tittel="Lisens">
      <p className="forklar">Data Golf-tall vises bare for coacher i AK Golf, WANG Toppidrett og Team Norway. Aldri for spillere, foreldre eller uinnloggede. Ingen eksport.</p>
    </Seksjon>
    <PoweredBy />
  </div>;
}
