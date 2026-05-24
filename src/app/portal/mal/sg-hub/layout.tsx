import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { SgHubModeToggle } from "@/components/sg-hub/SgHubModeToggle";

export default async function SgHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePortalUser();
  const { sgHubMode } = lesPreferences(user);

  return (
    <div className="mx-auto max-w-[1240px] space-y-6 px-4 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            SG Coaching Hub
          </p>
          <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">Strokes Gained</em> Analytics
          </h2>
        </div>
        <SgHubModeToggle current={sgHubMode} />
      </div>
      {children}
    </div>
  );
}
