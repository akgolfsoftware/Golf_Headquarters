/**
 * PlayerHQ · Meg · Abonnement (/portal/meg/abonnement) — hybrid redesign
 * mot designfasit: "PlayerHQ Meg Abonnement (hybrid).dc.html".
 *
 * Ingen tier-nivåer: appen er gratis via aktiv coaching-pakke (Performance /
 * Performance Pro = credits), ellers 300 kr/mnd. ELITE vises ALDRI.
 *
 * Hybrid-kart (øverst):
 *   - Gratis-bruker/kan-oppgradere: ProUpgradeCard (forest-gradient, PRO-pris,
 *     feature-liste, lime-CTA → checkout-flyt).
 *   - Aktiv PRO uten pakke: ProStatusCard (forest-gradient, pris + fornyes-dato).
 *   - Gratis via pakke: GratisCard (secondary-bakgrunn, pakkenavn, ingen CTA).
 * Nedenfor hybrid-kortet: STATUS, HVA SOM INNGÅR, HANDLINGER, FAKTURAER.
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
import { AthleticBadge } from "@/components/athletic/badge";

export const dynamic = "force-dynamic";

// Features that are included with PRO (from design HTML)
const PRO_FEATURES = [
  "Video-feedback fra coach",
  "Prioritert booking",
  "Avansert SG-rapport",
  "AI-coach (V2)",
] as const;

// Features included for free
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

/** Forest-gradient PRO-oppgraderingskort — vises når bruker kan oppgradere. */
function ProUpgradeCard() {
  return (
    <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-primary to-emerald-900 p-5">
      {/* Bakgrunns-glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full blur-2xl"
        style={{ background: "radial-gradient(circle, rgba(209,248,67,0.20), transparent 65%)" }}
      />
      <div className="relative z-10">
        {/* Eyebrow */}
        <div className="mb-2 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-accent">
          PLAYERHQ PRO
        </div>
        {/* Pris */}
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[36px] font-bold leading-none text-white tabular-nums">
            300
          </span>
          <span className="font-mono text-base font-medium text-white/60">kr/mnd</span>
        </div>
        {/* Inkluderer */}
        <p className="mt-3 text-[13px] text-white/75">Inkluderer:</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-[12.5px] text-white">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2.5} aria-hidden />
              {f}
            </li>
          ))}
        </ul>
        {/* CTA */}
        <div className="mt-5 flex flex-col gap-2">
          <Link
            href="/portal/meg/abonnement/oppgrader/flyt"
            className="flex h-[50px] w-full items-center justify-center rounded-full bg-accent font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-accent-foreground transition-opacity hover:opacity-90"
          >
            Start PRO · 300 kr/mnd
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Forest-gradient PRO-statuskort — vises når bruker allerede er PRO. */
function ProStatusCard({ fornyes }: { fornyes: string | null }) {
  return (
    <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-primary to-emerald-900 p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full blur-2xl"
        style={{ background: "radial-gradient(circle, rgba(209,248,67,0.20), transparent 65%)" }}
      />
      <div className="relative z-10">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-accent">
            PLAYERHQ PRO
          </div>
          <span className="rounded-full bg-accent px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-accent-foreground">
            Aktiv
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[36px] font-bold leading-none text-white tabular-nums">
            300
          </span>
          <span className="font-mono text-base font-medium text-white/60">kr/mnd</span>
        </div>
        {fornyes && (
          <p className="mt-2 font-mono text-[11px] text-white/70">Fornyes {fornyes}</p>
        )}
      </div>
    </div>
  );
}

/** Sekundær statuskort — gratis via coaching-pakke. */
function GratisCard({ planNavn }: { planNavn: string | null }) {
  return (
    <div className="rounded-[20px] border border-border bg-secondary/60 p-5">
      <div className="mb-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        APP-ABONNEMENT
      </div>
      <div className="font-display text-[22px] font-bold tracking-[-0.015em] text-foreground">
        Inkludert i coaching
      </div>
      <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
        Du har{" "}
        <span className="font-bold text-primary">{planNavn ?? "coaching-pakke"}</span> hos AK
        Golf — app-tilgang følger med så lenge coaching-pakken er aktiv.
      </p>
    </div>
  );
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

      {/* Hybrid abonnementskort — velger riktig visning basert på tilstand */}
      <div className="mb-[22px]">
        {kanOppgradere ? (
          <ProUpgradeCard />
        ) : data.erPro && !harPakke ? (
          <ProStatusCard fornyes={fornyes} />
        ) : (
          <GratisCard planNavn={planNavn} />
        )}
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
