/** Prøvefil for PH-RD-03 Rediger slag på lagret runde (/portal/mal/runder/[id]/slag). Syntetiske data. Kartet er tomt (ingen banegeometri i prøven). */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHRD03RedigerSlag, type SlagData } from "@/components/portal/precision/PHRD03RedigerSlag";
import { RunderFeil } from "@/components/portal/precision/PHRunderFelles";
import { RunderLaster } from "@/components/portal/precision/PHRunderLaster";

export const sti = "/portal/mal/runder/syn-1/slag";

const s = (shotNumber: number, shotType: string, lie: string, club: string | null, distanceToPin: number | null, isPenalty = false): SlagData => ({
  id: `s${shotNumber}`, holeNumber: 1, holePar: 4, shotNumber, club, lie, distanceToPin, distanceHit: null, windDir: null,
  shotType, isPenalty, notes: null, startLat: null, startLng: null, endLat: null, endLng: null,
});
const slag: SlagData[] = [
  s(1, "DRIVE", "TEE", "Driver", 362), s(2, "APPROACH", "FAIRWAY", "8-jern", 138), s(3, "PUTT", "GREEN", "Putter", 6),
  { ...s(1, "APPROACH", "TEE", "6-jern", 158), id: "h2", holeNumber: 2, holePar: 3 },
];
const Vis = ({ data }: { data: SlagData[] }) => (
  <PlayerHQSkall innboksHref="#" uleste={0}>
    <PHRD03RedigerSlag roundId="syn-1" baneNavn="Fredrikstad GK" dato="4. oktober 2026" eksisterendeSlag={data} baneKart={null} />
  </PlayerHQSkall>
);

export const tilstander = {
  data: <Vis data={slag} />,
  tom: <Vis data={[]} />,
  laster: <PlayerHQSkall innboksHref="#" uleste={0}><RunderLaster tekst="Henter runden" /></PlayerHQSkall>,
  feil: <PlayerHQSkall innboksHref="#" uleste={0}><div className="phn"><RunderFeil tittel="Runden kunne ikke hentes" tekst="Runden er ikke endret. Prøv igjen om litt." href="/portal/mal/runder" /></div></PlayerHQSkall>,
};
