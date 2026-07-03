/**
 * Innstillinger — /portal/meg/innstillinger, portet FRA fersk Claude Design-fasit:
 *   (historisk juni-fasit, fjernet fra repo) playerhq-app/ph-screens.jsx
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
 *   6. PERSONVERN (IKKE i fasit-JSX — bevisst funksjons-tilføyelse, review-funn B1):
 *      GDPR-inngangene (dataeksport art. 15 + sletting art. 17) er lovpålagte og
 *      mistet eneste UI-inngang i porting-omskrivingen. Lenker til eksisterende
 *      /innstillinger/personvern + /innstillinger/eksport.
 *
 * Server component. Auth-guard beholdt (requirePortalUser).
 */

import Link from "next/link";
import { Download, Flag, Globe, Lock, MapPin, Monitor, Moon, Radar, Ruler, Shield, ShieldCheck, Smartphone, Sparkles, Watch } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { MeSub, SetGroup, SetLinkRow, SetRow, SetVal } from "@/components/portal/meg/meg-sub";
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
      lead="Varsler, integrasjoner, enheter, sikkerhet og personvern."
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
          right={
            <Link
              href="/portal/meg/innstillinger/sprak"
              className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
              {prefs.spraak === "en" ? "English" : "Norsk"}
            </Link>
          }
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

      <SetGroup label="AI">
        <SetLinkRow
          href="/portal/meg/innstillinger/ai-coach"
          icon={Sparkles}
          title="AI-coach"
          meta="Datadrevet assistent · Kommer snart (V2)"
        />
      </SetGroup>

      <SetGroup label="MER">
        <SetLinkRow
          href="/portal/meg/innstillinger/anlegg"
          icon={MapPin}
          title="Anlegg og utstyr"
          meta="Hva du har tilgang til"
        />
        <SetLinkRow
          href="/portal/meg/innstillinger/okter"
          icon={Monitor}
          title="Apparater og økter"
          meta="Aktive innlogginger og enheter"
        />
      </SetGroup>

      <SetGroup label="PERSONVERN">
        <SetRow
          icon={ShieldCheck}
          title="Personvern og data"
          meta="GDPR-rettigheter, datadeling og kontosletting"
          right={
            <Link
              href="/portal/meg/innstillinger/personvern"
              className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
              Åpne
            </Link>
          }
        />
        <SetRow
          icon={Download}
          title="Last ned mine data"
          meta="Kopi av alt vi har lagret om deg"
          right={
            <Link
              href="/portal/meg/innstillinger/personvern"
              className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
              Åpne
            </Link>
          }
        />
      </SetGroup>
    </MeSub>
  );
}
