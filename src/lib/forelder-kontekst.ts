import { z } from "zod";

/** UI-kontekst alene gir aldri tilgang. Sidene kontrollerer godkjent relasjon. */
export function forelderKontekstHref(path: string, barnId?: string | null): string {
  if (!barnId) return path;
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query); params.set("barn", barnId);
  return `${pathname}?${params}`;
}

export function velgBarnFraGodkjente<T extends { child: { id: string } }>(alle: readonly T[], id?: string | null): { barn: T[]; gyldig: boolean } {
  if (!id) return { barn: [...alle], gyldig: true };
  const barn = alle.filter((b) => b.child.id === id);
  return { barn, gyldig: barn.length === 1 };
}

export function lesForelderSamtykker(raw: unknown): Record<string, boolean> {
  const parsed = z.object({ fotoBruk: z.boolean().optional(), dataDeling: z.boolean().optional(), nyhetsbrev: z.boolean().optional(), thirdParty: z.boolean().optional() }).safeParse(raw);
  return parsed.success ? Object.fromEntries(Object.entries(parsed.data).filter((entry): entry is [string, boolean] => typeof entry[1] === "boolean")) : {};
}
