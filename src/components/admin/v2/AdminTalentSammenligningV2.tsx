"use client";

/**
 * AgencyOS — Talent · Sammenligning, v2-port 17. juli 2026. Rekomponerer den
 * gamle /admin/(legacy)/talent/sammenligning-skjermen (v10 TalentSammenligning)
 * i v2-idiomet med IDENTISK datakontrakt: loadMultiCompare (Prisma) leverer
 * side-om-side (2–4 spillere via ?ids=), kohort-rangering på siste SG-total og
 * region-fordeling. Referansen er PGA Tour-baseline 0,0 — mangler en spiller
 * SG vises «—», aldri fabrikerte tall. Spillervalget styres fortsatt av ?ids=
 * (kohort-radene togglar utvalget via router-navigasjon).
 */

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  AvatarInit,
  StatusPill,
  StatStrip,
  InnsiktChip,
  FordelingHode,
  FordelingRad,
  TomTilstand,
  T,
} from "@/components/v2";
import { HjelpTips } from "@/components/v2/hjelp";

// ── Datakontrakt (speiler loadMultiCompare i lib/admin-compare) ──
export interface SammenligningMetrikk {
  key: string;
  label: string;
  sub: string;
  reference: number | null;
  referenceLabel: string;
  higherIsBetter: boolean;
  decimals: number;
  /** Er dette en SG-metrikk (fortegn + signalfarge)? */
  erSg: boolean;
  /** Verdi per valgt spiller (samme rekkefølge som `players`). */
  values: (number | null)[];
}
export interface SammenligningSpiller {
  userId: string;
  name: string;
  niva: string | null;
  klubb: string | null;
  hcp: number | null;
  pyramide: { label: string; count: number }[];
  pyramideTotal: number;
}
export interface SammenligningKohortRad {
  userId: string;
  name: string;
  klubb: string | null;
  hcp: number | null;
  sgTotal: number | null;
  selected: boolean;
}
export interface AdminTalentSammenligningV2Data {
  players: SammenligningSpiller[];
  metrics: SammenligningMetrikk[];
  verdict: string | null;
  cohort: SammenligningKohortRad[];
  cohortStats: { count: number; avg: number | null; best: number | null; worst: number | null };
  regions: { region: string; count: number }[];
  totalPlayers: number;
}

/** Talformat: komma-desimal, fortegn for SG, «—» for manglende. */
function fmtVerdi(v: number | null, decimals: number, signert: boolean): string {
  if (v == null) return "—";
  const abs = Math.abs(v).toFixed(decimals).replace(".", ",");
  if (!signert) return v.toFixed(decimals).replace(".", ",");
  return v > 0 ? `+${abs}` : v < 0 ? `−${abs}` : abs;
}

function hcpTekst(hcp: number | null): string {
  return `HCP ${hcp != null ? hcp.toLocaleString("nb-NO") : "—"}`;
}

export function AdminTalentSammenligningV2({ data }: { data: AdminTalentSammenligningV2Data }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const valgteIds = data.players.map((p) => p.userId);
  const n = data.players.length;

  function toggleSpiller(userId: string) {
    const valgt = valgteIds.indexOf(userId) !== -1;
    let neste: string[];
    if (valgt) {
      neste = valgteIds.filter((id) => id !== userId);
    } else {
      if (valgteIds.length >= 4) {
        toast.info("Maks 4 spillere i side-om-side — fjern én først.");
        return;
      }
      neste = valgteIds.concat(userId);
    }
    start(() => {
      router.push(
        neste.length > 0
          ? `/admin/talent/sammenligning?ids=${neste.join(",")}`
          : "/admin/talent/sammenligning",
      );
    });
  }

  // ── Hode + KPI ─────────────────────────────────────────────────
  const hode = (
    <div>
      <Caps>Talent · Sammenligning</Caps>
      <div style={{ marginTop: 10 }}>
        <Tittel em={n >= 2 ? `${n} spillere.` : "kohort & region."}>Side om side · </Tittel>
      </div>
      <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.55, margin: "10px 0 0", maxWidth: 560 }}>
        Tre nivåer: 2–4 spillere parallelt, hele stallen rangert på SG, og geografisk
        fordeling. Referanse er PGA Tour-baseline (0,0). <HjelpTips k="sgTotal" />
      </p>
    </div>
  );

  const kpi = (
    <StatStrip
      items={[
        { l: "Spillere i kohort", v: String(data.cohortStats.count) },
        { l: "Snitt SG total", v: data.cohortStats.avg != null ? fmtVerdi(data.cohortStats.avg, 2, true) : null },
        { l: "Beste SG", v: data.cohortStats.best != null ? fmtVerdi(data.cohortStats.best, 2, true) : null },
        { l: "Svakeste SG", v: data.cohortStats.worst != null ? fmtVerdi(data.cohortStats.worst, 2, true) : null },
      ]}
    />
  );

  // ── Side-om-side-tabell ────────────────────────────────────────
  const th: React.CSSProperties = {
    padding: "8px 10px",
    textAlign: "right",
    verticalAlign: "bottom",
    borderBottom: `1px solid ${T.borderS}`,
    whiteSpace: "nowrap",
  };
  const sideOmSide = (
    <Kort
      eyebrow="Side om side · SG per kategori"
      action={<Caps size={9}>Referanse: PGA Tour-baseline 0,0</Caps>}
    >
      {n === 0 ? (
        <TomTilstand
          icon="users"
          title="Ingen spillere valgt"
          sub="Trykk på spillere i kohort-lista under for å legge dem i sammenligningen (inntil 4)."
        />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 460 }}>
            <thead>
              <tr>
                <th style={{ ...th, textAlign: "left" }}>
                  <Caps size={9}>Metrikk</Caps>
                </th>
                {data.players.map((p) => (
                  <th key={p.userId} style={th}>
                    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <AvatarInit navn={p.name} size={26} />
                      <span style={{ fontFamily: T.ui, fontSize: 11.5, fontWeight: 600, color: T.fg }}>{p.name}</span>
                      <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>
                        {(p.niva ?? "—") + " · " + hcpTekst(p.hcp)}
                      </span>
                    </span>
                  </th>
                ))}
                <th style={th}>
                  <Caps size={9}>Referanse</Caps>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.metrics.map((m, mi) => {
                // Best per metrikk (kun der minst to spillere har verdi).
                const medVerdi = m.values
                  .map((v, i) => ({ v, i }))
                  .filter((x): x is { v: number; i: number } => x.v != null);
                const bestIdx =
                  medVerdi.length >= 2 && m.higherIsBetter
                    ? medVerdi.reduce((a, b) => (b.v > a.v ? b : a)).i
                    : null;
                const sisteRad = mi === data.metrics.length - 1;
                const td: React.CSSProperties = {
                  padding: "10px 10px",
                  textAlign: "right",
                  borderBottom: sisteRad ? "none" : `1px solid ${T.border}`,
                  fontFamily: T.mono,
                  fontSize: 12.5,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                };
                return (
                  <tr key={m.key}>
                    <td style={{ ...td, textAlign: "left", fontFamily: T.ui, fontWeight: 600, fontSize: 13, color: T.fg }}>
                      {m.label}
                      <span style={{ display: "block", fontFamily: T.ui, fontWeight: 400, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
                        {m.sub}
                      </span>
                    </td>
                    {m.values.map((v, i) => {
                      const farge =
                        v == null
                          ? T.mut
                          : m.erSg
                            ? v > 0
                              ? T.up
                              : v < 0
                                ? T.down
                                : T.fg2
                            : T.fg;
                      return (
                        <td key={i} style={{ ...td, color: farge }}>
                          {bestIdx === i && (
                            <span
                              aria-label="Best i utvalget"
                              style={{ display: "inline-block", width: 6, height: 6, borderRadius: 9999, background: T.lime, marginRight: 6, verticalAlign: "middle" }}
                            />
                          )}
                          {fmtVerdi(v, m.decimals, m.erSg)}
                        </td>
                      );
                    })}
                    <td style={{ ...td, color: T.mut, fontWeight: 600 }}>
                      {m.reference != null ? fmtVerdi(m.reference, m.decimals, false) : m.referenceLabel.toLowerCase()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Kort>
  );

  // ── Pyramide-fordeling per valgt spiller ───────────────────────
  const pyramide =
    n > 0 ? (
      <Kort eyebrow="Pyramide-fordeling · økter per akse" action={<HjelpTips k="pyramideAkse" align="right" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: T.gap }}>
          {data.players.map((p) => (
            <div key={p.userId}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <AvatarInit navn={p.name} size={24} />
                <span style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg }}>{p.name}</span>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>{p.pyramideTotal} økter</span>
              </div>
              {p.pyramideTotal === 0 ? (
                <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, margin: "8px 0 0" }}>
                  Ingen treningsplaner registrert.
                </p>
              ) : (
                p.pyramide.map((akse, i) => (
                  <FordelingRad
                    key={akse.label}
                    code={akse.label}
                    pct={(akse.count / p.pyramideTotal) * 100}
                    value={akse.count}
                    last={i === p.pyramide.length - 1}
                  />
                ))
              )}
            </div>
          ))}
        </div>
      </Kort>
    ) : null;

  // ── Kohort-rangering (klikk = velg/fjern i side-om-side) ───────
  const kohort = (
    <Kort
      eyebrow={`Hele stallen · SG total · ${data.cohortStats.count}`}
      action={<Caps size={9}>Trykk for å velge · maks 4</Caps>}
    >
      {data.cohort.length === 0 ? (
        <TomTilstand icon="users" title="Ingen spillere i stallen" sub="Kohorten fylles når spillere er registrert." />
      ) : (
        <div style={{ opacity: pending ? 0.6 : 1 }}>
          {data.cohort.map((c, i) => (
            <Rad
              key={c.userId}
              onClick={() => toggleSpiller(c.userId)}
              leading={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 22, fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, color: T.mut, textAlign: "right" }}>
                    {i + 1}
                  </span>
                  <AvatarInit navn={c.name} size={30} />
                </span>
              }
              title={c.name}
              sub={`${c.klubb ?? "Uten klubb"} · ${hcpTekst(c.hcp)}`}
              meta={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: 13,
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                      color: c.sgTotal == null ? T.mut : c.sgTotal > 0 ? T.up : c.sgTotal < 0 ? T.down : T.fg2,
                    }}
                  >
                    {fmtVerdi(c.sgTotal, 2, true)}
                  </span>
                  {c.selected && <StatusPill tone="lime">Valgt</StatusPill>}
                </span>
              }
              trailing={null}
              last={i === data.cohort.length - 1}
            />
          ))}
        </div>
      )}
    </Kort>
  );

  // ── Region-fordeling ───────────────────────────────────────────
  const region = (
    <Kort
      eyebrow={`Spiller-geografi · ${data.regions.length} ${data.regions.length === 1 ? "region" : "regioner"}`}
      action={<Caps size={9}>{data.totalPlayers} spillere</Caps>}
    >
      {data.regions.length === 0 ? (
        <TomTilstand icon="map" title="Ingen region-data" sub="Region hentes fra talent-programmet eller hjemmeklubb." />
      ) : (
        <>
          <FordelingHode kol1="%" kol2="Antall" />
          {data.regions.map((r, i) => (
            <FordelingRad
              key={r.region}
              label={r.region}
              pct={data.totalPlayers > 0 ? (r.count / data.totalPlayers) * 100 : 0}
              value={r.count}
              kol2
              last={i === data.regions.length - 1}
            />
          ))}
          <p style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, lineHeight: 1.5, margin: "10px 0 0" }}>
            Basert på registrert region (talent-program) eller hjemmeklubb. Geografi er
            kontekst, ikke uttaks-grunnlag.
          </p>
        </>
      )}
    </Kort>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {kpi}
      {sideOmSide}
      {data.verdict && <InnsiktChip>{data.verdict}</InnsiktChip>}
      {pyramide}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,380px)]" style={{ gap: T.gap, alignItems: "start" }}>
        {kohort}
        {region}
      </div>
    </div>
  );
}
