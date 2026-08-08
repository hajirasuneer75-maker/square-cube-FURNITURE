"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  Settings,
  LogOut,
  Layers,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin",           icon: LayoutDashboard, label: "Dashboard"  },
  { href: "/admin/products",  icon: Package,         label: "Products"   },
  { href: "/admin/enquiries", icon: MessageSquare,   label: "Enquiries",  badge: "3" },
  { href: "/admin/settings",  icon: Settings,        label: "Settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleSignOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Best-effort; proceed with redirect regardless
    }
    router.replace("/admin/login");
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-stone-900 text-white flex flex-col h-full overflow-y-auto">

      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold-500 flex items-center justify-center flex-shrink-0">
            <Layers size={16} className="text-stone-900" />
          </div>
          <div>
            <p className="text-sm font-semibold font-display leading-tight">Square Cube</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label, badge }) => {
          const isActive =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-sm transition-colors",
                isActive
                  ? "bg-white/12 text-white font-medium"
                  : "text-stone-400 hover:text-white hover:bg-white/6"
              )}
            >
              <Icon size={15} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="bg-gold-500 text-stone-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-4 border-t border-white/10 space-y-0.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-stone-400 hover:text-white transition-colors rounded-sm"
        >
          <ExternalLink size={15} />
          View Store
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-stone-400 hover:text-red-400 transition-colors rounded-sm"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
