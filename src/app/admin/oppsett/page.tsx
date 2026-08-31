/**
 * Oppsett — ÉN adresse (MASTERPLAN 15.3, beslutning 6.9).
 *
 * Slår sammen åtte adresser til åtte faner på én side:
 *   /admin/settings (Akademi) + /admin/settings/{api,calendar,periode-navn,
 *   security,tilgang} + /admin/klubb/innstillinger (Klubb) +
 *   /admin/integrasjoner (Integrasjoner). Alle åtte består som redirects.
 *
 * TILGANG: siden gater ADMIN/COACH (laveste felles gate — Kalender, Sikkerhet
 * og Perioder tillot COACH på kildesiden). Hver fane arver sitt EGET,
 * strengere krav via `synligeOppsettFaner`/`kreverAdmin` — en sammenslåing
 * skal aldri utvide tilgang. Klubb-fanen har i tillegg
 * `requireCapability(MANAGE_FACILITIES)` fra kildesiden, håndhevet inline
 * under. Låst av src/lib/admin/oppsett/faner.test.ts.
 *
 * AKADEMI-FANEN: `/admin/settings` var selv en mini-hub med fem rader
 * (Akademi, Varsler, Tilgang, Klubb, Konto) via `?rad=`. Tilgang og Klubb
 * har nå EGNE faner her — å vise dem i Akademi-fanen ville duplisert
 * innholdet. `AdminOppsettHubTrainLock` filtrerer derfor de to radene bort
 * når `somFane` er satt (se komponenten) og viser kun Akademi/Varsler/Konto.
 * Ingenting av innholdet er fjernet — det bor i sine egne faner.
 *
 * TILGANG-FANEN har en INDRE fane (Roller/Per trener, G6 2026-08-16). Den
 * bruker `?visning=` — ikke `?fane=`, som allerede eies av toppnivå-valget
 * her.
 *
 * Design: canvas godkjent av Anders 30.08.2026 —
 * designsystem/canvas/agencyos-ia/Oppsett.dc.html.
 *
 * MASTERPLAN 15.13 (31.08.2026): `/admin/gdpr` og `/admin/team/ekstern` hadde
 * ingen vei inn (arkitektur-kartlegging 30.08). Ikke egne faner (det er
 * arbeidsflater med egen tilgangslogikk, ikke innstillinger) — i stedet en
 * lenke-rad i den nærmeste eksisterende fanen: GDPR under Sikkerhet
 * (ADMIN-only, samme gate som målsiden), eksterne lesere under Tilgang.
 */

import Link from "next/link";
import { TlKort, TlRad, TlKnapp } from "@/components/admin/v2/oppsett/tl-kit";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TL } from "@/lib/v2/train-lock";
import { OppsettHode } from "@/components/admin/v2/oppsett/OppsettHode";
import { AdminOppsettHubTrainLock } from "@/components/admin/v2/oppsett/AdminOppsettHubTrainLock";
import { AdminKlubbInnstillingerTrainLock } from "@/components/admin/v2/oppsett/AdminKlubbInnstillingerTrainLock";
import { AdminKalenderSynkTrainLock } from "@/components/admin/v2/oppsett/AdminKalenderSynkTrainLock";
import { AdminTilgangTrainLock } from "@/components/admin/v2/oppsett/AdminTilgangTrainLock";
import { AdminTilgangPerTrenerTrainLock } from "@/components/admin/v2/oppsett/AdminTilgangPerTrenerTrainLock";
import { AdminSecurityTrainLock } from "@/components/admin/v2/oppsett/AdminSecurityTrainLock";
import { AdminIntegrasjonerTrainLock } from "@/components/admin/v2/oppsett/AdminIntegrasjonerTrainLock";
import { AdminApiKeysTrainLock } from "@/components/admin/v2/oppsett/AdminApiKeysTrainLock";
import { PeriodeNavnV2 } from "@/components/admin/v2/PeriodeNavnV2";
import { PERIODE_NAVN_LABELS } from "@/app/admin/settings/periode-navn/labels";
import { synligeOppsettFaner, velgOppsettFane } from "@/lib/admin/oppsett/faner";
import {
  lastAkademiData,
  lastApiData,
  lastIntegrasjonerData,
  lastKalenderData,
  lastKlubbData,
  lastPerioderData,
  lastSikkerhetData,
  lastTilgangPerTrener,
  lastTilgangRoller,
  sjekkKlubbTilgang,
} from "@/lib/admin/oppsett/lastere";

export const dynamic = "force-dynamic";
export const metadata = { title: "Oppsett · AgencyOS" };

function visningFaneStil(aktiv: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    height: 36,
    padding: "0 16px",
    borderRadius: TL.radius.pill,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    background: aktiv ? TL.dim : "transparent",
    color: aktiv ? TL.text : TL.mute,
  };
}

export default async function OppsettPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string; rad?: string; visning?: string; ok?: string; error?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { fane: onsket, rad, visning, ok, error } = await searchParams;

  const faner = synligeOppsettFaner(user.role === "ADMIN");
  const aktiv = velgOppsettFane(onsket, faner);

  const innhold = await (async () => {
    switch (aktiv) {
      case "akademi": {
        const data = await lastAkademiData(user);
        const radKey =
          rad === "akademi" || rad === "varsler" || rad === "tilgang" || rad === "klubb" || rad === "konto" ? rad : null;
        return <AdminOppsettHubTrainLock data={data} rad={radKey} somFane baseHref="/admin/oppsett" />;
      }
      case "klubb": {
        await sjekkKlubbTilgang();
        const { klubber, settings } = await lastKlubbData();
        return <AdminKlubbInnstillingerTrainLock klubber={klubber} settings={settings} somFane />;
      }
      case "kalender": {
        const data = await lastKalenderData(user.id, ok, error);
        return <AdminKalenderSynkTrainLock data={data} somFane />;
      }
      case "tilgang": {
        const perTrener = visning === "per-trener";
        const faneVelger = (
          <div style={{ display: "flex", gap: 6 }}>
            <Link href="/admin/oppsett?fane=tilgang" style={visningFaneStil(!perTrener)}>
              Roller
            </Link>
            <Link href="/admin/oppsett?fane=tilgang&visning=per-trener" style={visningFaneStil(perTrener)}>
              Per trener
            </Link>
          </div>
        );
        if (perTrener) {
          const trenere = await lastTilgangPerTrener();
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {faneVelger}
              <AdminTilgangPerTrenerTrainLock trenere={trenere} />
            </div>
          );
        }
        const { roller, rader } = lastTilgangRoller();
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {faneVelger}
            <AdminTilgangTrainLock roller={roller} rader={rader} somFane />
            <TlKort eyebrow="Eksterne lesere">
              <TlRad
                title="Team Norway og WANG"
                sub="Gi utvalgte spillere synlig for eksterne lesere fra andre organisasjoner"
                trailing={
                  <TlKnapp variant="sekundaer" icon="arrow-right" href="/admin/team/ekstern">
                    Åpne
                  </TlKnapp>
                }
                chevron={false}
                last
              />
            </TlKort>
          </div>
        );
      }
      case "sikkerhet": {
        const data = lastSikkerhetData(user);
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <AdminSecurityTrainLock data={data} somFane />
            {user.role === "ADMIN" && (
              <TlKort eyebrow="Personvern">
                <TlRad
                  title="GDPR-kø"
                  sub="Behandle forespørsler om innsyn og sletting"
                  trailing={
                    <TlKnapp variant="sekundaer" icon="arrow-right" href="/admin/gdpr">
                      Åpne
                    </TlKnapp>
                  }
                  chevron={false}
                  last
                />
              </TlKort>
            )}
          </div>
        );
      }
      case "integrasjoner": {
        const cards = await lastIntegrasjonerData(user);
        return <AdminIntegrasjonerTrainLock cards={cards} somFane />;
      }
      case "api": {
        const data = await lastApiData();
        return <AdminApiKeysTrainLock data={data} somFane />;
      }
      case "perioder": {
        const { oversikt } = await lastPerioderData();
        return <PeriodeNavnV2 oversikt={oversikt} typer={PERIODE_NAVN_LABELS} somFane />;
      }
    }
  })();

  return (
    <V2Shell bredde="full" aktiv="innstillinger" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
        <OppsettHode faner={faner} aktiv={aktiv} />
        {innhold}
      </div>
    </V2Shell>
  );
}
