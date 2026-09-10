/** Syntetisk visning av faktiske komponenter; ingen serverhandlinger. */
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { TrainLockDesignSynk } from "@/components/shared/train-lock-design-synk";
import { IDagNaaKort } from "@/components/portal/v2/idag/idag-naa-kort";
import { IDagITidenArk } from "@/components/portal/v2/kalender/IDagITidenArk";
import { TrainLockStatus, TrainLockFremdrift } from "@/components/train-lock/v3-elementer";
import { TL } from "@/lib/v2/train-lock";

const params = new URLSearchParams(location.search);
const tilstand = params.get("tilstand") ?? "start";
const mork = params.get("tema") === "dark";
document.cookie = `ak-v2-tema=${params.get("tema") ?? ""}; path=/; samesite=lax`;
if (mork) document.documentElement.dataset.v2Tema = "dark";
function naviger(path: string) { history.pushState(null, "", path); window.dispatchEvent(new PopStateEvent("popstate")); }

function App() {
  const [ark, settArk] = useState(false);
  return <>
    <TrainLockDesignSynk />
    <style>{`:root { --font-poppins: Arial; --font-geist-sans: 'Geist test', Arial; --font-geist-mono: 'Geist Mono test', monospace; }
      body{background:var(--tl-scene);color:var(--tl-text);font-family:var(--tl-font-sans)}
      button{font:inherit;min-height:44px;padding:8px 14px} .ph01-naa{padding:20px}
      a:focus-visible,button:focus-visible{outline:2px solid var(--tl-text);outline-offset:3px}
      main{max-width:800px;margin:auto;padding:20px;overflow-wrap:anywhere} nav{display:flex;gap:8px;flex-wrap:wrap;margin:20px 0}
    `}</style>
    <main>
      <h1>I dag</h1>
      <IDagNaaKort naa={{
        tittel: tilstand === "lang" ? "Innspill med langt navn og en tydelig treningsoppgave som må bryte over flere linjer" : "Innspill 50–80 m",
        tid: "09.00–09.50", meta: "Eksempelbanen · 50 min · 30 baller",
        live: tilstand === "live", fullfort: tilstand === "fullfort",
        ctaTekst: tilstand === "live" ? "Fortsett" : tilstand === "fullfort" ? "Se recap" : "Start økt",
        ctaHref: "/portal/tren/wb/syntetisk-okt",
        fremdriftPst: tilstand === "live" ? 45 : null,
        fremdriftTekst: tilstand === "live" ? "28 min igjen" : null,
      }} />
      <TrainLockFremdrift verdi={.75} label="Uke 37 · treningsminutter" />
      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <TrainLockStatus variant="ok">Fullført</TrainLockStatus>
        <TrainLockStatus variant="danger">Feilet</TrainLockStatus>
      </div>
      <nav aria-label="Prøveruter">
        <button onClick={() => naviger("/portal/tren/live/syntetisk")}>PlayerHQ fullskjerm</button>
        <button onClick={() => naviger("/admin")}>AgencyOS</button>
        <button onClick={() => naviger("/team-wang")}>WANG</button>
        <button onClick={() => settArk(true)}>I dag i tiden</button>
      </nav>
      <p data-warm-text style={{ color: TL.warmText }}>Liten tekst skal være lesbar på grunnflaten.</p>
      <IDagITidenArk open={ark} onClose={() => settArk(false)} dagLabel="Torsdag 10." hendelser={[]} />
    </main>
  </>;
}
createRoot(document.getElementById("root")!).render(<App />);
