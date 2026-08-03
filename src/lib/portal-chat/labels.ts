// Norske labels for portal-chat-verktøyene — trukket ut av tools.ts fordi den
// filen har `import "server-only"` og ikke kan importeres fra klientkomponenter
// (steg-liste-UI-et trenger kun navnene, ikke selve verktøyene).

export const PORTAL_CHAT_TOOL_NAMES = ["hentUkeplan", "hentDagensOkt", "hentSisteOkt"] as const;
export type PortalChatToolName = (typeof PORTAL_CHAT_TOOL_NAMES)[number];

export const PORTAL_CHAT_TOOL_LABEL: Record<PortalChatToolName, string> = {
  hentUkeplan: "Leste ukeplanen",
  hentDagensOkt: "Sjekket dagens økt",
  hentSisteOkt: "Hentet siste økt",
};
