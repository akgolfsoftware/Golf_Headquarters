/** Syntetisk skjemaadapter. Ingen ekte brukere eller autentiseringskall. */
import { createRoot } from "react-dom/client";
import { WangInnloggingsSkjema } from "@/app/team-wang/logg-inn/wang-innloggings-skjema";

const mode = new URLSearchParams(location.search).get("mode");
let antall = 0;
Object.assign(window, { wangForsok: 0, wangFelt: null });
createRoot(document.getElementById("root")!).render(<div className="wang-tp" style={{ "--font-wang-brand": "Arial", "--font-wang-body": "Arial" } as React.CSSProperties}>
  <WangInnloggingsSkjema loggInn={async (input) => {
    antall++;
    Object.assign(window, { wangForsok: antall, wangFelt: input });
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (mode === "nettfeil" && antall === 1) throw new Error("Syntetisk nettfeil");
    return { ok: mode !== "passordfeil" };
  }} />
</div>);
