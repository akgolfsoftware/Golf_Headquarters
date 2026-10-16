import { AkseMerke, AKSE_NAVN, Meta } from "@/components/precision/pa";
import { Etikett, Liste, Rad, Stolpe, TallFlis, Verdi } from "@/components/precision/pa-spiller360";
import { desimal } from "@/lib/admin-spiller/spiller360-visning";
import type { Treningsvolum } from "@/lib/workbench/treningsvolum";

/** Samme registreringsgrunnlag i Stats og IUP; ukjent tid blir aldri null minutter. */
export function TreningsvolumVisning({ volum, enhet = "min" }: { volum: Treningsvolum; enhet?: "min" | "t" }) {
  const { total } = volum;
  const tid = (minutter: number | null) => minutter == null ? "—" : desimal(
    enhet === "t" ? minutter / 60 : minutter,
    enhet === "t" || !Number.isInteger(minutter) ? 1 : 0,
  );
  const maks = Math.max(1, ...volum.akser.flatMap((a) => [a.planlagtMinutter, a.faktiskMinutter ?? 0]));
  const forfalte = total.forventetRegistreringOkter;
  const prosent = forfalte > 0 && total.ugyldigTidOkter === 0 ? total.faktiskRegistrerteOkter / forfalte * 100 : null;
  const registreringsgrad = prosent == null ? null : prosent > 0 && prosent < 1 ? "<1" : prosent > 99 && prosent < 100 ? ">99" : Math.round(prosent);
  const delvis = total.faktiskMinutter != null && (total.faktiskRegistrerteOkter < forfalte || total.ugyldigTidOkter > 0);
  return <>
    <div className="a8-tall-rutenett">
      <TallFlis k="Planlagt" v={tid(total.planlagtMinutter)} enhet={enhet} kilde="HELE VALGT SPENN · INKLUDERER KOMMER" />
      <TallFlis k="Faktisk registrert" v={tid(total.faktiskMinutter)} enhet={total.faktiskMinutter != null ? enhet : null} kilde={delvis ? "DELVIS REGISTRERING" : "BARE REGISTRERT TID"} />
      <TallFlis k="Registreringsgrad" v={registreringsgrad ?? "—"} enhet={registreringsgrad != null ? "%" : null} kilde={`${total.faktiskRegistrerteOkter} AV ${forfalte} ØKTER · FERDIGE ELLER SKULLE VÆRT FERDIGE`} />
      <TallFlis k="Fullførte økter" v={`${total.gjennomforteOkter} / ${total.planlagteOkter}`} kilde="ØKTSTATUS · TID KAN MANGLE" />
    </div>
    {delvis && <Meta>DELVIS REGISTRERING · FAKTISK TID ER SUMMEN AV REGISTRERTE ØKTER.</Meta>}
    {total.ugyldigTidOkter > 0 && <Meta>{total.ugyldigTidOkter} ØKTER HAR UGYLDIG TID. RETT KLOKKESLETT ELLER VARIGHET I PLANEN. PLANEN ER MED; FAKTISK TID OG REGISTRERINGSGRAD KAN IKKE BEREGNES FOR DISSE ØKTENE.</Meta>}
    <Liste>{volum.akser.map((a) => <Stolpe key={a.akse}
      merke={<AkseMerke axis={a.akse} size="sm" />}
      andel={(a.faktiskMinutter ?? 0) / maks} plan={a.planlagtMinutter / maks}
      verdi={`${tid(a.faktiskMinutter)} / ${tid(a.planlagtMinutter)} ${enhet}`} />)}</Liste>
    <Meta>FAKTISK / PLAN · STREKEN ER PLANEN · — = IKKE REGISTRERT · 0 = REGISTRERT NULL</Meta>
    <Liste>{volum.akser.map((a) => <Rad key={a.akse}>
      <Etikett a={AKSE_NAVN[a.akse]} sub={[
        `UKJENT ${a.ukjentOkter} ØKTER`,
        `KOMMER ${tid(a.framtidigPlanlagtMinutter)} ${enhet.toUpperCase()} · ${a.framtidigeOkter} ØKTER`,
        a.legacyAnslagMinutter != null ? `ESTIMAT ${tid(a.legacyAnslagMinutter)} ${enhet.toUpperCase()} · ${a.legacyAnslagOkter} ØKTER` : null,
        a.ikkeUtforteOkter > 0 ? `HOPPET OVER ${a.ikkeUtforteOkter} ØKTER` : null,
        a.avbrutteOkter > 0 ? `AVBRUTT ${a.avbrutteOkter} ØKTER` : null,
        a.ugyldigTidOkter > 0 ? `UGYLDIG TID ${a.ugyldigTidOkter} ØKTER` : null,
      ].filter(Boolean).join(" · ")} />
      <Verdi>{a.faktiskRegistrerteOkter} registrert</Verdi>
    </Rad>)}</Liste>
    {total.legacyAnslagMinutter != null && <Meta>ESTIMAT FRA ELDRE ØKTER: {tid(total.legacyAnslagMinutter)} {enhet.toUpperCase()} · IKKE FAKTISK TID</Meta>}
    {(total.ikkeUtforteOkter > 0 || total.avbrutteOkter > 0) && <Meta>HOPPET OVER {total.ikkeUtforteOkter} ØKTER · AVBRUTT {total.avbrutteOkter} ØKTER · UTELATT FRA REGISTRERINGSGRAD</Meta>}
    {volum.utenAkse.planlagteOkter > 0 && <Meta>{volum.utenAkse.planlagteOkter} ØKTER UTEN TRENINGSOMRÅDE ER MED I TOTALEN.</Meta>}
    <Meta>REGISTRERINGSGRAD TELLER ØKTER MED REGISTRERT TID. FULLFØRINGSGRAD SAMMENLIGNER TID MED PLANEN FOR ÉN ØKT.</Meta>
  </>;
}
