import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { lastAgenticosGodkjennCount, lastAgenticosRuntimeLinje } from "@/lib/agencyos/last-agenticos";
import { AgenticosSkall } from "./AgenticosSkall";
import type { ReactNode } from "react";

export async function AgenticosRamme({
  user,
  children,
}: {
  user: { id: string; role: string; name: string | null; avatarUrl?: string | null };
  children: ReactNode;
}) {
  const [godkjennCount, runtimeLinje] = await Promise.all([
    lastAgenticosGodkjennCount(user),
    lastAgenticosRuntimeLinje(),
  ]);
  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <div className="agn-legacy">
      <AgenticosSkall godkjennCount={godkjennCount} runtimeLinje={runtimeLinje}>
        {children}
      </AgenticosSkall>
    </div>
    </AgencyOSSkall>
  );
}
