/** Publiseringsdialogen viser Oslo-tid, uavhengig av serverens tidssone. */
const formatter = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "numeric",
  month: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function formaterPubliserTid(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Ukjent tid";
  const parts = new Map(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return `${parts.get("day")}.${parts.get("month")} ${parts.get("hour")}:${parts.get("minute")}`;
}
