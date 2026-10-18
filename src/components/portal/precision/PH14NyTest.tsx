"use client";

/**
 * PH-14 Ny test i nytt design (PlayerHQ pakke 13, Stats resten). Stegvis skjema i fire steg:
 * velg test, når og hvor, resultat, se over. Erstatter NyTestV2.
 * Fasit: docs/design-system/utkast-playerhq/stats-resten.html, malen «nytest». Stil: playerhq-ny-statsresten-test.css.
 *
 * Avvik:
 *   - Testlista er testbatteriet spilleren har tilgang til i basen (testTilgangWhere), ikke utkastets ni faste tester.
 *     Fysisk: de fem fysiske testene med utkastets navn. Golf: alle golftestene i batteriet; de åpner gjennomføringen
 *     (/portal/tren/tester/[testId]/gjennomfor), og Team Norway-testene sendes derfra videre til scorekortet.
 *     «PEI 100 m» finnes ikke i batteriet og vises ikke. Egne tester står i en tredje gruppe og føres som ett tall.
 *   - Enheten er testens egen fra basen: Lengdehopp og Rotasjonskast føres i cm, ikke m.
 *   - «En trener var til stede» lagres som notat på resultatet, og resultatet merkes fortsatt «Egenført».
 *     «Kontrollert» krever at treneren fører selv; appen har ingen bekreftelse fra trener ennå.
 *   - Stedene er appens faste liste (Performance Studio, Bossum, Annet), ikke utkastets eksempler.
 *   - Utstyr (valgfritt felt i steg 2) er beholdt fra dagens skjerm. Utkastet til PC viser samme ene kolonne.
 *   - «Forkaste testen?» er en modal dialog (som Avbryt testen i PH-15), ikke et ark festet nederst.
 *   - «Personlig rekord» står bare når resultatet slår alle tidligere målinger.
 *   - Utkastet lokalt lagres per bruker som før, og slettes ved lagring og forkasting.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-14-NY.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { TmTilbake } from "./PH17TmFelles";
import { useToast } from "@/components/shared/toast-provider";
import { logTest } from "@/app/portal/tren/tester/ny/actions";
import { useLokalDataEier } from "@/lib/offline-queue/eier-context";
import { byggLagringsNokkel } from "@/lib/offline-queue/eier-scope";
import type { NyTestAkse, NyTestValg } from "@/lib/portal-tester/ny-test-data";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";
import "@/styles/playerhq-ny-statsdybde.css";
import "@/styles/playerhq-ny-statsresten-test.css";

const LS_GRUNNNOKKEL = "akgolf:nytest:draft:v3";
const STEDER = ["Performance Studio", "Bossum", "Annet"] as const;
const STEG_NAVN = ["Velg test", "Når og hvor", "Resultat", "Se over"] as const;
const AKSEFARGE: Record<NyTestAkse, string> = {
  fys: "var(--phn-fys)", tek: "var(--phn-tek)", slag: "var(--phn-slag)", spill: "var(--phn-spill)", turn: "var(--phn-turn)",
};

const KORT = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" });
const LANG = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "short", day: "numeric", month: "short" });

export type Utkast = {
  testId: string | null;
  dato: string;
  sted: string;
  utstyr: string;
  trener: boolean;
  forNotat: string;
  resultat: string;
  etterNotat: string;
  del: boolean;
};

function iDagOslo(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
}

/** «108,4» og «108.4» gir samme tall. Tomt eller ugyldig blir null. */
export function lesTall(raw: string): number | null {
  const t = raw.trim().replace(/\s/g, "").replace("−", "-").replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function tall(n: number, maks = 1): string {
  return n.toLocaleString("nb-NO", { maximumFractionDigits: maks }).replace("-", "−");
}

function datoFraDag(dag: string): Date {
  const [y, m, d] = dag.split("-").map(Number);
  return new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1, 12));
}

/** `startSteg` og `startUtkast` brukes av prøvefila for å måle hvert steg. */
export function PH14NyTest({ tester, coachNavn, startSteg = 1, startUtkast }: {
  tester: NyTestValg[]; coachNavn: string | null; startSteg?: number; startUtkast?: Partial<Utkast>;
}) {
  const router = useRouter();
  const toast = useToast();
  const eierId = useLokalDataEier();
  const nokkel = byggLagringsNokkel(LS_GRUNNNOKKEL, eierId);
  const [pending, startTransition] = useTransition();
  const [steg, setSteg] = useState(startSteg);
  const [sok, setSok] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const avbrytRef = useRef<HTMLDialogElement>(null);
  const toppRef = useRef<HTMLDivElement>(null);
  const [u, setU] = useState<Utkast>(() => ({
    testId: null, dato: iDagOslo(), sted: STEDER[0], utstyr: "", trener: false, forNotat: "", resultat: "", etterNotat: "", del: true, ...startUtkast,
  }));
  const [lastet, setLastet] = useState(false);

  // Utkastet hentes etter første tegning, så server og klient tegner det samme.
  useEffect(() => {
    try {
      const raw = nokkel ? window.localStorage.getItem(nokkel) : null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- engangs innlesing av lokalt utkast etter montering
      if (raw) setU((p) => ({ ...p, ...(JSON.parse(raw) as Partial<Utkast>) }));
    } catch { /* ødelagt utkast ignoreres */ }
    setLastet(true);
  }, [nokkel]);

  useEffect(() => {
    if (!lastet) return;
    const t = window.setTimeout(() => {
      try { if (nokkel) window.localStorage.setItem(nokkel, JSON.stringify(u)); } catch { /* utkastet er bare en hjelp */ }
    }, 300);
    return () => window.clearTimeout(t);
  }, [lastet, nokkel, u]);

  const valgt = tester.find((t) => t.id === u.testId && t.gruppe !== "golf") ?? null;
  const verdi = lesTall(u.resultat);
  const iDag = iDagOslo();

  const grupper = useMemo(() => {
    const q = sok.trim().toLowerCase();
    const treff = tester.filter((t) => !q || `${t.navn} ${t.under}`.toLowerCase().includes(q));
    return [
      { id: "fys", navn: "Fysisk", kilde: "Hver sjette uke i grunnperioden", rader: treff.filter((t) => t.gruppe === "fys") },
      { id: "golf", navn: "Golf", kilde: "Føres slag for slag", rader: treff.filter((t) => t.gruppe === "golf") },
      { id: "egen", navn: "Egne tester", kilde: "Ett resultat per gang", rader: treff.filter((t) => t.gruppe === "egen") },
    ].filter((g) => g.rader.length > 0);
  }, [tester, sok]);

  const kanVidere =
    steg === 1 ? valgt !== null
      : steg === 2 ? Boolean(u.dato) && u.dato <= iDag && u.sted.trim().length > 0
        : steg === 3 ? verdi !== null && verdi >= 0
          : true;

  const sett = <K extends keyof Utkast>(k: K, v: Utkast[K]) => { setU((p) => ({ ...p, [k]: v })); setFeil(null); };

  function gaa(n: number) {
    setSteg(n);
    setFeil(null);
    toppRef.current?.scrollIntoView({ block: "start" });
  }

  function slettUtkast() {
    try { if (nokkel) window.localStorage.removeItem(nokkel); } catch { /* ingenting å slette */ }
  }

  function forkast() {
    slettUtkast();
    avbrytRef.current?.close();
    router.push("/portal/tren/tester");
  }

  function lagre() {
    if (!valgt || verdi === null || verdi < 0) { setFeil("Før et resultat før du lagrer."); return; }
    startTransition(async () => {
      try {
        const res = await logTest({
          testId: valgt.id,
          takenAt: datoFraDag(u.dato).toISOString(),
          location: u.sted,
          equipment: u.utstyr.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20),
          preNotes: u.forNotat,
          postNotes: u.etterNotat,
          shareWithCoach: u.del,
          trenerTilStede: u.trener,
          results: { verdi, _score: verdi },
        });
        slettUtkast();
        toast.success(`Lagret som Egenført. ${valgt.navn} er oppdatert i Tester og Stats${u.del ? `, og ${coachNavn ?? "coachen"} ser resultatet` : ""}.`);
        router.push(`/portal/tren/tester/${res.testId}`);
      } catch (e) {
        setFeil(e instanceof Error ? e.message : "Resultatet kunne ikke lagres. Det du førte, er beholdt.");
      }
    });
  }

  // Endring siden sist
  let delta = "Første måling";
  let rekord = false;
  if (valgt && verdi !== null && valgt.sist) {
    const d = Math.round((verdi - valgt.sist.score) * 10) / 10;
    delta = `${d > 0 ? "+" : ""}${tall(d)} ${valgt.enhet} siden ${KORT.format(new Date(valgt.sist.takenAt))}`;
    rekord = valgt.beste !== null && (valgt.lavestBest ? verdi < valgt.beste : verdi > valgt.beste);
  }

  if (tester.length === 0) {
    return (
      <div className="phn phn-nt">
        <div className="phn-nt-smal">
          <TmTilbake href="/portal/tren/tester" tekst="Tester" />
          <div><div className="phn-dato">Testbatteri AK Golf</div><h1 className="phn-tittel">Ny test</h1></div>
          <section className="phn-kort dempet">
            <h2>Ingen tester i batteriet ditt</h2>
            <p className="phn-forklar">Coachen din legger inn testene. Du kan lage en egen test i mellomtiden.</p>
            <div className="phn-knapper"><Link className="phn-knapp pri" href="/portal/tren/tester/ny/egen">Lag egen test</Link></div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="phn phn-nt">
      <div className="phn-nt-smal">
        <TmTilbake href="/portal/tren/tester" tekst="Tester" />
        <div className="phn-nt-topp" ref={toppRef}>
          <div><div className="phn-dato">Testbatteri AK Golf</div><h1 className="phn-tittel">Ny test</h1></div>
          <div className="phn-nt-stegtopp">
            <small>Steg {steg} av 4 · {STEG_NAVN[steg - 1]}</small>
            <div className="phn-nt-spor" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={steg} aria-label="Fremdrift">
              <span style={{ width: `${steg * 25}%` }} />
            </div>
          </div>
        </div>

        {steg === 1 && (
          <div className="phn-nt-steg">
            <h2>Hvilken test tok du?</h2>
            <input className="phn-nt-sok" type="search" placeholder="Søk i testbatteriet" aria-label="Søk i testbatteriet" value={sok} onChange={(e) => setSok(e.target.value)} />
            {grupper.length === 0 && <p className="phn-forklar">Ingen tester heter «{sok}».</p>}
            {grupper.map((g) => (
              <section key={g.id} className="phn-seksjon" aria-label={g.navn}>
                <div className="phn-sek-topp"><h2>{g.navn}</h2><span className="phn-kilde">{g.kilde}</span></div>
                <ul className="phn-nt-testvalg">
                  {g.rader.map((t) => (
                    <li key={t.id} style={{ ["--c" as string]: AKSEFARGE[t.akse] }}>
                      {t.gruppe === "golf" ? (
                        <Link href={`/portal/tren/tester/${t.id}/gjennomfor`}>
                          <b>{t.navn}</b><span>{t.under}</span><em>Åpner gjennomføringen</em>
                        </Link>
                      ) : (
                        <button type="button" aria-pressed={u.testId === t.id} onClick={() => sett("testId", t.id)}>
                          <b>{t.navn}</b><span>{t.under}</span>
                          <em>{t.sist ? `Sist ${KORT.format(new Date(t.sist.takenAt))}` : "Aldri tatt"}</em>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {steg === 2 && valgt && (
          <div className="phn-nt-steg">
            <h2>{valgt.navn}</h2>
            <div className="phn-to-felt">
              <label className="phn-felt">Dato
                <input type="date" value={u.dato} max={iDag} onChange={(e) => sett("dato", e.target.value > iDag ? iDag : e.target.value)} />
              </label>
              <label className="phn-felt">Sted
                <select value={u.sted} onChange={(e) => sett("sted", e.target.value)}>
                  {STEDER.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
            </div>
            <div className="phn-felt" role="group" aria-labelledby="ph14ny-hvem">
              <span id="ph14ny-hvem">Hvem førte resultatet?</span>
              <div className="phn-nt-velgkort">
                <button type="button" aria-pressed={!u.trener} onClick={() => sett("trener", false)}>
                  <b>Jeg selv</b><span>Merkes «Egenført»</span><i aria-hidden />
                </button>
                <button type="button" aria-pressed={u.trener} onClick={() => sett("trener", true)}>
                  <b>En trener var til stede</b><span>Noteres på resultatet. «Kontrollert» krever at treneren fører selv.</span><i aria-hidden />
                </button>
              </div>
            </div>
            <label className="phn-felt"><span>Utstyr <span className="phn-kilde">valgfritt, skill med komma</span></span>
              <input value={u.utstyr} onChange={(e) => sett("utstyr", e.target.value.slice(0, 600))} placeholder="Driver, TrackMan" />
            </label>
            <label className="phn-felt"><span>Notat før testen <span className="phn-kilde">valgfritt</span></span>
              <textarea rows={2} value={u.forNotat} placeholder="Søvn, oppvarming, vær" onChange={(e) => sett("forNotat", e.target.value.slice(0, 2000))} />
            </label>
          </div>
        )}

        {steg === 3 && valgt && (
          <div className="phn-nt-steg">
            <h2>Resultat</h2>
            <div className="phn-felt phn-nt-stor">
              <label htmlFor="ph14ny-res">Beste forsøk</label>
              <input id="ph14ny-res" inputMode="decimal" autoComplete="off" value={u.resultat} aria-describedby="ph14ny-enhet" onChange={(e) => sett("resultat", e.target.value.slice(0, 12))} />
              <span className="phn-nt-enhet" id="ph14ny-enhet">{valgt.enhet}</span>
            </div>
            <p className="phn-kilde" style={{ textAlign: "center" }}>Komma og punktum virker begge.</p>
            {u.resultat.trim() !== "" && (verdi === null || verdi < 0) && <p className="phn-nt-feil" role="alert">Skriv et tall, for eksempel 108,4.</p>}
          </div>
        )}

        {steg === 4 && valgt && (
          <div className="phn-nt-steg">
            <h2>Ser det riktig ut?</h2>
            <section className={`phn-kort phn-nt-fylt ${valgt.akse}`}>
              <div className="phn-hoved"><strong>{verdi !== null ? tall(verdi, 2) : "—"}</strong><span>{valgt.enhet}</span></div>
              <p>{delta}{rekord ? " · Personlig rekord" : ""}</p>
            </section>
            <ul className="phn-nt-oppsum">
              <li><span>Test</span><b>{valgt.navn}</b></li>
              <li><span>Dato og sted</span><b>{LANG.format(datoFraDag(u.dato))} · {u.sted}</b></li>
              <li><span>Ført av</span><b>{u.trener ? "Egenført · trener til stede" : "Egenført"}</b></li>
              {u.utstyr.trim() && <li><span>Utstyr</span><b>{u.utstyr}</b></li>}
            </ul>
            <label className="phn-felt"><span>Notat etter testen <span className="phn-kilde">valgfritt</span></span>
              <textarea rows={2} value={u.etterNotat} onChange={(e) => sett("etterNotat", e.target.value.slice(0, 2000))} />
            </label>
            <div className="phn-nt-bryter">
              <b>Del med {coachNavn ?? "coach"}</b>
              <span>Coachen ser resultatet i Spiller 360</span>
              <button type="button" role="switch" aria-checked={u.del} aria-label={`Del med ${coachNavn ?? "coach"}`} onClick={() => sett("del", !u.del)} />
            </div>
          </div>
        )}

        {feil && <p className="phn-nt-feil" role="alert">{feil}</p>}

        <div className="phn-nt-festet">
          <button type="button" className="phn-knapp sek" disabled={pending} onClick={() => (steg === 1 ? avbrytRef.current?.showModal() : gaa(steg - 1))} aria-haspopup={steg === 1 ? "dialog" : undefined}>
            {steg === 1 ? "Avbryt" : "Tilbake"}
          </button>
          {steg < 4 ? (
            <button type="button" className="phn-knapp pri" disabled={!kanVidere} onClick={() => gaa(steg + 1)}>
              Neste <ChevronRight className="phn-ikon" aria-hidden />
            </button>
          ) : (
            <button type="button" className="phn-knapp pri" disabled={pending} onClick={lagre}>{pending ? "Lagrer …" : "Lagre resultatet"}</button>
          )}
        </div>
      </div>

      <dialog ref={avbrytRef} className="phn-sd-dialog" aria-labelledby="ph14ny-avbryt">
        <div className="phn-ark-kropp">
          <h2 id="ph14ny-avbryt" style={{ margin: 0, font: "600 19px/1.25 var(--phn-sans)" }}>Forkaste testen?</h2>
          <p className="phn-forklar">Det du har ført, blir ikke lagret.</p>
          <div className="phn-nt-dialog-knapper">
            <button type="button" className="phn-knapp rust" onClick={forkast}>Forkast testen</button>
            <button type="button" className="phn-knapp sek" onClick={() => avbrytRef.current?.close()}>Fortsett å føre</button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
