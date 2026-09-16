import { PillTabs } from "akgolf-hq-komponenter";

const FANER = [
  { id: "oversikt", l: "Oversikt" },
  { id: "analyse", l: "Analyse" },
  { id: "plan", l: "Plan" },
  { id: "fremgang", l: "Fremgang" },
  { id: "tester", l: "Tester" },
];

/** Aktiv fane: elev-flate, tekstkant og understrek i handlingsfargen. */
export function Standard() {
  return <PillTabs tabs={FANER} value="analyse" />;
}

/** Åtte faner slik Analyse har dem på Mac. Blir scrolleren smalere enn fanene, får høyrekanten fade og chevron. */
export function MangeFaner() {
  const mange = [
    { id: "oversikt", l: "Oversikt" },
    { id: "runder", l: "Runder" },
    { id: "trackman", l: "TrackMan" },
    { id: "sg", l: "Strokes Gained" },
    { id: "tester", l: "Tester" },
    { id: "fysisk", l: "Fysisk" },
    { id: "turneringer", l: "Turneringer" },
    { id: "video", l: "Video" },
  ];
  return <PillTabs tabs={mange} value="trackman" />;
}

export function ToFaner() {
  return <PillTabs tabs={[{ id: "uke", l: "Uke" }, { id: "maaned", l: "Måned" }]} value="uke" />;
}
