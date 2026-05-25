// Eksporterer alle Tools og en navn → exec-funksjon-mapping.
//
// Når en agent får tool_use-respons fra Anthropic, ser den opp toolet i
// `EXEC_BY_NAME` og kjører riktig handler. Når du legger til ny Tool:
// 1) opprett fil i tools/, 2) export fra denne fila, 3) legg til i
//    ALL_TOOLS og EXEC_BY_NAME.

import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import { getSpillerTool, execGetSpiller } from "./get-spiller";
import { getRunderTool, execGetRunder } from "./get-runder";
import { getSgDataTool, execGetSgData } from "./get-sg-data";
import { getTreningsplanTool, execGetTreningsplan } from "./get-treningsplan";

export {
  getSpillerTool,
  execGetSpiller,
  getRunderTool,
  execGetRunder,
  getSgDataTool,
  execGetSgData,
  getTreningsplanTool,
  execGetTreningsplan,
};

export const ALL_TOOLS: Tool[] = [
  getSpillerTool,
  getRunderTool,
  getSgDataTool,
  getTreningsplanTool,
];

// Mapping fra tool-navn til exec-funksjon. `input` er det Anthropic returnerer
// i tool_use-blokken. Vi typer det som `unknown` her og lar hver exec-funksjon
// validere internt. (Strengere typing kan legges på i senere fase med zod.)
export const EXEC_BY_NAME: Record<
  string,
  (input: unknown) => Promise<unknown>
> = {
  get_spiller: (input) => execGetSpiller(input as { spillerId: string }),
  get_runder: (input) =>
    execGetRunder(input as { spillerId: string; limit?: number }),
  get_sg_data: (input) =>
    execGetSgData(input as { spillerId: string; runderCount?: number }),
  get_treningsplan: (input) =>
    execGetTreningsplan(
      input as { spillerId: string; inkluderArkiverte?: boolean },
    ),
};
