import { TL } from "@/lib/v2/train-lock";
import Link from "next/link";
import { Caps, Kort, StatusPill, AvatarFoto, TilbakeLenke, CTAPill, TomTilstand } from "@/components/v2";
import { InviteParentButtonV2 } from "./AdminInviteParentButtonV2";
/**
 * AgencyOS — Full spiller-profil (`/admin/spillere/[id]/profil`), v2 + B-pakke.
 * Stamdata-side: status/hode · én primær «Rediger» · TomTilstand med vei.
 * Kun T.* / v2. (ProfilSideV2 ≠ ProfilV2 i dashboard.)
 */

export type TalentAxis = "fysisk" | "teknikk" | "taktikk" | "mental" | "motivasjon";
export type DnaShape = Record<TalentAxis, number>;

export interface ProfilForelder {
  id: string;
  navn: string;
  avatarUrl: string | null;
  relasjon: string;
  kontakt: string;
}
export interface ProfilMaal {
  id: string;
  typeLabel: string;
  tittel: string;
  fristLabel: string | null;
  /** null = ingenting relevant logget ennå — vis "ingen data ennå", ikke en fabrikkert 0/50 %. */
  pct: number | null;
}
export interface ProfilPermisjon {
  id: string;
  aarsak: string;
  fraLabel: string;
  tilLabel: string;
  beskrivelse: string;
  statusLabel: string;
}
export interface AdminSpillerProfilSideV2Data {
  spillerId: string;
  navn: string;
  epost: string;
  fodselsdatoLabel: string | null;
  telefon: string;
  hjemmeklubb: string;
  skole: string;
  spilteAar: string;
  ambisjon: string;
  foreldre: ProfilForelder[];
  dna: DnaShape;
  cohort: DnaShape;
  maal: ProfilMaal[];
  permisjoner: ProfilPermisjon[];
  coachVurdering: { tekst: string; coachNavn: string; datoLabel: string } | null;
}

const AXIS_LABEL: Record<TalentAxis, string> = { fysisk: "Fysisk", teknikk: "Teknikk", taktikk: "Taktikk", mental: "Mental", motivasjon: "Mot." };
const AXIS_COLOR: Record<TalentAxis, string> = { fysisk: TL.ok, teknikk: TL.fill, taktikk: TL.viz.target, mental: TL.warn, motivasjon: TL.fill };
const AXES: TalentAxis[] = ["fysisk", "teknikk", "taktikk", "mental", "motivasjon"];

function SeksjonHode({ eyebrow, tittel }: { eyebrow: string; tittel: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Caps>{eyebrow}</Caps>
      <h2 style={{ margin: "4px 0 0", fontFamily: TL.font.sans, fontWeight: 700, fontSize: 17, color: TL.text }}>{tittel}</h2>
    </div>
  );
}

function Fact({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: TL.mute }}>{label}</div>
      <div style={{ marginTop: 4, fontFamily: mono ? TL.font.mono : TL.font.sans, fontSize: 13, color: TL.text, fontVariantNumeric: mono ? "tabular-nums" : undefined }}>{value}</div>
    </div>
  );
}

function DnaAxisRow({ axis, verdi, cohort }: { axis: TalentAxis; verdi: number; cohort: number }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", fontFamily: TL.font.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        <span style={{ fontWeight: 700, color: TL.text }}>{AXIS_LABEL[axis]}</span>
        <span style={{ color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{verdi} / cohort {cohort}</span>
      </div>
      <div style={{ position: "relative", height: 8, borderRadius: 9999, background: TL.hair, overflow: "hidden", marginTop: 4 }}>
        <div style={{ position: "absolute", inset: "0 auto 0 0", width: `${verdi}%`, borderRadius: 9999, background: AXIS_COLOR[axis] }} />
        <div style={{ position: "absolute", top: 0, height: "100%", width: 2, background: TL.text, left: `${cohort}%` }} aria-hidden />
      </div>
    </div>
  );
}

function RadarChart({ dna, cohort }: { dna: DnaShape; cohort: DnaShape }) {
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const r = 100;
  const N = AXES.length;
  const angle = (i: number) => (Math.PI * 2 * i) / N - Math.PI / 2;
  const pt = (v: number, i: number): [number, number] => {
    const rad = (v / 100) * r;
    return [cx + rad * Math.cos(angle(i)), cy + rad * Math.sin(angle(i))];
  };
  const path = (vals: number[]) =>
    vals.map((v, i) => { const [x, y] = pt(v, i); return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`; }).join(" ") + " Z";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {[20, 40, 60, 80, 100].map((p) => (
        <polygon key={p} fill="none" stroke={TL.hair} strokeWidth={0.5} points={AXES.map((_, i) => pt(p, i).join(",")).join(" ")} />
      ))}
      {AXES.map((_, i) => {
        const [x, y] = pt(100, i);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={TL.hair} strokeWidth={0.5} />;
      })}
      <path d={path(AXES.map((a) => cohort[a]))} fill="none" stroke={TL.mute} strokeWidth={1.5} strokeDasharray="4 3" />
      <path d={path(AXES.map((a) => dna[a]))} fill={TL.fill} fillOpacity={0.3} stroke={TL.fill} strokeWidth={2} />
      {AXES.map((a, i) => {
        const labelR = r + 18;
        const [lx, ly] = [cx + labelR * Math.cos(angle(i)), cy + labelR * Math.sin(angle(i))];
        return (
          <text key={a} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontFamily={TL.font.mono} fill={TL.mute} style={{ letterSpacing: "0.08em" }}>
            {AXIS_LABEL[a].toUpperCase()}
          </text>
        );
      })}
    </svg>
  );
}

function ProgressRing({ pct }: { pct: number | null }) {
  if (pct == null) {
    return (
      <div style={{ marginTop: 8, fontFamily: TL.font.mono, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.06em", color: TL.mute }}>
        Ingen data ennå
      </div>
    );
  }
  const size = 56;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const offset = C - (pct / 100) * C;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TL.hair} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TL.fill} strokeWidth={stroke} strokeDasharray={C} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div style={{ fontFamily: TL.font.mono, fontSize: 13, fontWeight: 700, color: TL.fill, fontVariantNumeric: "tabular-nums" }}>{pct} %</div>
    </div>
  );
}

export function AdminSpillerProfilSideV2({ data }: { data: AdminSpillerProfilSideV2Data }) {
  return (
    <div data-paper-wave-e="spillerprofil-side" data-od-id="agencyos-spillerprofil-side" data-paper-slug="spillerprofil" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <TilbakeLenke href={`/admin/spillere/${data.spillerId}`}>{`Tilbake til ${data.navn}`}</TilbakeLenke>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontWeight: 600, fontSize: 17, color: TL.text }}>
              {data.navn}
            </h1>
            <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>
              Spillerprofil · stamdata
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Link href="/admin/videoer" style={{ textDecoration: "none" }}>
              <CTAPill icon="video" ghost>Videoer</CTAPill>
            </Link>
            <Link href={`/admin/spillere/${data.spillerId}/turnering-kobling`} style={{ textDecoration: "none" }}>
              <CTAPill icon="link-2" ghost>Turneringskobling</CTAPill>
            </Link>
            <Link href={`/admin/spillere/${data.spillerId}/rediger`} style={{ textDecoration: "none" }}>
              <CTAPill icon="pencil">Rediger</CTAPill>
            </Link>
          </div>
        </div>
      </div>

      <Kort>
        <SeksjonHode eyebrow="Personalia" tittel="Stamdata" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px 32px" }}>
          <Fact label="Fullt navn" value={data.navn} />
          <Fact label="E-post" value={data.epost} mono />
          <Fact label="Fødselsdato" value={data.fodselsdatoLabel ?? "—"} />
          <Fact label="Telefon" value={data.telefon} mono />
          <Fact label="Hjemmeklubb" value={data.hjemmeklubb} />
          <Fact label="Skole" value={data.skole} />
          <Fact label="Spilte år" value={data.spilteAar} />
          <Fact label="Ambisjon" value={data.ambisjon} />
        </div>
      </Kort>

      <Kort>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <Caps>Forelder / verge</Caps>
            <h2 style={{ margin: "4px 0 0", fontFamily: TL.font.sans, fontWeight: 700, fontSize: 17, color: TL.text }}>Foresatte</h2>
          </div>
          <InviteParentButtonV2 playerId={data.spillerId} playerName={data.navn} />
        </div>
        {data.foreldre.length === 0 ? (
          <TomTilstand icon="users" title="Ingen foresatte registrert" sub="Inviter foresatt med knappen over når det trengs." />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {data.foreldre.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, borderRadius: 12, border: `1px solid ${TL.hair}`, background: TL.dock, padding: 14 }}>
                <AvatarFoto src={p.avatarUrl} navn={p.navn} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TL.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.navn}</div>
                  <div style={{ marginTop: 2, fontFamily: TL.font.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: TL.mute }}>{p.relasjon}</div>
                  <div style={{ marginTop: 6, fontFamily: TL.font.mono, fontSize: 11, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{p.kontakt}</div>
                  <span style={{ marginTop: 6, display: "inline-flex", borderRadius: 9999, background: TL.dim, padding: "2px 8px", fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: TL.fill }}>
                    Stripe-betaler
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Kort>

      <Kort>
        <SeksjonHode eyebrow="Spiller-DNA" tittel="5-akset profil" />
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "center" }}>
          <RadarChart dna={data.dna} cohort={data.cohort} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {AXES.map((a) => (
              <DnaAxisRow key={a} axis={a} verdi={data.dna[a]} cohort={data.cohort[a]} />
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8, fontFamily: TL.font.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: TL.mute }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 8, borderRadius: 9999, background: TL.fill }} /> Spilleren</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 8, borderRadius: 9999, background: TL.mute }} /> Cohort-snitt</span>
            </div>
          </div>
        </div>
      </Kort>

      <Kort>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <Caps>Aktive mål</Caps>
            <h2 style={{ margin: "4px 0 0", fontFamily: TL.font.sans, fontWeight: 700, fontSize: 17, color: TL.text }}>Pågående målbilder</h2>
          </div>
          <span style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute }}>{data.maal.length}</span>
        </div>
        {data.maal.length === 0 ? (
          <TomTilstand icon="target" title="Ingen aktive mål" sub="Mål settes sammen med spilleren i Workbench." />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            {data.maal.map((g) => (
              <div key={g.id} style={{ borderRadius: 12, border: `1px solid ${TL.hair}`, background: TL.dock, padding: 14 }}>
                <span style={{ display: "inline-flex", borderRadius: 9999, background: TL.dim, padding: "2px 8px", fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: TL.fill }}>
                  {g.typeLabel}
                </span>
                <h3 style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 600, lineHeight: 1.4, color: TL.text }}>{g.tittel}</h3>
                <ProgressRing pct={g.pct} />
                {g.fristLabel && <div style={{ marginTop: 8, fontFamily: TL.font.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: TL.mute }}>Frist: {g.fristLabel}</div>}
              </div>
            ))}
          </div>
        )}
      </Kort>

      <Kort>
        <SeksjonHode eyebrow="Skader / permisjoner" tittel="Historikk" />
        {data.permisjoner.length === 0 ? (
          <TomTilstand icon="shield-check" title="Ingen registrerte hendelser" sub="Skader og permisjoner vises her når de er logget." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${TL.hair}` }}>
                  {["Årsak", "Fra", "Til", "Beskrivelse", "Status"].map((h) => (
                    <th key={h} style={{ paddingBottom: 8, paddingRight: 16, fontFamily: TL.font.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: TL.mute, fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.permisjoner.map((l, i) => (
                  <tr key={l.id} style={{ borderBottom: i === data.permisjoner.length - 1 ? "none" : `1px solid ${TL.hair}` }}>
                    <td style={{ padding: "8px 16px 8px 0", fontSize: 13, fontWeight: 600, color: TL.text }}>{l.aarsak}</td>
                    <td style={{ padding: "8px 16px 8px 0", fontFamily: TL.font.mono, fontSize: 12, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{l.fraLabel}</td>
                    <td style={{ padding: "8px 16px 8px 0", fontFamily: TL.font.mono, fontSize: 12, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{l.tilLabel}</td>
                    <td style={{ padding: "8px 16px 8px 0", fontSize: 13, color: TL.text }}>{l.beskrivelse}</td>
                    <td style={{ padding: "8px 0" }}>
                      <StatusPill tone="info">{l.statusLabel}</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Kort>

      <Kort style={{ position: "relative", overflow: "hidden", paddingLeft: 24 }}>
        <span aria-hidden style={{ position: "absolute", left: 0, top: 0, height: "100%", width: 5, background: TL.fill }} />
        <Caps>Coachens vurdering</Caps>
        {data.coachVurdering ? (
          <>
            <blockquote style={{ margin: "14px 0 0", fontFamily: TL.font.sans, fontStyle: "italic", fontSize: 20, lineHeight: 1.5, color: TL.text }}>
              «{data.coachVurdering.tekst}»
            </blockquote>
            <div style={{ marginTop: 12, fontFamily: TL.font.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: TL.mute }}>
              {data.coachVurdering.coachNavn} · oppdatert {data.coachVurdering.datoLabel}
            </div>
          </>
        ) : (
          <p style={{ marginTop: 14, fontSize: 13, color: TL.mute }}>Ingen vurdering registrert ennå.</p>
        )}
      </Kort>
    </div>
  );
}
