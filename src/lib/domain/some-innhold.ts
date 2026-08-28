/**
 * Ren SoMe-utkast-logikk — parsing og demo-fallback uten Prisma.
 * Agenten (src/lib/agents/social-media-agent.ts) kaller AI og persisterer.
 */
import { z } from "zod";

export const SOME_PLATTFORMER = ["instagram", "facebook"] as const;
export type SoMePlattform = (typeof SOME_PLATTFORMER)[number];

export const soMePostSchema = z.object({
  plattform: z.enum(SOME_PLATTFORMER),
  tekst: z.string().trim().min(1).max(2200),
  vinkel: z.string().trim().min(1).max(200),
});

export const soMePlattformFeltSchema = z.object({
  plattform: z.enum(SOME_PLATTFORMER),
});

export const soMeForslagSchema = z.object({
  poster: z.array(soMePostSchema).min(1).max(4),
});

export type SoMePost = z.infer<typeof soMePostSchema>;

export type SoMeTreningsrad = {
  tittel: string;
  pyramide: string;
  dato: string;
};

function trekkJsonObjekt(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = text.indexOf("{");
  const slutt = text.lastIndexOf("}");
  if (start >= 0 && slutt > start) return text.slice(start, slutt + 1);
  return null;
}

export function parseSoMePoster(text: string): SoMePost[] {
  const raw = trekkJsonObjekt(text);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    const ok = soMeForslagSchema.safeParse(parsed);
    if (ok.success) return ok.data.poster;
    if (Array.isArray(parsed)) {
      const poster = parsed.flatMap((p) => {
        const en = soMePostSchema.safeParse(p);
        return en.success ? [en.data] : [];
      });
      return poster.slice(0, 4);
    }
    return [];
  } catch {
    return [];
  }
}

export function byggDemoSoMePoster(okter: readonly SoMeTreningsrad[]): SoMePost[] {
  const pyramide = okter[0]?.pyramide?.trim() || "TEK";
  const tittel = okter[0]?.tittel?.trim() || "kort økt";
  return [
    {
      plattform: "instagram",
      vinkel: "treningstips",
      tekst: `Kort grep fra ukas trening (${pyramide}): én ting om gangen — ${tittel.toLowerCase()}. Ti repetisjoner, så ferdig. Hva jobber du med denne uka?`,
    },
    {
      plattform: "facebook",
      vinkel: "akademi",
      tekst: `Tips fra treningene i uka: spill mer med den kølla du stoler minst på. Der ligger scoringen. AK Golf Academy — ${pyramide}.`,
    },
  ];
}
