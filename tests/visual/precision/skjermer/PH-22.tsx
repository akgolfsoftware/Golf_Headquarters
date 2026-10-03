/** Prøvefil for PH-22 Caddie-chat og Foreslå turnering. Syntetiske data, ingen ekte spillere. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH22Caddie, type PH22Props } from "@/components/portal/precision/PH22Caddie";
import { PH22Turneringsforslag } from "@/components/portal/precision/PH22Turneringsforslag";

export const sti = "/portal/coach/ai";
export const natt = ["data-natt", "tom-natt", "feil-natt", "turnering-natt"];

const base: PH22Props = {
  erGratis: false,
  sessionId: null,
  skrivTilHref: "#",
  initialMessages: [
    { role: "user", content: "Hvor mye har jeg trent denne uka?" },
    { role: "assistant", content: "Denne uka har du trent 14 t 30 min av 18 t planlagt. SLAG har fått mest tid, TURN har ingen timer ennå." },
    { role: "user", content: "Foreslå en turnering i oktober med et langt spørsmål som må brytes over flere linjer på smal skjerm" },
    { role: "assistant", content: "Junior-turnering i oktober passer nivået ditt. Se forslagene under Foreslå turnering." },
  ],
};
const Vis = (p: Partial<PH22Props>) => <PlayerHQSkall innboksHref="#" uleste={0}><PH22Caddie {...base} {...p} /></PlayerHQSkall>;
const forslag = [
  { id: "t1", href: "#", day: "10", month: "okt", badge: "Junior", statusLabel: "Anbefalt", statusTone: "recommended" as const, name: "Østlandstour Fredrikstad med et langt navn som må brytes", venue: "Gamle Fredrikstad GK", meta: ["Pott 12k USD"], why: "Junior-turnering i kalenderen — passer normalt nivået ditt. Vurder å melde deg på." },
  { id: "t2", href: "#", day: "17", month: "okt", badge: "Lokal", statusLabel: "Allerede påmeldt", statusTone: "enrolled" as const, name: "Klubbmesterskap", venue: null, meta: [], why: "Du er påmeldt denne. Forbered deg i god tid." },
];
const Tur = (s: typeof forslag) => <PlayerHQSkall innboksHref="#" uleste={0}><PH22Turneringsforslag hcpLabel="4,2" catalogCount={s.length} suggestions={s} /></PlayerHQSkall>;

export const tilstander = {
  data: <Vis />, "data-natt": <Vis />,
  tom: <Vis initialMessages={[]} />, "tom-natt": <Vis initialMessages={[]} />,
  feil: <Vis tilstand="feil" initialMessages={[]} />, "feil-natt": <Vis tilstand="feil" initialMessages={[]} />,
  pro: <Vis tilstand="pro" />,
  turnering: Tur(forslag), "turnering-natt": Tur(forslag), "turnering-tom": Tur([]),
};
