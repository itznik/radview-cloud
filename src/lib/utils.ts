import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merges tailwind classes intelligently
// Example: cn("bg-red-500", "bg-blue-500") -> "bg-blue-500"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formats bytes to MB/KB
export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
