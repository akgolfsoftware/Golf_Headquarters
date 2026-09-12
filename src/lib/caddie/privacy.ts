import { createHash, randomUUID } from "node:crypto";
import type { ToolSet, UIMessage } from "ai";
import { erTillattCaddieModellStrengfelt } from "./modell-felt";

type Identity = { id: string; name: string; email: string; phone?: string | null };
type Proposal = { toolName: string; toolCallId: string; input: Record<string, unknown>; output: Record<string, unknown> };
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const privateKeys = /^(email|phone|authId|address|birthDate|dateOfBirth|avatarUrl|stripe\w+)$/i;
// Også titler og ressursnavn kan nevne ukjente personer, med vilkårlig
// skrivemåte. Regex er ingen garanti for anonymisering av disse DB-feltene.
// Modellen får referanser og strukturerte golfverdier i stedet.
const omittedTextKeys = /^(name|title|homeClub|format|notes|rationale|coachFeedback|ambition|description)$/;
const golfTerms = new Set(["Strokes Gained", "Team Norway", "Driving Range", "Putting Green"]);

/** Kartet lever kun i denne forespørselen. Det sendes aldri til modellen. */
export function createCaddiePrivacy(identities: Identity[]) {
  const label = (id: string) => `Spiller-${createHash("sha256").update(id).digest("hex").slice(0, 12)}`;
  const identityIds = new Set(identities.map((person) => person.id));
  const replacements = new Map<string, string>();
  const references = new Map<string, string>();
  const internal = new Map<string, string>();
  const searchNames = new Map<string, string>();
  const nonce = randomUUID().slice(0, 8);
  const reference = (id: string) => {
    if (internal.has(id)) return id;
    const existing = references.get(id);
    if (existing) return existing;
    const alias = `ref_${nonce}_${references.size + 1}`;
    references.set(id, alias);
    internal.set(alias, id);
    return alias;
  };
  for (const person of identities) {
    reference(person.id);
    const pseudonym = label(person.id);
    searchNames.set(pseudonym, person.name);
    for (const value of [person.name, ...person.name.split(/\s+/), person.email, person.phone]) {
      if (value && value.trim().length > 1) {
        const key = value.trim().toLocaleLowerCase("nb");
        const previous = replacements.get(key);
        if (previous && previous !== pseudonym) {
          // Delte fornavn/fullnavn må gi et navnesøk, aldri velge den første
          // personen i registeret på vegne av brukeren.
          const query = `Spillersøk-${createHash("sha256").update(key).digest("hex").slice(0, 12)}`;
          replacements.set(key, query);
          searchNames.set(query, value.trim());
        } else replacements.set(key, pseudonym);
      }
    }
  }
  const names = [...replacements].sort((a, b) => b[0].length - a[0].length);
  const nameLookup = new Map(names.map(([name, alias]) => [name.toLocaleLowerCase("nb"), alias]));
  const namePattern = names.length ? new RegExp(`(?<![\\p{L}\\p{N}_])(?:${names.map(([name]) => escape(name)).join("|")})(?![\\p{L}\\p{N}_])`, "giu") : null;

  function text(value: string, detectUnknownNames = true): string {
    let result = value;
    if (namePattern) result = result.replace(namePattern, (match) => nameLookup.get(match.toLocaleLowerCase("nb")) ?? "[navn fjernet]");
    for (const [raw, alias] of [...references].sort((a, b) => b[0].length - a[0].length)) result = result.split(raw).join(alias);
    result = result
      .replace(/[\p{L}\p{N}._%+\-]+@[\p{L}\p{N}.\-]+\.[\p{L}]{2,}/gu, "[e-post fjernet]")
      .replace(/\bhttps?:\/\/\S+/gi, "[lenke fjernet]")
      .replace(/(?<![\p{L}\p{N}_])\d{6}[ -]?\d{5}(?![\p{L}\p{N}_])/gu, "[identifikator fjernet]")
      .replace(/(?<![\p{L}\p{N}_])(?:\+47[ -]?)?(?:\d[ -]?){8}(?![\p{L}\p{N}_])/gu, (match) => /^\d{4}-\d{2}-\d{2}\s?$/.test(match) ? match : "[telefon fjernet]");
      // Konservativ ekstrabeskyttelse for ukjente fulle personnavn i fritekst.
      // Dette er ikke en generell identitetsdetektor (se testenes avgrensning).
    return detectUnknownNames ? result.replace(/(?<!\p{L})\p{Lu}[\p{Ll}]+(?:[-'][\p{Lu}\p{Ll}]+)?(?:\s+\p{Lu}[\p{Ll}]+(?:[-'][\p{Lu}\p{Ll}]+)?){1,3}/gu,
      (match) => /Spiller(?:søk)?$/.test(match) || golfTerms.has(match) ? match : "[navn fjernet]") : result;
  }

  function output(value: unknown, key = "", fromDatabase = true): unknown {
    if (privateKeys.test(key)) return "[utelatt]";
    // Preview settes sammen fra DB-navn også for modellens skriveforslag.
    if (key === "previewText" && value != null) return "[fritekst utelatt]";
    if (fromDatabase && omittedTextKeys.test(key) && value != null) return "[fritekst utelatt]";
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "string") {
      // Providerens transport-ID er allerede kjent for modellen. Den må være
      // stabil i lagret historikk så et forslag kan godkjennes etter reload.
      if (key === "toolCallId") return value;
      if (/^(id|.*Id|slug|serviceTypeSlug)$/.test(key)) return reference(value);
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return value;
      if (fromDatabase && !erTillattCaddieModellStrengfelt(key)) return "[fritekst utelatt]";
      return text(value);
    }
    if (Array.isArray(value)) return value.map((item) => output(item, "", fromDatabase));
    if (value && typeof value === "object") {
      const rawId = "id" in value && typeof value.id === "string" ? internal.get(value.id) ?? value.id : null;
      const personId = rawId && identityIds.has(rawId) ? rawId : null;
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, k === "name" && personId ? label(personId) : output(v, k, fromDatabase)]));
    }
    return value;
  }

  function restore(value: unknown): unknown {
    if (typeof value === "string") {
      let result = value;
      for (const [alias, raw] of [...internal].sort((a, b) => b[0].length - a[0].length)) result = result.split(alias).join(raw);
      return result;
    }
    if (Array.isArray(value)) return value.map(restore);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, restore(val)]));
    return value;
  }

  function messages(input: UIMessage[]): UIMessage[] {
    // Nettleseren er ikke en autoritativ kilde til tool-resultater, systemprompt
    // eller vedlegg. Bare teksthistorikk går videre, gjennom samme tekstgrense.
    return input.filter((message) => message.role === "user" || message.role === "assistant").map((message, index) => {
      const raw = message as UIMessage & { content?: unknown };
      const parts = Array.isArray(raw.parts)
        ? raw.parts.filter((part) => part.type === "text").map((part) => ({ type: "text" as const, text: text(part.text) }))
        : typeof raw.content === "string" ? [{ type: "text" as const, text: text(raw.content) }] : [];
      return { id: `message-${index}`, role: message.role, parts };
    }).filter((message) => message.parts.length > 0);
  }

  function tools(source: ToolSet, onProposal?: (proposal: Proposal) => Promise<void>): ToolSet {
    return Object.fromEntries(Object.entries(source).map(([name, definition]) => [name, {
      ...definition,
      execute: definition.execute ? async (input: unknown, options: Parameters<NonNullable<typeof definition.execute>>[1]) => {
        try {
          // Bare serverens kart kan oversette en modellreferanse til intern ID.
          // Originalt verktøy gjør tilgangskontrollen ETTER oversettelsen.
          const restored = restore(input);
          if (name === "searchPlayers" && restored && typeof restored === "object" && "query" in restored && typeof restored.query === "string") {
            restored.query = searchNames.get(restored.query) ?? restored.query;
          }
          const result = await definition.execute!(restored, options);
          if (result && typeof result === "object" && "ok" in result && result.ok === false) {
            return { ok: false, error: "Ressursen er ikke tilgjengelig", userMessage: "Kunne ikke hente eller forberede forespurt ressurs." };
          }
          if (onProposal && result && typeof result === "object" && "needsApproval" in result && result.needsApproval === true) {
            await onProposal({ toolName: name, toolCallId: options.toolCallId, input: restored as Record<string, unknown>, output: result });
          }
          // Fakturautkastets tekst bygges fra DB (bl.a. fri description), ikke
          // fra modellens input. Fullt utkast er allerede lagret lokalt over.
          const modelResult = name === "draftInvoiceReminder" && result && typeof result === "object"
            ? { ...result, subject: "[fritekst utelatt]", body: "[fritekst utelatt]" }
            : result;
          return output(modelResult, "", !name.startsWith("draft"));
        } catch {
          return { ok: false, error: "Verktøyet kunne ikke fullføres", userMessage: "Prøv igjen senere." };
        }
      } : undefined,
    }]));
  }
  return { text, output, restore, messages, tools };
}
