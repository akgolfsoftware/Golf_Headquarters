/** Prøvefil for BK-02 Velg tid, opplysninger og betaling. Syntetiske data. */
import { BookingFlyt, type BkStart } from "@/components/booking/precision/BookingFlyt";
import { Natt } from "./_natt";
import { tjenester, abonnement, dager, ingenDager } from "./_bk-data";

export const sti = "/booking";
const flyt = (start: BkStart) =>
  <BookingFlyt tjenester={tjenester} abonnement={abonnement} lokasjon="Gamle Fredrikstad GK" start={start} hentDager={async () => dager} betal={async () => ({ ok: false, error: "x" })} />;

const tid: BkStart = { steg: 1, slug: "flex-50", dager };
const deg: BkStart = { ...tid, steg: 2, dag: "2.10", kl: "10:00" };
const betal: BkStart = { ...deg, steg: 3, navn: "Øyvind Rohjan", epost: "oyvind@eksempel.no", tlf: "911 22 110" };

export const tilstander = {
  uke: flyt(tid),
  ukeValgt: flyt({ ...tid, dag: "2.10", kl: "10:00" }),
  dag: flyt({ ...tid, dag: "2.10", kl: "10:00" }),
  tom: flyt({ ...tid, dager: ingenDager }),
  laster: flyt({ steg: 1, slug: "flex-50", dagerStatus: "laster" }),
  feil: flyt({ steg: 1, slug: "flex-50", dagerStatus: "feil" }),
  deg: flyt(deg),
  degBarn: flyt({ ...deg, barn: true }),
  bekreft: flyt(betal),
  bekreftFeil: flyt({ ...betal, sendefeil: "Tiden er ikke lenger ledig. Velg en annen tid." }),
  "uke-natt": <Natt>{flyt({ ...tid, dag: "2.10", kl: "10:00" })}</Natt>,
  "tom-natt": <Natt>{flyt({ ...tid, dager: ingenDager })}</Natt>,
  "laster-natt": <Natt>{flyt({ steg: 1, slug: "flex-50", dagerStatus: "laster" })}</Natt>,
  "feil-natt": <Natt>{flyt({ steg: 1, slug: "flex-50", dagerStatus: "feil" })}</Natt>,
  "deg-natt": <Natt>{flyt(deg)}</Natt>,
  "bekreft-natt": <Natt>{flyt({ ...betal, sendefeil: "Tiden er ikke lenger ledig. Velg en annen tid." })}</Natt>,
};
