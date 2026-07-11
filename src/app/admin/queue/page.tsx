/**
 * AgencyOS Oppfølgingskø — v2 (retning C «Presis»). Coachens kontrolltårn:
 * "Hvem trenger en samtale denne uka?" Rekomponert fra legacy (admin/
 * (legacy)/queue): KPI-strip, aktivitets-stripe, 4-kolonners kanban
 * (Risiko/Watch/Sjekk inn/Løst) med signal-kort per spiller.
 *
 * All klassifiserings-logikk beholdt 1:1 (aktiv plan, inaktivitet,
 * SG-fall). Ekte Prisma. Ærlig tomtilstand per kolonne.
 * NB: "Løst"-kolonnen er fortsatt tom-placeholder inntil en
 * CoachingTask-modell finnes (arvet TODO, ikke min endring).
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, Kort, KpiFlis, StatusPill, MikroMeta, CTAPill, AvatarInit, Icon } from "@/components/v2";

type Status = "risk" | "watch" | "check" | "ok";

type Kort_ = {
  id: string;
  navn: string;
  epost: string;
  signalTekst: string;
  signalIkon: string;
  stats: { k: string; v: string; tone?: "up" | "down" }[];
  tags: { label: string; tone: "down" | "warn" | "up" }[];
  siden: string;
  prioritet: boolean;
};

function dagerSiden(d: Date | null): number | null {
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

const KOLONNE_DOT: Record<Status, string> = { risk: "#F0683E", watch: "#E8B43C", check: "#D1F843", ok: "#5AA9F0" };

export default async function OppfolgingsKoPage() {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const players = await prisma.user.findMany({
    where: { role: "PLAYER" },
    include: {
      trainingPlans: { where: { isActive: true }, select: { id: true } },
      signals: { where: { kind: "SG_TOTAL" }, orderBy: { computedAt: "desc" }, take: 1 },
    },
  });

  const risk: Kort_[] = [];
  const watch: Kort_[] = [];
  const check: Kort_[] = [];

  for (const p of players) {
    const grunner: string[] = [];
    const tags: Kort_["tags"] = [];
    const stats: Kort_["stats"] = [];

    if (p.trainingPlans.length === 0) {
      grunner.push("Ingen aktiv plan");
      tags.push({ label: "uten plan", tone: "down" });
    }
    const dager = dagerSiden(p.lastLoginAt);
    if (!p.lastLoginAt || (dager !== null && dager > 14)) {
      grunner.push(`Ikke aktiv ${dager ?? "∞"}d`);
      tags.push({ label: "stille", tone: "warn" });
    }
    const sg = p.signals[0]?.value;
    if (sg != null) {
      stats.push({ k: "SG · siste", v: `${sg >= 0 ? "+" : ""}${sg.toFixed(1).replace(".", ",")}`, tone: sg < 0 ? "down" : "up" });
    }
    if (sg != null && sg < -0.5) tags.push({ label: "score-fall", tone: "down" });
    if (dager != null) stats.push({ k: "Siste innlogg", v: `${dager}d` });

    if (grunner.length === 0) continue;

    const kort: Kort_ = {
      id: p.id,
      navn: p.name,
      epost: p.email,
      signalTekst: grunner.join(" · "),
      signalIkon: sg != null && sg < -0.5 ? "trending-down" : grunner.length >= 2 ? "alert-triangle" : "clock",
      stats,
      tags,
      siden: p.lastLoginAt ? `flagget ${dagerSiden(p.lastLoginAt) ?? 0} dager siden` : "flagget nylig",
      prioritet: grunner.length >= 3,
    };

    if (grunner.length >= 3) risk.push(kort);
    else if (grunner.length === 2) watch.push(kort);
    else check.push(kort);
  }

  // Løste saker — placeholder inntil en CoachingTask-modell finnes.
  const ok: Kort_[] = [];

  const kolonner: { status: Status; tittel: string; beskrivelse: string; kort: Kort_[] }[] = [
    { status: "risk", tittel: "Risiko", beskrivelse: "Krever en samtale innen 48 timer.", kort: risk },
    { status: "watch", tittel: "Watch", beskrivelse: "Trender feil retning — følg med.", kort: watch },
    { status: "check", tittel: "Sjekk inn", beskrivelse: "Lett oppdatering — kjapp melding holder.", kort: check },
    { status: "ok", tittel: "Løst · siste 7d", beskrivelse: "Tett-tett. Du kan markere «ikke vis» per sak.", kort: ok },
  ];

  const totalAktive = risk.length + watch.length + check.length;

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={coach.name} avatarUrl={coach.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {/* Hode */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <div>
            <Caps>AgencyOS · Oppfølgingskø</Caps>
            <div style={{ marginTop: 10 }}>
              <Tittel em="samtale">Hvem trenger en</Tittel>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0" }}>
              Plattformen flagger — du bestemmer.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/admin/settings" style={{ textDecoration: "none" }}>
              <CTAPill ghost icon="settings">
                Justere regler
              </CTAPill>
            </Link>
            <CTAPill ghost icon="sparkles">
              Generer AI-aksjoner
            </CTAPill>
          </div>
        </div>

        {/* KPI-strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
          <KpiFlis label="Risiko" value={risk.length} delta="krever samtale < 48 t" />
          <KpiFlis label="Watch" value={watch.length} delta="trender feil retning" />
          <KpiFlis label="Sjekk inn" value={check.length} delta="lett oppdatering" />
          <KpiFlis label="Løst · 7d" value={ok.length} delta="markert ferdig" />
        </div>

        {/* Aktivitets-stripe */}
        <Kort pad="12px 18px">
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18 }}>
            <Caps>Aktivitet · 24 t</Caps>
            <MikroMeta icon="check-circle">
              Løst <b style={{ color: T.fg }}>{ok.length}</b> saker
            </MikroMeta>
            <MikroMeta icon="bell">
              Flagget <b style={{ color: T.fg }}>{totalAktive}</b> aktive
            </MikroMeta>
            <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", color: T.mut }}>
              Av {players.length} spillere totalt
            </span>
          </div>
        </Kort>

        {/* Board */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" style={{ gap: T.gap, alignItems: "start" }}>
          {kolonner.map((col) => (
            <div key={col.status} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 9999, background: KOLONNE_DOT[col.status] }} />
                <Caps>{col.tittel}</Caps>
                <span
                  style={{
                    marginLeft: "auto",
                    fontFamily: T.mono,
                    fontSize: 10,
                    fontWeight: 700,
                    color: T.mut,
                    background: T.panel2,
                    borderRadius: 9999,
                    padding: "1px 8px",
                  }}
                >
                  {col.kort.length}
                </span>
              </div>
              <p style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, margin: 0 }}>{col.beskrivelse}</p>

              {col.kort.length === 0 ? (
                <div
                  style={{
                    border: `1px dashed ${T.border}`,
                    borderRadius: T.rRow,
                    padding: "28px 12px",
                    textAlign: "center",
                    fontFamily: T.ui,
                    fontSize: 12,
                    color: T.mut,
                  }}
                >
                  Ingen saker her.
                </div>
              ) : (
                col.kort.map((k) => (
                  <Kort key={k.id} pad="12px 14px" tint={k.prioritet}>
                    <Link href={`/admin/spillere/${k.id}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                      <AvatarInit navn={k.navn} size={34} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontFamily: T.disp, fontSize: 13.5, fontWeight: 700, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {k.navn}
                        </div>
                        <div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {k.epost}
                        </div>
                      </div>
                    </Link>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: 6, background: T.panel2, borderRadius: 8, padding: "8px 10px", marginTop: 10 }}>
                      <Icon name={k.signalIkon} size={13} style={{ color: T.mut, marginTop: 1, flexShrink: 0 }} />
                      <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.fg, lineHeight: 1.4 }}>{k.signalTekst}</span>
                    </div>

                    {k.stats.length > 0 && (
                      <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                        {k.stats.map((s, i) => (
                          <div key={i}>
                            <Caps size={8.5}>{s.k}</Caps>
                            <div style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, marginTop: 3, color: s.tone === "down" ? T.down : s.tone === "up" ? T.up : T.fg }}>
                              {s.v}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {k.tags.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
                        {k.tags.map((t, i) => (
                          <StatusPill key={i} tone={t.tone}>
                            {t.label}
                          </StatusPill>
                        ))}
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                      <span style={{ fontFamily: T.mono, fontSize: 9, textTransform: "uppercase", color: T.mut }}>{k.siden}</span>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Link href="/admin/innboks" aria-label="Send melding" title="Send melding" style={{ display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 7, border: `1px solid ${T.border}` }}>
                          <Icon name="message-square" size={13} style={{ color: T.mut }} />
                        </Link>
                        <Link href={`/admin/spillere/${k.id}`} aria-label="Ring / kontakt" title="Ring / kontakt" style={{ display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 7, border: `1px solid ${T.border}` }}>
                          <Icon name="phone" size={13} style={{ color: T.mut }} />
                        </Link>
                        <Link href="/admin/bookinger/ny" aria-label="Book økt" title="Book økt" style={{ display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 7, border: `1px solid ${T.border}` }}>
                          <Icon name="calendar-plus" size={13} style={{ color: T.mut }} />
                        </Link>
                      </div>
                    </div>
                  </Kort>
                ))
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
          <span style={{ fontFamily: T.mono, fontSize: 10.5, textTransform: "uppercase", color: T.mut }}>AgencyOS · Oppfølgingskø</span>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>{totalAktive} aktive saker</span>
        </div>
      </div>
    </V2Shell>
  );
}
