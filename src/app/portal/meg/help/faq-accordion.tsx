"use client";

/**
 * FAQ-accordion — fasit: ph-screens.jsx · HjelpScreen (set-row-utseende,
 * spørsmål + chevron-down/up, svar utfelt under). Én åpen om gangen.
 * Rendres inne i <SetGroup> (kortet med delelinjer kommer derfra).
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type FaqItem = { q: string; a: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      {items.map((item, i) => {
        const erOpen = open === i;
        const svarId = `faq-svar-${i}`;
        return (
          <div key={item.q} className="border-b border-border last:border-b-0">
            <button
              type="button"
              onClick={() => setOpen(erOpen ? null : i)}
              aria-expanded={erOpen}
              aria-controls={svarId}
              className="flex w-full items-center gap-3 px-4 py-[15px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:px-[18px]"
            >
              <span className="flex-1 text-[14.5px] font-semibold tracking-[-0.005em] text-foreground">
                {item.q}
              </span>
              <ChevronDown
                className={cn(
                  "h-[18px] w-[18px] shrink-0 text-muted-foreground transition-transform duration-200",
                  erOpen && "rotate-180",
                )}
                strokeWidth={1.75}
                aria-hidden
              />
            </button>
            <p
              id={svarId}
              hidden={!erOpen}
              className="-mt-[5px] px-4 pb-[15px] text-[13.5px] leading-[1.55] text-muted-foreground sm:px-[18px]"
            >
              {item.a}
            </p>
          </div>
        );
      })}
    </>
  );
}
