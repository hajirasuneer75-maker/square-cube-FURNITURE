import type { Metadata } from "next";
import CustomOrderForm from "@/components/customize/CustomOrderForm";

export const metadata: Metadata = {
  title:       "Custom Furniture Request | Square Cube",
  description: "Tell us your vision — wood, dimensions, finish, budget. Our craftsmen respond with a detailed quote within 2–3 hours.",
};

export default function CustomizePage() {
  return (
    <div className="min-h-screen bg-stone-50 py-10 lg:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Page header */}
        <div className="text-center mb-10">
          <p className="section-label mb-3">Custom Order</p>
          <h1 className="font-display text-4xl text-stone-900 tracking-tight mb-4">
            Build Your Dream Piece
          </h1>
          <p className="text-stone-500 text-base leading-relaxed">
            Share your vision — wood preference, dimensions, finish, and any reference images.
            <br className="hidden sm:block" />
            We'll respond with a detailed quote within&nbsp;2–3&nbsp;hours.
          </p>
        </div>

        {/* Multi-step form */}
        <CustomOrderForm />

        {/* Trust signals */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          {[
            { emoji: "🔒", text: "Your details are private" },
            { emoji: "⚡", text: "2–3 hour response time"   },
            { emoji: "💬", text: "Free design consultation"  },
          ].map(({ emoji, text }) => (
            <div key={text} className="py-3 border border-stone-200 bg-white">
              <p className="text-xl mb-1">{emoji}</p>
              <p className="text-[11px] text-stone-500 font-medium leading-tight">{text}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
