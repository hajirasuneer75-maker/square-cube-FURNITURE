import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login — Square Cube",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="w-full max-w-md px-4">
      {/* Logo / brand */}
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-900 tracking-tight">
          Square Cube
        </h1>
        <p className="mt-1 text-sm text-stone-500">Admin Dashboard</p>
      </div>

      <LoginForm />

      <p className="mt-6 text-center text-xs text-stone-400">
        Restricted access. Authorised personnel only.
      </p>
    </div>
  );
}
