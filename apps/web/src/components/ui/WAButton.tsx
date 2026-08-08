"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { cn } from "@/lib/utils";

interface WAButtonProps {
  text?:       string;           // custom WhatsApp message
  className?:  string;
  children:    React.ReactNode;
  target?:     "_blank" | "_self";
  onClick?:    () => void;
}

/**
 * Renders an <a> tag pointing to the WhatsApp number configured in admin settings.
 * Safe for use inside both server and client components.
 */
export default function WAButton({
  text,
  className,
  children,
  target = "_blank",
  onClick,
}: WAButtonProps) {
  const [mounted, setMounted] = useState(false);
  const whatsappNumber = useSettingsStore((s) => s.whatsappNumber);

  useEffect(() => setMounted(true), []);

  const number = mounted ? whatsappNumber : "919876543210";
  const base   = `https://wa.me/${number}`;
  const href   = text ? `${base}?text=${encodeURIComponent(text)}` : base;

  return (
    <a
      href={href}
      target={target}
      rel="noopener noreferrer"
      className={cn(className)}
      onClick={onClick}
      suppressHydrationWarning
    >
      {children}
    </a>
  );
}
