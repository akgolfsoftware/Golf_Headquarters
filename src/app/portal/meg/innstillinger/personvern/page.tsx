/**
 * /portal/meg/innstillinger/personvern — B-pakke.
 * Status først, én grønn eksport-CTA, sletting sekundært.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { TL } from "@/lib/v2/train-lock";

import { Kort, StatusPill, Icon } from "@/components/v2";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { InnstillingerHode } from "@/components/portal/v2/InnstillingerHode";
import { hentSamtykkeStatus } from "@/lib/health/samtykke";
import { maaHaForesattSamtykke } from "@/lib/health/samtykke-regler";
import { HelseSamtykkeKort } from "@/components/portal/v2/HelseSamtykkeKort";
import { DelingSamtykkeKort } from "@/components/portal/v2/DelingSamtykkeKort";
import {
  grupperMedEksterneLesereForSpiller,
  hentDelingsStatus,
} from "@/lib/deling/samtykke";
import { PersonvernActions } from "./personvern-actions";

export const dynamic = "force-dynamic";

export default async function PersonvernPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });

  const samtykke = await hentSamtykkeStatus(user.id);
  const krevesForesatt = maaHaForesattSamtykke(user);

  // T8: delingssamtykke per gruppe med aktive eksterne lesere (Team Norway/WANG).
  const delingGrupper = await grupperMedEksterneLesereForSpiller(user.id);
  const delingStatus = await hentDelingsStatus(
    user.id,
    delingGrupper.map((g) => g.id),
  );
  const delingKart = new Map(delingStatus.map((s) => [s.gruppeId, s]));

  return (
    <V2Shell aktiv="meg" bredde="kolonne" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
    <div
      data-paper-slug="playerhq-innstillinger"
      data-paper-portal-innstillinger-personvern
      style={{
        maxWidth: 720,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <InnstillingerHode
        tittel="Personvern og data"
        undertekst="Innstillinger"
        tilbakeHref="/portal/meg/innstillinger"
        action={<StatusPill tone="info">GDPR</StatusPill>}
      />
      <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: 0, lineHeight: 1.45, maxWidth: "42ch" }}>
        Last ned dine data, se hvordan vi lagrer dem, eller be om sletting.
      </p>

      <HelseSamtykkeKort
        data={{
          wearable: samtykke.wearable,
          manuell: samtykke.manuell,
          coachInnsyn: samtykke.coachInnsyn,
          coachDetalj: samtykke.coachDetalj,
          // Nyeste av de to innsamlings-samtykkene — det er det kvitteringen
          // gjelder («samtykke gitt <dato>»).
          sistGittAt:
            [samtykke.wearableGittAt, samtykke.manuellGittAt]
              .filter((d): d is Date => d !== null)
              .sort((a, b) => b.getTime() - a.getTime())[0]
              ?.toISOString() ?? null,
          krevesForesatt,
        }}
      />

      <DelingSamtykkeKort
        grupper={delingGrupper.map((g) => ({
          gruppeId: g.id,
          gruppeNavn: g.name,
          testResultater: delingKart.get(g.id)?.testResultater ?? false,
          stats: delingKart.get(g.id)?.stats ?? false,
        }))}
        krevesForesatt={user.requiresGuardianConsent}
        modus={{ type: "spiller" }}
      />

      <Kort>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: TL.dim,
              border: `1px solid ${TL.hair}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <Icon name="download" size={16} style={{ color: TL.mute }} />
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: TL.font.sans, fontSize: 16, fontWeight: 700, color: TL.text, letterSpacing: "-0.02em" }}>
              Last ned dine data
            </div>
            <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: "6px 0 0", lineHeight: 1.5 }}>
              Få en fil med profil, runder, økter, mål, betalinger, varsler og meldinger.
            </p>
            <PersonvernActions kind="export" />
          </div>
        </div>
      </Kort>

      <Kort>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Icon name="shield" size={14} style={{ color: TL.mute }} />
          <span style={{ fontFamily: TL.font.sans, fontSize: 14, fontWeight: 700, color: TL.text }}>
            Hvordan vi behandler dataene dine
          </span>
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { t: "Lagring", d: "Alle data lagres kryptert i EU (Supabase)." },
            { t: "Betaling", d: "Kortdata håndteres kun av Stripe. Vi lagrer aldri kortnummer." },
            { t: "E-post", d: "Kun nødvendige e-poster (booking, plan, varsler) — ikke reklame uten samtykke." },
          ].map((r) => (
            <li key={r.t} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Icon name="lock" size={13} style={{ color: TL.mute, marginTop: 2, flex: "none" }} />
              <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
                <strong style={{ color: TL.text, fontWeight: 600 }}>{r.t}:</strong> {r.d}
              </span>
            </li>
          ))}
        </ul>
        <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, margin: "14px 0 0", lineHeight: 1.5 }}>
          Mer i{" "}
          <Link href="/personvern" style={{ color: TL.fill, fontWeight: 600, textDecoration: "none" }}>
            personvernerklæringen
          </Link>
          . Spørsmål?{" "}
          <a href="mailto:post@akgolf.no" style={{ color: TL.fill, fontWeight: 600, textDecoration: "none" }}>
            post@akgolf.no
          </a>
        </p>
      </Kort>

      <Kort style={{ borderColor: `color-mix(in srgb, ${TL.danger} 28%, ${TL.hair})` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `color-mix(in srgb, ${TL.danger} 12%, ${TL.elev})`,
              border: `1px solid color-mix(in srgb, ${TL.danger} 30%, transparent)`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <Icon name="trash-2" size={16} style={{ color: TL.danger }} />
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: TL.font.sans, fontSize: 16, fontWeight: 700, color: TL.text, letterSpacing: "-0.02em" }}>
              Slett kontoen din
            </div>
            <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: "6px 0 0", lineHeight: 1.5 }}>
              Forespørselen vurderes av coach/admin. Ved godkjenning anonymiseres navn, e-post, telefon og bilde.
              Avidentifisert treningshistorikk beholdes.
            </p>
            <PersonvernActions kind="delete" />
          </div>
        </div>
      </Kort>
    </div>
    </V2Shell>
  );
}
