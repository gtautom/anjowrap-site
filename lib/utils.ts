import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Helper padrao do shadcn: concatena classes e resolve conflitos do Tailwind. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
