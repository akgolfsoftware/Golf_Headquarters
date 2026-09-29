/**
 * Kort tekst av hva en agentkjøring leverte (AgentRun.output), til Jarvis-køen
 * og agentdetaljen. Flyttet ut av `/admin/agents/[agentId]/page.tsx` slik at
 * begge flater viser det samme. Ren modul: ingen Prisma, ingen React.
 */
export function lagSnippet(meta: Record<string, unknown> | null): string | null {
  if (!meta) return null;

  if (Array.isArray(meta.briefs)) {
    const n = meta.briefs.length;
    const varsler = typeof meta.varsler === "number" ? meta.varsler : 0;
    const first = meta.briefs[0] as { brief?: string } | undefined;
    const preview =
      typeof first?.brief === "string" ? ` — ${first.brief.replace(/\s+/g, " ").slice(0, 180)}` : "";
    return `${n} brief${n === 1 ? "" : "er"} · ${varsler} ${varsler === 1 ? "varsel" : "varsler"}${preview}`;
  }

  if (typeof meta.svakesteLabel === "string" && Array.isArray(meta.driller)) {
    const n = meta.driller.length;
    const video = typeof meta.medVideo === "number" && meta.medVideo > 0 ? `, ${meta.medVideo} m/video` : "";
    return `Svakest: ${meta.svakesteLabel} · ${n} drill${n === 1 ? "" : "er"}${video}`;
  }

  if (Array.isArray(meta.endringer) && typeof meta.spillerNavn === "string") {
    const n = meta.endringer.length;
    const anbef =
      typeof meta.samletAnbefaling === "string"
        ? ` — ${meta.samletAnbefaling.replace(/\s+/g, " ").slice(0, 160)}`
        : "";
    return `${meta.spillerNavn} · ${n} endring${n === 1 ? "" : "er"}${anbef}`;
  }

  if (Array.isArray(meta.fasePerUke) && typeof meta.tournamentNavn === "string") {
    const uker = typeof meta.ukerTilTurnering === "number" ? ` · ${meta.ukerTilTurnering} uker` : "";
    return `${meta.spillerNavn ?? "Spiller"} → ${meta.tournamentNavn}${uker}`;
  }

  if (typeof meta.melding === "string" && meta.melding.trim().length > 0) {
    return meta.melding.slice(0, 240);
  }

  const kandidater = [
    "suggestion",
    "result",
    "summary",
    "snippet",
    "signalsWritten",
    "planActionsWritten",
    "brukerPrompt",
    "prompt",
    "feedback",
  ];
  for (const k of kandidater) {
    const v = meta[k];
    if (typeof v === "string" && v.trim().length > 0) return v.slice(0, 240);
    if (typeof v === "number") return `${k}: ${v}`;
  }
  const json = JSON.stringify(meta);
  return json.length > 4 ? json.slice(0, 240) : null;
}
