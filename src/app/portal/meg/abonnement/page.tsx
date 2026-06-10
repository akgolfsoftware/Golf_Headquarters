/**
 * PlayerHQ · Meg · Abonnement (/portal/meg/abonnement) — portet FRA fersk
 * Claude Design-fasit: ph-screens.jsx (AbonnementScreen) via MeSub-skallet.
 *
 * Ingen tier-nivåer: appen er gratis via aktiv coaching-pakke (Performance /
 * Performance Pro = credits), ellers 300 kr/mnd. ELITE vises ALDRI.
 *
 * Struktur: Abonnementskort (delt med /portal/meg) → STATUS (4 SetRow med
 * EKTE data fra getAbonnementData: gratis-status, pakkenavn fra credits,
 * fornyelsesdato; «—» der data mangler) → HVA SOM INNGÅR (5 SetRow) →
 * «Se fakturaer» + «Administrer pakke».
 *
 * Server component. Auth-guard via requirePortalUser.
 */

import Link from "next/link";
import {
  Calendar,
  Check,
  CheckCircle2,
  Package,
  Receipt,
  Tag,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getAbonnementData } from "@/lib/portal-abonnement/abonnement-data";
import { MeSub, SetGroup, SetRow, SetVal } from "@/components/portal/meg/meg-sub";
import { Abonnementskort } from "@/components/portal/meg/meg-profil";
import { AthleticBadge } from "@/components/athletic/badge";

export const dynamic = "force-dynamic";

const INNGAAR = [
  "Treningsplan & Workbench",
  "Live-økter & logging",
  "Strokes Gained & TrackMan",
  "Direkte coach-kontakt",
  "AI-Caddie (inngang)",
] as const;

const sekundaerKnapp =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-primary px-4 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-primary transition-colors hover:bg-primary/5";

function formatDato(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function AbonnementPage() {
  const user = await requirePortalUser();
  const data = await getAbonnementData(user.id);

  // Coaching-pakke utledes fra credits (samme regel som lib/portal-meg/profil-data).
  const harPakke = data.monthlyCredits > 0;
  const planNavn = data.monthlyCredits >= 4 ? "Performance Pro" : harPakke ? "Performance" : null;
  // LÅST regel: aktiv coaching-pakke ⇒ appen er GRATIS. Betalende = PRO-tier UTEN pakke.
  const gratis = harPakke || !data.erPro;
  const fornyes = formatDato(data.nesteTrekk);

  return (
    <MeSub
      eyebrow="MEG · ABONNEMENT"
      title="Inkludert i"
      italic="coaching."
      lead="PlayerHQ har ingen nivåer — appen er gratis så lenge du har en aktiv coaching-pakke, ellers 300 kr/mnd."
    >
      <div className="mb-[22px]">
        <Abonnementskort a={{ gratis, planNavn }} />
      </div>

      <SetGroup label="STATUS">
        <SetRow
          icon={CheckCircle2}
          title="App-tilgang"
          meta={gratis ? (harPakke ? "Aktiv via coaching-pakke" : "Aktiv") : "Eget abonnement"}
          right={
            <AthleticBadge variant={gratis ? "ok" : "neutral"}>
              {gratis ? "Gratis" : "300 kr/mnd"}
            </AthleticBadge>
          }
        />
        <SetRow
          icon={Package}
          title="Coaching-pakke"
          meta={planNavn ?? "Ingen aktiv pakke"}
          right={<SetVal>{harPakke ? "Aktiv" : "—"}</SetVal>}
        />
        {fornyes && (
          <SetRow icon={Calendar} title="Fornyes" meta={fornyes} right={<SetVal>Auto</SetVal>} />
        )}
        <SetRow
          icon={Tag}
          title="Egen app-pris uten pakke"
          meta="Om coaching avsluttes"
          right={<SetVal>300 kr/mnd</SetVal>}
        />
      </SetGroup>

      <SetGroup label="HVA SOM INNGÅR">
        {INNGAAR.map((f) => (
          <SetRow key={f} icon={Check} title={f} />
        ))}
      </SetGroup>

      <div className="flex flex-wrap gap-2.5">
        <Link href="/portal/meg/dokumenter" className={sekundaerKnapp}>
          <Receipt className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Se fakturaer
        </Link>
        <Link href="/portal/booking" className={sekundaerKnapp}>
          Administrer pakke
        </Link>
      </div>
    </MeSub>
  );
}
