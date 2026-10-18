/**
 * Coachens neste økt i dag, til kortet i AgencyOS-menyen (beslutninger.md
 * §AGENCYOS-MENYEN BLIR VARIANT C, punkt 3). Ren funksjon: tar en booking og
 * gir kortets tekst. Hentingen skjer i /api/admin/neste-okt.
 *
 * Aksen leses bare når tjenestenavnet eller notatet sier den. Ellers er den null,
 * og kortet blir grafitt i stedet for en gjettet aksefarge.
 */

export type NesteOktAkse = "fys" | "tek" | "slag" | "spill" | "turn";

export type NesteOktKort = {
  /** «09:00», norsk tid. */
  tid: string;
  /** «09» og «00» hver for seg, til ikonmenyen. */
  time: string;
  minutt: string;
  spiller: string;
  /** «TEK · Teknikk · Studio 1»; tomme deler utelates. */
  meta: string;
  akse: NesteOktAkse | null;
  href: string;
};

export type NesteOktBooking = {
  id: string;
  startAt: Date;
  notes: string | null;
  guestName: string | null;
  user: { name: string | null } | null;
  serviceType: { name: string } | null;
  location: { name: string } | null;
  facility: { name: string } | null;
};

const klokke = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit", hour12: false });

/** Samme ordliste som Cockpit, men uten standardakse når ingenting treffer. */
export function akseFraTekst(tekst: string): NesteOktAkse | null {
  const t = tekst.toLowerCase();
  if (/(turnering|konkurranse|cup|tour\b)/.test(t)) return "turn";
  if (/(fys|styrke|kondisjon|mobilitet)/.test(t)) return "fys";
  if (/(putt|teknikk|sekvens|p[0-9]|gripp|sving)/.test(t)) return "tek";
  if (/(innspill|wedge|chip|pitch|bunker|jern|driver|utslag|range)/.test(t)) return "slag";
  if (/(\bspill|simulering|runde|bane|9-hull|18-hull)/.test(t)) return "spill";
  return null;
}

export function lagNesteOktKort(b: NesteOktBooking): NesteOktKort {
  const deler = klokke.formatToParts(b.startAt);
  const time = deler.find((d) => d.type === "hour")?.value ?? "—";
  const minutt = deler.find((d) => d.type === "minute")?.value ?? "—";
  const tjeneste = b.serviceType?.name ?? null;
  const akse = akseFraTekst(`${tjeneste ?? ""} ${b.notes ?? ""}`);
  const sted = [b.location?.name, b.facility?.name].filter(Boolean).join(" · ");
  const meta = [akse?.toUpperCase(), tjeneste, sted].filter(Boolean).join(" · ");
  return {
    tid: `${time}:${minutt}`,
    time,
    minutt,
    spiller: b.user?.name ?? b.guestName ?? "Gjest",
    meta,
    akse,
    href: `/admin/gjennomfore/okter/${b.id}`,
  };
}
