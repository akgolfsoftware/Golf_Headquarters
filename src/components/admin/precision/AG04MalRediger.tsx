"use client";

/**
 * AG-04-REST · Rediger e-postmal i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-04.jsx, fane Maler › «Rediger e-postmal»).
 * Merk: AG-innboks.jsx er nyere fasit for Innboks, men har ingen Maler-fane;
 * maleditoren har derfor bare AG-04.jsx som tegning (etag 1790464878364882).
 *
 * Tegningen har navn, emne, tekst, felt-piller, forhåndsvisning, Lagre, Avbryt
 * og Slett nederst i kortet. Koden beholder i tillegg det eksisterende: Send test, Sett som
 * standard, Arkiver og Aktiv-bryter, med de samme server-handlingene som før.
 * «Slett mal» finnes ikke som handling i appen (bare Arkiver) og er ikke laget.
 * Arkiver-bekreftelsen er rust (avslutter malen), som Avslutt-dialogene ellers.
 */
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, Check, Send, Star } from "lucide-react";
import { Knapp, KnappLenke, Meta, StatusPille } from "@/components/precision/pa";
import { Bryter, Dialogboks, Kort, Kolonner, Side, SideHode, Skjemafelt, Stabel, Tekstfelt } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { saveTemplate, sendTestEmail, setAsDefault, archiveTemplate } from "@/app/admin/(legacy)/email-templates/[id]/rediger/actions";
import "@/styles/precision-a4.css";
import "@/styles/precision-a5.css";

export type AG04MalData = { id: string; slug: string; name: string; subject: string; body: string; active: boolean };
export type AG04MalProps = { mal: AG04MalData; testMottaker: string };

/** Eksempelverdier for forhåndsvisningen. Ikke ekte personer. */
export const AG04_EKSEMPEL: Record<string, string> = {
  spillerNavn: "Test Spiller",
  spillerFornavn: "Test",
  coachNavn: "Test Coach",
  klubbNavn: "Eksempelklubb",
  okt_navn: "Sving-økt",
  okt_dato: "torsdag 22. mai",
  okt_tid: "16:30",
  okt_lokasjon: "Eksempelanlegg",
  plan_navn: "Vår-blokk · uke 21",
  plan_lengde: "4 uker",
  hcp: "—",
  pris: "—",
  link: "https://akgolf.no/portal",
};

const TOKEN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
const fyll = (t: string) => t.replace(TOKEN, (_, k: string) => AG04_EKSEMPEL[k] ?? `{{${k}}}`);

export function AG04MalRediger({ mal, testMottaker }: AG04MalProps) {
  const router = useRouter();
  const [venter, start] = useTransition();
  const [melding, setMelding] = useState<{ type: "ok" | "signal"; tekst: string } | null>(null);
  const [name, setName] = useState(mal.name);
  const [subject, setSubject] = useState(mal.subject);
  const [body, setBody] = useState(mal.body);
  const [active, setActive] = useState(mal.active);
  const [arkiverApen, setArkiverApen] = useState(false);

  const endret = name !== mal.name || subject !== mal.subject || body !== mal.body || active !== mal.active;
  const iBruk = useMemo(() => Array.from(new Set(Array.from(`${subject}\n${body}`.matchAll(TOKEN), (m) => m[1]!))), [subject, body]);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  function si(type: "ok" | "signal", tekst: string) {
    if (timer.current) clearTimeout(timer.current);
    setMelding({ type, tekst });
    timer.current = setTimeout(() => setMelding(null), 3500);
  }
  const feilTekst = (e: unknown, alt: string) => (e instanceof Error ? e.message : alt);

  const lagre = () => start(async () => {
    try { await saveTemplate(mal.id, { name, subject, body, active }); si("ok", "Malen er lagret."); router.refresh(); }
    catch (e) { si("signal", feilTekst(e, "Kunne ikke lagre.")); }
  });
  const sendTest = () => start(async () => {
    try { const r = await sendTestEmail(mal.id); si("ok", `Test sendt til ${r.recipient}.`); }
    catch (e) { si("signal", feilTekst(e, "Kunne ikke sende testen.")); }
  });
  const settStandard = () => start(async () => {
    try { await setAsDefault(mal.id); setActive(true); si("ok", "Satt som standard."); router.refresh(); }
    catch (e) { si("signal", feilTekst(e, "Kunne ikke sette som standard.")); }
  });
  const arkiver = () => { setArkiverApen(false); start(async () => {
    try { await archiveTemplate(mal.id); setActive(false); si("ok", "Malen er arkivert."); router.refresh(); }
    catch (e) { si("signal", feilTekst(e, "Kunne ikke arkivere.")); }
  }); };

  const status = endret ? <StatusPille tone="warn">Ulagrede endringer</StatusPille>
    : active ? <StatusPille tone="ok">Aktiv · lagret</StatusPille> : <StatusPille>Utkast · lagret</StatusPille>;

  return <Side max={1040}>
    <style>{".ag04-chip{min-height:44px}@media (min-width:1025px){.ag04-chip{min-height:36px}}"}</style>
    <SideHode
      kicker={`Innboks · Rediger e-postmal · ${mal.slug}`}
      title={name || "Ny mal"}
      sub="Maler brukes av Jarvis og deg når utkast lages. Utkast sendes aldri automatisk."
      actions={<KnappLenke href="/admin/kommunikasjon?fane=maler" variant="ghost">Tilbake til maler</KnappLenke>}
    />
    <div>{status}</div>
    {melding && <div role="status" aria-live="polite"><InlineVarsel tone={melding.type}>{melding.tekst}</InlineVarsel></div>}
    <Kolonner mal="repeat(auto-fit, minmax(min(100%, 340px), 1fr))">
      <Kort>
        <Stabel gap={14}>
          <Skjemafelt label="Navn på mal"><Tekstfelt value={name} onChange={setName} placeholder="Bookingbekreftelse" /></Skjemafelt>
          <Skjemafelt label="Emne" hint="Kan inneholde felter i doble krøllparenteser."><Tekstfelt mono value={subject} onChange={setSubject} placeholder="Din time {{okt_dato}}" /></Skjemafelt>
          <Skjemafelt label="Tekst" hint="Felter i doble krøllparenteser fylles ut når utkastet lages.">
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Hei {{spillerFornavn}},"
              style={{ width: "100%", boxSizing: "border-box", minHeight: 160, padding: 12, borderRadius: "var(--radius)", border: "1px solid var(--border-control)", background: "var(--surface-card)", color: "var(--text-primary)", font: "var(--type-num-s)", lineHeight: 1.5, resize: "vertical" }} />
          </Skjemafelt>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }} role="group" aria-label="Sett inn felt">
            {Object.keys(AG04_EKSEMPEL).map((k) => <button key={k} type="button" className="ag04-chip" style={{ padding: "0 10px", borderRadius: 999, border: "1px solid var(--border-strong)", background: "var(--surface-card)", color: "var(--text-primary)", font: "500 12px/1 var(--font-mono)", cursor: "pointer" }} onClick={() => setBody((b) => `${b} {{${k}}}`)}>{`{{${k}}}`}</button>)}
          </div>
          <Bryter checked={active} onChange={setActive} label="Aktiv · kan brukes av Jarvis" />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Knapp icon={Check} iconName="check" disabled={venter || !endret} loading={venter} onClick={lagre}>{endret ? "Lagre mal" : "Lagret"}</Knapp>
            <KnappLenke href="/admin/kommunikasjon?fane=maler" variant="ghost">Avbryt</KnappLenke>
            <span style={{ flex: 1 }} />
            <Knapp variant="ghost" icon={Send} iconName="send" disabled={venter} onClick={sendTest}>Send test</Knapp>
            <Knapp variant="ghost" icon={Star} iconName="star" disabled={venter || active} onClick={settStandard}>Sett som standard</Knapp>
            <Knapp variant="secondary" icon={Archive} iconName="archive" disabled={venter} onClick={() => setArkiverApen(true)}>Arkiver</Knapp>
          </div>
          <Meta>{`/ADMIN/EMAIL-TEMPLATES/${mal.id.toUpperCase()}/REDIGER`}</Meta>
        </Stabel>
      </Kort>
      <Kort>
        <Stabel gap={10}>
          <Meta>FORHÅNDSVISNING · EKSEMPELDATA</Meta>
          <div style={{ padding: 14, borderRadius: "var(--radius)", background: "var(--surface-flat)", border: "1px solid var(--border-hairline)", display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            <span style={{ font: "600 14px/1.3 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{fyll(subject) || "—"}</span>
            <span style={{ font: "var(--type-body-s)", color: "var(--text-body)", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{fyll(body) || "—"}</span>
          </div>
          <Meta>{iBruk.length ? `FELTER I BRUK · ${iBruk.length}` : "INGEN FELTER I BRUK"}</Meta>
          {iBruk.length > 0 && <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {iBruk.map((t) => <span key={t} style={{ font: "500 12px/1 var(--font-mono)", padding: "6px 8px", borderRadius: 999, border: "1px solid var(--border-hairline)", color: "var(--text-primary)" }}>{`{{${t}}}`}</span>)}
          </div>}
          <Meta>TEST SENDES TIL {testMottaker.toUpperCase()}</Meta>
        </Stabel>
      </Kort>
    </Kolonner>
    <Dialogboks open={arkiverApen} onClose={() => setArkiverApen(false)} title="Arkivere malen?"
      footer={<><Knapp variant="ghost" onClick={() => setArkiverApen(false)}>Avbryt</Knapp><Knapp variant="signal" onClick={arkiver}>Arkiver</Knapp></>}>
      <p style={{ margin: 0, font: "var(--type-body)" }}>Malen «{mal.name}» kan ikke lenger brukes av Jarvis. Utkast som allerede er laget beholdes.</p>
    </Dialogboks>
  </Side>;
}
