import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Minus, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { kategoriFraSnittscore } from "@/lib/domain/ak-kategori";
import { formaterHcp } from "@/lib/domain/hcp";
import {
  hentTnRangliste,
  hentTnSpillerAktivePlaner,
  hentTnSpillerAnalyseHub,
  hentTnSpillerProfil,
  hentTnSpillerstatuser,
  hentTnSpillerTester,
  hentTnSpillerTilgang,
} from "@/lib/domain/tn-arbeidsflate";
import { krevTnTrenerflate } from "@/lib/domain/tn-flate-tilgang";
import { hentSpillerpostTidslinje } from "@/lib/domain/tn-post";
import { alderFraFodselsdato } from "@/lib/forelder";
import { TN } from "@/lib/v2/team-norway";
import { SkjermRamme, datoKort, datoLang, osloDag, periode } from "../skjermer/felles";
import { TnFlate, TnFlatehode, TnFotnote, TnMangler, TnSkjermhode } from "../tn-flate";
import { LISENS_TEKST, TnAvsluttSpiller } from "../tn-redigering-skjema";
import { TN_RUTER, TN_SPILLERPROFIL_FANER, tnSpillerHref } from "../tn-ruter";
import { ForslagSkjema, SamtaleSkjema } from "@/components/oppfolging/oppfolging-skjema";
import { hentFireukerssjekker, hentForslag, hentSamtaler } from "@/lib/oppfolging/data";
import { FORSLAG_STATUS_NAVN, FORSLAG_TYPE_NAVN, SAMTALE_TYPE_NAVN, osloDagIso } from "@/lib/oppfolging/regler";
import { opprettTnForslag, opprettTnSamtale } from "@/app/team-norway/tn-oppfolging-actions";
import { hentUkeTid, hentUkensOkter } from "./data";
import { TERSKEL_PROSENT, underTerskelToUker } from "./etterlevelse";
import { SpillerVelger } from "./spiller-velger";
import { Fanerad, Initialplate, KpiRad, ManglerMerke, Primarlenke, etikett, mono } from "./ui";

/**
 * TN-02 Spillerprofil. Fasit: «Team Norway App.dc.html» (Claude Design bc3e41fc),
 * skjerm «spiller» med fanene Plan, Stats, Tester, IUP, Samtaler og Turneringer.
 *
 * Avvik (alle fordi modellen mangler, ingen tall er diktet opp):
 *   - Spillerne er gruppens aktive spillere. Tegningens «delt fra PlayerHQ» har
 *     ingen delingsmodell i koden ennå (se TN-19).
 *   - Klasse (Gutter U18, Damer …) står ikke: profilen har ikke kjønn. WAGR har
 *     ingen kilde og står med strek.
 *   - Stats: brutto snitt, runder og starter er årets offentlige resultater (samme
 *     regel som TN-16). Strokes gained er spillerens egne PlayerHQ-runder
 *     (analysehuben), ikke regnet mot feltet i turneringer. Fairways, GIR og
 *     putter per runde finnes ikke i turneringskilden og står med strek.
 *   - Tester: Team Norway-protokollene fra katalogen (tn-v3), ikke tegningens
 *     testliste. Landslagsnorm finnes ikke og står med strek.
 *   - IUP: bare delene som har data (personinfo, dokumentstatus, nivå, aktive
 *     planer og tester). Evaluering og teknisk plan har egne sider.
 *   - Samtaler, fireukerssjekker og «Forslag til spilleren» kommer fra tabellene
 *     `elev_samtaler`, `fireukerssjekker` og `trener_forslag` (Pakke 1). Spilleren
 *     godtar eller avviser i PlayerHQ; her står bare statusen.
 */

type Fane = (typeof TN_SPILLERPROFIL_FANER)[number]["id"];

export function lesFane(verdi: string | string[] | undefined): Fane {
  const v = Array.isArray(verdi) ? verdi[0] : verdi;
  return TN_SPILLERPROFIL_FANER.some((f) => f.id === v) ? (v as Fane) : "plan";
}

const snitt = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const tall1 = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const naivDag = new Intl.DateTimeFormat("nb-NO", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "UTC" });

function sgTekst(v: number | null): string {
  if (v === null) return "—";
  const tegn = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${tegn}${snitt.format(Math.abs(v))}`;
}

function akTekst(brutto: number | null | undefined): string {
  if (brutto === null || brutto === undefined) return "—";
  const b = kategoriFraSnittscore(brutto);
  return `${b.kategori} · ${b.niva}`;
}

function Seksjon({ tittel, merknad, children, flex }: { tittel: string; merknad?: ReactNode; children: ReactNode; flex?: string }) {
  return (
    <TnFlate style={flex ? { flex, minWidth: 0 } : undefined}>
      <TnFlatehode tittel={tittel} merknad={merknad} />
      {children}
    </TnFlate>
  );
}

type Statusrad = { tittel: string; tekst: string; merke: string; tone: "ok" | "varsel" | "ukjent" };

function Statuslinje({ rad }: { rad: Statusrad }) {
  const farge = rad.tone === "ok" ? TN.status.greenText : rad.tone === "varsel" ? TN.red600 : TN.textSecondary;
  const ikon = rad.tone === "ok" ? <Check size={18} aria-hidden /> : rad.tone === "varsel" ? <TriangleAlert size={18} aria-hidden /> : <Minus size={18} aria-hidden />;
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${TN.navy100}` }}>
      <span style={{ width: 36, height: 36, flex: "none", border: `1px solid ${TN.navy100}`, borderRadius: TN.radius.sm, display: "flex", alignItems: "center", justifyContent: "center", color: farge }}>{ikon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700 }}>{rad.tittel}</div>
        <div style={{ fontSize: 13, color: TN.textSecondary, marginTop: 2, overflowWrap: "anywhere" }}>{rad.tekst}</div>
      </div>
      <span style={{ ...mono(11, farge), letterSpacing: "0.06em", whiteSpace: "nowrap", textAlign: "right" }}>{rad.merke}</span>
    </div>
  );
}

function IupDel({ nr, tittel, meta, children, apen }: { nr: string; tittel: string; meta?: string; children: ReactNode; apen?: boolean }) {
  return (
    <details open={apen} style={{ borderTop: `1px solid ${TN.navy100}` }}>
      <summary style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 52, cursor: "pointer", color: TN.navy900, listStyle: "none" }}>
        <span style={{ ...mono(11, TN.textSecondary), width: 24, flex: "none" }}>{nr}</span>
        <span style={{ flex: 1, minWidth: 0, fontFamily: TN.font.display, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase" }}>{tittel}</span>
        {meta ? <span style={{ ...mono(11, TN.textSecondary), textAlign: "right" }}>{meta}</span> : null}
      </summary>
      <div style={{ padding: "0 0 18px clamp(0px, 3vw, 38px)" }}>{children}</div>
    </details>
  );
}

function Nokkelverdier({ par }: { par: [string, string][] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "12px 24px" }}>
      {par.map(([l, v]) => (
        <div key={l} style={{ minWidth: 0 }}>
          <div style={etikett}>{l}</div>
          <div style={{ fontSize: 14.5, lineHeight: 1.5, marginTop: 3, overflowWrap: "anywhere" }}>{v}</div>
        </div>
      ))}
    </div>
  );
}

function Fireledd({ a, b, c, d, hode }: { a: string; b: string; c: string; d?: string; hode?: boolean }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", padding: "10px 0", borderBottom: `1px solid ${TN.navy100}`, alignItems: "baseline" }}>
      <span style={{ flex: "1 1 200px", minWidth: 0, fontSize: 14, fontWeight: hode ? 400 : 700, color: hode ? TN.textSecondary : TN.ink900, overflowWrap: "anywhere" }}>{a}</span>
      <span style={{ flex: "1 1 150px", minWidth: 0, fontSize: 13.5, color: TN.ink700, overflowWrap: "anywhere" }}>{b}</span>
      <span style={{ flex: "0 0 auto", minWidth: 64, textAlign: "right", ...mono(12.5, hode ? TN.textSecondary : TN.ink900) }}>{c}</span>
      {d !== undefined ? <span style={{ flex: "0 0 auto", minWidth: 72, textAlign: "right", ...mono(12.5, TN.textSecondary) }}>{d}</span> : null}
    </div>
  );
}

export async function TnSpillerprofil({ spillerId, fane }: { spillerId: string; fane: Fane }) {
  const { bruker, kontekst } = await krevTnTrenerflate();
  const tilgang = await hentTnSpillerTilgang(bruker, spillerId);
  if (!tilgang) notFound();
  const naa = new Date();
  const aar = osloDag(naa).aar;

  const [profil, rangliste, tester, statuser] = await Promise.all([
    hentTnSpillerProfil(tilgang, aar),
    hentTnRangliste(bruker, aar),
    hentTnSpillerTester(bruker, spillerId),
    hentTnSpillerstatuser(bruker, kontekst, aar),
  ]);
  if (!profil) notFound();

  const spillere = (rangliste?.rader ?? []).map((r) => ({ id: r.id, navn: r.navn }));
  const rl = rangliste?.rader.find((r) => r.id === spillerId) ?? null;
  const brutto = profil.aaret?.bruttoSnitt ?? null;
  const alder = alderFraFodselsdato(profil.fodselsdato);
  const fornavn = profil.navn.split(" ")[0] ?? profil.navn;
  const testrader = tester?.rader ?? [];

  // Data per fane hentes bare når fanen er åpen.
  const lesK = { flate: "TEAM_NORWAY", groupId: kontekst.gruppe.id } as const;
  const [ukeTid, ukensOkter, planer, hub, poster, samtaler, forslag, sjekker] = await Promise.all([
    fane === "plan" ? hentUkeTid([spillerId], naa, 5) : Promise.resolve(null),
    fane === "plan" ? hentUkensOkter(spillerId, naa) : Promise.resolve(null),
    fane === "plan" || fane === "iup" ? hentTnSpillerAktivePlaner(tilgang) : Promise.resolve(null),
    fane === "stats" ? hentTnSpillerAnalyseHub(tilgang).catch(() => null) : Promise.resolve(null),
    fane === "sam" ? hentSpillerpostTidslinje(spillerId, bruker.id) : Promise.resolve(null),
    fane === "sam" ? hentSamtaler(lesK, spillerId).catch(() => null) : Promise.resolve(null),
    hentForslag(lesK, spillerId).catch(() => null),
    fane === "sam" ? hentFireukerssjekker(lesK, naa, spillerId).catch(() => null) : Promise.resolve(null),
  ]);
  const dagIso = osloDagIso(naa);
  const skjemaSpiller = [{ id: spillerId, navn: profil.navn }];

  const sgVerdier = hub?.sgAkser.map((a) => a.verdi) ?? [];
  const sgTotal = sgVerdier.length > 0 && sgVerdier.every((v): v is number => v !== null) ? sgVerdier.reduce((a, b) => a + b, 0) : null;

  const faner = TN_SPILLERPROFIL_FANER.map((f) => ({ id: f.id, navn: f.navn, href: `${tnSpillerHref(spillerId)}?fane=${f.id}` }));
  const merLenker = [
    { href: `${tnSpillerHref(spillerId)}/post`, navn: "Post" },
    { href: `${tnSpillerHref(spillerId)}/tester`, navn: "Alle tester" },
    { href: `${tnSpillerHref(spillerId)}/analyse`, navn: "Analyse" },
    { href: `${tnSpillerHref(spillerId)}/teknisk-plan`, navn: "Teknisk plan" },
    { href: `${tnSpillerHref(spillerId)}/evaluering`, navn: "Evaluering" },
    { href: `/team-norway/workbench?spiller=${encodeURIComponent(spillerId)}`, navn: "Plan i Workbench" },
  ];

  const reg = statuser.get(spillerId) ?? null;
  const helseDager = reg?.helseattestUtloper ? Math.floor((reg.helseattestUtloper.getTime() - naa.getTime()) / 864e5) : null;
  const status: Statusrad[] = [
    reg?.lisensStatus
      ? { tittel: `Lisens ${aar}`, tekst: `${LISENS_TEKST[reg.lisensStatus] ?? reg.lisensStatus}${reg.lisensBetaltDato ? ` ${datoLang(reg.lisensBetaltDato)}` : ""}`, merke: reg.lisensStatus === "UBETALT" ? "MANGLER" : "GYLDIG", tone: reg.lisensStatus === "UBETALT" ? "varsel" : "ok" }
      : { tittel: `Lisens ${aar}`, tekst: "Ikke registrert i Lisens og økonomi.", merke: "IKKE REGISTRERT", tone: "ukjent" },
    reg?.helseattestUtloper && helseDager !== null
      ? { tittel: "Helseattest", tekst: `Utløper ${datoLang(reg.helseattestUtloper)}`, merke: helseDager < 0 ? "UTLØPT" : helseDager <= 30 ? `FRIST ${datoKort(reg.helseattestUtloper)}` : "GYLDIG", tone: helseDager <= 30 ? "varsel" : "ok" }
      : { tittel: "Helseattest", tekst: "Ikke registrert i Lisens og økonomi.", merke: "IKKE REGISTRERT", tone: "ukjent" },
    reg?.antidopingSignert
      ? { tittel: "Antidoping-samtykke", tekst: `Signert ${datoLang(reg.antidopingSignert)}`, merke: "SIGNERT", tone: "ok" }
      : { tittel: "Antidoping-samtykke", tekst: "Ikke registrert i Lisens og økonomi.", merke: "IKKE REGISTRERT", tone: "ukjent" },
  ];

  const plan = planer?.[0] ?? null;
  const planUker = plan && plan.sluttDato ? Math.max(1, Math.ceil((plan.sluttDato.getTime() - plan.startDato.getTime()) / (7 * 864e5))) : null;
  const planUke = plan && planUker ? Math.min(planUker, Math.max(1, Math.floor((naa.getTime() - plan.startDato.getTime()) / (7 * 864e5)) + 1)) : null;
  const planPst = planUke && planUker ? Math.round((planUke / planUker) * 100) : null;
  const flagg = ukeTid ? underTerskelToUker(ukeTid.get(spillerId) ?? []) : false;

  return (
    <SkjermRamme aktiv="spiller" brukerNavn={bruker.name} kontekst={kontekst}>
      <TnSkjermhode
        rute={tnSpillerHref(spillerId)}
        tittel="Spillerprofil"
        ingress="Det spilleren har i PlayerHQ: plan, stats, tester, IUP, samtaler og turneringer."
        handling={kontekst.kanAdministrere ? <TnAvsluttSpiller spillerId={spillerId} navn={profil.navn} /> : undefined}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 20px", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ flex: "0 1 380px", minWidth: 0 }}>
          <SpillerVelger valgt={spillerId} fane={fane} spillere={spillere.length > 0 ? spillere : [{ id: spillerId, navn: profil.navn }]} />
        </div>
        <span style={{ ...mono(11, TN.textSecondary), letterSpacing: "0.04em", overflowWrap: "anywhere", minWidth: 0 }}>MEDLEM AV {kontekst.gruppe.name.toUpperCase()}</span>
      </div>

      <TnFlate style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
        <Initialplate navn={profil.navn} storrelse={88} />
        <div style={{ flex: "1 1 220px", minWidth: 0 }}>
          <div style={etikett}>{kontekst.gruppe.name} · {profil.klubb ?? "Klubb ikke registrert"}</div>
          <div style={{ fontFamily: TN.font.display, fontWeight: 300, fontSize: "clamp(22px, 2.4vw, 28px)", letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.15, marginTop: 6, color: TN.navy900, overflowWrap: "anywhere" }}>{profil.navn}</div>
          <div style={{ fontSize: 14, color: TN.textSecondary, marginTop: 6, overflowWrap: "anywhere" }}>
            {alder !== null ? `${alder} år` : "Alder ikke registrert"} · {profil.skole ?? "Skole ikke registrert"} · AK {akTekst(brutto)}
          </div>
        </div>
        <div style={{ flex: "1 1 340px", minWidth: 0 }}>
          <KpiRad min={70} stor={20} tall={[
            { etikett: "HCP", verdi: formaterHcp(profil.hcp) },
            { etikett: "Brutto snitt", verdi: brutto !== null ? snitt.format(brutto) : "—" },
            { etikett: "Runder i år", verdi: profil.aaret ? String(profil.aaret.runder) : "—" },
            { etikett: "WAGR", verdi: "—" },
          ]} />
        </div>
      </TnFlate>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <Fanerad etikett="Spillerprofil" faner={faner} aktiv={fane} />
        <nav aria-label="Mer om spilleren" style={{ display: "flex", flexWrap: "wrap", gap: "0 18px", paddingTop: 6 }}>
          {merLenker.map((l) => (
            <Link key={l.href} href={l.href} style={{ minHeight: 44, display: "inline-flex", alignItems: "center", color: TN.navy900, fontSize: 13.5 }}>{l.navn}</Link>
          ))}
        </nav>
      </div>

      {fane === "plan" ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
          <Seksjon tittel="Aktiv plan" merknad="FRA PLAYERHQ" flex="1 1 340px">
            <div style={{ fontFamily: TN.font.display, fontWeight: 300, fontSize: 22, letterSpacing: "0.06em", textTransform: "uppercase", color: TN.navy900, marginTop: 16, lineHeight: 1.25, overflowWrap: "anywhere" }}>{plan ? plan.navn : "Ingen aktiv plan"}</div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 10, ...mono(12, TN.textSecondary) }}>
              <span>{plan && planUke && planUker ? `Uke ${planUke} av ${planUker}` : plan ? `Fra ${datoLang(plan.startDato)}` : "—"}</span>
              <span>{planPst !== null ? `${planPst} %` : "—"}</span>
            </div>
            <div style={{ height: 6, background: TN.navy100, borderRadius: TN.radius.sm, marginTop: 8, overflow: "hidden" }}>
              <div style={{ width: `${planPst ?? 0}%`, height: "100%", background: TN.navy900 }} />
            </div>
            <div style={{ ...etikett, marginTop: 24, paddingBottom: 6, borderBottom: `1px solid ${TN.navy100}` }}>Planlagt mot gjennomført tid</div>
            {(ukeTid?.get(spillerId) ?? []).map((u) => {
              const lav = u.prosent !== null && u.prosent < TERSKEL_PROSENT;
              return (
                <div key={u.mandag} style={{ display: "grid", gridTemplateColumns: "52px minmax(0, 1fr) auto", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${TN.navy100}` }}>
                  <span style={mono(11, TN.textSecondary)}>UKE {u.ukenr}</span>
                  <div style={{ position: "relative", height: 10, background: TN.navy50, border: `1px solid ${TN.navy100}`, borderRadius: TN.radius.sm }}>
                    <div style={{ width: `${Math.min(100, u.prosent ?? 0)}%`, height: "100%", background: lav ? TN.ink700 : TN.navy900 }} />
                    <div aria-hidden style={{ position: "absolute", left: `${TERSKEL_PROSENT}%`, top: -4, bottom: -4, width: 1, background: TN.navy900 }} />
                  </div>
                  <span style={{ ...mono(12, lav ? TN.ink900 : TN.textSecondary), textAlign: "right", whiteSpace: "nowrap" }}>
                    {u.prosent === null ? "—" : `${tall1.format(u.gjennomfort / 60)} / ${tall1.format(u.planlagt / 60)} t · ${u.prosent} %`}
                  </span>
                </div>
              );
            })}
            {flagg ? <div style={{ fontSize: 14, lineHeight: 1.55, marginTop: 12 }}>To uker på rad under {TERSKEL_PROSENT} % av planlagt tid. Ta det opp i neste samtale.</div> : null}
            <TnFotnote>Streken står på {TERSKEL_PROSENT} % av planlagt tid. Bare økter med passert sluttid teller. Spilleren fører timene i PlayerHQ.</TnFotnote>
          </Seksjon>
          <Seksjon tittel={`Uke ${ukeTid?.get(spillerId)?.at(-1)?.ukenr ?? ""}`} merknad="FØRT / PLANLAGT" flex="1 1 340px">
            {(ukensOkter ?? []).map((o) => (
              <div key={o.id} style={{ display: "grid", gridTemplateColumns: "72px minmax(0, 1fr) auto", gap: 12, padding: "11px 0", borderBottom: `1px solid ${TN.navy100}`, alignItems: "baseline" }}>
                <span style={{ ...mono(11, TN.textSecondary), textTransform: "capitalize" }}>{naivDag.format(o.dato)}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, overflowWrap: "anywhere" }}>{o.tittel}</span>
                  <span style={{ display: "block", fontSize: 12.5, color: TN.textSecondary, marginTop: 2, overflowWrap: "anywhere" }}>{o.sted ?? "Sted ikke registrert"}</span>
                </span>
                <span style={{ ...mono(12, o.fort === null ? TN.textSecondary : TN.ink900), textAlign: "right", whiteSpace: "nowrap" }}>{o.fort === null ? "—" : o.fort} / {o.varighet} min</span>
              </div>
            ))}
            {ukensOkter && ukensOkter.length === 0 ? <TnMangler>Ingen økter planlagt denne uka.</TnMangler> : null}
          </Seksjon>
        </div>
      ) : null}

      {fane === "stats" ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
          <Seksjon tittel={`Nøkkeltall · ${aar}`} merknad={`OFFENTLIGE RESULTATER · ${rl?.runder ? `${rl.runder} RUNDER` : "INGEN RUNDER"}`} flex="1 1 340px">
            <div style={{ marginTop: 16 }}>
              <KpiRad min={130} tall={[
                { etikett: "Brutto snitt", verdi: brutto !== null ? snitt.format(brutto) : "—" },
                { etikett: "AK-kategori", verdi: brutto !== null ? kategoriFraSnittscore(brutto).kategori : "—" },
                { etikett: "Runder", verdi: rl?.runder ? String(rl.runder) : "—" },
                { etikett: "Starter", verdi: rl?.starter ? String(rl.starter) : "—" },
                { etikett: "Snittplassering", verdi: rl?.snittplassering != null ? tall1.format(rl.snittplassering) : "—" },
                { etikett: "Fairways", verdi: "—" },
                { etikett: "GIR", verdi: "—" },
                { etikett: "Putter per runde", verdi: "—" },
              ]} />
            </div>
            <TnFotnote>Kun brutto. Fairways, GIR og putter per runde finnes ikke i turneringskilden.</TnFotnote>
          </Seksjon>
          <Seksjon tittel="Strokes gained per runde" merknad="FRA PLAYERHQ" flex="1 1 340px">
            {hub === null ? <TnMangler>Strokes gained kunne ikke leses akkurat nå. Prøv igjen.</TnMangler> : hub.sgAkser.map((a) => {
              const bredde = a.verdi === null ? 0 : Math.min(100, (Math.abs(a.verdi) / 1.2) * 100);
              return (
                <div key={a.id} style={{ display: "grid", gridTemplateColumns: "96px minmax(0, 1fr) 56px", gap: 12, alignItems: "center", padding: "13px 0", borderBottom: `1px solid ${TN.navy100}` }}>
                  <span style={{ fontSize: 14, overflowWrap: "anywhere" }}>{a.etikett}</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: 12, background: TN.navy50, border: `1px solid ${TN.navy100}` }}>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}><div style={{ width: a.verdi !== null && a.verdi < 0 ? `${bredde}%` : 0, background: TN.navy300 }} /></div>
                    <div style={{ borderLeft: `1px solid ${TN.navy900}`, display: "flex" }}><div style={{ width: a.verdi !== null && a.verdi > 0 ? `${bredde}%` : 0, background: TN.navy900 }} /></div>
                  </div>
                  <span style={{ ...mono(13.5), textAlign: "right" }}>{a.tekst}</span>
                </div>
              );
            })}
            {hub ? <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 0", ...mono(13) }}><span>TOTAL</span><span>{sgTekst(sgTotal)}</span></div> : null}
            <TnFotnote>Regnet fra spillerens egne runder i PlayerHQ, ikke mot feltet i turnering.</TnFotnote>
          </Seksjon>
        </div>
      ) : null}

      {fane === "test" ? (
        <Seksjon tittel="Tester" merknad={<ManglerMerke>Norm fra Team Norway mangler</ManglerMerke>}>
          <div role="table" aria-label="Tester">
            <div role="row" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 80px 72px", gap: 10, padding: "12px 0 8px", borderBottom: `1px solid ${TN.navy100}`, ...etikett }}>
              <span role="columnheader">Test</span><span role="columnheader" style={{ textAlign: "right" }}>Resultat</span><span role="columnheader" style={{ textAlign: "right" }}>Landslag</span>
            </div>
            {testrader.map((r) => (
              <Link role="row" key={r.testId} href={`${tnSpillerHref(spillerId)}/tester/${r.testId}`} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 80px 72px", gap: 10, padding: "10px 0", minHeight: 44, borderBottom: `1px solid ${TN.navy100}`, alignItems: "center", color: TN.ink900, textDecoration: "none" }}>
                <span role="cell" style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 700, overflowWrap: "anywhere" }}>{r.protokollNavn}</span>
                  <span style={{ display: "block", fontSize: 12.5, color: TN.textSecondary, marginTop: 2 }}>{r.antall} {r.antall === 1 ? "gang" : "ganger"} · siste {datoLang(r.sisteDato)}</span>
                </span>
                <span role="cell" style={{ ...mono(13.5, r.sisteFormatert ? TN.ink900 : TN.textSecondary), textAlign: "right" }}>{r.sisteFormatert ?? "—"}</span>
                <span role="cell" style={{ ...mono(13.5, TN.textSecondary), textAlign: "right" }}>—</span>
              </Link>
            ))}
          </div>
          {testrader.length === 0 ? <TnMangler>{fornavn} har ikke fullført noen Team Norway-protokoll ennå.</TnMangler> : null}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: TN.textSecondary, margin: 0, maxWidth: "62ch" }}>Landslagsnivå vises når Team Norway har fastsatt normene. AK Golf-kategori regnes fra brutto snittscore, ikke fra testene.</p>
            <Primarlenke href={TN_RUTER.test}>Før test</Primarlenke>
          </div>
        </Seksjon>
      ) : null}

      {fane === "iup" ? (
        <Seksjon tittel={`Individuell utviklingsplan ${aar}`} merknad="FRA PLAYERHQ">
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: TN.textSecondary, margin: "14px 0", maxWidth: "64ch" }}>
            Delene av Team Norways IUP-ark som har data i dag. Evaluering og teknisk plan har egne sider under «Mer om spilleren».
          </p>
          <IupDel nr="01" tittel="Personinfo" apen>
            <Nokkelverdier par={[
              ["Navn", profil.navn],
              ["Født", profil.fodselsdato ? datoLang(profil.fodselsdato) : "Ikke registrert"],
              ["Klubb", profil.klubb ?? "Ikke registrert"],
              ["Skole", profil.skole ?? "Ikke registrert"],
              ["Gruppe", kontekst.gruppe.name],
              ["HCP", formaterHcp(profil.hcp)],
            ]} />
          </IupDel>
          <IupDel nr="02" tittel="Dokumentstatus" meta={String(aar)}>
            {status.map((r) => <Statuslinje key={r.tittel} rad={r} />)}
            {kontekst.kanAdministrere ? <Link href={TN_RUTER.lisens} style={{ color: TN.navy900, minHeight: 44, display: "inline-flex", alignItems: "center", fontSize: 13.5 }}>Endre i Lisens og økonomi</Link> : null}
          </IupDel>
          <IupDel nr="03" tittel="Nivå" meta={`BRUTTO ${aar}`}>
            <Fireledd hode a="Mål" b="Kilde" c="Nå" />
            <Fireledd a="Snittscore brutto" b="Offentlige resultater" c={brutto !== null ? snitt.format(brutto) : "—"} />
            <Fireledd a="AK Golf-kategori" b="Fra brutto snittscore" c={akTekst(brutto)} />
            <Fireledd a="WAGR" b="Ingen kilde" c="—" />
          </IupDel>
          <IupDel nr="04" tittel="Aktive planer" meta={planer ? `${planer.length}` : undefined}>
            {(planer ?? []).map((p) => <Fireledd key={p.id} a={p.navn} b={p.sluttDato ? periode(p.startDato, p.sluttDato, true) : `Fra ${datoLang(p.startDato)}`} c={p.status} />)}
            {planer && planer.length === 0 ? <TnMangler>Ingen aktiv plan i PlayerHQ.</TnMangler> : null}
          </IupDel>
          <IupDel nr="05" tittel="Tester" meta={`${testrader.length} PROTOKOLLER`}>
            {testrader.map((r) => <Fireledd key={r.testId} a={r.protokollNavn} b={datoLang(r.sisteDato)} c={r.sisteFormatert ?? "—"} />)}
            {testrader.length === 0 ? <TnMangler>Ingen registrerte tester.</TnMangler> : null}
          </IupDel>
          <div style={{ borderTop: `1px solid ${TN.navy100}` }} />
        </Seksjon>
      ) : null}

      {fane === "sam" ? (
        <Seksjon tittel="Samtaler og poster" merknad={poster ? `SISTE ${Math.min(poster.length, 6)}` : undefined}>
          {(poster ?? []).slice(0, 6).map((p) => (
            <div key={p.id} style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", padding: "14px 0", borderBottom: `1px solid ${TN.navy100}`, alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                <div style={mono(11, TN.textSecondary)}>{datoLang(p.createdAt)} · {p.authorNavn}</div>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: TN.ink700, margin: "4px 0 0", maxWidth: "68ch", whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{p.tekst}</p>
              </div>
            </div>
          ))}
          {poster === null ? <TnMangler>Postene til spilleren kunne ikke leses.</TnMangler> : poster.length === 0 ? <TnMangler>Ingen poster til {fornavn} ennå.</TnMangler> : null}
          <TnFotnote>Samtalereferater og fireukerssjekker ligger under, og postene til spilleren over.</TnFotnote>
          <div style={{ marginTop: 12 }}><Primarlenke href={`${tnSpillerHref(spillerId)}/post`}>Skriv til {fornavn}</Primarlenke></div>
        </Seksjon>
      ) : null}

      {fane === "sam" ? (
        <>
          <Seksjon tittel="Fireukerssjekk" merknad={sjekker ? `${sjekker.length}` : undefined}>
            {(sjekker ?? []).map((x) => (
              <Fireledd
                key={x.id}
                a={`Frist ${datoLang(x.frist)}`}
                b={x.prosessmaal ? `Prosessmål: ${x.prosessmaal}` : "—"}
                c={x.status === "LEVERT" ? `Levert ${x.levertAt ? datoLang(x.levertAt) : "—"}` : x.status === "FORFALT" ? "Ikke levert" : "Pågår"}
                d={x.utviklingssjekk ? `Utviklingssjekk ${x.utviklingssjekk.niva.toLowerCase()}` : undefined}
              />
            ))}
            {sjekker === null ? <TnMangler>Fireukerssjekkene kunne ikke leses.</TnMangler> : sjekker.length === 0 ? <TnMangler>Ingen fireukerssjekk fra {fornavn} ennå.</TnMangler> : null}
          </Seksjon>
          <Seksjon tittel="Samtalereferater" merknad={samtaler ? `${samtaler.length}` : undefined}>
            {(samtaler ?? []).map((x) => (
              <div key={x.id} style={{ padding: "14px 0", borderBottom: `1px solid ${TN.navy100}` }}>
                <div style={mono(11, TN.textSecondary)}>{datoLang(x.dato)} · {SAMTALE_TYPE_NAVN[x.type]}</div>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: TN.ink700, margin: "4px 0 0", maxWidth: "68ch", whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{x.avtalt}</p>
              </div>
            ))}
            {samtaler === null ? <TnMangler>Samtalene kunne ikke leses.</TnMangler> : samtaler.length === 0 ? <TnMangler>Ingen samtaler med {fornavn} er logget.</TnMangler> : null}
            <SamtaleSkjema
              flate="TEAM_NORWAY"
              person="spiller"
              elever={skjemaSpiller}
              valgtElevId={spillerId}
              action={opprettTnSamtale}
              iDag={dagIso}
              sjekker={(sjekker ?? []).filter((x) => x.status === "LEVERT").map((x) => ({ id: x.id, etikett: `Frist ${datoLang(x.frist)}` }))}
            />
          </Seksjon>
        </>
      ) : null}

      {fane === "tur" ? (
        <Seksjon tittel={`Turneringer ${aar}`} merknad="KUN BRUTTO">
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) repeat(3, minmax(48px, 64px))", gap: 10, padding: "12px 0 8px", borderBottom: `1px solid ${TN.navy100}`, ...etikett }}>
            <span>Turnering</span><span style={{ textAlign: "right" }}>Brutto</span><span style={{ textAlign: "right" }}>Plass</span><span style={{ textAlign: "right" }}>SG</span>
          </div>
          {(profil.turneringer ?? []).map((t, i) => (
            <div key={`${t.navn}-${i}`} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) repeat(3, minmax(48px, 64px))", gap: 10, padding: "12px 0", borderBottom: `1px solid ${TN.navy100}`, alignItems: "baseline" }}>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, overflowWrap: "anywhere" }}>{t.navn}</span>
                <span style={{ display: "block", ...mono(11.5, TN.textSecondary), marginTop: 3 }}>{periode(t.start, t.slutt ?? t.start)} · {t.runder} {t.runder === 1 ? "runde" : "runder"}{t.status === "CUT" ? " (kutt)" : ""}</span>
              </span>
              <span style={{ ...mono(14), textAlign: "right" }}>{t.bruttoSnitt !== null ? snitt.format(t.bruttoSnitt) : "—"}</span>
              <span style={{ ...mono(14), textAlign: "right" }}>{t.status === "CUT" ? "MC" : t.plassering ?? "—"}</span>
              <span style={{ ...mono(14, TN.textSecondary), textAlign: "right" }}>—</span>
            </div>
          ))}
          {profil.turneringer === null ? <TnMangler>{fornavn} er ikke koblet til en resultatprofil ennå. Turneringene vises når koblingen er gjort.</TnMangler> : profil.turneringer.length === 0 ? <TnMangler>Ingen registrerte turneringer i {aar}.</TnMangler> : null}
          <TnFotnote>
            {profil.aaret && profil.aaret.runder > 0 && brutto !== null
              ? `Brutto snitt ${snitt.format(brutto)} over ${profil.aaret.runder} runder. Brutto er snitt per fullført runde. Strokes gained mot feltet finnes ikke i kilden.`
              : "Brutto er snitt per fullført runde. Strokes gained mot feltet finnes ikke i kilden."}
          </TnFotnote>
        </Seksjon>
      ) : null}

      <Seksjon tittel={`Forslag til ${fornavn}`} merknad={forslag ? `${forslag.length}` : undefined}>
        {(forslag ?? []).map((f) => (
          <div key={f.id} style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", padding: "14px 0", borderBottom: `1px solid ${TN.navy100}` }}>
            <div style={{ flex: "1 1 280px", minWidth: 0 }}>
              <div style={mono(11, TN.textSecondary)}>{datoLang(f.createdAt)} · {FORSLAG_TYPE_NAVN[f.type]}</div>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: TN.ink700, margin: "4px 0 0", maxWidth: "68ch", whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{f.tekst}</p>
              {f.svar ? <p style={{ fontSize: 13.5, margin: "4px 0 0", color: TN.textSecondary, overflowWrap: "anywhere" }}>Svar: {f.svar}</p> : null}
            </div>
            <span style={{ ...mono(11, TN.navy900), letterSpacing: "0.04em", textTransform: "uppercase" }}>{FORSLAG_STATUS_NAVN[f.status]}</span>
          </div>
        ))}
        {forslag === null ? <TnMangler>Forslagene kunne ikke leses.</TnMangler> : forslag.length === 0 ? <TnMangler>Ingen forslag sendt til {fornavn} ennå.</TnMangler> : null}
        <ForslagSkjema flate="TEAM_NORWAY" person="spiller" elever={skjemaSpiller} valgtElevId={spillerId} action={opprettTnForslag} />
      </Seksjon>
    </SkjermRamme>
  );
}
