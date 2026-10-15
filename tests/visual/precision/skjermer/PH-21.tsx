/** Prøvefil for PH-21 Innboks bak bjella i nytt design (pakke 7). Syntetiske data: mandag 5. oktober 2026. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH21InnboksOversikt } from "@/components/portal/precision/PH21InnboksOversikt";
import { PHKommunikasjonLaster } from "@/components/portal/precision/PHKommunikasjonLaster";
import type { PH21InnboksData } from "@/lib/portal/ph21-innboks";

export const sti = "/portal/varsler";

const DATA: PH21InnboksData = {
  harCoach: true,
  forslag: [
    {
      kilde: "trener", id: "t1", org: "WANG", tid: "i går 20:41", fra: "WANG Toppidrett · Trener Testesen",
      tittel: "Forslag: endre Innspill", tekst: "Range 2 er booket av VG1 torsdag.", linjer: [],
      for: { tid: "Tor 8. okt · 16:00", navn: "Innspill", akse: "SLAG", info: "60 min" },
      etter: { tid: "Tor 8. okt · 16:00", navn: "Nærspill på chippinggreenen", akse: "SLAG", info: "60 min" },
    },
    { kilde: "coach", id: "c1", tid: "—", fra: "Anders Kristiansen · coach", tittel: "Forslag: Teknikk P7.0 Treffpunktet",
      etter: { tid: "Fre 9. okt · 16:00", navn: "Teknikk P7.0 Treffpunktet", akse: "TEK", info: "45 min · Golfstudio" } },
    { kilde: "plan", id: "p1", tid: "02.10.2026", fra: "Anders Kristiansen · coach", tittel: "Plan: Uke 42 innspill", tekst: "6 økter · 9 t 30 min" },
  ],
  melding: { fra: "Anders Kristiansen", tekst: "Så videoen fra i går. Ballstarten går til høyre. Vi tar P7.0 på fredag.", tid: "05.10 · 12:04", nye: 1 },
  varsler: [
    { id: "v1", type: "booking", tittel: "Timen er bekreftet", tekst: "Fredag 9. oktober kl. 16:00 · Performance Pro", tid: "09:12", ulest: true, link: "/portal/meg/bookinger" },
    { id: "v2", type: "plan", tittel: "Uke 40: 11 t 5 min gjennomført", tekst: "79 % av 14 t 5 min planlagt", tid: "søn 4. okt", ulest: false, link: "/portal/planlegge" },
    { id: "v3", type: "system", tittel: "Ny versjon av appen", tekst: null, tid: "fre 2. okt", ulest: false, link: null },
  ],
};

const Vis = ({ data = DATA, feil = false }: { data?: PH21InnboksData; feil?: boolean }) => (
  <PlayerHQSkall innboksHref="/portal/varsler" uleste={1}><PH21InnboksOversikt data={data} tilstand={feil ? "feil" : "data"} /></PlayerHQSkall>
);

export const tilstander = {
  innboks: <Vis />,
  tom: <Vis data={{ forslag: [], melding: null, varsler: [], harCoach: false }} />,
  laster: <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}><PHKommunikasjonLaster variant="innboks" /></PlayerHQSkall>,
  feil: <Vis feil />,
};
