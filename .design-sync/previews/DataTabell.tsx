import { DataTabell } from "akgolf-hq-komponenter";

const h = "right" as const;
const STALL_KOL = [
  { key: "navn", label: "Spiller" },
  { key: "runder", label: "Runder", mono: true, align: h, sortable: true },
  { key: "snitt", label: "Snittscore", mono: true, align: h, sortable: true },
  { key: "sg", label: "SG total", mono: true, delta: true, align: h, sortable: true },
];
const STALL = [
  { navn: "Øyvind Rohjan", runder: 14, snitt: 74.3, sg: 1.2 },
  { navn: "Emma Berg", runder: 11, snitt: 76.8, sg: 0.4 },
  { navn: "Jonas Lie", runder: 9, snitt: 78.1, sg: -0.6 },
  { navn: "Sara Holm", runder: 12, snitt: 79.5, sg: -1.1 },
  { navn: "Mats Rønning", runder: 2, snitt: null, sg: null },
];

/** Stallen sortert på SG (synkende): delta-kolonnen farges etter fortegn, tall i mono, tomme celler «—». */
export function Stall() {
  return <DataTabell columns={STALL_KOL} rows={STALL} sortKey="sg" sortDir="desc" />;
}

/** TrackMan-parametere på engelsk med enhet i kolonnehodet. Kun «Carry vs mål» er delta — Attack Angle har ikke fortegn som godt/dårlig. */
export function TrackMan() {
  return (
    <DataTabell
      columns={[
        { key: "kolle", label: "Kølle" },
        { key: "carry", label: "Carry (m)", mono: true, align: h, sortable: true },
        { key: "cs", label: "Club Speed (m/s)", mono: true, align: h, sortable: true },
        { key: "smash", label: "Smash Factor", mono: true, align: h, sortable: true },
        { key: "aa", label: "Attack Angle (°)", mono: true, align: h },
        { key: "avvik", label: "Carry vs mål (m)", mono: true, delta: true, align: h, sortable: true },
      ]}
      rows={[
        { kolle: "Driver", carry: 248, cs: 46.2, smash: 1.47, aa: 1.8, avvik: 3 },
        { kolle: "3-tre", carry: 224, cs: 44.1, smash: 1.46, aa: -1.2, avvik: -2 },
        { kolle: "5-jern", carry: 178, cs: 40.3, smash: 1.4, aa: -3.6, avvik: -4 },
        { kolle: "7-jern", carry: 156, cs: 38.0, smash: 1.37, aa: -4.1, avvik: 0 },
        { kolle: "PW", carry: 112, cs: 34.6, smash: 1.28, aa: -5.3, avvik: 2 },
      ]}
      sortKey="carry"
      sortDir="desc"
    />
  );
}

/** Stigende på snittscore — laveste først. Rader uten score holdes utenfor (de sorteres som tom streng). */
export function SortertStigende() {
  return <DataTabell columns={STALL_KOL} rows={STALL.filter((r) => r.snitt != null)} sortKey="snitt" sortDir="asc" />;
}

/** Ingen rader → tom tilstand. */
export function Tom() {
  return <DataTabell columns={STALL_KOL} rows={[]} />;
}
