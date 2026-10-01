/**
 * Gruppetimer skrives inn som Oslo-tid («YYYY-MM-DD» + «HH:MM»), men serveren
 * (Vercel) kjører UTC. `new Date("2026-10-01T16:00")` blir dermed 16:00 UTC =
 * 18:00 Oslo. Denne hjelperen gjør om Oslo-veggklokke til riktig tidspunkt.
 * gotchas §Tid og datoer.
 */

const OSLO = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Oslo-veggklokke som om den var UTC, i millisekunder. */
function osloSomUtcMs(d: Date): number {
  const p = Object.fromEntries(OSLO.formatToParts(d).map((x) => [x.type, x.value]));
  return Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute));
}

/**
 * «2026-10-01» + «16:00» (Oslo) -> Date. Returnerer null ved ugyldig inndata.
 * `dato` kan også være «YYYY-MM-DDTHH:MM» (datetime-local) når `tid` utelates.
 */
export function osloLokalTilDato(dato: string, tid?: string): Date | null {
  const [d, t] = tid === undefined ? dato.split("T") : [dato, tid];
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d ?? "");
  const tm = /^(\d{2}):(\d{2})/.exec(t ?? "");
  if (!dm || !tm) return null;
  const onsket = Date.UTC(Number(dm[1]), Number(dm[2]) - 1, Number(dm[3]), Number(tm[1]), Number(tm[2]));
  if (Number.isNaN(onsket)) return null;
  // To runder: første gjetning bruker versjonsforskjellen ved onsket-tidspunktet, andre retter over sommertid-skifte.
  let ms = onsket - (osloSomUtcMs(new Date(onsket)) - onsket);
  ms = onsket - (osloSomUtcMs(new Date(ms)) - ms);
  const svar = new Date(ms);
  return Number.isNaN(svar.getTime()) ? null : svar;
}

/** Date -> «YYYY-MM-DDTHH:MM» i Oslo-tid, for datetime-local. */
export function datoTilOsloLokal(d: Date): string {
  const p = Object.fromEntries(OSLO.formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
