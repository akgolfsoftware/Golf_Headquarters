/**
 * Caddie chat — felles typer.
 *
 * Speiler shape fra @ai-sdk/react sin `Message` så vi senere kan bytte til
 * `useChat` uten å endre komponentene. JSON-input/-output på tool-call
 * valideres via zod når det kobles mot ekte API (M19).
 */

export type CaddieRole = "user" | "assistant" | "system";

export type CaddieToolCall = {
  id: string;
  toolName: string;
  input: Record<string, unknown>;
  output?: unknown;
  state: "calling" | "result" | "error";
  needsApproval?: boolean;
  approvalPreview?: {
    title: string;
    body: string;
    recipient?: string;
  };
};

export type CaddieMessagePart =
  | { type: "text"; text: string }
  | { type: "tool-call"; toolCall: CaddieToolCall };

export type CaddieMessage = {
  id: string;
  role: CaddieRole;
  parts: CaddieMessagePart[];
  /** ISO-tidsstempel. */
  createdAt: string;
};

export type CaddieConversation = {
  id: string;
  title: string;
  snippet: string;
  updatedAt: string;
  unread?: boolean;
};

export type CaddieChatStatus = "ready" | "streaming" | "submitted" | "error";
