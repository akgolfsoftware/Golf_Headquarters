// Rene aggregeringshjelpere for coach-eval-rapporten (scripts/coach-eval.ts).
// Ingen I/O — testbare uten mocks.
//
// Hovedmetrikk (fra Fable 5-syntesen): «godkjent uendret»-rate ≥ 60 % er
// signalet på at AI-forslagene holder verdensklasse-nivå. Under det: les
// avvisningsgrunnene og redigeringene — de er treningsdata for agentene.

export type DecisionRow = {
  agentName: string;
  actionType: string;
  status: string; // PENDING | ACCEPTED | REJECTED
  editedBeforeApproval: boolean;
  rejectReason: string | null;
  createdAt: Date;
  decidedAt: Date | null;
};

export type AgentMetrics = {
  agentName: string;
  actionType: string;
  total: number;
  pending: number;
  accepted: number;
  acceptedUnchanged: number;
  acceptedEdited: number;
  rejected: number;
  /** acceptedUnchanged / (accepted + rejected). null uten beslutninger. */
  approvedUnchangedRate: number | null;
  /** Median timer fra opprettet til besluttet. null uten decidedAt-data. */
  medianDecisionHours: number | null;
  rejectReasons: string[];
};

export function computeAgentMetrics(rows: DecisionRow[]): AgentMetrics[] {
  const grupper = new Map<string, DecisionRow[]>();
  for (const row of rows) {
    const key = `${row.agentName}::${row.actionType}`;
    const eksisterende = grupper.get(key);
    if (eksisterende) eksisterende.push(row);
    else grupper.set(key, [row]);
  }

  const ut: AgentMetrics[] = [];
  for (const [key, gruppe] of grupper) {
    const [agentName, actionType] = key.split("::");
    const accepted = gruppe.filter((r) => r.status === "ACCEPTED");
    const acceptedUnchanged = accepted.filter((r) => !r.editedBeforeApproval).length;
    const rejected = gruppe.filter((r) => r.status === "REJECTED");
    const decided = accepted.length + rejected.length;

    const latenser = gruppe
      .filter((r) => r.decidedAt !== null)
      .map((r) => (r.decidedAt!.getTime() - r.createdAt.getTime()) / 3_600_000)
      .sort((a, b) => a - b);

    ut.push({
      agentName,
      actionType,
      total: gruppe.length,
      pending: gruppe.filter((r) => r.status === "PENDING").length,
      accepted: accepted.length,
      acceptedUnchanged,
      acceptedEdited: accepted.length - acceptedUnchanged,
      rejected: rejected.length,
      approvedUnchangedRate: decided > 0 ? acceptedUnchanged / decided : null,
      medianDecisionHours: latenser.length > 0 ? median(latenser) : null,
      rejectReasons: rejected
        .map((r) => r.rejectReason)
        .filter((r): r is string => r !== null && r.length > 0),
    });
  }

  // Verst først — lav godkjent-uendret-rate øverst (null = ingen data sist).
  return ut.sort((a, b) => {
    if (a.approvedUnchangedRate === null) return 1;
    if (b.approvedUnchangedRate === null) return -1;
    return a.approvedUnchangedRate - b.approvedUnchangedRate;
  });
}

export function totalsummer(metrics: AgentMetrics[]): {
  decided: number;
  approvedUnchangedRate: number | null;
} {
  const accepted = metrics.reduce((s, m) => s + m.accepted, 0);
  const rejected = metrics.reduce((s, m) => s + m.rejected, 0);
  const unchanged = metrics.reduce((s, m) => s + m.acceptedUnchanged, 0);
  const decided = accepted + rejected;
  return {
    decided,
    approvedUnchangedRate: decided > 0 ? unchanged / decided : null,
  };
}

function median(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
