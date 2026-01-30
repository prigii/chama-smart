import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(numAmount);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

/**
 * Capitalizes the first letter of each word in a string
 * Example: "john doe" -> "John Doe", "kirwara youth group" -> "Kirwara Youth Group"
 */
export function toTitleCase(str: string): string {
  if (!str) return "";
  
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/) // Split by any whitespace
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Validates that a name has at least two words
 * Returns true if valid, false otherwise
 */
export function isValidFullName(name: string): boolean {
  if (!name) return false;
  
  const words = name.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length >= 2;
}

/**
 * Gets validation error message for name field
 */
export function getNameValidationError(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return "Name is required";
  }
  
  if (!isValidFullName(name)) {
    return "Please enter at least two names (e.g., John Doe)";
  }
  
  return null;
}

/**
 * Validates Kenyan phone number format
 * Accepts: +254..., 254..., 07..., 01...
 * Returns true if valid
 */
export function isValidKenyanPhone(phone: string): boolean {
  if (!phone) return false;
  
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, "");
  
  // Valid formats:
  // +254XXXXXXXXX (13 chars)
  // 254XXXXXXXXX (12 chars)
  // 07XXXXXXXX or 01XXXXXXXX (10 chars)
  
  if (cleaned.startsWith("+254")) {
    return cleaned.length === 13 && /^\+254[17]\d{8}$/.test(cleaned);
  }
  
  if (cleaned.startsWith("254")) {
    return cleaned.length === 12 && /^254[17]\d{8}$/.test(cleaned);
  }
  
  if (cleaned.startsWith("0")) {
    return cleaned.length === 10 && /^0[17]\d{8}$/.test(cleaned);
  }
  
  return false;
}

/**
 * Formats phone number to standard Kenyan format (+254...)
 */
export function formatKenyanPhone(phone: string): string {
  if (!phone) return "";
  
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, "");
  
  // Already in +254 format
  if (cleaned.startsWith("+254")) {
    return cleaned;
  }
  
  // Convert 254... to +254...
  if (cleaned.startsWith("254")) {
    return "+" + cleaned;
  }
  
  // Convert 07... or 01... to +254...
  if (cleaned.startsWith("0")) {
    return "+254" + cleaned.substring(1);
  }
  
  return phone; // Return as-is if unrecognized format
}

/**
 * Gets validation error message for phone field
 */
export function getPhoneValidationError(phone: string): string | null {
  if (!phone || phone.trim().length === 0) {
    return null; // Phone is optional in most forms
  }
  
  if (!isValidKenyanPhone(phone)) {
    return "Please enter a valid Kenyan phone number (e.g., +254712345678 or 0712345678)";
  }
  
  return null;
}
