/** Prøvefil for AG-20 Økonomi. Syntetiske data, ingen ekte tall. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG20Okonomi, type AG20Tilstand } from "@/components/admin/precision/AG20Okonomi";
import type { AdminOkonomiV2Data } from "@/lib/admin/okonomi-data";

export const sti = "/admin/agencyos/okonomi";

const data: AdminOkonomiV2Data = {
  aar: 2026,
  visKroner: true,
  visRapporter: true,
  tripletexKonfigurert: true,
  ytd: { budsjettKr: 1_250_000, resultatKr: 980_500 },
  fakturaer: [
    { id: "f1", navn: "Ola Nordmann", beskrivelse: "Coaching privat", dato: "24.09", belopKr: 950, status: "Betalt" },
    { id: "f2", navn: "Kari Hansen", beskrivelse: "Abonnement Performance med et langt navn som må brytes pent", dato: "20.09", belopKr: 690, status: "Forfalt" },
    { id: "f3", navn: "Per Olsen", beskrivelse: "Gruppetime", dato: "18.09", belopKr: 350, status: "Sendt" },
  ],
  timeklipp: [
    { id: "t1", navn: "Ola Nordmann", fornavn: "Ola", brukt: 1, totalt: 2 },
    { id: "t2", navn: "Kari Hansen", fornavn: "Kari", brukt: 3, totalt: 4 },
  ],
  stripeHref: "#",
  rapporter: null,
  hull: { invoiceModell: false, bookingTilFaktura: false, budsjettkilde: false },
};

const tom: AdminOkonomiV2Data = { ...data, tripletexKonfigurert: false, fakturaer: [], timeklipp: [], ytd: { budsjettKr: null, resultatKr: null } };

const Vis = (t: AG20Tilstand, d: AdminOkonomiV2Data = data) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">
      <AG20Okonomi tilstand={t} data={d} />
    </AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = {
  data: Vis("data"),
  tom: Vis("tom", tom),
  laster: Vis("laster"),
  feil: Vis("feil"),
};
