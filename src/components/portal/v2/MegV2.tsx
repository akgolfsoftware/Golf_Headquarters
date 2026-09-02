"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * PlayerHQ Meg.
 * Fasit: designsystem/train-lock/PH-17 Meg.dc.html
 * Lys: designsystem/train-lock/B3 Lys nøkkelskjermer.dc.html (Lys PH-17
 * Meg) — mekanisk (PX-7, 29.08.2026): filen leser konsekvent TL.* uten
 * hardkodet hex, verifisert med grep — ingen manuell lys-finpuss utover det.
 * Sentrert hero (avatar 84 + navn 26/700 + mute sub), deretter alt personlig
 * som rader/kort. Ekte data: profil, mål, sesongtall.
 *
 * Steg 7 PR4 (Paper-port, designsystem/paper/fase1/playerhq-meg.html): lagt
 * til «Om deg» (identitet), «Coach og program» og et abonnements-sammendrag
 * som egne kort, pluss varsel-brytere direkte på skjermen — samme rytme som
 * fasiten, men bygget på de v2-primitivene appen allerede har (Rad/Bryter),
 * ikke Papers egen CSS. Personvern/GDPR og Stripe-styring er bevisst IKKE
 * lagt inn her: de ekte flytene (coach-godkjent sletting, Stripe-portal) bor
 * i /portal/meg/innstillinger/personvern og /portal/meg/abonnement og er
 * allerede reelle — å bygge en ny, forenklet variant av dem inline her ville
 * dupliserte tested logikk uten sikkerhetsnett.
 */

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PlayerProgram } from "@/generated/prisma/client";
import type { GoalItem } from "@/app/portal/actions";
import type { UserPreferences } from "@/lib/preferences";
import { logout } from "@/lib/auth/logout";
import { oppdaterPreferences, settEgetLydSamtykke } from "@/app/portal/meg/actions";
import { uploadAvatar } from "@/lib/storage/avatar";
import { skalerAvatar } from "@/lib/klient/skaler-avatar";
import { useCountUp } from "@/lib/v2/hooks";
import { fmtSg, Caps, Kort, StatusPill, Rad, Bryter, ProgresjonsBar, AvatarFoto, TomTilstand, Icon, HjelpTips, type StatusTone } from "@/components/v2";
import { PaperPage, PaperKropp } from "./SideChrome";

/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type MegData = {
  navn: string;
  avatarUrl: string | null;
  hcp: number | null;
  homeClub: string | null;
  goals: GoalItem[];
  /** Sesongen i tall — brutto score, avledet av alle Round-rader. */
  sesong: {
    runder: number;
    besteRunde: number | null;
    snittScore: number | null;
    sgSnitt: number | null;
  };
  /** «Om deg» — ekte felt på User, kun de som faktisk er fylt ut vises. */
  identitet: {
    school: string | null;
    schoolYear: string | null;
    playingYears: number | null;
    ambition: string | null;
    prevSeasonAvgScore: number | null;
    dateOfBirth: Date | null;
    fasiliteter: string[];
  };
  /** Nyeste aktive PlayerEnrollment med en ekte coach (null for PLATFORM_ONLY / ingen). */
  program: { coachNavn: string; program: PlayerProgram; enrolledAt: Date } | null;
  abo: {
    erPro: boolean;
    /** Pakkenavn (credits) — vinner over ren Pro, samme utledning som abonnement-siden. */
    planNavn: "Performance" | "Performance Pro" | null;
    status: string | null;
    nesteTrekk: Date | null;
  };
  notif: UserPreferences["notif"];
  /** Lydsamtykke (A4) — Én ting nå når ikke GITT. */
  lydSamtykke: {
    tillatt: boolean;
    status: string;
    gittAt: Date | null;
  };
  /** FEATURES.TALENT på + en faktisk TalentTracking-rad — uten begge deler
   *  vises ingen inngang til talentprofilen (aldri en lenke til en tom side). */
  visTalent: boolean;
};

const PROGRAM_LABEL: Record<PlayerProgram, string> = {
  WANG_TOPPIDRETT: "WANG Toppidrett Fredrikstad",
  WANG_UNG: "WANG Ung Fredrikstad",
  GFGK_MINI: "GFGK — Mini",
  GFGK_BREDDE: "GFGK — Bredde/Utvikling",
  GFGK_JENTER: "GFGK — Jenter",
  GFGK_ELITE: "GFGK — Elite",
  AK_ACADEMY: "AK Golf Academy",
  AK_ACADEMY_JUNIOR: "AK Golf Academy Junior",
  PLATFORM_ONLY: "Selvbetjent",
};

const ABO_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Aktiv",
  PAST_DUE: "Betaling feilet",
  CANCELLED: "Avsluttet",
  TRIALING: "Prøveperiode",
};

function formatDato(d: Date | null): string | null {
  if (!d) return null;
  return new Date(d).toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}

/* ── Rene hjelpere (norsk bokmål) ──────────────────────────────────── */

function hcpTekst(hcp: number | null): string {
  if (hcp == null) return "–";
  return hcp.toLocaleString("nb-NO", { maximumFractionDigits: 1 });
}

function snittTekst(v: number | null): string {
  if (v == null) return "–";
  return v.toLocaleString("nb-NO", { maximumFractionDigits: 1 });
}

/** Nedtellings-/status-pill for det primære (nærmeste) målet. */
function maalPill(g: GoalItem): { l: string; tone: StatusTone } | null {
  if (g.status === "ACHIEVED") return { l: "Oppnådd", tone: "up" };
  if (g.daysLeft == null) return null;
  if (g.daysLeft < 0) return { l: "Forfalt", tone: "warn" };
  return { l: `${g.daysLeft} dager igjen`, tone: "lime" };
}

/** «Sesongen i tall»-verdi med tell-opp (0 → mål ved mount), reduced-motion-trygg
 *  via useCountUp. Egen komponent fordi hooket ikke kan kalles inne i .map(). */
function SesongTallVerdi({ value }: { value: string }) {
  const shown = useCountUp(value);
  return (
    <span
      style={{
        fontFamily: TL.font.mono,
        fontSize: 26,
        fontWeight: 700,
        color: TL.text,
        display: "block",
        marginTop: 8,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {shown}
    </span>
  );
}

/** Inline varsel-brytere — de 3 nærmest fasitens («ny plan», «påminnelse»,
 *  «tilbakemelding fra coach»). Resten (kanaler, ukesrapport, turnering,
 *  språk) bor fortsatt bak «Flere valg» — samme lagringsflyt (oppdaterPreferences)
 *  som InnstillingerVarslerV2, ikke en egen kopi av den logikken. */
function VarslerMini({ notif }: { notif: UserPreferences["notif"] }) {
  const router = useRouter();
  const [verdier, setVerdier] = useState(notif);
  const [, startLagring] = useTransition();

  function sett(felt: keyof UserPreferences["notif"], v: boolean) {
    setVerdier((prev) => ({ ...prev, [felt]: v }));
    startLagring(async () => {
      await oppdaterPreferences({ notif: { ...verdier, [felt]: v } });
      router.refresh();
    });
  }

  return (
    <Kort eyebrow="Varsler">
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Bryter
          label="Ny plan fra Anders"
          sub="Når uka er publisert"
          checked={verdier.treningsplanOppdatert}
          onChange={(v) => sett("treningsplanOppdatert", v)}
        />
        <Bryter
          label="Påminnelse før økt"
          sub="Push i forkant"
          checked={verdier.paaminnelse}
          onChange={(v) => sett("paaminnelse", v)}
        />
        <Bryter
          label="Melding fra coach"
          sub="Tilbakemelding og beskjeder"
          checked={verdier.nyMeldingFraCoach}
          onChange={(v) => sett("nyMeldingFraCoach", v)}
        />
      </div>
      <Link
        href="/portal/meg/innstillinger/varsler"
        style={{
          display: "block",
          marginTop: 10,
          fontFamily: TL.font.sans,
          fontSize: 12,
          fontWeight: 600,
          color: TL.mute,
          textDecoration: "none",
        }}
      >
        Flere varslingsvalg →
      </Link>
    </Kort>
  );
}

/* ── Konto-rader (ekte adresser) ───────────────────────────────────── */

type KontoRad = { ic: string; l: string; sub?: string; href: string };

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function MegV2({ data }: { data: MegData }) {
  const router = useRouter();
  const { navn, hcp, homeClub, goals, sesong, identitet, program, abo, notif, lydSamtykke, visTalent } = data;

  // Avatar direkte klikkbar her (Anders-krav: bytt bilde skal ikke kreve
  // omvei via Profil og innstillinger) — samme uploadAvatar-action og
  // pending/feil-mønster som MinProfilV2.tsx.
  const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl);
  const [avatarLagrer, startAvatarLagring] = useTransition();
  const [avatarFeil, setAvatarFeil] = useState<string | null>(null);
  const filInputRef = useRef<HTMLInputElement>(null);
  const [lydPending, startLyd] = useTransition();
  const [lydFeil, setLydFeil] = useState<string | null>(null);
  const [lydGittLokalt, setLydGittLokalt] = useState(lydSamtykke.tillatt);

  function velgBilde(e: React.ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0];
    if (!fil) return;
    setAvatarFeil(null);
    
    startAvatarLagring(async () => {
      try {
        // Nedskaler på klienten (manglet her i #99-fiksen — Meg-skjermen var
        // eneste opplastingssted uten, sett i prod 19. juli kl. 16:00).
        const formData = new FormData();
        formData.append("file", await skalerAvatar(fil));
        const res = await uploadAvatar(formData);
        if (!res.ok) throw new Error(res.error);
        setAvatarUrl(res.url);
        router.refresh();
      } catch (err) {
        setAvatarFeil(err instanceof Error ? err.message : "Opplasting feilet.");
      } finally {
        if (filInputRef.current) filInputRef.current.value = "";
      }
    });
  }

  // PH-17-sub: «HCP 4,2 · AK Golf Academy · Onsøy GK» — kun ekte felt.
  const metaDeler: string[] = [];
  if (hcp != null) metaDeler.push(`HCP ${hcpTekst(hcp)}`);
  if (program) metaDeler.push(PROGRAM_LABEL[program.program]);
  if (homeClub) metaDeler.push(homeClub);

  const primaer = goals[0] ?? null;
  const pill = primaer ? maalPill(primaer) : null;

  // Sesongen i tall — kun genuint sporbare Round-felter (brutto score).
  const tall: { l: string; v: string }[] = [
    { l: "Runder", v: String(sesong.runder) },
    { l: "Beste runde", v: sesong.besteRunde != null ? String(sesong.besteRunde) : "–" },
    { l: "Snittscore", v: snittTekst(sesong.snittScore) },
    { l: "SG total", v: sesong.sgSnitt != null ? fmtSg(sesong.sgSnitt) : "–" },
  ];

  const konto: KontoRad[] = [
    { ic: "user", l: "Profil og innstillinger", sub: "Navn, HCP, klubb", href: "/portal/meg/profil" },
    { ic: "heart-pulse", l: "Helse", sub: "Søvn, hvilepuls, skadelogg", href: "/portal/meg/helse" },
    { ic: "briefcase", l: "Utstyr", sub: "Køller, ball, bag, lengder", href: "/portal/meg/utstyr" },
    { ic: "users", l: "Foresatte", sub: "Registrerte foreldre/verger", href: "/portal/meg/foreldre" },
    { ic: "activity", l: "Venner", sub: "Legg til venner, se at de har trent", href: "/portal/venner" },
    { ic: "settings", l: "Innstillinger", sub: "Varsler, personvern, anlegg, språk", href: "/portal/meg/innstillinger" },
    { ic: "shield", l: "Personvern og samtykke", sub: lydGittLokalt ? "Lydsamtykke gitt" : "Lydsamtykke mangler", href: "/portal/meg/innstillinger/personvern" },
  ];

  // «Om deg» — kun rader med ekte verdi. Skjul hele kortet hvis alt mangler.
  const fodt = formatDato(identitet.dateOfBirth);
  const skole = identitet.school
    ? identitet.school + (identitet.schoolYear ? ` · ${identitet.schoolYear}` : "")
    : null;
  const identitetsrader: { l: string; v: string }[] = [
    ...(fodt ? [{ l: "Født", v: fodt }] : []),
    ...(skole ? [{ l: "Skole", v: skole }] : []),
    ...(identitet.playingYears != null ? [{ l: "År med golf", v: String(identitet.playingYears) }] : []),
    ...(identitet.prevSeasonAvgScore != null
      ? [{ l: "Snittscore forrige sesong", v: String(identitet.prevSeasonAvgScore) }]
      : []),
    ...(identitet.ambition ? [{ l: "Ambisjon", v: identitet.ambition }] : []),
    ...(identitet.fasiliteter.length > 0 ? [{ l: "Treningssted", v: identitet.fasiliteter.join(" · ") }] : []),
  ];

  const programStart = program ? formatDato(program.enrolledAt) : null;
  const aboPlan = abo.planNavn ?? (abo.erPro ? "PlayerHQ Pro" : "PlayerHQ Gratis");
  const aboStatus = abo.status ? ABO_STATUS_LABEL[abo.status] ?? abo.status : null;
  const aboNesteTrekk = formatDato(abo.nesteTrekk);

  return (
    <PaperPage odId="playerhq-meg">
      <div data-paper-portal-meg data-paper-slug="playerhq-meg" style={{ display: "contents" }}>
      <PaperKropp>
      {/* PH-17-hero: sentrert avatar 84 + navn 26/700 + mute sub */}
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <label
          htmlFor="meg-avatar-input"
          aria-label="Bytt profilbilde"
          style={{
            position: "relative",
            display: "inline-flex",
            cursor: avatarLagrer ? "default" : "pointer",
            flex: "none",
          }}
        >
          <AvatarFoto src={avatarUrl} navn={navn} size={84} ring />
          <span
            aria-hidden
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: 24,
              height: 24,
              borderRadius: 9999,
              background: TL.dim,
              border: `1.5px solid ${TL.elev}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name={avatarLagrer ? "loader" : "camera"} size={12} style={{ color: TL.mute }} />
          </span>
        </label>
        <input
          ref={filInputRef}
          id="meg-avatar-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={velgBilde}
          disabled={avatarLagrer}
          style={{ display: "none" }}
        />
        <div style={{ textAlign: "center" }}>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>
            {navn}
          </h1>
          {metaDeler.length > 0 && (
            <div
              style={{
                marginTop: 5,
                fontFamily: TL.font.sans,
                fontSize: 13,
                fontWeight: 400,
                color: TL.mute,
                fontVariantNumeric: "tabular-nums",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {metaDeler.join(" · ")}
              {hcp != null && <HjelpTips k="hcp" size={11} />}
            </div>
          )}
        </div>
      </div>
      {avatarFeil && (
        <Caps style={{ color: TL.danger }}>{avatarFeil}</Caps>
      )}
      {!lydGittLokalt && (
        <div
          style={{
            /* Paper .varselblokk — lys clay-flate med clay-strek langs venstre kant.
               Kortet er «Én ting nå», ikke et vanlig panel. */
            border: `1px solid ${TL.hair}`,
            borderLeft: `3px solid ${TL.fill}`,
            borderRadius: TL.radius.card,
            background: TL.dim,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ fontFamily: TL.font.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>
            Én ting nå
          </div>
          <h2 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 16, fontWeight: 600, color: TL.text }}>
            Lydsamtykke mangler
          </h2>
          <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute, lineHeight: 1.55, maxWidth: "52ch" }}>
            Uten lydsamtykke kan Anders ikke dele videoanalyse med lyd med deg.
            Gi samtykke her hvis du er over 16 år — ellers må foresatt gjøre det via trener.
          </p>
          <button
            type="button"
            disabled={lydPending}
            onClick={() => {
              setLydFeil(null);
              startLyd(async () => {
                const res = await settEgetLydSamtykke();
                if (!res.ok) {
                  setLydFeil(res.feil);
                  return;
                }
                setLydGittLokalt(true);
                router.refresh();
              });
            }}
            className="v2-press v2-focus"
            data-od-id="meg-en-ting-na-lyd" data-paper-en-ting="true"
            style={{
              marginTop: 4,
              minHeight: 56,
              width: "100%",
              borderRadius: 12,
              border: "none",
              background: TL.fill,
              color: TL.onFill,
              fontFamily: TL.font.sans,
              fontSize: 14,
              fontWeight: 600,
              cursor: lydPending ? "default" : "pointer",
              opacity: lydPending ? 0.7 : 1,
            }}
          >
            {lydPending ? "Lagrer …" : "Gi lydsamtykke"}
          </button>
          {lydFeil && (
            <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12.5, color: TL.danger }} role="alert">
              {lydFeil}
            </p>
          )}
        </div>
      )}

      {/* Om deg — kun ekte, utfylte felt */}
      {identitetsrader.length > 0 && (
        <Kort eyebrow="Om deg">
          {identitetsrader.map((r, i) => (
            <Rad key={r.l} title={r.l} trailing={<span style={{ fontFamily: TL.font.mono, fontSize: 13 }}>{r.v}</span>} last={i === identitetsrader.length - 1} />
          ))}
        </Kort>
      )}

      {/* Coach og program — kun for spillere med en aktiv coach-tilknytning */}
      {program && (
        <Kort eyebrow="Coach og program">
          <Rad title="Coach" trailing={<span style={{ fontFamily: TL.font.mono, fontSize: 13 }}>{program.coachNavn}</span>} />
          <Rad title="Program" trailing={<span style={{ fontFamily: TL.font.mono, fontSize: 13 }}>{PROGRAM_LABEL[program.program]}</span>} />
          {programStart && (
            <Rad title="Startet" trailing={<span style={{ fontFamily: TL.font.mono, fontSize: 13 }}>{programStart}</span>} last />
          )}
        </Kort>
      )}

      {/* B: form/status først — kompakte sesongtall */}
      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 8 }}>
        {tall.map((t) => (
          <Kort key={t.l} pad="12px">
            <Caps size={9}>{t.l}</Caps>
            <div style={{ marginTop: 4 }}>
              <SesongTallVerdi value={t.v} />
            </div>
          </Kort>
        ))}
      </div>

      {/* Primær mål + én grønn vei */}
      {/* Ingen `tint`: Paper er matt, og clay-gradienten her leste som om
          sesongmålet var en varsling. Signering 12.08. */}
      <Kort eyebrow="Sesongmål" action={pill ? <StatusPill tone={pill.tone}>{pill.l}</StatusPill> : undefined}>
        {primaer ? (
          <>
            <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 18, color: TL.text, lineHeight: 1.25 }}>
              {primaer.title}
            </div>
            <div style={{ marginTop: 12 }}>
              <ProgresjonsBar variant="bar" value={primaer.progress} max={100} label="" showValue />
            </div>
          </>
        ) : (
          <TomTilstand icon="target" title="Ingen mål satt" sub="Sett mål via Workbench / plan." />
        )}
      </Kort>

      <Link
        href="/portal"
        className="v2-press v2-focus"
        data-od-id="meg-til-hjem"
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 48,
          borderRadius: TL.radius.card,
          border: `1px solid ${TL.hair}`,
          background: TL.elev,
          color: TL.text,
          fontFamily: TL.font.sans,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Til hjem · se hva du skal gjøre
      </Link>
      <Link
        href="/portal/booking"
        style={{
          textDecoration: "none",
          display: "block",
          textAlign: "center",
          fontFamily: TL.font.sans,
          fontSize: 12,
          fontWeight: 600,
          color: TL.mute,
          padding: "2px 0 4px",
        }}
      >
        Book coachtime →
      </Link>

      {goals.length > 1 && (
        <Kort eyebrow="Flere mål">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {goals.slice(1).map((g) => (
              <ProgresjonsBar key={g.id} variant="bar" value={g.progress} max={100} label={g.title} />
            ))}
          </div>
        </Kort>
      )}

      <VarslerMini notif={notif} />

      <Kort eyebrow="Abonnement">
        <Rad title="Plan" trailing={<span style={{ fontFamily: TL.font.mono, fontSize: 13 }}>{aboPlan}</span>} />
        {aboStatus && <Rad title="Status" trailing={<span style={{ fontFamily: TL.font.mono, fontSize: 13 }}>{aboStatus}</span>} />}
        {aboNesteTrekk && <Rad title="Neste trekk" trailing={<span style={{ fontFamily: TL.font.mono, fontSize: 13 }}>{aboNesteTrekk}</span>} />}
        <Link href="/portal/meg/abonnement" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <Rad
            leading={<Icon name="credit-card" size={16} style={{ color: TL.mute }} />}
            title="Fakturaer og betalingsmåte"
            sub="Oppgrader, endre kort eller avbestill"
            last
          />
        </Link>
      </Kort>

      <Kort
        eyebrow={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Utviklingsplan
            <HjelpTips k="pPosisjon" size={11} />
          </span>
        }
      >
        <Link href="/portal/utviklingsplan" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <Rad
            leading={<Icon name="trending-up" size={16} style={{ color: TL.mute }} />}
            title="Åpne utviklingsplan"
            sub="Talent og teknisk plan"
            last={!visTalent}
          />
        </Link>
        {visTalent && (
          <Link href="/portal/talent" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
            <Rad
              leading={<Icon name="trophy" size={16} style={{ color: TL.mute }} />}
              title="Talentprofil"
              sub="Nivå, reise og sammenligning"
              last
            />
          </Link>
        )}
      </Kort>

      <Kort eyebrow="Uka di">
        <Link href="/portal/ukesdigest" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <Rad
            leading={<Icon name="calendar" size={16} style={{ color: TL.mute }} />}
            title="Se ukesdigesten"
            sub="Samme tall som Anders' ukesrapport"
            last
          />
        </Link>
      </Kort>

      {/* Konto — sekundær liste */}
      <Kort eyebrow="Konto">
        {konto.map((k, i) => (
          <Link key={`${k.l}-${i}`} href={k.href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
            <Rad
              leading={<Icon name={k.ic} size={16} style={{ color: TL.mute }} />}
              title={k.l}
              sub={k.sub}
            />
          </Link>
        ))}
        <form action={logout}>
          <button
            type="submit"
            style={{
              all: "unset",
              boxSizing: "border-box",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "11px 0",
            }}
          >
            <Icon name="log-out" size={16} style={{ color: TL.danger }} />
            <span style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.danger }}>
              Logg ut
            </span>
          </button>
        </form>
      </Kort>
      </PaperKropp>
      </div>
    </PaperPage>
  );
}
