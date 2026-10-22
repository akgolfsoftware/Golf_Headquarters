import Link from "next/link";
import type { ReactNode } from "react";

import { TnKort, TnLogo, TnPille, type TnBunnValg, type TnMenyGruppe, type TnMenyLenke, type TnPilleTone } from "./core";
import { initialer } from "./initialer";
import { TnRailMobil } from "./rail-mobil";
import { TN_REFERANSESPILLERE_URL } from "./tn-referansespillere";
import { TnIkon } from "./tn-ikon";
import s from "./tn-skall.module.css";
import { TnSeksjonDS } from "./tn-skjerm";
import { TN } from "@/lib/v2/team-norway";

/**
 * TN-01 Organisasjonsskall — felles skall for alle Team Norway-ruter.
 * Fasit: docs/design-system/utkast-tn/grunnmur.html og felles/tn.css (pakke 1).
 * Navy sidemeny 252 px fra 900 px med seks hovedpunkter, ellers navy topplinje og
 * hvit bunnmeny med fire valg pluss «Mer».
 * Avvik:
 *   - Menypunkter uten egen datamodell åpner en ærlig tomtilstand, ikke demo-data.
 *   - Analyse (14.09.2026) er TN-egen gruppeanalyse (/team-norway/analyse),
 *     ikke lenger den innloggede brukerens PlayerHQ-analyse.
 *   - Topplinjen på mobil har ingen varselbjelle: Team Norway har ingen varsler ennå.
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
  | "referanse"
  | "referansenivaer"
  | "tilgang"
  | "inviter"
  | "fagapparat"
  | "live-watch"
  | "lisens"
  | "apparatet"
  | "analyse"
  | "datagolf"
  | "workbench"
  | "profil";

function lenke(label: string, href: string, id: TnAktivSide, aktiv: TnAktivSide): TnMenyLenke {
  return { label, href, aktiv: aktiv === id };
}

type MenyValg = { aktiv: TnAktivSide; groupId?: string; kanAdministrere: boolean; visDataGolf?: boolean };

/**
 * Sidemenyen i seks hovedpunkter (Anders 21.10.2026, beslutninger.md §TEAM NORWAY
 * ER BARE FOR TRENERE; fasit docs/design-system/utkast-tn/trenerflate/README.md):
 * Hjem · Spillere · Samlinger og testing · Turneringer · Referanse · Fag og
 * administrasjon. Flaten er bare for trenere, så menyen har ingen spillervariant.
 * Tomme grupper tas bort. IUP står ikke i menyen: den nås fra Spillere.
 */
export function tnHovedmeny({ aktiv, groupId, kanAdministrere, visDataGolf }: MenyValg): TnMenyGruppe[] {
  const grupper: Omit<TnMenyGruppe, "aktiv">[] = [
    {
      id: "hjem",
      label: "Hjem",
      ikon: "oversikt",
      punkter: [
        lenke("I dag", "/team-norway", "oversikt", aktiv),
        ...(groupId ? [lenke("Gruppeposter", `/team-norway/${groupId}`, "gruppeposter", aktiv), lenke("Dokumenter", `/team-norway/${groupId}/dokumenter`, "dokumenter", aktiv)] : []),
      ],
    },
    {
      id: "spillere",
      label: "Spillere",
      ikon: "spillere",
      punkter: [
        lenke("Spillere", "/team-norway/spillere", "spillere", aktiv),
        lenke("Skoler", "/team-norway/skoler", "skoler", aktiv),
        lenke("College og USA", "/team-norway/college", "college", aktiv),
      ],
    },
    {
      id: "samlinger",
      label: "Samlinger og testing",
      ikon: "kalender",
      punkter: [
        lenke("Samlinger", "/team-norway/samlinger", "samlinger", aktiv),
        lenke("Månedsplan", "/team-norway/manedsplan", "manedsplan", aktiv),
        lenke("Fellestesting", "/team-norway/fellestesting", "fellestesting", aktiv),
        lenke("Gruppeanalyse", "/team-norway/analyse", "analyse", aktiv),
        { label: "WANG-tester", href: "/team-norway/wang-resultater", aktiv: false },
      ],
    },
    {
      id: "turneringer",
      label: "Turneringer",
      ikon: "uttak",
      punkter: [
        lenke("Turneringer", "/team-norway/turneringer", "turneringer", aktiv),
        lenke("Live Watch", "/team-norway/live-watch", "live-watch", aktiv),
        lenke("Uttak", "/team-norway/uttak", "uttak", aktiv),
        lenke("Rangliste", "/team-norway/rangliste", "rangliste", aktiv),
      ],
    },
    {
      id: "referanse",
      label: "Referanse",
      ikon: "gruppe",
      punkter: [
        lenke("WAGR", "/team-norway/referanse", "referanse", aktiv),
        // HCP Norge, Norsk golf, Sammenlign og Søk ligger fortsatt på teamnorwayref til de er bygget i HQ
        // (beslutninger.md §TEAM NORWAY ER BARE FOR TRENERE, punkt 4).
        { label: "Referansespillere", href: TN_REFERANSESPILLERE_URL, aktiv: false },
        lenke("Referansenivåer", "/team-norway/referansenivaer", "referansenivaer", aktiv),
      ],
    },
    {
      id: "fag",
      label: "Fag og administrasjon",
      ikon: "plan",
      punkter: [
        lenke("Årsplan", "/team-norway/workbench", "workbench", aktiv),
        lenke("Testprotokoller", "/team-norway/protokoller", "protokoller", aktiv),
        lenke("Fagapparat", "/team-norway/fagapparat", "fagapparat", aktiv),
        lenke("Lisens og status", "/team-norway/lisens-okonomi", "lisens", aktiv),
        ...(kanAdministrere ? [lenke("Trenere og tilgang", "/team-norway/tilgang", "tilgang", aktiv), lenke("Inviter spiller", "/team-norway/inviter", "inviter", aktiv)] : []),
        // Data Golf er bare for ADMIN (beslutninger.md §DATA GOLF ER ANDERS' PRIVATE VERKTØY).
        ...(visDataGolf ? [lenke("Data Golf", "/team-norway/datagolf", "datagolf", aktiv)] : []),
      ],
    },
  ];
  return grupper.filter((g) => g.punkter.length > 0).map((g) => ({ ...g, aktiv: g.punkter.some((p) => p.aktiv) }));
}

/** Fire faste valg i mobilens bunnlinje. Resten ligger under «Mer». */
export function tnBunnmeny({ aktiv }: MenyValg): TnBunnValg[] {
  return [
    { ...lenke("Hjem", "/team-norway", "oversikt", aktiv), ikon: "oversikt" },
    { label: "Spillere", href: "/team-norway/spillere", aktiv: aktiv === "spillere" || aktiv === "skoler" || aktiv === "college", ikon: "spillere" },
    { label: "Samlinger", href: "/team-norway/samlinger", aktiv: aktiv === "samlinger" || aktiv === "manedsplan" || aktiv === "fellestesting" || aktiv === "analyse", ikon: "kalender" },
    { label: "Turneringer", href: "/team-norway/turneringer", aktiv: aktiv === "turneringer" || aktiv === "live-watch" || aktiv === "uttak" || aktiv === "rangliste", ikon: "uttak" },
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
  visDataGolf = false,
  flate = "standard",
  tilbake,
  children,
}: {
  aktiv: TnAktivSide;
  brukerNavn: string;
  rolle: string;
  groupId?: string;
  visTrenerflater: boolean;
  kanAdministrere: boolean;
  /** Menypunktet Data Golf. Settes av sider på serveren som har spurt datagolf-porten (bare coach og admin). */
  visDataGolf?: boolean;
  /**
   * «full» dropper innholdsmarg og maksbredde for skjermer som har sin egen
   * flate — i dag bare liste/detalj på Trenere og tilgang. Skinnen, menyen,
   * organisasjonsnavnet og brukerfoten er de samme uansett; det er DER
   * spriken oppsto, ikke i innholdet.
   */
  flate?: "standard" | "full";
  /** Undersider: tilbakelinje under topplinjen på mobil (PC har sidemenyen). */
  tilbake?: { href: string; label: string };
  children: ReactNode;
}) {
  const valg = { aktiv, groupId, kanAdministrere, visDataGolf: visTrenerflater && visDataGolf };
  const grupper = tnHovedmeny(valg);
  return (
    <div className={s.skall}>
      <TnRail grupper={grupper} bruker={{ navn: brukerNavn, rolle }} orgNavn="Team Norway Golf" orgUndertittel="Prestasjon" />
      <div className={s.kolonne}>
        <TnRailMobil grupper={grupper} bunn={tnBunnmeny(valg)} brukerNavn={brukerNavn} rolle={rolle} orgNavn="Team Norway Golf" orgUndertittel="Prestasjon" />
        {tilbake ? (
          <div className={s.tilbakelinje}>
            <Link href={tilbake.href} className={s.tilbake}><TnIkon navn="pil" />{tilbake.label}</Link>
          </div>
        ) : null}
        {flate === "full" ? children : <main className={s.innhold}>{children}</main>}
        {/* Plass til den faste bunnmenyen på mobil, så siste rad aldri skjules bak den. */}
        <div className={s.bunnplass} aria-hidden="true" />
      </div>
    </div>
  );
}

/**
 * Navy sidemeny 252 px (PC). Seks grupper som kan lukkes (utkast 2, 16.10):
 * bare gruppa du er i står åpen. `<details>` gjør det uten JavaScript, og ingen
 * menypunkter er fjernet. Aktiv rad har lysere navy bak og rød markør 3 px.
 * Brukeren står nederst med rund avatar.
 */
function TnRail({ grupper, bruker, orgNavn, orgUndertittel }: { grupper: TnMenyGruppe[]; bruker: { navn: string; rolle: string }; orgNavn: string; orgUndertittel: string }) {
  return (
    <nav aria-label="Hovedmeny" className={s.meny}>
      <span className={s.menyLogo}><TnLogo hoyde={44} prioritet paaMork /></span>
      <span className={s.org}><span className="sr-only">{orgNavn}</span><span className={s.orgUnder}>{orgUndertittel}</span></span>
      {grupper.map((g) => (
        <details key={g.id} className={s.menygruppe} open={g.aktiv || undefined}>
          <summary className={s.gruppe}>{g.label}<TnIkon navn="videre" storrelse={16} /></summary>
          <div className={s.gruppePunkter}>
            {g.punkter.map((p) => (
              <a key={p.href} href={p.href} className={s.lenke} aria-current={p.aktiv ? "page" : undefined}>{p.label}</a>
            ))}
          </div>
        </details>
      ))}
      <Link href="/team-norway/profil" className={s.bruker} aria-label={`Min profil, ${bruker.navn}`}>
        <span className={s.avatar} aria-hidden="true">{initialer(bruker.navn)}</span>
        <span><span className={s.brukerNavn}>{bruker.navn}</span><span className={s.brukerRolle}>{bruker.rolle}</span></span>
      </Link>
    </nav>
  );
}

export function TnMetrikk({ etikett, verdi, forklaring, tone = "navy" }: { etikett: string; verdi: ReactNode; forklaring?: string; tone?: TnPilleTone }) {
  return (
    <TnKort>
      <TnPille tone={tone}>{etikett}</TnPille>
      <div style={{ marginTop: 12, fontFamily: TN.font.mono, fontSize: 30, fontWeight: 500, lineHeight: 1.05, letterSpacing: "-0.02em", color: TN.navy900, fontVariantNumeric: "tabular-nums" }}>{verdi}</div>
      {forklaring ? <p style={{ margin: "8px 0 0", color: TN.ink700, fontSize: 14.5, lineHeight: 1.55 }}>{forklaring}</p> : null}
    </TnKort>
  );
}

export function TnMetrikkRutenett({ children }: { children: ReactNode }) {
  return <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 8 }}>{children}</section>;
}

export function TnSeksjon({ tittel, forklaring, children }: { tittel: string; forklaring?: string; children: ReactNode }) {
  return <TnSeksjonDS tittel={tittel} forklaring={forklaring}>{children}</TnSeksjonDS>;
}

export function TnTomtilstand({ tittel, tekst, handling }: { tittel: string; tekst: string; handling?: ReactNode }) {
  return (
    <TnKort style={{ background: TN.ink50 }}>
      <h2 style={{ margin: 0, color: TN.ink900, fontFamily: TN.font.body, fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{tittel}</h2>
      <p style={{ margin: "8px 0 0", maxWidth: 680, color: TN.ink700, fontSize: 14.5, lineHeight: 1.55 }}>{tekst}</p>
      {handling ? <div style={{ marginTop: 16 }}>{handling}</div> : null}
    </TnKort>
  );
}

export function TnLenke({ href, children, fremhevet = false }: { href: string; children: ReactNode; fremhevet?: boolean }) {
  return (
    <Link href={href} style={{ minHeight: 44, display: "inline-flex", alignItems: "center", padding: fremhevet ? "0 18px" : 0, borderRadius: TN.radius.pill, border: fremhevet ? `1px solid ${TN.navy900}` : "none", background: fremhevet ? TN.navy900 : "transparent", color: fremhevet ? TN.white : TN.navy600, fontWeight: TN.weight.bold, fontSize: 14, textDecoration: fremhevet ? "none" : "underline", textUnderlineOffset: 4 }}>
      {children}
    </Link>
  );
}

export type TnSpillerFane = "post" | "oversikt" | "profil" | "tester" | "analyse" | "workbench" | "teknisk-plan" | "evaluering" | "turneringsplan";

/**
 * IUP-hodet for alle spillerscopede TN-ruter (Anders 15.10.2026: spillerprofilen
 * heter IUP i Team Norway). Rund avatar, overlinje som begynner med «IUP»,
 * navnet som tittel, og fanene i fast rekkefølge med rød strek under aktiv fane.
 * Fanen som i koden heter «evaluering», heter Fireukerssjekk.
 * Rekkefølgen følger IUP-arket (wireframes docs/design-system/utkast-tn/trenerflate, §2):
 * Oversikt · Turneringsplan · Ranking · Turneringer · Trening · Tester · Teknisk plan · Fireukerssjekk.
 * Til Ranking, Turneringer og Trening er bygget (pakke e), står dagens Profil og Plan på plassen
 * til fanen som erstatter dem, og Analyse ved Tester. Post er seksjonen «Poster» i Oversikt.
 *
 * `kanAdministrere` betyr her LESETILGANG til planfanene (COACH/ASSISTANT/ADMIN,
 * dvs. `!erSpiller`), ikke skrivetilgang. De underliggende rutene har egen skrivevakt.
 */
export function TnSpillerFaner({ spillerId, kanAdministrere, aktiv }: { spillerId: string; spillerNavn?: string; aktiv: TnSpillerFane; kanAdministrere: boolean }) {
  const s = `/team-norway/spiller/${spillerId}`;
  const faner: { id: TnSpillerFane; label: string; href: string }[] = [
    { id: "oversikt", label: "Oversikt", href: s },
    { id: "turneringsplan", label: "Turneringsplan", href: `${s}/turneringsplan` },
    { id: "profil", label: "Profil", href: `${s}/profil` },
    ...(kanAdministrere ? [{ id: "workbench" as const, label: "Plan", href: `/team-norway/workbench?spiller=${spillerId}` }] : []),
    { id: "tester", label: "Tester", href: `${s}/tester` },
    { id: "analyse", label: "Analyse", href: `${s}/analyse` },
    ...(kanAdministrere
      ? [
          { id: "teknisk-plan" as const, label: "Teknisk plan", href: `${s}/teknisk-plan` },
          { id: "evaluering" as const, label: "Fireukerssjekk", href: `${s}/evaluering` },
        ]
      : []),
  ];
  const nav = (
    <nav aria-label="IUP-faner" style={{ display: "flex", flexWrap: "wrap", borderBottom: `1px solid ${TN.ink200}` }}>
      {faner.map((f) => (
        <Link
          key={f.id}
          href={f.href}
          aria-current={aktiv === f.id ? "page" : undefined}
          style={{
            minHeight: 44, display: "inline-flex", alignItems: "center", padding: "0 12px", marginBottom: -1,
            fontSize: 14, fontWeight: 700,
            color: aktiv === f.id ? TN.navy900 : TN.ink700,
            borderBottom: `3px solid ${aktiv === f.id ? TN.red600 : "transparent"}`,
            textDecoration: "none",
          }}
        >
          {f.label}
        </Link>
      ))}
    </nav>
  );
  return nav;
}

/** Nøkkeltall i IUP-hodet: liten etikett i mono over verdien. Manglende verdi er «—». */
export function TnNokkeltall({ tall }: { tall: Array<{ etikett: string; verdi: ReactNode }> }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px" }}>
      {tall.map((t) => (
        <span key={t.etikett} style={{ display: "grid", gap: 2 }}>
          <small style={{ fontFamily: TN.font.body, fontWeight: 700, fontSize: 12.5, lineHeight: 1.2, color: TN.ink500 }}>{t.etikett}</small>
          <b style={{ fontFamily: TN.font.mono, fontWeight: 500, fontSize: 18, lineHeight: 1.1, color: TN.navy900 }}>{t.verdi}</b>
        </span>
      ))}
    </div>
  );
}
