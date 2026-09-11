import { prisma } from "@/lib/prisma";
import { createCaddiePrivacy } from "./privacy";
import { buildCaddieTools } from "./tools";

const TTL_MS = 15 * 60_000;
const MAX_VIEWERS = 100;
type Session = { expiresAt: number; privacy: ReturnType<typeof createCaddiePrivacy> };
// Kun lokale referanser, avgrenset per autentisert bruker. Ingen PII eller
// referansekart blir lagt i MCP-respons, logger, cookies eller et delt cachelag.
// Ved prosessbytte/utløp må klienten søke på nytt. Gamle referanser feiler lukket.
const sessions = new Map<string, Session>();

export async function buildPrivateMcpCaddieTools(viewer: { id: string; role: string }) {
  if (!viewer.id || viewer.role !== "ADMIN") throw new Error("Ikke autorisert");
  const now = Date.now();
  for (const [id, session] of sessions) if (session.expiresAt <= now) sessions.delete(id);
  let session = sessions.get(viewer.id);
  if (!session) {
    const identities = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true }, orderBy: { id: "asc" },
    });
    session = { expiresAt: now + TTL_MS, privacy: createCaddiePrivacy(identities) };
    // Samtidige førstegangskall skal dele kartet som først ble publisert.
    session = sessions.get(viewer.id) ?? session;
    if (sessions.size >= MAX_VIEWERS) {
      const oldest = sessions.keys().next().value;
      if (oldest) sessions.delete(oldest);
    }
    sessions.set(viewer.id, session);
  }
  return session.privacy.tools(buildCaddieTools(viewer));
}
