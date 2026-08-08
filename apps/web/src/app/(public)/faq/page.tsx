"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MessageCircle } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { cn } from "@/lib/utils";

const FAQS: { category: string; items: { q: string; a: string }[] }[] = [
  {
    category: "Ordering & Process",
    items: [
      {
        q: "How does a custom furniture order work?",
        a: "It's simple: fill in our Custom Order form describing your furniture, wood type, budget, and dimensions. We review it within 2–3 hours and reach out on WhatsApp to discuss details, share a design sketch, and confirm pricing. Once you approve, we start crafting.",
      },
      {
        q: "Can I order standard products from the catalogue?",
        a: "Yes. Browse our Products section, choose a piece, select your wood type and finish, and tap the WhatsApp button. We'll confirm availability, quote a price, and arrange delivery.",
      },
      {
        q: "Is there a minimum order value?",
        a: "There is no strict minimum, but custom pieces typically start around ₹15,000 due to material and craftsmanship costs. Small items like stools, side tables, and TV shelves are available at lower price points.",
      },
      {
        q: "Do you take a deposit upfront?",
        a: "Yes — we typically collect a 50% advance before production begins, with the balance due before delivery. Payment links are shared via WhatsApp (UPI / bank transfer).",
      },
    ],
  },
  {
    category: "Delivery & Installation",
    items: [
      {
        q: "Which cities do you deliver to?",
        a: "We deliver pan-India. Standard delivery is available for all major cities; for remote locations, additional logistics charges may apply. Contact us on WhatsApp to confirm for your pincode.",
      },
      {
        q: "How long does manufacturing take?",
        a: "Most custom pieces take 15–25 working days to craft, depending on complexity. Simpler items (shelves, coffee tables) can be ready in 10–15 days. We confirm the exact timeline when you place your order.",
      },
      {
        q: "Do you offer assembly at home?",
        a: "Yes, complimentary basic assembly is included for most pieces. Our delivery team will assemble and place the furniture in your preferred room. For complex modular pieces, we schedule a dedicated installation slot.",
      },
      {
        q: "What if the furniture is damaged during delivery?",
        a: "Every piece is wrapped and packed by our team before dispatch. If damage occurs in transit, send us photos within 24 hours of delivery and we'll repair or replace the piece at no cost.",
      },
    ],
  },
  {
    category: "Materials & Quality",
    items: [
      {
        q: "What types of wood do you work with?",
        a: "We work with Teak (Sagwan), Sheesham (Indian Rosewood), Oak, Mahogany, Mango Wood, Plywood, MDF, and Engineered Wood. Each material is sourced from verified suppliers and kiln-dried to prevent warping.",
      },
      {
        q: "What finishes are available?",
        a: "We offer Natural Polish, Walnut Stain, Ebony, Honey Oak, White Wash, and Custom Colour (RAL/Pantone matched). All finishes use eco-safe, low-VOC lacquers and can be applied matte or gloss.",
      },
      {
        q: "Do you offer a warranty?",
        a: "All pieces carry a 1-year structural warranty against manufacturing defects. Teak and sheesham pieces carry a 2-year warranty. Normal wear, improper use, or water damage is not covered.",
      },
      {
        q: "How should I care for my furniture?",
        a: "Wipe with a soft, dry cloth regularly. For solid wood, apply furniture oil or wax once every 6–12 months. Avoid prolonged exposure to direct sunlight, heat sources, or moisture. Specific care instructions are included with every delivery.",
      },
    ],
  },
  {
    category: "Pricing & Payments",
    items: [
      {
        q: "Why aren't prices fixed on the website?",
        a: "Custom furniture pricing depends on the exact wood species, dimensions, finish, and any special features (carvings, hardware, hydraulic mechanisms). We provide a firm quote before any work begins — no hidden costs.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept UPI (Google Pay, PhonePe, Paytm), NEFT/IMPS bank transfer, and cheques for large orders. We don't accept cash on delivery for custom orders due to their bespoke nature.",
      },
      {
        q: "Can I get a GST invoice?",
        a: "Yes. We issue a proper GST invoice for every order. Share your GSTIN when placing the order and it will appear on your invoice.",
      },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-200">
      <button
        className="w-full flex items-center justify-between py-4 text-left gap-4 group"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={cn(
          "text-sm font-medium transition-colors",
          open ? "text-stone-900" : "text-stone-700 group-hover:text-stone-900"
        )}>
          {q}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "flex-shrink-0 text-stone-400 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-stone-500 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function FAQPage() {
  const { whatsappNumber } = useSettingsStore();
  const waHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Square Cube! I have a question.")}`;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-2xl mx-auto">
        <p className="section-label mb-2">Help Centre</p>
        <h1 className="font-display text-3xl lg:text-4xl font-semibold text-stone-900 mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-stone-500 mb-12 leading-relaxed">
          Everything you need to know about ordering, delivery, and materials.
          Can&apos;t find your answer?{" "}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-900 underline underline-offset-2 hover:text-stone-600 transition-colors"
            suppressHydrationWarning
          >
            Chat with us on WhatsApp
          </a>.
        </p>

        <div className="space-y-10">
          {FAQS.map((section) => (
            <section key={section.category}>
              <h2 className="font-semibold text-stone-900 mb-2 pb-2 border-b border-stone-100">
                {section.category}
              </h2>
              <div>
                {section.items.map((item) => (
                  <AccordionItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-14 p-6 sm:p-8 bg-stone-900 text-white text-center">
          <p className="font-display text-xl font-semibold mb-2">Still have questions?</p>
          <p className="text-stone-400 text-sm mb-6">
            Our team typically replies within 30 minutes during business hours (9 am – 8 pm IST).
          </p>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp inline-flex"
            suppressHydrationWarning
          >
            <MessageCircle size={18} />
            Chat on WhatsApp
          </a>
        </div>

        <div className="mt-8 text-center">
          <Link href="/customize" className="text-sm text-stone-600 hover:text-stone-900 transition-colors underline underline-offset-2">
            Ready to order? Start your custom request →
          </Link>
        </div>
      </div>
    </div>
  );
}
