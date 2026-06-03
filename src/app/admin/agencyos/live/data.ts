/**
 * Mission Control (AgencyOS · live) — statisk seed-data.
 *
 * Foreløpig et visuelt skall: dataene er løftet verbatim fra Anders' innboks
 * (Direction A-designet i public/design-handover/meg-live-os/src/data.jsx).
 * Live-integrasjoner (Gmail / Beeper / iMessage / Notion / Google Kalender)
 * kobles senere — da byttes konstantene under ut mot ekte kilder som
 * valideres mot de samme zod-skjemaene.
 */
import { z } from "zod";

/* ---------- skjemaer ---------- */

export const prioritySchema = z.enum(["urgent", "followup", "open"]);
export type Priority = z.infer<typeof prioritySchema>;

export const emailSchema = z.object({
  id: z.string(),
  subject: z.string(),
  from: z.string(),
  name: z.string(),
  initials: z.string(),
  priority: prioritySchema,
  label: z.string(),
  when: z.string(),
  snippet: z.string(),
});
export type Email = z.infer<typeof emailSchema>;

export const messageChannelSchema = z.enum(["beeper", "imessage"]);
export type MessageChannel = z.infer<typeof messageChannelSchema>;

export const messageSchema = z.object({
  id: z.string(),
  name: z.string(),
  channel: messageChannelSchema,
  source: z.string(),
  unread: z.number(),
  when: z.string(),
  snippet: z.string(),
  initials: z.string(),
  fresh: z.boolean().optional(),
});
export type Message = z.infer<typeof messageSchema>;

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  prio: z.enum(["P1", "P2"]),
  tag: z.string(),
  due: z.string(),
  done: z.boolean(),
});
export type Task = z.infer<typeof taskSchema>;

export const eventAxisSchema = z.enum(["fys", "tek", "slag", "spill", ""]);
export type EventAxis = z.infer<typeof eventAxisSchema>;

export const eventSchema = z.object({
  id: z.string(),
  time: z.string(),
  allday: z.boolean().optional(),
  title: z.string(),
  who: z.string(),
  loc: z.string().optional(),
  source: z.string(),
  axis: eventAxisSchema,
  next: z.boolean().optional(),
});
export type CalEvent = z.infer<typeof eventSchema>;

export const notionSchema = z.object({
  project: z.string(),
  status: z.string(),
  sprint: z.string(),
  progress: z.number(),
  columns: z.array(z.object({ name: z.string(), count: z.number() })),
});
export type NotionProject = z.infer<typeof notionSchema>;

export const moduleSchema = z.object({
  key: z.string(),
  label: z.string(),
  icon: z.string(),
  app: z.boolean(),
  href: z.string().optional(),
});
export type LauncherModule = z.infer<typeof moduleSchema>;

export const dagensTreSchema = z.object({
  n: z.string(),
  label: z.string(),
  icon: z.string(),
});
export type DagensTreItem = z.infer<typeof dagensTreSchema>;

/* ---------- seed (verbatim fra design-handover) ---------- */

export const SCENE_DATE = "Onsdag 3. juni 2026";

const EMAILS_RAW: Email[] = [
  {
    id: "e1",
    subject: "Velkommen til Veien til Golf hos GFGK (30–31 mai 2026)",
    from: "anders@akgolf.no",
    name: "Anders Kragerud",
    initials: "AK",
    priority: "urgent",
    label: "Viktig",
    when: "08:14",
    snippet:
      "Bekreft påmeldingene før helgen — to deltakere mangler betaling. Trenger romliste til klubben innen fredag.",
  },
  {
    id: "e2",
    subject: "Svar: Lag – NM – status Jakob",
    from: "andreas@pointernorge.no",
    name: "Andreas P.",
    initials: "AP",
    priority: "urgent",
    label: "Viktig",
    when: "07:51",
    snippet:
      "Jakob er tatt ut, men vi mangler signatur på samtykkeskjema. Kan du ringe far i dag?",
  },
  {
    id: "e3",
    subject: "[Action required] Provide information about Skillest",
    from: "notifications@stripe.com",
    name: "Stripe",
    initials: "ST",
    priority: "followup",
    label: "Følg opp",
    when: "06:32",
    snippet:
      "Additional information is required to keep payouts enabled for your Skillest connected account.",
  },
];

const MESSAGES_RAW: Message[] = [
  { id: "m1", name: "Rui Fu", channel: "beeper", source: "Instagram", unread: 1, when: "11:58", snippet: "Hey Anders! Loved the swing breakdown — do you coach remotely?", initials: "RF" },
  { id: "m2", name: "Charlie Hills", channel: "beeper", source: "Instagram", unread: 1, when: "11:40", snippet: "Sender deg en klipp fra runden i går, sjekk driver-planet.", initials: "CH" },
  { id: "m3", name: "Alex Hormozi", channel: "beeper", source: "Instagram", unread: 1, when: "10:22", snippet: "Appreciate the follow — let's talk content collab.", initials: "AH" },
  { id: "m4", name: "Nils-Jørgen Olsen", channel: "beeper", source: "Instagram", unread: 5, when: "10:05", snippet: "Har du ledig time torsdag? Vil ha med sønnen min også.", initials: "NO" },
  { id: "m5", name: "Jan Petter Braathen", channel: "beeper", source: "Messenger", unread: 1, when: "09:47", snippet: "Takk for sist! Når åpner vinterbookingen?", initials: "JB" },
  { id: "m6", name: "Lars Gunnar With", channel: "beeper", source: "Messenger", unread: 1, when: "09:30", snippet: "Kan vi flytte fredagsøkta til lørdag?", initials: "LW" },
  { id: "m7", name: "Utdrikningslag – Jørn", channel: "beeper", source: "Messenger", unread: 5, when: "09:12", snippet: "12 stk, lørdag — har dere simulator-pakke?", initials: "UJ" },
  { id: "m8", name: "Geir Strand", channel: "beeper", source: "Messenger", unread: 2, when: "08:58", snippet: "Faktura mottatt, betaler i dag. Takk!", initials: "GS" },
  { id: "m9", name: "Håvard R. F. Johansen", channel: "beeper", source: "Messenger", unread: 1, when: "08:40", snippet: "Junior-gruppa — er det plass til én til?", initials: "HJ" },
  { id: "m10", name: "Filip Svendsen", channel: "beeper", source: "WhatsApp", unread: 2, when: "08:21", snippet: "På vei nå, 10 min forsinket til 14:00 — beklager!", initials: "FS" },
  { id: "m11", name: "golf-app", channel: "beeper", source: "Slack", unread: 1, when: "07:55", snippet: "Deploy #482 grønn. Notion-sync cron kjører kl 06:00.", initials: "GA" },
  { id: "m12", name: "Pernille (regnskap)", channel: "imessage", source: "iMessage", unread: 1, when: "08:02", snippet: "Sender MVA-oppgaven til signering i dag. Sjekk mail.", initials: "PE" },
  { id: "m13", name: "Anders Kristiansen", channel: "imessage", source: "iMessage", unread: 2, when: "07:36", snippet: "Sees på Gamle Fredrikstad 13:50. Tar med TrackMan.", initials: "AK" },
];

const TASKS_RAW: Task[] = [
  { id: "t1", title: "Notion-sync v1.1 — OAuth + Prisma + cron", prio: "P1", tag: "Software", due: "Halvdag", done: false },
  { id: "t2", title: "PWA-setup — akgolf.no installerbar som mobil-app", prio: "P2", tag: "Software", due: "2 t", done: false },
];

const NOTION_RAW: NotionProject = {
  project: "akgolf.no — plattform v1",
  status: "Pågår",
  sprint: "Sprint 14 · uke 23",
  progress: 62,
  columns: [
    { name: "Backlog", count: 9 },
    { name: "Denne uka", count: 4 },
    { name: "Pågår", count: 2 },
    { name: "Review", count: 1 },
    { name: "Ferdig", count: 18 },
  ],
};

const EVENTS_RAW: CalEvent[] = [
  { id: "ev0", time: "Hele dagen", allday: true, title: "Oskar Hammer — Arbeidsuke", who: "AK Golf Academy", source: "Internt", axis: "" },
  { id: "ev1", time: "14:00", title: "Filip Svendsen — Flex 50 minutter", who: "Gamle Fredrikstad GK · Anders Kristiansen", loc: "Torsnesveien 16, 1630 Gamle Fredrikstad", source: "Booking Acuity", axis: "slag", next: true },
  { id: "ev2", time: "14:00", title: "Dugnad Srixon tour", who: "Emilie", source: "AK Golf Academy", axis: "spill" },
  { id: "ev3", time: "15:00", title: "Fredrik Hovland Kjølberg — Flex 20 minutter", who: "Gamle Fredrikstad GK · Anders Kristiansen", loc: "Torsnesveien 16, 1630 Gamle Fredrikstad", source: "Booking Acuity", axis: "tek" },
  { id: "ev4", time: "22:30", title: "N2", who: "Karoline Sarpsborg", source: "AK Golf Academy", axis: "fys" },
];

export const EVENTS_MORE = 9; // 14 avtaler totalt; 5 vist

const MODULES_RAW: LauncherModule[] = [
  { key: "playerhq", label: "PlayerHQ", icon: "users", app: true, href: "/portal" },
  { key: "coachhq", label: "CoachHQ", icon: "shield", app: true, href: "/admin" },
  { key: "booking", label: "Booking", icon: "clock", app: true, href: "/booking" },
  { key: "marketing", label: "Marketing", icon: "globe", app: true, href: "/" },
  { key: "notion", label: "Notion", icon: "book-open", app: false },
  { key: "gmail", label: "Gmail", icon: "mail", app: false },
  { key: "kalender", label: "Kalender", icon: "calendar", app: false },
];

const DAGENS_TRE_RAW: DagensTreItem[] = [
  { n: "01", label: "Svare opp", icon: "corner-up-left" },
  { n: "02", label: "Følge opp", icon: "flag" },
  { n: "03", label: "Være tilstede", icon: "activity" },
];

/** Skriptet «live»-melding som strømmer inn for å demonstrere stream-in. */
export const INCOMING: Message = {
  id: "live1",
  name: "Sofie Kvam",
  channel: "beeper",
  source: "Instagram",
  unread: 1,
  when: "nå",
  snippet: "Kan jeg booke en ekstra TrackMan-time før NM?",
  initials: "SK",
  fresh: true,
};

export const ANTALL_AVTALER = 14;

/* ---------- validert eksport ---------- */

export const EMAILS = z.array(emailSchema).parse(EMAILS_RAW);
export const MESSAGES = z.array(messageSchema).parse(MESSAGES_RAW);
export const TASKS = z.array(taskSchema).parse(TASKS_RAW);
export const NOTION = notionSchema.parse(NOTION_RAW);
export const EVENTS = z.array(eventSchema).parse(EVENTS_RAW);
export const MODULES = z.array(moduleSchema).parse(MODULES_RAW);
export const DAGENS_TRE = z.array(dagensTreSchema).parse(DAGENS_TRE_RAW);
