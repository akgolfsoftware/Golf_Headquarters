/** Prøvefil for PH-24 Fasiliteter i nytt design. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH24Fasiliteter } from "@/components/portal/precision/PH24Fasiliteter";
import { PH24MegFeil, PH24MegLaster } from "@/components/portal/precision/PH24MegTilstand";

export const sti = "/portal/meg/innstillinger/anlegg";

const lagre = async () => ({ ok: true });
const lagreOmrader = async () => ({ ok: true });
const Skall = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;

export const tilstander = {
  data: <Skall><PH24Fasiliteter lagre={lagre} lagreOmrader={lagreOmrader} data={{
    tilgjengelig: ["DRIVING_RANGE", "SIMULATOR", "RADAR", "SHORT_GAME_AREA", "PUTTING_GREEN_KORT", "BANE", "KAMERA"],
    steder: [{ id: "1", navn: "Mulligan Indoor Golf, Fredrikstad", inne: true }, { id: "2", navn: "Gamle Fredrikstad Golfklubb, range og puttinggreen", inne: false }],
    omrader: ["Utslag", "Innspill ca. 200 m", "Innspill ca. 150 m", "Innspill ca. 100 m", "Innspill ca. 50 m", "Chip", "Pitch", "Lob", "Putting 0–3 fot", "Putting 3–5 fot", "Putting 5–10 fot", "Putting 10–25 fot", "Putting 25–40 fot", "Styrke", "Kondisjon", "Bevegelighet", "Banespill"],
    omraderDato: "28. september",
  }} /></Skall>,
  tom: <Skall><PH24Fasiliteter lagre={lagre} lagreOmrader={lagreOmrader} data={{ tilgjengelig: [], steder: [], omrader: null }} /></Skall>,
  laster: <Skall><PH24MegLaster /></Skall>,
  feil: <Skall><PH24MegFeil tittel="Fasilitetene kunne ikke hentes" /></Skall>,
};
