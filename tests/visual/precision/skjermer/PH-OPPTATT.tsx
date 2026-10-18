/** Prøvefil for pakke 17b Opptatt tid. Syntetiske data, ingen database. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHOpptattTid, type PHOpptattData, type PHOpptattAvtale } from "@/components/portal/precision/PHOpptattTid";
import { byggUke } from "@/lib/portal-plan/opptatt-uke";

export const sti = "/portal/planlegge/opptatt";
const S = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;
const fra = new Date("2026-10-04T22:00:00Z"), til = new Date("2026-10-11T22:00:00Z");
const blokker = [
  { id: "s1", title: "Skole", startAt: new Date("2026-08-17T06:00:00Z"), endAt: new Date("2026-08-17T13:00:00Z"), recurring: "WEEKLY", isPrivate: false },
  { id: "s2", title: "Skole", startAt: new Date("2026-08-18T06:00:00Z"), endAt: new Date("2026-08-18T13:00:00Z"), recurring: "WEEKLY", isPrivate: false },
  { id: "p", title: "Privat avtale med et langt navn", startAt: new Date("2026-08-20T16:00:00Z"), endAt: new Date("2026-08-20T18:00:00Z"), recurring: "WEEKLY", isPrivate: true },
];
const dager = byggUke({
  mandag: "2026-10-05", idag: "2026-10-05", fra, til, blokker,
  okter: [
    { title: "Innspill", startTime: new Date("2026-10-05T13:30:00Z"), pyramidArea: "SLAG" },
    { title: "Økt A", startTime: new Date("2026-10-06T14:30:00Z"), pyramidArea: "FYS" },
    { title: "P6.0", startTime: new Date("2026-10-07T14:00:00Z"), pyramidArea: "TEK" },
    { title: "Samling", startTime: new Date("2026-10-10T08:00:00Z"), pyramidArea: "SPILL" },
  ],
  google: [{ startAt: new Date("2026-10-08T16:00:00Z"), endAt: new Date("2026-10-08T17:00:00Z"), allDay: false }],
});
const av = (id: string, tittel: string, under: string, o: Partial<PHOpptattAvtale> = {}): PHOpptattAvtale => ({ id, tittel, under, ukentlig: true, privat: false, startISO: "2026-08-17T06:00:00.000Z", sluttISO: "2026-08-17T13:00:00.000Z", kind: "SKOLE", ...o });
const data = (o: Partial<PHOpptattData> = {}): PHOpptattData => ({
  ukeNr: 41, ukeTekst: "5. okt.–11. okt.", forrigeHref: "#", nesteHref: "#", dager,
  avtaler: [av("s1", "Skole", "Mandag 08–15 · ukentlig"), av("p", "Privat avtale med et langt navn", "Torsdag 18–20 · ukentlig · coachen ser «Opptatt»", { privat: true }), av("h", "Høstferie", "12. okt. 08–18 · én gang", { ukentlig: false })],
  google: { epost: "spiller@example.com", synket: "5. okt. 14:12", beggeVeier: true, status: "ACTIVE" },
  ...o,
});
export const tilstander = {
  data: <S><PHOpptattTid data={data()} /></S>,
  tom: <S><PHOpptattTid data={data({ avtaler: [], google: null, dager: byggUke({ mandag: "2026-10-05", idag: "2026-10-05", fra, til, blokker: [], okter: [], google: [] }) })} /></S>,
};
