import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "bn";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations = {
  en: {
    // Navbar
    "nav.home": "Home",
    "nav.properties": "Properties",
    "nav.about": "About",
    "nav.contact": "Contact",
    
    // Hero/Carousel
    "hero.title": "Discover Your Dream Property",
    "hero.subtitle": "Premium real estate in Dhaka, Bangladesh",
    "hero.browse": "BROWSE PROPERTIES",
    "hero.contact": "CONTACT US",
    "hero.viewDetails": "VIEW DETAILS",
    "hero.beds": "Beds",
    "hero.baths": "Baths",
    
    // Home Page
    "home.featured": "Featured Properties",
    "home.featuredDesc": "Handpicked selection of our most prestigious properties in Dhaka",
    "home.excellence": "Excellence in Real Estate Development",
    "home.excellenceDesc": "For over a decade, Well Asset Development Co., Ltd has been at the forefront of luxury real estate in Bangladesh, creating exceptional properties that redefine modern living in Dhaka. Our commitment to quality, innovation, and customer satisfaction has made us a trusted name in premium property development.",
    "home.learnMore": "LEARN MORE ABOUT US",
    "home.latest": "Latest Listings",
    "home.latestDesc": "Discover our newest luxury properties now available in Dhaka",
    "home.viewAll": "VIEW ALL PROPERTIES",
    "home.ready": "Ready to Find Your Perfect Property?",
    "home.readyDesc": "Let our expert team guide you to your dream home or investment opportunity in Dhaka",
    "home.getInTouch": "GET IN TOUCH TODAY",
    "home.noProperties": "No featured properties available at the moment",
    
    // Properties Page
    "properties.title": "Luxury Properties in Dhaka",
    "properties.search": "Search properties...",
    "properties.type": "Property Type",
    "properties.location": "Location",
    "properties.priceRange": "Price Range",
    "properties.bedrooms": "Bedrooms",
    "properties.allTypes": "All Types",
    "properties.allLocations": "All Locations",
    "properties.villa": "Villa",
    "properties.condo": "Condo",
    "properties.townhouse": "Townhouse",
    "properties.apartment": "Apartment",
    "properties.commercial": "Commercial",
    "properties.any": "Any",
    "properties.min": "Min",
    "properties.max": "Max",
    "properties.reset": "RESET FILTERS",
    
    // Property Details
    "property.bedrooms": "Bedrooms",
    "property.bathrooms": "Bathrooms",
    "property.area": "Area",
    "property.status": "Status",
    "property.type": "Type",
    "property.location": "Location",
    "property.description": "Description",
    "property.features": "Features",
    "property.inquiry": "Property Inquiry",
    "property.inquiryDesc": "Interested in this property? Send us a message and we'll get back to you shortly",
    "property.name": "Your Name",
    "property.email": "Email Address",
    "property.phone": "Phone Number",
    "property.message": "Message",
    "property.submit": "SUBMIT INQUIRY",
    "property.submitting": "SUBMITTING...",
    "property.success": "Thank you! Your inquiry has been submitted successfully",
    "property.error": "Failed to submit inquiry",
    "property.googleMaps": "Location on Google Maps",
    
    // About Page
    "about.title": "About Well Asset Development",
    "about.story": "Our Story",
    "about.storyDesc": "Founded in Dhaka, Bangladesh, Well Asset Development Co., Ltd has been a pioneer in luxury real estate development for over a decade. We specialize in creating premium residential and commercial properties that combine modern design with traditional Bangladeshi architectural elements.",
    "about.values": "Our Core Values",
    "about.quality": "Quality Excellence",
    "about.qualityDesc": "We never compromise on the quality of materials, design, or construction in our developments",
    "about.innovation": "Innovation",
    "about.innovationDesc": "We embrace cutting-edge technology and sustainable building practices",
    "about.customer": "Customer First",
    "about.customerDesc": "Your satisfaction is our top priority, from initial inquiry to after-sales service",
    "about.stats": "Our Achievements",
    "about.completedProjects": "Completed Projects",
    "about.satisfiedClients": "Satisfied Clients",
    "about.yearsExperience": "Years of Experience",
    
    // Contact Page
    "contact.title": "Contact Us",
    "contact.subtitle": "Get in touch with our team for inquiries, viewings, or more information about our properties in Dhaka",
    "contact.getInTouch": "Get In Touch",
    "contact.phone": "Phone",
    "contact.email": "Email",
    "contact.office": "Office",
    "contact.officeAddress": "123 Gulshan Avenue, Dhaka 1212, Bangladesh",
    "contact.hours": "Office Hours",
    "contact.hoursTime": "Saturday - Thursday: 9:00 AM - 6:00 PM",
    "contact.send": "SEND MESSAGE",
    "contact.sending": "SENDING...",
    
    // Common
    "common.sqft": "sqft",
    "common.sqm": "sqm",
    "common.active": "Active",
    "common.sold": "Sold",
    "common.pending": "Pending",
    "common.loading": "Loading...",
    "common.backToProperties": "Back to Properties",
    "common.bedrooms": "Bedrooms",
    "common.bathrooms": "Bathrooms",
    
    // Property Details Page
    "propertyDetails.description": "Description",
    "propertyDetails.features": "Key Features",
    "propertyDetails.location": "Location",
    "propertyDetails.mapAvailable": "Map integration available",
  },
  bn: {
    // Navbar
    "nav.home": "হোম",
    "nav.properties": "সম্পত্তি",
    "nav.about": "আমাদের সম্পর্কে",
    "nav.contact": "যোগাযোগ",
    
    // Hero/Carousel
    "hero.title": "আপনার স্বপ্নের সম্পত্তি খুঁজুন",
    "hero.subtitle": "ঢাকা, বাংলাদেশে প্রিমিয়াম রিয়েল এস্টেট",
    "hero.browse": "সম্পত্তি দেখুন",
    "hero.contact": "যোগাযোগ করুন",
    "hero.viewDetails": "বিস্তারিত দেখুন",
    "hero.beds": "বেডরুম",
    "hero.baths": "বাথরুম",
    
    // Home Page
    "home.featured": "বৈশিষ্ট্যযুক্ত সম্পত্তি",
    "home.featuredDesc": "ঢাকায় আমাদের সবচেয়ে মর্যাদাপূর্ণ সম্পত্তির সংগ্রহ",
    "home.excellence": "রিয়েল এস্টেট উন্নয়নে শ্রেষ্ঠত্ব",
    "home.excellenceDesc": "এক দশকেরও বেশি সময় ধরে, ওয়েল অ্যাসেট ডেভেলপমেন্ট কো., লিমিটেড বাংলাদেশে বিলাসবহুল রিয়েল এস্টেটের অগ্রভাগে রয়েছে, ঢাকায় আধুনিক জীবনযাত্রাকে নতুনভাবে সংজ্ঞায়িত করে ব্যতিক্রমী সম্পত্তি তৈরি করছে। গুণমান, উদ্ভাবন এবং গ্রাহক সন্তুষ্টির প্রতি আমাদের অঙ্গীকার আমাদের প্রিমিয়াম সম্পত্তি উন্নয়নে একটি বিশ্বস্ত নাম করে তুলেছে।",
    "home.learnMore": "আমাদের সম্পর্কে আরও জানুন",
    "home.latest": "সর্বশেষ তালিকা",
    "home.latestDesc": "ঢাকায় এখন উপলব্ধ আমাদের নতুনতম বিলাসবহুল সম্পত্তি আবিষ্কার করুন",
    "home.viewAll": "সব সম্পত্তি দেখুন",
    "home.ready": "আপনার নিখুঁত সম্পত্তি খুঁজে পেতে প্রস্তুত?",
    "home.readyDesc": "ঢাকায় আপনার স্বপ্নের বাড়ি বা বিনিয়োগের সুযোগে আমাদের বিশেষজ্ঞ দল আপনাকে গাইড করুক",
    "home.getInTouch": "আজই যোগাযোগ করুন",
    "home.noProperties": "এই মুহূর্তে কোন বৈশিষ্ট্যযুক্ত সম্পত্তি উপলব্ধ নেই",
    
    // Properties Page
    "properties.title": "ঢাকায় বিলাসবহুল সম্পত্তি",
    "properties.search": "সম্পত্তি খুঁজুন...",
    "properties.type": "সম্পত্তির ধরন",
    "properties.location": "অবস্থান",
    "properties.priceRange": "মূল্য সীমা",
    "properties.bedrooms": "বেডরুম",
    "properties.allTypes": "সব ধরনের",
    "properties.allLocations": "সব অবস্থান",
    "properties.villa": "ভিলা",
    "properties.condo": "কন্ডো",
    "properties.townhouse": "টাউনহাউস",
    "properties.apartment": "অ্যাপার্টমেন্ট",
    "properties.commercial": "বাণিজ্যিক",
    "properties.any": "যেকোনো",
    "properties.min": "সর্বনিম্ন",
    "properties.max": "সর্বোচ্চ",
    "properties.reset": "ফিল্টার রিসেট করুন",
    
    // Property Details
    "property.bedrooms": "বেডরুম",
    "property.bathrooms": "বাথরুম",
    "property.area": "এলাকা",
    "property.status": "স্ট্যাটাস",
    "property.type": "ধরন",
    "property.location": "অবস্থান",
    "property.description": "বিবরণ",
    "property.features": "বৈশিষ্ট্য",
    "property.inquiry": "সম্পত্তি অনুসন্ধান",
    "property.inquiryDesc": "এই সম্পত্তিতে আগ্রহী? আমাদের একটি বার্তা পাঠান এবং আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব",
    "property.name": "আপনার নাম",
    "property.email": "ইমেইল ঠিকানা",
    "property.phone": "ফোন নম্বর",
    "property.message": "বার্তা",
    "property.submit": "অনুসন্ধান জমা দিন",
    "property.submitting": "জমা দেওয়া হচ্ছে...",
    "property.success": "ধন্যবাদ! আপনার অনুসন্ধান সফলভাবে জমা দেওয়া হয়েছে",
    "property.error": "অনুসন্ধান জমা দিতে ব্যর্থ হয়েছে",
    "property.googleMaps": "গুগল ম্যাপে অবস্থান",
    
    // About Page
    "about.title": "ওয়েল অ্যাসেট ডেভেলপমেন্ট সম্পর্কে",
    "about.story": "আমাদের গল্প",
    "about.storyDesc": "ঢাকা, বাংলাদেশে প্রতিষ্ঠিত, ওয়েল অ্যাসেট ডেভেলপমেন্ট কো., লিমিটেড এক দশকেরও বেশি সময় ধরে বিলাসবহুল রিয়েল এস্টেট উন্নয়নে অগ্রণী। আমরা প্রিমিয়াম আবাসিক এবং বাণিজ্যিক সম্পত্তি তৈরিতে বিশেষজ্ঞ যা ঐতিহ্যবাহী বাংলাদেশী স্থাপত্য উপাদানগুলির সাথে আধুনিক ডিজাইনকে একত্রিত করে।",
    "about.values": "আমাদের মূল মূল্যবোধ",
    "about.quality": "গুণমান শ্রেষ্ঠত্ব",
    "about.qualityDesc": "আমরা আমাদের উন্নয়নে উপকরণ, ডিজাইন বা নির্মাণের গুণমানে কখনও আপস করি না",
    "about.innovation": "উদ্ভাবন",
    "about.innovationDesc": "আমরা অত্যাধুনিক প্রযুক্তি এবং টেকসই নির্মাণ অনুশীলন গ্রহণ করি",
    "about.customer": "গ্রাহক প্রথম",
    "about.customerDesc": "প্রাথমিক অনুসন্ধান থেকে বিক্রয়োত্তর সেবা পর্যন্ত আপনার সন্তুষ্টি আমাদের সর্বোচ্চ অগ্রাধিকার",
    "about.stats": "আমাদের অর্জন",
    "about.completedProjects": "সম্পন্ন প্রকল্প",
    "about.satisfiedClients": "সন্তুষ্ট ক্লায়েন্ট",
    "about.yearsExperience": "বছরের অভিজ্ঞতা",
    
    // Contact Page
    "contact.title": "যোগাযোগ করুন",
    "contact.subtitle": "ঢাকায় আমাদের সম্পত্তি সম্পর্কে অনুসন্ধান, দেখা বা আরও তথ্যের জন্য আমাদের টিমের সাথে যোগাযোগ করুন",
    "contact.getInTouch": "যোগাযোগ করুন",
    "contact.phone": "ফোন",
    "contact.email": "ইমেইল",
    "contact.office": "অফিস",
    "contact.officeAddress": "১২৩ গুলশান এভিনিউ, ঢাকা ১২১২, বাংলাদেশ",
    "contact.hours": "অফিস সময়",
    "contact.hoursTime": "শনিবার - বৃহস্পতিবার: সকাল ৯:০০ - সন্ধ্যা ৬:০০",
    "contact.send": "বার্তা পাঠান",
    "contact.sending": "পাঠানো হচ্ছে...",
    
    // Common
    "common.sqft": "বর্গফুট",
    "common.sqm": "বর্গমিটার",
    "common.active": "সক্রিয়",
    "common.sold": "বিক্রিত",
    "common.pending": "মুলতুবি",
    "common.loading": "লোড হচ্ছে...",
    "common.backToProperties": "সম্পত্তিতে ফিরে যান",
    "common.bedrooms": "বেডরুম",
    "common.bathrooms": "বাথরুম",
    
    // Property Details Page
    "propertyDetails.description": "বিবরণ",
    "propertyDetails.features": "মূল বৈশিষ্ট্য",
    "propertyDetails.location": "অবস্থান",
    "propertyDetails.mapAvailable": "ম্যাপ ইন্টিগ্রেশন উপলব্ধ",
  },
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    const translation = translations[language] as Record<string, string>;
    return translation[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

// Helper function to get language-aware property fields
export function usePropertyText(property: any, field: 'title' | 'location' | 'description' | 'features') {
  const { language } = useI18n();
  
  if (language === 'bn') {
    if (field === 'title') return property.titleBn || property.title;
    if (field === 'location') return property.locationBn || property.location;
    if (field === 'description') return property.descriptionBn || property.description;
    if (field === 'features') return property.featuresBn || property.features;
  }
  
  return property[field];
}
