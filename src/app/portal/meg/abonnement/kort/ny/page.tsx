/**
 * /portal/meg/abonnement/kort/ny — B-pakke.
 * Status (neste belastning) først, én grønn CTA til Stripe.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { TL } from "@/lib/v2/train-lock";

import { Caps, Tittel, Kort, TilbakeLenke, StatusPill, Icon } from "@/components/v2";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { AapneStripePortal } from "./aapne-stripe-portal";

export const dynamic = "force-dynamic";

function formatNesteBelastning(dato: Date | null): string {
  if (!dato) return "—";
  return dato.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function NyttKortPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });

  // A1: kortbytte gjelder raden med aktiv Stripe-kobling.
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id, stripeSubscriptionId: { not: null } },
    select: { currentPeriodEnd: true, status: true },
  });

  const TILLATTE_STATUSER = new Set(["ACTIVE", "PAST_DUE", "TRIALING"]);
  if (!subscription || !TILLATTE_STATUSER.has(subscription.status)) {
    redirect("/portal/meg/abonnement");
  }

  const nesteBelastning = subscription.currentPeriodEnd ?? null;
  const betalingFeilet = subscription.status === "PAST_DUE";

  return (
    <V2Shell aktiv="meg" bredde="kolonne" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div
        data-paper-slug="playerhq-abonnement"
        data-paper-portal-meg-kort-ny
        style={{
          maxWidth: 480,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <TilbakeLenke href="/portal/meg/abonnement">Abonnement</TilbakeLenke>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <Caps>Abonnement · Betalingskort</Caps>
            <div style={{ marginTop: 10 }}>
              <Tittel em="kort">Administrer</Tittel>
            </div>
            <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: "8px 0 0", lineHeight: 1.45 }}>
              Legg til eller endre kort i Stripes sikre portal. Vi lagrer aldri kortdata.
            </p>
          </div>
          <StatusPill tone={betalingFeilet ? "down" : "up"}>
            {betalingFeilet ? "Betaling feilet" : "Aktiv"}
          </StatusPill>
        </div>

        <Kort>
          <Caps style={{ marginBottom: 8 }}>Neste belastning</Caps>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontFamily: TL.font.mono, fontSize: 28, fontWeight: 700, color: TL.text, letterSpacing: "-0.03em" }}>
              299 kr
            </span>
            <span style={{ fontFamily: TL.font.mono, fontSize: 12, color: TL.mute }}>
              {formatNesteBelastning(nesteBelastning)}
            </span>
          </div>
          <p style={{ margin: "8px 0 0", fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, lineHeight: 1.45 }}>
            Pro · månedlig · fornyes automatisk. Kanseller når som helst fra abonnement-siden.
          </p>
        </Kort>

        <Kort>
          <AapneStripePortal />
          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              borderRadius: TL.radius.row,
              border: `1px solid ${TL.hair}`,
              background: TL.dock,
              padding: 12,
            }}
          >
            <Icon name="lock" size={14} style={{ color: TL.mute, marginTop: 2, flex: "none" }} />
            <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, lineHeight: 1.5 }}>
              <strong style={{ color: TL.text }}>Vi lagrer aldri kortdata.</strong> Betalingen håndteres av Stripe.
            </p>
          </div>
        </Kort>

        <Kort>
          <Caps style={{ marginBottom: 10 }}>Sikkerhet</Caps>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "PCI-DSS Level 1 (Stripe)",
              "3-D Secure 2 (sterk autentisering)",
              "Kortdata lagres aldri hos AK Golf",
            ].map((s) => (
              <li key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9999,
                    background: TL.fill,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "none",
                  }}
                >
                  <Icon name="check" size={11} style={{ color: TL.onFill }} />
                </span>
                <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text }}>{s}</span>
              </li>
            ))}
          </ul>
        </Kort>
      </div>
    </V2Shell>
  );
}
