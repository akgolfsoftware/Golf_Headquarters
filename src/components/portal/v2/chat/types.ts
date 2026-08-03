// Delte typer for portal-chat-UI. Speiler samme mønster som Caddies
// admin/caddie/types.ts — en enkel, UI-vennlig form vi mapper AI SDK sine
// UIMessage-parts til, uten Caddies godkjenningsflyt (portal-chat har kun
// auto-approved lese-verktøy).

export type PortalChatRole = "user" | "assistant" | "system";

export type PortalToolCallState = "calling" | "result" | "error";

export type PortalToolCall = {
  id: string;
  toolName: string;
  input: Record<string, unknown>;
  /** Rått verktøy-resultat — { ok, data|error, tookMs }, se src/lib/portal-chat/tools.ts. */
  output?: {
    ok?: boolean;
    data?: unknown;
    error?: string;
    userMessage?: string;
    tookMs?: number;
  };
  state: PortalToolCallState;
};

export type PortalChatMessagePart =
  | { type: "text"; text: string }
  | { type: "tool-call"; toolCall: PortalToolCall };

export type PortalChatMessage = {
  id: string;
  role: PortalChatRole;
  parts: PortalChatMessagePart[];
};
