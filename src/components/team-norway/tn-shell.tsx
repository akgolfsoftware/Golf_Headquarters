import Link from "next/link";
import type { ReactNode } from "react";

import { TnKort, TnPille, TnRail, type TnBunnValg, type TnMenyGruppe, type TnMenyLenke, type TnPilleTone } from "./core";
import { TnRailMobil } from "./rail-mobil";
import { TN } from "@/lib/v2/team-norway";

/**
 * TN-01 Organisasjonsskall — felles skall for alle Team Norway-ruter.
 * Fasit: designsystem/team-norway/templates/tn-skall/TnSkall.dc.html
 * Avvik:
 *   - Menypunkter uten egen datamodell åpner en ærlig tomtilstand, ikke demo-data.
 *   - Analyse og DataGolf går til AK Golf HQs eksisterende funksjonsflater.
 *   - Ingen riggrad: den visuelle riggen dekker ikke Claw ennå.
 */

export type TnAktivSide =
  | "oversikt"
  | "fellestesting"
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
  | "lisens";

function lenke(label: string, href: string, id: TnAktivSide, aktiv: TnAktivSide): TnMenyLenke {
  return { label, href, aktiv: aktiv === id };
}

type MenyValg = { aktiv: TnAktivSide; groupId?: string; visTrenerflater: boolean; kanAdministrere: boolean };

/**
 * Sidemenyen i seks grupper (fasit: «Team Norway App delivery», runde 26.09).
 * Spilleren ser bare ti skjermer og aldri uttak, fellestesting, fagapparat
 * eller admin. Tomme grupper tas bort. Spillerprofil står ikke i menyen:
 * den krever en valgt spiller og nås fra Spillerutvikling.
 */
export function tnHovedmeny({ aktiv, groupId, visTrenerflater: t, kanAdministrere }: MenyValg): TnMenyGruppe[] {
  const grupper: Omit<TnMenyGruppe, "aktiv">[] = [
    {
      id: "daglig",
      label: "Daglig",
      ikon: "calendar",
      punkter: [
        lenke("Oversikt", "/team-norway", "oversikt", aktiv),
        lenke("Samlinger", "/team-norway/samlinger", "samlinger", aktiv),
        lenke("Turneringer og reise", "/team-norway/turneringer", "turneringer", aktiv),
        lenke("Live Watch", "/team-norway/live-watch", "live-watch", aktiv),
      ],
    },
    {
      id: "spillere",
      label: "Spillere",
      ikon: "users",
      punkter: [
        ...(t ? [lenke("Spillerutvikling", "/team-norway/spillere", "spillere", aktiv), lenke("Fellestesting", "/team-norway/fellestesting", "fellestesting", aktiv)] : []),
        lenke("College og USA", "/team-norway/college", "college", aktiv),
        ...(t ? [lenke("Skoleoversikt", "/team-norway/skoler", "skoler", aktiv)] : []),
      ],
    },
    {
      id: "uttak",
      label: "Uttak",
      ikon: "check",
      punkter: t
        ? [
            lenke("Uttak og kriterier", "/team-norway/uttak", "uttak", aktiv),
            lenke("Rangliste", "/team-norway/rangliste", "rangliste", aktiv),
            { label: "DataGolf", href: "/portal/analysere/datagolf", aktiv: false },
          ]
        : [],
    },
    {
      id: "plan",
      label: "Plan og fag",
      ikon: "clock",
      punkter: [
        lenke("Månedsplan", "/team-norway/manedsplan", "manedsplan", aktiv),
        ...(t
          ? [
              lenke("Testprotokoller", "/team-norway/protokoller", "protokoller", aktiv),
              lenke("Referansenivåer", "/team-norway/referansenivaer", "referansenivaer", aktiv),
              lenke("Fagapparat", "/team-norway/fagapparat", "fagapparat", aktiv),
              { label: "Analyse", href: "/portal/analysere", aktiv: false },
            ]
          : []),
      ],
    },
    {
      id: "gruppe",
      label: "Gruppe",
      ikon: "mail",
      punkter: groupId
        ? [lenke("Gruppeposter", `/team-norway/${groupId}`, "gruppeposter", aktiv), lenke("Dokumenter", `/team-norway/${groupId}/dokumenter`, "dokumenter", aktiv)]
        : [],
    },
    {
      id: "admin",
      label: t ? "Meg og admin" : "Meg",
      ikon: "user",
      punkter: [
        lenke("Lisens og økonomi", "/team-norway/lisens-okonomi", "lisens", aktiv),
        { label: "Samtykke", href: "/portal/meg/innstillinger/personvern/deling", aktiv: false },
        ...(kanAdministrere ? [lenke("Trenere og tilgang", "/team-norway/tilgang", "tilgang", aktiv), lenke("Inviter spiller", "/team-norway/inviter", "inviter", aktiv)] : []),
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
        { label: "Spillere", href: "/team-norway/spillere", aktiv: aktiv === "spillere" || aktiv === "fellestesting" || aktiv === "skoler", ikon: "users" },
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

export function TnSidehode({
  overlinje,
  tittel,
  ingress,
  handling,
}: {
  overlinje: string;
  tittel: string;
  ingress: string;
  handling?: ReactNode;
}) {
  return (
    <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontFamily: TN.font.mono, fontSize: TN.text.micro, letterSpacing: TN.tracking.eyebrow, textTransform: "uppercase", color: TN.textSecondary }}>{overlinje}</p>
        <h1 style={{ margin: "6px 0 0", fontFamily: TN.font.display, fontSize: "clamp(1.75rem, 4vw, 2.5rem)", lineHeight: TN.leading.tight, letterSpacing: TN.tracking.heading, color: TN.navy900 }}>{tittel}</h1>
        <p style={{ margin: "10px 0 0", maxWidth: 720, color: TN.textSecondary, lineHeight: TN.leading.normal }}>{ingress}</p>
      </div>
      {handling}
    </header>
  );
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
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <h2 style={{ margin: 0, color: TN.navy900, fontSize: TN.text.h3, letterSpacing: TN.tracking.heading }}>{tittel}</h2>
        {forklaring ? <p style={{ margin: "5px 0 0", color: TN.textSecondary, fontSize: TN.text.sm, lineHeight: TN.leading.normal }}>{forklaring}</p> : null}
      </div>
      {children}
    </section>
  );
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
