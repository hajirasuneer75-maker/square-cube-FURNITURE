"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  Package,
  MessageSquare,
  Settings,
  LogOut,
  Layers,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin",            icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/categories", icon: FolderTree,      label: "Categories" },
  { href: "/admin/products",   icon: Package,         label: "Products" },
  { href: "/admin/enquiries",  icon: MessageSquare,   label: "Enquiries & Care" },
  { href: "/admin/settings",   icon: Settings,        label: "Rates & Settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // proceed regardless
    }
    router.replace("/admin/login");
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-espresso text-white flex flex-col h-full overflow-y-auto border-r border-white/10">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-champagne flex items-center justify-center flex-shrink-0">
            <Layers size={16} className="text-espresso" />
          </div>
          <div>
            <p className="text-sm font-semibold font-display leading-tight">
              Square Cube Furniture
            </p>
            <p className="text-[9px] text-champagne uppercase tracking-[0.2em]">
              Admin Studio
            </p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2.5 py-4 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 text-sm font-ui transition-colors",
                isActive
                  ? "bg-champagne text-white font-semibold"
                  : "text-white/65 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon size={15} />
              <span className="flex-1">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2.5 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-ui text-white/65 hover:text-white transition-colors"
        >
          <ExternalLink size={15} />
          Open Storefront
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-ui text-white/65 hover:text-red-400 transition-colors"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
