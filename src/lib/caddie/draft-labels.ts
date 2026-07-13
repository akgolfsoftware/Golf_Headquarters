// Norske titler for CaddieDraft-typer (toolName → visningstekst).
// Brukes i A1-køen (/admin/godkjenninger) og andre flater som viser utkast.
// Ren fil uten server-avhengigheter — trygg å importere fra klientkomponenter.

const DRAFT_TITLER: Record<string, string> = {
  draftPlayerMessage: "Meldingsutkast til spiller",
  draftBookingProposal: "Bookingforslag",
  draftInvoiceReminder: "Fakturapurring",
  draftPlayerNote: "Notat på spiller",
  draftPlanAdjustment: "Justering av treningsplan",
  reengageInactivePlayer: "Oppfølging av inaktiv spiller",
};

/** Norsk tittel for et Caddie-utkast. Ukjent toolName → generisk fallback. */
export function caddieDraftTittel(toolName: string): string {
  return DRAFT_TITLER[toolName] ?? `Caddie-utkast (${toolName})`;
}
