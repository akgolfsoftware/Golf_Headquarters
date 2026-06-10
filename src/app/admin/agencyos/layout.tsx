export default function AgencyOSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fasiten har ingen fane-rad — dashboard er én flate, sidebaren navigerer.
  // Underrutene (uka/økonomi/caddie/spillere) lever videre på egne adresser.
  return <>{children}</>;
}
