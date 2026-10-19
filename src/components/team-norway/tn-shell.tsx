import Link from "next/link";
import type { ReactNode } from "react";

import { TnKort, TnLogo, TnPille, type TnBunnValg, type TnMenyGruppe, type TnMenyLenke, type TnPilleTone } from "./core";
import { initialer } from "./initialer";
import { TnRailMobil } from "./rail-mobil";
import { TnIkon } from "./tn-ikon";
import s from "./tn-skall.module.css";
import { TnSeksjonDS, TnSidehodeDS } from "./tn-skjerm";
import { TN } from "@/lib/v2/team-norway";

/**
 * TN-01 Organisasjonsskall — felles skall for alle Team Norway-ruter.
 * Fasit: docs/design-system/utkast-tn/grunnmur.html og felles/tn.css (pakke 1).
 * Navy sidemeny 252 px fra 900 px med seks grupper, ellers navy topplinje og
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
  | "referansenivaer"
  | "tilgang"
  | "inviter"
  | "fagapparat"
  | "live-watch"
  | "lisens"
  | "apparatet"
  | "analyse"
  | "datagolf"
  | "workbench";

function lenke(label: string, href: string, id: TnAktivSide, aktiv: TnAktivSide): TnMenyLenke {
  return { label, href, aktiv: aktiv === id };
}

type MenyValg = { aktiv: TnAktivSide; groupId?: string; visTrenerflater: boolean; kanAdministrere: boolean; visDataGolf?: boolean };

/**
 * Sidemenyen i seks grupper (fasit: «Team Norway App delivery», runde 26.09).
 * Spilleren ser bare ti skjermer og aldri uttak, fellestesting, fagapparat
 * eller admin. Tomme grupper tas bort. Spillerprofil står ikke i menyen:
 * den krever en valgt spiller og nås fra Spillerutvikling.
 */
export function tnHovedmeny({ aktiv, groupId, visTrenerflater: t, kanAdministrere, visDataGolf }: MenyValg): TnMenyGruppe[] {
  const grupper: Omit<TnMenyGruppe, "aktiv">[] = [
    {
      id: "daglig",
      label: "Daglig",
      ikon: "kalender",
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
      ikon: "spillere",
      punkter: [
        ...(t ? [lenke("Spillerutvikling", "/team-norway/spillere", "spillere", aktiv), lenke("Fellestesting", "/team-norway/fellestesting", "fellestesting", aktiv)] : []),
        lenke("College og USA", "/team-norway/college", "college", aktiv),
        ...(t ? [lenke("Skoleoversikt", "/team-norway/skoler", "skoler", aktiv)] : []),
      ],
    },
    {
      id: "uttak",
      label: "Uttak",
      ikon: "uttak",
      punkter: t
        ? [
            lenke("Uttak og kriterier", "/team-norway/uttak", "uttak", aktiv),
            lenke("Rangliste", "/team-norway/rangliste", "rangliste", aktiv),
            // Data Golf ligger under Plan og fag, og vises bare for coach og admin (Anders 09.10.2026).
          ]
        : [],
    },
    {
      id: "plan",
      label: "Plan og fag",
      ikon: "plan",
      punkter: [
        lenke("Månedsplan", "/team-norway/manedsplan", "manedsplan", aktiv),
        ...(t
          ? [
              lenke("Workbench", "/team-norway/workbench", "workbench", aktiv),
              lenke("Testprotokoller", "/team-norway/protokoller", "protokoller", aktiv),
              lenke("Referansenivåer", "/team-norway/referansenivaer", "referansenivaer", aktiv),
              lenke("Fagapparat", "/team-norway/fagapparat", "fagapparat", aktiv),
              lenke("Analyse", "/team-norway/analyse", "analyse", aktiv),
              // Data Golf er bare for coach og admin (Anders 09.10.2026), ikke alle TN-trenere.
              ...(visDataGolf ? [lenke("Data Golf", "/team-norway/datagolf", "datagolf", aktiv)] : []),
            ]
          : []),
      ],
    },
    {
      id: "gruppe",
      label: "Gruppe",
      ikon: "gruppe",
      punkter: groupId
        ? [lenke("Gruppeposter", `/team-norway/${groupId}`, "gruppeposter", aktiv), lenke("Dokumenter", `/team-norway/${groupId}/dokumenter`, "dokumenter", aktiv)]
        : [],
    },
    {
      id: "admin",
      label: t ? "Meg og admin" : "Meg",
      ikon: "meg",
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
        { ...lenke("Oversikt", "/team-norway", "oversikt", aktiv), ikon: "oversikt" },
        { ...lenke("Samlinger", "/team-norway/samlinger", "samlinger", aktiv), ikon: "kalender" },
        { label: "Uttak", href: "/team-norway/uttak", aktiv: aktiv === "uttak" || aktiv === "rangliste", ikon: "uttak" },
        { label: "Spillere", href: "/team-norway/spillere", aktiv: aktiv === "spillere" || aktiv === "fellestesting" || aktiv === "skoler", ikon: "spillere" },
      ]
    : [
        { ...lenke("Oversikt", "/team-norway", "oversikt", aktiv), ikon: "oversikt" },
        { ...lenke("Samlinger", "/team-norway/samlinger", "samlinger", aktiv), ikon: "kalender" },
        { ...lenke("Turneringer", "/team-norway/turneringer", "turneringer", aktiv), ikon: "plan" },
        { ...lenke("Lisens", "/team-norway/lisens-okonomi", "lisens", aktiv), ikon: "meg" },
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
  const valg = { aktiv, groupId, visTrenerflater, kanAdministrere, visDataGolf: visTrenerflater && visDataGolf };
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
      <div className={s.bruker}>
        <span className={s.avatar} aria-hidden="true">{initialer(bruker.navn)}</span>
        <span><span className={s.brukerNavn}>{bruker.navn}</span><span className={s.brukerRolle}>{bruker.rolle}</span></span>
      </div>
    </nav>
  );
}

export function TnSidehode({ overlinje, tittel, ingress, handling }: { overlinje: string; tittel: string; ingress: string; handling?: ReactNode }) {
  return <TnSidehodeDS overlinje={overlinje} tittel={tittel} ingress={ingress} handling={handling} />;
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
    <Link href={href} style={{ minHeight: 44, display: "inline-flex", alignItems: "center", padding: fremhevet ? "0 18px" : 0, borderRadius: TN.radius.sm, border: fremhevet ? `1px solid ${TN.navy900}` : "none", background: fremhevet ? TN.navy900 : "transparent", color: fremhevet ? TN.white : TN.navy600, fontWeight: TN.weight.bold, fontSize: 14, textDecoration: fremhevet ? "none" : "underline", textUnderlineOffset: 4 }}>
      {children}
    </Link>
  );
}

export type TnSpillerFane = "post" | "oversikt" | "tester" | "analyse" | "workbench" | "teknisk-plan" | "evaluering";

/**
 * IUP-hodet for alle spillerscopede TN-ruter (Anders 15.10.2026: spillerprofilen
 * heter IUP i Team Norway). Rund avatar, overlinje som begynner med «IUP»,
 * navnet som tittel, og fanene i fast rekkefølge med rød strek under aktiv fane.
 * Fanen som i koden heter «evaluering», heter Fireukerssjekk.
 * Fasit: docs/design-system/utkast-tn/spillere.html (pakke 3).
 *
 * `kanAdministrere` betyr her LESETILGANG til planfanene (COACH/ASSISTANT/ADMIN,
 * dvs. `!erSpiller`), ikke skrivetilgang. De underliggende rutene har egen skrivevakt.
 */
export function TnSpillerFaner({ spillerId, spillerNavn, aktiv, kanAdministrere, overlinje, kompakt = false, children }: { spillerId: string; spillerNavn: string; aktiv: TnSpillerFane; kanAdministrere: boolean; overlinje?: string; kompakt?: boolean; children?: ReactNode }) {
  const kjernefaner: { id: TnSpillerFane; label: string; href: string }[] = [
    { id: "oversikt", label: "Oversikt", href: `/team-norway/spiller/${spillerId}/oversikt` },
    { id: "post", label: "Post", href: `/team-norway/spiller/${spillerId}` },
    { id: "tester", label: "Tester", href: `/team-norway/spiller/${spillerId}/tester` },
    { id: "analyse", label: "Analyse", href: `/team-norway/spiller/${spillerId}/analyse` },
  ];
  const planfaner: { id: TnSpillerFane; label: string; href: string }[] = kanAdministrere
    ? [
        { id: "workbench", label: "Plan", href: `/team-norway/workbench?spiller=${spillerId}` },
        { id: "teknisk-plan", label: "Teknisk plan", href: `/team-norway/spiller/${spillerId}/teknisk-plan` },
        { id: "evaluering", label: "Fireukerssjekk", href: `/team-norway/spiller/${spillerId}/evaluering` },
      ]
    : [];
  const faner = [...kjernefaner, ...planfaner];
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
  // Underfanene har sitt eget sidehode («IUP · navn» over sidetittelen); da vises bare fanene.
  if (kompakt) return nav;
  return (
    <header style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
        <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: 64, height: 64, flex: "none", background: TN.navy100, color: TN.navy900, fontFamily: TN.font.mono, fontSize: 20 }}>{initialer(spillerNavn)}</span>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontFamily: TN.font.body, fontWeight: 700, fontSize: 13, lineHeight: 1.3, letterSpacing: "0.02em", color: TN.ink500 }}>{overlinje ?? "IUP"}</p>
          <h1 style={{ margin: 0, fontFamily: TN.font.display, fontWeight: 400, fontSize: "clamp(30px, 3vw, 38px)", lineHeight: 1.12, letterSpacing: "0.03em", color: TN.navy900, overflowWrap: "anywhere" }}>{spillerNavn}</h1>
        </div>
      </div>
      {children}
      {nav}
    </header>
  );
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
