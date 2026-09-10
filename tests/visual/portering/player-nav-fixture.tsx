import { createRoot } from "react-dom/client";
import { useState } from "react";
import { TrainLockCaddieKnapp, TrainLockPlayerCaddie, TrainLockPlayerIsland } from "../../../src/components/train-lock/player-chrome";
import { IDagCaddie } from "../../../src/components/portal/v2/idag/IDagCaddie";
import styles from "../../../src/components/train-lock/player-chrome.module.css";

const nav = [
  { id: "hjem", href: "/portal", label: "I dag" },
  { id: "plan", href: "/portal/planlegge", label: "Plan" },
  { id: "analyse", href: "/portal/analysere", label: "Analyse" },
  { id: "meg", href: "/portal/meg", label: "Meg" },
];
document.documentElement.dataset.trainLock = "4";
if (new URLSearchParams(location.search).get("tema") === "dark") document.documentElement.dataset.v2Tema = "dark";
function Fixture() {
  const [aktiv, settAktiv] = useState("hjem");
  return <TrainLockPlayerCaddie aktiv composer={<IDagCaddie plassering="mobil" placeholder="Spør Caddie" fangstFormel={null} oktLabel={null} />}>
    <main className={styles.innhold} style={{ background: "var(--tl-scene)", color: "var(--tl-text)", minHeight: "100dvh" }}>
      <h1>Navigasjonsprøve</h1>
      <TrainLockCaddieKnapp bareDesktop />
      <label>Aktiv seksjon<select value={aktiv} onChange={(event) => settAktiv(event.target.value)}>{nav.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <div style={{ height: 1200 }} />
      <button type="button">Siste handling</button>
    </main>
    <TrainLockPlayerIsland aktiv={aktiv} nav={nav} />
  </TrainLockPlayerCaddie>;
}
createRoot(document.getElementById("root")!).render(<Fixture />);
