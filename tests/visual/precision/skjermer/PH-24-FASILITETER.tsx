/** Prøvefil for PH-24 Fasiliteter i nytt design. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH24Fasiliteter } from "@/components/portal/precision/PH24Fasiliteter";
import { PH24MegFeil, PH24MegLaster } from "@/components/portal/precision/PH24MegTilstand";

export const sti = "/portal/meg/innstillinger/anlegg";

const lagre = async () => ({ ok: true });
const Skall = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;

export const tilstander = {
  data: <Skall><PH24Fasiliteter lagre={lagre} data={{
    tilgjengelig: ["DRIVING_RANGE", "SIMULATOR", "RADAR", "SHORT_GAME_AREA", "PUTTING_GREEN_KORT", "BANE", "KAMERA"],
    steder: [{ id: "1", navn: "Mulligan Indoor Golf, Fredrikstad", inne: true }, { id: "2", navn: "Gamle Fredrikstad Golfklubb, range og puttinggreen", inne: false }],
  }} /></Skall>,
  tom: <Skall><PH24Fasiliteter lagre={lagre} data={{ tilgjengelig: [], steder: [] }} /></Skall>,
  laster: <Skall><PH24MegLaster /></Skall>,
  feil: <Skall><PH24MegFeil tittel="Fasilitetene kunne ikke hentes" /></Skall>,
};
