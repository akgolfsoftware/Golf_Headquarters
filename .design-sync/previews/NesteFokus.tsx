import { NesteFokus } from "akgolf-hq-komponenter";

/** Dommen, ikke grafen: område, SG-tap som delta-chip, begrunnelse og én handling. */
export function Standard() {
  return (
    <NesteFokus
      omrade="Putting innenfor 6 ft er største lekkasje"
      akse="PUTT"
      sgTap="−1,2"
      baseline="Broadie scratch"
      begrunnelse="Innslagsprosenten på 3–6 ft ligger 7 pp under nivåkravet — det koster deg mest per runde."
      handlingTekst="Legg inn treningsøkt"
      handlingHref="/portal/planlegge"
    />
  );
}

/** «Én ting nå»-monopol på Analysere: full bredde, fill-farge, formel-hint ved siden av. */
export function EnTingNa() {
  return (
    <NesteFokus
      enTingNa
      omrade="Innspill 100–150 m koster mest"
      akse="APP"
      sgTap="−0,8"
      baseline="Broadie scratch"
      begrunnelse="52 % green i regulering fra 100–150 m mot 68 % for kategori A. Tre kravøkter per uke lukker gapet raskest."
      handlingTekst="Planlegg kravtrening"
      handlingHref="/portal/planlegge"
      formelAkse="SLAG · innspill"
    />
  );
}

/** Uten handling (galleri/lab): bare dommen og formel-hintet — ingen død knapp. */
export function UtenHandling() {
  return (
    <NesteFokus
      omrade="Nærspill fra 20–40 m er nest største lekkasje"
      akse="ARG"
      sgTap="−0,4"
      baseline="eget snitt 2025"
      begrunnelse="Lengdekontrollen spriker ±6 m — halvparten av slagene stopper utenfor 5 m."
      formelAkse="SLAG · pitch 20–40 m"
    />
  );
}

/** Uten SG-tall: kvalitativ dom fra coach — ingen delta-rad. */
export function UtenTall() {
  return (
    <NesteFokus
      omrade="Rutinen før slaget er ustabil under press"
      sgTap={null}
      begrunnelse="Coach-vurdering etter tre observerte turneringsrunder: tempo og blikk varierer når det står om noe."
      handlingTekst="Se øvelsene"
      handlingHref="/portal/planlegge"
      formelAkse="SPILL · rutine"
    />
  );
}
