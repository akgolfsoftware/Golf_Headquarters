/**
 * EditorialDivider — full-bleed photo-strip mellom seksjoner.
 * Port av workbench-v2/athletic.jsx EditorialDivider.
 */

import Image from "next/image";

export type EditorialDividerProps = {
  image: string;
  stamp: string;
  line: React.ReactNode;
  imageAlt?: string;
};

export function EditorialDivider({
  image,
  stamp,
  line,
  imageAlt = "",
}: EditorialDividerProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      role="separator"
      aria-label={stamp}
    >
      <div className="relative h-32 w-full sm:h-40">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/40 to-transparent"
        />
      </div>
      <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
          {stamp}
        </p>
        <p className="mt-1 font-display text-lg font-semibold tracking-tight text-background sm:text-xl">
          {line}
        </p>
      </div>
    </div>
  );
}
