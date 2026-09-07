import type { ReactNode } from "react";

/* Kitets `Seksjon` (designsystem/ak-golf/ui_kits/markedsside/Deler.jsx),
   som Tailwind-klasser i stedet for inline `mobil`-prop: brekkpunktet `md`
   (768) er masterens --ak-bp-tablet. */

export function Seksjon({
  senket = false,
  rutenett = false,
  children,
  id,
}: {
  senket?: boolean;
  rutenett?: boolean;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={rutenett ? "ak-rutenett py-ak-9 md:py-ak-10" : "py-ak-9 md:py-ak-10"}
      style={{ background: senket ? "var(--ak-grunn-senk)" : "transparent" }}
    >
      <div className="mx-auto px-ak-4 md:px-ak-6" style={{ maxWidth: "var(--ak-sidebredde)" }}>
        {children}
      </div>
    </section>
  );
}
