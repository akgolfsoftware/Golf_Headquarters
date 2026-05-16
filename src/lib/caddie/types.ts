// Felles typer for Caddie MCP-tools.
// Returverdier for read- og write-tools, samt approval-strukturer.

export type ToolErrorResponse = {
  ok: false;
  error: string;
  /** Brukervennlig norsk feilmelding som kan vises i UI */
  userMessage: string;
};

export type ToolSuccessResponse<T> = {
  ok: true;
  data: T;
};

export type ToolResult<T> = ToolSuccessResponse<T> | ToolErrorResponse;

// ---------- Approval-typer for write-tools ----------

export type DraftMessageProposal = {
  type: "DRAFT_MESSAGE";
  needsApproval: true;
  playerId: string;
  subject: string;
  body: string;
  previewText: string;
};

export type DraftBookingProposal = {
  type: "DRAFT_BOOKING";
  needsApproval: true;
  playerId: string;
  startAt: string;
  serviceTypeSlug: string;
  locationId: string;
  notes?: string;
  previewText: string;
};

export type DraftInvoiceReminderProposal = {
  type: "DRAFT_INVOICE_REMINDER";
  needsApproval: true;
  invoiceId: string;
  subject: string;
  body: string;
  previewText: string;
};

export type DraftPlayerNoteProposal = {
  type: "DRAFT_PLAYER_NOTE";
  needsApproval: true;
  playerId: string;
  note: string;
  previewText: string;
};

export type DraftPlanAdjustmentProposal = {
  type: "DRAFT_PLAN_ADJUSTMENT";
  needsApproval: true;
  playerId: string;
  change: string;
  reason?: string;
  previewText: string;
};

export type ApprovalProposal =
  | DraftMessageProposal
  | DraftBookingProposal
  | DraftInvoiceReminderProposal
  | DraftPlayerNoteProposal
  | DraftPlanAdjustmentProposal;

// ---------- Helpers ----------

/** Standardisert feilrespons for Prisma-feil og lignende. */
export function toolError(message: string, userMessage?: string): ToolErrorResponse {
  return {
    ok: false,
    error: message,
    userMessage: userMessage ?? "Noe gikk galt under henting av data. Prøv igjen.",
  };
}
