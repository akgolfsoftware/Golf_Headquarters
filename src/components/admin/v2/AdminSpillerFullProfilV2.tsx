"use client";

/**
 * AgencyOS v2 — Full spiller-profil (`/admin/spillere/[id]/profil`,
 * AgencyOS Bølge 3.28, 2026-07-14). Port fra `(legacy)/spillere/[id]/
 * profil/page.tsx` + `invite-parent-button.tsx` — samme datamodell,
 * `BunnArk` erstatter den native invite-dialogen (`inviterForelderForSpiller`,
 * objekt-basert action, uendret kontrakt). NB: dette er en ANNEN skjerm
 * enn `AdminSpillerProfilV2` (spiller-dashboardet på `/admin/spillere/[id]`)
 * — like navn, ulike ruter, ikke forveksle.
 *
 * MERK (funnet under porten, ikke fikset): «Spiller-DNA»-radaren og
 * cohort-snittet er HARDKODEDE plassholdertall i page.tsx (`dna` faller
 * tilbake til `{ fysisk: 78, teknikk: 82, ... }`, `cohort` er alltid
 * `{ fysisk: 70, ... }` — aldri beregnet fra ekte data) — samme i
 * `ProgressRing pct={50}` på aktive mål (alltid 50 %, uansett faktisk
 * fremgang). Dette er en pre-eksisterende fabrikasjon i legacy-siden,
 * bevart uendret her (design-port, ikke en data-fiks), meldt i
 * MASTER-SKJERMPLAN.md.
 */

import Link from "next/link";
import { useState, useTransition } from "react";
import { Caps, Tittel, Kort, Knapp, StatusPill, Icon, T, BunnArk, AvatarFoto } from "@/components/v2";
import { Inndata, Velger } from "@/components/v2/skjema";
import { inviterForelderForSpiller } from "@/app/admin/(legacy)/spillere/[id]/profil/actions";

type DnaShape = { fysisk: number; teknikk: number; taktikk: number; mental: number; motivasjon: number };
type TalentAxis = keyof DnaShape;

const TALENT_AXIS_COLOR: Record<TalentAxis, string> = {
  fysisk: T.ax.FYS,
  teknikk: T.ax.TEK,
  taktikk: T.ax.SLAG,
  mental: T.ax.SPILL,
  motivasjon: T.ax.TURN,
};

export interface SpillerProfilFaktaV2 {
  fulltNavn: string;
  epost: string;
  fodselsdatoTekst: string;
  telefon: string;
  hjemmeklubb: string;
  skole: string;
  spilteAar: string;
  ambisjon: string;
}

export interface ForelderRadV2 {
  id: string;
  navn: string;
  avatarUrl: string | null;
  relasjon: string;
  kontakt: string;
}

export interface AktivtMaalV2 {
  id: string;
  typeLabel: string;
  tittel: string;
  fristTekst: string | null;
}

export interface SkadeRadV2 {
  id: string;
  aarsak: string;
  fraTekst: string;
  tilTekst: string;
  beskrivelse: string;
  statusLabel: string;
}

export interface SpillerFullProfilV2Data {
  playerId: string;
  playerName: string;
  fakta: SpillerProfilFaktaV2;
  foreldre: ForelderRadV2[];
  dna: DnaShape;
  cohort: DnaShape;
  aktiveMaal: AktivtMaalV2[];
  skader: SkadeRadV2[];
  coachVurdering: { tekst: string; forfatterTekst: string } | null;
}

function Fact({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <Caps size={9}>{label}</Caps>
      <div style={{ marginTop: 4, fontFamily: mono ? T.mono : T.ui, fontSize: 13.5, color: T.fg }}>{value}</div>
    </div>
  );
}

function DnaAxisRow({ label, value, cohort, axis }: { label: string; value: number; cohort: number; axis: TalentAxis }) {
  return (
    <div>
      <div style={{ marginBottom: 4, display: "flex", alignItems: "baseline", justifyContent: "space-between", fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <span style={{ fontWeight: 700, color: T.fg }}>{label}</span>
        <span style={{ color: T.mut }}>{value} <span>/ cohort {cohort}</span></span>
      </div>
      <div style={{ position: "relative", height: 8, borderRadius: 9999, background: T.border, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: "0 auto 0 0", height: "100%", width: `${value}%`, borderRadius: 9999, background: TALENT_AXIS_COLOR[axis] }} />
        <div aria-hidden style={{ position: "absolute", top: 0, height: "100%", width: 2, background: T.mut, left: `${cohort}%` }} />
      </div>
    </div>
  );
}

function RadarChartV2({ dna, cohort }: { dna: DnaShape; cohort: DnaShape }) {
  const size = 240, cx = size / 2, cy = size / 2, r = 100;
  const axes = [
    { key: "FYSISK", v: dna.fysisk, c: cohort.fysisk },
    { key: "TEKNIKK", v: dna.teknikk, c: cohort.teknikk },
    { key: "TAKTIKK", v: dna.taktikk, c: cohort.taktikk },
    { key: "MENTAL", v: dna.mental, c: cohort.mental },
    { key: "MOT.", v: dna.motivasjon, c: cohort.motivasjon },
  ];
  const N = axes.length;
  const angle = (i: number) => (Math.PI * 2 * i) / N - Math.PI / 2;
  const pt = (v: number, i: number) => {
    const rad = (v / 100) * r;
    return [cx + rad * Math.cos(angle(i)), cy + rad * Math.sin(angle(i))];
  };
  const path = (vals: number[]) => vals.map((v, i) => { const [x, y] = pt(v, i); return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`; }).join(" ") + " Z";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {[20, 40, 60, 80, 100].map((p) => (
        <polygon key={p} fill="none" stroke={T.border} strokeWidth={0.5} points={axes.map((_, i) => { const [x, y] = pt(p, i); return `${x.toFixed(1)},${y.toFixed(1)}`; }).join(" ")} />
      ))}
      {axes.map((_, i) => { const [x, y] = pt(100, i); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={T.border} strokeWidth={0.5} />; })}
      <path d={path(axes.map((a) => a.c))} fill="none" stroke={T.mut} strokeWidth={1.5} strokeDasharray="4 3" />
      <path d={path(axes.map((a) => a.v))} fill={T.lime} fillOpacity={0.3} stroke={T.lime} strokeWidth={2} />
      {axes.map((a, i) => {
        const labelR = r + 18;
        const lx = cx + labelR * Math.cos(angle(i));
        const ly = cy + labelR * Math.sin(angle(i));
        return <text key={a.key} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontFamily={T.mono} fill={T.mut} style={{ letterSpacing: "0.08em" }}>{a.key}</text>;
      })}
    </svg>
  );
}

function ProgressRingV2({ pct }: { pct: number }) {
  const size = 52, stroke = 5, r = (size - stroke) / 2, C = 2 * Math.PI * r, offset = C - (pct / 100) * C;
  return (
    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.border} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.lime} strokeWidth={stroke} strokeDasharray={C} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.lime }}>{pct} %</div>
    </div>
  );
}

const RELATIONS = [
  { value: "FATHER", label: "Far" },
  { value: "MOTHER", label: "Mor" },
  { value: "GUARDIAN", label: "Verge / annen foresatt" },
] as const;

function InviteForelderArkV2({ playerId, playerName, onLukk }: { playerId: string; playerName: string; onLukk: () => void }) {
  const [email, setEmail] = useState("");
  const [relation, setRelation] = useState<string>("GUARDIAN");
  const [feil, setFeil] = useState<string | null>(null);
  const [sendt, setSendt] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit() {
    setFeil(null);
    startTransition(async () => {
      const res = await inviterForelderForSpiller({ playerId, email, relation: relation as "FATHER" | "MOTHER" | "GUARDIAN" });
      if (!res.ok) {
        setFeil(res.error);
        return;
      }
      setSendt(true);
    });
  }

  if (sendt) {
    return (
      <BunnArk tittel="Inviter forelder" onLukk={onLukk} bredde={440}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: 14, fontFamily: T.ui, fontSize: 13, color: T.fg }}>
            Invitasjon sendt til <strong>{email}</strong>. Forelderen får en e-post med en lenke som er gyldig i 7 dager, og kobles til {playerName} når den godtas.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Knapp onClick={onLukk}>Lukk</Knapp>
          </div>
        </div>
      </BunnArk>
    );
  }

  return (
    <BunnArk tittel="Inviter forelder" onLukk={onLukk} laast={pending} bredde={440}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Inndata label="E-postadresse" value={email} onChange={setEmail} placeholder="forelder@eksempel.no" type="email" />
        <Velger label="Relasjon" value={relation} onChange={setRelation} options={RELATIONS.map((r) => ({ value: r.value, label: r.label }))} />
        {feil && <div role="alert" style={{ borderRadius: 8, background: `color-mix(in srgb, ${T.down} 12%, transparent)`, padding: "8px 12px", fontFamily: T.ui, fontSize: 12.5, color: T.down }}>{feil}</div>}
        <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>Forelderen får en e-post med en lenke som er gyldig i 7 dager.</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Knapp ghost onClick={onLukk} disabled={pending}>Avbryt</Knapp>
          <Knapp onClick={submit} disabled={pending || !email}>{pending ? "Sender…" : "Send invitasjon"}</Knapp>
        </div>
      </div>
    </BunnArk>
  );
}

export function AdminSpillerFullProfilV2({ playerId, playerName, fakta, foreldre, dna, cohort, aktiveMaal, skader, coachVurdering }: SpillerFullProfilV2Data) {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Link href={`/admin/spillere/${playerId}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel2, padding: "6px 14px", textDecoration: "none", color: T.mut, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <Icon name="arrow-left" size={12} />Tilbake til {playerName}
        </Link>
        <div style={{ marginTop: 14, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
          <Tittel em="profil">Spiller-</Tittel>
          <Link href={`/admin/spillere/${playerId}/rediger`} style={{ display: "inline-flex", flex: "none", alignItems: "center", gap: 6, borderRadius: 9999, background: T.lime, padding: "10px 18px", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.onLime, textDecoration: "none" }}>
            <Icon name="pencil" size={14} />Rediger
          </Link>
        </div>
      </div>

      <Kort eyebrow="Personalia">
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, marginBottom: 14 }}>Stamdata</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px 24px" }}>
          <Fact label="Fullt navn" value={fakta.fulltNavn} />
          <Fact label="E-post" value={fakta.epost} mono />
          <Fact label="Fødselsdato" value={fakta.fodselsdatoTekst} />
          <Fact label="Telefon" value={fakta.telefon} mono />
          <Fact label="Hjemmeklubb" value={fakta.hjemmeklubb} />
          <Fact label="Skole" value={fakta.skole} />
          <Fact label="Spilte år" value={fakta.spilteAar} />
          <Fact label="Ambisjon" value={fakta.ambisjon} />
        </div>
      </Kort>

      <Kort eyebrow="Forelder / verge" action={<Knapp ghost onClick={() => setInviteOpen(true)}>+ Legg til forelder</Knapp>}>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, marginBottom: 14 }}>Foresatte</div>
        {foreldre.length === 0 ? (
          <div style={{ borderRadius: 10, border: `1px dashed ${T.border}`, padding: 16, fontFamily: T.ui, fontSize: 13, color: T.mut }}>Ingen foresatte registrert.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {foreldre.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel2, padding: 14 }}>
                <AvatarFoto src={p.avatarUrl} navn={p.navn} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{p.navn}</div>
                  <div style={{ marginTop: 2, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>{p.relasjon}</div>
                  <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: 11, color: T.mut }}>{p.kontakt}</div>
                  <div style={{ marginTop: 8 }}><StatusPill tone="info">Stripe-betaler</StatusPill></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Kort>

      <Kort eyebrow="Spiller-DNA">
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, marginBottom: 14 }}>5-akset profil</div>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 280px) 1fr", gap: 24, alignItems: "center" }}>
          <RadarChartV2 dna={dna} cohort={cohort} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <DnaAxisRow label="FYSISK" value={dna.fysisk} cohort={cohort.fysisk} axis="fysisk" />
            <DnaAxisRow label="TEKNIKK" value={dna.teknikk} cohort={cohort.teknikk} axis="teknikk" />
            <DnaAxisRow label="TAKTIKK" value={dna.taktikk} cohort={cohort.taktikk} axis="taktikk" />
            <DnaAxisRow label="MENTAL" value={dna.mental} cohort={cohort.mental} axis="mental" />
            <DnaAxisRow label="MOT." value={dna.motivasjon} cohort={cohort.motivasjon} axis="motivasjon" />
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 16, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 8, borderRadius: 9999, background: T.lime }} />Spilleren</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 8, borderRadius: 9999, background: T.mut }} />Cohort-snitt</span>
            </div>
          </div>
        </div>
      </Kort>

      <Kort eyebrow="Aktive mål" action={<Caps size={9}>{aktiveMaal.length}</Caps>}>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, marginBottom: 14 }}>Pågående målbilder</div>
        {aktiveMaal.length === 0 ? (
          <div style={{ borderRadius: 10, border: `1px dashed ${T.border}`, padding: 16, fontFamily: T.ui, fontSize: 13, color: T.mut }}>Ingen aktive mål.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            {aktiveMaal.map((g) => (
              <div key={g.id} style={{ borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel2, padding: 14 }}>
                <StatusPill tone="info">{g.typeLabel}</StatusPill>
                <div style={{ marginTop: 8, fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{g.tittel}</div>
                <ProgressRingV2 pct={50} />
                {g.fristTekst && <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>Frist: {g.fristTekst}</div>}
              </div>
            ))}
          </div>
        )}
      </Kort>

      <Kort eyebrow="Skader / permisjoner">
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, marginBottom: 14 }}>Historikk</div>
        {skader.length === 0 ? (
          <div style={{ borderRadius: 10, border: `1px dashed ${T.border}`, padding: 16, fontFamily: T.ui, fontSize: 13, color: T.mut }}>Ingen registrerte hendelser.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.ui, fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  {["Årsak", "Fra", "Til", "Beskrivelse", "Status"].map((h) => <th key={h} style={{ padding: "0 14px 8px 0" }}><Caps size={9}>{h}</Caps></th>)}
                </tr>
              </thead>
              <tbody>
                {skader.map((l) => (
                  <tr key={l.id} style={{ borderTop: `1px solid ${T.border}` }}>
                    <td style={{ padding: "8px 14px 8px 0", fontWeight: 600, color: T.fg }}>{l.aarsak}</td>
                    <td style={{ padding: "8px 14px 8px 0", fontFamily: T.mono, fontSize: 11.5, color: T.mut }}>{l.fraTekst}</td>
                    <td style={{ padding: "8px 14px 8px 0", fontFamily: T.mono, fontSize: 11.5, color: T.mut }}>{l.tilTekst}</td>
                    <td style={{ padding: "8px 14px 8px 0", color: T.fg }}>{l.beskrivelse}</td>
                    <td style={{ padding: "8px 0" }}><StatusPill tone="info">{l.statusLabel}</StatusPill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Kort>

      <Kort style={{ position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", left: 0, top: 0, height: "100%", width: 5, background: T.lime }} />
        <div style={{ paddingLeft: 12 }}>
          <Caps size={9}>Coachens vurdering</Caps>
          {coachVurdering ? (
            <>
              <blockquote style={{ marginTop: 14, fontFamily: T.disp, fontStyle: "italic", fontSize: 19, lineHeight: 1.5, color: T.fg }}>«{coachVurdering.tekst}»</blockquote>
              <div style={{ marginTop: 14, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>{coachVurdering.forfatterTekst}</div>
            </>
          ) : (
            <p style={{ marginTop: 14, fontFamily: T.ui, fontSize: 13, color: T.mut }}>Ingen vurdering registrert ennå.</p>
          )}
        </div>
      </Kort>

      {inviteOpen && <InviteForelderArkV2 playerId={playerId} playerName={playerName} onLukk={() => setInviteOpen(false)} />}
    </div>
  );
}
