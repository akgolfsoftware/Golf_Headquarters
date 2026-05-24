"use client";

import { useState } from "react";
import { Search } from "lucide-react";

const FORESLAATT = ["Pyramide", "Logg runde", "Bytt coach", "Oppgrader til Pro"];

/**
 * Hero-søkefelt for hjelp-senteret med klikkbare chips som setter input-verdi.
 * Filtrering på tvers av artikler kommer i v2 — i dag styrer den kun lokal state.
 */
export function HelpSearch() {
  const [query, setQuery] = useState("");

  return (
    <>
      <div className="relative w-full max-w-xl">
        <Search
          size={20}
          strokeWidth={1.75}
          aria-hidden="true"
          className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          aria-label="Søk i hjelp-artikler"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Søk hjelp-artikler eller skriv et spørsmål..."
          className="w-full rounded-lg border-[1.5px] border-border bg-card px-6 py-4 pl-14 text-base text-foreground outline-none transition-all focus:border-primary focus:shadow-[0_0_0_4px_var(--color-pyr-fys-track)]"
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {FORESLAATT.map((s) => {
          const aktiv = query === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(aktiv ? "" : s)}
              className={`inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm transition-colors ${
                aktiv
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>
    </>
  );
}
