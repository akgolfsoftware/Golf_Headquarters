/** Prøvefil for pakke 16 Utfordringer (liste, én, ny). Syntetiske data (demo: Øyvind Rohjan), ingen ekte spillere. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHNyUtfordring, PHUtfordring, PHUtfordringer, type UtfDetalj, type UtfKort } from "@/components/portal/precision/PHUtfordringer";

export const sti = "/portal/utfordringer";

const aktive: UtfKort[] = [
  { id: "u1", navn: "8-ball, flest poeng", akse: "slag", ovelse: "8-ball", antall: 5, minPlass: 2, minScore: 31, slutter: "11. okt.", avsluttetDato: null },
  { id: "u2", navn: "Et veldig langt utfordringsnavn som må brytes på smal skjerm uten å sprenge kortet", akse: "spill", ovelse: "Færrest putter, 18 hull", antall: 4, minPlass: null, minScore: null, slutter: null, avsluttetDato: null },
  { id: "u3", navn: "Fri utfordring", akse: null, ovelse: null, antall: 2, minPlass: 1, minScore: 12, slutter: null, avsluttetDato: null },
];
const avsluttede: UtfKort[] = [{ id: "u4", navn: "Wedge til tre lengder", akse: "slag", ovelse: null, antall: 6, minPlass: 1, minScore: 20, slutter: null, avsluttetDato: "27. sep." }];
const detalj = (o: Partial<UtfDetalj> = {}): UtfDetalj => ({
  navn: "8-ball, flest poeng", beskrivelse: "Beste forsøk teller. Spill fra chippinggreen, 15 m.", eierNavn: "Øyvind Rohjan", ovelse: "8-ball", akse: "slag",
  avsluttet: false, periode: "man. 28. sep.–søn. 11. okt.", erEier: true, erDeltaker: true, higherIsBetter: true, minScore: 31, minNotes: null,
  deltakere: [
    { id: "p1", navn: "Selma Ruud", erMeg: false, rank: 1, score: 34, notes: "Vind fra venstre." },
    { id: "p2", navn: "Øyvind Rohjan", erMeg: true, rank: 2, score: 31, notes: null },
    { id: "p3", navn: "Jonas Berg", erMeg: false, rank: 3, score: 28.5, notes: null },
    { id: "p4", navn: "Emma Haug", erMeg: false, rank: null, score: null, notes: null },
  ], ...o,
});
const h = { avslutt: async () => {}, registrerScore: async () => {} };
const S = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;
const valg = [
  { id: "g1", navn: "Selma Ruud", kilde: "WANG Toppidrett", grupper: ["WANG Toppidrett"] },
  { id: "g2", navn: "Jonas Berg", kilde: "WANG Toppidrett · AK Golf Academy", grupper: ["WANG Toppidrett", "AK Golf Academy"] },
  { id: "g3", navn: "Tiril Hansen", kilde: "AK Golf Academy", grupper: ["AK Golf Academy"] },
];
const ovelser = [{ id: "o1", navn: "8-ball", akse: "slag" as const, higherIsBetter: true }, { id: "o2", navn: "Færrest putter", akse: "spill" as const, higherIsBetter: false }, { id: "o3", navn: "Fri øvelse", akse: null, higherIsBetter: null }];

export const tilstander = {
  liste: <S><PHUtfordringer aktive={aktive} avsluttede={avsluttede} kanOpprette /></S>,
  "liste-tom": <S><PHUtfordringer aktive={[]} avsluttede={[]} kanOpprette /></S>,
  "liste-gratis": <S><PHUtfordringer aktive={[]} avsluttede={[]} kanOpprette={false} /></S>,
  en: <S><PHUtfordring data={detalj()} handlinger={h} /></S>,
  "en-avsluttet": <S><PHUtfordring data={detalj({ avsluttet: true })} handlinger={h} /></S>,
  "en-lavest-fri": <S><PHUtfordring data={detalj({ akse: null, ovelse: null, higherIsBetter: false, erEier: false })} handlinger={h} /></S>,
  ny: <S><PHNyUtfordring deltakere={valg} grupper={["AK Golf Academy", "WANG Toppidrett"]} ovelser={ovelser} opprett={async () => {}} /></S>,
  "ny-tom": <S><PHNyUtfordring deltakere={[]} grupper={[]} ovelser={[]} opprett={async () => {}} /></S>,
};
