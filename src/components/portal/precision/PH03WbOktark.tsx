"use client";

/**
 * PH-03 Øktark for en Workbench-økt i nytt design (pakke 2 Treningsøkta), `/portal/tren/wb/[sessionId]`.
 * Fasit: docs/design-system/utkast-playerhq/treningsokt.html, skjerm «okt», og «ferdig» for vurderingen.
 * Stil: src/styles/playerhq-ny-okt.css. Alltid lyst tema (Anders 14.10). Skrå-drakten (R5): SkraTopp med bildet, som PH03Oktark.
 *
 * Start, hopp over, fullfør med belastning og faktisk tid, og lenken til Live og oppsummeringen
 * kaller de samme wb-actions som før. Fullfør spør om Belastning og Fokus (golføkt) eller
 * «Hvor tungt» (fysisk økt) før økta lagres.
 *
 * Avvik:
 *   - «Hopp over» med årsak er ikke med: Workbench-økta har ikke noe felt for årsak.
 *   - «Hvorfor den ligger i uka» med prosessmål vises bare som coachens begrunnelse; koblingen til prosessmål finnes ikke.
 *   - Bildet er per akse (oktBilde), ikke per økt. Det ligger nå i SkraTopp, ikke i heroen.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, Play, SkipForward } from "lucide-react";
import { Ikon } from "@/components/precision/pa";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import { EtterOktaVurdering } from "@/components/portal/precision/EtterOktaVurdering";
import { formaterVarighet } from "@/lib/format-tall";
import { oktBilde } from "@/lib/portal/okt-bilde";
import { formatIntervallPunkt } from "@/lib/portal/idag-visning";
import { oktArkLiveHref } from "@/lib/portal/session-hrefs";
import { oktTypeFraPyramide } from "@/lib/workbench/etter-okta";
import type { WorkbenchSession } from "@/lib/domain/workbench/types";
import { startSession, completeSessionWithEffort, skipSession } from "@/lib/workbench/wb-actions";
import { lagreVurderingEtterOkt } from "@/lib/workbench/wb-session-life-actions";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-okt.css";
import "@/styles/playerhq-ny-lister-skra.css";

const dagFmt = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const dagTekst = (iso: string) => { const t = dagFmt.format(new Date(`${iso}T00:00:00Z`)); return t.charAt(0).toUpperCase() + t.slice(1); };

export function PH03WbOktark({ session: initial }: { session: WorkbenchSession }) {
  const router = useRouter();
  const [session, setSession] = useState(initial);
  const [fullforer, setFullforer] = useState(false);
  const [minutter, setMinutter] = useState(String(initial.actualMinutes ?? initial.durationMinutes));
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const type = oktTypeFraPyramide(session.pyramid);
  const akse = session.pyramid.toLowerCase();
  const bilde = oktBilde(session.pyramid, `${session.title} ${session.location ?? ""}`);
  const tid = formatIntervallPunkt(session.startMinute, session.durationMinutes);
  const [fra, til] = tid.split("–");
  const total = session.drills.reduce((s, d) => s + d.durationMinutes, 0);
  const faktisk = (() => { const n = parseInt(minutter, 10); return Number.isFinite(n) && n > 0 && n <= 600 ? n : null; })();

  function handling(h: "start" | "hopp") {
    setFeil(null);
    start(async () => {
      const res = h === "start" ? await startSession(session.id) : await skipSession(session.id);
      if (!res.ok) { setFeil(res.error); return; }
      if (h === "start") { router.push(oktArkLiveHref(session.id, "IN_PROGRESS")); return; }
      setSession(res.data);
    });
  }

  async function fullfor({ belastning, fokus }: { belastning: number; fokus: number | null }) {
    if (faktisk == null) return { ok: false, error: "Skriv faktisk tid i minutter (1–600)." };
    const res = await completeSessionWithEffort({ sessionId: session.id, perceivedEffort: belastning, actualMinutes: faktisk });
    if (!res.ok) return { ok: false, error: res.error };
    const vurdert = await lagreVurderingEtterOkt({ sessionId: session.id, belastning, fokus });
    if (!vurdert.ok) { setSession(res.data); return { ok: false, error: `Økta er gjennomført, men fokus ble ikke lagret: ${vurdert.error}` }; }
    setSession(vurdert.data);
    setFullforer(false);
    return { ok: true };
  }

  async function vurder(input: { belastning: number; fokus: number | null }) {
    const res = await lagreVurderingEtterOkt({ sessionId: session.id, ...input });
    if (res.ok) setSession(res.data);
    return res.ok ? { ok: true } : { ok: false, error: res.error };
  }

  const rader: [string, string][] = [
    ["Når", `${dagTekst(session.date)} ${tid}`],
    ["Sted", session.location?.trim() || "—"],
    ["Varighet", formaterVarighet(session.durationMinutes)],
  ];
  if (session.actualMinutes != null && session.status === "COMPLETED") rader.push(["Gjennomført tid", formaterVarighet(session.actualMinutes)]);
  const hvorfor = session.rationale?.trim() || session.notes?.trim() || null;

  return <div className="phn phn-okt phn-skra" data-od-id="playerhq-wb-oktark">
    <SkraTopp
      lav
      etikett="Økt"
      bilde={bilde.src} bildePosisjon={bilde.posisjon}
      overlinje={`${dagTekst(session.date)} · ${session.location?.trim() || "—"}`}
      tittel={session.title}
      handling={<span className="skra-tilbake"><Link href="/portal" className="tilbake"><Ikon icon={ChevronLeft} size={20} name="chevron-left" />I dag</Link></span>}
    />
    <SkraFlyt lav><div className="smal">

    <div className={`okt-hero fylt-${akse}`}>
      <div className="tekst">
        <div className="okt-rad"><span className="okt-tid">{fra}{til && <small>–{til}</small>}</span><span className="akse-merke"><i />{session.pyramid}</span></div>
        <span className="navn">{session.title}</span>
        <div className="okt-info"><span>{formaterVarighet(session.durationMinutes)}</span><span>{session.drills.length} {session.drills.length === 1 ? "øvelse" : "øvelser"}</span><span>{session.location?.trim() || "—"}</span></div>
        {session.status === "SKIPPED" && <span className="phn-pille noy" style={{ justifySelf: "start" }}>Hoppet over</span>}
        {session.status === "COMPLETED" && <span className="phn-pille ok" style={{ justifySelf: "start" }}>Gjennomført</span>}
        {session.status === "IN_PROGRESS" && <span className="pille-live" style={{ justifySelf: "start" }}><i />Pågår</span>}
      </div>
    </div>

    <div className="to-kol">
      <div className="phn-seksjon">
        <section className="phn-kort" aria-label="Mål for økta">
          <span className="phn-dato">Mål for økta</span>
          {session.maalsetning?.trim() ? <b className="undertittel" style={{ fontSize: 18 }}>{session.maalsetning}</b> : <p className="phn-forklar">—</p>}
          {hvorfor && <details><summary>Hvorfor den ligger i uka</summary><p className="phn-forklar">{hvorfor}</p></details>}
        </section>
        <section className="phn-kort" aria-label="Om økta"><dl className="meta-liste">{rader.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></section>
        {session.status === "COMPLETED" && <EtterOktaVurdering type={type} belastning={session.perceivedEffort ?? null} fokus={session.fokusEtterOkt ?? null} onLagre={vurder} />}
      </div>
      <section className="phn-seksjon" aria-label="Øvelser">
        <div className="phn-sek-topp"><h2>Øvelser</h2><span className="phn-kilde">{session.drills.length} {session.drills.length === 1 ? "øvelse" : "øvelser"}{total > 0 ? ` · ${formaterVarighet(total)}` : ""}</span></div>
        {session.drills.length === 0 ? <p className="phn-forklar">Økta har ingen øvelser ennå.</p>
          : <ol className="ovelser">{session.drills.map((d, i) => {
            const ledd = (d.akFormel?.label ?? "").split(" · ").map((x) => x.trim()).filter(Boolean);
            return <li key={d.id} className="ovelse">
              <span className="nr">{i + 1}</span>
              <div>
                <b>{d.title}</b>
                {ledd.length > 0 && <div className="formel" aria-label={`AK-formel ${d.akFormel.label}`}>{ledd.map((l, j) => <span key={`${l}-${j}`}>{l}</span>)}</div>}
              </div>
              <span className="min">{d.durationMinutes > 0 ? `${d.durationMinutes} min` : "—"}</span>
            </li>;
          })}</ol>}
      </section>
    </div>

    {feil && <p className="phn-feil" role="alert">{feil}</p>}

    {session.status === "PUBLISHED" && <div className="phn-knapper" aria-label="Start">
      <button type="button" className="phn-knapp pri stor" onClick={() => handling("start")} disabled={pending}><Ikon icon={Play} size={20} name="play" />{pending ? "Starter …" : "Start økta"}</button>
      <button type="button" className="phn-knapp sek stor" onClick={() => handling("hopp")} disabled={pending}><Ikon icon={SkipForward} size={20} name="skip-forward" />Hopp over</button>
    </div>}

    {session.status === "IN_PROGRESS" && (fullforer ? <>
      <section className="phn-kort" aria-label="Faktisk tid">
        <label className="phn-felt" htmlFor="wb-faktisk">Faktisk tid (minutter)
          <input id="wb-faktisk" type="number" inputMode="numeric" min={1} max={600} value={minutter} onChange={(e) => setMinutter(e.target.value)} />
        </label>
      </section>
      <EtterOktaVurdering type={type} belastning={null} fokus={null} onLagre={fullfor} knappTekst="Fullfør økta" />
      <button type="button" className="phn-knapp sek" style={{ justifySelf: "start" }} onClick={() => setFullforer(false)}>Avbryt</button>
    </> : <div className="phn-knapper">
      <Link href={oktArkLiveHref(session.id, "IN_PROGRESS")} className="phn-knapp pri stor"><Ikon icon={Play} size={20} name="play" />Fortsett økta</Link>
      <button type="button" className="phn-knapp sek stor" onClick={() => setFullforer(true)} disabled={pending}><Ikon icon={Check} size={20} name="check" />Fullfør økta</button>
      <button type="button" className="phn-knapp sek stor" onClick={() => handling("hopp")} disabled={pending}><Ikon icon={SkipForward} size={20} name="skip-forward" />Hopp over</button>
    </div>)}

    {session.status === "COMPLETED" && <div className="phn-knapper">
      <Link href={oktArkLiveHref(session.id, "COMPLETED")} className="phn-knapp pri stor">Se oppsummeringen</Link>
      <Link href="/portal" className="phn-knapp sek stor">Til I dag</Link>
    </div>}

  </div></SkraFlyt></div>;
}
