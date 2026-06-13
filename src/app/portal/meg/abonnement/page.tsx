/**
 * PlayerHQ · Meg · Abonnement (/portal/meg/abonnement) — portet FRA fersk
 * Claude Design-fasit: ph-screens.jsx (AbonnementScreen) via MeSub-skallet.
 *
 * Ingen tier-nivåer: appen er gratis via aktiv coaching-pakke (Performance /
 * Performance Pro = credits), ellers 300 kr/mnd. ELITE vises ALDRI.
 *
 * Struktur: status-banners (ok/cancelled/avbestilt fra searchParams +
 * PAST_DUE fra DB) → Abonnementskort (delt med /portal/meg) → STATUS
 * (4 SetRow med EKTE data fra getAbonnementData) → HVA SOM INNGÅR (5 SetRow)
 * → HANDLINGER (oppgrader/endre kort/avbestill, betinget av status) →
 * FAKTURAER (inntil 5 + «Alle dokumenter») → «Administrer pakke».
 *
 * Server component (alle CTA-er er <Link>). Auth-guard via requirePortalUser.
 */

import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  Info,
  Package,
  Receipt,
  Sparkles,
  Tag,
  XCircle,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getAbonnementData } from "@/lib/portal-abonnement/abonnement-data";
import { MeSub, SetGroup, SetLinkRow, SetRow, SetVal } from "@/components/portal/meg/meg-sub";
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

export default async function AbonnementPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; cancelled?: string; avbestilt?: string }>;
}) {
  const sp = await searchParams;
  const user = await requirePortalUser();
  const data = await getAbonnementData(user.id);

  // Coaching-pakke utledes fra credits (samme regel som lib/portal-meg/profil-data).
  const harPakke = data.monthlyCredits > 0;
  const planNavn = data.monthlyCredits >= 4 ? "Performance Pro" : harPakke ? "Performance" : null;
  // LÅST regel: aktiv coaching-pakke ⇒ appen er GRATIS. Betalende = PRO-tier UTEN pakke.
  const gratis = harPakke || !data.erPro;
  const fornyes = formatDato(data.nesteTrekk);
  const betalingFeilet = data.status === "PAST_DUE";
  // PAST_DUE skjules bevisst fra oppgradering: ny checkout oppå feilet
  // abonnement gir dobbelt-abonnement i Stripe — riktig vei er «Endre kort».
  const kanOppgradere = !data.erPro && !betalingFeilet;
  const kanEndreKort =
    data.status === "ACTIVE" || data.status === "PAST_DUE" || data.status === "TRIALING";
  const kanAvbestille = data.erPro && data.status !== "CANCELLED";

  return (
    <MeSub
      eyebrow="MEG · ABONNEMENT"
      title="Inkludert i"
      italic="coaching."
      lead="PlayerHQ har ingen nivåer — appen er gratis så lenge du har en aktiv coaching-pakke, ellers 300 kr/mnd."
    >
      {/* Status-banners — searchParams fra checkout/avbestilling + PAST_DUE fra DB.
          NB: ok=1 betyr kun at Stripe sendte brukeren tilbake — webhook-synken kan
          henge etter, så tier/status utledes ALDRI herfra. */}
      {sp.ok === "1" && (
        <div
          role="status"
          className="mb-[22px] flex items-start gap-2.5 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-foreground"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" strokeWidth={1.75} aria-hidden />
          <p>Betalingen er fullført. Det kan ta et lite øyeblikk før statusen under oppdateres.</p>
        </div>
      )}
      {sp.cancelled === "1" && (
        <div
          role="status"
          className="mb-[22px] flex items-start gap-2.5 rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm text-foreground"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
          <p>
            Betalingen ble avbrutt — ingenting er trukket fra kortet ditt.
            {kanOppgradere && (
              <>
                {" "}
                <Link
                  href="/portal/meg/abonnement/oppgrader/flyt"
                  className="font-semibold text-primary hover:underline"
                >
                  Prøv igjen
                </Link>
              </>
            )}
          </p>
        </div>
      )}
      {sp.avbestilt === "1" && (
        <div
          role="status"
          className="mb-[22px] flex items-start gap-2.5 rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm text-foreground"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
          <p>
            Abonnementet er avbestilt. Du beholder tilgangen ut inneværende periode
            {fornyes ? ` — til ${fornyes}` : ""}.
          </p>
        </div>
      )}
      {betalingFeilet && (
        <div
          role="alert"
          className="mb-[22px] rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3"
        >
          <div className="flex items-start gap-2.5 text-sm text-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" strokeWidth={1.75} aria-hidden />
            <p>Siste betaling feilet. Oppdater betalingskortet for å beholde tilgangen.</p>
          </div>
          <div className="mt-3">
            <Link
              href="/portal/meg/abonnement/kort/ny"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-destructive px-4 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-destructive transition-colors hover:bg-destructive/5"
            >
              <CreditCard className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Endre kort
            </Link>
          </div>
        </div>
      )}

      <div className="mb-[22px]">
        <Abonnementskort a={{ gratis, planNavn }} />
      </div>

      <SetGroup label="STATUS">
        <SetRow
          icon={CheckCircle2}
          title="App-tilgang"
          meta={
            betalingFeilet
              ? "Betaling utestår"
              : gratis
                ? harPakke
                  ? "Aktiv via coaching-pakke"
                  : "Aktiv"
                : "Eget abonnement"
          }
          right={
            betalingFeilet ? (
              <AthleticBadge variant="urgent">Betaling feilet</AthleticBadge>
            ) : (
              <AthleticBadge variant={gratis ? "ok" : "neutral"}>
                {gratis ? "Gratis" : "300 kr/mnd"}
              </AthleticBadge>
            )
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

      {(kanOppgradere || kanEndreKort || kanAvbestille) && (
        <SetGroup label="HANDLINGER">
          {kanOppgradere && (
            <SetLinkRow
              href="/portal/meg/abonnement/oppgrader/flyt"
              icon={Sparkles}
              title="Oppgrader til Pro"
              meta="300 kr/mnd · Stripe Checkout"
            />
          )}
          {kanEndreKort && (
            <SetLinkRow
              href="/portal/meg/abonnement/kort/ny"
              icon={CreditCard}
              title="Endre betalingskort"
              meta="Stripe-portal — kortdata lagres aldri hos oss"
            />
          )}
          {kanAvbestille && (
            <SetLinkRow
              href="/portal/meg/abonnement/avbestill"
              icon={XCircle}
              title="Avbestill abonnement"
              meta="Tilgang ut perioden — ingen nye trekk"
            />
          )}
        </SetGroup>
      )}

      {data.fakturaer.length > 0 && (
        <SetGroup label="FAKTURAER">
          {data.fakturaer.slice(0, 5).map((f) => (
            <SetLinkRow
              key={f.id}
              href={`/portal/meg/abonnement/faktura/${f.id}`}
              icon={Receipt}
              title={f.description ?? "Betaling"}
              meta={`${formatDato(f.paidAt) ?? "—"} · ${(f.amountOre / 100).toLocaleString("nb-NO")} kr`}
              right={<AthleticBadge variant="ok">Betalt</AthleticBadge>}
            />
          ))}
          <SetLinkRow href="/portal/meg/dokumenter" icon={FileText} title="Alle dokumenter" />
        </SetGroup>
      )}

      <div className="flex flex-wrap gap-2.5">
        <Link href="/portal/booking" className={sekundaerKnapp}>
          Administrer pakke
        </Link>
      </div>
    </MeSub>
  );
}
