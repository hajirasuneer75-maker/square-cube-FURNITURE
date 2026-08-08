import Link from "next/link";
import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import WAButton from "@/components/ui/WAButton";

export const metadata: Metadata = {
  title:  "Sign In | Square Cube",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-md mx-auto text-center">
        <p className="section-label mb-3">My Account</p>
        <h1 className="font-display text-3xl font-semibold text-stone-900 mb-3">
          Welcome to Square Cube
        </h1>
        <p className="text-stone-500 text-sm mb-10 leading-relaxed">
          We&apos;re a made-to-order furniture studio — all orders and queries are handled personally via
          WhatsApp. You don&apos;t need an account to browse or order.
        </p>

        <div className="space-y-3">
          <Link
            href="/account/dashboard"
            className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
          >
            Go to Account Dashboard
          </Link>
          <Link
            href="/account/wishlist"
            className="flex items-center justify-center gap-2 w-full py-3 px-6 border border-stone-300 text-stone-700 text-sm font-medium hover:border-stone-500 transition-colors"
          >
            View My Wishlist
          </Link>
          <WAButton
            text="Hello Square Cube!"
            className="btn-whatsapp w-full justify-center"
          >
            <MessageCircle size={16} />
            Chat with us on WhatsApp
          </WAButton>
        </div>

        <p className="mt-8 text-xs text-stone-400">
          Are you an admin?{" "}
          <Link href="/admin/login" className="underline underline-offset-2 hover:text-stone-700 transition-colors">
            Admin Login →
          </Link>
        </p>
      </div>
    </div>
  );
}
