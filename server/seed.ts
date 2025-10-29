import { db } from "./db";
import { properties } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  const sampleProperties = [
    {
      title: "Luxury Beachfront Villa",
      price: "2500000",
      type: "Villa",
      location: "Phuket, Thailand",
      bedrooms: 5,
      bathrooms: 6,
      area: 450,
      description: "Stunning luxury villa with panoramic ocean views, private beach access, and world-class amenities. Features include an infinity pool, home theater, wine cellar, and smart home technology throughout.",
      features: ["Infinity Pool", "Private Beach Access", "Home Theater", "Wine Cellar", "Smart Home", "Sea View"],
      status: "active",
      images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"],
      agentId: null,
    },
    {
      title: "Modern Downtown Penthouse",
      price: "1800000",
      type: "Condo",
      location: "Bangkok, Thailand",
      bedrooms: 3,
      bathrooms: 3,
      area: 280,
      description: "Exquisite penthouse in the heart of Bangkok with floor-to-ceiling windows offering breathtaking city skyline views. Premium finishes, chef's kitchen, and private terrace.",
      features: ["City View", "Private Terrace", "Chef's Kitchen", "High Ceilings", "Concierge Service", "Gym Access"],
      status: "active",
      images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"],
      agentId: null,
    },
    {
      title: "Contemporary Garden Townhouse",
      price: "950000",
      type: "Townhouse",
      location: "Chiang Mai, Thailand",
      bedrooms: 4,
      bathrooms: 3,
      area: 320,
      description: "Beautifully designed townhouse in a gated community surrounded by lush gardens. Modern architecture with sustainable features and family-friendly layout.",
      features: ["Garden", "Gated Community", "Sustainable Design", "Covered Parking", "Modern Kitchen", "Study Room"],
      status: "active",
      images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
      agentId: null,
    },
    {
      title: "Prime Commercial Office Space",
      price: "3200000",
      type: "Commercial",
      location: "Bangkok CBD, Thailand",
      bedrooms: 0,
      bathrooms: 4,
      area: 600,
      description: "Premium office space in the central business district with modern infrastructure, high-speed connectivity, and prestigious address. Perfect for corporate headquarters.",
      features: ["CBD Location", "High-Speed Internet", "Conference Rooms", "Reception Area", "Parking Spaces", "24/7 Security"],
      status: "active",
      images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"],
      agentId: null,
    },
    {
      title: "Elegant Riverside Mansion",
      price: "4500000",
      type: "Villa",
      location: "Ayutthaya, Thailand",
      bedrooms: 6,
      bathrooms: 7,
      area: 650,
      description: "Magnificent estate on the riverfront with classical Thai-contemporary architecture. Extensive grounds, guest house, and unparalleled privacy.",
      features: ["Riverfront", "Guest House", "Large Grounds", "Traditional Architecture", "Boat Dock", "Outdoor Kitchen"],
      status: "active",
      images: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"],
      agentId: null,
    },
    {
      title: "Stylish Urban Apartment",
      price: "650000",
      type: "Apartment",
      location: "Sukhumvit, Bangkok",
      bedrooms: 2,
      bathrooms: 2,
      area: 120,
      description: "Chic apartment in prime location with easy access to BTS, shopping, and dining. Modern design with high-quality finishes.",
      features: ["BTS Access", "Swimming Pool", "Fitness Center", "24hr Security", "Balcony", "Modern Kitchen"],
      status: "active",
      images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"],
      agentId: null,
    },
  ];

  const existingProperties = await db.select().from(properties);
  
  if (existingProperties.length === 0) {
    await db.insert(properties).values(sampleProperties);
    console.log("✓ Seeded 6 sample properties");
  } else {
    console.log(`Database already has ${existingProperties.length} properties, skipping seed`);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
