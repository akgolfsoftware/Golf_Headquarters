"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ Innstillinger — v2 Presis + B-pakke (status først, lys fast, én vei).
 * Ekte data fra requirePortalUser + getAbonnementData. Kun T.* / v2.
 */

import { useEffect, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import type { UserPreferences } from "@/lib/preferences";
import { oppdaterPreferences } from "@/app/portal/meg/actions";
import { Caps, Kort, Rad, StatusPill, Icon } from "@/components/v2";
import { InnstillingerHode } from "@/components/portal/v2/InnstillingerHode";
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
        background: on ? TL.fill : TL.dim,
        border: `1px solid ${on ? "transparent" : TL.hair}`,
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
          background: on ? TL.onFill : TL.mute,
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
        background: TL.dim,
        border: `1px solid ${TL.hair}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
      }}
    >
      <Icon name={name} size={14} style={{ color: farge || TL.mute }} />
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

  // Abonnement — kanon: gratis (pakke/prøve/gruppe) ELLER 299 kr/mnd.
  const aboSub = abonnement.gratis
    ? abonnement.pakkeNavn
      ? `Gratis — inkludert i coaching-pakken din (${abonnement.pakkeNavn})`
      : "Gratis — hele PlayerHQ, uten kostnad"
    : abonnement.nesteTrekk
      ? `299 kr/mnd — fornyes ${abonnement.nesteTrekk}`
      : "299 kr/mnd";

  const samtykkeSub = samtykke.godkjentDato
    ? `${samtykke.godkjentAv ? `Godkjent av ${samtykke.godkjentAv}` : "Godkjent"} · ${samtykke.godkjentDato}`
    : "Venter på godkjenning fra en forelder";

  // «Kontoen din» — e-post (lenke til redigering, ingen fabrikkert inline-
  // endringsflyt), abonnement (ekte data) og passord/pålogging. Ingen 2FA-
  // felt finnes på User ennå (se InnstillingerSikkerhetV2-kommentar), så
  // raden holder seg til det vi faktisk vet — avvik fra fasitens «Tofaktor
  // er på · sist endret 12.03».
  const kontoenDin = (
    <Seksjon label="Kontoen din">
      <div style={{ padding: "2px 0 12px" }}>
        <div style={{ fontFamily: TL.font.sans, fontSize: 12, fontWeight: 600, color: TL.mute, marginBottom: 4 }}>E-post</div>
        <div style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text }}>{epost}</div>
        <p style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, margin: "6px 0 0", lineHeight: 1.5 }}>
          E-posten er innloggingen din. Vil du endre den, gjør du det fra profilen din.
        </p>
      </div>
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
      <Link href="/portal/meg/abonnement" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad leading={<SeksjonIkon name="sparkles" farge={TL.fill} />} title="Abonnement" sub={aboSub} />
      </Link>
      <Link href="/portal/meg/profil" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad leading={<SeksjonIkon name="mail" />} title="Rediger profil" sub="Endre e-post, navn og bilde" />
      </Link>
      <Link href="/portal/meg/innstillinger/sikkerhet" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad last leading={<SeksjonIkon name="lock" />} title="Passord og tofaktor" sub="Endre passord, se pålogginger" />
      </Link>
    </Seksjon>
  );

  // «Varsler» — kun de tre varseltypene fasiten viser på hub-nivå (full
  // liste med alle notif-felt bor på .../innstillinger/varsler).
  const varsler = (
    <Seksjon label="Varsler">
      <Rad
        leading={<SeksjonIkon name="bell" />}
        title="Økt-påminnelse"
        sub="Få påminnelse rett før en planlagt økt starter"
        trailing={<Toggle on={notif.paaminnelse} onToggle={() => veksle("paaminnelse")} label="Økt-påminnelse" />}
      />
      <Rad
        leading={<SeksjonIkon name="user" />}
        title="Melding fra coach"
        sub="Varsles når coachen din sender deg en melding"
        trailing={<Toggle on={notif.nyMeldingFraCoach} onToggle={() => veksle("nyMeldingFraCoach")} label="Melding fra coach" />}
      />
      <Rad
        last
        leading={<SeksjonIkon name="calendar" />}
        title="Ukesoppsummering"
        sub="Oppsummering av uken — trening, mål og fremgang"
        trailing={<Toggle on={notif.ukentligRapport} onToggle={() => veksle("ukentligRapport")} label="Ukesoppsummering" />}
      />
    </Seksjon>
  );

  // «Synlighet» — kun venneOktSynlig har et reelt boolsk felt på User i dag.
  // Fasitens «Helse-loggen»-bryter finnes ikke her: helsesamtykke er en
  // append-only GDPR art. 9-flyt (HelseSamtykke-modellen), ikke en enkel
  // av/på-bryter — den håndteres i .../innstillinger/personvern.
  const synlighet = (
    <Seksjon label="Synlighet">
      <Rad
        last
        leading={<SeksjonIkon name="activity" />}
        title="La venner se øktene mine"
        sub="Venner ser at du har trent, ikke tallene dine"
        trailing={<Toggle on={venneOktSynlig} onToggle={vekslVenneSynlig} label="La venner se øktene mine" />}
      />
    </Seksjon>
  );

  const mer = (
    <Seksjon label="Mer">
      <Link href="/portal/meg/innstillinger/anlegg" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad leading={<SeksjonIkon name="map-pin" />} title="Anlegg" sub="Utstyr og fasiliteter du har tilgang til" />
      </Link>
      <Link href="/portal/meg/innstillinger/ai-coach" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad leading={<SeksjonIkon name="sparkles" />} title="AI-coach" sub="Tone og hvor mye den skal foreslå" />
      </Link>
      <Link href="/portal/meg/innstillinger/integrasjoner" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad leading={<SeksjonIkon name="link-2" />} title="Integrasjoner" sub="TrackMan, Google Kalender og flere" />
      </Link>
      <Link href="/portal/meg/innstillinger/personvern" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad leading={<SeksjonIkon name="download" />} title="Personvern og data" sub="Samtykker, eksport og sletting" />
      </Link>
      <Link href="/portal/meg/innstillinger/sprak" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Rad last leading={<SeksjonIkon name="globe" />} title="Språk" sub="Norsk bokmål" />
      </Link>
    </Seksjon>
  );

  const info = (
    <div style={{ display: "flex", gap: 10, padding: "12px 16px", borderRadius: 12, background: TL.dock, border: `1px solid ${TL.hair}` }}>
      <Icon name="info" size={14} style={{ color: TL.mute, flex: "none", marginTop: 2 }} />
      <span style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, lineHeight: 1.5 }}>
        Endringer lagres med én gang. Du får aldri en «Lagre»-knapp du kan gå fra uten å trykke.
      </span>
    </div>
  );

  return (
    <div data-paper-portal-innstillinger data-paper-wave-f="innstillinger-player" data-od-id="playerhq-innstillinger" data-paper-slug="playerhq-innstillinger" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      <InnstillingerHode tittel="Innstillinger" undertekst="Meg · konto, varsler og personvern" tilbakeHref="/portal/meg" />

      {mobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {kontoenDin}{varsler}{synlighet}{mer}{info}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 16px", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>{kontoenDin}{mer}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>{varsler}{synlighet}{info}</div>
        </div>
      )}
    </div>
  );
}
