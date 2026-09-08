/**
 * TN-18 Trenere og tilgang — rolle per gruppe.
 * Fasit: designsystem/team-norway/templates/tn-trenere-tilgang/TnTrenereTilgang.dc.html
 * Avvik:
 *   - Speilet i repoet (`designsystem/team-norway/`) er utgått per handover-pakkens
 *     EKSPORT.md — denne skjermen er bygget direkte mot Claude Design-prosjektet
 *     a03bf94a-c923-4c04-82ff-415773557e37 (handover/ + templates/tn-trenere-tilgang/),
 *     ikke mot filer i repoet.
 *   - Ingen riggrad: den visuelle riggen (`scripts/check-fasit-sitering.mjs`-familien)
 *     dekker Train-lock, ikke Claw ennå (samme status som hele Claw-porten pr 08.09.2026).
 *   - Datamodellen har kun ÉN kanonisk Team Norway-gruppe (slug "team-norway",
 *     `KANONISKE_GRUPPER` i grupper.ts) — ingen `Group.parentId` samler flere
 *     underliggende TN-lag. «Grupper personen når» og «alle TN-gruppene» i
 *     TILGANGSMATRISE.md §0 reduserer derfor til denne ene gruppen; fasitens
 *     fire eksempelgrupper (Junior/Elite/Collegegruppen/WANG Vg2) er IKKE bygget.
 *   - «UTEN GRUPPE»-tilstanden (person finnes i katalogen men har ingen gruppe,
 *     fasitens «Kari Nes»-eksempel) er ikke bygget: TN-20 Trenerkatalog — datakilden
 *     for «alle trenere uavhengig av tilgang» — er ikke portert. Denne skjermen
 *     viser derfor kun personer som HAR eller HAR HATT et GroupMember-medlemskap
 *     i team-norway-gruppen.
 *   - «Legg til trener» (invitere en helt ny person) er IKKE bygget — det krever et
 *     søk/invitasjons-mønster for trenere som ikke finnes (TN-19 dekker kun spillere).
 *     Bevisst utelatt i denne omgangen, se PORTING.md §7 «designfilen mangler en
 *     tilstand koden trenger» — her er det motsatt, en handling uten datagrunnlag.
 *   - Rolleendring og aktiv periode ER bygget (settTilgangAction/avsluttTilgangAction i
 *     tn-tilgang-actions.ts) — begge er entydig dekket av `GroupMember.role`/
 *     `joinedAt`/`endedAt`, og B2 (uavklart: kan TR legge til HJ i egen gruppe) gjelder
 *     ikke her siden skjermen er strengt SS-only, som matrisen selv sier er utvetydig.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { tnAktivFraPath } from "@/lib/domain/tn-skall";
import { erSportssjef, hentTeamNorwayTilganger, tnTilgangStatus, type TnTilgangRad } from "@/lib/domain/tn-tilgang";
import { avsluttTilgangAction, settTilgangAction } from "./tn-tilgang-actions";
import { TN } from "@/lib/v2/team-norway";
import { TnRail, type TnMenyPunkt, TnAvatarInitialer, TnPille, type TnPilleTone } from "@/components/team-norway/core";
import { TnRailMobil } from "@/components/team-norway/rail-mobil";
import { TnDataTable, type TnDataTableKolonne } from "@/components/team-norway/tn-data-table";
import { TnTilgangSkjema } from "@/components/team-norway/tn-tilgang-skjema";

const DATO_FMT = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" });

function tilDatoStreng(d: Date): string {
  return DATO_FMT.format(d);
}

/** Date → `YYYY-MM-DD` for <input type="date">. Leser lokale UTC-getters (gotchas.md). */
function tilInputIso(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

const STATUS_TONE: Record<string, TnPilleTone> = { AKTIV: "green", UTLØPT: "nøytral" };
const ROLLE_TONE: Record<string, TnPilleTone> = { COACH: "navy", ASSISTANT: "nøytral" };
const ROLLE_LABEL: Record<string, string> = { COACH: "TRENER", ASSISTANT: "HJELPETRENER" };

export default async function TilgangPage({ searchParams }: { searchParams: Promise<{ valgt?: string }> }) {
  const { valgt } = await searchParams;
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [erSS, data] = await Promise.all([erSportssjef({ id: bruker.id, role: bruker.role }), hentTeamNorwayTilganger()]);
  // TR/HJ ser ikke denne skjermen (TILGANGSMATRISE.md rad TN-18).
  if (!erSS) notFound();
  if (!data) notFound();

  const { gruppe, rader } = data;
  const valgtRad: TnTilgangRad | undefined = valgt ? rader.find((r) => r.userId === valgt) : undefined;

  const aktivId = tnAktivFraPath("/team-norway/tilgang");
  const punkter: TnMenyPunkt[] = [
    { type: "overskrift", label: "Administrasjon" },
    { type: "lenke", label: "Trenere og tilgang", href: "/team-norway/tilgang", aktiv: aktivId === "oversikt" },
  ];

  const kolonner: TnDataTableKolonne[] = [
    { key: "person", label: "Person" },
    { key: "grupper", label: "Grupper personen når" },
    { key: "periode", label: "Aktiv periode" },
    { key: "status", label: "Status", align: "right" },
  ];

  const dataRader = rader.map((r) => {
    const status = tnTilgangStatus(r);
    return {
      person: (
        <Link href={`/team-norway/tilgang?valgt=${r.userId}`} style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", color: "inherit" }}>
          <TnAvatarInitialer navn={r.navn} size={34} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: TN.font.body, fontSize: TN.text.sm, fontWeight: TN.weight.semibold, color: TN.navy900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {r.navn}
            </div>
            <div style={{ fontFamily: TN.font.mono, fontSize: TN.text.micro, color: TN.textTertiary, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {r.epost}
            </div>
          </div>
        </Link>
      ),
      grupper: <TnPille tone={ROLLE_TONE[r.rolle]}>{ROLLE_LABEL[r.rolle]}</TnPille>,
      periode: (
        <span style={{ fontFamily: TN.font.mono, fontSize: TN.text.xs, whiteSpace: "nowrap", color: r.endedAt ? TN.textPrimary : TN.textTertiary }}>
          {tilDatoStreng(r.joinedAt)} → {r.endedAt ? tilDatoStreng(r.endedAt) : "åpen"}
        </span>
      ),
      status: <TnPille tone={STATUS_TONE[status]}>{status}</TnPille>,
    };
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: TN.surfacePage, fontFamily: TN.font.body }}>
      <TnRail punkter={punkter} bruker={{ navn: bruker.name ?? "Ukjent", rolle: "Sportssjef" }} orgNavn="Team Norway" orgUndertittel="Administrasjon" />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TnRailMobil punkter={punkter} orgNavn="Team Norway" />
        <div style={{ flex: 1, minWidth: 0, display: "flex", minHeight: 0, overflow: "hidden" }}>
          <div style={{ flex: 1, minWidth: 0, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20, overflow: "auto" }}>
            <div>
              <div style={{ fontFamily: TN.font.mono, fontSize: TN.text.micro, letterSpacing: TN.tracking.eyebrow, textTransform: "uppercase", color: TN.textSecondary }}>
                Administrasjon · Tilgang
              </div>
              <h1 style={{ fontSize: TN.text.h2, fontWeight: TN.weight.bold, letterSpacing: TN.tracking.heading, color: TN.navy900, margin: "6px 0 0" }}>
                {rader.length} {rader.length === 1 ? "person" : "personer"} med tilgang
              </h1>
            </div>

            <div style={{ background: TN.navy50, border: `1px solid ${TN.navy100}`, borderRadius: TN.radius.md, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ width: 3, height: 34, borderRadius: TN.radius.full, background: TN.navy600, flexShrink: 0 }} />
              <span style={{ fontSize: TN.text.sm, color: TN.textPrimary, lineHeight: TN.leading.normal }}>
                <strong>Rollen settes per gruppe.</strong> Fjernes den siste gruppen, mister personen all tilgang — det
                finnes ingen tilgang uten gruppe.
              </span>
            </div>

            <TnDataTable
              kolonner={kolonner}
              rader={dataRader}
              empty="Ingen trenere har tilgang til Team Norway ennå."
            />
          </div>

          {valgtRad && (
            <div style={{ width: 400, flexShrink: 0, borderLeft: `1px solid ${TN.borderSubtle}`, background: TN.surfaceCard, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 20, overflow: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <TnAvatarInitialer navn={valgtRad.navn} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: TN.text.lg, fontWeight: TN.weight.bold, color: TN.navy900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {valgtRad.navn}
                  </div>
                  <div style={{ fontFamily: TN.font.mono, fontSize: TN.text.micro, letterSpacing: TN.tracking.eyebrow, textTransform: "uppercase", color: TN.textSecondary, marginTop: 2 }}>
                    {valgtRad.epost}
                  </div>
                </div>
              </div>

              <TnTilgangSkjema
                groupId={gruppe.id}
                targetUserId={valgtRad.userId}
                gruppeNavn={gruppe.name}
                rolleInitial={valgtRad.rolle}
                fraInitialIso={tilInputIso(valgtRad.joinedAt)}
                tilInitialIso={valgtRad.endedAt ? tilInputIso(valgtRad.endedAt) : null}
                settTilgang={settTilgangAction}
                avsluttTilgang={avsluttTilgangAction}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
