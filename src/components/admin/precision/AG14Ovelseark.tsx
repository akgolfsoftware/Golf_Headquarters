"use client";

/**
 * Øvelsesarket i Plan-hub (AG-14 › Sheet «Ny øvelse» / «Rediger øvelse»).
 *
 * Øvelsen planlegges i åtte trinn (docs/treningsplanlegging.md kap. 9–17):
 * pyramide, område, sted, måleutstyr, gjennomføring, press, mengde og mål.
 * Området styrer hvilke felt som vises (feltForOvelse), pyramiden filtrerer
 * bort felt som ikke hører hjemme i grenen. Ingenting sperrer et valg.
 * Belastning følger stedet og vises i formelen.
 *
 * Lagrer via opprettOvelseAction / oppdaterOvelseAction; oversettelsen står i
 * src/lib/agencyos/planhub-ovelse.ts.
 */
import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Knapp, Meta } from "@/components/precision/pa";
import { Ark, Felt, Inndata, Nedtrekk, Valgpille, Valgrad, Varsel, type PaAkse } from "@/components/precision/pa-planhub";
import {
  BELASTNING_LABEL,
  DIMENSJON_LABEL,
  MOTORIKK_LABEL,
  PRESS_KODER,
  PRESS_LABEL,
  PYRAMIDE_KODER,
  SAND_TRINN_KODER,
  SAND_TRINN_LABEL,
  hastighetForMotorikk,
  hastighetLabel,
  type DimensjonKode,
  type OmraadeKode,
} from "@/lib/domain/ak-formel-v2";
import {
  MAALEUTSTYR,
  MAALEUTSTYR_LABEL,
  MENGDE_ENHET_LABEL,
  STED_DELVALG,
  STED_HOVED_LABEL,
  TRENINGSMAATE,
  TRENINGSMAATE_LABEL,
  feltForOvelse,
  stedRekkefolge,
  type MengdeEnhet,
  type OvelseDetaljer,
  type StedHoved,
} from "@/lib/domain/workbench/ovelse-detaljer";
import {
  OMRAADER_PER_PYRAMIDE,
  belastningFor,
  formelFor,
  omraadeLabel,
  tilLagring,
  tilTrainingArea,
  tomtUtkast,
  utkastFraOvelse,
  validerUtkast,
  vaskUtkast,
  type OvelseFeil,
  type OvelseUtkast,
  type PlanhubOvelse,
} from "@/lib/agencyos/planhub-ovelse";
import { opprettOvelseAction, oppdaterOvelseAction } from "@/lib/actions/drills-actions";

const tall = (v: string): number | undefined => {
  if (v.trim() === "") return undefined;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};
const heltall = (v: string) => { const n = tall(v); return n === undefined ? undefined : Math.round(n); };

export function AG14Ovelseark({ open, ovelse, onLukk, onLagret }: {
  open: boolean;
  ovelse: PlanhubOvelse | null;
  onLukk: () => void;
  onLagret: (tittel: string, kode: string) => void;
}) {
  // Arket monteres på nytt for hver åpning (se AG14PlanHub), så utkastet starter
  // alltid fra den valgte øvelsen eller et tomt skjema.
  const [u, setU] = useState<OvelseUtkast>(() => (ovelse ? utkastFraOvelse(ovelse) : vaskUtkast(tomtUtkast())));
  const [feil, setFeil] = useState<OvelseFeil>({});
  const [serverFeil, setServerFeil] = useState<string | null>(null);
  const [lagrer, start] = useTransition();

  const endre = (p: Partial<OvelseUtkast>) => setU((x) => vaskUtkast({ ...x, ...p }));
  const endreDetaljer = (d: Partial<OvelseDetaljer>) => setU((x) => vaskUtkast({ ...x, detaljer: { ...x.detaljer, ...d } }));
  const felt = feltForOvelse(u.pyramide, tilTrainingArea(u.omraade));
  const d = u.detaljer;
  const hastigheter = u.motorikk ? hastighetForMotorikk(u.motorikk) : [];
  const sted = d.sted?.hoved;
  const mengde = d.mengde ?? { enhet: felt.mengde.enheter[0]! };
  const settMengde = (p: Partial<NonNullable<OvelseDetaljer["mengde"]>>) => endreDetaljer({ mengde: { ...mengde, ...p } });
  const erNy = !u.id;
  const antallFeil = Object.keys(feil).length;
  const belastning = belastningFor(u);

  function lagre() {
    const f = validerUtkast(u);
    setFeil(f);
    setServerFeil(null);
    if (Object.keys(f).length > 0) return;
    const input = tilLagring(u, ovelse?.parametre ?? null);
    const kode = formelFor(u);
    start(async () => {
      const res = u.id ? await oppdaterOvelseAction(u.id, input) : await opprettOvelseAction(input);
      if (res.ok) onLagret(erNy ? "Øvelsen er opprettet" : "Øvelsen er lagret", kode);
      else setServerFeil(res.error);
    });
  }

  return <Ark open={open} onClose={onLukk} kicker={erNy ? "Øvelsesbank · ny" : "Øvelsesbank · rediger"} tittel={erNy ? "Ny øvelse" : "Rediger øvelse"}
    footer={<>
      <Knapp fullWidth icon={Check} iconName="check" onClick={lagre} loading={lagrer}>{erNy ? "Opprett øvelse" : "Lagre øvelse"}</Knapp>
      <Knapp variant="ghost" fullWidth onClick={onLukk} disabled={lagrer}>Avbryt</Knapp>
    </>}>
    {antallFeil > 0 && <Varsel tone="warn" tittel="Øvelsen er ikke lagret">{antallFeil === 1 ? "Ett felt må rettes." : `${antallFeil} felt må rettes.`}</Varsel>}
    {serverFeil && <Varsel tone="warn" tittel="Øvelsen kunne ikke lagres">{serverFeil}</Varsel>}

    <Felt label="Navn" required error={feil.navn}>
      <Inndata value={u.navn} onChange={(e) => endre({ navn: e.target.value })} placeholder="7-jern mot mål" />
    </Felt>

    <Valgrad label="1 · Pyramide">
      {PYRAMIDE_KODER.map((p) => <Valgpille key={p} akse={p.toLowerCase() as PaAkse} valgt={u.pyramide === p} onVelg={() => endre({ pyramide: p })}>{p}</Valgpille>)}
    </Valgrad>

    <Felt label="2 · Treningsområde">
      <Nedtrekk value={u.omraade} onChange={(e) => endre({ omraade: e.target.value as OmraadeKode })}
        options={OMRAADER_PER_PYRAMIDE[u.pyramide].map((o) => ({ value: o, label: omraadeLabel(o) ?? o }))} />
    </Felt>

    <div className="a10-felt2">
      <Felt label="3 · Sted" hint={belastning ? `Belastning: ${BELASTNING_LABEL[belastning]}` : undefined}>
        <Nedtrekk value={sted ?? ""} onChange={(e) => endreDetaljer({ sted: e.target.value ? { hoved: e.target.value as StedHoved } : undefined })}
          options={[{ value: "", label: "—" }, ...stedRekkefolge(u.pyramide).map((s) => ({ value: s, label: STED_HOVED_LABEL[s] }))]} />
      </Felt>
      {sted && sted !== "ANNET" && <Felt label="Del av stedet" valgfritt>
        <Nedtrekk value={d.sted?.delvalg ?? ""} onChange={(e) => endreDetaljer({ sted: { hoved: sted, ...(e.target.value ? { delvalg: e.target.value } : {}) } })}
          options={[{ value: "", label: "—" }, ...STED_DELVALG[sted].map((v) => ({ value: v, label: v }))]} />
      </Felt>}
    </div>

    {felt.maaleutstyr && <Valgrad label="4 · Måleutstyr" hint="Valgfritt">
      {MAALEUTSTYR.map((m) => <Valgpille key={m} valgt={d.maaleutstyr === m} onVelg={() => endreDetaljer({ maaleutstyr: d.maaleutstyr === m ? undefined : m })}>{MAALEUTSTYR_LABEL[m]}</Valgpille>)}
    </Valgrad>}

    <div className="a10-stabel">
      <span className="kicker">5 · Gjennomføring</span>
      {felt.laeringssteg
        ? <Valgrad label="Læringssteg">
          {(Object.keys(MOTORIKK_LABEL) as Array<keyof typeof MOTORIKK_LABEL>).map((m) => <Valgpille key={m} valgt={u.motorikk === m} onVelg={() => endre({ motorikk: m })}>{MOTORIKK_LABEL[m]}</Valgpille>)}
        </Valgrad>
        : <Meta>LÆRINGSSTEG GJELDER BARE FULLSVING I TEK OG SLAG</Meta>}
      {felt.laeringssteg && hastigheter.length > 0 && <Valgrad label="Hastighet" hint="Prosent av Club Speed">
        {hastigheter.map((h) => <Valgpille key={h} mono valgt={d.hastighetProsent === h} onVelg={() => endreDetaljer({ hastighetProsent: d.hastighetProsent === h ? undefined : h })}>{hastighetLabel(h)}</Valgpille>)}
      </Valgrad>}
      {felt.treningsmaate && <Valgrad label="Treningsmåte" hint="Valgfritt">
        {TRENINGSMAATE.map((t) => <Valgpille key={t} valgt={d.treningsmaate === t} onVelg={() => endreDetaljer({ treningsmaate: d.treningsmaate === t ? undefined : t })}>{TRENINGSMAATE_LABEL[t]}</Valgpille>)}
      </Valgrad>}
      {felt.tekniskFokus.length > 0 && <Felt label="Teknisk fokus · maks ett" valgfritt>
        <Nedtrekk value={d.tekniskFokus ?? ""} onChange={(e) => endreDetaljer({ tekniskFokus: (e.target.value || undefined) as DimensjonKode | undefined })}
          options={[{ value: "", label: "—" }, ...felt.tekniskFokus.map((k) => ({ value: k, label: DIMENSJON_LABEL[k] }))]} />
      </Felt>}
      {felt.sandTrinn && <Valgrad label="Sandtrinn">
        {SAND_TRINN_KODER.map((s) => <Valgpille key={s} valgt={d.sandTrinn === s} onVelg={() => endreDetaljer({ sandTrinn: d.sandTrinn === s ? undefined : s })}>{SAND_TRINN_LABEL[s]}</Valgpille>)}
      </Valgrad>}
    </div>

    {felt.press && <Valgrad label="6 · Press">
      {PRESS_KODER.map((p) => <Valgpille key={p} valgt={u.press === p} onVelg={() => endre({ press: p })}>{PRESS_LABEL[p]}</Valgpille>)}
    </Valgrad>}

    <div className="a10-stabel">
      <span className="kicker">7 · Mengde</span>
      <div className="a10-felt2">
        {felt.mengde.enheter.length > 1 && <Felt label="Enhet">
          <Nedtrekk value={mengde.enhet} onChange={(e) => settMengde({ enhet: e.target.value as MengdeEnhet })}
            options={felt.mengde.enheter.map((m) => ({ value: m, label: MENGDE_ENHET_LABEL[m] }))} />
        </Felt>}
        <Felt label={MENGDE_ENHET_LABEL[mengde.enhet]} required error={feil.mengde}>
          <Inndata mono inputMode="numeric" value={mengde.antall ?? ""} placeholder="30" onChange={(e) => settMengde({ antall: heltall(e.target.value) })} />
        </Felt>
        {felt.mengde.reps && <Felt label="Repetisjoner" valgfritt><Inndata mono inputMode="numeric" value={mengde.reps ?? ""} placeholder="—" onChange={(e) => settMengde({ reps: heltall(e.target.value) })} /></Felt>}
        {felt.mengde.vekt && <Felt label="Vekt (kg)" valgfritt><Inndata mono inputMode="decimal" value={mengde.vektKg ?? ""} placeholder="—" onChange={(e) => settMengde({ vektKg: tall(e.target.value) })} /></Felt>}
        {felt.mengde.rir && <Felt label="RIR" valgfritt><Inndata mono inputMode="numeric" value={mengde.rir ?? ""} placeholder="—" onChange={(e) => settMengde({ rir: heltall(e.target.value) })} /></Felt>}
        {felt.mengde.pause && <Felt label="Pause (sek)" valgfritt><Inndata mono inputMode="numeric" value={mengde.pauseSek ?? ""} placeholder="—" onChange={(e) => settMengde({ pauseSek: heltall(e.target.value) })} /></Felt>}
      </div>
    </div>

    <div className="a10-stabel">
      <span className="kicker">8 · Mål</span>
      <Felt label="Resultatkrav" valgfritt><Inndata mono value={d.mal?.resultatkrav ?? ""} placeholder="±4 m" onChange={(e) => endreDetaljer({ mal: { ...d.mal, resultatkrav: e.target.value } })} /></Felt>
      <Felt label="Målemetode" valgfritt><Inndata value={d.mal?.malemetode ?? ""} placeholder="Avstand til mål, målt med TrackMan" onChange={(e) => endreDetaljer({ mal: { ...d.mal, malemetode: e.target.value } })} /></Felt>
    </div>

    <div className="a10-formel">
      <Meta>AK-FORMEL V2</Meta>
      <span className="a10-formel__kode">{formelFor(u)}</span>
    </div>
  </Ark>;
}
