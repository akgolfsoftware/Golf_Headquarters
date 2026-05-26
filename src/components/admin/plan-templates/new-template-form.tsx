"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import {
  createTemplate,
  type TemplateCreateInput,
} from "@/app/admin/plan-templates/actions";
import {
  ANBEFALT_FORDELING_PER_KATEGORI,
  FASE_ALLE,
  FASE_LABEL,
  KATEGORI_ALLE,
  KATEGORI_LABEL,
  PYR_COLOR,
  PYR_LABEL,
  type DisciplinFordeling,
} from "./shared";
import type { LPhase, NgfKategori, PyramidArea } from "@/generated/prisma/client";

const PYR_ALLE: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

export function NewTemplateForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [kategori, setKategori] = useState<NgfKategori>("E");
  const [lPhase, setLPhase] = useState<LPhase>("GRUNN");
  const [varighetUker, setVarighetUker] = useState(4);
  const [ukentligOktAntall, setUkentligOktAntall] = useState(5);
  const [fordeling, setFordeling] = useState<DisciplinFordeling>(
    ANBEFALT_FORDELING_PER_KATEGORI.E
  );
  const [minAlder, setMinAlder] = useState("");
  const [maxAlder, setMaxAlder] = useState("");

  const sum = Math.round(
    (fordeling.FYS + fordeling.TEK + fordeling.SLAG + fordeling.SPILL + fordeling.TURN) *
      100
  );

  function setKategoriAndFordeling(k: NgfKategori) {
    setKategori(k);
    setFordeling(ANBEFALT_FORDELING_PER_KATEGORI[k]);
  }

  function submit() {
    if (!name.trim()) {
      alert("Navn er påkrevd.");
      return;
    }
    if (sum !== 100) {
      alert(`Fordelingen må summere til 100% (er nå ${sum}%).`);
      return;
    }
    const input: TemplateCreateInput = {
      name: name.trim(),
      description: description.trim() || null,
      kategori,
      lPhase,
      varighetUker,
      ukentligOktAntall,
      disciplinFordeling: fordeling,
      minAlder: minAlder ? parseInt(minAlder, 10) : null,
      maxAlder: maxAlder ? parseInt(maxAlder, 10) : null,
      approved: false,
    };
    startTransition(async () => {
      const res = await createTemplate(input);
      if (res.ok) {
        router.push(`/admin/plan-templates/${res.data.templateId}/rediger`);
      } else {
        alert(res.error);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Navn
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-md border border-input bg-card px-4 text-sm focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            placeholder="F.eks. E Konkurranse Standard"
          />
        </label>

        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Beskrivelse
          </span>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-md border border-input bg-card px-4 py-2 text-sm focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Kategori
          </span>
          <select
            value={kategori}
            onChange={(e) => setKategoriAndFordeling(e.target.value as NgfKategori)}
            className="h-11 rounded-md border border-input bg-card px-4 text-sm"
          >
            {KATEGORI_ALLE.map((k) => (
              <option key={k} value={k}>
                {KATEGORI_LABEL[k]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Fase
          </span>
          <select
            value={lPhase}
            onChange={(e) => setLPhase(e.target.value as LPhase)}
            className="h-11 rounded-md border border-input bg-card px-4 text-sm"
          >
            {FASE_ALLE.map((f) => (
              <option key={f} value={f}>
                {FASE_LABEL[f]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Varighet (uker)
          </span>
          <input
            type="number"
            min={1}
            max={52}
            value={varighetUker}
            onChange={(e) => setVarighetUker(parseInt(e.target.value || "1", 10))}
            className="h-11 rounded-md border border-input bg-card px-4 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Økt per uke
          </span>
          <input
            type="number"
            min={1}
            max={14}
            value={ukentligOktAntall}
            onChange={(e) =>
              setUkentligOktAntall(parseInt(e.target.value || "1", 10))
            }
            className="h-11 rounded-md border border-input bg-card px-4 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Min alder
          </span>
          <input
            type="number"
            value={minAlder}
            onChange={(e) => setMinAlder(e.target.value)}
            className="h-11 rounded-md border border-input bg-card px-4 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Maks alder
          </span>
          <input
            type="number"
            value={maxAlder}
            onChange={(e) => setMaxAlder(e.target.value)}
            className="h-11 rounded-md border border-input bg-card px-4 text-sm"
          />
        </label>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          <span>Discipline-fordeling (start fra anbefalt)</span>
          <span className={sum === 100 ? "text-primary" : "text-destructive"}>
            {sum}%
          </span>
        </div>
        <div className="space-y-2">
          {PYR_ALLE.map((p) => (
            <div key={p} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: PYR_COLOR[p] }}
              />
              <span className="w-16 text-xs">{PYR_LABEL[p]}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(fordeling[p] * 100)}
                onChange={(e) =>
                  setFordeling({
                    ...fordeling,
                    [p]: parseInt(e.target.value, 10) / 100,
                  })
                }
                className="flex-1 accent-primary"
              />
              <span className="w-12 text-right font-mono text-xs">
                {Math.round(fordeling[p] * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" strokeWidth={1.75} />
          Opprett og fortsett til editor
        </button>
      </div>
    </div>
  );
}
