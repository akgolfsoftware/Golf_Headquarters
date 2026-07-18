"use client";

/**
 * /admin/stats/moderering — moderering-/GDPR-kø, KOBLET 17. juli 2026 (D5).
 * Erstatter stub-fanene fra v2-porten 16. juli: kontrakten er nå bygget på den
 * faktiske datamodellen (ModerationCase — rapportert innhold + GDPR-sletting),
 * ikke de fem tenkte stats-fanene. Godkjenn/Avvis/Bekreft sletting kaller
 * server actions i rutemappen med pending-state og inline-feil (samme mønster
 * som AdminForeslatteTesterV2 — ingen toast). GDPR er to-stegs: Godkjenn
 * først, deretter eksplisitt «Bekreft sletting» med confirm-vakt i klarspråk.
 * Saker OPPRETTES ikke her ennå — rapporteringsflyten er egen jobb.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Caps, Knapp, Kort, StatusPill, TekstOmraade, TomTilstand, T } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { CountUp } from "@/components/stats/count-up";
import { avvisSak, godkjennSak, utforGdprSletting } from "@/app/admin/(legacy)/stats/moderering/actions";

/* ── Datakontrakt (mappes fra ModerationCase i page.tsx) ─────────────────── */

export type ModereringSakType = "RAPPORTERT_INNHOLD" | "GDPR_SLETTING";
export type ModereringSakStatus = "OPEN" | "APPROVED" | "REJECTED" | "EXECUTED";

export interface ModereringSakV2 {
  id: string;
  type: ModereringSakType;
  status: ModereringSakStatus;
  /** Navnet på spilleren saken gjelder («Slettet bruker» etter utført GDPR). */
  spillerNavn: string;
  /** Hvem som meldte saken — null ved GDPR-egenforespørsel. */
  rapportertAv: string | null;
  /** Rapportert mål, f.eks. «Video · cku…» — null når ikke relevant. */
  mal: string | null;
  /** Innmelderens begrunnelse. */
  begrunnelse: string | null;
  /** Ferdig formatert mottatt-tidspunkt (Oslo-tid). */
  mottatt: string;
  /** Ferdig formatert behandlet-tidspunkt — null for åpne saker. */
  behandlet: string | null;
}

export interface ModereringStatsV2 {
  /** Åpne rapportert innhold-saker. */
  rapporter: number;
  /** Åpne + godkjente (ikke utførte) GDPR-slettesaker. */
  slett: number;
  godkjentDenneUka: number;
  avvistDenneUka: number;
  snittTid: string;
}

export interface AdminStatsModereringV2Props {
  /** Kø: OPEN-saker + APPROVED GDPR-saker som venter på utførelse. */
  saker: ModereringSakV2[];
  /** Nylig lukkede saker (avvist/utført/godkjent rapport), nyeste først. */
  historikk: ModereringSakV2[];
  stats: ModereringStatsV2;
  /** Klarspråk-feilmelding når køen ikke kunne leses (f.eks. preview uten tabell). */
  lasteFeil: string | null;
}

const TABS = [
  { id: "rapporter", label: "Rapportert innhold", icon: "flag" },
  { id: "slett", label: "Slett-forespørsler", icon: "trash-2" },
  { id: "historikk", label: "Historikk", icon: "history" },
] as const;

type Tab = (typeof TABS)[number]["id"];

/* ── Småbiter ────────────────────────────────────────────────────────────── */

function Kpi({ label, value, tone }: { label: string; value: number; tone: "lime" | "up" | "down" }) {
  const c = tone === "up" ? T.up : tone === "down" ? T.down : T.fg;
  return (
    <Kort>
      <Caps>{label}</Caps>
      <div style={{ marginTop: 6, fontFamily: T.mono, fontSize: 30, fontWeight: 700, lineHeight: 1, color: c, fontVariantNumeric: "tabular-nums" }}>
        <CountUp value={value} />
      </div>
    </Kort>
  );
}

function KpiText({ label, value }: { label: string; value: string }) {
  return (
    <Kort>
      <Caps>{label}</Caps>
      <div style={{ marginTop: 6, fontFamily: T.mono, fontSize: 26, fontWeight: 700, lineHeight: 1, color: T.fg }}>{value}</div>
    </Kort>
  );
}

function TypePill({ type }: { type: ModereringSakType }) {
  return type === "GDPR_SLETTING" ? (
    <StatusPill tone="down">GDPR · Sletting</StatusPill>
  ) : (
    <StatusPill tone="warn">Rapportert innhold</StatusPill>
  );
}

function ResultatPill({ status }: { status: ModereringSakStatus }) {
  if (status === "APPROVED") return <StatusPill tone="up">Godkjent</StatusPill>;
  if (status === "REJECTED") return <StatusPill tone="down">Avvist</StatusPill>;
  if (status === "EXECUTED") return <StatusPill tone="info">Sletting utført</StatusPill>;
  return <StatusPill tone="warn">Åpen</StatusPill>;
}

function InlineFeil({ melding }: { melding: string }) {
  return (
    <div
      role="alert"
      style={{
        fontFamily: T.ui, fontSize: 12, color: T.down, lineHeight: 1.5,
        background: `color-mix(in srgb, ${T.down} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${T.down} 30%, transparent)`,
        borderRadius: 10, padding: "8px 11px", marginTop: 12,
      }}
    >
      {melding}
    </div>
  );
}

function MetaRad({ label, verdi }: { label: string; verdi: string }) {
  return (
    <>
      <span style={{ color: T.mut }}>{label}</span>
      <span style={{ color: T.fg, minWidth: 0, overflowWrap: "anywhere" }}>{verdi}</span>
    </>
  );
}

/* ── Sak-kort med koblede handlinger ─────────────────────────────────────── */

function SakKort({ sak }: { sak: ModereringSakV2 }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [visAvvis, setVisAvvis] = useState(false);
  const [avvisGrunn, setAvvisGrunn] = useState("");

  const gdpr = sak.type === "GDPR_SLETTING";
  const venterUtforelse = gdpr && sak.status === "APPROVED";

  function kjor(handling: () => Promise<{ ok: true }>, fallbackFeil: string) {
    setError(null);
    startTransition(async () => {
      try {
        await handling();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error && err.message ? err.message : fallbackFeil);
      }
    });
  }

  function godkjenn() {
    kjor(() => godkjennSak(sak.id), "Kunne ikke godkjenne saken.");
  }

  function avvis() {
    kjor(() => avvisSak(sak.id, avvisGrunn.trim() || undefined), "Kunne ikke avvise saken.");
  }

  function bekreftSletting() {
    const ok = confirm(
      `Bekreft GDPR-sletting for ${sak.spillerNavn}?\n\n` +
        "Profilen anonymiseres: navnet erstattes med «Slettet bruker», og " +
        "e-post, telefon, profilbilde og fødselsdato fjernes. Treningsdata, " +
        "bookinger og økter beholdes — uten personopplysninger.\n\n" +
        "Dette kan ikke angres.",
    );
    if (!ok) return;
    kjor(() => utforGdprSletting(sak.id), "Kunne ikke utføre slettingen.");
  }

  return (
    <Kort
      eyebrow={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name={gdpr ? "shield-check" : "flag"} size={11} style={{ color: T.mut }} />
          Mottatt {sak.mottatt}
        </span>
      }
      action={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <TypePill type={sak.type} />
          {venterUtforelse && <StatusPill tone="info">Godkjent · venter på utførelse</StatusPill>}
        </span>
      }
    >
      <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, lineHeight: 1.25, color: T.fg }}>
        {sak.spillerNavn}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 16px", marginTop: 12, fontFamily: T.ui, fontSize: 13, lineHeight: 1.5 }}>
        <MetaRad label={gdpr ? "Forespurt av:" : "Rapportert av:"} verdi={sak.rapportertAv ?? (gdpr ? "Spilleren selv (egenforespørsel)" : "Ukjent")} />
        {sak.mal && <MetaRad label="Gjelder:" verdi={sak.mal} />}
        {sak.begrunnelse && <MetaRad label="Begrunnelse:" verdi={`«${sak.begrunnelse}»`} />}
      </div>

      {venterUtforelse && (
        <div style={{ marginTop: 14, borderRadius: 12, background: `color-mix(in srgb, ${T.down} 8%, transparent)`, padding: 14 }}>
          <div style={{ marginBottom: 8, fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: T.down }}>
            Dette skjer ved bekreftelse
          </div>
          <ul style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: T.ui, fontSize: 13, lineHeight: 1.55, color: T.fg, margin: 0, paddingLeft: 0, listStyle: "none" }}>
            <li>· Profilen anonymiseres — navn blir «Slettet bruker», e-post/telefon/bilde/fødselsdato fjernes</li>
            <li>· Treningsdata, bookinger og økter beholdes uten personopplysninger</li>
            <li>· Handlingen logges i audit-loggen og kan ikke angres</li>
          </ul>
        </div>
      )}

      {visAvvis && !pending && (
        <div style={{ marginTop: 14 }}>
          <TekstOmraade
            label="Begrunnelse for avvisning (valgfritt — logges i audit-loggen)"
            value={avvisGrunn}
            rows={2}
            placeholder="F.eks. «Innholdet bryter ikke retningslinjene.»"
            onChange={setAvvisGrunn}
          />
        </div>
      )}

      {error && <InlineFeil melding={error} />}

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 16 }}>
        {venterUtforelse ? (
          <Knapp
            icon={pending ? "loader" : "trash-2"}
            disabled={pending}
            onClick={bekreftSletting}
            style={{ minHeight: 44, background: T.down, borderColor: T.down, color: T.bg }}
          >
            Bekreft sletting
          </Knapp>
        ) : visAvvis ? (
          <>
            <Knapp icon={pending ? "loader" : "x"} disabled={pending} onClick={avvis} style={{ minHeight: 44, background: T.down, borderColor: T.down, color: T.bg }}>
              Bekreft avvisning
            </Knapp>
            <Knapp ghost disabled={pending} onClick={() => setVisAvvis(false)} style={{ minHeight: 44 }}>
              Angre
            </Knapp>
          </>
        ) : (
          <>
            <Knapp icon={pending ? "loader" : "check"} disabled={pending} onClick={godkjenn} style={{ minHeight: 44 }}>
              {gdpr ? "Godkjenn forespørselen" : "Godkjenn rapporten"}
            </Knapp>
            <Knapp ghost icon="x" disabled={pending} onClick={() => setVisAvvis(true)} style={{ minHeight: 44, color: T.down }}>
              Avvis
            </Knapp>
          </>
        )}
        {gdpr && !venterUtforelse && (
          <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.5 }}>
            To steg: godkjenning først — selve slettingen bekreftes etterpå.
          </span>
        )}
      </div>
    </Kort>
  );
}

/* ── Skjerm ──────────────────────────────────────────────────────────────── */

export function ModeringClientV2({ saker, historikk, stats, lasteFeil }: AdminStatsModereringV2Props) {
  const [aktivTab, setAktivTab] = useState<Tab>("rapporter");
  const totaltVentende = stats.rapporter + stats.slett;

  const rapporter = saker.filter((s) => s.type === "RAPPORTERT_INNHOLD");
  const slett = saker.filter((s) => s.type === "GDPR_SLETTING");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, paddingBottom: 48 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
        <div>
          <Caps>Admin · Stats</Caps>
          <h1 style={{ margin: "8px 0 0", fontFamily: T.disp, fontWeight: 700, fontSize: 30, lineHeight: 1.05, letterSpacing: "-0.02em", color: T.fg }}>Moderering</h1>
          <p style={{ marginTop: 6, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mut }}>
            Behandle rapportert innhold · håndter GDPR-slett
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: T.mono, fontSize: 48, fontWeight: 700, lineHeight: 1, color: T.lime, fontVariantNumeric: "tabular-nums" }}>
            <CountUp value={totaltVentende} />
          </div>
          <div style={{ marginTop: 4, fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: T.mut }}>Ventende</div>
        </div>
      </div>

      {lasteFeil && (
        <Kort style={{ borderColor: `color-mix(in srgb, ${T.warn} 40%, ${T.border})` }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <Icon name="alert-triangle" size={16} style={{ color: T.warn, flex: "none", marginTop: 1 }} />
            <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, lineHeight: 1.55, margin: 0 }}>{lasteFeil}</p>
          </div>
        </Kort>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <Kpi label="Ventende" value={totaltVentende} tone="lime" />
        <Kpi label="Godkjent denne uka" value={stats.godkjentDenneUka} tone="up" />
        <Kpi label="Avvist denne uka" value={stats.avvistDenneUka} tone="down" />
        <KpiText label="Snitt-tid" value={stats.snittTid} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, overflowX: "auto", borderBottom: `1px solid ${T.border}` }}>
        {TABS.map((t) => {
          const count = t.id === "rapporter" ? stats.rapporter : t.id === "slett" ? stats.slett : undefined;
          const isActive = aktivTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              className="v2-focus"
              onClick={() => setAktivTab(t.id)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
                marginBottom: -1, padding: "14px 14px", background: "none", border: "none",
                borderBottomWidth: 2, borderBottomStyle: "solid", borderBottomColor: isActive ? T.lime : "transparent",
                fontFamily: T.mono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em",
                color: isActive ? T.lime : T.mut, cursor: "pointer",
              }}
            >
              <Icon name={t.icon} size={14} />
              {t.label}
              {count !== undefined && count > 0 && (
                <span style={{ borderRadius: 9999, padding: "1px 6px", fontFamily: T.mono, fontSize: 10, fontWeight: 800, background: t.id === "slett" ? T.down : T.lime, color: t.id === "slett" ? T.bg : T.onLime }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {aktivTab === "rapporter" &&
          (rapporter.length === 0 ? (
            <Kort>
              <TomTilstand icon="check" title="Ingen ventende rapporter" sub="Køen er tom akkurat nå." />
            </Kort>
          ) : (
            rapporter.map((s) => <SakKort key={s.id} sak={s} />)
          ))}

        {aktivTab === "slett" &&
          (slett.length === 0 ? (
            <Kort>
              <TomTilstand icon="check" title="Ingen ventende slett-forespørsler" sub="Køen er tom akkurat nå." />
            </Kort>
          ) : (
            slett.map((s) => <SakKort key={s.id} sak={s} />)
          ))}

        {aktivTab === "historikk" &&
          (historikk.length === 0 ? (
            <Kort>
              <TomTilstand icon="history" title="Ingen behandlede saker ennå" sub="Behandlede saker dukker opp her." />
            </Kort>
          ) : (
            historikk.map((s) => (
              <Kort key={s.id}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>{s.spillerNavn}</span>
                  <TypePill type={s.type} />
                  <ResultatPill status={s.status} />
                  <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: T.mut }}>
                    {s.behandlet ? `Behandlet ${s.behandlet}` : `Mottatt ${s.mottatt}`}
                  </span>
                </div>
              </Kort>
            ))
          ))}
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Icon name="info" size={13} style={{ color: T.mut, flex: "none", marginTop: 2 }} />
        <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.6, margin: 0, maxWidth: 620 }}>
          Saker opprettes foreløpig av support — rapportert innhold meldes dit, og
          GDPR-sletting startes ved skriftlig forespørsel fra spilleren. Rapporteringsflyt
          i appen kommer senere.
        </p>
      </div>
    </div>
  );
}
