import { HjelpPopover } from "akgolf-hq-komponenter";

/** ?-ikonet med forklaringen åpen under (komponenten er statisk åpen). Standard: hva SG er. */
export function Standard() {
  return <HjelpPopover />;
}

/** Egen tittel og tekst: TrackMan-parametere på engelsk, forklart på norsk. */
export function Carry() {
  return (
    <HjelpPopover
      tittel="Carry eller Total?"
      tekst="Carry er lengden ballen flyr før den lander. Total tar med rullen. Planen bruker Carry, fordi det er den du styrer med svingen."
    />
  );
}

/** Smal variant (w=200) for mobil ved siden av et KPI-tall. */
export function Smal() {
  return <HjelpPopover w={200} tittel="Putt per runde" tekst="Snitt av alle putter på 18 hull. 28–34 er vanlig for en junior på ditt nivå." />;
}
