// Admin-shell-layout (CoachHQ). Faktisk sidebar/header bygges i Fase 1.4.

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
