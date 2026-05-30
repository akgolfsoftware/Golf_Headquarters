"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

/**
 * Dropdown-meny for AK Golf HQ.
 *
 * Bygd på Popover-primitiven. Subkomponenter speiler shadcn-API-et,
 * men UTEN Radix — alt er native React for å matche prosjekt-stilen.
 *
 * Bruk:
 *   <div className="relative">
 *     <DropdownMenu>
 *       <DropdownMenuTrigger className={buttonClasses({ variant: "ghost-light", size: "sm" })}>
 *         <MoreHorizontal size={16} />
 *       </DropdownMenuTrigger>
 *       <DropdownMenuContent align="end">
 *         <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
 *         <DropdownMenuItem onSelect={onEdit}>Rediger</DropdownMenuItem>
 *         <DropdownMenuItem onSelect={onDuplicate}>Dupliser</DropdownMenuItem>
 *         <DropdownMenuSeparator />
 *         <DropdownMenuItem onSelect={onDelete} variant="destructive">
 *           Slett
 *         </DropdownMenuItem>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   </div>
 */

export const DropdownMenu = Popover;
export const DropdownMenuTrigger = PopoverTrigger;

type DropdownMenuContentProps = React.ComponentProps<typeof PopoverContent>;

export function DropdownMenuContent({
  className,
  children,
  ...rest
}: DropdownMenuContentProps) {
  return (
    <PopoverContent
      className={cn("min-w-[10rem] py-1", className)}
      {...rest}
    >
      <div role="menu">{children}</div>
    </PopoverContent>
  );
}

type DropdownMenuItemProps = {
  onSelect?: () => void;
  disabled?: boolean;
  variant?: "default" | "destructive";
  className?: string;
  children: React.ReactNode;
};

export function DropdownMenuItem({
  onSelect,
  disabled,
  variant = "default",
  className,
  children,
}: DropdownMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onSelect?.();
      }}
      className={cn(
        "flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors",
        "hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none",
        "disabled:opacity-50 disabled:pointer-events-none",
        variant === "destructive" && "text-destructive hover:bg-destructive/10",
        className,
      )}
    >
      {children}
    </button>
  );
}

type DropdownMenuCheckboxItemProps = Omit<DropdownMenuItemProps, "onSelect"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function DropdownMenuCheckboxItem({
  checked,
  onCheckedChange,
  children,
  className,
  ...rest
}: DropdownMenuCheckboxItemProps) {
  return (
    <DropdownMenuItem
      onSelect={() => onCheckedChange(!checked)}
      className={cn("pl-8 relative", className)}
      {...rest}
    >
      {checked && (
        <Check
          size={14}
          aria-hidden
          className="absolute left-2.5 top-1/2 -translate-y-1/2"
          strokeWidth={2}
        />
      )}
      {children}
    </DropdownMenuItem>
  );
}

type DropdownMenuLabelProps = {
  className?: string;
  children: React.ReactNode;
};

export function DropdownMenuLabel({
  className,
  children,
}: DropdownMenuLabelProps) {
  return (
    <div
      className={cn(
        "px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      className={cn("my-1 h-px bg-border", className)}
    />
  );
}

type DropdownMenuShortcutProps = {
  className?: string;
  children: React.ReactNode;
};

export function DropdownMenuShortcut({
  className,
  children,
}: DropdownMenuShortcutProps) {
  return (
    <span
      className={cn(
        "ml-auto font-mono text-[10px] tracking-wider text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
