import { hentSesongsporsmal, IUP_FORDELINGSOMRAADER, type IupSesongevaluering } from "@/lib/iup/sesongevaluering";
import { hentUtviklingssporsmal, UTVIKLINGSSJEKK_SKALA, type IupBesvarelse } from "@/lib/iup/utviklingssjekk";
import type { LevertIupProfilrad } from "@/lib/iup/trener-profil-lesing";

const typeNavn = { UTVIKLINGSSJEKK: "Utviklingssjekk", SESONGEVALUERING: "Sesongevaluering" } as const;
const dato = (iso: string) => new Intl.DateTimeFormat("nb-NO", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" }).format(new Date(`${iso}T12:00:00Z`));
const etikett = (verdi: string) => ({ UNG: "Ung", JUNIOR: "Junior", AMATOR: "Amatør", PROFESJONELL: "Profesjonell", ALLE: "Alle nivåer" }[verdi] ?? verdi);

function Svarinnhold({ svar }: { svar: IupBesvarelse | IupSesongevaluering }) {
  if ("svar" in svar) {
    return <div>
      <p style={{ fontSize: 13 }}>Skala 1–5: {UTVIKLINGSSJEKK_SKALA.map((s) => `${s.verdi} ${s.tekst.toLowerCase()}`).join(" · ")}</p>
      {hentUtviklingssporsmal(svar.versjon, svar.niva).map((sporsmal) => <div key={sporsmal.id} style={{ padding: "10px 0", borderTop: "1px solid currentColor", borderColor: "color-mix(in srgb, currentColor 18%, transparent)" }}>
        <div style={{ fontSize: 13 }}>{sporsmal.kategori} · {sporsmal.tekst}</div>
        <strong>{svar.svar[sporsmal.id]} / 5</strong>
      </div>)}
    </div>;
  }
  const sporsmal = hentSesongsporsmal(svar.versjon);
  return <div>
    <p>Sesongevaluering · skala 1–4</p>
    {sporsmal.map((s) => <div key={s.id} style={{ padding: "10px 0", borderTop: "1px solid color-mix(in srgb, currentColor 18%, transparent)" }}>
      <strong style={{ fontSize: 13 }}>{s.tekst}</strong>
      <div>{s.type === "FRITEKST" ? svar.fritekst[s.id] : `${svar.vurderinger[s.id]} / 4`}</div>
    </div>)}
    <h4>Tidsfordeling · faktisk</h4><p>{IUP_FORDELINGSOMRAADER.map((omrade) => `${omrade} ${svar.fordelingFaktisk[omrade]} %`).join(" · ")}</p>
    <h4>Tidsfordeling · planlagt</h4><p>{IUP_FORDELINGSOMRAADER.map((omrade) => `${omrade} ${svar.fordelingPlanlagt[omrade]} %`).join(" · ")}</p>
    <h4>Forbedringspunkter</h4><ol>{svar.forbedringspunkter.map((punkt, i) => <li key={i}>{punkt}</li>)}</ol>
  </div>;
}

/** Read-only visning for profilflater. Serverkomponent uten skrivehandlinger. */
export function LeverteIupProfil({ rader, tittel = "Leverte IUP-besvarelser" }: { rader: LevertIupProfilrad[]; tittel?: string }) {
  return <section aria-labelledby="leverte-iup-tittel">
    <h2 id="leverte-iup-tittel">{tittel}</h2>
    <p>Spillerens leverte svar med originalt kildeår og nivå. Utkast vises ikke.</p>
    {rader.length === 0 ? <p>Ingen leverte IUP-besvarelser.</p> : rader.map((rad) => <details key={rad.id} style={{ padding: "12px 0", borderTop: "1px solid color-mix(in srgb, currentColor 18%, transparent)" }}>
      <summary style={{ cursor: "pointer", fontWeight: 700 }}>
        {typeNavn[rad.type]} · IUP {rad.versjon.replace("iup-", "")} · {etikett(rad.niva)} · {dato(rad.periodeStart)}–{dato(rad.periodeSlutt)}
        <span style={{ display: "block", fontWeight: 400, fontSize: 12 }}>Levert {dato(rad.levert)} · revisjon {rad.revisjon}</span>
      </summary>
      {rad.innhold ? <Svarinnhold svar={rad.innhold} /> : <p role="alert">Kilde- eller formatavvik. Besvarelsen vises ikke.</p>}
    </details>)}
  </section>;
}
