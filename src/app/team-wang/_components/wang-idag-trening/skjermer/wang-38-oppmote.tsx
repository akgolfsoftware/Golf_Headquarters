import Link from "next/link";

import { hentElevOkter, hentGruppeElever } from "@/app/team-wang/_data/wang-idag-trening-data";
import {
  dagOgDato,
  ddmm,
  erAvvist,
  erForfalt,
  erGjennomfort,
  forsteVerdi,
  gruppeokter,
  isoUke,
  leggTilDager,
  mandagI,
  osloIso,
  perUke,
  summer,
  tidsrom,
} from "@/app/team-wang/_data/wang-trening-beregning";
import { Chips, Sidehode, it as s, lastTrygt } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import type { WangSkjermKontekst } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import { WangDemoMerknad, WangFeil, WangKnapp, WangStatus, WangTom } from "@/components/wang/trener/wang-ui";
import { elevprofilHref, wangHref } from "@/lib/wang/wang-ruter";

type Sok = { visning?: string | string[]; uker?: string | string[]; okt?: string | string[] };

const andel = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)} %` : "—");

/** WANG-38 Oppmøte. Fasit: «WANG Golf Batch 14.dc.html» #oppmote (6cfa623c). Rute: /team-wang/trening/oppmote */
export async function WangOppmote({ gruppe, erDemo, sok }: WangSkjermKontekst & { sok: Sok }) {
  const naa = new Date();
  const idag = osloIso(naa);
  const oversikt = forsteVerdi(sok.visning) === "oversikt";
  const antallUker = forsteVerdi(sok.uker) === "8" ? 8 : 4;
  const mandag = mandagI(idag);
  const mandager = Array.from({ length: antallUker }, (_, i) => leggTilDager(mandag, (i - antallUker + 1) * 7));
  const fra = mandager[0];

  const last = await lastTrygt(async () => {
    const elever = await hentGruppeElever(gruppe.id);
    return { elever, okter: await hentElevOkter(elever.map((e) => e.id), fra, leggTilDager(mandag, 6)) };
  });

  const deler = [
    { href: wangHref("WANG-38"), etikett: "Siste økt", aktiv: !oversikt },
    { href: wangHref("WANG-38", {}, { visning: "oversikt" }), etikett: "Oversikt", aktiv: oversikt },
  ];

  if (!last.ok) {
    return (
      <div className={s.stabel16} style={{ gap: 18 }}>
        <Sidehode meta={`WANG-38 · ${gruppe.name}`} tittel="Oppmøte" />
        <WangFeil tittel="Vi fikk ikke hentet oppmøtet." tekst="Registreringene er ikke borte. Prøv igjen om litt." handling={<WangKnapp href={wangHref("WANG-38")}>Prøv igjen</WangKnapp>} />
      </div>
    );
  }
  const { elever, okter } = last.data;
  const navn = new Map(elever.map((e) => [e.id, e.navn]));

  if (!oversikt) {
    const forfalte = gruppeokter(okter).filter((g) => erForfalt(g, naa));
    const valgt = forfalte.find((g) => g.key === forsteVerdi(sok.okt)) ?? forfalte.at(-1) ?? null;
    const siste = forfalte.slice(-4).reverse();
    return (
      <div className={s.stabel16} style={{ gap: 18 }}>
        <Sidehode meta={`WANG-38 · ${gruppe.name} · føring`} tittel="Oppmøte" />
        {erDemo ? <WangDemoMerknad /> : null}
        <Chips valg={deler} etikett="Visning" />
        {!valgt ? (
          <section className={s.kort}>
            <WangTom tittel="Ingen økter å føre oppmøte for." tekst={`Gruppa har ingen økter med passert sluttid de siste ${antallUker} ukene.`} />
          </section>
        ) : (
          <>
            {siste.length > 1 ? <Chips etikett="Økt" valg={siste.map((g) => ({ href: wangHref("WANG-38", {}, { okt: g.key }), etikett: `${dagOgDato(g.dato)} ${tidsrom(g.startMin, g.varighetMin).slice(0, 5)}`, aktiv: g.key === valgt.key }))} /> : null}
            <section className={`${s.kort} ${s.kortSkjult}`}>
              <div style={{ padding: "14px 20px", display: "flex", flexWrap: "wrap", gap: "8px 12px", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ minWidth: 0 }}>
                  <h2 className={s.h2}>{valgt.tittel}</h2>
                  <span className={s.tall} style={{ fontSize: 12.5, fontWeight: 500, color: "var(--wtr-text-muted)" }}>{dagOgDato(valgt.dato)} · {tidsrom(valgt.startMin, valgt.varighetMin)}{valgt.sted ? ` · ${valgt.sted}` : ""}</span>
                </div>
                <span className={s.tall} style={{ fontSize: 14, fontWeight: 700, color: "var(--wtr-blue)" }}>
                  {valgt.okter.filter(erGjennomfort).length} av {valgt.okter.length} til stede
                </span>
              </div>
              {[...valgt.okter]
                .sort((a, b) => (navn.get(a.elevId) ?? "").localeCompare(navn.get(b.elevId) ?? "", "nb"))
                .map((o) => (
                  <div key={o.id} className={s.orow} style={{ gridTemplateColumns: "minmax(0,1fr) auto" }}>
                    <span style={{ minWidth: 0, display: "grid", gap: 1 }}>
                      <Link href={elevprofilHref(o.elevId)} className={s.navnLenke} style={{ fontSize: 15 }}>{navn.get(o.elevId) ?? "Ukjent elev"}</Link>
                      <span style={{ fontSize: 13, color: "var(--wtr-text-muted)" }}>{o.omrade}</span>
                    </span>
                    {erGjennomfort(o) ? <WangStatus tone="ferdig">Til stede</WangStatus> : erAvvist(o) ? <WangStatus tone="fravaer">Borte</WangStatus> : <WangStatus tone="varsel">Ikke ført</WangStatus>}
                  </div>
                ))}
              <div style={{ padding: "14px 20px", borderTop: "1px solid var(--wtr-grey-line)" }}>
                <span style={{ fontSize: 14, lineHeight: 1.45, color: "var(--wtr-text-muted)" }}>
                  Oppmøtet kommer fra elevens registrering i PlayerHQ. Føring fra trener (til stede, sen, borte med kategori) lagres ikke i appen ennå.
                </span>
              </div>
            </section>
          </>
        )}
      </div>
    );
  }

  const periodeValg = [
    { href: wangHref("WANG-38", {}, { visning: "oversikt" }), etikett: "Siste fire uker", aktiv: antallUker === 4 },
    { href: wangHref("WANG-38", {}, { visning: "oversikt", uker: "8" }), etikett: "Siste åtte uker", aktiv: antallUker === 8 },
  ];
  const trendUker = mandager.slice(-4);
  const rader = elever
    .map((e) => {
      const mine = okter.filter((o) => o.elevId === e.id);
      const sum = summer(mine, naa);
      return { e, sum, uker: perUke(mine, trendUker, naa) };
    })
    .sort((a, b) => (a.sum.antallForfalt ? a.sum.antallGjennomfort / a.sum.antallForfalt : 2) - (b.sum.antallForfalt ? b.sum.antallGjennomfort / b.sum.antallForfalt : 2));

  return (
    <div className={s.stabel16} style={{ gap: 18 }}>
      <Sidehode meta={`WANG-38 · ${gruppe.name} · ${ddmm(fra)}–${ddmm(leggTilDager(mandag, 6))}`} tittel="Oppmøte" />
      {erDemo ? <WangDemoMerknad /> : null}
      <Chips valg={deler} etikett="Visning" />
      <Chips valg={periodeValg} etikett="Periode" />
      {rader.length === 0 ? (
        <section className={s.kort}><WangTom tittel="Ingen elever i gruppa." tekst="Oppmøtet vises når gruppa har aktive elever." /></section>
      ) : (
        <section className={`${s.kort} ${s.kortSkjult}`}>
          <div className={`${s.ovrow} ${s.thead}`}><span>Elev</span><span style={{ textAlign: "right" }}>Oppmøte</span><span>Økter</span><span>Siste fire uker</span></div>
          {rader.map(({ e, sum, uker }) => (
            <div key={e.id} className={s.ovrow}>
              <span style={{ minWidth: 0, display: "grid", gap: 1 }}>
                <Link href={elevprofilHref(e.id)} className={s.navnLenke} style={{ fontSize: 14.5 }}>{e.navn}</Link>
                <span style={{ fontSize: 13, color: "var(--wtr-text-muted)" }}>{sum.antallAvvist ? `${sum.antallAvvist} borte` : "Ingen fravær"}</span>
              </span>
              <span className={s.tall} style={{ fontSize: 20, fontWeight: 700, color: "var(--wtr-blue)", textAlign: "right" }}>{andel(sum.antallGjennomfort, sum.antallForfalt)}</span>
              <span className={`${s.tall} ${s.full}`} style={{ fontSize: 13, color: "var(--wtr-blue)" }}>{sum.antallGjennomfort} av {sum.antallForfalt} økter</span>
              <span className={`${s.trend} ${s.full}`} aria-label={uker.map((u) => `Uke ${u.uke}: ${andel(u.sum.antallGjennomfort, u.sum.antallForfalt)}`).join(", ")}>
                {uker.map((u) => {
                  const h = u.sum.antallForfalt ? (u.sum.antallGjennomfort / u.sum.antallForfalt) * 100 : 0;
                  return (
                    <span key={u.mandag} className={s.trendKol}>
                      <span className={s.trendBoks}><span className={s.trendFyll} style={{ height: `${h}%` }} /></span>
                      <span className={s.tall} style={{ fontSize: 11, color: "var(--wtr-text-muted)", textAlign: "center" }}>{u.uke} · {andel(u.sum.antallGjennomfort, u.sum.antallForfalt)}</span>
                    </span>
                  );
                })}
              </span>
            </div>
          ))}
        </section>
      )}
      <p className={s.fot}>Oppmøte er andelen økter med passert sluttid som eleven har registrert som gjennomført i PlayerHQ. Uke {isoUke(mandag)} er inneværende uke; økter som ikke er ferdige ennå, teller ikke.</p>
    </div>
  );
}
