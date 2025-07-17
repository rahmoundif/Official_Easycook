import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names into a single string using clsx and tailwind-merge
 * This is commonly used for conditional or dynamic class application in React components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date object into a human-readable string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Truncates text to a specified length and adds ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Generates a random ID for elements that need unique identifiers
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Debounces a function call
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
