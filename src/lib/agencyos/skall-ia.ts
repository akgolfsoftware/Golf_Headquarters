/**
 * AgencyOS AX-01-destinasjoner (J-A / J-C, T12).
 * Rail/dock leser herfra — tester kan låse href uten å importere skallet.
 */
export type SkallTab = { id: string; label: string; icon: string; href: string };

export const AGENCYOS_SKALL_TABS: SkallTab[] = [
  { id: "stall", label: "Stall", icon: "users", href: "/admin/spillere" },
  { id: "workbench", label: "Workbench", icon: "target", href: "/admin/plan" },
  { id: "ko", label: "Kø", icon: "inbox", href: "/admin/ko" },
  { id: "jarvis", label: "Jarvis", icon: "bot", href: "/admin/agenticos" },
  { id: "meg", label: "Meg", icon: "user", href: "/admin/profile" },
];

export const AGENCYOS_UNDER_MEG: { id: string; label: string; href: string; adminOnly?: boolean }[] = [
  { id: "konsoll", label: "Konsoll", href: "/admin/agencyos" },
  { id: "okonomi", label: "Økonomi", href: "/admin/agencyos/okonomi" },
  { id: "kalender", label: "Kalender", href: "/admin/kalender" },
  { id: "jarvis-innboks", label: "Personlig innboks", href: "/meg", adminOnly: true },
];

/**
 * Ruter uten rail/dock — Next-gruppen `src/app/admin/(fullscreen)/`.
 * Tavla er artefakt, aldri fane (AG-09b).
 */
export const AGENCYOS_FULLSKJERM = ["/admin/agencyos/live"] as const;

export function erAgencyosFullskjerm(pathname: string): boolean {
  return AGENCYOS_FULLSKJERM.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Aktiv AX-01-fane av URL. Tom streng hvis ingen treffer (typisk under-Meg,
 * eller fullskjerm-artefakt). Første treff vinner — mer spesifikke prefiks
 * må stå før kortere der de ellers ville kollidere.
 */
export function skallAktivFraPath(pathname: string): string {
  if (erAgencyosFullskjerm(pathname)) return "";
  const treff: Array<{ prefix: string; id: string }> = [
    { prefix: "/admin/spillere", id: "stall" },
    // MASTERPLAN 15.8: Analyse/Innsikt er stall-innsikt, ikke egen rail-fane.
    { prefix: "/admin/analyse", id: "stall" },
    { prefix: "/admin/analysere", id: "stall" },
    // MASTERPLAN 15.9: Plan er én adresse (/admin/plan). /admin/planlegge er
    // nå en redirect, men beholdes her så railen lyser riktig i det korte
    // øyeblikket før redirecten lander (samme mønster som Kø 15.1/15.2).
    { prefix: "/admin/plan", id: "workbench" },
    { prefix: "/admin/planlegge", id: "workbench" },
    { prefix: "/admin/workbench", id: "workbench" },
    // MASTERPLAN 15.1/15.2: Kø er én adresse (/admin/ko). De gamle kø-adressene
    // er redirects, men beholdes her så railen lyser riktig i det korte
    // øyeblikket før redirecten lander.
    { prefix: "/admin/ko", id: "ko" },
    { prefix: "/admin/godkjenninger", id: "ko" },
    { prefix: "/admin/innboks", id: "ko" },
    { prefix: "/admin/varsler", id: "ko" },
    // MASTERPLAN 15.7: Kommunikasjon (/admin/kommunikasjon) samler Innboks +
    // e-post + maler — samme rail-plassering som Innboks hadde.
    { prefix: "/admin/kommunikasjon", id: "ko" },
    { prefix: "/admin/email-templates", id: "ko" },
    // Oppfølging av spillere er IKKE Kø (beslutning 6.6) — den hører i Stall.
    { prefix: "/admin/queue", id: "stall" },
    // Oppgaver bor under Meg, som i canvasen (MASTERPLAN 15.2).
    { prefix: "/admin/oppgaver", id: "meg" },
    { prefix: "/admin/handlingssenter", id: "meg" },
    { prefix: "/admin/workspace", id: "meg" },
    // MASTERPLAN 15.3: Oppsett er én adresse. Settings er redirect hit.
    { prefix: "/admin/oppsett", id: "meg" },
    { prefix: "/admin/settings", id: "meg" },
    { prefix: "/admin/agenticos", id: "jarvis" },
    { prefix: "/admin/agent-team", id: "jarvis" },
    { prefix: "/admin/agents", id: "jarvis" },
    { prefix: "/admin/agencyos/caddie", id: "jarvis" },
    { prefix: "/admin/profile", id: "meg" },
    { prefix: "/meg", id: "meg" },
  ];
  for (const t of treff) {
    if (pathname === t.prefix || pathname.startsWith(`${t.prefix}/`)) return t.id;
  }
  return "";
}
