"use client";

/**
 * PlayerHQ Innstillinger · Varsler — v2 (retning C «Presis»).
 * v2-port 17. juli 2026: erstatter den gamle NotifToggles + PushToggle-
 * presentasjonen. All lagringslogikk er bevart 1:1:
 *  - Varsel-/kanal-brytere: samme oppdaterPreferences({ notif: full merge })
 *    + router.refresh + «Lagret»-flash som notif-toggles.tsx.
 *  - Språk: samme oppdaterPreferences({ spraak }) (nb/en begge valgbare —
 *    som originalen her, ulikt språk-siden som sperrer en).
 *  - Push på denne enheten: samme browser-flyt (detectPushStatus/aktiverPush/
 *    deaktiverPush fra push-toggle.tsx) — kun presentasjonen er ny. Ærlige
 *    tilstander for «ikke støttet» / «blokkert» / manglende VAPID-nøkkel.
 *
 * Kun v2-komponenter fra "@/components/v2" + T.*-tokens. Ingen rå hex.
 * V2Shell eier chrome-en; denne komponenten rendrer bare den indre stacken.
 */

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { UserPreferences } from "@/lib/preferences";
import { oppdaterPreferences } from "@/app/portal/meg/actions";
import { VAPID_PUBLIC_KEY } from "@/lib/push/vapid";
import {
  detectPushStatus,
  aktiverPush,
  deaktiverPush,
  type PushStatus,
} from "@/components/portal/push-toggle";
import {
  T,
  Caps,
  Tittel,
  Kort,
  StatusPill,
  Bryter,
  PillVelger,
  Icon,
} from "@/components/v2";

/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type InnstillingerVarslerData = {
  /** Ekte notif-preferanser fra lesPreferences (alle felt vises som brytere). */
  notif: UserPreferences["notif"];
  /** Valgt app-språk fra samme preferanse-blob. */
  spraak: "nb" | "en";
};

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

/** Bryter-rad med skillelinje (Bryter selv har ingen border). */
function BryterRad({ last, children }: { last?: boolean; children: ReactNode }) {
  return (
    <div style={{ padding: "12px 0", borderBottom: last ? "none" : `1px solid ${T.border}` }}>
      {children}
    </div>
  );
}

/** Nøytral info-/feil-tekstboks for push-tilstandene (ærlig, aldri fabrikert). */
function InfoBoks({ tone = "noytral", children }: { tone?: "noytral" | "warn" | "down"; children: ReactNode }) {
  const c = tone === "warn" ? T.warn : tone === "down" ? T.down : T.mut;
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        padding: "10px 12px",
        borderRadius: 12,
        background: T.panel2,
        border: `1px solid ${tone === "noytral" ? T.border : `color-mix(in srgb, ${c} 30%, transparent)`}`,
      }}
    >
      <Icon name={tone === "noytral" ? "info" : "alert-triangle"} size={13} style={{ color: c, flex: "none", marginTop: 2 }} />
      <span style={{ fontFamily: T.ui, fontSize: 12, color: tone === "noytral" ? T.fg2 : c, lineHeight: 1.55 }}>{children}</span>
    </div>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function InnstillingerVarslerV2({ data }: { data: InnstillingerVarslerData }) {
  const mobile = useMobile();
  const router = useRouter();

  // ── Notif-brytere + språk — samme lagringsflyt som notif-toggles.tsx ──
  const [prefs, setPrefs] = useState<{ notif: UserPreferences["notif"]; spraak: "nb" | "en" }>({
    notif: data.notif,
    spraak: data.spraak,
  });
  const [pending, startTransition] = useTransition();
  const [lagret, setLagret] = useState(false);

  function setNotif(felt: keyof UserPreferences["notif"], value: boolean) {
    const oppdatert = { ...prefs, notif: { ...prefs.notif, [felt]: value } };
    setPrefs(oppdatert);
    startTransition(async () => {
      await oppdaterPreferences({ notif: oppdatert.notif });
      setLagret(true);
      router.refresh();
      setTimeout(() => setLagret(false), 1500);
    });
  }

  function setSpraak(s: "nb" | "en") {
    const oppdatert = { ...prefs, spraak: s };
    setPrefs(oppdatert);
    startTransition(async () => {
      await oppdaterPreferences({ spraak: s });
      setLagret(true);
      router.refresh();
      setTimeout(() => setLagret(false), 1500);
    });
  }

  // ── Push på denne enheten — samme browser-logikk som før (push-toggle.tsx) ──
  const [pushStatus, setPushStatus] = useState<PushStatus>("loading");
  const [pushFeil, setPushFeil] = useState<string | null>(null);
  const [pushPending, startPush] = useTransition();

  useEffect(() => {
    void detectPushStatus().then(setPushStatus);
  }, []);

  function vekslePush() {
    if (pushPending) return;
    setPushFeil(null);
    const skruPaa = pushStatus !== "on";
    startPush(async () => {
      try {
        const neste = skruPaa ? await aktiverPush() : await deaktiverPush();
        setPushStatus(neste);
      } catch (err) {
        setPushFeil(err instanceof Error ? err.message : skruPaa ? "Kunne ikke aktivere" : "Kunne ikke deaktivere");
        if (skruPaa) setPushStatus(await detectPushStatus());
      }
    });
  }

  const pushKropp = (() => {
    if (pushStatus === "loading") {
      return <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>Sjekker push-status …</span>;
    }
    if (pushStatus === "unsupported") {
      return (
        <InfoBoks>
          Push-varsler støttes ikke i denne browseren. Prøv en moderne versjon av Safari, Chrome eller Firefox.
        </InfoBoks>
      );
    }
    if (!VAPID_PUBLIC_KEY) {
      return <InfoBoks>Push-varsler er midlertidig deaktivert. (VAPID-keys ikke konfigurert.)</InfoBoks>;
    }
    if (pushStatus === "blocked") {
      return (
        <InfoBoks tone="warn">
          Du har blokkert varsler for dette nettstedet. Tillat varsler i browser-innstillingene for å aktivere push.
        </InfoBoks>
      );
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Bryter
          checked={pushStatus === "on"}
          onChange={vekslePush}
          label="Push-varsler på denne enheten"
          sub="Få varsler direkte i browser eller på telefonen — selv når portalen er lukket"
        />
        {pushFeil && <InfoBoks tone="down">{pushFeil}</InfoBoks>}
      </div>
    );
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <Tittel mobile={mobile}>Varsler</Tittel>
        {lagret && <StatusPill tone="lime">Lagret</StatusPill>}
      </div>
      <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.6, margin: "-8px 0 0" }}>
        Velg hvilke varsler du vil ha og hvordan de leveres. Endringer lagres automatisk.
      </p>

      {/* Denne enheten (push) */}
      <Kort eyebrow="Denne enheten">{pushKropp}</Kort>

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: T.gap, alignItems: "start" }}>
        {/* Hendelser */}
        <Kort eyebrow="Varsler" action={<Caps size={9}>Hva du varsles om</Caps>}>
          <BryterRad>
            <Bryter
              checked={prefs.notif.nyMeldingFraCoach}
              onChange={(v) => !pending && setNotif("nyMeldingFraCoach", v)}
              label="Nye meldinger fra coach"
              sub="Varsles når coachen din sender deg en melding"
            />
          </BryterRad>
          <BryterRad>
            <Bryter
              checked={prefs.notif.treningsplanOppdatert}
              onChange={(v) => !pending && setNotif("treningsplanOppdatert", v)}
              label="Treningsplan oppdatert"
              sub="Varsles når coachen endrer treningsplanen din"
            />
          </BryterRad>
          <BryterRad>
            <Bryter
              checked={prefs.notif.bookingbekreftelse}
              onChange={(v) => !pending && setNotif("bookingbekreftelse", v)}
              label="Bookingbekreftelse"
              sub="Bekreftelse og påminnelse for bookede tider"
            />
          </BryterRad>
          <BryterRad>
            <Bryter
              checked={prefs.notif.ukentligRapport}
              onChange={(v) => !pending && setNotif("ukentligRapport", v)}
              label="Ukentlig fremdrifts-rapport"
              sub="Oppsummering av uken — trening, mål og fremgang"
            />
          </BryterRad>
          <BryterRad last>
            <Bryter
              checked={prefs.notif.turneringsresultater}
              onChange={(v) => !pending && setNotif("turneringsresultater", v)}
              label="Turneringsresultater"
              sub="Varsles når turneringsresultater er registrert"
            />
          </BryterRad>
        </Kort>

        {/* Kanaler + språk */}
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap, minWidth: 0 }}>
          <Kort eyebrow="Kanaler" action={<Caps size={9}>Hvordan du mottar dem</Caps>}>
            <BryterRad>
              <Bryter
                checked={prefs.notif.epost}
                onChange={(v) => !pending && setNotif("epost", v)}
                label="E-post"
                sub="Sammendrag av planen og påminnelser på e-post"
              />
            </BryterRad>
            <BryterRad>
              <Bryter
                checked={prefs.notif.push}
                onChange={(v) => !pending && setNotif("push", v)}
                label="Push-varsler"
                sub="Sanntidsvarsler i nettleser og mobil"
              />
            </BryterRad>
            <BryterRad last>
              <Bryter
                checked={prefs.notif.paaminnelse}
                onChange={(v) => !pending && setNotif("paaminnelse", v)}
                label="Påminnelse 1 time før økt"
                sub="Få påminnelse rett før en planlagt økt starter"
              />
            </BryterRad>
          </Kort>

          <Kort eyebrow="Språk">
            <PillVelger
              options={[
                { v: "nb", l: "Norsk bokmål" },
                { v: "en", l: "English" },
              ]}
              value={prefs.spraak}
              onChange={(v) => !pending && setSpraak(v as "nb" | "en")}
            />
            <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.55, margin: "10px 0 0" }}>
              Engelsk-støtte kommer i en senere fase.
            </p>
          </Kort>
        </div>
      </div>
    </div>
  );
}
