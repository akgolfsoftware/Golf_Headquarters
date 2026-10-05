/** Prøvefil for PH-24 Utstyr. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH24Utstyr } from "@/components/portal/precision/PH24Utstyr";
import { Natt } from "./_natt";

export const sti = "/portal/meg/utstyr";

const demoData = {
  bagFelter: [
    { label: "Driver", kort: "Dr", verdi: "TaylorMade Qi10 9° (Ventus Blue 6S)" },
    { label: "Fairwaywood", kort: "Fw", verdi: "TaylorMade Qi10 3W 15°" },
    { label: "Hybrid", kort: "Hy", verdi: "Ping G430 4H 22°" },
    { label: "Jernsett", kort: "Jn", verdi: "Titleist T150 4–PW" },
    { label: "Wedger", kort: "We", verdi: "Vokey SM10 50° / 54° / 58°" },
    { label: "Putter", kort: "Pt", verdi: "Scotty Cameron Phantom X 5.5" },
  ],
  tilbehor: [
    { label: "Ball", kort: "Ba", verdi: "Titleist Pro V1" },
    { label: "Bag", kort: "Bg", verdi: "Sun Mountain H2NO" },
  ],
  notater: "Golf Pride MCC Plus4 grep på alle køller. Jern bøyd 1° flat.",
  harBag: true,
  koller: [
    { klubb: "58°", median: 85, p25: 82, p75: 88, slag: 24, tynn: false },
    { klubb: "54°", median: 98, p25: 95, p75: 101, slag: 28, tynn: false },
    { klubb: "50°", median: 112, p25: 109, p75: 115, slag: 22, tynn: false },
    { klubb: "PW", median: 125, p25: 122, p75: 128, slag: 30, tynn: false },
    { klubb: "7i", median: 155, p25: 151, p75: 158, slag: 45, tynn: false },
    { klubb: "4H", median: 195, p25: 190, p75: 199, slag: 18, tynn: false },
    { klubb: "3W", median: 225, p25: 220, p75: 229, slag: 20, tynn: false },
    { klubb: "Dr", median: 255, p25: 248, p75: 260, slag: 35, tynn: false },
  ],
  gap: [],
  vinduDager: 90,
  okter: 14,
};

const demoInitialBag = {
  driver: "TaylorMade Qi10 9°",
  fairwayWoods: "TaylorMade Qi10 3W",
  hybrids: "Ping G430 4H",
  irons: "Titleist T150 4–PW",
  wedges: "Vokey SM10 50/54/58",
  putter: "Scotty Cameron Phantom X 5.5",
  ball: "Titleist Pro V1",
  bag: "Sun Mountain H2NO",
  notes: "Golf Pride MCC Plus4 grep",
};

const lagreBag = async () => {};

const Vis = ({ nattModus = false }: { nattModus?: boolean }) => {
  const comp = (
    <PlayerHQSkall innboksHref="#" uleste={0}>
      <PH24Utstyr data={demoData} initialBag={demoInitialBag} onLagreBag={lagreBag} />
    </PlayerHQSkall>
  );
  return nattModus ? <Natt>{comp}</Natt> : comp;
};

export const tilstander = {
  data: <Vis />,
  natt: <Vis nattModus />,
};

export const natt = ["natt"];
