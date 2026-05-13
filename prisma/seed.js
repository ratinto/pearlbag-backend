import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const promos = [
  { code: "WELCOME10", type: "percent", value: 10, label: "10% off your order", minOrder: 0 },
  { code: "PEARL20", type: "percent", value: 20, label: "20% off — new arrivals", minOrder: 0 },
  { code: "FREESHIP", type: "shipping", value: 0, label: "Free shipping", minOrder: 0 },
  { code: "GIFT25", type: "fixed", value: 25, label: "$25 off orders over $150", minOrder: 150 },
];

const handbags = [
  {
    id: 1,
    sku: "PB-MT-001",
    name: "Pearl Mini Tote",
    description:
      "A structured mini tote in pebbled vegan leather, finished with polished pearl hardware and a slim adjustable strap.",
    price: 189,
    compareAtPrice: 229,
    category: "tote",
    style: "tote",
    badge: "Bestseller",
    rating: 4.8,
    reviewCount: 218,
    stock: 12,
    material: "Pebbled vegan leather",
    weight: "0.6 kg",
    tags: ["everyday", "work", "bestseller"],
    colors: [
      { name: "Ivory", hex: "#efe7d6" },
      { name: "Sand", hex: "#cfb997" },
      { name: "Onyx", hex: "#1a1a1d" },
    ],
    details: [
      "Pebbled vegan leather exterior",
      "Twill-lined interior with zip pocket",
      "Detachable shoulder strap",
      "Dimensions: 22 × 18 × 10 cm",
    ],
  },
  {
    id: 2,
    sku: "PB-CC-002",
    name: "City Crossbody",
    description:
      "A modern everyday crossbody designed for life on the move. Smooth matte finish, magnetic closure, and a wide woven strap.",
    price: 149,
    category: "crossbody",
    style: "crossbody",
    badge: "New",
    rating: 4.7,
    reviewCount: 142,
    stock: 3,
    material: "Matte vegan leather",
    weight: "0.45 kg",
    tags: ["new", "travel", "everyday"],
    colors: [
      { name: "Cocoa", hex: "#6b4a32" },
      { name: "Ink", hex: "#1f2733" },
      { name: "Rose", hex: "#d29a93" },
    ],
    details: [
      "Soft matte vegan leather",
      "Adjustable webbing strap",
      "Magnetic flap closure",
      "Dimensions: 23 × 16 × 7 cm",
    ],
  },
  {
    id: 3,
    sku: "PB-LS-003",
    name: "Luna Shoulder Bag",
    description:
      "Classic crescent silhouette with a sculpted handle that rests neatly under the arm. Made for elevated everyday wear.",
    price: 219,
    category: "shoulder",
    style: "shoulder",
    rating: 4.9,
    reviewCount: 311,
    stock: 8,
    material: "Smooth vegan leather",
    weight: "0.5 kg",
    tags: ["popular", "evening"],
    colors: [
      { name: "Champagne", hex: "#dac7a4" },
      { name: "Slate", hex: "#5b6571" },
      { name: "Plum", hex: "#5a2a44" },
    ],
    details: [
      "Sculpted top handle",
      "Smooth matte finish",
      "Magnetic snap closure",
      "Dimensions: 28 × 15 × 8 cm",
    ],
  },
  {
    id: 4,
    sku: "PB-WB-004",
    name: "Weekend Bucket",
    description:
      "A roomy drawstring bucket bag for travel days and city escapes. Lightweight, soft-structured, and effortlessly chic.",
    price: 179,
    category: "bucket",
    style: "bucket",
    rating: 4.6,
    reviewCount: 96,
    stock: 15,
    material: "Pebbled vegan leather",
    weight: "0.55 kg",
    tags: ["travel", "roomy"],
    colors: [
      { name: "Camel", hex: "#b89070" },
      { name: "Charcoal", hex: "#2c2c30" },
    ],
    details: [
      "Drawstring closure with leather pull",
      "Removable interior pouch",
      "Soft pebbled finish",
      "Dimensions: 26 × 30 × 18 cm",
    ],
  },
  {
    id: 5,
    sku: "PB-AS-005",
    name: "Aurora Satchel",
    description:
      "A polished satchel with crisp lines, a top zip, and gold-tone hardware. Equally at home in the boardroom or on a flight.",
    price: 249,
    compareAtPrice: 289,
    category: "satchel",
    style: "satchel",
    badge: "Limited",
    rating: 4.9,
    reviewCount: 187,
    stock: 2,
    material: "Saffiano-textured vegan leather",
    weight: "0.85 kg",
    tags: ["limited", "work", "professional"],
    colors: [
      { name: "Espresso", hex: "#3b2a20" },
      { name: "Ivory", hex: "#efe7d6" },
      { name: "Forest", hex: "#2f4a3a" },
    ],
    details: [
      "Saffiano-textured vegan leather",
      "Top zip with padded laptop sleeve",
      "Detachable long strap included",
      "Dimensions: 35 × 26 × 12 cm",
    ],
  },
  {
    id: 6,
    sku: "PB-EC-006",
    name: "Evening Clutch",
    description:
      "A sculptural compact clutch with a subtle pearl clasp. Slim, hand-finished, and built for a memorable night out.",
    price: 119,
    category: "clutch",
    style: "clutch",
    rating: 4.5,
    reviewCount: 73,
    stock: 9,
    material: "Hand-finished vegan leather",
    weight: "0.3 kg",
    tags: ["evening", "occasion"],
    colors: [
      { name: "Pearl", hex: "#ece4d6" },
      { name: "Noir", hex: "#0e0e10" },
      { name: "Wine", hex: "#5a1f2b" },
    ],
    details: [
      "Hand-finished pearl clasp",
      "Detachable wrist chain",
      "Satin-lined interior",
      "Dimensions: 24 × 13 × 4 cm",
    ],
  },
  {
    id: 7,
    sku: "PB-MH-007",
    name: "Marlow Hobo",
    description:
      "A slouchy shoulder bag with a gathered top and a sumptuous suede-touch finish. Made to carry your day, gracefully.",
    price: 199,
    category: "shoulder",
    style: "shoulder",
    rating: 4.7,
    reviewCount: 124,
    stock: 6,
    material: "Suede-touch microfiber",
    weight: "0.5 kg",
    tags: ["everyday", "casual"],
    colors: [
      { name: "Stone", hex: "#a89a86" },
      { name: "Cognac", hex: "#8a4d2c" },
    ],
    details: [
      "Suede-touch microfiber exterior",
      "Single rolled shoulder strap",
      "Interior slip and zip pockets",
      "Dimensions: 36 × 28 × 12 cm",
    ],
  },
  {
    id: 8,
    sku: "PB-AT-008",
    name: "Atelier Top Handle",
    description:
      "A heritage-inspired top handle bag with crisp gusseted sides and a removable shoulder strap. Quiet confidence.",
    price: 289,
    category: "satchel",
    style: "satchel",
    badge: "New",
    rating: 4.8,
    reviewCount: 58,
    stock: 4,
    material: "Smooth vegan leather",
    weight: "0.8 kg",
    tags: ["new", "professional", "heritage"],
    colors: [
      { name: "Black", hex: "#101015" },
      { name: "Bone", hex: "#e8dfce" },
      { name: "Mocha", hex: "#5e3f30" },
    ],
    details: [
      "Hand-rolled top handle",
      "Gold-tone metal feet",
      "Removable long strap",
      "Dimensions: 27 × 19 × 10 cm",
    ],
  },
  {
    id: 9,
    sku: "PB-SP-009",
    name: "Sora Pouch",
    description:
      "A minimal day pouch with a single contoured strap. Slim, light, and effortlessly modern.",
    price: 99,
    category: "crossbody",
    style: "crossbody",
    rating: 4.6,
    reviewCount: 211,
    stock: 0,
    material: "Pebbled vegan leather",
    weight: "0.3 kg",
    tags: ["minimal", "everyday"],
    colors: [
      { name: "Sage", hex: "#a9b59a" },
      { name: "Coal", hex: "#26272d" },
      { name: "Blush", hex: "#e6c3bb" },
    ],
    details: [
      "Single contoured strap",
      "Zip top closure",
      "Soft pebbled finish",
      "Dimensions: 22 × 14 × 5 cm",
    ],
  },
];

async function main() {
  for (const promo of promos) {
    await prisma.promoCode.upsert({
      where: { code: promo.code },
      update: promo,
      create: promo,
    });
  }

  for (const bag of handbags) {
    await prisma.product.upsert({
      where: { id: bag.id },
      update: bag,
      create: bag,
    });
  }

  console.log(`Seeded ${promos.length} promo codes and ${handbags.length} products`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
