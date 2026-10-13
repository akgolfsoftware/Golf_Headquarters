"use client";

import { useId, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Knapp } from "@/components/precision/pa";
import { FysRegistreringSchema, type FysRegistrering } from "@/lib/portal-live/fys-registrering";
import type { DrillItem } from "@/lib/portal-live/ph04-07-data";

type Props = { drill: DrillItem; value: FysRegistrering | null; onChange: (reg: FysRegistrering) => void; disabled?: boolean };
type SettKladd = { vekt: string; reps: string };
const number = (value: string) => value.trim() ? Number(value.replace(",", ".")) : NaN;
const blankSet = (): SettKladd => ({ vekt: "", reps: "" });
const inputStyle = { fontFamily: "var(--font-mono)", minWidth: 0, minHeight: "var(--hit-min)", width: "100%" };
const labelStyle = { display: "grid", gap: 6, minWidth: 0, font: "var(--type-body-s)", color: "var(--text-primary)" };

/** Samme FYS-lagring som før. Planverdier er hjelp, aldri forhåndsregistrerte målinger. */
export function FysPrecisionLogger({ drill, value, onChange, disabled }: Props) {
  const id = useId();
  const [type, setType] = useState<FysRegistrering["type"] | "">(value?.type ?? drill.fys?.type ?? "");
  const [sett, setSett] = useState<SettKladd[]>(value?.type === "styrke" ? value.sett.map((s) => ({ vekt: String(s.vekt), reps: String(s.reps) })) : [blankSet()]);
  const [minutter, setMinutter] = useState(value?.type === "kondisjon" ? String(value.minutter) : "");
  const [sone, setSone] = useState(value?.type === "kondisjon" ? value.sone : "");
  const [sekunder, setSekunder] = useState(value?.type === "hold" ? String(value.sekunder) : "");
  const [repetisjoner, setRepetisjoner] = useState(value?.type === "reps" ? String(value.repetisjoner) : "");
  const [error, setError] = useState<string | null>(null);

  function register() {
    const notat = value?.notat ?? "";
    const candidate = type === "styrke" ? { type, sett: sett.map((s) => ({ vekt: number(s.vekt), reps: number(s.reps) })), notat }
      : type === "kondisjon" ? { type, minutter: number(minutter), sone, notat }
        : type === "hold" ? { type, sekunder: number(sekunder), notat }
          : { type, repetisjoner: number(repetisjoner), notat };
    const parsed = FysRegistreringSchema.safeParse(candidate);
    if (!parsed.success) { setError("Fyll inn målingen. Velg pulssone for kondisjon, eller vekt og reps for hvert sett."); return; }
    setError(null); onChange(parsed.data);
  }
  const plan = drill.fys;
  const planText = [plan?.sett != null ? `${plan.sett} sett` : null, plan?.reps != null ? `${plan.reps} reps` : null,
    plan?.vektKg != null ? `${String(plan.vektKg).replace(".", ",")} kg` : null, plan?.minutter != null ? `${plan.minutter} min` : null,
    plan?.holdSek != null ? `${plan.holdSek} sek` : null, plan?.pulssone,
    ...(plan?.segmenter?.map((s) => `${s.minutter} min ${s.pulssone}`) ?? [])].filter(Boolean).join(" · ");
  return <fieldset disabled={disabled} className="pa-fys-logger" style={{ border: 0, padding: 0, margin: 0, minWidth: 0, display: "grid", gap: 16 }}>
    <legend style={{ font: "var(--type-title-s)", marginBottom: 12 }}>Fysisk registrering</legend>
    {planText && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Planlagt: {planText}</p>}
    {!value && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen fysisk måling registrert ennå.</p>}
    <label style={labelStyle} htmlFor={`${id}-type`}>Registreringsmåte
      <select id={`${id}-type`} className="ph05-input" value={type} onChange={(event) => { setType(event.target.value as FysRegistrering["type"] | ""); setError(null); }}>
        <option value="">Velg registreringsmåte</option><option value="styrke">Styrke · vekt og reps per sett</option>
        <option value="kondisjon">Kondisjon · minutter og pulssone</option><option value="hold">Bevegelighet · hold i sekunder</option><option value="reps">Bevegelighet · repetisjoner</option>
      </select>
    </label>
    {type === "styrke" && <div style={{ display: "grid", gap: 16, minWidth: 0 }}>
      {sett.map((rad, index) => <fieldset key={index} style={{ border: "1px solid var(--border-control)", borderRadius: "var(--radius)", padding: 12, margin: 0, minWidth: 0, display: "grid", gap: 12 }}>
        <legend style={{ font: "var(--type-body-s)", padding: "0 4px" }}>Sett {index + 1}</legend>
        <label htmlFor={`${id}-weight-${index}`} style={labelStyle}>Vekt (kg) · 0 for uten ekstern vekt
          <Input id={`${id}-weight-${index}`} className="ph05-input" style={inputStyle} inputMode="decimal" value={rad.vekt}
            placeholder={plan?.vektKg != null ? `Planlagt ${plan.vektKg} kg` : "Angi kg"} onChange={(event) => setSett((rows) => rows.map((s, i) => i === index ? { ...s, vekt: event.target.value } : s))} />
        </label>
        <label htmlFor={`${id}-reps-${index}`} style={labelStyle}>Gjennomførte repetisjoner
          <Input id={`${id}-reps-${index}`} className="ph05-input" style={inputStyle} inputMode="numeric" value={rad.reps}
            placeholder={plan?.reps != null ? `Planlagt ${plan.reps} reps` : "Angi reps"} onChange={(event) => setSett((rows) => rows.map((s, i) => i === index ? { ...s, reps: event.target.value } : s))} />
        </label>
        {sett.length > 1 && <Knapp variant="ghost" icon={Trash2} onClick={() => setSett((rows) => rows.filter((_, i) => i !== index))}>Fjern sett {index + 1}</Knapp>}
      </fieldset>)}
      <Knapp variant="secondary" icon={Plus} disabled={sett.length >= 20} onClick={() => setSett((rows) => [...rows, blankSet()])}>Legg til sett</Knapp>
    </div>}
    {type === "kondisjon" && <>
      <label style={labelStyle} htmlFor={`${id}-minutes`}>Gjennomført varighet (minutter)
        <Input id={`${id}-minutes`} className="ph05-input" style={inputStyle} inputMode="numeric" value={minutter} placeholder={plan?.minutter != null ? `Planlagt ${plan.minutter} min` : "Angi minutter"} onChange={(event) => setMinutter(event.target.value)} />
      </label>
      <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}><legend style={{ font: "var(--type-body-s)", marginBottom: 8 }}>Oppnådd pulssone</legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["S1", "S2", "S3", "S4", "S5"].map((zone) => <label key={zone} style={{ minHeight: "var(--hit-min)", minWidth: "var(--hit-min)", display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: "var(--radius)",
            background: sone === zone ? "var(--surface-selected)" : "var(--surface-card)", border: "1px solid var(--border-control)", font: "var(--type-body-s)", cursor: "pointer" }}>
            <input type="radio" name={`${id}-zone`} value={zone} checked={sone === zone} onChange={() => setSone(zone)} />{zone}
          </label>)}
        </div>
      </fieldset>
    </>}
    {type === "hold" && <label style={labelStyle} htmlFor={`${id}-seconds`}>Gjennomført hold (sekunder)
      <Input id={`${id}-seconds`} className="ph05-input" style={inputStyle} inputMode="numeric" value={sekunder} placeholder={plan?.holdSek != null ? `Planlagt ${plan.holdSek} sek` : "Angi sekunder"} onChange={(event) => setSekunder(event.target.value)} />
    </label>}
    {type === "reps" && <label style={labelStyle} htmlFor={`${id}-movement-reps`}>Gjennomførte repetisjoner
      <Input id={`${id}-movement-reps`} className="ph05-input" style={inputStyle} inputMode="numeric" value={repetisjoner} placeholder={plan?.reps != null ? `Planlagt ${plan.reps} reps` : "Angi reps"} onChange={(event) => setRepetisjoner(event.target.value)} />
    </label>}
    {error && <p role="alert" className="ph05-feil">{error}</p>}
    {type && <Knapp variant="secondary" onClick={register}>Registrer målingen</Knapp>}
  </fieldset>;
}
