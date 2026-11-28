import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const DEFAULT_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918547097173";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function getWhatsAppNumber(override?: string | null): string {
  const cleaned = (override || "").replace(/\D/g, "");
  return cleaned || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918547097173";
}

export function generateWhatsAppUrl(
  phoneNumber?: string | null,
  message?: string
): string {
  const num = getWhatsAppNumber(phoneNumber);
  const base = `https://wa.me/${num}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function truncate(str: string, length: number): string {
  return str.length <= length ? str : str.slice(0, length) + "…";
}
