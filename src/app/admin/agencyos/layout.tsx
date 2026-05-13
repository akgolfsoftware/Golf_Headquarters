import { AgencyOSTabNav } from "./_tab-nav";

export default function AgencyOSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <AgencyOSTabNav />
      {children}
    </div>
  );
}
