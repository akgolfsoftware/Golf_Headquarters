// Agent-wrapper: Caddie med valgt spiller som kontekst.
//
// Brukes fra Coach Workbench der coachen har valgt en spesifikk spiller i UI.
// Wrapperen injiserer spillerId i system-prompten slik at Caddie automatisk
// vet hvilken spiller all tool-bruk skal gjelde — coach trenger ikke nevne
// navnet i hver melding.
//
// Selve tool-context-injection skjer via prompt-instruksjon. Tools får
// spillerId som arg fra modellen (som ser den i system-prompten).

import "server-only";
import { chatCaddie, type ChatCaddieResult } from "./caddie";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";

export type ChatCaddieMedSpillerOpts = {
  messages: { role: "user" | "assistant"; content: string }[];
  spillerId: string;
  coachId: string;
  maxToolIterations?: number;
};

export async function chatCaddieMedSpiller(
  opts: ChatCaddieMedSpillerOpts,
): Promise<ChatCaddieResult> {
  const spillerContext = `
VALGT SPILLER (kontekst for hele samtalen):
spillerId = "${opts.spillerId}"

Coach har valgt denne spilleren i workbench. Når coach refererer til
"spilleren", "han", "hun", eller stiller spørsmål uten å nevne navn:
forutsett at det gjelder spilleren med spillerId="${opts.spillerId}".

Bruk get_spiller, get_runder, get_sg_data, get_treningsplan med
spillerId="${opts.spillerId}" når du trenger data.

Hent get_spiller først hvis du ikke har spillerens navn — bruk navnet i svar.
`.trim();

  // Konverter messages til MessageParam-format (Anthropic SDK).
  const messages: MessageParam[] = opts.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  return chatCaddie({
    messages,
    userId: opts.coachId,
    systemPrefix: spillerContext,
    maxToolIterations: opts.maxToolIterations ?? 5,
  });
}
