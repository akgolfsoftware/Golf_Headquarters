import Link from "next/link";
import type { ReactNode } from "react";

import { TnKort, TnPille, TnRail, type TnBunnValg, type TnMenyGruppe, type TnMenyLenke, type TnPilleTone } from "./core";
import { TnRailMobil } from "./rail-mobil";
import { TnSeksjonDS, TnSidehodeDS } from "./tn-skjerm";
import { TN } from "@/lib/v2/team-norway";
import { TN_RUTER, tnDokumenterHref, tnGruppeHref } from "./tn-ruter";

/**
 * TN-01 Organisasjonsskall — felles skall for alle Team Norway-ruter.
 * Fasit: designsystem/team-norway/templates/tn-skall/TnSkall.dc.html
 * Avvik:
 *   - Menypunkter uten egen datamodell åpner en ærlig tomtilstand, ikke demo-data.
 *   - Analyse (14.09.2026) er TN-egen gruppeanalyse (/team-norway/analyse),
 *     ikke lenger den innloggede brukerens PlayerHQ-analyse.
 *   - Ingen riggrad: den visuelle riggen dekker ikke Claw ennå.
 */

export type TnAktivSide =
  | "oversikt"
  | "fellestesting"
  | "kartlegging"
  | "spiller"
  | "samlinger"
  | "college"
  | "manedsplan"
  | "spillere"
  | "uttak"
  | "rangliste"
  | "skoler"
  | "gruppeposter"
  | "dokumenter"
  | "protokoller"
  | "turneringer"
  | "referansenivaer"
  | "tilgang"
  | "inviter"
  | "fagapparat"
  | "live-watch"
  | "lisens"
  | "apparatet"
  | "analyse"
  | "workbench";

function lenke(label: string, href: string, id: TnAktivSide, aktiv: TnAktivSide): TnMenyLenke {
  return { label, href, aktiv: aktiv === id };
}

type MenyValg = { aktiv: TnAktivSide; groupId?: string; visTrenerflater: boolean; kanAdministrere: boolean };

/**
 * Sidemenyen i seks grupper — konstanten GROUPS i «Team Norway App.dc.html»
 * (Claude Design bc3e41fc, 28.09.2026), med etikettene fra SCREENS/SUPD.
 * Rutene står i src/components/team-norway/tn-ruter.ts.
 * Flaten er bare for trenerteamet (domenesperren i tn-flate-tilgang.ts), så
 * spillerutgaven av menyen er borte: spillere bruker PlayerHQ.
 * Utgått 28.09: Samtykke og Inviter spiller (flyttet inn i Tilgang og
 * samtykke) og Spillervisning. DataGolf og Analyse er ikke tegnet; de peker på
 * eksisterende sider. Tilgang og samtykke vises bare for den som kan
 * administrere (siden selv svarer 404 for andre).
 */
export function tnHovedmeny({ aktiv, groupId, kanAdministrere }: MenyValg): TnMenyGruppe[] {
  const grupper: Omit<TnMenyGruppe, "aktiv">[] = [
    {
      id: "daglig",
      label: "Daglig",
      ikon: "calendar",
      punkter: [
        lenke("Landslagsoversikt", TN_RUTER.oversikt, "oversikt", aktiv),
        lenke("Samlinger", TN_RUTER.samlinger, "samlinger", aktiv),
        lenke("Turneringer og reise", TN_RUTER.turneringer, "turneringer", aktiv),
        lenke("Live Watch", TN_RUTER.live, "live-watch", aktiv),
      ],
    },
    {
      id: "spillere",
      label: "Spillere",
      ikon: "users",
      punkter: [
        lenke("Spillerutvikling", TN_RUTER.spillere, "spillere", aktiv),
        lenke("Spillerprofil", TN_RUTER.spiller, "spiller", aktiv),
        lenke("Fellestesting", TN_RUTER.test, "fellestesting", aktiv),
        lenke("Kartlegging", TN_RUTER.kartlegging, "kartlegging", aktiv),
        lenke("College og USA", TN_RUTER.college, "college", aktiv),
        lenke("Skoleoversikt", TN_RUTER.skoler, "skoler", aktiv),
      ],
    },
    {
      id: "uttak",
      label: "Uttak",
      ikon: "check",
      punkter: [
        lenke("Uttak og kriterier", TN_RUTER.uttak, "uttak", aktiv),
        lenke("Rangliste", TN_RUTER.rangliste, "rangliste", aktiv),
        { label: "DataGolf", href: TN_RUTER.datagolf, aktiv: false },
      ],
    },
    {
      id: "plan",
      label: "Plan og fag",
      ikon: "clock",
      punkter: [
        lenke("Månedsplan", TN_RUTER.manedsplan, "manedsplan", aktiv),
        lenke("Testprotokoller", TN_RUTER.protokoller, "protokoller", aktiv),
        lenke("Referansenivåer", TN_RUTER.referanse, "referansenivaer", aktiv),
        lenke("Fagapparat", TN_RUTER.fagapparat, "fagapparat", aktiv),
        lenke("Analyse", TN_RUTER.analyse, "analyse", aktiv),
      ],
    },
    {
      id: "gruppe",
      label: "Gruppe",
      ikon: "mail",
      punkter: groupId
        ? [lenke("Gruppeposter", tnGruppeHref(groupId), "gruppeposter", aktiv), lenke("Dokumenter", tnDokumenterHref(groupId), "dokumenter", aktiv)]
        : [],
    },
    {
      id: "admin",
      label: "Admin",
      ikon: "user",
      punkter: [
        ...(kanAdministrere ? [lenke("Tilgang og samtykke", TN_RUTER.tilgang, "tilgang", aktiv)] : []),
        lenke("Lisens og økonomi", TN_RUTER.lisens, "lisens", aktiv),
      ],
    },
  ];
  return grupper.filter((g) => g.punkter.length > 0).map((g) => ({ ...g, aktiv: g.punkter.some((p) => p.aktiv) }));
}

/** Fire faste valg i mobilens bunnlinje. Resten ligger under «Mer». */
export function tnBunnmeny({ aktiv, visTrenerflater }: MenyValg): TnBunnValg[] {
  return visTrenerflater
    ? [
        { ...lenke("Oversikt", "/team-norway", "oversikt", aktiv), ikon: "menu" },
        { ...lenke("Samlinger", "/team-norway/samlinger", "samlinger", aktiv), ikon: "calendar" },
        { label: "Uttak", href: "/team-norway/uttak", aktiv: aktiv === "uttak" || aktiv === "rangliste", ikon: "check" },
        { label: "Spillere", href: "/team-norway/spillere", aktiv: aktiv === "spillere" || aktiv === "spiller" || aktiv === "fellestesting" || aktiv === "kartlegging" || aktiv === "skoler", ikon: "users" },
      ]
    : [
        { ...lenke("Oversikt", "/team-norway", "oversikt", aktiv), ikon: "menu" },
        { ...lenke("Samlinger", "/team-norway/samlinger", "samlinger", aktiv), ikon: "calendar" },
        { ...lenke("Turneringer", "/team-norway/turneringer", "turneringer", aktiv), ikon: "external-link" },
        { ...lenke("Lisens", "/team-norway/lisens-okonomi", "lisens", aktiv), ikon: "file-text" },
      ];
}

/**
 * Rollen skrives likt overalt. Uten dette sto det «COACH» på én skjerm og
 * «Trener» på en annen, i samme skinne.
 */
export function tnRolleNavn(rolle: string) {
  if (rolle === "COACH") return "Trener";
  if (rolle === "ASSISTANT") return "Assist Coach";
  if (rolle === "PLAYER") return "Spiller";
  return rolle;
}

export function TnShell({
  aktiv,
  brukerNavn,
  rolle,
  groupId,
  visTrenerflater,
  kanAdministrere,
  flate = "standard",
  children,
}: {
  aktiv: TnAktivSide;
  brukerNavn: string;
  rolle: string;
  groupId?: string;
  visTrenerflater: boolean;
  kanAdministrere: boolean;
  /**
   * «full» dropper innholdsmarg og maksbredde for skjermer som har sin egen
   * flate — i dag bare liste/detalj på Trenere og tilgang. Skinnen, menyen,
   * organisasjonsnavnet og brukerfoten er de samme uansett; det er DER
   * spriken oppsto, ikke i innholdet.
   */
  flate?: "standard" | "full";
  children: ReactNode;
}) {
  const valg = { aktiv, groupId, visTrenerflater, kanAdministrere };
  const grupper = tnHovedmeny(valg);
  return (
    <div style={{ display: "flex", minHeight: "100dvh", background: TN.surfacePage, color: TN.textPrimary, fontFamily: TN.font.body }}>
      <TnRail grupper={grupper} bruker={{ navn: brukerNavn, rolle }} orgNavn="Team Norway Golf" orgUndertittel="Prestasjon" />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TnRailMobil grupper={grupper} bunn={tnBunnmeny(valg)} brukerNavn={brukerNavn} orgNavn="Team Norway Golf" />
        {flate === "full" ? (
          children
        ) : (
          <main style={{ width: "100%", maxWidth: TN.maxContent, padding: "clamp(20px, 4vw, 48px)", display: "flex", flexDirection: "column", gap: 24 }}>
            {children}
          </main>
        )}
        {/* Plass til den faste bunnlinjen på mobil, så siste rad aldri skjules bak den. */}
        <div className="lg:hidden" aria-hidden="true" style={{ flex: "none", height: "calc(64px + env(safe-area-inset-bottom) + var(--ak-cookie-h, 0px))" }} />
      </div>
    </div>
  );
}

export function TnSidehode({ overlinje, tittel, ingress, handling }: { overlinje: string; tittel: string; ingress: string; handling?: ReactNode }) {
  return <TnSidehodeDS overlinje={overlinje} tittel={tittel} ingress={ingress} handling={handling} />;
}

export function TnMetrikk({ etikett, verdi, forklaring, tone = "navy" }: { etikett: string; verdi: ReactNode; forklaring?: string; tone?: TnPilleTone }) {
  return (
    <TnKort>
      <TnPille tone={tone}>{etikett}</TnPille>
      <div style={{ marginTop: 14, fontFamily: TN.font.mono, fontSize: TN.text.h1, fontWeight: TN.weight.bold, color: TN.navy900, fontVariantNumeric: "tabular-nums" }}>{verdi}</div>
      {forklaring ? <p style={{ margin: "8px 0 0", color: TN.textSecondary, fontSize: TN.text.sm, lineHeight: TN.leading.normal }}>{forklaring}</p> : null}
    </TnKort>
  );
}

export function TnMetrikkRutenett({ children }: { children: ReactNode }) {
  return <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))", gap: 16 }}>{children}</section>;
}

export function TnSeksjon({ tittel, forklaring, children }: { tittel: string; forklaring?: string; children: ReactNode }) {
  return <TnSeksjonDS tittel={tittel} forklaring={forklaring}>{children}</TnSeksjonDS>;
}

export function TnTomtilstand({ tittel, tekst, handling }: { tittel: string; tekst: string; handling?: ReactNode }) {
  return (
    <TnKort style={{ border: `1px solid ${TN.borderSubtle}` }}>
      <h2 style={{ margin: 0, color: TN.navy900, fontSize: TN.text.h3 }}>{tittel}</h2>
      <p style={{ margin: "8px 0 0", maxWidth: 680, color: TN.textSecondary, lineHeight: TN.leading.normal }}>{tekst}</p>
      {handling ? <div style={{ marginTop: 16 }}>{handling}</div> : null}
    </TnKort>
  );
}

export function TnLenke({ href, children, fremhevet = false }: { href: string; children: ReactNode; fremhevet?: boolean }) {
  return (
    <Link href={href} style={{ minHeight: 44, display: "inline-flex", alignItems: "center", padding: fremhevet ? "0 18px" : 0, borderRadius: TN.radius.full, background: fremhevet ? TN.navy900 : "transparent", color: fremhevet ? TN.white : TN.navy700, fontWeight: TN.weight.semibold, fontSize: TN.text.sm, textDecoration: fremhevet ? "none" : "underline", textUnderlineOffset: 4 }}>
      {children}
    </Link>
  );
}

export type TnSpillerFane = "post" | "oversikt" | "tester" | "analyse" | "workbench" | "teknisk-plan" | "evaluering";

/**
 * Fast spillerhode + fanebar — brukes på ALLE spillerscopede TN-ruter
 * (post, oversikt, tester, analyse, og planøktens workbench/teknisk-plan/
 * evaluering) slik at spilleren forblir tydelig fastholdt i overskriften
 * uansett hvilken fane man er på. «Post» beholder sin egen, eksisterende
 * rute (/team-norway/spiller/[id]) uendret — denne baren gjør den nåbar
 * som en tydelig fane i stedet for eneste inngang.
 *
 * Plan/Teknisk plan/Evaluering er nå EKTE faner i samme nav (med
 * `aria-current`), ikke en løsrevet lenkerad under — planøktens sider kan
 * derfor sette `aktiv="workbench"`/`"teknisk-plan"`/`"evaluering"` uten
 * cast og faktisk få fanen markert aktiv.
 *
 * `kanAdministrere`-navnet er beholdt for bakoverkompatibilitet med
 * kalleren i planøktens ruter (ikke en omdøping som bryter planfiler),
 * men betydningen her er LESETILGANG (COACH/ASSISTANT/ADMIN — dvs.
 * `!erSpiller`), ikke skrivetilgang: en ASSISTANT skal se disse fanene
 * selv om de ikke kan redigere planen selv (de underliggende rutene har
 * sin egen skrivevakt). Kall med `!kontekst.erSpiller`, ikke
 * `kontekst.kanAdministrere` (se coordination.md for planøkten).
 */
export function TnSpillerFaner({ spillerId, spillerNavn, aktiv, kanAdministrere }: { spillerId: string; spillerNavn: string; aktiv: TnSpillerFane; kanAdministrere: boolean }) {
  const kjernefaner: { id: TnSpillerFane; label: string; href: string }[] = [
    { id: "oversikt", label: "Oversikt", href: `/team-norway/spiller/${spillerId}/oversikt` },
    { id: "post", label: "Post", href: `/team-norway/spiller/${spillerId}` },
    { id: "tester", label: "Tester", href: `/team-norway/spiller/${spillerId}/tester` },
    { id: "analyse", label: "Analyse", href: `/team-norway/spiller/${spillerId}/analyse` },
  ];
  const planfaner: { id: TnSpillerFane; label: string; href: string }[] = kanAdministrere
    ? [
        { id: "workbench", label: "Plan (Workbench)", href: `/team-norway/workbench?spiller=${spillerId}` },
        { id: "teknisk-plan", label: "Teknisk plan", href: `/team-norway/spiller/${spillerId}/teknisk-plan` },
        { id: "evaluering", label: "Evaluering", href: `/team-norway/spiller/${spillerId}/evaluering` },
      ]
    : [];
  const faner = [...kjernefaner, ...planfaner];
  return (
    <header style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <p style={{ margin: 0, fontFamily: TN.font.mono, fontSize: TN.text.micro, letterSpacing: TN.tracking.eyebrow, textTransform: "uppercase", color: TN.textSecondary }}>Spiller</p>
        <h1 style={{ margin: "6px 0 0", fontFamily: TN.font.display, fontSize: "clamp(1.75rem, 4vw, 2.25rem)", lineHeight: TN.leading.tight, color: TN.navy900 }}>{spillerNavn}</h1>
      </div>
      <nav aria-label="Spillerfaner" style={{ display: "flex", gap: 4, flexWrap: "wrap", borderBottom: `1px solid ${TN.borderSubtle}` }}>
        {faner.map((f) => (
          <Link
            key={f.id}
            href={f.href}
            aria-current={aktiv === f.id ? "page" : undefined}
            style={{
              minHeight: 44, display: "inline-flex", alignItems: "center", padding: "0 14px",
              fontSize: TN.text.sm, fontWeight: aktiv === f.id ? TN.weight.bold : TN.weight.semibold,
              color: aktiv === f.id ? TN.navy900 : TN.textSecondary,
              borderBottom: aktiv === f.id ? `2px solid ${TN.navy900}` : "2px solid transparent",
              textDecoration: "none",
            }}
          >
            {f.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
