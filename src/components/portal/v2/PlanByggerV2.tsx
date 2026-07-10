"use client";

/**
 * PLAN-BYGGER V2 — 5-stegs wizard (Mål → Mal → Generer → Juster → Lagre).
 * Port av godkjent mockup ui_kits/v2/phq-plan-bygger.jsx (10. juli, retning C).
 * Komponert kun av v2-primitiver. Produktregler: AI foreslår, sperrer aldri ·
 * mennesket lagrer/godkjenner (DRAFT → PENDING_PLAYER) · GRATIS ser forslag
 * men kan ikke lagre (gaten bor i lib/plan-builder) · klarspråk, aldri fagkoder.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import {
  T,
  Icon,
  Kort,
  Caps,
  Tittel,
  Knapp,
  KpiFlis,
  PillVelger,
  StatusPill,
  AkseChip,
  Rad,
  FordelingHode,
  FordelingRad,
  InnsiktChip,
} from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";
import type {
  ByggerKontekst,
  ByggerMaltype,
  AnbefalingerResultat,
  GenerertForslag,
  LagrePlanInput,
} from "@/lib/plan-builder";
import type { PlanForslag, OktDag } from "@/lib/ai-plan/schema";

export interface PlanByggerV2Actions {
  anbefalMal: (input: { maltype: ByggerMaltype; turneringId?: string | null }) => Promise<AnbefalingerResultat>;
  genererPlanForslag: (input: {
    maltype: ByggerMaltype;
    turneringId?: string | null;
    egendefinertTekst?: string;
  }) => Promise<{ ok: true; forslag: GenerertForslag } | { ok: false; error: string }>;
  lagrePlan: (input: LagrePlanInput) => Promise<{ ok: true; planId: string } | { ok: false; error: string }>;
}

export interface PlanByggerV2Props {
  kontekst: ByggerKontekst;
  actions: PlanByggerV2Actions;
}

const STEG = [
  { n: 1, l: "Mål" },
  { n: 2, l: "Mal" },
  { n: 3, l: "Generer" },
  { n: 4, l: "Juster" },
  { n: 5, l: "Lagre" },
] as const;

const DAG_LABEL: Record<OktDag, string> = {
  MAN: "Man", TIR: "Tir", ONS: "Ons", TOR: "Tor", FRE: "Fre", LOR: "Lør", SON: "Søn",
};

const TYPE_TIL_AKSE: Record<string, AkseKey> = {
  RANGE: "TEK", NARESPILL: "TEK", PUTTING: "TEK", SPILL: "SPILL", FYSISK: "FYS", MENTAL: "SPILL",
};

const AKSE_KODER: AkseKey[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

function nesteMandag(): string {
  const d = new Date();
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() + ((7 - dow) % 7 || 7));
  return d.toISOString().slice(0, 10);
}

const inputStyle: CSSProperties = {
  width: "100%", boxSizing: "border-box", appearance: "none",
  background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 10,
  padding: "9px 11px", color: T.fg, fontFamily: T.ui, fontSize: 13, outline: "none",
};

/* Steg-rad — lokal inntil gjenbruk (v2-core-kandidat «StegRad», jf. mockup). */
function StegRad({ steg, onVelg }: { steg: number; onVelg: (n: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
      {STEG.map((s) => {
        const aktiv = s.n === steg;
        const ferdig = s.n < steg;
        return (
          <button
            key={s.n}
            type="button"
            onClick={() => s.n < steg && onVelg(s.n)}
            className="v2-focus"
            style={{
              appearance: "none", cursor: ferdig ? "pointer" : "default", flex: "1 0 auto",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
              padding: "9px 13px", borderRadius: 9999,
              border: `1px solid ${aktiv ? "transparent" : T.border}`,
              background: aktiv ? T.lime : T.panel,
              color: aktiv ? T.onLime : ferdig ? T.fg : T.mut,
            }}
          >
            <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700 }}>
              {ferdig ? <Icon name="check" size={11} /> : s.n}
            </span>
            <span style={{ fontFamily: T.ui, fontSize: 11.5, fontWeight: 600 }}>{s.l}</span>
          </button>
        );
      })}
    </div>
  );
}

const MAALTYPER: { id: ByggerMaltype; icon: string; t: string }[] = [
  { id: "TURNERING", icon: "trophy", t: "Mot en turnering" },
  { id: "SVAKHET", icon: "crosshair", t: "Angrip svakheten" },
  { id: "GENERELL", icon: "layers", t: "Balansert utvikling" },
  { id: "EGENDEFINERT", icon: "pen-line", t: "Beskriv selv" },
];

export function PlanByggerV2({ kontekst, actions }: PlanByggerV2Props) {
  const router = useRouter();
  const [steg, setSteg] = useState(1);
  const [maltype, setMaltype] = useState<ByggerMaltype>(
    kontekst.kommendeTurneringer.length > 0 ? "TURNERING" : "GENERELL",
  );
  const [turneringId, setTurneringId] = useState<string | null>(
    kontekst.kommendeTurneringer[0]?.id ?? null,
  );
  const [egenTekst, setEgenTekst] = useState("");
  const [anbefaling, setAnbefaling] = useState<AnbefalingerResultat | null>(null);
  const [anbefalingLaster, setAnbefalingLaster] = useState(false);
  const [genererLaster, setGenererLaster] = useState(false);
  const [forslag, setForslag] = useState<GenerertForslag | null>(null);
  const [uke, setUke] = useState(1);
  const [startDato, setStartDato] = useState(nesteMandag());
  const [status, setStatus] = useState<"DRAFT" | "PENDING_COACH">("DRAFT");
  const [lagrer, setLagrer] = useState(false);
  const [lagretPlanId, setLagretPlanId] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);

  const maalBeskrivelse: Record<ByggerMaltype, string> = {
    TURNERING:
      kontekst.kommendeTurneringer.length > 0
        ? `Skarphet og nedtrapping frem mot neste start — ${kontekst.kommendeTurneringer[0].navn}.`
        : "Skarphet og nedtrapping frem mot neste turnering.",
    SVAKHET: kontekst.svakhet
      ? `${kontekst.svakhet.skillArea} koster deg mest akkurat nå. Bygg planen rundt det.`
      : "Planen bygges rundt området som koster deg mest slag.",
    GENERELL: "Følg standardplanen for nivået ditt og perioden du er i.",
    EGENDEFINERT: "Skriv med egne ord hva du vil trene — planen bygges rundt det.",
  };

  const tilMalSteg = async () => {
    setSteg(2);
    setFeil(null);
    if (!anbefaling) {
      setAnbefalingLaster(true);
      try {
        setAnbefaling(await actions.anbefalMal({ maltype, turneringId }));
      } catch {
        setFeil("Kunne ikke hente mal-anbefaling.");
      }
      setAnbefalingLaster(false);
    }
  };

  const generer = async () => {
    if (genererLaster) return;
    setGenererLaster(true);
    setFeil(null);
    const res = await actions.genererPlanForslag({
      maltype,
      turneringId,
      egendefinertTekst: maltype === "EGENDEFINERT" ? egenTekst : undefined,
    });
    setGenererLaster(false);
    if (res.ok) {
      setForslag(res.forslag);
      setUke(1);
      setSteg(4);
    } else {
      setFeil(res.error);
    }
  };

  const fjernOkt = (idx: number) => {
    if (!forslag) return;
    const okter = forslag.forslag.okter.filter((_, i) => i !== idx);
    setForslag({ ...forslag, forslag: { ...forslag.forslag, okter } });
  };

  const lagre = async () => {
    if (!forslag || lagrer) return;
    setLagrer(true);
    setFeil(null);
    const res = await actions.lagrePlan({
      generationId: forslag.generationId,
      forslag: forslag.forslag,
      status,
      startDato,
    });
    setLagrer(false);
    if (res.ok) {
      setLagretPlanId(res.planId);
      router.refresh();
    } else {
      setFeil(res.error);
    }
  };

  const f: PlanForslag | null = forslag?.forslag ?? null;
  const ukeOkter = f ? f.okter.map((o, idx) => ({ ...o, idx })).filter((o) => o.uke === uke) : [];
  const ukeValg = f
    ? [...new Set(f.okter.map((o) => o.uke))].sort((a, b) => a - b).map((u) => ({ v: String(u), l: `Uke ${u}` }))
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps>Planlegge · Plan-bygger</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="plan.">Bygg en</Tittel>
          </div>
        </div>
        <Caps size={9} color={T.mut}>Steg {steg} av 5</Caps>
      </div>

      <StegRad steg={steg} onVelg={setSteg} />

      {steg === 1 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: T.gap }}>
            {MAALTYPER.map((m) => {
              const on = maltype === m.id;
              return (
                <div key={m.id} onClick={() => setMaltype(m.id)} style={{ cursor: "pointer" }}>
                  <Kort style={{ border: `1px solid ${on ? "rgba(209,248,67,0.45)" : T.border}`, height: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 34, height: 34, borderRadius: 10, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", background: on ? "rgba(209,248,67,0.14)" : T.panel2 }}>
                        <Icon name={m.icon} size={15} style={{ color: on ? T.lime : T.fg2 }} />
                      </span>
                      <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg, flex: 1 }}>{m.t}</span>
                      {on && <Icon name="check" size={15} style={{ color: T.lime }} />}
                    </div>
                    <p style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.55, margin: "9px 0 0" }}>
                      {maalBeskrivelse[m.id]}
                    </p>
                  </Kort>
                </div>
              );
            })}
          </div>

          {maltype === "TURNERING" && kontekst.kommendeTurneringer.length > 0 && (
            <Kort eyebrow="Hvilken turnering?">
              {kontekst.kommendeTurneringer.map((t, i) => (
                <Rad
                  key={t.id}
                  title={t.navn}
                  sub={t.dato ?? "dato ikke satt"}
                  meta={turneringId === t.id ? <StatusPill>Valgt</StatusPill> : undefined}
                  trailing={null}
                  onClick={() => setTurneringId(t.id)}
                  last={i === kontekst.kommendeTurneringer.length - 1}
                />
              ))}
            </Kort>
          )}

          {maltype === "EGENDEFINERT" && (
            <Kort eyebrow="Hva vil du trene?">
              <textarea
                value={egenTekst}
                onChange={(e) => setEgenTekst(e.target.value)}
                placeholder="F.eks. «Jeg vil bli tryggere på nærspill fra 30–60 meter og putte bedre under press»"
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </Kort>
          )}
        </>
      )}

      {steg === 2 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: T.gap, alignItems: "start" }}>
          {anbefalingLaster ? (
            <Kort><span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>Finner malen som passer deg best …</span></Kort>
          ) : anbefaling?.anbefalt ? (
            <Kort
              tint
              eyebrow={`Anbefalt for deg · nivå ${anbefaling.anbefalt.kategori} · ${anbefaling.anbefalt.lPhase.toLowerCase()}`}
              action={<StatusPill tone="up">Godkjent av coach</StatusPill>}
            >
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, color: T.fg }}>{anbefaling.anbefalt.navn}</div>
              {anbefaling.anbefalt.beskrivelse && (
                <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "8px 0 0" }}>
                  {anbefaling.anbefalt.beskrivelse}
                </p>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: T.gap, margin: "14px 0" }}>
                <KpiFlis label="Varighet" value={`${anbefaling.anbefalt.varighetUker} uker`} />
                <KpiFlis label="Økter per uke" value={String(anbefaling.anbefalt.ukentligOktAntall)} />
              </div>
              <FordelingHode />
              {AKSE_KODER.map((a, i) => {
                const pct = Math.round(((anbefaling.anbefalt!.disciplinFordeling[a] ?? 0) * 100));
                return <FordelingRad key={a} code={a} pct={pct} value={`${pct} %`} last={i === AKSE_KODER.length - 1} />;
              })}
            </Kort>
          ) : (
            <Kort>
              <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>
                Ingen mal matcher nivået ditt ennå — planen bygges fra grunnen av etter metodikken.
              </span>
            </Kort>
          )}
          <Kort eyebrow="Andre maler for nivået ditt">
            {(anbefaling?.alternativer ?? []).length > 0 ? (
              anbefaling!.alternativer.map((a, i) => (
                <Rad
                  key={a.templateId}
                  title={a.navn}
                  sub={`${a.varighetUker} uker · ${a.ukentligOktAntall} økter/uke`}
                  meta={<Caps size={9}>{a.usageCount} har brukt</Caps>}
                  trailing={null}
                  last={i === anbefaling!.alternativer.length - 1}
                />
              ))
            ) : (
              <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>Ingen andre maler for nivået ennå.</span>
            )}
            <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.55, margin: "12px 0 0" }}>
              Perioden din fremhever anbefalingen — men alle maler kan velges. Anbefalinger sperrer aldri.
            </p>
          </Kort>
        </div>
      )}

      {steg === 3 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: T.gap, alignItems: "start" }}>
          <Kort eyebrow="Hva skjer nå">
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg }}>Planen fylles med innhold</div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "8px 0 0" }}>
              Strukturen kommer fra standardplanen for nivået ditt. AI-en velger øvelser fra øvelsesbanken
              og tilpasser planen til målet ditt, fokusområdet fra coach og hvor mye du faktisk har trent.
            </p>
            <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
              <StatusPill tone="up">Kun øvelser fra øvelsesbanken</StatusPill>
              <StatusPill>Du godkjenner alt</StatusPill>
            </div>
            <div style={{ marginTop: 16 }}>
              <Knapp icon="sparkles" onClick={generer} disabled={genererLaster}>
                {genererLaster ? "Genererer …" : "Generer plan"}
              </Knapp>
            </div>
          </Kort>
          <InnsiktChip>
            Genereringen tar gjerne et halvt minutt. Får vi ikke kontakt med AI-en, sier vi tydelig fra — da kan du bruke standardplanen direkte fra Workbench i stedet.
          </InnsiktChip>
        </div>
      )}

      {steg === 4 && f && (
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, color: T.fg }}>{f.navn}</div>
              <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2 }}>
                {f.periodeUker} uker · {f.okter.length} økter
              </span>
            </div>
            {ukeValg.length > 1 && (
              <PillVelger options={ukeValg} value={String(uke)} onChange={(v) => setUke(Number(v))} />
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: T.gap, alignItems: "start" }}>
            <Kort eyebrow={`Uke ${uke} · ${ukeOkter.length} ${ukeOkter.length === 1 ? "økt" : "økter"}`}>
              {ukeOkter.length > 0 ? (
                ukeOkter.map((o, i) => (
                  <Rad
                    key={o.idx}
                    leading={
                      <span style={{ width: 34, flex: "none", fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut }}>
                        {DAG_LABEL[o.dag]}
                      </span>
                    }
                    title={o.fokus}
                    sub={`${o.varighetMin} min · ${o.drills.length} ${o.drills.length === 1 ? "øvelse" : "øvelser"}`}
                    meta={<AkseChip a={TYPE_TIL_AKSE[o.type] ?? "TEK"} />}
                    trailing={
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); fjernOkt(o.idx); }}
                        title="Fjern økt"
                        style={{ appearance: "none", cursor: "pointer", background: "none", border: "none", padding: 4, display: "inline-flex" }}
                      >
                        <Icon name="x" size={13} style={{ color: T.mut }} />
                      </button>
                    }
                    last={i === ukeOkter.length - 1}
                  />
                ))
              ) : (
                <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>Ingen økter igjen denne uka.</span>
              )}
            </Kort>
            <Kort eyebrow="Om planen">
              {f.beskrivelse && (
                <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: 0 }}>{f.beskrivelse}</p>
              )}
              {f.fokusOmrader.length > 0 && (
                <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                  {f.fokusOmrader.map((o) => (
                    <StatusPill key={o}>{o}</StatusPill>
                  ))}
                </div>
              )}
              <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.55, margin: "12px 0 0" }}>
                Fjern økter som ikke passer — resten justerer du i Workbench etter lagring. Dette er forslag, aldri krav.
              </p>
            </Kort>
          </div>
        </div>
      )}

      {steg === 4 && !f && (
        <Kort>
          <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>
            Ingen plan er generert ennå — gå tilbake til steg 3 og trykk «Generer plan».
          </span>
        </Kort>
      )}

      {steg === 5 && (
        lagretPlanId ? (
          <Kort tint eyebrow="Planen er lagret">
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg }}>
              {status === "DRAFT" ? "Utkastet ligger klart." : "Planen er sendt til godkjenning."}
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "8px 0 14px" }}>
              {status === "DRAFT"
                ? "Du finner den under Planlegge — aktiver den når du er klar."
                : "Anders Kristiansen får planen til gjennomsyn og aktiverer den sammen med deg."}
            </p>
            <Knapp icon="arrow-right" onClick={() => router.push("/portal/planlegge/workbench")}>
              Åpne Workbench
            </Knapp>
          </Kort>
        ) : f ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: T.gap, alignItems: "start" }}>
            <Kort tint eyebrow="Klar til lagring">
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg }}>{f.navn}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: T.gap, margin: "12px 0 14px" }}>
                <KpiFlis label="Varighet" value={`${f.periodeUker} uker`} />
                <KpiFlis label="Økter" value={String(f.okter.length)} />
              </div>
              <Caps size={9}>Startdato</Caps>
              <div style={{ margin: "8px 0 12px" }}>
                <input type="date" value={startDato} onChange={(e) => setStartDato(e.target.value)} style={inputStyle} />
              </div>
              <Caps size={9}>Hva vil du gjøre?</Caps>
              <div style={{ marginTop: 8 }}>
                <PillVelger
                  options={[{ v: "DRAFT", l: "Lagre som utkast" }, { v: "PENDING_COACH", l: "Send til coach" }]}
                  value={status}
                  onChange={(v) => setStatus(v as "DRAFT" | "PENDING_COACH")}
                />
              </div>
              <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.55, margin: "10px 0 14px" }}>
                {status === "DRAFT"
                  ? "Utkastet ligger hos deg til du aktiverer det — ingenting planlegges før du sier fra."
                  : "Anders Kristiansen får planen til gjennomsyn og aktiverer den sammen med deg."}
              </p>
              <Knapp icon="check" onClick={lagre} disabled={lagrer}>
                {lagrer ? "Lagrer …" : status === "DRAFT" ? "Lagre plan" : "Send til godkjenning"}
              </Knapp>
            </Kort>
            {kontekst.spiller.tier === "GRATIS" && (
              <Kort eyebrow="Abonnement">
                <div style={{ display: "flex", gap: 9 }}>
                  <Icon name="lock" size={14} style={{ color: T.mut, flex: "none", marginTop: 2 }} />
                  <p style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.6, margin: 0 }}>
                    Med gratis tilgang kan du se og prøve forslag, men ikke lagre planen.
                    Oppgrader til PlayerHQ (299 kr/mnd) — eller tren med coach, så er alt inkludert.
                  </p>
                </div>
              </Kort>
            )}
          </div>
        ) : (
          <Kort>
            <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>
              Ingen plan å lagre ennå — generer planen i steg 3 først.
            </span>
          </Kort>
        )
      )}

      {feil && <span style={{ fontFamily: T.ui, fontSize: 12, color: T.down }}>{feil}</span>}

      {!lagretPlanId && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ visibility: steg === 1 ? "hidden" : "visible" }}>
            <Knapp ghost icon="arrow-left" onClick={() => setSteg(Math.max(1, steg - 1))}>
              Tilbake
            </Knapp>
          </span>
          {steg === 1 && <Knapp icon="arrow-right" onClick={tilMalSteg}>Neste</Knapp>}
          {steg === 2 && <Knapp icon="arrow-right" onClick={() => setSteg(3)}>Neste</Knapp>}
          {steg === 4 && f && <Knapp icon="arrow-right" onClick={() => setSteg(5)}>Neste</Knapp>}
        </div>
      )}
    </div>
  );
}
