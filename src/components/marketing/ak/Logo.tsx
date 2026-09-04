import Image from "next/image";
import type { CSSProperties } from "react";

/* Logoen rendres ALLTID fra fil (public/logos/, masterens filnavn). Aldri
   gjenskapt i markup, aldri farget om.
   Kilde: designsystem/ak-golf/components/merke/Logo.jsx. */

const FILER = {
  "primaer-lys": "ak-golf-logo-primary-on-light.svg",
  "primaer-mork": "ak-golf-logo-primary-on-dark.svg",
  "hvit-mork": "ak-golf-logo-white-on-dark.svg",
  "hvit-mono": "ak-golf-logo-white-mono.svg",
  "sort-mono": "ak-golf-logo-black-mono.svg",
  "signal-mono": "ak-golf-logo-primary-mono.svg",
  kvadrat: "ak-golf-merke-kvadrat.svg",
} as const;

export type LogoVariant = keyof typeof FILER;

/* Ligaturen er ca. 1,16:1 (bredde:høyde) i primær-filene; kvadratet er 1:1.
   Brukes kun som next/image-hint — visningen styres av height/width:auto. */
const FORHOLD: Record<LogoVariant, number> = {
  "primaer-lys": 1.16,
  "primaer-mork": 1.16,
  "hvit-mork": 1.16,
  "hvit-mono": 1.16,
  "sort-mono": 1.16,
  "signal-mono": 1.16,
  kvadrat: 1,
};

export function Logo({
  variant = "primaer-lys",
  hoyde = 40,
  klaring = false,
  prioritet = false,
  style,
}: {
  variant?: LogoVariant;
  hoyde?: number;
  klaring?: boolean;
  prioritet?: boolean;
  style?: CSSProperties;
}) {
  const h = Math.max(hoyde, 24);
  return (
    <Image
      src={`/logos/${FILER[variant]}`}
      alt="AK Golf"
      width={Math.round(h * FORHOLD[variant])}
      height={h}
      priority={prioritet}
      style={{
        height: h,
        width: "auto",
        display: "block",
        flex: "0 0 auto",
        maxWidth: "100%",
        objectFit: "contain",
        padding: klaring ? h / 2 : 0,
        ...style,
      }}
    />
  );
}
