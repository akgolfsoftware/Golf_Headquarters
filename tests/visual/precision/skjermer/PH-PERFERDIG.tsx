/** Prøvefil for pakke 17b Perioden er ferdig. Syntetiske data, ingen database. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHPeriodeFerdig, type PHPeriodeFerdigData } from "@/components/portal/precision/PHPeriodeFerdig";
import { periodeTall } from "@/lib/portal-plan/periode-ferdig";

export const sti = "/portal/planlegge/periode-ferdig";
const S = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;
const okter = [
  ...Array.from({ length: 2 }, () => ({ pyramid: "FYS", durationMinutes: 60, status: "COMPLETED" })),
  ...Array.from({ length: 3 }, (_, i) => ({ pyramid: "TEK", durationMinutes: 60, status: i < 2 ? "COMPLETED" : "SKIPPED" })),
  ...Array.from({ length: 4 }, () => ({ pyramid: "SLAG", durationMinutes: 50, status: "COMPLETED" })),
  ...Array.from({ length: 3 }, () => ({ pyramid: "SPILL", durationMinutes: 185, status: "COMPLETED" })),
];
const data = (o: Partial<PHPeriodeFerdigData> = {}): PHPeriodeFerdigData => ({
  navn: "Evaluering", tidsrom: "7. sep.–20. sep.", ferdig: "20. sep. 2026", tall: periodeTall(okter), runder: 4, nyeMal: 2,
  notat: "God gjennomføring i evalueringsukene. Lengdekontroll blir hovedfokus i grunnperioden.",
  neste: { navn: "Grunnperiode", start: "21. sep. 2026", href: "#" }, periodeHref: "#", ...o,
});
export const tilstander = {
  data: <S><PHPeriodeFerdig data={data()} /></S>,
  "uten-okter": <S><PHPeriodeFerdig data={data({ tall: periodeTall([]), runder: 0, nyeMal: 0, notat: null, neste: null })} /></S>,
  tom: <S><PHPeriodeFerdig data={null} /></S>,
};
