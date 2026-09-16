import { Kort, VarmeKart } from "akgolf-hq-komponenter";

const UKER = ["Uke 35", "Uke 36", "Uke 37", "Uke 38"];
const DAGER = ["M", "T", "O", "T", "F", "L", "S"];
const DAGNAVN = ["mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"];
/** Treningsminutter per dag. */
const MIN = [
  [45, 0, 90, 30, 120, 0, 20],
  [60, 25, 0, 100, 60, 40, 0],
  [0, 55, 110, 45, 130, 0, 70],
  [35, 0, 75, 90, 50, 105, 0],
];
const MAKS_MIN = 130;

/** Uke × ukedag med treningsminutter. Trykk/hover på en celle viser eksakt verdi — fmt får rad og kolonne. */
export function Standard() {
  return (
    <VarmeKart
      rows={UKER}
      cols={DAGER}
      values={MIN.map((r) => r.map((m) => m / MAKS_MIN))}
      fmt={(_v, ri, ci) => (MIN[ri][ci] ? `${UKER[ri]} · ${DAGNAVN[ci]} · ${MIN[ri][ci]} min` : `${UKER[ri]} · ${DAGNAVN[ci]} · ingen økt`)}
    />
  );
}

/** Time × dag: hvor mange av fire simulatorer som er booket. */
export function TimeMotDag() {
  const TIMER = ["07", "09", "11", "13", "15", "17", "19"];
  const DAG = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
  const BOOKET = [
    [1, 0, 1, 0, 2, 3, 2],
    [2, 1, 2, 1, 3, 4, 3],
    [1, 2, 1, 2, 2, 4, 4],
    [0, 1, 0, 1, 1, 3, 3],
    [2, 3, 2, 3, 4, 2, 2],
    [4, 4, 3, 4, 4, 1, 1],
    [3, 3, 4, 3, 2, 0, 0],
  ];
  return (
    <VarmeKart
      rows={TIMER.map((t) => `${t}:00`)}
      cols={DAG}
      values={BOOKET.map((r) => r.map((n) => n / 4))}
      cell={26}
      fmt={(_v, ri, ci) => `${DAG[ci]} ${TIMER[ri]}:00 · ${BOOKET[ri][ci]} av 4 simulatorer booket`}
    />
  );
}

/** Større celler i kort, åtte uker, nøytral blekkfarge. */
export function IKort() {
  const UKER8 = ["Uke 31", "Uke 32", "Uke 33", "Uke 34", "Uke 35", "Uke 36", "Uke 37", "Uke 38"];
  const SLAG = [
    [120, 0, 180, 90, 210, 0, 60], [150, 80, 0, 200, 140, 90, 0],
    [0, 110, 240, 100, 260, 0, 150], [90, 0, 160, 190, 120, 220, 0],
    [130, 60, 200, 70, 180, 0, 40], [170, 90, 0, 230, 150, 110, 0],
    [0, 140, 260, 120, 280, 0, 160], [100, 0, 190, 210, 130, 240, 0],
  ];
  return (
    <Kort eyebrow="Slagvolum per dag" action={<span style={{ fontFamily: "var(--tl-font-mono)", fontSize: 9, color: "var(--tl-mute)" }}>TrackMan + logg · 8 uker</span>}>
      <VarmeKart
        rows={UKER8}
        cols={DAGER}
        values={SLAG.map((r) => r.map((n) => n / 280))}
        cell={30}
        gap={4}
        color="var(--tl-text)"
        fmt={(_v, ri, ci) => `${UKER8[ri]} · ${DAGNAVN[ci]} · ${SLAG[ri][ci]} slag`}
      />
    </Kort>
  );
}

/** Tom: alle celler 0 gir hårlinje-flater — ny spiller uten økter. */
export function Tom() {
  return (
    <VarmeKart
      rows={UKER}
      cols={DAGER}
      values={UKER.map(() => DAGER.map(() => 0))}
      fmt={(_v, ri, ci) => `${UKER[ri]} · ${DAGNAVN[ci]} · ingen økt registrert`}
    />
  );
}
