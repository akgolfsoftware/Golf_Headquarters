/**
 * Zod-schemas for API-grensene (steg 5 i `docs/plan-testdekning.md`).
 *
 * `gotchas.md` har regelen «zod ved API-grenser», men målingen viste at 48 av 62
 * rutehandlere ikke refererte zod i det hele tatt. Disse tre er de som tar imot
 * ekstern JSON og gjør noe med den:
 *
 * - `inbox/inbound` skrev rå webhook-felt rett til `InnboksEpost` etter en
 *   `await request.json()` uten validering — kun avsender ble sjekket.
 * - `caddie/chat` og `kommando/chat` castet body med `as ChatRequestBody` og
 *   validerte kun `messages` med en håndskrevet type guard.
 *
 * Skjemaene bor her, ikke inline i rutene, så de kan enhetstestes uten å dra
 * inn Next-runtime, Prisma eller AI-klienten.
 */
import { z } from "zod";

/** Grense mot åpenbart misbruk — webhooken skal ta imot e-post, ikke filer. */
const MAKS_EMNE = 998; // RFC 5322 anbefalt maks linjelengde for Subject
const MAKS_BRODTEKST = 100_000;

/**
 * Avsender fra e-post-webhooken. Leverandørene sender enten et objekt
 * (`{ email, name }`) eller en rå streng (`"Navn <e@post.no>"`) — begge former
 * er i bruk, så begge må aksepteres.
 */
export const inboundAvsender = z.union([
  z.string().min(1).max(320),
  z.object({
    email: z.string().max(320).optional(),
    name: z.string().max(320).optional(),
  }),
]);

/**
 * Innkommende e-post. Alt er valgfritt i selve schemaet fordi ruten har egne,
 * tydeligere feilmeldinger for manglende avsender (`missing-from`) — schemaet
 * skal fange FORM, ikke duplisere forretningsregelen.
 */
export const inboundEpostSchema = z.object({
  from: inboundAvsender.optional(),
  subject: z.string().max(MAKS_EMNE).optional(),
  text: z.string().max(MAKS_BRODTEKST).optional(),
});

export type InboundEpost = z.infer<typeof inboundEpostSchema>;

/**
 * En UI-melding slik AI SDK-et sender den. Vi validerer kun det ruten faktisk
 * leser (`role`), og lar resten passere — schemaet skal ikke bli en kopi av
 * AI SDK-ets interne format, som endrer seg mellom versjoner.
 */
export const uiMelding = z
  .object({ role: z.string().min(1) })
  .passthrough();

/** Felles body for `caddie/chat` og `kommando/chat`. */
export const chatBodySchema = z.object({
  messages: z.array(uiMelding).min(1, "`messages` kan ikke være tom"),
  conversationId: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
});

export type ChatBody = z.infer<typeof chatBodySchema>;
