import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { opprettUtfordring } from "../actions";

export default async function NyUtfordring() {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const drills = await prisma.exerciseDefinition.findMany({
    select: { id: true, name: true, pyramidArea: true },
    orderBy: { name: "asc" },
  });

  async function lagre(formData: FormData) {
    "use server";
    await opprettUtfordring({
      name: String(formData.get("name") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      drillId: String(formData.get("drillId") ?? "") || null,
      startAt: String(formData.get("startAt") ?? "") || null,
      endAt: String(formData.get("endAt") ?? "") || null,
    });
  }

  return (
    <div className="space-y-8">
      <Link
        href="/portal/utfordringer"
        className="inline-flex min-h-11 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground"
      >
        ← PlayerHQ · Utfordringer
      </Link>

      <PageHeader
        eyebrow="PlayerHQ · Ny utfordring"
        titleLead="Lag en"
        titleItalic="utfordring"
        sub="Velg en øvelse, sett varighet og inviter andre."
      />

      <form action={lagre} className="space-y-6 rounded-lg border border-border bg-card p-6">
        <Felt label="Navn">
          <input
            type="text"
            name="name"
            required
            placeholder="F.eks. «20-fots putts på en uke»"
            className={inputCls}
          />
        </Felt>

        <Felt label="Beskrivelse">
          <textarea
            name="description"
            rows={3}
            placeholder="Hva går utfordringen ut på? Hvordan teller scoren?"
            className={inputCls}
          />
        </Felt>

        <Felt label="Øvelse (valgfri)">
          <select name="drillId" className={inputCls} defaultValue="">
            <option value="">— Fritt-form utfordring —</option>
            {drills.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Felt>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Felt label="Startdato (valgfri)">
            <input type="datetime-local" name="startAt" className={inputCls} />
          </Felt>
          <Felt label="Sluttdato (valgfri)">
            <input type="datetime-local" name="endAt" className={inputCls} />
          </Felt>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href="/portal/utfordringer"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-primary hover:text-primary sm:ml-auto"
          >
            Avbryt
          </Link>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
          >
            Opprett utfordring
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full min-h-11 rounded-md border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
