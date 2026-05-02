import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function percentageChange(current: number, previous?: number): number | null {
  if (previous === undefined || previous === 0) return null;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export function stableId(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function formatMetricValue(value: number, unit?: string): string {
  if (unit === "usd") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: value >= 1000 ? 0 : 2
    }).format(value);
  }

  if (unit === "percent") return `${value}%`;
  return new Intl.NumberFormat("en-US").format(value);
}
