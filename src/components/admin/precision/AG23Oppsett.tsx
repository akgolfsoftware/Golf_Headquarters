"use client";

/**
 * Precision Athletics — Oppsett (AG-23).
 *
 * Kilde: Claude Design AG-23 (designsystem/precision-athletics/ui_kits/agencyos/screens/AG-23.jsx).
 * Ruter: /admin/oppsett, /admin/profile, /admin/team/ekstern, /admin/team/inviter, /admin/marketing.
 *
 * Viser bare det som finnes i basen (egen profil, team). Alt som ikke er koblet er
 * deaktivert med «Ikke koblet ennå»; ingenting lagres eller bekreftes falskt.
 * Faner: profil, team, inviter, ekstern, varsler, integr, mark, virks.
 */

import { useState } from "react";
import { ArrowRight, Settings } from "lucide-react";
import {
  FeilTilstand,
  KnappLenke,
  LasterTilstand,
  Meta,
  Sidehode,
  StatusPille,
  TomTilstand,
} from "@/components/precision/pa";
import { Faner, Kort, KortHode, Nokkelverdi, Tabell, type Kolonne } from "@/components/precision/pa-a5";
import "@/styles/precision-a23.css";

export type TeamMedlem = {
  id: string;
  name: string;
  role: string;
  access: "Admin" | "Coach" | "Les";
  /** Null når visningen ikke har lov til å vise e-posten. */
  email: string | null;
};

export type AG23Data = {
  team: TeamMedlem[];
  /** Innlogget brukers egne opplysninger. Null når de ikke er lastet. */
  profil: { navn: string; epost: string | null; rolle: string } | null;
};

export type AG23Tilstand = "data" | "tom" | "laster" | "feil";

export type AG23OppsettProps = {
  tilstand?: AG23Tilstand;
  data?: AG23Data;
  startFane?: string;
};

const TOM_DATA: AG23Data = { team: [], profil: null };

const TABS = [
  { value: "profil", label: "Egen profil" },
  { value: "team", label: "Team og tilgang" },
  { value: "inviter", label: "Inviter coach" },
  { value: "ekstern", label: "Ekstern trener" },
  { value: "varsler", label: "Varsler" },
  { value: "integr", label: "Integrasjoner" },
  { value: "mark", label: "Markedsføring" },
  { value: "virks", label: "Virksomhet" },
];

const SUB = "Profil, team, tilgang, varsler og integrasjoner.";

function IkkeKoblet({ tittel, tekst, href, lenke }: { tittel: string; tekst: string; href?: string; lenke?: string }) {
  return (
    <TomTilstand
      icon={Settings}
      title={tittel}
      text={tekst}
      actions={
        href ? (
          <KnappLenke href={href} variant="secondary" icon={ArrowRight}>
            {lenke ?? "Åpne"}
          </KnappLenke>
        ) : undefined
      }
    />
  );
}

export function AG23Oppsett({ tilstand = "data", data = TOM_DATA, startFane = "team" }: AG23OppsettProps) {
  const [aktivFane, setAktivFane] = useState(startFane);

  if (tilstand === "laster") {
    return (
      <div className="pa-a23" data-testid="ag23-laster">
        <Sidehode kicker="Oppsett" title="Oppsett" sub={SUB} />
        <LasterTilstand text="Henter oppsett …" />
      </div>
    );
  }

  if (tilstand === "feil") {
    return (
      <div className="pa-a23" data-testid="ag23-feil">
        <Sidehode kicker="Oppsett" title="Oppsett" sub={SUB} />
        <FeilTilstand
          icon={Settings}
          title="Oppsettet kunne ikke hentes"
          text="Ingen innstillinger er endret. Prøv igjen."
          code="OPPSETT"
        />
      </div>
    );
  }

  const team = tilstand === "tom" ? [] : data.team;

  const teamKolonner: Kolonne<TeamMedlem>[] = [
    { key: "name", label: "Navn", render: (r) => r.name, lead: true },
    { key: "role", label: "Rolle", render: (r) => r.role },
    {
      key: "access",
      label: "Tilgang",
      render: (r) => <StatusPille tone={r.access === "Admin" ? "ok" : "neutral"}>{r.access}</StatusPille>,
    },
    { key: "email", label: "E-post", render: (r) => r.email ?? "—", mono: true },
  ];

  return (
    <div className="pa-a23" data-testid="ag23-oppsett">
      <Sidehode kicker="Oppsett" title="Oppsett" sub={SUB} />

      <Faner faner={TABS} value={aktivFane} onChange={setAktivFane} />

      {aktivFane === "profil" && (
        <div className="pa-a23__card" data-testid="ag23-fane-profil">
          <Kort>
            <KortHode tittel="Egen profil" aside="BARE VISNING" />
            {data.profil ? (
              <Nokkelverdi
                items={[
                  ["Navn", data.profil.navn],
                  ["E-post", data.profil.epost ?? "—"],
                  ["Rolle", data.profil.rolle],
                ]}
              />
            ) : (
              <Meta>PROFIL IKKE LASTET</Meta>
            )}
            <Meta>ENDRING AV PROFIL OG TOTRINNSINNLOGGING ER IKKE KOBLET ENNÅ</Meta>
          </Kort>
        </div>
      )}

      {aktivFane === "team" && (
        <div data-testid="ag23-fane-team">
          {team.length === 0 ? (
            <TomTilstand
              icon={Settings}
              title="Ingen teammedlemmer å vise"
              text="Coacher og admin vises her når de er lagt til."
            />
          ) : (
            <Tabell caption="Team og tilgang" columns={teamKolonner} rows={team} tomTekst="Ingen medarbeidere registrert." />
          )}
        </div>
      )}

      {aktivFane === "inviter" && (
        <div data-testid="ag23-fane-inviter">
          <IkkeKoblet
            tittel="Invitasjon sendes fra egen side"
            tekst="Å invitere en coach lagres i basen på invitasjonssiden. Her lages ingenting."
            href="/admin/team/inviter"
            lenke="Åpne invitasjonssiden"
          />
        </div>
      )}

      {aktivFane === "ekstern" && (
        <div data-testid="ag23-fane-ekstern">
          <IkkeKoblet
            tittel="Ekstern trener settes opp på egen side"
            tekst="Lesetilgang for ekstern trener lagres i basen på egen side. Her lages ingenting."
            href="/admin/team/ekstern"
            lenke="Åpne siden for ekstern trener"
          />
        </div>
      )}

      {aktivFane === "varsler" && (
        <div data-testid="ag23-fane-varsler">
          <IkkeKoblet
            tittel="Varselinnstillinger er ikke koblet ennå"
            tekst="Innstillingene lagres ikke fra denne skjermen ennå."
          />
        </div>
      )}

      {aktivFane === "integr" && (
        <div data-testid="ag23-fane-integr">
          <IkkeKoblet
            tittel="Integrasjonsstatus er ikke koblet ennå"
            tekst="Status for TrackMan, GolfBox, Tripletex, Notion og Data Golf leses ikke her ennå."
            href="/admin/workspace/notion"
            lenke="Åpne Notion-oppsett"
          />
        </div>
      )}

      {aktivFane === "mark" && (
        <div data-testid="ag23-fane-mark">
          <IkkeKoblet
            tittel="Markedsføring styres på egen side"
            tekst="Forsidetekster lagres på markedssiden. Her lages ingenting."
            href="/admin/marketing"
            lenke="Åpne markedsføring"
          />
        </div>
      )}

      {aktivFane === "virks" && (
        <div className="pa-a23__card" data-testid="ag23-fane-virks">
          <Kort>
            <KortHode tittel="Virksomhetsinformasjon" />
            <Nokkelverdi
              items={[
                ["Org.nr.", "—", "IKKE REGISTRERT HER"],
                ["Virksomheter", "Mulligan · Academy · Software · WANG · GFGK", undefined],
                ["Tidssone", "Europe/Oslo", undefined],
              ]}
            />
          </Kort>
        </div>
      )}
    </div>
  );
}
