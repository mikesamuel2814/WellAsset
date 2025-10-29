import { db } from "./db";
import { properties } from "@shared/schema";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database for Bangladesh market...");

  // Clear existing properties for clean re-seed
  await db.execute(sql`TRUNCATE TABLE properties RESTART IDENTITY CASCADE`);
  console.log("✓ Cleared existing properties");

  const sampleProperties = [
    {
      title: "Luxury Gulshan Villa",
      titleBn: "বিলাসবহুল গুলশান ভিলা",
      price: "85000000",
      type: "Villa",
      location: "Gulshan-2, Dhaka",
      locationBn: "গুলশান-২, ঢাকা",
      bedrooms: 5,
      bathrooms: 6,
      area: 4200,
      description: "Stunning luxury villa in prime Gulshan location with modern amenities, landscaped gardens, and 24/7 security. Features include infinity pool, home theater, and smart home technology throughout.",
      descriptionBn: "প্রাইম গুলশান এলাকায় আধুনিক সুবিধা, সুসজ্জিত বাগান এবং ২৪/৭ নিরাপত্তা সহ অত্যাশ্চর্য বিলাসবহুল ভিলা। বৈশিষ্ট্যগুলির মধ্যে রয়েছে ইনফিনিটি পুল, হোম থিয়েটার এবং সমস্ত স্মার্ট হোম প্রযুক্তি।",
      features: ["Swimming Pool", "Home Theater", "Smart Home", "Garden", "Security", "Parking"],
      featuresBn: ["সুইমিং পুল", "হোম থিয়েটার", "স্মার্ট হোম", "বাগান", "নিরাপত্তা", "পার্কিং"],
      status: "active",
      images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"],
      agentId: null,
    },
    {
      title: "Modern Banani Penthouse",
      titleBn: "আধুনিক বনানী পেন্টহাউস",
      price: "55000000",
      type: "Condo",
      location: "Banani, Dhaka",
      locationBn: "বনানী, ঢাকা",
      bedrooms: 3,
      bathrooms: 3,
      area: 2800,
      description: "Exquisite penthouse in the heart of Banani with floor-to-ceiling windows offering breathtaking city views. Premium finishes, chef's kitchen, and private terrace with panoramic views.",
      descriptionBn: "বনানীর কেন্দ্রস্থলে মেঝে থেকে সিলিং পর্যন্ত জানালা সহ নিখুঁত পেন্টহাউস যা শ্বাসরুদ্ধকর শহরের দৃশ্য প্রদান করে। প্রিমিয়াম ফিনিশ, শেফের রান্নাঘর এবং প্যানোরামিক দৃশ্য সহ ব্যক্তিগত টেরেস।",
      features: ["City View", "Private Terrace", "Modern Kitchen", "Elevator", "Gym", "24hr Security"],
      featuresBn: ["শহরের দৃশ্য", "ব্যক্তিগত টেরেস", "আধুনিক রান্নাঘর", "লিফট", "জিম", "২৪ ঘন্টা নিরাপত্তা"],
      status: "active",
      images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"],
      agentId: null,
    },
    {
      title: "Contemporary Dhanmondi Townhouse",
      titleBn: "সমসাময়িক ধানমন্ডি টাউনহাউস",
      price: "38000000",
      type: "Townhouse",
      location: "Dhanmondi, Dhaka",
      locationBn: "ধানমন্ডি, ঢাকা",
      bedrooms: 4,
      bathrooms: 3,
      area: 3200,
      description: "Beautifully designed townhouse in prestigious Dhanmondi area with modern architecture, spacious rooms, and family-friendly layout. Close to schools, parks, and shopping centers.",
      descriptionBn: "আধুনিক স্থাপত্য, প্রশস্ত কক্ষ এবং পরিবার-বান্ধব লেআউট সহ মর্যাদাপূর্ণ ধানমন্ডি এলাকায় সুন্দরভাবে ডিজাইন করা টাউনহাউস। স্কুল, পার্ক এবং শপিং সেন্টারের কাছে।",
      features: ["Spacious Rooms", "Modern Design", "Covered Parking", "Rooftop Access", "Near Schools", "Quiet Area"],
      featuresBn: ["প্রশস্ত কক্ষ", "আধুনিক ডিজাইন", "আচ্ছাদিত পার্কিং", "ছাদ প্রবেশাধিকার", "স্কুলের কাছে", "শান্ত এলাকা"],
      status: "active",
      images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
      agentId: null,
    },
    {
      title: "Prime Commercial Space Motijheel",
      titleBn: "প্রাইম বাণিজ্যিক স্থান মতিঝিল",
      price: "120000000",
      type: "Commercial",
      location: "Motijheel, Dhaka",
      locationBn: "মতিঝিল, ঢাকা",
      bedrooms: 0,
      bathrooms: 4,
      area: 6000,
      description: "Premium office space in Dhaka's financial district with modern infrastructure, high-speed connectivity, and prestigious address. Perfect for corporate headquarters or financial institutions.",
      descriptionBn: "আধুনিক অবকাঠামো, উচ্চ-গতির সংযোগ এবং মর্যাদাপূর্ণ ঠিকানা সহ ঢাকার আর্থিক জেলায় প্রিমিয়াম অফিস স্থান। কর্পোরেট সদর দপ্তর বা আর্থিক প্রতিষ্ঠানের জন্য নিখুঁত।",
      features: ["CBD Location", "High-Speed Internet", "Conference Rooms", "Reception Area", "Parking", "24/7 Security"],
      featuresBn: ["সিবিডি অবস্থান", "উচ্চ-গতির ইন্টারনেট", "সম্মেলন কক্ষ", "অভ্যর্থনা এলাকা", "পার্কিং", "২৪/৭ নিরাপত্তা"],
      status: "active",
      images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"],
      agentId: null,
    },
    {
      title: "Elegant Uttara Mansion",
      titleBn: "মার্জিত উত্তরা প্রাসাদ",
      price: "95000000",
      type: "Villa",
      location: "Uttara, Dhaka",
      locationBn: "উত্তরা, ঢাকা",
      bedrooms: 6,
      bathrooms: 7,
      area: 5500,
      description: "Magnificent estate in Uttara with contemporary architecture, extensive grounds, guest house, and unparalleled privacy. Ideal for luxury family living with world-class amenities.",
      descriptionBn: "সমসাময়িক স্থাপত্য, বিস্তৃত মাঠ, গেস্ট হাউস এবং অতুলনীয় গোপনীয়তা সহ উত্তরায় দুর্দান্ত সম্পত্তি। বিশ্বমানের সুবিধা সহ বিলাসবহুল পারিবারিক জীবনযাপনের জন্য আদর্শ।",
      features: ["Large Estate", "Guest House", "Private Garden", "Security Gate", "Modern Architecture", "Premium Location"],
      featuresBn: ["বড় সম্পত্তি", "গেস্ট হাউস", "ব্যক্তিগত বাগান", "নিরাপত্তা গেট", "আধুনিক স্থাপত্য", "প্রিমিয়াম অবস্থান"],
      status: "active",
      images: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"],
      agentId: null,
    },
    {
      title: "Stylish Bashundhara Apartment",
      titleBn: "স্টাইলিশ বসুন্ধরা অ্যাপার্টমেন্ট",
      price: "25000000",
      type: "Apartment",
      location: "Bashundhara, Dhaka",
      locationBn: "বসুন্ধরা, ঢাকা",
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      description: "Chic apartment in Bashundhara Residential Area with modern design, high-quality finishes, and excellent amenities. Close to shopping malls, restaurants, and entertainment.",
      descriptionBn: "আধুনিক ডিজাইন, উচ্চ-মানের ফিনিশ এবং চমৎকার সুবিধা সহ বসুন্ধরা আবাসিক এলাকায় আকর্ষণীয় অ্যাপার্টমেন্ট। শপিং মল, রেস্তোরাঁ এবং বিনোদনের কাছে।",
      features: ["Swimming Pool", "Fitness Center", "24hr Security", "Balcony", "Modern Kitchen", "Parking Space"],
      featuresBn: ["সুইমিং পুল", "ফিটনেস সেন্টার", "২৪ ঘন্টা নিরাপত্তা", "বারান্দা", "আধুনিক রান্নাঘর", "পার্কিং স্পেস"],
      status: "active",
      images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"],
      agentId: null,
    },
  ];

  await db.insert(properties).values(sampleProperties);
  console.log("✓ Seeded 6 sample properties for Bangladesh market");

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
