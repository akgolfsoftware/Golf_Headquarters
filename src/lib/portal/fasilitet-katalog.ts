/**
 * Anlegg og utstyr spilleren kan krysse av i Meg › Fasiliteter (PH-24).
 * Samme verdier som lagreFasilitetProfil godtar (GYLDIGE_FASILITETER i
 * src/app/portal/meg/innstillinger/actions.ts). Fargen følger aksen området trener.
 */
import type { DrillFasilitet } from "@/generated/prisma/client";

export type FasilitetAkse = "slag" | "tek" | "spill";
export type FasilitetValg = { kode: DrillFasilitet; tittel: string; hjelp: string };
export type FasilitetFamilie = { navn: string; akse: FasilitetAkse; valg: FasilitetValg[] };

export const FASILITET_FAMILIER: readonly FasilitetFamilie[] = [
  { navn: "Langt spill", akse: "slag", valg: [
    { kode: "DRIVING_RANGE", tittel: "Driving range", hjelp: "Ute, med lange slag" },
    { kode: "SIMULATOR", tittel: "Simulator", hjelp: "Innendørs bay med skjerm" },
    { kode: "MAT_NET", tittel: "Matte og nett", hjelp: "Hjemme, i garasje eller studio" },
    { kode: "RADAR", tittel: "Radar", hjelp: "TrackMan eller annen radar" },
  ] },
  { navn: "Nærspill og putting", akse: "slag", valg: [
    { kode: "SHORT_GAME_AREA", tittel: "Nærspillsområde", hjelp: "Chip, pitch og lob" },
    { kode: "BUNKER", tittel: "Bunker", hjelp: "Greenbunker eller fairwaybunker" },
    { kode: "PUTTING_GREEN_KORT", tittel: "Puttinggreen opptil 10 m", hjelp: "Korte putter" },
    { kode: "PUTTING_GREEN_LANG", tittel: "Puttinggreen 15 m og lengre", hjelp: "Lange putter" },
  ] },
  { navn: "Banespill", akse: "spill", valg: [
    { kode: "BANE", tittel: "Banen", hjelp: "9 eller 18 hull" },
  ] },
  { navn: "Teknikk", akse: "tek", valg: [
    { kode: "KAMERA", tittel: "Kamera og stativ", hjelp: "Video av svingen" },
  ] },
];

export const ANTALL_FASILITETER = FASILITET_FAMILIER.reduce((n, f) => n + f.valg.length, 0);
