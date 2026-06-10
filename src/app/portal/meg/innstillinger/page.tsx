/**
 * Innstillinger — /portal/meg/innstillinger, portet FRA fersk Claude Design-fasit:
 *   public/design-handover/AK Golf HQ Design System/playerhq-app/ph-screens.jsx
 *   (InnstillingerScreen, linje 678–707) via MeSub/SetGroup/SetRow-primitivene.
 *
 * Element-liste (fasit, topp → bunn):
 *   1. MeSub-header: eyebrow MEG · INNSTILLINGER + "Innstillinger" + lead
 *   2. VARSLER: 4 toggle-rader (klient, ekte preferences-felter, lagres ved toggle)
 *   3. INTEGRASJONER: TrackMan (chip fra ekte data) · Garmin/Apple Watch
 *      («Koble til» → integrasjoner-sida) · Golfbox (chip fra ekte runde-data)
 *   4. APP: Enheter (Meter) · Språk (ekte preferanse) · Mørk modus (AV, låst —
 *      PlayerHQ er alltid lys per låst beslutning; meta «Kommer senere»)
 *   5. SIKKERHET: Endre passord («Endre» → /auth/forgot-password) · BankID
 *      (ingen ekte verifisering i schema → neutral «Ikke verifisert») ·
 *      Aktive enheter («—» — ingen ekte enhetsliste ennå, aldri liksom-tall)
 *
 * Server component. Auth-guard beholdt (requirePortalUser).
 */

import Link from "next/link";
import { Flag, Globe, Lock, Moon, Radar, Ruler, Shield, Smartphone, Watch } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { MeSub, SetGroup, SetRow, SetVal } from "@/components/portal/meg/meg-sub";
import { Toggle } from "@/components/portal/meg/toggle";
import { AthleticBadge } from "@/components/athletic/badge";
import { buttonClasses } from "@/components/ui/button";
import { VarslerToggles } from "./varsler-toggles";

export const dynamic = "force-dynamic";

export default async function InnstillingerPage() {
  const user = await requirePortalUser();
  const prefs = lesPreferences(user);

  // Ekte integrasjonsstatus: chip «På» kun når data faktisk finnes.
  const [tmCount, rundeCount] = await Promise.all([
    prisma.trackManSession.count({ where: { userId: user.id } }).catch(() => 0),
    prisma.round.count({ where: { userId: user.id } }).catch(() => 0),
  ]);
  const tmTilkoblet = tmCount > 0;
  const golfboxTilkoblet = rundeCount > 0;

  return (
    <MeSub
      eyebrow="MEG · INNSTILLINGER"
      title="Innstillinger"
      lead="Varsler, integrasjoner, enheter og sikkerhet."
    >
      <VarslerToggles initial={prefs.notif} />

      <SetGroup label="INTEGRASJONER">
        <SetRow
          icon={Radar}
          title="TrackMan"
          meta={tmTilkoblet ? `Tilkoblet · ${tmCount} økter` : "Ingen økter importert ennå"}
          right={
            <AthleticBadge variant={tmTilkoblet ? "ok" : "neutral"}>
              {tmTilkoblet ? "På" : "Av"}
            </AthleticBadge>
          }
        />
        <SetRow
          icon={Watch}
          title="Garmin / Apple Watch"
          meta="Søvn & hvilepuls"
          right={
            <Link
              href="/portal/meg/innstillinger/integrasjoner"
              className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
              Koble til
            </Link>
          }
        />
        <SetRow
          icon={Flag}
          title="Golfbox"
          meta="Runder & handicap"
          right={
            <AthleticBadge variant={golfboxTilkoblet ? "ok" : "neutral"}>
              {golfboxTilkoblet ? "På" : "Av"}
            </AthleticBadge>
          }
        />
      </SetGroup>

      <SetGroup label="APP">
        <SetRow icon={Ruler} title="Enheter" meta="Avstand og hastighet" right={<SetVal>Meter</SetVal>} />
        <SetRow
          icon={Globe}
          title="Språk"
          right={<SetVal>{prefs.spraak === "en" ? "English" : "Norsk"}</SetVal>}
        />
        <SetRow
          icon={Moon}
          title="Mørk modus"
          meta="Kommer senere"
          right={
            <span className="pointer-events-none opacity-50">
              <Toggle on={false} label="Mørk modus (kommer senere)" />
            </span>
          }
        />
      </SetGroup>

      <SetGroup label="SIKKERHET">
        <SetRow
          icon={Lock}
          title="Endre passord"
          right={
            <Link
              href="/auth/forgot-password"
              className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
              Endre
            </Link>
          }
        />
        <SetRow
          icon={Shield}
          title="BankID"
          meta="Identitetsbekreftelse"
          right={<AthleticBadge variant="neutral">Ikke verifisert</AthleticBadge>}
        />
        <SetRow
          icon={Smartphone}
          title="Aktive enheter"
          meta="Full enhetsliste kommer senere"
          right={<SetVal>—</SetVal>}
        />
      </SetGroup>
    </MeSub>
  );
}
