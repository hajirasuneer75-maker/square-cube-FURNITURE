import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="w-full max-w-md px-4">
      {/* Logo / brand */}
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-espresso tracking-tight">
          Square Cube Furniture
        </h1>
        <p className="mt-1 text-sm text-espresso/60 font-ui">Admin Studio Dashboard</p>
      </div>

      <LoginForm />

      <p className="mt-6 text-center text-xs text-stone-400">
        Restricted access. Authorised personnel only.
      </p>
    </div>
  );
}
