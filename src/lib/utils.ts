import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Slår sammen Tailwind-klasser og fjerner duplikater/konflikter.
 * Bruk i alle komponenter som tar imot className-prop.
 *
 * @example
 * <div className={cn("p-4 bg-primary", className)} />
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
