import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { hentElevOkter, hentGruppeElever } from "@/app/team-wang/_data/wang-idag-trening-data";
import {
  OMRADE_NAVN,
  ddmm,
  ddmmaaaa,
  dagOgDato,
  erForfalt,
  erGjennomfort,
  erAvvist,
  fireUker,
  forsteVerdi,
  gruppeokter,
  leggTilDager,
  osloIso,
  perOmrade,
  perUke,
  prosent,
  summer,
  tidsrom,
  timer,
  type WangOkt,
} from "@/app/team-wang/_data/wang-trening-beregning";
import { ElevVelger } from "@/app/team-wang/_components/wang-idag-trening/elev-velger";
import { Omradeprikk, Pillenke, Sidehode, it as s, lastTrygt, oktHref, omradeKlasse } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import type { WangSkjermKontekst } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import { WangDemoMerknad, WangFeil, WangKnapp, WangStatus, WangTabell, WangTom, type WangStatusTone } from "@/components/wang/trener/wang-ui";
import { elevprofilHref, wangHref } from "@/lib/wang/wang-ruter";

/** WANG-42 Treningsoversikt. Fasit: «WANG Golf Trening.dc.html» (6cfa623c). Rute: /team-wang/trening */
export async function WangTreningsoversikt({ gruppe, erDemo, sok }: WangSkjermKontekst & { sok: { elev?: string | string[] } }) {
  const naa = new Date();
  const idag = osloIso(naa);
  const mandager = fireUker(idag);
  const fra = mandager[0];
  const til = leggTilDager(mandager[3], 6);

  const last = await lastTrygt(async () => {
    const elever = await hentGruppeElever(gruppe.id);
    const okter = await hentElevOkter(elever.map((e) => e.id), fra, leggTilDager(idag, 21));
    return { elever, okter };
  });

  const sidehodeMeta = `Siste fire uker · ${ddmm(fra)}–${ddmmaaaa(til)}`;
  if (!last.ok) {
    return (
      <div className={s.stabel}>
        <Sidehode meta={sidehodeMeta} tittel="Oversikt" />
        <WangFeil tittel="Vi fikk ikke hentet treningsdata." tekst="Planen og registreringene er ikke borte. Prøv igjen om litt." handling={<WangKnapp href={wangHref("WANG-42")}>Prøv igjen</WangKnapp>} />
      </div>
    );
  }

  const { elever, okter: alleOkter } = last.data;
  const elevId = forsteVerdi(sok.elev);
  const elev = elevId ? elever.find((e) => e.id === elevId) ?? null : null;
  const ids = elev ? [elev.id] : elever.map((e) => e.id);
  const n = Math.max(ids.length, 1);
  const iVindu = alleOkter.filter((o) => ids.includes(o.elevId) && o.dato >= fra && o.dato <= til);
  const sum = summer(iVindu, naa);
  const snitt = (min: number) => timer(min / n);

  const hrefFor: Record<string, string> = Object.fromEntries(elever.map((e) => [e.id, wangHref("WANG-42", {}, { elev: e.id })]));
  const velger =
    !elev && elever.length > 0 ? (
      <div className={s.velgere}>
        <ElevVelger elever={elever} valgt="" hrefFor={hrefFor} />
      </div>
    ) : null;

  const undertittel = elev ? `${elev.navn} · ${gruppe.name}` : `Hele gruppa · ${gruppe.name} · ${elever.length} ${elever.length === 1 ? "elev" : "elever"}`;

  const hode = (
    <>
      <Sidehode meta={sidehodeMeta} tittel="Oversikt" undertittel={undertittel} hoyre={velger} />
      {elev ? (
        <div>
          <Link href={wangHref("WANG-42")} className={s.lenke}>
            <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
            Tilbake til {gruppe.name}
          </Link>
        </div>
      ) : null}
    </>
  );

  if (elevId && !elev) {
    return (
      <div className={s.stabel}>
        {hode}
        <WangTom tittel="Fant ikke eleven." tekst="Eleven er ikke aktiv i gruppa, eller adressen er feil." handling={<WangKnapp href={wangHref("WANG-42")}>Se hele gruppa</WangKnapp>} />
      </div>
    );
  }

  if (iVindu.length === 0) {
    return (
      <div className={s.stabel}>
        {hode}
        {erDemo ? <WangDemoMerknad /> : null}
        <section className={s.kort}>
          <WangTom
            tittel="Ingen treningsplan ennå."
            tekst={
              ingenEleverTekst(elever.length) ??
              (elev ? `${elev.navn} har ingen planlagte økter de siste fire ukene.` : `Gruppa ${gruppe.name} har ingen planlagte økter de siste fire ukene. Økter kommer fra elevenes plan i PlayerHQ.`)
            }
            handling={<WangKnapp href={wangHref("WANG-29")}>Se årsplan</WangKnapp>}
          />
        </section>
      </div>
    );
  }

  // ---- Nøkkeltall ----
  const kpi = [
    { etikett: "Planlagt tid", verdi: `${snitt(sum.planlagtMin)} t`, hint: elev ? "Alle økter i perioden" : `Snitt per elev · ${ids.length} elever`, vekt: 300 },
    { etikett: "Gjennomført tid", verdi: `${snitt(sum.gjennomfortMin)} t`, hint: elev ? "Gjennomførte økter" : "Snitt per elev", vekt: 300 },
    { etikett: "Etterlevelse", verdi: prosent(sum.etterlevelse), hint: sum.forfaltMin > 0 ? `${snitt(sum.gjennomfortMin)} av ${snitt(sum.forfaltMin)} t med passert sluttid` : "Ingen forfalte økter", vekt: 800 },
    { etikett: "Oppmøte morgentrening", verdi: prosent(sum.morgenAndel), hint: elev ? `${sum.morgenOppmott} av ${sum.morgenForfalt} morgenøkter` : "Andel morgenøkter med oppmøte", vekt: 300 },
  ];

  // ---- Uke for uke ----
  const uker = perUke(iVindu, mandager, naa);
  const maks = Math.max(1, ...uker.map((u) => u.sum.planlagtMin));
  const hoyde = (min: number) => Math.round((min / maks) * 170);

  // ---- Fordeling ----
  const omr = perOmrade(iVindu);
  const oMaks = Math.max(1, ...omr.map((o) => o.planlagtMin));

  // ---- Neste og siste økter (gruppeøkter) ----
  const mine = alleOkter.filter((o) => ids.includes(o.elevId));
  const slots = gruppeokter(mine);
  const neste = slots.filter((g) => !erForfalt(g, naa)).slice(0, 3);
  const siste = slots.filter((g) => g.dato >= fra && erForfalt(g, naa)).slice(-5).reverse();

  // ---- Elevliste ----
  const elevRader = elev
    ? []
    : elever
        .map((e) => ({ e, s: summer(iVindu.filter((o) => o.elevId === e.id), naa) }))
        .sort((a, b) => (a.s.etterlevelse ?? 2) - (b.s.etterlevelse ?? 2));

  return (
    <div className={s.stabel}>
      {hode}
      {erDemo ? <WangDemoMerknad /> : null}

      <section className={`${s.kort} ${s.kpi}`} aria-label="Nøkkeltall siste fire uker">
        {kpi.map((k) => (
          <div key={k.etikett}>
            <span className={s.meta}>{k.etikett}</span>
            <span className={s.kpiVerdi} style={{ fontWeight: k.vekt }}>{k.verdi}</span>
            <span className={s.kpiHint}>{k.hint}</span>
          </div>
        ))}
      </section>

      <div className={s.split} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))", gap: 24 }}>
        <section className={`${s.kort} ${s.kortPad}`}>
          <div className={s.kortHode} style={{ padding: 0 }}>
            <h2 className={s.h2}>Uke for uke</h2>
            <div className={`${s.forklaring} ${s.meta}`}>
              <span><span className={s.ruteTom} />Planlagt</span>
              <span><span className={s.ruteFull} />Gjennomført</span>
            </div>
          </div>
          <div className={s.ukegraf} role="img" aria-label={uker.map((u) => `Uke ${u.uke}: ${timer(u.sum.planlagtMin / n)} timer planlagt, ${timer(u.sum.gjennomfortMin / n)} timer gjennomført`).join(". ")}>
            {uker.map((u) => (
              <div key={u.mandag} className={s.ukeKol}>
                <div className={s.ukeStolpe}>
                  <span className={s.tall} style={{ fontSize: 12, color: "var(--wtr-blue)" }}>{timer(u.sum.planlagtMin / n)}</span>
                  <div className={s.stolpePlan} style={{ height: hoyde(u.sum.planlagtMin) }} />
                </div>
                <div className={s.ukeStolpe}>
                  <span className={s.tall} style={{ fontSize: 12, fontWeight: 500, color: "var(--wtr-blue)" }}>{timer(u.sum.gjennomfortMin / n)}</span>
                  <div className={s.stolpeGjort} style={{ height: hoyde(u.sum.gjennomfortMin) }} />
                </div>
              </div>
            ))}
          </div>
          <div className={s.ukeEtiketter}>
            {uker.map((u) => (
              <div key={u.mandag}>
                <span className={s.ukeNavn}>Uke {u.uke}</span>
                <span className={s.tall} style={{ display: "block", fontSize: 11.5, color: "var(--wtr-text-muted)" }}>{ddmm(u.mandag)}–{ddmm(leggTilDager(u.mandag, 6))}</span>
              </div>
            ))}
          </div>
          <p className={s.brod}>Timer per uke. {elev ? "Uke " + uker[3].uke + " er inneværende uke." : "Snitt per elev."}</p>
        </section>

        <section className={`${s.kort} ${s.kortPad}`} style={{ gap: 14 }}>
          <div className={s.kortHode} style={{ padding: 0 }}>
            <h2 className={s.h2}>Fordeling på områder</h2>
            <span className={s.meta}>Tynn kant planlagt · fylt gjennomført</span>
          </div>
          {omr.map((o) => (
            <div key={o.omrade} className={`${s.omrRad} ${omradeKlasse(o.omrade, "tr")}`}>
              <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span className={s.omrKode}>{o.omrade}</span>
                <span className={s.omrNavn}>{OMRADE_NAVN[o.omrade]}</span>
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                <div className={s.omrBarPlan} style={{ width: `${Math.round((o.planlagtMin / oMaks) * 100)}%` }} />
                <div className={s.omrBarGjort} style={{ width: `${Math.round((o.gjennomfortMin / oMaks) * 100)}%` }} />
                <span className={s.tall} style={{ fontSize: 12, color: "var(--wtr-blue)" }}>
                  {o.planlagtMin ? `${timer(o.gjennomfortMin / n)} av ${timer(o.planlagtMin / n)} t` : "Ikke planlagt"}
                </span>
              </div>
            </div>
          ))}
        </section>
      </div>

      <div className={s.split} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))", gap: 24 }}>
        <section className={s.kort}>
          <div className={s.kortHode}>
            <h2 className={s.h2}>Neste tre økter</h2>
            <Pillenke href={wangHref("WANG-18")}>Kalender</Pillenke>
          </div>
          {neste.length === 0 ? <p className={s.rad} style={{ margin: 0, display: "block", color: "var(--wtr-text-muted)" }}>Ingen planlagte økter de neste tre ukene.</p> : null}
          {neste.map((g) => (
            <div key={g.key} className={s.rad}>
              <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                <span className={s.radTittel}>{g.tittel}</span>
                <span className={s.metaTall}>{[dagOgDato(g.dato), tidsrom(g.startMin, g.varighetMin), g.sted].filter(Boolean).join(" · ")}</span>
              </div>
              <div className={s.radHoyre}>
                {g.omrader.map((o) => (
                  <span key={o} className={`${s.omrMerke} ${omradeKlasse(o, "tr")}`}><Omradeprikk omrade={o} palett="tr" />{o}</span>
                ))}
                <Pillenke href={oktHref(g.okter[0].id)} ariaLabel={`Åpne økten ${g.tittel}`}>Åpne</Pillenke>
              </div>
            </div>
          ))}
        </section>

        <section className={s.kort}>
          <div className={s.kortHode}><h2 className={s.h2}>Siste økter</h2></div>
          {siste.length === 0 ? <p className={s.rad} style={{ margin: 0, display: "block", color: "var(--wtr-text-muted)" }}>Ingen økter med passert sluttid i perioden.</p> : null}
          {siste.map((g) => {
            const omrTekst = g.omrader.join(", ");
            if (elev) {
              const o = g.okter[0];
              const st = elevStatus(o);
              return (
                <div key={g.key} className={s.rad}>
                  <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                    <span className={s.radTittel}>{g.tittel}</span>
                    <span className={s.metaTall}>{[dagOgDato(g.dato), tidsrom(g.startMin, g.varighetMin), omrTekst].filter(Boolean).join(" · ")}</span>
                    <span className={s.meta} style={{ color: "var(--wtr-blue)", fontWeight: 400 }}>{`${timer(o.varighetMin)} t`}</span>
                  </div>
                  <WangStatus tone={st.tone}>{st.tekst}</WangStatus>
                </div>
              );
            }
            const gjort = g.okter.filter(erGjennomfort).length;
            const nei = g.okter.filter(erAvvist).length;
            const ikkeFort = g.okter.length - gjort - nei;
            return (
              <div key={g.key} className={s.rad}>
                <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                  <span className={s.radTittel}>{g.tittel}</span>
                  <span className={s.metaTall}>{[dagOgDato(g.dato), tidsrom(g.startMin, g.varighetMin), omrTekst].filter(Boolean).join(" · ")}</span>
                  <span className={s.meta} style={{ color: "var(--wtr-blue)", fontWeight: 400 }}>{`${gjort} gjennomført · ${nei} ikke gjennomført · ${ikkeFort} ikke ført`}</span>
                </div>
                <span />
              </div>
            );
          })}
        </section>
      </div>

      {!elev ? (
        <section className={s.kort}>
          <div className={s.kortHode} style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
            <h2 className={s.h2}>Elever i {gruppe.name}</h2>
            <span className={s.meta}>Lavest etterlevelse først</span>
          </div>
          <WangTabell
            beskrivelse={`Elever i ${gruppe.name}`}
            kolonner={[
              { key: "elev", etikett: "Elev", bredde: "minmax(0,1.6fr)", helBredde: true },
              { key: "etter", etikett: "Etterlevelse", tall: true },
              { key: "morgen", etikett: "Oppmøte morgen", tall: true },
              { key: "apne", etikett: "", bredde: "auto" },
            ]}
            rader={elevRader.map(({ e, s: es }) => ({
              id: e.id,
              celler: {
                elev: <span style={{ fontFamily: "var(--wtr-font-display)", fontSize: 15, fontWeight: 500, color: "var(--wtr-blue)" }}>{e.navn}</span>,
                etter: <span style={{ fontSize: 15, color: "var(--wtr-blue)" }}>{prosent(es.etterlevelse)}<span style={{ fontSize: 12, color: "var(--wtr-text-muted)" }}> etterlevelse</span></span>,
                morgen: <span style={{ fontSize: 15, color: "var(--wtr-blue)" }}>{prosent(es.morgenAndel)}<span style={{ fontSize: 12, color: "var(--wtr-text-muted)" }}> morgen</span></span>,
                apne: (
                  <span style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <Pillenke href={wangHref("WANG-42", {}, { elev: e.id })} ariaLabel={`Åpne oversikten til ${e.navn}`}>Åpne</Pillenke>
                    <Pillenke href={elevprofilHref(e.id)} ariaLabel={`Elevprofilen til ${e.navn}`}>Profil</Pillenke>
                  </span>
                ),
              },
            }))}
          />
        </section>
      ) : null}

      <p className={s.fot}>
        Eleven registrerer gjennomføring i PlayerHQ. Etterlevelse er gjennomført tid delt på planlagt tid for økter med passert sluttid. Økter etter i dag teller ikke. Oppmøte morgentrening er andelen gjennomførte økter som starter før kl. 10.
      </p>
    </div>
  );
}

function ingenEleverTekst(antall: number): string | null {
  return antall === 0 ? "Gruppa har ingen aktive elever ennå. Elevene kommer inn når de legges til i gruppa." : null;
}

function elevStatus(o: WangOkt): { tone: WangStatusTone; tekst: string } {
  if (erGjennomfort(o)) return { tone: "ferdig", tekst: "Gjennomført" };
  if (erAvvist(o)) return { tone: "fravaer", tekst: "Ikke gjennomført" };
  return { tone: "planlagt", tekst: "Ikke ført" };
}
