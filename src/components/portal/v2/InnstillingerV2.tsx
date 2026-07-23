"use client";

/**
 * PlayerHQ Innstillinger — v2 Presis + B-pakke (status først, lys fast, én vei).
 * Ekte data fra requirePortalUser + getAbonnementData. Kun T.* / v2.
 */

import { useEffect, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import type { UserPreferences } from "@/lib/preferences";
import { oppdaterPreferences } from "@/app/portal/meg/actions";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  StatusPill,
  Icon,
  CTAPill,
} from "@/components/v2";

/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type InnstillingerData = {
  epost: string;
  /** Full notif-preferanse (alle felt) — 3 av dem vises som brytere. */
  notif: UserPreferences["notif"];
  /** B39/Venner opt-in: vis mine fullførte økter i venners aktivitetsfeed. */
  venneOktSynlig: boolean;
  samtykke: {
    /** Kontoen krever foreldresamtykke (mindreårig). Styrer om raden vises. */
    kreves: boolean;
    /** Ferdigformatert nb-NO-dato, eller null om ikke godkjent ennå. */
    godkjentDato: string | null;
    /** Navn på forelder som godkjente, eller null. */
    godkjentAv: string | null;
  };
  abonnement: {
    /** Har gratis app-tilgang (pakke / prøveperiode / gruppe). */
    gratis: boolean;
    /** Coaching-pakkens navn hvis gratis via pakke, ellers null. */
    pakkeNavn: string | null;
    /** Betaler 299 kr/mnd (PRO uten coaching-pakke). */
    betaler: boolean;
    /** Ferdigformatert dato for neste trekk (kun betalende), ellers null. */
    nesteTrekk: string | null;
  };
};

/* ── Lokale byggeklosser (1:1 fra mockupen — kun T.* + v2-komponenter) ─ */

/** Kompakt av/på-bryter (mockupens Toggle). aktiv = lime, jf. design-regel 2. */
function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      style={{
        appearance: "none",
        cursor: "pointer",
        padding: 0,
        width: 37,
        height: 22,
        borderRadius: 9999,
        flex: "none",
        position: "relative",
        display: "inline-block",
        background: on ? T.lime : T.panel3,
        border: `1px solid ${on ? "transparent" : T.borderS}`,
        transition: "background 160ms",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2.5,
          left: on ? 17.5 : 2.5,
          width: 16,
          height: 16,
          borderRadius: 9999,
          background: on ? T.onLime : T.mut,
          transition: "left 160ms",
        }}
      />
    </button>
  );
}

/** Rundt ikon-emblem foran en rad (mockupens SeksjonIkon). */
function SeksjonIkon({ name, farge }: { name: string; farge?: string }) {
  return (
    <span
      style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        background: T.panel3,
        border: `1px solid ${T.border}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
      }}
    >
      <Icon name={name} size={14} style={{ color: farge || T.fg2 }} />
    </span>
  );
}

/** Gruppert rad-liste med caps-etikett (mockupens Seksjon). */
function Seksjon({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Caps size={9} style={{ margin: "0 4px 8px" }}>{label}</Caps>
      <Kort pad="4px 20px 6px">{children}</Kort>
    </div>
  );
}

/** «?»-hjelpen for abonnement — HVEM får gratis (kanon: gratis eller 299). */
function AboHjelp() {
  return (
    <div style={{ padding: "12px 14px", borderRadius: 12, background: T.panel2, border: `1px solid ${T.border}`, margin: "2px 0 12px" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Icon name="info" size={13} style={{ color: T.lime, flex: "none", marginTop: 2 }} />
        <div style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.6 }}>
          <strong style={{ color: T.fg, fontWeight: 600 }}>Hvem får PlayerHQ gratis?</strong>
          <div style={{ marginTop: 5 }}>· Ny bruker — 1 måned prøveperiode</div>
          <div>· Coaching-pakke hos AK Golf (Performance eller Performance Pro)</div>
          <div>· Gruppetrening via AK Golf</div>
          <div style={{ marginTop: 5, color: T.mut }}>Alle andre: 299 kr/mnd. Ingen nivåer — alle har hele appen.</div>
        </div>
      </div>
    </div>
  );
}

/* ── Hjelpere ──────────────────────────────────────────────────────── */

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

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function InnstillingerV2({ data }: { data: InnstillingerData }) {
  const mobile = useMobile();
  const { epost, samtykke, abonnement } = data;

  // Varsel-brytere — optimistisk lokal state, lagres ved klikk (full notif-merge).
  const [notif, setNotif] = useState<UserPreferences["notif"]>(data.notif);
  const [, startLagre] = useTransition();
  function veksle(nokkel: keyof UserPreferences["notif"]) {
    const neste = { ...notif, [nokkel]: !notif[nokkel] };
    setNotif(neste);
    startLagre(() => {
      void oppdaterPreferences({ notif: neste });
    });
  }

  // Venner-synlighet (B39) — eget, ikke-nestet felt, alltid opt-in.
  const [venneOktSynlig, setVenneOktSynlig] = useState(data.venneOktSynlig);
  function vekslVenneSynlig() {
    const neste = !venneOktSynlig;
    setVenneOktSynlig(neste);
    startLagre(() => {
      void oppdaterPreferences({ venneOktSynlig: neste });
    });
  }

  const konto = (
    <Seksjon label="Konto">
      <Link href="/portal/meg/profil" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad leading={<SeksjonIkon name="mail" />} title="E-post" sub={epost} />
      </Link>
      <Link href="/auth/forgot-password" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad last leading={<SeksjonIkon name="lock" />} title="Passord" sub="Trykk for å endre passordet ditt" />
      </Link>
    </Seksjon>
  );

  const preferanser = (
    <Seksjon label="Preferanser">
      <Link href="/portal/meg/innstillinger/anlegg" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad leading={<SeksjonIkon name="map-pin" />} title="Mitt treningsanlegg" sub="Utstyr og fasiliteter du har tilgang til" />
      </Link>
      <Link href="/portal/meg/innstillinger/integrasjoner" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad leading={<SeksjonIkon name="link-2" />} title="Integrasjoner" sub="TrackMan, Google Kalender og flere" />
      </Link>
      <Link href="/portal/meg/innstillinger/sprak" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad last leading={<SeksjonIkon name="globe" />} title="Språk og region" sub="Velg hvilket språk appen vises på" />
      </Link>
    </Seksjon>
  );

  const varsler = (
    <Seksjon label="Varsler">
      <Rad
        leading={<SeksjonIkon name="bell" />}
        title="Økt-påminnelse"
        sub="Kvelden før planlagt økt"
        trailing={<Toggle on={notif.paaminnelse} onToggle={() => veksle("paaminnelse")} label="Økt-påminnelse" />}
      />
      <Rad
        leading={<SeksjonIkon name="user" />}
        title="Melding fra coach"
        sub="Når coachen din sender deg noe"
        trailing={<Toggle on={notif.nyMeldingFraCoach} onToggle={() => veksle("nyMeldingFraCoach")} label="Melding fra coach" />}
      />
      <Rad
        leading={<SeksjonIkon name="calendar" />}
        title="Plan publisert"
        sub="Når en ny ukeplan er klar"
        trailing={<Toggle on={notif.treningsplanOppdatert} onToggle={() => veksle("treningsplanOppdatert")} label="Plan publisert" />}
      />
      <Rad
        last
        leading={<SeksjonIkon name="activity" />}
        title="Vis mine økter for venner"
        sub="Venner ser KUN at du har trent — aldri plan, fagkoder eller coach-notater"
        trailing={<Toggle on={venneOktSynlig} onToggle={vekslVenneSynlig} label="Vis mine økter for venner" />}
      />
    </Seksjon>
  );

  const samtykkeSub = samtykke.godkjentDato
    ? `${samtykke.godkjentAv ? `Godkjent av ${samtykke.godkjentAv}` : "Godkjent"} · ${samtykke.godkjentDato}`
    : "Venter på godkjenning fra en forelder";

  const personvern = (
    <Seksjon label="Personvern">
      {samtykke.kreves && (
        <Rad
          leading={<SeksjonIkon name="shield" />}
          title="Foreldresamtykke"
          sub={samtykkeSub}
          meta={
            samtykke.godkjentDato
              ? <StatusPill tone="up">Godkjent</StatusPill>
              : <StatusPill tone="warn">Venter</StatusPill>
          }
        />
      )}
      <Link href="/portal/meg/innstillinger/personvern" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad last leading={<SeksjonIkon name="download" />} title="Last ned dataene mine" sub="Alt vi har lagret om deg, som én fil" />
      </Link>
    </Seksjon>
  );

  // Abonnement — kanon: gratis (pakke/prøve/gruppe) ELLER 299 kr/mnd.
  const aboSub = abonnement.gratis
    ? abonnement.pakkeNavn
      ? `Gratis — inkludert i coaching-pakken din (${abonnement.pakkeNavn})`
      : "Gratis — hele PlayerHQ, uten kostnad"
    : abonnement.nesteTrekk
      ? `299 kr/mnd — fornyes ${abonnement.nesteTrekk}`
      : "299 kr/mnd";
  const abo = (
    <div>
      <Caps size={9} style={{ margin: "0 4px 8px" }}>Abonnement</Caps>
      <Kort tint pad="4px 20px 14px">
        <Link href="/portal/meg/abonnement" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <Rad
            leading={<SeksjonIkon name="sparkles" farge={T.lime} />}
            title="PlayerHQ-tilgang"
            sub={aboSub}
            meta={<StatusPill tone={abonnement.gratis ? "lime" : "up"}>{abonnement.gratis ? "Gratis" : "Aktiv"}</StatusPill>}
          />
        </Link>
        <AboHjelp />
      </Kort>
    </div>
  );

  const utseende = (
    <Seksjon label="Utseende">
      <Rad
        last
        leading={<SeksjonIkon name="sun" />}
        title="Tema"
        sub="PlayerHQ er alltid lyst — enklere å lese ute og innendørs"
        trailing={
          <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.fg2, background: T.panel3, border: `1px solid ${T.borderS}`, borderRadius: 9999, padding: "5px 11px", whiteSpace: "nowrap" }}>
            Lys (fast)
          </span>
        }
      />
    </Seksjon>
  );

  const farlig = (
    <div>
      <Caps size={9} color={T.down} style={{ margin: "0 4px 8px" }}>Farlig sone</Caps>
      <Kort pad="4px 20px 6px" style={{ borderColor: `color-mix(in srgb, ${T.down} 30%, transparent)` }}>
        <Link href="/portal/meg/innstillinger/personvern" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <Rad
            last
            leading={
              <span style={{ width: 32, height: 32, borderRadius: 10, background: `color-mix(in srgb, ${T.down} 12%, transparent)`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <Icon name="trash-2" size={14} style={{ color: T.down }} />
              </span>
            }
            title={<span style={{ color: T.down }}>Slett kontoen min</span>}
            sub="Alt slettes for godt etter 30 dager. Coachen din varsles."
          />
        </Link>
      </Kort>
    </div>
  );

  const aboStatusLabel = abonnement.gratis ? "Gratis" : "Pro";
  const aboStatusSub = abonnement.gratis
    ? abonnement.pakkeNavn ?? "Hele appen uten kostnad"
    : abonnement.nesteTrekk
      ? `Neste trekk ${abonnement.nesteTrekk}`
      : "299 kr/mnd";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Tittel mobile={mobile}>Innstillinger</Tittel>

      {/* B: status først */}
      <div className="grid grid-cols-2" style={{ gap: 8 }}>
        <Kort pad="12px">
          <Caps size={9}>Tilgang</Caps>
          <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 16, marginTop: 8, color: T.fg }}>{aboStatusLabel}</div>
          <div style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, marginTop: 4, lineHeight: 1.4 }}>{aboStatusSub}</div>
        </Kort>
        <Kort pad="12px">
          <Caps size={9}>Konto</Caps>
          <div style={{ fontFamily: T.ui, fontWeight: 600, fontSize: 13, marginTop: 8, color: T.fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{epost}</div>
          <div style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, marginTop: 4 }}>E-post og passord under</div>
        </Kort>
      </div>

      <Link href="/portal/meg" style={{ textDecoration: "none", display: "block" }}>
        <CTAPill icon="arrow-left" full>
          Tilbake til Meg
        </CTAPill>
      </Link>

      {mobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {konto}{preferanser}{varsler}{personvern}{abo}{utseende}{farlig}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 16px", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>{konto}{preferanser}{varsler}{personvern}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>{abo}{utseende}{farlig}</div>
        </div>
      )}
    </div>
  );
}
