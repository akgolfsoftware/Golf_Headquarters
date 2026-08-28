"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * Foreldreportal · Barn-lista — Paper-port (W5).
 * Fasit: designsystem/paper/fase2/forelder/forelder-barn.html, data-vis="flere"
 * (listen over flere koblede barn — demoens faste «Emil Berg»-topptekst i
 * .topp hører til barn-DETALJ-siden og er derfor bevisst ikke kopiert hit;
 * lista bruker en generisk «Mine barn»-topptekst siden ingen enkeltbarn er
 * valgt ennå. Personvernlinjen fra fasiten står uendret).
 *
 * Trykkbare kort per barn. Kun v2 + T.*. Enklere foreldre-språk.
 * Samtykke leses fra User.guardianConsentGivenAt (ekte GuardianConsent-felt)
 * — barn uten bekreftet samtykke vises som egen «uten samtykke»-rad i stedet
 * for stall-tallene (aldri fabrikkert).
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { bekreftSkoletidAction } from "@/app/forelder/barn/skoletid-actions";
import type { PyramidArea } from "@/generated/prisma/client";
import { Caps, Tittel, Kort, Pyramide, TomTilstand, AvatarFoto, Icon, StatusPill, Knapp, HjelpTips } from "@/components/v2";
/* ── Datakontrakt (1:1 med page.tsx-loaderen) ──────────────────────── */

export type ForelderBarnRad = {
  id: string;
  navn: string;
  avatarUrl: string | null;
  relationship: string;
  hcp: number | null;
  /** Fra dateOfBirth — kun vist når fødselsdato er kjent. */
  alder: number | null;
  /** Ekte GuardianConsent-felt (User.guardianConsentGivenAt != null). */
  samtykkeGitt: boolean;
  /** Fullførte økter siste 30 dager. */
  okter30d: number;
  /** Pyramide-fordeling (apex→base: TURN øverst, FYS fundament), verdi = antall økter. */
  pyramide: { akse: PyramidArea; value: number }[];
  /** Neste planlagte/aktive økt, eller null. */
  nesteOkt: { scheduledAt: Date; title: string } | null;
  /** Utestående betaling (PENDING/FAILED). */
  utestaaende: { antall: number; ore: number };
  /** D6 · skoletid for inneværende semester. Null = flaten er ikke koblet. */
  skoletid?: SkoletidVisning | null;
};

/** D6 · det komponenten trenger om skoletid — datoene er alt formatert. */
export type SkoletidVisning = {
  semesterVisning: string;
  /** «20.12» — til «gjelder til …» etter bekreftelse. */
  semesterSlutt: string;
  status: { bekreftet: boolean; tekst: string; bekreftetAt?: Date };
  blokker: { dager: string; fra: string; til: string }[];
};

export type ForelderBarnData = { barn: ForelderBarnRad[] };

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

const NB_DATO = new Intl.DateTimeFormat("nb-NO", {
  weekday: "short",
  day: "2-digit",
  month: "short",
});

function ore(n: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(n / 100);
}

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/* ── Nøkkeltall-celle (inline layout-lim, som BarnProgresjonKort.tall) ── */

function Stat({
  ikon,
  label,
  value,
  alert,
}: {
  ikon: string;
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div
      style={{
        background: TL.dock,
        border: `1px solid ${TL.hair}`,
        borderRadius: TL.radius.row,
        padding: "10px 12px",
        minWidth: 0,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontFamily: TL.font.mono,
          fontSize: 8.5,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: TL.mute,
        }}
      >
        <Icon name={ikon} size={11} style={{ color: TL.mute }} />
        {label}
      </span>
      <span
        style={{
          display: "block",
          marginTop: 6,
          fontFamily: TL.font.mono,
          fontSize: 13.5,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          color: alert ? TL.danger : TL.text,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ── Personvernlinje (fasit — hva forelder ser, aldri redigert) ──────── */

function Personvernlinje() {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "12px 14px",
        background: TL.dock,
        borderRadius: TL.radius.card,
        fontFamily: TL.font.sans,
        fontSize: 12.5,
        color: TL.mute,
        lineHeight: 1.5,
      }}
    >
      <Icon name="shield-check" size={14} style={{ color: TL.mute, flex: "none", marginTop: 1 }} />
      <span>Du ser oppmøte, plan og økonomi. Barnas egne notater, meldinger til coachen og velværelogg vises ikke her.</span>
    </div>
  );
}

/* ── Uten samtykke — egen rad i stedet for stall-tall ─────────────────── */

function UtenSamtykkeKort({ b }: { b: ForelderBarnRad }) {
  return (
    <Kort tint pad="16px 18px">
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <AvatarFoto src={b.avatarUrl} navn={b.navn} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 700, color: TL.text }}>
            {b.navn}
          </span>
          <span style={{ display: "block", marginTop: 2, fontFamily: TL.font.sans, fontSize: 12, color: TL.mute }}>
            Vi mangler samtykket ditt — kontoen åpnes ikke før det er bekreftet.
          </span>
        </div>
        <Link href="/forelder/samtykke" style={{ textDecoration: "none" }}>
          <Knapp icon="shield-check">Gi samtykke</Knapp>
        </Link>
      </div>
    </Kort>
  );
}

/* ── Ett barn-kort ─────────────────────────────────────────────────── */

function BarnKort({
  b,
  mobile,
  onOpen,
}: {
  b: ForelderBarnRad;
  mobile: boolean;
  onOpen: () => void;
}) {
  const fornavn = b.navn.split(" ")[0];
  const etternavn = b.navn.split(" ").slice(1).join(" ");
  const okter = b.okter30d;
  const utest = b.utestaaende;

  return (
    <Kort tint hover pad="0" style={{ overflow: "hidden" }}>
      {/* Hode — trykkbart (åpner barnets profil). Stor mobil-tapflate. */}
      <button
        type="button"
        onClick={onOpen}
        className="v2-press v2-focus"
        style={{
          appearance: "none",
          background: "transparent",
          border: "none",
          textAlign: "left",
          cursor: "pointer",
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: mobile ? "16px 16px" : "18px 20px",
        }}
        aria-label={`Åpne profilen til ${b.navn}`}
      >
        <AvatarFoto src={b.avatarUrl} navn={b.navn} size={52} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              display: "block",
              fontFamily: TL.font.mono,
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: TL.mute,
            }}
          >
            {b.relationship}
            {b.alder != null ? ` · ${b.alder} år` : ""} · HCP{" "}
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {b.hcp != null ? b.hcp.toFixed(1) : "—"}
            </span>
          </span>
          <span
            style={{
              display: "block",
              marginTop: 3,
              fontFamily: TL.font.sans,
              fontSize: 19,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: TL.text,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span style={{ color: TL.fill }}>{fornavn}</span>
            {etternavn ? ` ${etternavn}` : ""}
          </span>
        </span>
        <Icon name="chevron-right" size={18} style={{ color: TL.mute, flex: "none" }} />
      </button>

      {/* Treningsfordeling (siste 30 dager) */}
      <div style={{ borderTop: `1px solid ${TL.hair}`, padding: mobile ? "14px 16px" : "14px 20px" }}>
        <Caps size={9} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="layers" size={12} style={{ color: TL.mute }} />
          Hva det er trent på · 30 dager
          <HjelpTips k="pyramideAkse" size={11} />
        </Caps>
        <div style={{ marginTop: 12 }}>
          {okter > 0 ? (
            <Pyramide data={b.pyramide} max={Math.max(1, okter)} showValues />
          ) : (
            <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, margin: 0 }}>
              Ingen fullførte økter ennå — trykk for å se profilen.
            </p>
          )}
        </div>
      </div>

      {/* Nøkkeltall — økter · neste · utestående */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          borderTop: `1px solid ${TL.hair}`,
          padding: mobile ? "14px 16px" : "14px 20px",
        }}
      >
        <Stat ikon="trending-up" label="Økter" value={String(okter)} />
        <Stat
          ikon="calendar"
          label="Neste"
          value={b.nesteOkt ? NB_DATO.format(b.nesteOkt.scheduledAt) : "—"}
        />
        <Stat
          ikon="credit-card"
          label="Utestående"
          value={utest.antall > 0 ? ore(utest.ore) : "0 kr"}
          alert={utest.antall > 0}
        />
      </div>

      {b.skoletid && (
        <SkoletidKort barnId={b.id} fornavn={b.navn.split(" ")[0]} data={b.skoletid} mobile={mobile} />
      )}
    </Kort>
  );
}

/**
 * D6 · skoletidsbekreftelse.
 * Fasit: designsystem/paper/fase2/forelder/forelder-barn.html
 *
 * Én bekreftelse per semester, logget med dato. Ubekreftet semester vises som
 * «skoletid mangler» hos coachen — forrige semesters tider brukes aldri.
 * Bekreftet timeplan er bakteppe det varsles mot, ikke en sperre (invariant 1).
 */
function SkoletidKort({
  barnId,
  fornavn,
  data,
  mobile,
}: {
  barnId: string;
  fornavn: string;
  data: SkoletidVisning;
  mobile: boolean;
}) {
  const [status, setStatus] = useState(data.status);
  const [sender, setSender] = useState(false);

  return (
    <div
      style={{
        borderTop: `1px solid ${TL.hair}`,
        padding: mobile ? "14px 16px" : "14px 20px",
      }}
    >
      <h3
        style={{
          margin: 0,
          fontFamily: TL.font.sans,
          fontSize: 14,
          fontWeight: 600,
          color: TL.text,
        }}
      >
        Skoletid · {data.semesterVisning}
      </h3>
      <p
        style={{
          margin: "6px 0 0",
          fontFamily: TL.font.sans,
          fontSize: 12.5,
          color: TL.mute,
          lineHeight: 1.55,
        }}
      >
        Coachen planlegger rundt skoletiden. {fornavn} sin skole deler ikke timeplanen
        automatisk — derfor bekrefter du den her én gang per semester. Ubekreftet semester
        vises som «skoletid mangler» hos coachen; vi bruker aldri forrige semesters tider.
      </p>

      <div style={{ marginTop: 10 }}>
        {data.blokker.length > 0 ? (
          data.blokker.map((blokk) => (
            <Linje key={blokk.dager} navn={blokk.dager} verdi={`${blokk.fra}–${blokk.til}`} />
          ))
        ) : (
          <Linje navn="Timeplan" verdi="ingen tider lagt inn ennå" />
        )}
        <Linje navn="Status" verdi={status.tekst} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <button
          type="button"
          className="v2-press v2-focus"
          disabled={sender || status.bekreftet}
          onClick={async () => {
            setSender(true);
            try {
              const res = await bekreftSkoletidAction(barnId);
              if (res.ok) {
                toast.success(res.melding);
                setStatus({
                  bekreftet: true,
                  bekreftetAt: new Date(),
                  tekst: `bekreftet i dag · gjelder til ${data.semesterSlutt}`,
                });
              } else {
                toast.error(res.melding);
              }
            } catch {
              toast.error("Kunne ikke bekrefte. Prøv igjen.");
            } finally {
              setSender(false);
            }
          }}
          style={{
            padding: "9px 16px",
            borderRadius: TL.radius.field,
            border: "none",
            background: status.bekreftet ? TL.dim : TL.text,
            color: status.bekreftet ? TL.mute : TL.scene,
            fontFamily: TL.font.sans,
            fontSize: 12.5,
            fontWeight: 600,
            cursor: status.bekreftet ? "default" : sender ? "wait" : "pointer",
          }}
        >
          {status.bekreftet ? "Bekreftet" : sender ? "Bekrefter …" : "Bekreft timeplanen"}
        </button>
        <Link
          href="/forelder/innstillinger"
          className="v2-press v2-focus"
          style={{
            padding: "9px 16px",
            borderRadius: TL.radius.field,
            border: `1px solid ${TL.hair}`,
            background: TL.elev,
            color: TL.text,
            fontFamily: TL.font.sans,
            fontSize: 12.5,
            textDecoration: "none",
          }}
        >
          Endre tidene
        </Link>
      </div>

      <p
        style={{
          margin: "12px 0 0",
          fontFamily: TL.font.sans,
          fontSize: 12,
          color: TL.mute,
          lineHeight: 1.55,
        }}
      >
        Bekreftet timeplan tegnes som bakteppe i coachens planlegging — økter i skoletid
        varsles, de sperres ikke.
      </p>
    </div>
  );
}

/** Navn til venstre, verdi til høyre — fasitens `.linje`. */
function Linje({ navn, verdi }: { navn: string; verdi: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "5px 0",
        fontFamily: TL.font.sans,
        fontSize: 12.5,
        color: TL.text,
      }}
    >
      <span style={{ flex: "none" }}>{navn}</span>
      <span style={{ color: TL.mute, textAlign: "right", minWidth: 0 }}>{verdi}</span>
    </div>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function ForelderBarnV2({ data }: { data: ForelderBarnData }) {
  const mobile = useMobile();
  const router = useRouter();
  const { barn } = data;

  const forste = barn[0];

  return (
    <div
      data-paper-slug="forelder-barn"
      data-paper-wave-e="forelder-sub"
      data-paper-portal-forelder-barn
      style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}
    >
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
          <Caps>Foreldreportal · Barn</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="barn">
              Mine
            </Tittel>
          </div>
          <span
            style={{
              display: "block",
              marginTop: 8,
              fontFamily: TL.font.sans,
              fontSize: 12.5,
              color: TL.mute,
            }}
          >
            {barn.length > 0
              ? "Trykk på et kort for å se treningen."
              : "Her dukker barna opp når de er koblet."}
          </span>
        </div>
        {barn.length > 0 && (
          <StatusPill tone="up">
            {barn.length === 1 ? "1 barn" : `${barn.length} barn`}
          </StatusPill>
        )}
      </div>

      {barn.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="users"
            title="Ingen barn er koblet ennå"
            sub="Be spilleren sende en invitasjon fra sin profil, eller spør coachen."
          />
        </Kort>
      ) : (
        <>
          <Personvernlinje />

          {forste && (
            <div>
              <Knapp
                icon="arrow-right"
                full={mobile}
                onClick={() => router.push(`/forelder/barn/${forste.id}`)}
              >
                Åpne {forste.navn.split(" ")[0]}
              </Knapp>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {barn.map((b) =>
              b.samtykkeGitt ? (
                <BarnKort
                  key={b.id}
                  b={b}
                  mobile={mobile}
                  onOpen={() => router.push(`/forelder/barn/${b.id}`)}
                />
              ) : (
                <UtenSamtykkeKort key={b.id} b={b} />
              ),
            )}
          </div>
        </>
      )}
    </div>
  );
}
