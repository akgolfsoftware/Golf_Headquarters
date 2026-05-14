"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

type CoachOption = {
  id: string; // 'alle' eller User.id
  navn: string;
};

type Props = {
  coaches: CoachOption[];
};

/**
 * Coach-velger for ADMIN i CoachHQ. Setter ?coach=<id> i URL.
 * 'alle' = ingen filter (default for ADMIN).
 * Brukes på /admin/{calendar,bookings,availability}.
 */
export function CoachFilter({ coaches }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [pending, startTransition] = useTransition();
  const valgt = search.get("coach") ?? "alle";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const ny = e.target.value;
    const params = new URLSearchParams(search);
    if (ny === "alle") params.delete("coach");
    else params.set("coach", ny);
    startTransition(() => {
      router.replace(
        `${pathname}${params.toString() ? `?${params.toString()}` : ""}`,
      );
    });
  }

  return (
    <label className="inline-flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        Coach
      </span>
      <select
        value={valgt}
        onChange={handleChange}
        disabled={pending}
        className="rounded-md border border-border bg-card px-4 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        <option value="alle">Alle coacher</option>
        {coaches.map((c) => (
          <option key={c.id} value={c.id}>
            {c.navn}
          </option>
        ))}
      </select>
    </label>
  );
}
