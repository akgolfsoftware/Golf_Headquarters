import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
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
    <V2Shell bredde="full" aktiv="jarvis" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      <AgenticosSkall godkjennCount={godkjennCount} runtimeLinje={runtimeLinje}>
        {children}
      </AgenticosSkall>
    </V2Shell>
  );
}
