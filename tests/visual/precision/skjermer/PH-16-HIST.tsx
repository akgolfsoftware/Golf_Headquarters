/** Prøvefil for Stats › Historikk (pakke 13). Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH16eHistorikk, type HistorikkRad } from "@/components/portal/precision/PH16eHistorikk";
import { TmLaster } from "@/components/portal/precision/PH17TmFelles";
import { SdFeil } from "@/components/portal/precision/PHStatsDybdeFelles";

export const sti = "/portal/analysere/historikk";

const r = (id: string, type: HistorikkRad["type"], dag: string, ukedag: string, maaned: string, dagerSiden: number, navn: string, meta: string[], akse: HistorikkRad["akse"], verdi: string, verdiTekst: string, href: string | null = null, sg: number | null = null): HistorikkRad => ({
  id, type, dag, ukedag, maaned, dagerSiden, iSesong: true, navn, meta, akse, akser: akse ? [akse] : [], verdi, verdiTekst, sg, href,
});
const rader: HistorikkRad[] = [
  r("1", "runde", "4", "lør", "Oktober 2026", 1, "Runde · Gamle Fredrikstad Golfklubb", ["Par 72", "SG +0,45"], null, "72", "brutto", "/portal/mal/runder/1", 0.45),
  r("2", "okt", "3", "fre", "Oktober 2026", 2, "Innspill 100–150 m, stigen med tre mål", ["Golf", "4 øvelser"], "slag", "75", "min"),
  r("3", "trackman", "2", "tor", "Oktober 2026", 3, "TrackMan · 7-jern", ["Simulator"], "slag", "42", "slag", "/portal/trackman/3"),
  r("4", "okt", "1", "ons", "Oktober 2026", 4, "Styrke, underkropp", ["Fysisk", "6 øvelser"], "fys", "55", "min"),
  r("5", "test", "28", "man", "September 2026", 7, "Club Speed", ["Test"], "fys", "108,4", "resultat"),
  r("6", "runde", "27", "søn", "September 2026", 8, "Runde · Onsøy GK", ["Par 71"], null, "74", "brutto", "/portal/mal/runder/6", -1.2),
  r("7", "test", "24", "tor", "September 2026", 11, "Wedge Gate", ["Test"], "slag", "6", "resultat"),
  r("8", "okt", "21", "man", "September 2026", 14, "Svingtrening P6.0–P7.0", ["Golf", "3 øvelser"], "tek", "60", "min"),
];

const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}>{n}</PlayerHQSkall>;
export const tilstander = {
  data: skall(<PH16eHistorikk rader={rader} />),
  tom: skall(<PH16eHistorikk rader={[]} />),
  laster: skall(<TmLaster tekst="Henter historikken" />),
  feil: skall(<SdFeil tittel="Historikken kunne ikke hentes" tekst="Øktene, rundene og testene dine er trygge. Prøv igjen om litt." reset={() => {}} />),
};
