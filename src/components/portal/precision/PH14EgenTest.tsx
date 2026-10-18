"use client";

/**
 * PH-14 Egen test i nytt design (PlayerHQ pakke 13, Stats resten). Stegvis skjema i fem steg:
 * navn og pyramide, slik gjør du testen, måling, hvem ser testen, se over. Erstatter NyTestEgenV2.
 * Fasit: docs/design-system/utkast-playerhq/stats-resten.html, malen «egentest». Stil: playerhq-ny-statsresten-test.css.
 *
 * Avvik:
 *   - Tid føres i hele minutter (feltet «min»), fordi testen lagrer estimert tid som tall.
 *   - Utstyr skrives som liste skilt med komma og lagres som før (opptil 20).
 *   - Regelen for poeng lages av enheten og retningen («Antall, høyest er best»); skjemaet har ikke eget felt
 *     for den. Retningen lagres også på testen (`retning`), så Ny test vet hva som er rekord.
 *   - Måltall per kategori A–K lagres under nivåsystemet AKA_AB. Tomt felt lagres ikke og vises som «—».
 *   - Forhåndsvisningen viser hvor mange av de elleve måltallene som er satt, fordi spillerens kategori
 *     ikke er kjent her.
 *   - «Gruppa di» vises bare når brukeren er med i en gruppe. «Akademiet» (alle i AK Golf) finnes bare for
 *     coach og admin, som før. «Deg og coachen» sender testen til coachens godkjenning, som før.
 *   - «Forkaste testen?» er en modal dialog (som Avbryt testen i PH-15), ikke et ark festet nederst.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-14-EGEN.
 */
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, X } from "lucide-react";
import { TmTilbake } from "./PH17TmFelles";
import { useToast } from "@/components/shared/toast-provider";
import { opprettCustomTest } from "@/app/portal/tren/tester/ny/egen/actions";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";
import "@/styles/playerhq-ny-statsdybde.css";
import "@/styles/playerhq-ny-statsresten-test.css";

type Pyramide = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
type Enhet = "antall" | "prosent" | "tid_sek" | "distanse_m" | "score" | "sett";
type Synlighet = "PRIVATE" | "COACH" | "GROUP" | "ACADEMY";
type Rolle = "ADMIN" | "COACH" | "PLAYER" | "PARENT" | "GUEST";

const PYRAMIDE: { id: Pyramide; c: string; cf: string; ci: string; navn: string }[] = [
  { id: "FYS", c: "var(--phn-fys)", cf: "var(--phn-fys-ink)", ci: "var(--phn-fys-ink)", navn: "Fysisk" },
  { id: "TEK", c: "var(--phn-tek)", cf: "var(--phn-tek-ink)", ci: "var(--phn-tek-ink)", navn: "Teknikk" },
  { id: "SLAG", c: "var(--phn-slag)", cf: "var(--phn-slag)", ci: "var(--phn-slag-ink)", navn: "Golfslag" },
  { id: "SPILL", c: "var(--phn-spill)", cf: "var(--phn-spill-ink)", ci: "var(--phn-spill-ink)", navn: "Spill" },
  { id: "TURN", c: "var(--phn-turn)", cf: "var(--phn-turn)", ci: "var(--phn-turn-ink)", navn: "Turnering" },
];
const ENHETER: { id: Enhet; navn: string }[] = [
  { id: "antall", navn: "Antall" }, { id: "prosent", navn: "Prosent" }, { id: "tid_sek", navn: "Tid" },
  { id: "distanse_m", navn: "Meter" }, { id: "score", navn: "Poeng" }, { id: "sett", navn: "Serier" },
];
const KATEGORIER = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"] as const;
const STEG_NAVN = ["Navn", "Slik gjør du den", "Måling", "Hvem ser den", "Se over"] as const;

export type Skjema = {
  navn: string;
  pyramide: Pyramide | null;
  beskrivelse: string;
  steg: string[];
  minutter: string;
  utstyr: string;
  enhet: Enhet;
  lavest: boolean;
  maaltall: Record<string, string>;
  synlighet: Synlighet;
};

/** `startSteg` og `startSkjema` brukes av prøvefila for å måle hvert steg. */
export function PH14EgenTest({ rolle, coachNavn, gruppeNavn, startSteg = 1, startSkjema }: {
  rolle: Rolle; coachNavn: string | null; gruppeNavn: string | null; startSteg?: number; startSkjema?: Partial<Skjema>;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [steg, setSteg] = useState(startSteg);
  const [feil, setFeil] = useState<string | null>(null);
  const avbrytRef = useRef<HTMLDialogElement>(null);
  const toppRef = useRef<HTMLDivElement>(null);
  const [s, setS] = useState<Skjema>({
    navn: "", pyramide: null, beskrivelse: "", steg: [""], minutter: "", utstyr: "",
    enhet: "antall", lavest: false, maaltall: {}, synlighet: "PRIVATE", ...startSkjema,
  });

  const sett = <K extends keyof Skjema>(k: K, v: Skjema[K]) => { setS((p) => ({ ...p, [k]: v })); setFeil(null); };
  const stegFylt = s.steg.map((t) => t.trim()).filter(Boolean);
  const minutter = s.minutter.trim() ? Number.parseInt(s.minutter, 10) : null;
  const minutterGyldig = minutter === null || (Number.isInteger(minutter) && minutter >= 0 && minutter <= 180);
  const enhetNavn = ENHETER.find((e) => e.id === s.enhet)!.navn;
  const regel = `${enhetNavn}, ${s.lavest ? "lavest" : "høyest"} er best`;
  const akse = PYRAMIDE.find((p) => p.id === s.pyramide) ?? null;
  const maaltallSatt = KATEGORIER.filter((k) => s.maaltall[k]?.trim());

  const synligheter: { id: Synlighet; navn: string; under: string }[] = [
    { id: "PRIVATE", navn: "Bare deg", under: "Privat" },
    { id: "COACH", navn: coachNavn ? `Deg og ${coachNavn}` : "Deg og coachen", under: "Coachen ser testen og resultatene, og kan godkjenne den for flere" },
    ...(gruppeNavn ? [{ id: "GROUP" as const, navn: "Gruppa di", under: `${gruppeNavn} kan ta testen` }] : []),
    ...(rolle === "COACH" || rolle === "ADMIN" ? [{ id: "ACADEMY" as const, navn: "Akademiet", under: "Alle i AK Golf kan ta testen" }] : []),
  ];

  const kanVidere =
    steg === 1 ? s.navn.trim().length >= 2 && s.pyramide !== null
      : steg === 2 ? stegFylt.length > 0 && minutterGyldig
        : true;

  function gaa(n: number) {
    setSteg(n);
    setFeil(null);
    toppRef.current?.scrollIntoView({ block: "start" });
  }

  function lagre() {
    if (!s.pyramide) { setFeil("Velg pyramide før du lagrer."); return; }
    const nivaaer = Object.fromEntries(KATEGORIER.flatMap((k) => (s.maaltall[k]?.trim() ? [[k, s.maaltall[k]!.trim()]] : [])));
    startTransition(async () => {
      try {
        await opprettCustomTest({
          name: s.navn.trim(),
          description: s.beskrivelse.trim() || null,
          pyramidArea: s.pyramide,
          protocol: {
            steg: stegFylt,
            estMinutter: minutter ?? undefined,
            utstyr: s.utstyr.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20),
            retning: s.lavest ? "lavest" : "hoyest",
          },
          malverdi: { enhet: s.enhet, nivaaSystem: "AKA_AB", nivaaer },
          scoringRule: regel,
          visibility: s.synlighet,
        });
        toast.success(s.synlighet === "COACH" ? "Testen er lagret og sendt til coachen. Du finner den under Tester." : "Testen er lagret. Du finner den under Tester.");
        router.push("/portal/tren/tester");
        router.refresh();
      } catch (e) {
        setFeil(e instanceof Error ? e.message : "Testen kunne ikke lagres. Det du skrev, er beholdt.");
      }
    });
  }

  return (
    <div className="phn phn-nt">
      <div className="phn-nt-smal">
        <TmTilbake href="/portal/tren/tester" tekst="Tester" />
        <div className="phn-nt-topp" ref={toppRef}>
          <div><div className="phn-dato">Tester · lag din egen</div><h1 className="phn-tittel">Egen test</h1></div>
          <div className="phn-nt-stegtopp">
            <small>Steg {steg} av 5 · {STEG_NAVN[steg - 1]}</small>
            <div className="phn-nt-spor" role="progressbar" aria-valuemin={1} aria-valuemax={5} aria-valuenow={steg} aria-label="Fremdrift">
              <span style={{ width: `${steg * 20}%` }} />
            </div>
          </div>
        </div>

        {steg === 1 && (
          <div className="phn-nt-steg">
            <h2>Hva heter testen?</h2>
            <label className="phn-felt">Navn
              <input value={s.navn} maxLength={100} placeholder="For eksempel Bunker til 3 m" onChange={(e) => sett("navn", e.target.value)} />
            </label>
            <div className="phn-felt" role="group" aria-labelledby="ph14egen-pyr">
              <span id="ph14egen-pyr">Pyramide</span>
              <div className="phn-nt-akser">
                {PYRAMIDE.map((p) => (
                  <button key={p.id} type="button" aria-pressed={s.pyramide === p.id} title={p.navn}
                    style={{ ["--c" as string]: p.c, ["--cf" as string]: p.cf }} onClick={() => sett("pyramide", p.id)}>
                    <i aria-hidden />{p.id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {steg === 2 && (
          <div className="phn-nt-steg">
            <h2>Slik gjør du testen</h2>
            <label className="phn-felt">Kort beskrivelse
              <textarea rows={2} value={s.beskrivelse} maxLength={2000} placeholder="Hva gjør du, og hva teller?" onChange={(e) => sett("beskrivelse", e.target.value)} />
            </label>
            <div className="phn-felt" role="group" aria-labelledby="ph14egen-steg">
              <span id="ph14egen-steg">Steg</span>
              <ol className="phn-nt-proto">
                {s.steg.map((t, i) => (
                  <li key={i}>
                    <input value={t} maxLength={300} aria-label={`Steg ${i + 1}`} onChange={(e) => sett("steg", s.steg.map((x, j) => (j === i ? e.target.value : x)))} />
                    <button type="button" aria-label={`Fjern steg ${i + 1}`} disabled={s.steg.length <= 1} onClick={() => sett("steg", s.steg.filter((_, j) => j !== i))}>
                      <X className="phn-ikon" aria-hidden />
                    </button>
                  </li>
                ))}
              </ol>
              <button type="button" className="phn-knapp sek" style={{ justifySelf: "start" }} disabled={s.steg.length >= 20} onClick={() => sett("steg", [...s.steg, ""])}>
                <Plus className="phn-ikon" aria-hidden />Legg til steg
              </button>
            </div>
            <div className="phn-to-felt">
              <label className="phn-felt">Tid (min)
                <input inputMode="numeric" value={s.minutter} placeholder="15" onChange={(e) => sett("minutter", e.target.value.replace(/[^0-9]/g, "").slice(0, 3))} />
              </label>
              <label className="phn-felt">Utstyr
                <input value={s.utstyr} placeholder="Sandwedge, 10 baller" onChange={(e) => sett("utstyr", e.target.value.slice(0, 600))} />
              </label>
            </div>
            {!minutterGyldig && <p className="phn-nt-feil" role="alert">Tiden kan være høyst 180 minutter.</p>}
          </div>
        )}

        {steg === 3 && (
          <div className="phn-nt-steg">
            <h2>Hvordan måles den?</h2>
            <div className="phn-felt" role="group" aria-labelledby="ph14egen-enhet">
              <span id="ph14egen-enhet">Måleenhet</span>
              <div className="phn-nt-chips">
                {ENHETER.map((e) => <button key={e.id} type="button" aria-pressed={s.enhet === e.id} onClick={() => sett("enhet", e.id)}>{e.navn}</button>)}
              </div>
            </div>
            <div className="phn-felt" role="group" aria-labelledby="ph14egen-best">
              <span id="ph14egen-best">Hva er best?</span>
              <div className="phn-valg">
                <button type="button" aria-pressed={!s.lavest} onClick={() => sett("lavest", false)}>Høyest</button>
                <button type="button" aria-pressed={s.lavest} onClick={() => sett("lavest", true)}>Lavest</button>
              </div>
            </div>
            <div className="phn-felt" role="group" aria-labelledby="ph14egen-maal">
              <span id="ph14egen-maal">Måltall per kategori <span className="phn-kilde">valgfritt</span></span>
              <div className="phn-nt-maaltall">
                {KATEGORIER.map((k) => (
                  <label key={k}>{k}
                    <input inputMode="decimal" placeholder="—" value={s.maaltall[k] ?? ""} maxLength={12} onChange={(e) => sett("maaltall", { ...s.maaltall, [k]: e.target.value })} />
                  </label>
                ))}
              </div>
              <span className="phn-kilde">Står feltet tomt, vises «—» for den kategorien.</span>
            </div>
          </div>
        )}

        {steg === 4 && (
          <div className="phn-nt-steg">
            <h2>Hvem ser testen?</h2>
            <div className="phn-nt-velgkort" role="group" aria-label="Hvem ser testen">
              {synligheter.map((v) => (
                <button key={v.id} type="button" aria-pressed={s.synlighet === v.id} onClick={() => sett("synlighet", v.id)}>
                  <b>{v.navn}</b><span>{v.under}</span><i aria-hidden />
                </button>
              ))}
            </div>
          </div>
        )}

        {steg === 5 && akse && (
          <div className="phn-nt-steg">
            <h2>Slik ser den ut</h2>
            <section className="phn-kort phn-nt-forhand" style={{ ["--c" as string]: akse.c, ["--ci" as string]: akse.ci }}>
              <div className="phn-sek-topp"><b>{s.navn.trim()}</b><span className="phn-nt-akse-tekst">{akse.id}</span></div>
              <p className="phn-forklar">{[s.beskrivelse.trim(), `${regel}.`].filter(Boolean).join(" ")}</p>
              <div className="phn-nt-tre">
                <span><b>{minutter !== null ? `${minutter} min` : "—"}</b>tid</span>
                <span><b>{maaltallSatt.length || "—"}</b>av 11 måltall satt</span>
                <span><b>{s.synlighet === "PRIVATE" ? "Privat" : s.synlighet === "COACH" ? (coachNavn ?? "Coach") : s.synlighet === "GROUP" ? "Gruppa" : "Akademiet"}</b>synlig for</span>
              </div>
            </section>
          </div>
        )}

        {feil && <p className="phn-nt-feil" role="alert">{feil}</p>}

        <div className="phn-nt-festet">
          <button type="button" className="phn-knapp sek" disabled={pending} onClick={() => (steg === 1 ? avbrytRef.current?.showModal() : gaa(steg - 1))} aria-haspopup={steg === 1 ? "dialog" : undefined}>
            {steg === 1 ? "Avbryt" : "Tilbake"}
          </button>
          {steg < 5 ? (
            <button type="button" className="phn-knapp pri" disabled={!kanVidere} onClick={() => gaa(steg + 1)}>
              Neste <ChevronRight className="phn-ikon" aria-hidden />
            </button>
          ) : (
            <button type="button" className="phn-knapp pri" disabled={pending} onClick={lagre}>{pending ? "Lagrer …" : "Lagre testen"}</button>
          )}
        </div>
      </div>

      <dialog ref={avbrytRef} className="phn-sd-dialog" aria-labelledby="ph14egen-avbryt">
        <div className="phn-ark-kropp">
          <h2 id="ph14egen-avbryt" style={{ margin: 0, font: "600 19px/1.25 var(--phn-sans)" }}>Forkaste testen?</h2>
          <p className="phn-forklar">Det du har skrevet, blir ikke lagret.</p>
          <div className="phn-nt-dialog-knapper">
            <button type="button" className="phn-knapp rust" onClick={() => { avbrytRef.current?.close(); router.push("/portal/tren/tester"); }}>Forkast testen</button>
            <button type="button" className="phn-knapp sek" onClick={() => avbrytRef.current?.close()}>Fortsett</button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
