import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnSpillerTilgang } from "@/lib/domain/tn-arbeidsflate";
import { hentTnRunderSg, hentTnTrackManMaal, hentTnTrackManOkter, type TnRundeSg, type TnTrackManSlag } from "@/lib/domain/tn-trackman";
import { tnTrenerKanSkriveFor } from "@/lib/domain/tn-trener-skriv";
import { clubSpeedFraTrackMan } from "@/lib/trackman/test-kobling";
import {
  TM_PARAMETRE, andelIVindu, gapping, gjeldendeVindu, kolletype, parameterstat, perKolle, standardvindu, treffpunkt, vinduTekst,
  type TmParameter,
} from "@/lib/trackman/statistikk";
import { TnIupLaastSkjerm } from "@/components/team-norway/skjermer/tn-iup-laast-skjerm";
import { TnTrackManVisning, type VisMaaned, type VisRunder } from "@/components/team-norway/skjermer/tn-trackman-visning";

export const dynamic = "force-dynamic";

/**
 * IUP › Tester › TrackMan (utkast 3, «TrackMan-statistikk», Anders 22.10.2026, §TRACKMAN I TEAM NORWAY-TESTENE
 * punkt 6). Filtre i adressen: `okt` (økt-ID eller «alle»), `akse` (TEK, SLAG eller alle), `kolle`, `visning`
 * (statistikk, tendens, sammenheng), `param` (tendens) og `slag` (slaget bak et ytterpunkt). Krever deling.
 */
const datoKort = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", timeZone: "Europe/Oslo" });
const datoLang = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });
const maanedFmt = new Intl.DateTimeFormat("nb-NO", { month: "long", year: "numeric", timeZone: "Europe/Oslo" });
const maanedNokkel = new Intl.DateTimeFormat("sv-SE", { year: "numeric", month: "2-digit", timeZone: "Europe/Oslo" });
const FEIL: Record<string, string> = { maal: "Skriv tall i mål og vindu.", vindu: "«Vindu fra» må være mindre enn «Vindu til».", tilgang: "Du kan ikke endre målene for denne spilleren." };

function snittAv(v: (number | null)[]): number | null {
  const t = v.filter((x): x is number => x !== null);
  return t.length ? t.reduce((a, b) => a + b, 0) / t.length : null;
}
function runder(liste: TnRundeSg[]): VisRunder | null {
  return liste.length ? { antall: liste.length, sgOtt: snittAv(liste.map((r) => r.sgOtt)), sgApp: snittAv(liste.map((r) => r.sgApp)), sgArg: snittAv(liste.map((r) => r.sgArg)), sgPutt: snittAv(liste.map((r) => r.sgPutt)) } : null;
}

export default async function TrackManStatistikkPage({ params, searchParams }: {
  params: Promise<{ spillerId: string }>;
  searchParams: Promise<{ okt?: string; akse?: string; kolle?: string; visning?: string; param?: string; slag?: string; feil?: string }>;
}) {
  const [{ spillerId }, sp] = await Promise.all([params, searchParams]);
  const bruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "TALENT" });
  const tilgang = await hentTnSpillerTilgang(bruker, spillerId);
  if (!tilgang) return <TnIupLaastSkjerm bruker={bruker} spillerId={spillerId} aktiv="tester" />;
  const seksMnd = new Date(Date.now() - 183 * 864e5);
  const [okter, maal, runderSg, kanTrener] = await Promise.all([
    hentTnTrackManOkter(bruker, spillerId, 40),
    hentTnTrackManMaal(bruker, spillerId),
    hentTnRunderSg(bruker, spillerId, seksMnd),
    tnTrenerKanSkriveFor(bruker, spillerId),
  ]);
  if (!okter || !maal || !runderSg) return <TnIupLaastSkjerm bruker={bruker} spillerId={spillerId} aktiv="tester" />;

  const akse = sp.akse === "TEK" || sp.akse === "SLAG" ? sp.akse : null;
  const visning = sp.visning === "tendens" || sp.visning === "sammenheng" ? sp.visning : "statistikk";
  const iAkse = okter.filter((o) => !akse || o.akse === akse);
  const oktId = sp.okt === "alle" ? "alle" : iAkse.some((o) => o.id === sp.okt) ? sp.okt! : iAkse[0]?.id ?? "alle";
  const valgte = oktId === "alle" ? iAkse : iAkse.filter((o) => o.id === oktId);
  const alleSlag: (TnTrackManSlag & { oktId: string })[] = valgte.flatMap((o) => o.slag.map((s) => ({ ...s, oktId: o.id })));
  const grupper = perKolle(alleSlag);
  const kolle = grupper.some((g) => g.kolle === sp.kolle) ? sp.kolle! : grupper[0]?.kolle ?? null;
  const slagKolle = grupper.find((g) => g.kolle === kolle)?.slag ?? [];
  const param = (TM_PARAMETRE.some((p) => p.key === sp.param) ? sp.param : "faceToPath") as TmParameter;

  const base = `/team-norway/spiller/${spillerId}/tester/trackman`;
  const href = (endre: Record<string, string | null>) => {
    const q = new URLSearchParams();
    const alle = { okt: oktId, akse, kolle, visning, param: visning === "tendens" ? param : null, ...endre };
    for (const [k, v] of Object.entries(alle)) if (v) q.set(k, v);
    return `${base}?${q.toString()}`;
  };

  const type = kolletype(kolle);
  const egne = maal.filter((m) => m.kolle === kolle);
  const egetCarry = egne.find((m) => m.parameter === "carryDistance")?.maal ?? null;
  const parametre = TM_PARAMETRE.map((p) => {
    const st = parameterstat(slagKolle, p.key);
    const eget = egne.find((m) => m.parameter === p.key) ?? null;
    const vindu = gjeldendeVindu(p.key, type, eget);
    return {
      navn: p.navn, enhet: p.enhet, desimaler: p.desimaler, n: st.n, forFaa: st.forFaa, snitt: st.snitt, median: st.median, spredning: st.spredning,
      min: st.min ? { verdi: st.min.verdi, href: href({ slag: st.min.slagId }) } : null,
      maks: st.maks ? { verdi: st.maks.verdi, href: href({ slag: st.maks.slagId }) } : null,
      andel: andelIVindu(slagKolle, p.key, vindu, egetCarry),
      vindu: vinduTekst(vindu, p.enhet),
    };
  });
  const maalRader = TM_PARAMETRE.filter((p) => standardvindu(p.key, type) || egne.some((m) => m.parameter === p.key)).map((p) => {
    const eget = egne.find((m) => m.parameter === p.key) ?? null;
    return {
      parameter: p.navn, key: p.key, navn: p.navn, enhet: p.enhet, maal: eget?.maal ?? null, vinduMin: eget?.vinduMin ?? null, vinduMax: eget?.vinduMax ?? null,
      standard: vinduTekst(gjeldendeVindu(p.key, type, eget), p.enhet),
      gjelder: eget ? `Eget · ${eget.settAv ?? "ukjent"} · ${datoKort.format(eget.settAt)}` : "Standard",
      eget: !!eget,
    };
  });
  const valgtSlag = sp.slag ? alleSlag.find((s) => s.id === sp.slag) ?? null : null;
  const tp = treffpunkt(slagKolle);
  const cs = clubSpeedFraTrackMan(valgte[0]?.slag ?? []);
  const pInfo = TM_PARAMETRE.find((p) => p.key === param)!;
  const tendensPunkter = [...iAkse].reverse().map((o) => {
    const st = parameterstat(o.slag.filter((s) => (s.club ?? "—") === kolle), param);
    return { dato: datoKort.format(o.recordedAt), n: st.n, snitt: st.snitt, spredning: st.spredning };
  }).filter((p) => p.n > 0);

  // Sammenheng per måned: TrackMan for valgt kølle (alle økter i aksen) og runder hver for seg.
  const maaneder = new Map<string, VisMaaned & { slag: TnTrackManSlag[]; tr: TnRundeSg[]; tu: TnRundeSg[] }>();
  const mnd = (d: Date) => {
    const k = maanedNokkel.format(d);
    if (!maaneder.has(k)) maaneder.set(k, { maaned: maanedFmt.format(d), tm: null, trening: null, turnering: null, slag: [], tr: [], tu: [] });
    return maaneder.get(k)!;
  };
  for (const o of iAkse) if (o.recordedAt >= seksMnd) mnd(o.recordedAt).slag.push(...o.slag.filter((s) => (s.club ?? "—") === kolle));
  for (const r of runderSg) (r.type === "turnering" ? mnd(r.playedAt).tu : mnd(r.playedAt).tr).push(r);
  const maanedRader = [...maaneder.entries()].sort(([a], [b]) => b.localeCompare(a)).map(([, m]) => ({
    maaned: m.maaned,
    tm: m.slag.length ? { n: m.slag.length, andelFtp: andelIVindu(m.slag, "faceToPath", gjeldendeVindu("faceToPath", type, egne.find((x) => x.parameter === "faceToPath"))), carrySpredning: parameterstat(m.slag, "carryDistance").spredning } : null,
    trening: runder(m.tr),
    turnering: runder(m.tu),
  }));

  const kilde = valgte.length === 1
    ? `Kilde: TrackMan ${datoLang.format(valgte[0]!.recordedAt)}, ${slagKolle.length} slag med ${kolle ?? "—"}.`
    : `Kilde: TrackMan, ${valgte.length} økter, ${slagKolle.length} slag med ${kolle ?? "—"}.`;

  return (
    <TnTrackManVisning d={{
      spillerId, tilgang, brukerNavn: bruker.name ?? "Ukjent",
      kanSkrive: kanTrener || bruker.id === spillerId,
      feil: sp.feil ? FEIL[sp.feil] ?? null : null,
      okter: [...iAkse.slice(0, 6).map((o) => ({ href: href({ okt: o.id, slag: null }), label: `${datoKort.format(o.recordedAt)} · ${o.akse ?? "—"}`, aktiv: o.id === oktId })), { href: href({ okt: "alle", slag: null }), label: "Alle økter", aktiv: oktId === "alle" }],
      akser: [{ href: href({ akse: null, okt: null }), label: "TEK og SLAG", aktiv: !akse }, { href: href({ akse: "TEK", okt: null }), label: "TEK", aktiv: akse === "TEK" }, { href: href({ akse: "SLAG", okt: null }), label: "SLAG", aktiv: akse === "SLAG" }],
      koller: grupper.map((g) => ({ href: href({ kolle: g.kolle, slag: null }), label: `${g.kolle} · ${g.slag.length}${g.slag.length < 5 ? " · for få slag" : ""}`, aktiv: g.kolle === kolle })),
      visninger: (["statistikk", "tendens", "sammenheng"] as const).map((v) => ({ href: href({ visning: v, slag: null }), label: v === "statistikk" ? "Statistikk" : v === "tendens" ? "Tendens" : "Sammenheng", aktiv: v === visning })),
      kolle, kilde, visning,
      slag: valgtSlag ? { nr: valgtSlag.shotNumber, club: valgtSlag.club ?? "—", verdier: TM_PARAMETRE.map((p) => ({ navn: p.navn, tekst: typeof valgtSlag[p.key] === "number" ? `${(valgtSlag[p.key] as number).toLocaleString("nb-NO", { maximumFractionDigits: p.desimaler }).replace("-", "−")}${p.enhet === "°" ? "°" : p.enhet ? ` ${p.enhet}` : ""}` : "—" })) } : null,
      parametre, maal: maalRader, tilbake: href({ slag: null }),
      gapping: gapping(alleSlag),
      treffpunkt: { n: tp.n, tekst: tp.n ? `Snitt X ${tp.x!.toLocaleString("nb-NO", { maximumFractionDigits: 2 }).replace("-", "−")} · Y ${tp.y!.toLocaleString("nb-NO", { maximumFractionDigits: 2 }).replace("-", "−")} (TrackMan-skala −1 til 1). ${tp.n} av ${slagKolle.length} slag har treffpunkt.` : "", punkter: slagKolle.flatMap((s) => (s.strikePatternX != null && s.strikePatternY != null ? [{ x: s.strikePatternX, y: s.strikePatternY }] : [])) },
      clubSpeed: { beste: cs.beste, slag: cs.slag.map((s) => ({ nr: s.shotNumber, verdi: s.clubSpeed ?? null, beste: s.id === cs.besteId })) },
      tendens: { parametre: TM_PARAMETRE.map((p) => ({ href: href({ visning: "tendens", param: p.key }), label: p.navn, aktiv: p.key === param })), navn: pInfo.navn, enhet: pInfo.enhet, punkter: tendensPunkter },
      maaneder: maanedRader,
    }} />
  );
}
