import { Eye, EyeOff } from "lucide-react";

import { krevWangSportssjef } from "@/app/team-wang/_data/wang-trener-tilgang";
import { hentTrenere } from "@/app/team-wang/_data/wang-admin-data";
import { filtrerTrenere, lesTrenerFilter, skolearKort, type TrenerFilter, type TrenerRad } from "@/app/team-wang/_data/wang-admin-regler";
import { AdminUavklart } from "@/app/team-wang/_components/wang-admin-logginn/admin-ui";
import s from "@/app/team-wang/_components/wang-admin-logginn/admin.module.css";
import { WangChips, WangDemoMerknad, WangSide, WangSidehode, WangTom } from "@/components/wang/trener/wang-ui";
import { wangHref } from "@/lib/wang/wang-ruter";

/**
 * WANG-19 Trenere og roller. Fasit: «WANG Golf Batch 7.dc.html» (#trenere).
 * Bare Sportssjef. Data: GroupMember med rolle COACH/ASSISTANT i WANG-gruppen;
 * Sportssjef er gruppens hovedcoach (samme regel som porten).
 *
 * Avvik fra tegningen: tegningen har flere skoler og grupper per skole, og et
 * skjema for å legge til og endre roller. Basen har én WANG-gruppe og ingen
 * WANG-egen skrivehandling for trenerroller, så lista er til lesing.
 */
export default async function WangAdminTrenereSide({ searchParams }: { searchParams: Promise<{ filter?: string | string[] }> }) {
  const { gruppe, erDemo } = await krevWangSportssjef();
  const filter = lesTrenerFilter((await searchParams).filter);
  const { rader, aktiveElever } = await hentTrenere(gruppe.id);
  const synlige = filtrerTrenere(rader, filter);
  const skolear = skolearKort(new Date());
  const aktive = rader.filter((r) => r.aktiv).length;

  const filtre: Array<[TrenerFilter, string, number]> = [
    ["alle", "Alle", rader.length],
    ["aktive", "Aktive", aktive],
    ["avsluttet", "Uten aktive roller", rader.length - aktive],
  ];

  return (
    <WangSide>
      <WangSidehode skjermId="WANG-19" undertittel={`${gruppe.name} · Skoleåret ${skolear}`} tittel="Trenere og roller" />
      {erDemo ? <WangDemoMerknad /> : null}
      <div className={s.stabel}>
        <p className={s.brodtekst}>
          Rollen settes per gruppe, aldri på personen. Trener når elevene i gruppa så lenge rollen er aktiv. Lista viser bare roller i {gruppe.name}.
        </p>
        <AdminUavklart>Hvem som fører dette ved skolen er ikke avklart. Foreløpig står skjermen for sportssjef.</AdminUavklart>
        {rader.length > 0 ? (
          <WangChips
            etikett="Filter"
            valg={filtre.map(([k, etikett, antall]) => ({
              href: k === "alle" ? wangHref("WANG-19") : wangHref("WANG-19", {}, { filter: k }),
              etikett: `${etikett} ·`,
              antall,
              aktiv: filter === k,
            }))}
          />
        ) : null}
        <section className={s.kort}>
          <div className={s.kortHode}>
            <h2 className={s.h2}>Trenere i {gruppe.name}</h2>
            <span className={s.telling}>{`${aktive} med aktive roller · ${rader.length} totalt`}</span>
          </div>
          {rader.length === 0 ? (
            <WangTom
              tittel="Ingen trenere er registrert i gruppen"
              tekst="Trenere legges til som trener i WANG-gruppen i AgencyOS. Når de står der, vises de her med rolle og dato."
            />
          ) : synlige.length === 0 ? (
            <p className={s.tomRad}>Ingen trenere i dette filteret.</p>
          ) : (
            synlige.map((p) => <TrenerArtikkel key={p.userId} p={p} gruppeNavn={gruppe.name} aktiveElever={aktiveElever} />)
          )}
        </section>
        <p className={s.smatekst}>Trenere legges til, endres og avsluttes i gruppen i AgencyOS. Egen føring i WANG er ikke bygget.</p>
      </div>
    </WangSide>
  );
}

function TrenerArtikkel({ p, gruppeNavn, aktiveElever }: { p: TrenerRad; gruppeNavn: string; aktiveElever: number }) {
  const naar = p.aktiv ? `Når ${gruppeNavn} · ${aktiveElever} ${aktiveElever === 1 ? "elev" : "elever"}` : "Ingen aktive roller · ser ingenting nå";
  return (
    <article className={s.person}>
      <div className={s.personTopp}>
        <span className={p.aktiv ? s.av : `${s.av} ${s.avAv}`} aria-hidden="true">{p.initialer}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className={s.personNavn}>{p.navn}</span>
          <span className={s.personKontakt}>{p.epost}</span>
        </span>
      </div>
      <p className={p.aktiv ? s.naar : `${s.naar} ${s.naarIngen}`}>
        {p.aktiv ? <Eye size={16} strokeWidth={1.5} aria-hidden="true" className={s.ikon} /> : <EyeOff size={16} strokeWidth={1.5} aria-hidden="true" className={s.ikon} />}
        <span style={{ minWidth: 0 }}>{naar}</span>
      </p>
      <div className={s.rrow}>
        <span className={s.rrowGruppe}>{gruppeNavn}</span>
        <span className={s.tagStor}>{p.bareInnsyn ? `${p.rolle} · innsyn` : p.rolle}</span>
        <span className={`${s.dato} ${s.full}`}>{p.til ? `${p.fra}–${p.til}` : `Fra ${p.fra}`}</span>
        <span className={`${s.st} ${s.full}`}>
          <span className={`${s.dot} ${p.aktiv ? s.dAktiv : s.dUtlopt}`} aria-hidden="true" />
          {p.aktiv ? "Aktiv" : `Avsluttet ${p.til ?? ""}`.trim()}
        </span>
      </div>
    </article>
  );
}
