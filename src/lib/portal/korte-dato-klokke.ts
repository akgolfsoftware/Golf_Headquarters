/** "fre 04.08 · 09:12" — Oslo-korrekt, delt mellom serverkomponent (beregnet
 * ved render) og evt. klient. Server-beregnet for å unngå SSR/hydrerings-
 * avvik («nå» er pr. definisjon ulik mellom serverrender og klient-mount). */
export function korteDatoKlokke(d: Date): string {
  const dag = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "short" }).format(d).replace(/\.$/, "");
  const dato = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit" }).format(d);
  const klokke = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" }).format(d);
  return `${dag} ${dato} · ${klokke}`;
}
