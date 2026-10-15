/** Prøvefil for PH-23 Bekreftet (kvitteringssiden) i nytt design (pakke 7). Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23Bekreftet } from "@/components/portal/precision/PH23Bekreftet";

export const sti = "/portal/booking/bekreftet";

export const tilstander = {
  bekreftet: <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
    <PH23Bekreftet data={{ tjeneste: "Performance Pro", dag: "Onsdag 7. oktober", klokkeslett: "10:30", coachNavn: "Anders Kristiansen",
      sted: "Simulator 2, Fredrikstad", varighetMin: 90, kalenderUrl: "https://calendar.google.com/calendar/render", avbestillingTimer: 24 }} />
  </PlayerHQSkall>,
  utenCoach: <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
    <PH23Bekreftet data={{ tjeneste: "TrackMan-bay", dag: "Lørdag 10. oktober", klokkeslett: "09:00", coachNavn: null,
      sted: "", varighetMin: 60, kalenderUrl: "https://calendar.google.com/calendar/render", avbestillingTimer: 24 }} />
  </PlayerHQSkall>,
};
