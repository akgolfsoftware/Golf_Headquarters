"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

type SwitchProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> & {
  size?: "sm" | "md";
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { className, checked, size = "md", id: idProp, ...rest },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const sizes = {
    sm: { track: "h-5 w-9", thumb: "h-3.5 w-3.5", translate: "translate-x-4" },
    md: { track: "h-6 w-11", thumb: "h-4 w-4", translate: "translate-x-5" },
  } as const;
  const s = sizes[size];

  return (
    <label
      htmlFor={id}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center rounded-full",
        "transition-colors duration-200",
        s.track,
        checked ? "bg-primary" : "bg-muted",
        className,
      )}
    >
      <input
        ref={ref}
        id={id}
        type="checkbox"
        checked={checked}
        className="sr-only"
        {...rest}
      />
      <span
        className={cn(
          "pointer-events-none inline-block rounded-full bg-card shadow-sm",
          "transition-transform duration-200",
          s.thumb,
          "translate-x-1",
          checked && s.translate,
        )}
        aria-hidden
      />
    </label>
  );
});
