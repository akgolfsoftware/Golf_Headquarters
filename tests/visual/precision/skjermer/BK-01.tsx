/** Prøvefil for BK-01 Velg tjeneste. Syntetiske data. */
import { BookingFlyt } from "@/components/booking/precision/BookingFlyt";
import { LasterTilstand } from "@/components/precision/pa";
import { BookingRamme } from "@/components/booking/precision/BookingRamme";
import BookingFeil from "@/app/(marketing)/booking/error";
import { Natt } from "./_natt";
import { tjenester, abonnement } from "./_bk-data";

export const sti = "/booking";
const flyt = (p: Partial<React.ComponentProps<typeof BookingFlyt>> = {}) =>
  <BookingFlyt tjenester={tjenester} abonnement={abonnement} lokasjon="Gamle Fredrikstad GK" {...p} />;

export const tilstander = {
  data: flyt(),
  valgt: flyt({ start: { steg: 0, slug: "flex-50" } }),
  utenAbonnement: flyt({ abonnement: [] }),
  tom: flyt({ tjenester: [], abonnement: [] }),
  laster: <BookingRamme><LasterTilstand text="Henter ledige tider …" /></BookingRamme>,
  feil: <BookingFeil error={Object.assign(new Error("x"), { digest: "0917" })} reset={() => {}} />,
  "data-natt": <Natt>{flyt({ start: { steg: 0, slug: "flex-50" } })}</Natt>,
  "tom-natt": <Natt>{flyt({ tjenester: [], abonnement: [] })}</Natt>,
  "feil-natt": <Natt><BookingFeil error={new Error("x")} reset={() => {}} /></Natt>,
};
