import Link from "next/link";

import { hentElevOkter, hentGruppeElever } from "@/app/team-wang/_data/wang-idag-trening-data";
import {
  DAG_LANG,
  erUpublisert,
  ddmm,
  ddmmaaaa,
  gruppeokter,
  isoUke,
  leggTilDager,
  lesHeltall,
  mandagI,
  osloIso,
  tidsrom,
} from "@/app/team-wang/_data/wang-trening-beregning";
import { Chips, Sidehode, it as s, lastTrygt, oktHref } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import type { WangSkjermKontekst } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import { WangDemoMerknad, WangFeil, WangKnapp, WangTom } from "@/components/wang/trener/wang-ui";
import { wangHref } from "@/lib/wang/wang-ruter";

/** WANG-18 Kalender og økt (ukevisning). Fasit: «WANG Golf Batch 6.dc.html» #kalender (6cfa623c). Rute: /team-wang/trening/okter */
export async function WangOkter({ gruppe, erDemo, sok }: WangSkjermKontekst & { sok: { uke?: string | string[] } }) {
  const forskyvning = lesHeltall(sok.uke, 0, -26, 26);
  const idag = osloIso(new Date());
  const mandag = leggTilDager(mandagI(idag), forskyvning * 7);
  const fredag = leggTilDager(mandag, 4);
  const sondag = leggTilDager(mandag, 6);

  const meta = `WANG-18 · Kalender · ${gruppe.name}`;
  const ukeValg = [
    { href: wangHref("WANG-18", {}, { uke: String(forskyvning - 1) }), etikett: "Forrige uke", aktiv: false },
    { href: wangHref("WANG-18"), etikett: "Denne uka", aktiv: forskyvning === 0 },
    { href: wangHref("WANG-18", {}, { uke: String(forskyvning + 1) }), etikett: forskyvning === 0 ? "Neste uke" : `Uke ${isoUke(leggTilDager(mandag, 7))}`, aktiv: false },
  ];

  const last = await lastTrygt(async () => {
    const elever = await hentGruppeElever(gruppe.id);
    return hentElevOkter(elever.map((e) => e.id), mandag, sondag);
  });

  const hode = <Sidehode meta={meta} tittel="Økter" undertittel={`Uke ${isoUke(mandag)} · ${ddmm(mandag)}–${ddmmaaaa(sondag)}`} hoyre={<Chips valg={ukeValg} etikett="Uke" />} />;

  if (!last.ok) {
    return (
      <div className={s.stabel}>
        {hode}
        <WangFeil tittel="Vi fikk ikke hentet øktene." tekst="Planen er ikke borte. Prøv igjen om litt." handling={<WangKnapp href={wangHref("WANG-18", {}, forskyvning ? { uke: String(forskyvning) } : undefined)}>Prøv igjen</WangKnapp>} />
      </div>
    );
  }

  const slots = gruppeokter(last.data);
  const helg = slots.filter((g) => g.dato > fredag);
  const dager = Array.from({ length: 5 }, (_, i) => leggTilDager(mandag, i));

  return (
    <div className={s.stabel}>
      {hode}
      {erDemo ? <WangDemoMerknad /> : null}
      {slots.length === 0 ? (
        <section className={s.kort}>
          <WangTom tittel="Ingen økter denne uka." tekst="Elevene har ingen planlagte økter i uka. Økter planlegges i Workbench og vises her når de er publisert." handling={<WangKnapp href={wangHref("WANG-17")}>Se månedsplanen</WangKnapp>} />
        </section>
      ) : (
        <div className={s.dager5}>
          {dager.map((dato) => {
            const dagens = slots.filter((g) => g.dato === dato);
            return (
              <section key={dato} className={s.dag5} aria-label={`${DAG_LANG[dager.indexOf(dato)]} ${ddmm(dato)}`}>
                <p className={s.dagHode} style={{ fontSize: 14 }}>
                  <span>{DAG_LANG[dager.indexOf(dato)]}</span>
                  <span className={s.tall} style={{ color: "var(--wtr-text-muted)", fontSize: 13 }}>{ddmm(dato)}</span>
                </p>
                {dagens.map((g) => {
                  const kladd = g.okter.every(erUpublisert);
                  return (
                    <Link key={g.key} href={oktHref(g.okter[0].id)} className={s.okt18}>
                      <span className={s.tall} style={{ fontSize: 12, fontWeight: 500, color: "var(--wtr-text-muted)" }}>{tidsrom(g.startMin, g.varighetMin)}</span>
                      <span style={{ fontFamily: "var(--wtr-font-display)", fontSize: 14, fontWeight: 500, lineHeight: 1.3 }}>{g.tittel}</span>
                      <span style={{ fontSize: 13, color: "var(--wtr-text-muted)" }}>{[g.sted, `${g.okter.length} ${g.okter.length === 1 ? "elev" : "elever"}`].filter(Boolean).join(" · ")}</span>
                      <span style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
                        {g.omrader.map((o) => <span key={o} className={s.ptag}>{o}</span>)}
                        {kladd ? <span style={{ fontFamily: "var(--wtr-font-display)", fontSize: 11.5, fontWeight: 500, color: "var(--wtr-text-muted)", display: "flex", alignItems: "center" }}>Ikke publisert</span> : null}
                      </span>
                    </Link>
                  );
                })}
                {dagens.length === 0 ? <p className={s.fri} style={{ fontSize: 14 }}>Ingen økter.</p> : null}
              </section>
            );
          })}
        </div>
      )}
      {helg.length > 0 ? <p className={s.fot}>{helg.length} {helg.length === 1 ? "økt" : "økter"} i helgen vises i kalenderen under I dag.</p> : null}
    </div>
  );
}
