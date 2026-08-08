import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Shield, Clock, Truck, Award } from "lucide-react";
import WAButton from "@/components/ui/WAButton";

export const metadata: Metadata = {
  title:       "About Us | Square Cube",
  description: "Square Cube is a premium custom furniture studio based in India — crafting handmade, made-to-order pieces in solid hardwood since 2018.",
};

const VALUES = [
  {
    icon:  Shield,
    title: "Craftsmanship First",
    body:  "Every joint, every finish, every detail — inspected by our master craftsmen before it leaves the workshop. We have a zero-compromise policy on quality.",
  },
  {
    icon:  Clock,
    title: "Made to Order, Made to Last",
    body:  "We don't stock furniture. Each piece is built specifically for you, in the wood you choose, to the dimensions you need. Nothing sits in a warehouse.",
  },
  {
    icon:  Truck,
    title: "Pan-India Delivery",
    body:  "From Kashmir to Kanyakumari — we pack, ship, and assemble your furniture wherever you are. Our delivery partners handle white-glove service.",
  },
  {
    icon:  Award,
    title: "2-Year Warranty",
    body:  "All teak and sheesham pieces carry a 2-year structural warranty. We stand behind our work — if anything breaks from normal use, we fix it.",
  },
];

const TEAM = [
  {
    name:  "Aryan Kapoor",
    role:  "Founder & Head of Design",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
  },
  {
    name:  "Meena Rajesh",
    role:  "Master Craftsman — Teak & Sheesham",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face",
  },
  {
    name:  "Suresh Pillai",
    role:  "Operations & Logistics",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-stone-900 text-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <p className="section-label text-gold-400 mb-4">Our Story</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight max-w-2xl mb-6">
            Premium Furniture, Built Around Your Life
          </h1>
          <p className="text-stone-300 text-lg max-w-xl leading-relaxed">
            Square Cube started in 2018 with one belief: furniture should fit your home, your taste,
            and your budget — not the other way around. We build every piece from scratch, to order,
            in premium Indian hardwood.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gold-500 text-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: "2,400+", label: "Pieces crafted" },
              { value: "15+",    label: "Cities served"  },
              { value: "4.9 ★",  label: "Avg. rating"   },
              { value: "6 yrs",  label: "In business"   },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="font-display text-3xl font-semibold mb-1">{value}</p>
                <p className="text-white/80 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="section-label mb-3">How We Started</p>
            <h2 className="font-display text-3xl font-semibold text-stone-900 mb-5">
              Born From Frustration, Built on Craft
            </h2>
            <div className="space-y-4 text-stone-600 leading-relaxed">
              <p>
                Our founder Aryan spent months searching for a teak dining table that fit his 3BHK
                without occupying half the room. Every showroom had the same options — too large,
                wrong finish, wrong wood, or outrageously priced. So he hired a local carpenter,
                sketched the table himself, and had it made to exact dimensions.
              </p>
              <p>
                Friends started asking where he got it. That question became Square Cube — a studio
                where every customer gets the same experience: tell us what you want, we build it.
              </p>
              <p>
                Today we have a 12,000 sq ft workshop in Pune with 40 craftsmen, and we ship to
                every corner of India. The philosophy hasn&apos;t changed.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=700&h=500&fit=crop"
              alt="Square Cube workshop"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-stone-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <p className="section-label mb-2">What We Stand For</p>
            <h2 className="font-display text-3xl font-semibold text-stone-900">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white p-6 border border-stone-200">
                <div className="w-10 h-10 bg-stone-900 text-white flex items-center justify-center mb-4">
                  <Icon size={18} />
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">{title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <p className="section-label mb-2">The People</p>
          <h2 className="font-display text-3xl font-semibold text-stone-900">Meet the Team</h2>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-8">
          {TEAM.map(({ name, role, image }) => (
            <div key={name} className="text-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-stone-200">
                <Image src={image} alt={name} fill sizes="96px" className="object-cover" />
              </div>
              <p className="font-semibold text-stone-900">{name}</p>
              <p className="text-sm text-stone-500 mt-0.5">{role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-900 text-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="font-display text-3xl font-semibold mb-3">
            Ready to work with us?
          </h2>
          <p className="text-stone-400 max-w-md mx-auto text-sm mb-8">
            Tell us what you need. We&apos;ll respond within 2–3 hours with a design concept and quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/customize" className="btn-primary py-3.5 px-8">
              Start Custom Order
            </Link>
            <Link href="/products" className="btn-outline border-stone-500 text-stone-300 hover:bg-stone-800 hover:border-stone-300 py-3.5 px-8">
              Browse Collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
