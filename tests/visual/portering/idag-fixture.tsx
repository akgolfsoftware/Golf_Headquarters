/** Hel I dag-komponent med syntetiske, allerede hentede data. */
import { createRoot } from "react-dom/client";
import { IDagTrainLock } from "@/components/portal/v2/idag/IDagTrainLock";
import { TrainLockPlayerCaddie, TrainLockPlayerIsland } from "@/components/train-lock/player-chrome";
import { byggMaanedPrikker, type IDagTilstand } from "@/lib/portal/idag-visning";
import styles from "@/components/train-lock/player-chrome.module.css";

const params = new URLSearchParams(location.search);
const state = params.get("tilstand") ?? "okt";
document.documentElement.dataset.trainLock = "4";
if (params.get("tema") === "dark") document.documentElement.dataset.v2Tema = "dark";
const nav = [{ id: "hjem", href: "/portal", label: "I dag" }, { id: "plan", href: "/portal/planlegge", label: "Plan" }, { id: "analyse", href: "/portal/analysere", label: "Analyse" }, { id: "meg", href: "/portal/meg", label: "Meg" }];
const live = state === "pagar";
createRoot(document.getElementById("root")!).render(
  <TrainLockPlayerCaddie aktiv composer={<p>Syntetisk Caddie-innhold. Ingen melding sendes.</p>}>
    <style>{`body{font-family:var(--tl-font-sans);background:var(--tl-scene);color:var(--tl-text)}.idag-ramme{height:100dvh;display:flex}.idag-rail{display:none}@media(min-width:1101px){.idag-rail{display:block;width:64px;flex:none;border-right:1px solid var(--tl-hair)}}.v2-focus:focus-visible{outline:2px solid var(--tl-text);outline-offset:3px}button{font:inherit}`}</style>
    <div className="idag-ramme">
      <div className="idag-rail" aria-hidden />
      <main className={styles.innhold} style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, minHeight: 0, overflow: "hidden" }}>
        <IDagTrainLock datoLinje="torsdag 10. september" maanedNavn="September" navn="Test Spiller" avatarUrl={null} hilsen="God morgen, Test" valgtOktId="naa"
          prikker={byggMaanedPrikker({ aar: 2026, maned: 9, idag: 10, ferdige: new Set([1, 3, 7, 9]) })}
          tilstand={(state === "lang" || state === "fullfort" ? "okt" : state) as IDagTilstand}
          naa={{ tittel: state === "lang" ? "Innspill med langt navn og en tydelig treningsoppgave som må bryte over flere linjer" : "Innspill 50–80 m", tid: "09.00–09.50", meta: "Eksempelbanen · 50 min", ctaTekst: live ? "Fortsett" : state === "fullfort" ? "Se recap" : "Start økt", ctaHref: "/portal/live/naa", fremdriftPst: live ? 45 : null, fremdriftTekst: live ? "28 min igjen" : null, live, fullfort: state === "fullfort" }}
          neste={state === "tom-uke" ? null : { tittel: "Nærspill", meta: "Fredag · 09.00 · programmert", href: "/portal/live/neste/brief" }}
          sgInnspill="+0,2" okterUke={state === "tom-uke" ? 0 : 4} fullfortUke={state === "tom-uke" ? 0 : 2} ukeNummer={37} fullfortMinutter={100} ukeFremdrift={state === "tom-uke" ? undefined : 0.5}
          trackman={null} testerLive={null} godkjenninger={[]} dagLabel="Torsdag 10."
          hendelser={[
            { id: "okt-naa", lag: "OEKTER", dato: "2026-09-10", tittel: "Innspill 50–80 m", startMin: 540, sluttMin: 590, heldag: false, href: "/portal/live/naa" },
            { id: "skole", lag: "SKOLE", dato: "2026-09-10", tittel: "Skole", undertekst: "WANG", startMin: 780, sluttMin: 900, heldag: false, lesevisning: true },
            { id: "okt-fullfort", lag: "OEKTER", dato: "2026-09-10", tittel: "Fys · mobilitet", undertekst: "Hjemme · 20 min", startMin: 450, sluttMin: 470, heldag: false, href: "/portal/live/fullfort/summary", fullfort: true },
          ]} />
      </main>
    </div>
    <TrainLockPlayerIsland aktiv="hjem" nav={nav} />
  </TrainLockPlayerCaddie>,
);
