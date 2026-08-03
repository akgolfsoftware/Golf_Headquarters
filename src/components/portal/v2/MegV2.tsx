"use client";

/**
 * PlayerHQ Meg — v2 Presis + B-pakke (oversikt først, konto-liste etter).
 * Ekte data: profil, mål, sesongtall. Én grønn hovedhandling øverst.
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

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PlayerProgram } from "@/generated/prisma/client";
import type { GoalItem } from "@/app/portal/actions";
import type { UserPreferences } from "@/lib/preferences";
import { logout } from "@/lib/auth/logout";
import { oppdaterPreferences } from "@/app/portal/meg/actions";
import { uploadAvatar } from "@/lib/storage/avatar";
import { skalerAvatar } from "@/lib/klient/skaler-avatar";
import { useCountUp } from "@/lib/v2/hooks";
import {
  T,
  fmtSg,
  Caps,
  Tittel,
  Kort,
  StatusPill,
  Rad,
  Bryter,
  ProgresjonsBar,
  AvatarFoto,
  TomTilstand,
  Icon,
  HjelpTips,
  CTAPill,
  type StatusTone,
} from "@/components/v2";

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

/** «Sesongen i tall»-verdi med tell-opp (0 → mål ved mount), reduced-motion-trygg
 *  via useCountUp. Egen komponent fordi hooket ikke kan kalles inne i .map(). */
function SesongTallVerdi({ value }: { value: string }) {
  const shown = useCountUp(value);
  return (
    <span
      style={{
        fontFamily: T.mono,
        fontSize: 26,
        fontWeight: 700,
        color: T.fg,
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
          fontFamily: T.ui,
          fontSize: 12,
          fontWeight: 600,
          color: T.mut,
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
  const mobile = useMobile();
  const router = useRouter();
  const { navn, hcp, homeClub, goals, sesong, identitet, program, abo, notif } = data;

  // Avatar direkte klikkbar her (Anders-krav: bytt bilde skal ikke kreve
  // omvei via Profil og innstillinger) — samme uploadAvatar-action og
  // pending/feil-mønster som MinProfilV2.tsx.
  const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl);
  const [avatarLagrer, startAvatarLagring] = useTransition();
  const [avatarFeil, setAvatarFeil] = useState<string | null>(null);
  const filInputRef = useRef<HTMLInputElement>(null);

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

  // Meta-linje — ærlig avledet av hcp + klubb (WAGR/kategori finnes ikke i data).
  const metaDeler: string[] = [];
  if (hcp != null) metaDeler.push(`HCP ${hcpTekst(hcp)}`);
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
    { ic: "briefcase", l: "Utstyrsbag", sub: "Køller, ball, bag", href: "/portal/meg/utstyrsbag" },
    { ic: "users", l: "Foresatte", sub: "Registrerte foreldre/verger", href: "/portal/meg/foreldre" },
    { ic: "activity", l: "Venner", sub: "Legg til venner, se at de har trent", href: "/portal/venner" },
    { ic: "settings", l: "Innstillinger", sub: "Varsler, personvern, anlegg, språk", href: "/portal/meg/innstillinger" },
    { ic: "shield", l: "Personvern og samtykke", href: "/portal/meg/innstillinger/personvern" },
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
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode — avatar (direkte klikkbar for å bytte bilde) + navn + meta */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <label
          htmlFor="meg-avatar-input"
          aria-label="Bytt profilbilde"
          style={{ position: "relative", display: "inline-flex", cursor: avatarLagrer ? "default" : "pointer", flex: "none" }}
        >
          <AvatarFoto src={avatarUrl} navn={navn} size={64} ring />
          <span
            aria-hidden
            style={{
              position: "absolute", right: -2, bottom: -2, width: 22, height: 22, borderRadius: 9999,
              background: T.panel3, border: `1.5px solid ${T.bg}`, display: "inline-flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Icon name={avatarLagrer ? "loader" : "camera"} size={11} style={{ color: T.fg2 }} />
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
        <div>
          <Tittel mobile={mobile}>{navn}</Tittel>
          {metaDeler.length > 0 && (
            <Caps style={{ marginTop: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                {metaDeler[0]}
                {hcp != null && <HjelpTips k="hcp" size={11} />}
                {metaDeler.length > 1 && <span>· {metaDeler.slice(1).join(" · ")}</span>}
              </span>
            </Caps>
          )}
          {avatarFeil && <Caps style={{ marginTop: 8, color: T.down }}>{avatarFeil}</Caps>}
        </div>
      </div>

      {/* Om deg — kun ekte, utfylte felt */}
      {identitetsrader.length > 0 && (
        <Kort eyebrow="Om deg">
          {identitetsrader.map((r, i) => (
            <Rad key={r.l} title={r.l} trailing={<span style={{ fontFamily: T.mono, fontSize: 13 }}>{r.v}</span>} last={i === identitetsrader.length - 1} />
          ))}
        </Kort>
      )}

      {/* Coach og program — kun for spillere med en aktiv coach-tilknytning */}
      {program && (
        <Kort eyebrow="Coach og program">
          <Rad title="Coach" trailing={<span style={{ fontFamily: T.mono, fontSize: 13 }}>{program.coachNavn}</span>} />
          <Rad title="Program" trailing={<span style={{ fontFamily: T.mono, fontSize: 13 }}>{PROGRAM_LABEL[program.program]}</span>} />
          {programStart && (
            <Rad title="Startet" trailing={<span style={{ fontFamily: T.mono, fontSize: 13 }}>{programStart}</span>} last />
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
      <Kort tint eyebrow="Sesongmål" action={pill ? <StatusPill tone={pill.tone}>{pill.l}</StatusPill> : undefined}>
        {primaer ? (
          <>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, color: T.fg, lineHeight: 1.25 }}>
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

      <Link href="/portal" style={{ textDecoration: "none", display: "block" }}>
        <CTAPill icon="home" full>
          Til hjem · se hva du skal gjøre
        </CTAPill>
      </Link>
      <Link
        href="/portal/booking"
        style={{
          textDecoration: "none",
          display: "block",
          textAlign: "center",
          fontFamily: T.ui,
          fontSize: 12,
          fontWeight: 600,
          color: T.mut,
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
        <Rad title="Plan" trailing={<span style={{ fontFamily: T.mono, fontSize: 13 }}>{aboPlan}</span>} />
        {aboStatus && <Rad title="Status" trailing={<span style={{ fontFamily: T.mono, fontSize: 13 }}>{aboStatus}</span>} />}
        {aboNesteTrekk && <Rad title="Neste trekk" trailing={<span style={{ fontFamily: T.mono, fontSize: 13 }}>{aboNesteTrekk}</span>} />}
        <Link href="/portal/meg/abonnement" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <Rad
            leading={<Icon name="credit-card" size={16} style={{ color: T.mut }} />}
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
            leading={<Icon name="trending-up" size={16} style={{ color: T.mut }} />}
            title="Åpne utviklingsplan"
            sub="Talent og teknisk plan"
            last
          />
        </Link>
      </Kort>

      {/* Konto — sekundær liste */}
      <Kort eyebrow="Konto">
        {konto.map((k, i) => (
          <Link key={`${k.l}-${i}`} href={k.href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
            <Rad
              leading={<Icon name={k.ic} size={16} style={{ color: T.mut }} />}
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
            <Icon name="log-out" size={16} style={{ color: T.down }} />
            <span style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.down }}>
              Logg ut
            </span>
          </button>
        </form>
      </Kort>
    </div>
  );
}
