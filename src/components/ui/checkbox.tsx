import { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ className, checked, ...rest }, ref) {
    return (
      <span
        className={cn(
          "relative inline-flex h-5 w-5 shrink-0 items-center justify-center",
          "rounded-sm border border-input bg-card",
          "transition-colors",
          checked && "bg-primary border-primary",
          className,
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          className="absolute inset-0 cursor-pointer opacity-0"
          {...rest}
        />
        {checked && (
          <Check
            size={14}
            strokeWidth={3}
            className="pointer-events-none text-primary-foreground"
            aria-hidden
          />
        )}
      </span>
    );
  },
);
