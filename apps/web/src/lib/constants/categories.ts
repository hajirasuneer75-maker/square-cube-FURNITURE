export interface NavCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export const NAVIGATION_CATEGORIES: NavCategory[] = [
  { id: "1",  name: "Living Room",   slug: "living-room",   icon: "🛋️", description: "Sofas, coffee tables, TV units and more" },
  { id: "2",  name: "Bedroom",       slug: "bedroom",       icon: "🛏️", description: "Beds, wardrobes, dressing tables" },
  { id: "3",  name: "Dining Room",   slug: "dining-room",   icon: "🍽️", description: "Dining tables and chairs" },
  { id: "4",  name: "Office",        slug: "office",        icon: "💼", description: "Desks, bookshelves, cabinets" },
  { id: "5",  name: "Outdoor",       slug: "outdoor",       icon: "🌿", description: "Garden and patio furniture" },
  { id: "6",  name: "Kitchen",       slug: "kitchen",       icon: "🍳", description: "Kitchen cabinets and storage" },
  { id: "7",  name: "Kids Room",     slug: "kids",          icon: "🧸", description: "Fun and safe furniture for children" },
  { id: "8",  name: "TV Units",      slug: "tv-units",      icon: "📺", description: "Entertainment and media units" },
  { id: "9",  name: "Wardrobes",     slug: "wardrobes",     icon: "🚪", description: "Custom built wardrobes" },
  { id: "10", name: "Sofas",         slug: "sofas",         icon: "🛋️", description: "Fabric and leather sofas" },
  { id: "11", name: "Beds",          slug: "beds",          icon: "🛏️", description: "Single, double and king size" },
  { id: "12", name: "Dining Tables", slug: "dining-tables", icon: "🪑", description: "4-seater to 12-seater options" },
  { id: "13", name: "Coffee Tables", slug: "coffee-tables", icon: "☕", description: "Centre tables and side tables" },
  { id: "14", name: "Storage",       slug: "storage",       icon: "📦", description: "Shelves, cabinets and organisers" },
  { id: "15", name: "Chairs",        slug: "chairs",        icon: "🪑", description: "Accent, dining and office chairs" },
  { id: "16", name: "Custom Order",  slug: "custom",        icon: "✏️", description: "Build your dream furniture" },
];

export const WOOD_TYPES = [
  "Teak",
  "Sheesham",
  "Oak",
  "Mahogany",
  "Plywood",
  "MDF",
  "Engineered Wood",
];
