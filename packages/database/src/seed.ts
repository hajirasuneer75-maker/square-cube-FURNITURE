import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  {
    name: "Living Room",
    slug: "living-room",
    icon: "🛋️",
    description: "Luxury sofas, coffee tables, accent chairs, and architectural console units",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
  },
  {
    name: "Bedroom",
    slug: "bedroom",
    icon: "🛏️",
    description: "Handcrafted solid wood beds, bedside tables, and dressing suites",
    imageUrl: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80",
  },
  {
    name: "Dining Room",
    slug: "dining-room",
    icon: "🍽️",
    description: "Grand teak dining tables and sculpted ergonomic dining chairs",
    imageUrl: "https://images.unsplash.com/photo-1617098474202-0d0d7e35c993?w=800&q=80",
  },
  {
    name: "Wardrobes",
    slug: "wardrobes",
    icon: "🚪",
    description: "Floor-to-ceiling wardrobes with soft-close hardware and veneer finishes",
    imageUrl: "https://images.unsplash.com/photo-1558997519-83ea9252edc8?w=800&q=80",
  },
  {
    name: "Sofas",
    slug: "sofas",
    icon: "🛋️",
    description: "Tailored luxury seating in linen, bouclé, and top-grain leather",
    imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80",
  },
  {
    name: "Beds",
    slug: "beds",
    icon: "🛏️",
    description: "King and queen architectural beds in Nilambur Teak and Rosewood",
    imageUrl: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80",
  },
  {
    name: "Office",
    slug: "office",
    icon: "💼",
    description: "Executive desks, library bookshelves, and studio storage cabinets",
    imageUrl: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80",
  },
  {
    name: "TV Units",
    slug: "tv-units",
    icon: "📺",
    description: "Floating media consoles with concealed wire channels and warm lighting",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
  },
  {
    name: "Coffee Tables",
    slug: "coffee-tables",
    icon: "☕",
    description: "Sculptural center tables and brass-inlaid accent side tables",
    imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80",
  },
  {
    name: "Outdoor",
    slug: "outdoor",
    icon: "🌿",
    description: "Weather-treated solid teak patio benches and verandah loungers",
    imageUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
  },
];

const WOOD_TYPES = [
  { name: "Nilambur Teak", slug: "nilambur-teak", description: "Kerala's heritage golden hardwood — unmatched grain and termite resistance" },
  { name: "Mahogany", slug: "mahogany", description: "Deep reddish-brown luxury hardwood with fine satin lustre" },
  { name: "Rosewood", slug: "rosewood", description: "Rare Indian rosewood prized for bold grain and heirloom strength" },
  { name: "Sheesham", slug: "sheesham", description: "Richly grained North Indian timber ideal for sculptural joinery" },
  { name: "Marine Ply + Veneer", slug: "marine-ply", description: "Boiling-waterproof marine ply finished in natural architectural veneers" },
  { name: "Oak", slug: "oak", description: "Warm pale timber with clean contemporary grain" },
];

const ESTIMATOR_RATES = [
  { material: "Nilambur Teak", ratePerSqFt: 2400, description: "Authentic seasoned Kerala Nilambur Teak" },
  { material: "Mahogany", ratePerSqFt: 1950, description: "Kiln-dried architectural Mahogany" },
  { material: "Rosewood", ratePerSqFt: 2850, description: "Heritage Indian Rosewood" },
  { material: "Sheesham", ratePerSqFt: 1650, description: "Solid seasoned Sheesham hardwood" },
  { material: "Marine Ply + Veneer", ratePerSqFt: 1350, description: "IS:710 Marine Ply with natural teak/walnut veneer" },
];

const SITE_SETTINGS: Record<string, string> = {
  whatsappNumber: "918547097173",
  whatsappDisplay: "+91 85470 97173",
  businessName: "Square Cube Furniture",
  businessTagline: "Architectural Woodcraft & Custom Studio",
  businessEmail: "hello@squarecubefurniture.in",
  businessCity: "Kerala, India",
  announcementText: "✦ Ultra-Luxury Handcrafted Furniture · Nilambur Teak & Heritage Hardwoods · Concierge: +91 85470 97173",
  announcementEnabled: "true",
  heroHeadline: "Architectural Furniture Crafted for Living",
  heroSubheadline: "Square Cube Furniture sculpts heirloom pieces from Nilambur Teak, Mahogany, and Rosewood — built to your home's exact proportions.",
  heroBannerUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80",
};

async function main() {
  console.log("[seed] Seeding Square Cube Furniture database...");

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, description: cat.description, imageUrl: cat.imageUrl },
      create: cat,
    });
  }

  for (const wood of WOOD_TYPES) {
    await prisma.woodType.upsert({
      where: { slug: wood.slug },
      update: { name: wood.name, description: wood.description },
      create: wood,
    });
  }

  for (const rate of ESTIMATOR_RATES) {
    await prisma.estimatorRate.upsert({
      where: { material: rate.material },
      update: { ratePerSqFt: rate.ratePerSqFt, description: rate.description },
      create: rate,
    });
  }

  for (const [key, value] of Object.entries(SITE_SETTINGS)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  const allCats = await prisma.category.findMany();
  const allWoods = await prisma.woodType.findMany();
  const catBySlug = (s: string) => allCats.find((c) => c.slug === s)!;
  const woodBySlug = (s: string) => allWoods.find((w) => w.slug === s)!;

  const PRODUCTS = [
    {
      name: "Nilambur Heritage 6-Seater Dining Table",
      slug: "nilambur-heritage-dining-table",
      sku: "SCF-DT-101",
      shortDescription: "Sculpted 6-seater dining centerpiece in seasoned Nilambur Teak with hand-chamfered edges and brass sabots.",
      description: "Crafted from kiln-seasoned Nilambur Teak, this architectural dining table balances generous proportions with fine joinery. Finished in zero-VOC matte oil for lasting natural warmth.",
      basePrice: 92000,
      offerPrice: 84000,
      dimensions: "72 × 36 × 30 in",
      finishSwatches: ["Natural Matte", "Walnut Stain", "PU Gloss"],
      fabricSwatches: [],
      stock: 6,
      isFeatured: true,
      manufacturingTime: "18–24 days",
      deliveryTime: "4–6 days",
      warranty: "5 Years",
      rating: 4.9,
      reviewCount: 28,
      categoryId: catBySlug("dining-room").id,
      imageUrl: "https://images.unsplash.com/photo-1617098474202-0d0d7e35c993?w=900&q=80",
      woods: [
        { woodSlug: "nilambur-teak", priceModifier: 0 },
        { woodSlug: "mahogany", priceModifier: -8000 },
        { woodSlug: "rosewood", priceModifier: 18000 },
      ],
    },
    {
      name: "Travancore Canopy King Bed",
      slug: "travancore-canopy-king-bed",
      sku: "SCF-BD-201",
      shortDescription: "Low-profile king architectural bed with fluted solid teak headboard and optional hydraulic storage.",
      description: "Designed for serene master suites, the Travancore Bed pairs solid Nilambur Teak framing with upholstered bouclé headboard panels and precision-damped hydraulic lift storage.",
      basePrice: 118000,
      offerPrice: 105000,
      dimensions: "82 × 76 × 42 in",
      finishSwatches: ["Natural Matte", "Walnut Stain", "Honey Teak"],
      fabricSwatches: ["Ivory Bouclé", "Warm Oatmeal Linen", "Cognac Tan Leather"],
      stock: 4,
      isFeatured: true,
      manufacturingTime: "22–28 days",
      deliveryTime: "5–7 days",
      warranty: "5 Years",
      rating: 4.9,
      reviewCount: 36,
      categoryId: catBySlug("beds").id,
      imageUrl: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=900&q=80",
      woods: [
        { woodSlug: "nilambur-teak", priceModifier: 0 },
        { woodSlug: "rosewood", priceModifier: 24000 },
        { woodSlug: "mahogany", priceModifier: -9000 },
      ],
    },
    {
      name: "Alabaster Atelier L-Shape Sofa",
      slug: "alabaster-atelier-l-sofa",
      sku: "SCF-SF-301",
      shortDescription: "Deep architectural 5-seater sectional sofa with exposed solid teak plinth and performance bouclé fabric.",
      description: "Built on a mortise-and-tenon solid hardwood frame with multi-density HR foam and feather-blend cushions, wrapped in stain-resistant Italian-weave linen or bouclé.",
      basePrice: 88000,
      offerPrice: 79500,
      dimensions: "110 × 68 × 32 in",
      finishSwatches: ["Natural Matte", "Walnut Stain"],
      fabricSwatches: ["Ivory Bouclé", "Charcoal Linen", "Emerald Velvet", "Cognac Tan Leather"],
      stock: 5,
      isFeatured: true,
      manufacturingTime: "15–20 days",
      deliveryTime: "4–6 days",
      warranty: "3 Years",
      rating: 4.8,
      reviewCount: 44,
      categoryId: catBySlug("sofas").id,
      imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80",
      woods: [
        { woodSlug: "nilambur-teak", priceModifier: 0 },
        { woodSlug: "sheesham", priceModifier: -6000 },
        { woodSlug: "oak", priceModifier: 7000 },
      ],
    },
    {
      name: "Malabar Fluted 3-Door Wardrobe",
      slug: "malabar-fluted-wardrobe",
      sku: "SCF-WD-401",
      shortDescription: "Architectural 3-door wardrobe in Marine Ply & Natural Teak Veneer with fluted solid wood shutters.",
      description: "Engineered with BWP Marine Ply carcass, solid teak fluted fascia, Hettich soft-close hinges, concealed sensor strip lighting, and brass pulls.",
      basePrice: 78000,
      offerPrice: 69000,
      dimensions: "72 × 24 × 84 in",
      finishSwatches: ["Natural Matte", "PU Gloss", "Walnut Stain"],
      fabricSwatches: [],
      stock: 8,
      isFeatured: true,
      manufacturingTime: "20–25 days",
      deliveryTime: "5–7 days",
      warranty: "5 Years",
      rating: 4.7,
      reviewCount: 21,
      categoryId: catBySlug("wardrobes").id,
      imageUrl: "https://images.unsplash.com/photo-1558997519-83ea9252edc8?w=900&q=80",
      woods: [
        { woodSlug: "marine-ply", priceModifier: 0 },
        { woodSlug: "nilambur-teak", priceModifier: 16000 },
        { woodSlug: "mahogany", priceModifier: 10000 },
      ],
    },
    {
      name: "Kochi Brass-Inlay Coffee Table",
      slug: "kochi-brass-coffee-table",
      sku: "SCF-CT-501",
      shortDescription: "Sculptural solid rosewood & brushed champagne brass center table with floating lower tray.",
      description: "A minimalist low coffee table crafted in rich hardwood with hand-fitted champagne brass detailing along the apron.",
      basePrice: 29500,
      offerPrice: 25900,
      dimensions: "48 × 28 × 16 in",
      finishSwatches: ["Natural Matte", "Walnut Stain", "PU Gloss"],
      fabricSwatches: [],
      stock: 12,
      isFeatured: true,
      manufacturingTime: "10–14 days",
      deliveryTime: "2–4 days",
      warranty: "3 Years",
      rating: 4.8,
      reviewCount: 19,
      categoryId: catBySlug("coffee-tables").id,
      imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=900&q=80",
      woods: [
        { woodSlug: "rosewood", priceModifier: 6500 },
        { woodSlug: "nilambur-teak", priceModifier: 0 },
        { woodSlug: "sheesham", priceModifier: -3500 },
      ],
    },
    {
      name: "Vembanad Floating Media Console",
      slug: "vembanad-floating-tv-unit",
      sku: "SCF-TV-601",
      shortDescription: "Wall-mounted walnut veneer & solid teak slatted TV unit with hidden acoustic ventilation.",
      description: "Clean-lined architectural media unit combining fluted sliding panels, concealed cable ducts, and warm Duco or veneer finishes.",
      basePrice: 36000,
      offerPrice: 31500,
      dimensions: "78 × 16 × 18 in",
      finishSwatches: ["Walnut Stain", "Natural Matte", "Duco Matte"],
      fabricSwatches: [],
      stock: 9,
      isFeatured: false,
      manufacturingTime: "12–16 days",
      deliveryTime: "3–5 days",
      warranty: "3 Years",
      rating: 4.7,
      reviewCount: 15,
      categoryId: catBySlug("tv-units").id,
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80",
      woods: [
        { woodSlug: "marine-ply", priceModifier: 0 },
        { woodSlug: "nilambur-teak", priceModifier: 9000 },
      ],
    },
  ];

  for (const p of PRODUCTS) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          shortDescription: p.shortDescription,
          description: p.description,
          basePrice: p.basePrice,
          offerPrice: p.offerPrice,
          dimensions: p.dimensions,
          finishSwatches: p.finishSwatches,
          fabricSwatches: p.fabricSwatches,
          stock: p.stock,
          isFeatured: p.isFeatured,
          isActive: true,
          manufacturingTime: p.manufacturingTime,
          deliveryTime: p.deliveryTime,
          warranty: p.warranty,
          rating: p.rating,
          reviewCount: p.reviewCount,
          categoryId: p.categoryId,
          images: {
            create: [{ url: p.imageUrl, altText: p.name, isPrimary: true, angle: "FRONT" }],
          },
          woodVariants: {
            create: p.woods.map((w) => ({
              woodTypeId: woodBySlug(w.woodSlug).id,
              priceModifier: w.priceModifier,
              priceModifierType: "FIXED_ADD",
            })),
          },
        },
      });
    }
  }

  console.log("[seed] Done!");
}

main()
  .catch((e) => {
    console.error("[seed] Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
