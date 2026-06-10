"use client";

/**
 * VarslerToggles — VARSLER-gruppa på /portal/meg/innstillinger (fersk fasit:
 * ph-screens.jsx InnstillingerScreen). 4 SetRow med Toggle, koblet mot EKTE
 * preferences-felter i User.preferences (lagres via oppdaterPreferences ved
 * hvert toggle, optimistisk lokal state — samme mønster som notif-toggles).
 *
 * Mapping fasit → ekte felt:
 *   Push-varsler   → notif.push
 *   E-postvarsler  → notif.epost
 *   Coach-meldinger → notif.nyMeldingFraCoach
 *   Innsikt klar   → notif.ukentligRapport (fasitens state-nøkkel "summary")
 */

import { useState, useTransition } from "react";
import { Bell, Mail, MessagesSquare, TrendingUp } from "lucide-react";
import { SetGroup, SetRow } from "@/components/portal/meg/meg-sub";
import { Toggle } from "@/components/portal/meg/toggle";
import { oppdaterPreferences } from "../actions";
import type { UserPreferences } from "@/lib/preferences";

type Notif = UserPreferences["notif"];
type NotifKey = "push" | "epost" | "nyMeldingFraCoach" | "ukentligRapport";

export function VarslerToggles({ initial }: { initial: Notif }) {
  const [notif, setNotif] = useState(initial);
  const [, startTransition] = useTransition();

  function toggle(felt: NotifKey) {
    const oppdatert = { ...notif, [felt]: !notif[felt] };
    setNotif(oppdatert);
    startTransition(async () => {
      await oppdaterPreferences({ notif: oppdatert });
    });
  }

  return (
    <SetGroup label="VARSLER">
      <SetRow
        icon={Bell}
        title="Push-varsler"
        meta="Økter, planendringer, meldinger"
        right={<Toggle on={notif.push} onClick={() => toggle("push")} label="Push-varsler" />}
      />
      <SetRow
        icon={Mail}
        title="E-postvarsler"
        meta="Ukentlig oppsummering"
        right={<Toggle on={notif.epost} onClick={() => toggle("epost")} label="E-postvarsler" />}
      />
      <SetRow
        icon={MessagesSquare}
        title="Coach-meldinger"
        meta="Varsle ved ny melding fra coachen"
        right={
          <Toggle
            on={notif.nyMeldingFraCoach}
            onClick={() => toggle("nyMeldingFraCoach")}
            label="Coach-meldinger"
          />
        }
      />
      <SetRow
        icon={TrendingUp}
        title="Innsikt klar"
        meta="Når nye funn er beregnet"
        right={
          <Toggle
            on={notif.ukentligRapport}
            onClick={() => toggle("ukentligRapport")}
            label="Innsikt klar"
          />
        }
      />
    </SetGroup>
  );
}
