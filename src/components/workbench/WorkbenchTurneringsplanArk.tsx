"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ark } from "@/components/precision/pa-a4";
import { Knapp } from "@/components/precision/pa";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { lagreWorkbenchTurneringsplan } from "@/lib/workbench/turneringsplan-actions";
import type { WorkbenchTournamentPlanDto } from "@/lib/workbench/fys-turnering-data";
import type { TurneringsplanInput } from "@/lib/workbench/turneringsplan-kontrakt";

export function WorkbenchTurneringsplanArk({ playerId, dato, plan, onLukk }: { playerId: string; dato: string; plan?: WorkbenchTournamentPlanDto; onLukk: () => void }) {
  const router = useRouter(), [pending, start] = useTransition(), [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: plan?.title ?? "", focus: plan?.focus ?? "UTVIKLING", startDate: plan?.startDate ?? dato, endDate: plan?.endDate ?? dato,
    travelStartDate: plan?.travelStartDate ?? "", travelEndDate: plan?.travelEndDate ?? "", tour: plan?.tour ?? "", country: plan?.country ?? "", location: plan?.location ?? "",
    holes: String(plan?.holes ?? ""), priority: plan?.priority ?? "", wagrPower: String(plan?.wagrPower ?? ""), wagrSourceYear: String(plan?.wagrSourceYear ?? ""), wagrSource: plan?.wagrSource ?? "" });
  const [rounds, setRounds] = useState(plan?.rounds.map(r => ({ id: r.id, date: r.date, teeTimeMinutes: r.teeTimeMinutes })) ?? [{ date: dato, teeTimeMinutes: null as number | null, id: undefined as string | undefined }]);
  const felt = (key: keyof typeof form, label: string, type = "text") => <label className="ws-field">{label}<input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} /></label>;
  const save = () => start(async () => {
    setError(null);
    const input: TurneringsplanInput = { playerId, ...(plan ? { id: plan.id, expectedUpdatedAt: plan.updatedAt } : {}), title: form.title,
      focus: form.focus as TurneringsplanInput["focus"], startDate: form.startDate, endDate: form.endDate,
      travelStartDate: form.travelStartDate || null, travelEndDate: form.travelEndDate || null, rounds,
      metadata: { tour: form.tour.trim() || null, country: form.country.trim() || null, location: form.location.trim() || null,
        holes: form.holes ? Number(form.holes) as 9 | 18 : null, priority: form.priority as TurneringsplanInput["metadata"]["priority"] || null,
        wagrPower: form.wagrPower === "" ? null : Number(form.wagrPower), wagrSourceYear: form.wagrSourceYear === "" ? null : Number(form.wagrSourceYear), wagrSource: form.wagrSource.trim() || null } };
    try { const result = await lagreWorkbenchTurneringsplan(input); if (!result.ok) { setError(result.error); return; } router.refresh(); onLukk(); }
    catch { setError("Lagringen feilet. Inndataene er bevart; prøv igjen."); }
  });
  return <Ark open title={plan ? "Rediger turneringsplan" : "Ny turneringsplan"} kicker="Workbench · Turnering" onClose={onLukk}
    footer={<><Knapp fullWidth disabled={pending || !form.title.trim()} onClick={save}>{pending ? "Lagrer …" : plan ? "Lagre turneringsplan" : "Opprett som utkast"}</Knapp><Knapp fullWidth variant="ghost" onClick={onLukk}>Avbryt</Knapp></>}>
    {error && <InlineVarsel tone="warn">{error}</InlineVarsel>}
    <div className="a9-skjema">{felt("title", "Navn")}{felt("tour", "Tour")}{felt("country", "Land")}{felt("location", "Sted")}
      <label className="ws-field">Antall hull per runde<select value={form.holes} onChange={e => setForm(f => ({ ...f, holes: e.target.value }))}><option value="">Ikke angitt</option><option value="9">9 hull</option><option value="18">18 hull</option></select></label>
      <label className="ws-field">Prioritet<select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}><option value="">Ikke angitt</option><option value="MAJOR">Hovedturnering</option><option value="NORMAL">Normal</option><option value="LOCAL">Lokal</option></select></label>
      <label className="ws-field">Fokus<select value={form.focus} onChange={e => setForm(f => ({ ...f, focus: e.target.value }))}><option value="TRENING">Trening</option><option value="UTVIKLING">Utvikling</option><option value="PRESTASJON">Prestasjon</option></select></label>
      <div className="a9-feltrad">{felt("startDate", "Fra", "date")}{felt("endDate", "Til", "date")}</div>
      <div className="a9-feltrad">{felt("travelStartDate", "Reise fra", "date")}{felt("travelEndDate", "Reise til", "date")}</div>
      <label className="ws-field">Antall runder<select value={rounds.length} onChange={e => setRounds(old => Array.from({ length: Number(e.target.value) }, (_, i) => old[i] ?? { date: form.startDate, teeTimeMinutes: null, id: undefined }))}>{[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n}>{n}</option>)}</select></label>
      {rounds.map((r, i) => <div className="a9-feltrad" key={r.id ?? i}><label className="ws-field">Runde {i + 1} dato<input type="date" value={r.date} onChange={e => setRounds(old => old.map((v, j) => j === i ? { ...v, date: e.target.value } : v))} /></label><label className="ws-field">Runde {i + 1} start<input type="time" value={r.teeTimeMinutes === null ? "" : `${String(Math.floor(r.teeTimeMinutes / 60)).padStart(2, "0")}:${String(r.teeTimeMinutes % 60).padStart(2, "0")}`} onChange={e => { const [h, m] = e.target.value.split(":").map(Number); setRounds(old => old.map((v, j) => j === i ? { ...v, teeTimeMinutes: e.target.value ? h * 60 + m : null } : v)); }} /></label></div>)}
      <p className="a9-tekst">Reisedager lagres separat. Eksisterende runder med resultater eller notater kan ikke fjernes.</p>
      {felt("wagrPower", "Historisk WAGR Power", "number")}{felt("wagrSourceYear", "WAGR kildeår", "number")}{felt("wagrSource", "WAGR kilde")}
      <p className="a9-tekst">Historisk kildeverdi, ikke DG-feltstyrke. En verdi krever både kildeår og kilde; manglende verdi er ukjent.</p>
    </div>
  </Ark>;
}
