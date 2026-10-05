import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { hentMineSamlingsinvitasjoner } from "@/lib/workbench/samlingsinvitasjon-actions";
import { SamlingsinvitasjonListe } from "./samlingsinvitasjon-liste";

export const dynamic = "force-dynamic";
export const metadata = { title: "Samlinger · PlayerHQ" };

export default async function SamlingsinvitasjonerPage() {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  if (user.role !== "PLAYER") redirect("/portal");
  const invitasjoner = await hentMineSamlingsinvitasjoner();
  return (
    <V2Shell bredde="full" aktiv="plan" nav={PLAYERHQ_NAV} navn={user.name ?? undefined}>
      <main className="pa-root"><div className="pa-side" style={{ maxWidth: 980, marginInline: "auto", paddingBlock: 28 }}>
        <header style={{ display: "flex", flexWrap: "wrap", alignItems: "end", justifyContent: "space-between", gap: 16, marginBottom: 22 }}>
          <div><p style={{ margin: "0 0 6px", color: "var(--text-secondary)", font: "var(--type-label-s)" }}>PLAYERHQ · WORKBENCH</p>
            <h1 style={{ margin: 0, color: "var(--text-primary)", font: "var(--type-heading-l)" }}>Invitasjoner til samlinger</h1>
            <p style={{ margin: "8px 0 0", color: "var(--text-secondary)", font: "var(--type-body-m)" }}>Se hele programmet og sjekk kalenderkollisjoner før du svarer.</p></div>
          <Link href="/portal/planlegge/workbench" style={{ minHeight: 44, display: "inline-flex", alignItems: "center", color: "var(--text-primary)", font: "var(--type-label-m)" }}>Åpne Workbench</Link>
        </header>
        <SamlingsinvitasjonListe invitasjoner={invitasjoner} />
      </div></main>
    </V2Shell>
  );
}
