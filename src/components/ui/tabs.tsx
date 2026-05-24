"use client";

import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (v: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs.* må brukes innenfor <Tabs>");
  return ctx;
}

type TabsProps = {
  defaultValue: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
  className?: string;
};

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const setValue = (v: string) => {
    if (!isControlled) setInternalValue(v);
    onValueChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

type TabListProps = {
  children: React.ReactNode;
  className?: string;
};

export function TabList({ children, className }: TabListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-1.5 overflow-x-auto scrollbar-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

type TabProps = {
  value: string;
  children: React.ReactNode;
  count?: number;
  className?: string;
};

export function Tab({ value, children, count, className }: TabProps) {
  const { value: activeValue, setValue } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => setValue(value)}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-secondary",
        className,
      )}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            "rounded-full px-1.5 font-mono text-[10px] font-semibold tabular-nums",
            isActive
              ? "bg-primary/20 text-primary"
              : "bg-secondary text-muted-foreground",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

type TabPanelProps = {
  value: string;
  children: React.ReactNode;
  className?: string;
};

export function TabPanel({ value, children, className }: TabPanelProps) {
  const { value: activeValue } = useTabsContext();
  if (activeValue !== value) return null;

  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  );
}
