"use client";

/**
 * Precision Athletics — Oppsett (AG-23).
 *
 * Kilde: Claude Design AG-23 (designsystem/precision-athletics/ui_kits/agencyos/screens/AG-23.jsx).
 * Ruter: /admin/oppsett, /admin/profile, /admin/team/ekstern, /admin/team/inviter, /admin/marketing.
 *
 * 8 faner:
 * 1. profil: Egen profil (visningsnavn, e-post, 2FA)
 * 2. team: Team og tilgang (tabell over coacher og tilganger)
 * 3. inviter: Inviter coach
 * 4. ekstern: Ekstern trener (lesetilgang til utvalgte spillere)
 * 5. varsler: Varselinnstillinger (Kø, innboks, ACWR, ukesdigest)
 * 6. integr: Integrasjoner (TrackMan, GolfBox, Tripletex, Notion, Data Golf)
 * 7. mark: Markedsføring forside (overskrift, medlemskap, ingen vitnesbyrd-regel)
 * 8. virks: Virksomhet (navn, org.nr, underavdelinger, tidssone)
 */

import { useState } from "react";
import {
  Check,
  Send,
  Settings,
} from "lucide-react";
import {
  FeilTilstand,
  Knapp,
  LasterTilstand,
  Meta,
  Sidehode,
  StatusPille,
} from "@/components/precision/pa";
import {
  Bryter,
  Faner,
  Felt,
  Kort,
  KortHode,
  Nokkelverdi,
  Tabell,
  TekstFelt,
  ValgFelt,
  type Kolonne,
} from "@/components/precision/pa-a5";
import "@/styles/precision-a23.css";

export type TeamMedlem = {
  id: string;
  name: string;
  role: string;
  access: "Admin" | "Coach" | "Les";
  email: string;
};

export type AG23Data = {
  team: TeamMedlem[];
  headline: string;
};

export type AG23Tilstand = "data" | "tom" | "laster" | "feil";

export type AG23OppsettProps = {
  tilstand?: AG23Tilstand;
  data?: AG23Data;
  startFane?: string;
  onLagreProfil?: (data: { navn: string; epost: string; totrinn: boolean }) => void;
  onInviter?: (invitasjon: { epost: string; rolle: string; spillere?: string }) => void;
};

const STANDARD_DATA: AG23Data = {
  team: [
    { id: "t1", name: "Anders Kristiansen", role: "Hovedcoach", access: "Admin", email: "anders@demo.no" },
    { id: "t2", name: "Kari Demo", role: "Assist Coach", access: "Coach", email: "kari@demo.no" },
    { id: "t3", name: "Per Demo", role: "Assist Coach", access: "Coach", email: "per@demo.no" },
    { id: "t4", name: "Line Demo", role: "Ekstern trener", access: "Les", email: "line@demo.no" },
  ],
  headline: "Book time hos AK Golf Academy",
};

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

export function AG23Oppsett({
  tilstand = "data",
  data = STANDARD_DATA,
  startFane = "team",
  onLagreProfil,
  onInviter,
}: AG23OppsettProps) {
  const [aktivFane, setAktivFane] = useState(startFane);
  const [team, setTeam] = useState<TeamMedlem[]>(
    tilstand === "tom" ? data.team.slice(0, 1) : data.team
  );
  const [profilNavn, setProfilNavn] = useState("Anders Kristiansen");
  const [profilEpost, setProfilEpost] = useState("anders@demo.no");
  const [totrinn, setTotrinn] = useState(true);

  const [invitasjon, setInvitasjon] = useState({
    email: "",
    role: "Assist Coach",
    spillere: "Tobias Lindvik",
  });
  const [invitasjonFeil, setInvitasjonFeil] = useState<string | null>(null);

  const [varsler, setVarsler] = useState({
    ko: true,
    innboks: true,
    acwr: true,
    uke: false,
  });

  const [marked, setMarked] = useState({
    headline: data.headline,
    show: true,
  });

  const [statusMelding, setStatusMelding] = useState<string | null>(null);

  if (tilstand === "laster") {
    return (
      <div className="pa-a23" data-testid="ag23-laster">
        <Sidehode
          kicker="Oppsett"
          title="Oppsett"
          sub="Profil, team, tilgang, varsler og integrasjoner."
        />
        <LasterTilstand text="Henter oppsett …" />
      </div>
    );
  }

  if (tilstand === "feil") {
    return (
      <div className="pa-a23" data-testid="ag23-feil">
        <Sidehode
          kicker="Oppsett"
          title="Oppsett"
          sub="Profil, team, tilgang, varsler og integrasjoner."
        />
        <FeilTilstand
          icon={Settings}
          title="Oppsettet kunne ikke hentes"
          text="Ingen innstillinger er endret. Prøv igjen."
          code="FEIL 502 · ORG"
        />
      </div>
    );
  }

  const handleInvite = (erEkstern = false) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invitasjon.email)) {
      setInvitasjonFeil("Skriv en gyldig e-postadresse.");
      return;
    }
    const nyRolle = erEkstern ? "Ekstern trener" : invitasjon.role;
    const nyAccess: "Admin" | "Coach" | "Les" = erEkstern ? "Les" : "Coach";
    const ny: TeamMedlem = {
      id: "t" + Date.now(),
      name: invitasjon.email.split("@")[0] || "Ny coach",
      role: nyRolle,
      access: nyAccess,
      email: invitasjon.email.trim(),
    };
    setTeam((prev) => [...prev, ny]);
    setInvitasjon({ ...invitasjon, email: "" });
    setInvitasjonFeil(null);
    setStatusMelding(
      "Invitasjonen er klar som utkast · SEND FRA INNBOKS · GYLDIG I 7 DAGER"
    );
    onInviter?.({
      epost: ny.email,
      rolle: ny.role,
      spillere: erEkstern ? invitasjon.spillere : undefined,
    });
  };

  const handleLagreProfil = () => {
    setStatusMelding("Profilen er lagret.");
    onLagreProfil?.({
      navn: profilNavn,
      epost: profilEpost,
      totrinn,
    });
  };

  const teamKolonner: Kolonne<TeamMedlem>[] = [
    { key: "name", label: "Navn", render: (r) => r.name, lead: true },
    { key: "role", label: "Rolle", render: (r) => r.role },
    {
      key: "access",
      label: "Tilgang",
      render: (r) => (
        <StatusPille tone={r.access === "Admin" ? "ok" : "neutral"}>
          {r.access}
        </StatusPille>
      ),
    },
    { key: "email", label: "E-post", render: (r) => r.email, mono: true },
  ];

  return (
    <div className="pa-a23" data-testid="ag23-oppsett">
      <Sidehode
        kicker="Oppsett"
        title="Oppsett"
        sub="Profil, team, tilgang, varsler og integrasjoner."
      />

      <Faner faner={TABS} value={aktivFane} onChange={setAktivFane} />

      {statusMelding && (
        <div
          role="status"
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-card, 8px)",
            background: "var(--surface-sunken)",
            border: "1px solid var(--border-hairline)",
            fontSize: "13px",
            color: "var(--text-primary)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{statusMelding}</span>
          <Knapp
            variant="ghost"
            size="sm"
            onClick={() => setStatusMelding(null)}
            aria-label="Lukk varsel"
          >
            Lukk
          </Knapp>
        </div>
      )}

      {/* Fane 1: Egen profil */}
      {aktivFane === "profil" && (
        <div className="pa-a23__card" data-testid="ag23-fane-profil">
          <Kort>
            <div className="pa-a23__profile-header">
              <div className="pa-a23__avatar" aria-hidden>
                AK
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 600 }}>
                  {profilNavn}
                </div>
                <Meta>HOVEDCOACH · ADMIN</Meta>
              </div>
            </div>

            <Felt label="Visningsnavn">
              <TekstFelt
                value={profilNavn}
                onChange={(e) => setProfilNavn(e.target.value)}
                aria-label="Visningsnavn"
              />
            </Felt>

            <Felt label="E-post">
              <TekstFelt
                type="email"
                value={profilEpost}
                onChange={(e) => setProfilEpost(e.target.value)}
                aria-label="E-postadresse"
              />
            </Felt>

            <Bryter
              checked={totrinn}
              onChange={(e) => setTotrinn(e.target.checked)}
              label="Totrinnsinnlogging (2FA)"
            />

            <div>
              <Knapp icon={Check} onClick={handleLagreProfil}>
                Lagre
              </Knapp>
            </div>
          </Kort>
        </div>
      )}

      {/* Fane 2: Team og tilgang */}
      {aktivFane === "team" && (
        <div data-testid="ag23-fane-team">
          {tilstand === "tom" && (
            <div
              className="pa-a23__alert"
              style={{ marginBottom: 12 }}
              role="region"
              aria-label="Team-informasjon"
            >
              <strong className="pa-a23__alert-title">
                Bare deg i teamet
              </strong>
              Inviter en coach eller ekstern trener for å dele stallen.
            </div>
          )}
          <Tabell
            caption="Team og tilgang"
            columns={teamKolonner}
            rows={team}
            tomTekst="Ingen medarbeidere registrert."
          />
        </div>
      )}

      {/* Fane 3: Inviter coach */}
      {aktivFane === "inviter" && (
        <div className="pa-a23__card" data-testid="ag23-fane-inviter">
          <Kort>
            <KortHode tittel="Inviter coach" />
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "var(--text-secondary)",
                lineHeight: 1.45,
              }}
            >
              Coach får tilgang til stall, plan og kø for gruppene sine.
            </p>

            <Felt label="E-post" error={invitasjonFeil || undefined}>
              <TekstFelt
                type="email"
                value={invitasjon.email}
                onChange={(e) => {
                  setInvitasjon({ ...invitasjon, email: e.target.value });
                  setInvitasjonFeil(null);
                }}
                placeholder="coach@demo.no"
                aria-label="Inviter coach e-post"
              />
            </Felt>

            <Felt label="Rolle">
              <ValgFelt
                value={invitasjon.role}
                onChange={(e) =>
                  setInvitasjon({ ...invitasjon, role: e.target.value })
                }
                options={["Assist Coach", "Coach"]}
                aria-label="Velg coach-rolle"
              />
            </Felt>

            <div>
              <Knapp icon={Send} onClick={() => handleInvite(false)}>
                Lag invitasjon
              </Knapp>
            </div>
          </Kort>
        </div>
      )}

      {/* Fane 4: Ekstern trener */}
      {aktivFane === "ekstern" && (
        <div className="pa-a23__card" data-testid="ag23-fane-ekstern">
          <Kort>
            <KortHode tittel="Ekstern trener" />
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "var(--text-secondary)",
                lineHeight: 1.45,
              }}
            >
              Ekstern trener får lesetilgang til spillere du velger. Ingen
              tilgang til økonomi eller meldinger.
            </p>

            <Felt label="E-post" error={invitasjonFeil || undefined}>
              <TekstFelt
                type="email"
                value={invitasjon.email}
                onChange={(e) => {
                  setInvitasjon({ ...invitasjon, email: e.target.value });
                  setInvitasjonFeil(null);
                }}
                placeholder="trener@klubb.no"
                aria-label="Ekstern trener e-post"
              />
            </Felt>

            <Felt label="Rolle">
              <ValgFelt
                value="Ekstern trener"
                disabled
                options={["Ekstern trener"]}
                aria-label="Rolle for ekstern trener"
              />
            </Felt>

            <Felt label="Spillere">
              <ValgFelt
                value={invitasjon.spillere}
                onChange={(e) =>
                  setInvitasjon({ ...invitasjon, spillere: e.target.value })
                }
                options={[
                  "Tobias Lindvik",
                  "Magnus Aasheim",
                  "Hele WANG Toppidrett",
                ]}
                aria-label="Velg spillere for lesetilgang"
              />
            </Felt>

            <div>
              <Knapp icon={Send} onClick={() => handleInvite(true)}>
                Lag invitasjon
              </Knapp>
            </div>
          </Kort>
        </div>
      )}

      {/* Fane 5: Varsler */}
      {aktivFane === "varsler" && (
        <div className="pa-a23__card" data-testid="ag23-fane-varsler">
          <Kort>
            <KortHode tittel="Varselinnstillinger" />
            <div className="pa-a23__switches">
              <Bryter
                checked={varsler.ko}
                onChange={(e) =>
                  setVarsler({ ...varsler, ko: e.target.checked })
                }
                label="Nye saker i Kø"
              />
              <Bryter
                checked={varsler.innboks}
                onChange={(e) =>
                  setVarsler({ ...varsler, innboks: e.target.checked })
                }
                label="Ubesvarte meldinger over 24 t"
              />
              <Bryter
                checked={varsler.acwr}
                onChange={(e) =>
                  setVarsler({ ...varsler, acwr: e.target.checked })
                }
                label="ACWR over 1,5"
              />
              <Bryter
                checked={varsler.uke}
                onChange={(e) =>
                  setVarsler({ ...varsler, uke: e.target.checked })
                }
                label="Ukesdigest lørdag 06:00"
              />
            </div>
          </Kort>
        </div>
      )}

      {/* Fane 6: Integrasjoner */}
      {aktivFane === "integr" && (
        <div className="pa-a23__card" data-testid="ag23-fane-integr">
          <Kort>
            <KortHode tittel="Integrasjoner" />
            <Nokkelverdi
              items={[
                ["TrackMan", "Koblet · Studio 1 og 2", "SIST HENTET 26.09 14:00"],
                ["GolfBox", "Koblet", "NATTLIG 03:00"],
                ["Tripletex", "Koblet · les", "EKSPORT 25.09 23:00"],
                ["Notion", "Koblet", "HVERT 15. MIN"],
                ["Data Golf", "Koblet · bare Anders", undefined],
              ]}
            />
          </Kort>
        </div>
      )}

      {/* Fane 7: Markedsføring */}
      {aktivFane === "mark" && (
        <div className="pa-a23__card" data-testid="ag23-fane-mark">
          <Kort>
            <KortHode tittel="Markedsføring · forside" aside="AKGOLF.NO" />

            <Felt label="Overskrift">
              <TekstFelt
                value={marked.headline}
                onChange={(e) =>
                  setMarked({ ...marked, headline: e.target.value })
                }
                aria-label="Forside overskrift"
              />
            </Felt>

            <Nokkelverdi
              items={[
                ["Hovedknapp", "Book time", "FAST · STYRES IKKE HER"],
              ]}
            />

            <Bryter
              checked={marked.show}
              onChange={(e) =>
                setMarked({ ...marked, show: e.target.checked })
              }
              label="Vis medlemskap TALENT og FULL"
            />

            <div className="pa-a23__alert">
              Ingen sitater, stjerner eller vitnesbyrd på markedssidene.
            </div>

            <div>
              <Knapp
                icon={Check}
                onClick={() =>
                  setStatusMelding(
                    "Endringen er klar som utkast · PUBLISER FRA FORHÅNDSVISNINGEN"
                  )
                }
              >
                Lagre utkast
              </Knapp>
            </div>
          </Kort>
        </div>
      )}

      {/* Fane 8: Virksomhet */}
      {aktivFane === "virks" && (
        <div className="pa-a23__card" data-testid="ag23-fane-virks">
          <Kort>
            <KortHode tittel="Virksomhetsinformasjon" />
            <Nokkelverdi
              items={[
                ["Navn", "AK Golf Academy", undefined],
                ["Org.nr.", "000 000 000", "DEMODATA"],
                [
                  "Virksomheter",
                  "Mulligan · Academy · Software · WANG · GFGK",
                  undefined,
                ],
                ["Tidssone", "Europe/Oslo", undefined],
              ]}
            />
          </Kort>
        </div>
      )}
    </div>
  );
}
