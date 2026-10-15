/** Prøvefil for PH-24 Foreldre i nytt design. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH24Foreldre } from "@/components/portal/precision/PH24Foreldre";
import { PH24MegFeil, PH24MegLaster } from "@/components/portal/precision/PH24MegTilstand";

export const sti = "/portal/meg/foreldre";

const Skall = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;

export const tilstander = {
  data: <Skall><PH24Foreldre data={{ under16: false, venterPaaForelder: false, foreldre: [
    { id: "p1", navn: "Hilde Rohjan", relasjon: "Mor", epost: "hilde.rohjan.med.lang.adresse@eksempel.no", godkjent: true, siden: "20. august 2025" },
  ] }} /></Skall>,
  "under-16": <Skall><PH24Foreldre data={{ under16: true, venterPaaForelder: true, foreldre: [
    { id: "p1", navn: "Hilde Rohjan", relasjon: "Mor", epost: "hilde@eksempel.no", godkjent: false, siden: "2. oktober 2026" },
  ] }} /></Skall>,
  tom: <Skall><PH24Foreldre data={{ under16: false, venterPaaForelder: false, foreldre: [] }} /></Skall>,
  laster: <Skall><PH24MegLaster /></Skall>,
  feil: <Skall><PH24MegFeil tittel="Foreldrene kunne ikke hentes" /></Skall>,
};
