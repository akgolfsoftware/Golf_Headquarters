"use client";

/**
 * Foreldreportal · Innstillinger — v2 Presis + B-pakke (status + én grønn CTA).
 * Varsel-brytere fortsatt lese-status (ikke lagret ennå). Kun v2 + T.*.
 */

import { useRouter } from "next/navigation";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  StatusPill,
  TomTilstand,
  AvatarInit,
  Icon,
  Knapp,
} from "@/components/v2";

/* ── Datakontrakt (avledet av requirePortalUser + hentBarnForForelder) ── */

export interface ForelderInnstillingerBarn {
  id: string;
  navn: string;
  relasjon: string;
}

export interface ForelderInnstillingerData {
  navn: string;
  epost: string;
  telefon: string | null;
  avatarUrl: string | null;
  barn: ForelderInnstillingerBarn[];
}

/* Varseltyper en forelder mottar (per e-post inntil app-varsler kobles på).
   Kopiert 1:1 fra den ekte skjermen — statisk konfig, ikke fabrikerte data. */
const VARSEL_TYPER: { tittel: string; beskrivelse: string }[] = [
  { tittel: "Ukerapport", beskrivelse: "Sammendrag av treningsuken hver fredag" },
  { tittel: "Booking", beskrivelse: "Når en time bookes, endres eller avlyses" },
  { tittel: "Faktura", beskrivelse: "Nye fakturaer og forfalte betalinger" },
  { tittel: "Samtykke", beskrivelse: "Når en godkjenning fra deg trengs" },
];

/* ── Liten mono-tekstlenke for kort-hoder («Rediger» / «Se alle») ──────── */
function KortLenke({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="v2-press v2-focus"
      style={{
        appearance: "none",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontFamily: T.mono,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: T.lime,
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────────── */

export function ForelderInnstillingerV2({ data }: { data: ForelderInnstillingerData }) {
  const router = useRouter();
  const gaaTil = (href: string) => () => router.push(href);

  const { navn, epost, telefon, barn } = data;

  const kontakt: { icon: string; label: string; verdi: string; mangler?: boolean }[] = [
    { icon: "user", label: "Navn", verdi: navn },
    { icon: "mail", label: "E-post", verdi: epost },
    telefon
      ? { icon: "phone", label: "Telefon", verdi: telefon }
      : { icon: "phone", label: "Telefon", verdi: "Ikke registrert", mangler: true },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode + status */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Caps>Innstillinger</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="varsler">Konto og</Tittel>
          </div>
          <span
            style={{
              fontFamily: T.ui,
              fontSize: 12.5,
              color: T.mut,
              display: "block",
              marginTop: 8,
            }}
          >
            Kontaktinfo, varsler og sikkerhet.
          </span>
        </div>
        <StatusPill tone={barn.length > 0 ? "up" : "warn"}>
          {barn.length > 0
            ? barn.length === 1
              ? "1 barn"
              : `${barn.length} barn`
            : "Ingen barn"}
        </StatusPill>
      </div>

      {/* Én primær CTA (B) */}
      <div>
        <Knapp icon="user" onClick={gaaTil("/portal/meg")}>
          Rediger profil
        </Knapp>
      </div>

      {/* Kontaktinfo — ekte data fra Prisma */}
      <Kort
        eyebrow="Kontaktinformasjon"
        action={<KortLenke onClick={gaaTil("/portal/meg")}>Rediger</KortLenke>}
      >
        <div>
          {kontakt.map((k, i) => (
            <Rad
              key={k.label}
              leading={<Icon name={k.icon} size={16} style={{ color: T.fg2 }} />}
              title={
                <span style={{ color: k.mangler ? T.mut : T.fg }}>{k.verdi}</span>
              }
              sub={k.label}
              trailing={null}
              last={i === kontakt.length - 1}
            />
          ))}
        </div>
      </Kort>

      {/* Koblede barn — samtykke-kontekst */}
      <Kort
        eyebrow="Koblede barn"
        action={<KortLenke onClick={gaaTil("/forelder/barn")}>Se alle</KortLenke>}
      >
        {barn.length === 0 ? (
          <TomTilstand
            icon="users"
            title="Ingen barn koblet ennå"
            sub="Be spilleren sende en invitasjon fra sin profil."
          />
        ) : (
          <div>
            {barn.map((b, i) => (
              <Rad
                key={b.id}
                leading={<AvatarInit navn={b.navn} size={34} />}
                title={b.navn}
                sub={b.relasjon}
                trailing={<StatusPill tone="up">Koblet</StatusPill>}
                last={i === barn.length - 1}
              />
            ))}
          </div>
        )}
      </Kort>

      {/* Varsler — typer du mottar (brytere kobles på senere, vist som lese-status) */}
      <Kort eyebrow="Varsler" action={<StatusPill tone="info">På e-post</StatusPill>}>
        <div>
          {VARSEL_TYPER.map((v, i) => (
            <Rad
              key={v.tittel}
              title={v.tittel}
              sub={v.beskrivelse}
              trailing={
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: T.up,
                    flex: "none",
                  }}
                >
                  På
                </span>
              }
              last={i === VARSEL_TYPER.length - 1}
            />
          ))}
        </div>
        <p
          style={{
            fontFamily: T.ui,
            fontSize: 12,
            color: T.mut,
            lineHeight: 1.6,
            margin: "14px 0 0",
            paddingTop: 14,
            borderTop: `1px solid ${T.border}`,
          }}
        >
          Varslene sendes til e-posten din. Individuelle varselbrytere og
          push-varsler kommer i en senere versjon.
        </p>
      </Kort>

      {/* Konto */}
      <Kort eyebrow="Konto">
        <div>
          <Rad
            leading={<Icon name="lock" size={16} style={{ color: T.fg2 }} />}
            title="Endre passord"
            sub="Via Supabase Auth"
            onClick={gaaTil("/portal/meg/innstillinger/sikkerhet")}
          />
          <Rad
            leading={<Icon name="shield-check" size={16} style={{ color: T.fg2 }} />}
            title="To-faktor-autentisering"
            sub="Ikke aktivert"
            onClick={gaaTil("/portal/meg/innstillinger/sikkerhet")}
          />
          <Rad
            leading={<Icon name="log-out" size={16} style={{ color: T.down }} />}
            title={<span style={{ color: T.down }}>Logg ut</span>}
            onClick={gaaTil("/auth/login")}
            trailing={<Icon name="chevron-right" size={14} style={{ color: T.down }} />}
            last
          />
        </div>
      </Kort>
    </div>
  );
}
