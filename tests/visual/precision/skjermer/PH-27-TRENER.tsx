/** Prøvefil for Del med trener (navngitt deling) i Skrå. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { NavngittDeling } from "@/components/portal/precision/navngitt-deling";

export const sti = "/portal/meg/deling";

const base = {
  spiller: { id: "s", name: "Syntetisk spiller" }, foresattVisning: false, kanGi: true,
  grupper: [{ id: "w", navn: "WANG Toppidrett Fredrikstad", domene: "wang.no" }], nesteSide: null,
  invitasjoner: [
    { id: "i1", gruppeNavn: "WANG Toppidrett Fredrikstad", epost: "kari.nordvik@wang.no", gittAvRolle: "SPILLER", opprettet: "2026-10-01T12:00:00Z", utlop: "2026-10-08T12:00:00Z", status: "AKTIV" },
    { id: "i2", gruppeNavn: "WANG Toppidrett Fredrikstad", epost: "eva.lund.med.et.langt.navn@wang.no", gittAvRolle: "SPILLER", opprettet: "2026-10-09T12:00:00Z", utlop: "2026-10-16T12:00:00Z", status: "VENTER" },
  ],
} as unknown as React.ComponentProps<typeof NavngittDeling>["initial"];
const tom = { ...base, invitasjoner: [] } as typeof base;
const Skall = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;

export const tilstander = {
  data: <Skall><NavngittDeling initial={base} skra /></Skall>,
  tom: <Skall><NavngittDeling initial={tom} skra /></Skall>,
  trener: <NavngittDeling initial={tom} erTrener />,
};
