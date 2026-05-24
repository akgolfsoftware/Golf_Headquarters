import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type RadioProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { className, checked, ...rest },
  ref,
) {
  return (
    <span
      className={cn(
        "relative inline-flex h-5 w-5 shrink-0 items-center justify-center",
        "rounded-full border border-input bg-card",
        "transition-colors",
        checked && "border-primary",
        className,
      )}
    >
      <input
        ref={ref}
        type="radio"
        checked={checked}
        className="absolute inset-0 cursor-pointer opacity-0"
        {...rest}
      />
      {checked && (
        <span
          className="pointer-events-none h-2.5 w-2.5 rounded-full bg-primary"
          aria-hidden
        />
      )}
    </span>
  );
});

type RadioGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
};

export function RadioGroup({
  className,
  orientation = "vertical",
  ...rest
}: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "flex gap-2",
        orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
        className,
      )}
      {...rest}
    />
  );
}
