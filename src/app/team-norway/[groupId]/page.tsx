import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentGruppepostSide } from "@/lib/domain/tn-post";
import { tnAktivFraPath } from "@/lib/domain/tn-skall";
import { TN } from "@/lib/v2/team-norway";
import { TnAvatarInitialer, TnRail, type TnMenyPunkt } from "@/components/team-norway/core";
import { TnRailMobil } from "@/components/team-norway/rail-mobil";
import { TnPostKomponer } from "@/components/team-norway/tn-post-komponer";
import { TnPostTidslinje, type TnTidslinjePost } from "@/components/team-norway/tn-post-tidslinje";
import { opprettGruppepostAction } from "@/app/team-norway/tn-post-actions";

/**
 * TN-09 Gruppeposter — oppslagstavle for én gruppe.
 * Fasit: designsystem/team-norway/templates/tn-gruppeposter/TnGruppeposter.dc.html
 * Avvik:
 *   - Ingen riggrad: visuell rigg dekker Train-lock, ikke Claw (PORTING.md §0b).
 *   - «Medlemmer» i Mac-header er synlig, men ikke koblet (ingen medlemsliste-rute ennå).
 *   - Teams-møte og vedlegg-fra-komponeren er ikke bygget (TN-11 eier opplasting).
 *   - «Purr de som mangler» sender ingenting — kanal er uspesifisert i fasiten.
 *   - Rail-meny er lokal (Gruppeposter/Dokumenter), ikke TN-01s seks grupper — T3.
 *   - Mobil bruker delt TnRailMobil, ikke fasitens kompakte tilbake-header.
 *   - Feiltilstand «vedlegg stoppet» er ikke egen rute; feil vises i komponeren.
 *   - Avsender vises alltid som « · trener» her — egne stillingstitler finnes ikke.
 *   - TILGANGSMATRISE utelater FORESATT på TN-09; foresatte som ikke er medlem får 404.
 *   - loading.tsx i denne mappen vises også på /dokumenter inntil TN-11 får egen.
 */
export default async function GruppepostPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN", "PLAYER", "PARENT"] });
  const side = await hentGruppepostSide(groupId, bruker.id);
  if (!side) notFound();

  async function publiserGruppepost(input: { tekst: string; kind: string }) {
    "use server";
    return opprettGruppepostAction(groupId, input);
  }

  const { rolle } = side;
  const erTrener = rolle === "TRENER";
  const aktivId = tnAktivFraPath(`/team-norway/${groupId}`);
  const punkter: TnMenyPunkt[] = [
    { type: "overskrift", label: "Kommunikasjon" },
    { type: "lenke", label: "Gruppeposter", href: `/team-norway/${groupId}`, aktiv: aktivId === "oversikt" },
    { type: "lenke", label: "Dokumenter", href: `/team-norway/${groupId}/dokumenter` },
  ];

  const poster: TnTidslinjePost[] = side.tidslinje.map((p) => ({
    id: p.id,
    authorNavn: p.authorNavn.includes(" · ") ? p.authorNavn : `${p.authorNavn} · trener`,
    createdAtIso: p.createdAt.toISOString(),
    kind: p.kind,
    tekst: p.tekst,
    vedlegg: p.vedlegg.map((v) => ({
      id: v.id,
      fileName: v.fileName,
      fileType: v.fileType,
      fileSize: v.fileSize,
    })),
    kvittering: p.kvittering ? { totalt: p.kvittering.totalt, apnet: p.kvittering.apnet } : null,
  }));

  const overskrift = `Gruppe · ${side.utovere} utøvere${side.trenere > 0 ? ` · ${side.trenere} trenere` : ""}`;
  const mottakerPille =
    side.under18 > 0
      ? `${side.utovere} utøvere + foresatte til ${side.under18} mindreårige`
      : `${side.utovere} utøvere`;
  const opprettetDato = side.opprettet.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Oslo",
  });
  const rolleEtikett = rolle === "TRENER" ? "Trener" : rolle === "SPILLER" ? "Spiller" : "Foresatt";
  const manglerN = side.sistePostMangler.length;
  const purrTekst =
    manglerN === 1 ? "Purr den som mangler" : manglerN === 2 ? "Purr de to som mangler" : `Purr de ${manglerN} som mangler`;

  const headerKnapp: CSSProperties = {
    height: 44,
    padding: "0 16px",
    borderRadius: TN.radius.full,
    border: `1px solid ${TN.borderDefault}`,
    display: "flex",
    alignItems: "center",
    fontSize: TN.text.sm,
    fontWeight: TN.weight.semibold,
    color: TN.navy900,
    textDecoration: "none",
    background: "transparent",
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: TN.surfacePage,
        fontFamily: TN.font.body,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <TnRail
        punkter={punkter}
        bruker={{ navn: bruker.name ?? "Ukjent", rolle: rolleEtikett }}
        orgNavn="Team Norway"
        orgUndertittel="Junior"
      />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TnRailMobil punkter={punkter} orgNavn="Team Norway" />

        <div
          style={{
            flexShrink: 0,
            background: TN.surfaceCard,
            borderBottom: `1px solid ${TN.borderSubtle}`,
            padding: "20px 32px 16px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: TN.font.mono,
                fontSize: TN.text.micro,
                letterSpacing: TN.tracking.eyebrow,
                textTransform: "uppercase",
                color: TN.textSecondary,
              }}
            >
              {overskrift}
            </div>
            <h1
              style={{
                fontSize: TN.text.h1,
                fontWeight: TN.weight.bold,
                letterSpacing: TN.tracking.heading,
                color: TN.navy900,
                margin: "4px 0 0",
              }}
            >
              {side.gruppeNavn}
            </h1>
          </div>
          <div className="hidden lg:flex" style={{ alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={headerKnapp} title="Medlemsliste er ikke en egen side ennå">
              Medlemmer
            </span>
            <Link href={`/team-norway/${groupId}/dokumenter`} style={headerKnapp}>
              Dokumenter
            </Link>
            {erTrener && (
              <a
                href="#ny-post"
                style={{
                  ...headerKnapp,
                  padding: "0 18px",
                  border: "none",
                  background: TN.navy900,
                  color: TN.white,
                }}
              >
                Ny post
              </a>
            )}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0, display: "flex", overflow: "hidden" }}>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              padding: "18px 32px 96px",
              gap: 12,
              overflow: "auto",
            }}
          >
            {erTrener && (
              <TnPostKomponer
                send={publiserGruppepost}
                plassholder="Skriv en post til gruppen …"
                etikett="Ny post til gruppen"
                mottakerPille={mottakerPille}
              />
            )}

            <TnPostTidslinje
              poster={poster}
              kvitterVedVisning={!erTrener}
              visSeHvem={erTrener}
              tilLinje="TIL: HELE GRUPPEN"
              tomTittel="Ingen poster ennå"
              tomTekst="Her samles postene til gruppen — beskjeder, reiseinfo, filer og møtelenker. Alt blir liggende og kan søkes opp senere av både utøvere og foresatte."
              tomMeta={`Gruppen ble opprettet ${opprettetDato}. De ${side.utovere} utøverne ser flaten allerede.`}
            />
          </div>

          {erTrener && (
            <aside
              className="hidden lg:flex"
              style={{
                width: 296,
                flexShrink: 0,
                borderLeft: `1px solid ${TN.borderSubtle}`,
                background: TN.surfaceCard,
                padding: "18px 20px",
                flexDirection: "column",
                gap: 14,
                overflow: "auto",
              }}
            >
              {manglerN > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  <div
                    style={{
                      fontFamily: TN.font.mono,
                      fontSize: TN.text.micro,
                      letterSpacing: TN.tracking.eyebrow,
                      textTransform: "uppercase",
                      color: TN.textSecondary,
                    }}
                  >
                    Siste post · ikke åpnet
                  </div>
                  {side.sistePostMangler.map((u) => (
                    <div key={u.userId} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <TnAvatarInitialer navn={u.visningsnavn} size={26} />
                      <span style={{ flex: 1, minWidth: 0, fontSize: TN.text.sm, color: TN.navy900 }}>
                        {u.visningsnavn}
                      </span>
                      <span
                        style={{
                          fontFamily: TN.font.mono,
                          fontSize: TN.text.micro,
                          letterSpacing: TN.tracking.eyebrow,
                          textTransform: "uppercase",
                          color: TN.textTertiary,
                        }}
                      >
                        {u.rolleEtikett}
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    disabled
                    title="Varsling er ikke koblet ennå — kanalen er ikke bestemt"
                    style={{
                      height: 36,
                      marginTop: 4,
                      borderRadius: TN.radius.full,
                      border: `1px solid ${TN.borderDefault}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: TN.text.xs,
                      fontWeight: TN.weight.semibold,
                      color: TN.navy900,
                      background: "transparent",
                      cursor: "not-allowed",
                    }}
                  >
                    {purrTekst}
                  </button>
                </div>
              )}
              <div
                style={{
                  background: TN.navy50,
                  border: `1px solid ${TN.navy100}`,
                  borderRadius: TN.radius.md,
                  padding: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: TN.font.mono,
                    fontSize: TN.text.micro,
                    fontWeight: TN.weight.semibold,
                    letterSpacing: TN.tracking.eyebrow,
                    textTransform: "uppercase",
                    color: TN.navy700,
                  }}
                >
                  Gruppen ser hverandre
                </span>
                <span style={{ fontSize: TN.text.xs, color: TN.navy900, lineHeight: TN.leading.normal }}>
                  Mindreårige står med fornavn og forbokstav på gruppeflaten. Fullt navn finnes bare i enkeltvisning.
                </span>
              </div>
              <div
                style={{
                  border: `1px solid ${TN.borderSubtle}`,
                  borderRadius: TN.radius.md,
                  padding: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                }}
              >
                <span
                  style={{
                    fontFamily: TN.font.mono,
                    fontSize: TN.text.micro,
                    letterSpacing: TN.tracking.eyebrow,
                    textTransform: "uppercase",
                    color: TN.textSecondary,
                  }}
                >
                  Medlemmer
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: TN.font.mono,
                      fontSize: TN.text.h3,
                      fontWeight: TN.weight.semibold,
                      color: TN.navy900,
                    }}
                  >
                    {side.utovere}
                  </span>
                  <span style={{ fontSize: TN.text.xs, color: TN.textSecondary }}>
                    utøvere, {side.under18} under 18 år
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: TN.font.mono,
                      fontSize: TN.text.h3,
                      fontWeight: TN.weight.semibold,
                      color: TN.navy900,
                    }}
                  >
                    {side.foresatte}
                  </span>
                  <span style={{ fontSize: TN.text.xs, color: TN.textSecondary }}>foresatte med innsyn</span>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 0 }} />
              <div style={{ fontSize: TN.text.xs, color: TN.textTertiary, lineHeight: TN.leading.normal }}>
                Utøverne kan kvittere, ikke svare. Gruppen er en oppslagstavle.
              </div>
            </aside>
          )}
        </div>

        {erTrener && (
          <div
            className="flex lg:hidden"
            style={{
              position: "sticky",
              bottom: 0,
              borderTop: `1px solid ${TN.borderSubtle}`,
              background: TN.surfaceCard,
              padding: "12px 16px calc(12px + env(safe-area-inset-bottom) + var(--ak-cookie-h, 0px))",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ flex: 1, minWidth: 0, fontSize: TN.text.xs, color: TN.textTertiary, lineHeight: TN.leading.snug }}>
              Oppslagstavle — ingen svar
            </div>
            <a
              href="#ny-post"
              style={{
                height: 44,
                padding: "0 20px",
                borderRadius: TN.radius.full,
                background: TN.navy900,
                display: "flex",
                alignItems: "center",
                fontSize: TN.text.sm,
                fontWeight: TN.weight.semibold,
                color: TN.white,
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              Ny post
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
