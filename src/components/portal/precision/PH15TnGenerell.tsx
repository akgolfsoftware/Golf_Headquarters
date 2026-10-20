"use client";

/**
 * Registrering for de øvrige Team Norway-testene i designløftet 20.10.2026: ett slag om gangen med talltastatur,
 * etter canvaset «PlayerHQ nøkkelskjermer» (Registrer carry og side · antall slag · putt speed · golfslag på banen).
 * Brukes av PH15TnTest for protokollene av typene carry, putts, speed, course og free-course.
 *
 * Avvik:
 *   - 9 hull lengde føres med fem klasser og poeng (katalogen 20.10, TN_OK_VERSION); feet-feltet fra eldre utgaver er sperret og vises ikke her.
 *   - «4+» i putteantall lagres som 4 (katalogen har ett heltall per forsøk).
 *   - Hastighet (valgfritt felt på carry-testene) ligger bak «Hastighet (valgfritt)», ikke på tastaturet.
 *   - Fysiske tester (benkpress m.fl.) er ikke TN-protokoller og føres i den vanlige testflyten.
 */
import { useState } from "react";
import { Delete, Undo2 } from "lucide-react";
import { LENGDE_POENG, type TnField, type TnProtocol, type TnRow } from "@/lib/portal-tester/tn-catalog";
import { tnRowError, tnRowPreview, type TnResult } from "@/lib/portal-tester/tn-scoring";
import { tnReadRaw, type TnRaw } from "@/lib/portal-tester/tn-draft";

type Values = ReturnType<typeof tnReadRaw>["values"];
type Sett = (i: number, rad: Record<string, string> | null) => void;

const tall = (v: number, d = 1) => (Math.round(v * 10 ** d) / 10 ** d).toLocaleString("nb-NO", { minimumFractionDigits: d, maximumFractionDigits: d });

/** Hvilke protokoller som får denne skjermen: ingen sperrede, og felt vi kan tegne (tall og valg, uten flere obligatoriske valg etter hverandre). */
export function erGenerell(p: TnProtocol): boolean {
  if (p.blocked || !["carry", "putts", "speed", "course", "free-course", "length-putt"].includes(p.kind)) return false;
  return p.rows.every((r) => r.fields.every((f) => f.optional || !f.choices || f.choices.length <= 4 || f.key === "klasse"));
}

const erLengde = (p: TnProtocol) => p.kind === "length-putt" && p.rows[0]?.fields[0]?.key === "klasse";
const erPutteAntall = (p: TnProtocol) => p.kind === "putts" && p.rows[0]?.fields.length === 1 && !p.rows[0].fields[0]!.choices;
const kreverVisning = (f: TnField) => !f.optional;

export function GenerellTopp({ p, values, n, igjen, closed, resultat }: { p: TnProtocol; values: Values; n: number; igjen: number; closed: boolean; resultat: TnResult | null }) {
  const pv = p.rows.map((_, i) => tnRowPreview(p, i, values[String(i + 1)])).filter((x): x is NonNullable<typeof x> => x != null);
  const pei = pv.length ? pv.reduce((a, x) => a + x.pei, 0) / pv.length : null;
  if (erLengde(p)) {
    const poeng: number[] = p.rows.flatMap((_, i) => { const k = values[String(i + 1)]?.klasse; return typeof k === "string" && k in LENGDE_POENG ? [LENGDE_POENG[k as keyof typeof LENGDE_POENG]] : []; });
    return (
      <div className="phn-fylt slag full">
        <span className="phn-akse-tekst">SLAG · {p.name.toUpperCase()}</span>
        <div className="phn-to-tall">
          <div><span className="phn-stor">{poeng.reduce((a, x) => a + x, 0).toLocaleString("nb-NO")}<small>/ {6 * p.rows.length} p</small></span><span className="phn-tall-etikett">Poeng så langt</span></div>
          <div><span className="phn-stor">{n}<small>/ {p.rows.length}</small></span><span className="phn-tall-etikett">Putter ført</span></div>
        </div>
        <span className="phn-trend">{closed ? (resultat ? "Lagret" : "Ikke lagret") : igjen ? `${igjen} putter igjen` : "Alle putter ført"}</span>
      </div>
    );
  }
  return (
    <div className={`phn-fylt ${p.kind === "speed" ? "tek" : "slag"} full`}>
      <span className="phn-akse-tekst">{p.kind === "speed" ? "TEK" : "SLAG"} · {p.name.toUpperCase()}</span>
      <div className="phn-to-tall">
        <div><span className="phn-stor">{n}<small>/ {p.rows.length}</small></span><span className="phn-tall-etikett">Slag ført</span></div>
        <div><span className="phn-stor">{pei != null ? tall(pei * 100) : "—"}<small>{pei != null ? "%" : ""}</small></span><span className="phn-tall-etikett">PEI, snitt så langt</span></div>
      </div>
      <span className="phn-trend">{closed ? (resultat ? "Lagret" : "Ikke lagret") : igjen ? `${igjen} slag igjen` : "Alle slag ført"}</span>
    </div>
  );
}

export function GenerellInn({ p, n, laast, alle, raw, sett, angre, kanAngre }: {
  p: TnProtocol; n: number; laast: boolean; alle: boolean; raw: TnRaw; sett: Sett; angre: () => void; kanAngre: boolean;
}) {
  const r = p.rows[n];
  if (!r || alle) {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <div className="phn-slag-naa"><span className="phn-nr">Ferdig</span><span className="phn-hva">Alle slag er ført<small>Lagre for å få resultatet i Stats.</small></span></div>
        <button type="button" className="phn-angre" disabled={laast || !kanAngre} onClick={angre}><Undo2 className="phn-ikon" aria-hidden />Angre siste</button>
      </div>
    );
  }
  return <Slag key={n} p={p} n={n} r={r} laast={laast} raw={raw} sett={sett} angre={angre} kanAngre={kanAngre} />;
}

function Slag({ p, n, r, laast, raw, sett, angre, kanAngre }: { p: TnProtocol; n: number; r: TnRow; laast: boolean; raw: TnRaw; sett: Sett; angre: () => void; kanAngre: boolean }) {
  const eks = raw[String(n + 1)] ?? {};
  const forrige = raw[String(n)] ?? {};
  const synlige = r.fields.filter(kreverVisning);
  const valgfrie = r.fields.filter((f) => f.optional);
  const tallFelt = synlige.filter((f) => !f.choices);
  const [lokal, setLokal] = useState<Record<string, string>>(() => {
    const ut: Record<string, string> = {};
    for (const f of r.fields) ut[f.key] = eks[f.key] ?? (f.key === "hole" ? forrige.hole ?? "" : f.key === "distanceUnit" ? "m" : "");
    // Sideavvik lagres med fortegn; tastaturet viser tallet uten fortegn og retningen for seg.
    return ut;
  });
  const [retning, setRetning] = useState<"V" | "H">(() => (eks.side?.trim().startsWith("-") ? "V" : "H"));
  const [aktiv, setAktiv] = useState<string>(() => tallFelt[0]?.key ?? "");
  const [melding, setMelding] = useState("");

  const harSide = tallFelt.some((f) => f.key === "side");
  const tekst = (key: string) => (key === "side" ? (lokal.side ?? "").replace(/^-/, "") : lokal[key] ?? "");
  const sammensatt = (): Record<string, string> => {
    const ut: Record<string, string> = { ...lokal };
    if (harSide) ut.side = tekst("side") ? `${retning === "V" ? "-" : ""}${tekst("side")}` : "";
    for (const f of valgfrie) if (!ut[f.key]?.trim()) delete ut[f.key];
    if (ut.distanceUnit === "m" && !ut.distance?.trim()) delete ut.distanceUnit;
    return ut;
  };
  const rad = sammensatt();
  const { values: tmp, error: tallFeil } = tnReadRaw(p, { ...raw, [String(n + 1)]: rad });
  const feil = tallFeil ?? tnRowError(r, tmp[String(n + 1)] ?? {}, true);
  const fh = !feil ? tnRowPreview(p, n, tmp[String(n + 1)] ?? {}) : null;

  function tast(t: string) {
    if (!aktiv) return;
    setMelding("");
    const cur = tekst(aktiv);
    if (t === "slett") { setLokal({ ...lokal, [aktiv]: cur.slice(0, -1) }); return; }
    if (t === "," && (cur.includes(",") || cur.includes("."))) return;
    if (cur.length >= 8) return;
    setLokal({ ...lokal, [aktiv]: cur + t });
  }
  function registrer(med?: Record<string, string>) {
    const ut = med ?? sammensatt();
    const { error: e1 } = tnReadRaw(p, { ...raw, [String(n + 1)]: ut });
    const e2 = e1 ?? tnRowError(r, tnReadRaw(p, { ...raw, [String(n + 1)]: ut }).values[String(n + 1)] ?? {}, true);
    if (e2) { setMelding(e2); return; }
    sett(n, ut);
  }

  const [navn, ...rest] = r.label.split(" · ");

  // 9 hull lengde: ett trykk registrerer klassen og går videre.
  if (erLengde(p)) {
    const f = r.fields[0]!;
    return (
      <div className="phn-gen">
        <div className="phn-slag-naa" aria-live="polite">
          <span className="phn-nr">Putt {n + 1} av {p.rows.length}</span>
          <span className="phn-hva">{rest.join(" · ") || navn}<small>Slå putten, og velg hvor langt fra hullet den ble liggende. Varier hellingen.</small></span>
        </div>
        <div className="phn-gen-klasser" role="group" aria-label="Restavstand">
          {f.choices!.map((v, i) => (
            <button key={v} type="button" className={i === 0 ? "hull" : ""} disabled={laast} onClick={() => registrer({ [f.key]: v })}>
              <b>{v}</b><strong>{LENGDE_POENG[v as keyof typeof LENGDE_POENG].toLocaleString("nb-NO")} p</strong>
            </button>
          ))}
        </div>
        <span className="phn-hjelp">Ett trykk registrerer og går videre.</span>
        <button type="button" className="phn-angre" disabled={laast || !kanAngre} onClick={angre}><Undo2 className="phn-ikon" aria-hidden />Angre siste</button>
      </div>
    );
  }

  // Putt 1–3 m: ett trykk registrerer antall slag og går videre.
  if (erPutteAntall(p)) {
    const f = r.fields[0]!;
    return (
      <div className="phn-gen">
        <div className="phn-slag-naa" aria-live="polite">
          <span className="phn-nr">Putt {n + 1} av {p.rows.length}</span>
          <span className="phn-hva">{rest.join(" · ") || navn}<small>Hvor mange slag til hull?</small></span>
        </div>
        <div className="phn-gen-svar" role="group" aria-label="Antall slag">
          {["1", "2", "3", "4"].map((v) => (
            <button key={v} type="button" disabled={laast} onClick={() => registrer({ [f.key]: v })}>{v === "4" ? "4+" : v}</button>
          ))}
        </div>
        <span className="phn-hjelp">Ett trykk registrerer og går videre. 4+ føres som 4 slag.</span>
        <button type="button" className="phn-angre" disabled={laast || !kanAngre} onClick={angre}><Undo2 className="phn-ikon" aria-hidden />Angre siste</button>
      </div>
    );
  }

  return (
    <div className="phn-gen">
      <div className="phn-slag-naa" aria-live="polite">
        <span className="phn-nr">Slag {n + 1} av {p.rows.length}</span>
        <span className="phn-hva">{navn}{rest.length > 0 && <small>{rest.join(" · ")}</small>}</span>
      </div>

      <div className={tallFelt.length > 1 ? "phn-to-inn" : undefined}>
        {tallFelt.map((f) => (
          <button key={f.key} type="button" className={`phn-gen-felt${aktiv === f.key ? " aktiv" : ""}`} disabled={laast} onClick={() => setAktiv(f.key)} aria-pressed={aktiv === f.key}>
            <span>{f.key === "side" ? "Side" : f.label}</span>
            <b>{tekst(f.key) || "—"}{f.unit && tekst(f.key) ? <small> {f.unit}</small> : null}</b>
          </button>
        ))}
      </div>

      {harSide && (
        <div className="phn-gen-seg" role="group" aria-label="Side">
          <button type="button" aria-pressed={retning === "V"} disabled={laast} onClick={() => setRetning("V")}>Venstre</button>
          <button type="button" aria-pressed={retning === "H"} disabled={laast} onClick={() => setRetning("H")}>Høyre</button>
        </div>
      )}

      {synlige.filter((f) => f.choices).map((f) => (
        <fieldset key={f.key} className="phn-gen-valg">
          <legend>{f.label}</legend>
          <div className="phn-gen-seg">
            {f.choices!.map((v) => (
              <button key={v} type="button" aria-pressed={lokal[f.key] === v} disabled={laast} onClick={() => setLokal({ ...lokal, [f.key]: lokal[f.key] === v ? "" : v })}>{v}</button>
            ))}
          </div>
        </fieldset>
      ))}

      <p className="phn-forhand" aria-live="polite">
        {melding ? melding : fh
          ? <><b>{tall(fh.distance)} m</b> fra {p.kind === "carry" ? "målet" : "hullet"} · PEI <b>{tall(fh.pei * 100)} %</b>{fh.points !== undefined && <> · <b>{fh.points} poeng</b></>}</>
          : "Skriv inn slaget, så ser du avstand og PEI før du registrerer."}
      </p>

      {aktiv && (
        <div className="phn-gen-tast" role="group" aria-label="Talltastatur">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ","].map((t) => (
            <button key={t} type="button" disabled={laast} aria-label={t === "," ? "Komma" : t} onClick={() => tast(t)}>{t}</button>
          ))}
          <button type="button" disabled={laast} onClick={() => tast("0")}>0</button>
          <button type="button" disabled={laast} aria-label="Slett siste tall" onClick={() => tast("slett")}><Delete className="phn-ikon" aria-hidden /></button>
        </div>
      )}

      {valgfrie.length > 0 && (
        <details className="phn-gen-valgfritt">
          <summary>Hastighet (valgfritt)</summary>
          {valgfrie.map((f) => f.choices ? (
            <fieldset key={f.key} className="phn-gen-valg"><legend>{f.label}</legend>
              <div className="phn-gen-seg">{f.choices.map((v) => <button key={v} type="button" aria-pressed={lokal[f.key] === v} onClick={() => setLokal({ ...lokal, [f.key]: lokal[f.key] === v ? "" : v })}>{v}</button>)}</div>
            </fieldset>
          ) : (
            <label key={f.key} className="phn-felt">{f.label}
              <input type="text" inputMode="decimal" autoComplete="off" maxLength={10} value={lokal[f.key] ?? ""} onChange={(e) => setLokal({ ...lokal, [f.key]: e.target.value })} />
            </label>
          ))}
        </details>
      )}

      <div className="phn-tb">
        <button type="button" className="registrer" disabled={laast} onClick={() => registrer()}>Registrer</button>
      </div>
      <button type="button" className="phn-angre" disabled={laast || !kanAngre} onClick={angre}><Undo2 className="phn-ikon" aria-hidden />Angre siste</button>
    </div>
  );
}

export function GenerellListe({ p, n, values }: { p: TnProtocol; n: number; values: Values }) {
  return (
    <section className="phn-kort">
      <div className="phn-sek-topp"><h2>Slagene</h2><span className="phn-kilde">{n} av {p.rows.length} ført</span></div>
      <ol className="phn-gen-liste">
        {p.rows.map((r, i) => {
          const v = values[String(i + 1)];
          const pv = v ? tnRowPreview(p, i, v) : null;
          return (
            <li key={i} className={v ? "ferdig" : i === n ? "naa" : ""}>
              <span className="nr">{i + 1}</span>
              <span className="navn">{r.label}</span>
              <span className="verdi">{v ? (pv ? `${tall(pv.distance)} m · PEI ${tall(pv.pei * 100)} %` : Object.entries(v).filter(([, x]) => x !== "" && x != null).map(([, x]) => String(x)).join(" · ")) : i === n ? "Neste" : "—"}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
