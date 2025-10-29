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
    "about.subtitle": "Creating exceptional living spaces for discerning clients since 2010",
    "about.story": "Our Story",
    "about.storyPara1": "Well Asset Development Co., Ltd was founded with a singular vision: to transform the real estate landscape through innovative design, uncompromising quality, and exceptional customer service.",
    "about.storyPara2": "For over a decade, we have been at the forefront of luxury property development, creating residences and commercial spaces that set new standards in modern living. Our portfolio spans prestigious locations, each property carefully crafted to offer the perfect blend of elegance, functionality, and lifestyle.",
    "about.storyPara3": "From exclusive villas to sophisticated urban condominiums, every project reflects our commitment to excellence and our deep understanding of what makes a property truly exceptional.",
    "about.values": "Our Values",
    "about.excellence": "Excellence",
    "about.excellenceDesc": "We pursue perfection in every detail, from architectural design to customer service, ensuring that each property exceeds expectations.",
    "about.clientCentric": "Client-Centric",
    "about.clientCentricDesc": "Your vision drives our work. We listen carefully, understand deeply, and deliver solutions that perfectly match your lifestyle and aspirations.",
    "about.innovation": "Innovation",
    "about.innovationDesc": "We embrace cutting-edge design and sustainable practices, creating properties that are both timeless and forward-thinking.",
    "about.mission": "Our Mission",
    "about.missionDesc": "To create extraordinary properties that enhance lives, build communities, and stand as enduring testaments to quality and innovation. We are committed to delivering exceptional value to our clients while maintaining the highest standards of integrity and professionalism.",
    "about.projectsCompleted": "Projects Completed",
    "about.happyClients": "Happy Clients",
    "about.yearsExperience": "Years Experience",
    "about.awardsWon": "Awards Won",
    
    // Contact Page
    "contact.title": "Contact Us",
    "contact.subtitle": "Get in touch with our team. We're here to help you find your perfect property.",
    "contact.phone": "Phone",
    "contact.phoneAvailable": "Available Mon-Fri, 9AM-6PM",
    "contact.phoneNumber": "+880 1234-567890",
    "contact.email": "Email",
    "contact.emailResponse": "We'll respond within 24 hours",
    "contact.emailAddress": "info@wellasset.com",
    "contact.office": "Office",
    "contact.officeVisit": "Visit us at our main office",
    "contact.officeAddress": "123 Gulshan Avenue\nDhaka 1212, Bangladesh",
    "contact.formTitle": "Send us a message",
    "contact.formDesc": "Fill out the form below and our team will get back to you promptly. Whether you're looking for information about a specific property or have general inquiries, we're here to help.",
    "contact.fullName": "Full Name",
    "contact.fullNamePlaceholder": "John Doe",
    "contact.emailLabel": "Email Address",
    "contact.emailPlaceholder": "john@example.com",
    "contact.phoneLabel": "Phone Number",
    "contact.phonePlaceholder": "+880 1XXX-XXXXXX",
    "contact.messageLabel": "Your Message",
    "contact.messagePlaceholder": "Tell us how we can help you...",
    "contact.sendMessage": "SEND MESSAGE",
    "contact.sending": "SENDING...",
    "contact.visitOffice": "Visit our office",
    "contact.mapAvailable": "Map integration available",
    "contact.mapLocation": "123 Gulshan Avenue, Dhaka 1212, Bangladesh",
    "contact.officeHours": "Office Hours",
    "contact.mondayFriday": "Monday - Friday",
    "contact.mondayFridayTime": "9:00 AM - 6:00 PM",
    "contact.saturday": "Saturday",
    "contact.saturdayTime": "10:00 AM - 4:00 PM",
    "contact.sunday": "Sunday",
    "contact.sundayClosed": "Closed",
    "contact.successTitle": "Message sent successfully!",
    "contact.successDesc": "We'll get back to you as soon as possible.",
    "contact.errorTitle": "Error sending message",
    "contact.errorDesc": "Please try again later.",
    
    // Footer
    "footer.tagline": "Creating exceptional living spaces and investment opportunities since 2010.",
    "footer.quickLinks": "Quick Links",
    "footer.home": "Home",
    "footer.properties": "Properties",
    "footer.about": "About Us",
    "footer.contact": "Contact",
    "footer.contactInfo": "Contact Info",
    "footer.officeAddress": "123 Gulshan Avenue\nDhaka 1212, Bangladesh",
    "footer.phone": "+880 1234-567890",
    "footer.email": "info@wellasset.com",
    "footer.followUs": "Follow Us",
    "footer.copyright": "Well Asset Development Co., Ltd. All rights reserved.",
    
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
    "about.subtitle": "২০১০ সাল থেকে বিচক্ষণ ক্লায়েন্টদের জন্য ব্যতিক্রমী জীবনযাত্রার স্থান তৈরি করছি",
    "about.story": "আমাদের গল্প",
    "about.storyPara1": "ওয়েল অ্যাসেট ডেভেলপমেন্ট কো., লিমিটেড একটি একক দৃষ্টিভঙ্গি নিয়ে প্রতিষ্ঠিত হয়েছিল: উদ্ভাবনী ডিজাইন, আপসহীন গুণমান এবং ব্যতিক্রমী গ্রাহক সেবার মাধ্যমে রিয়েল এস্টেট ল্যান্ডস্কেপকে রূপান্তরিত করা।",
    "about.storyPara2": "এক দশকেরও বেশি সময় ধরে, আমরা বিলাসবহুল সম্পত্তি উন্নয়নের অগ্রভাগে রয়েছি, আবাসিক এবং বাণিজ্যিক স্থান তৈরি করছি যা আধুনিক জীবনযাত্রায় নতুন মান স্থাপন করে। আমাদের পোর্টফোলিও মর্যাদাপূর্ণ স্থানগুলি জুড়ে বিস্তৃত, প্রতিটি সম্পত্তি সাবধানে তৈরি করা হয়েছে কমনীয়তা, কার্যকারিতা এবং জীবনধারার নিখুঁত মিশ্রণ প্রদান করতে।",
    "about.storyPara3": "একচেটিয়া ভিলা থেকে পরিশীলিত শহুরে কন্ডোমিনিয়াম পর্যন্ত, প্রতিটি প্রকল্প আমাদের শ্রেষ্ঠত্বের প্রতি অঙ্গীকার এবং একটি সম্পত্তিকে সত্যিকারের ব্যতিক্রমী করে তোলে তার গভীর বোঝাপড়ার প্রতিফলন ঘটায়।",
    "about.values": "আমাদের মূল্যবোধ",
    "about.excellence": "শ্রেষ্ঠত্ব",
    "about.excellenceDesc": "আমরা প্রতিটি বিস্তারিত বিষয়ে পূর্ণতা অনুসরণ করি, স্থাপত্য ডিজাইন থেকে গ্রাহক সেবা পর্যন্ত, নিশ্চিত করি যে প্রতিটি সম্পত্তি প্রত্যাশা অতিক্রম করে।",
    "about.clientCentric": "ক্লায়েন্ট-কেন্দ্রিক",
    "about.clientCentricDesc": "আপনার দৃষ্টিভঙ্গি আমাদের কাজকে চালিত করে। আমরা সাবধানে শুনি, গভীরভাবে বুঝি এবং সমাধান প্রদান করি যা আপনার জীবনধারা এবং আকাঙ্ক্ষার সাথে পুরোপুরি মিলে।",
    "about.innovation": "উদ্ভাবন",
    "about.innovationDesc": "আমরা অত্যাধুনিক ডিজাইন এবং টেকসই অনুশীলনকে আলিঙ্গন করি, এমন সম্পত্তি তৈরি করি যা একইসাথে নিরবধি এবং ভবিষ্যতমুখী।",
    "about.mission": "আমাদের মিশন",
    "about.missionDesc": "অসাধারণ সম্পত্তি তৈরি করা যা জীবনকে উন্নত করে, সম্প্রদায় গড়ে তোলে এবং গুণমান ও উদ্ভাবনের স্থায়ী সাক্ষ্য হিসেবে দাঁড়ায়। আমরা সততা এবং পেশাদারিত্বের সর্বোচ্চ মান বজায় রেখে আমাদের ক্লায়েন্টদের ব্যতিক্রমী মূল্য প্রদান করতে প্রতিশ্রুতিবদ্ধ।",
    "about.projectsCompleted": "সম্পন্ন প্রকল্প",
    "about.happyClients": "সুখী ক্লায়েন্ট",
    "about.yearsExperience": "বছরের অভিজ্ঞতা",
    "about.awardsWon": "পুরস্কার জিতেছে",
    
    // Contact Page
    "contact.title": "যোগাযোগ করুন",
    "contact.subtitle": "আমাদের টিমের সাথে যোগাযোগ করুন। আপনার নিখুঁত সম্পত্তি খুঁজে পেতে আমরা এখানে আছি।",
    "contact.phone": "ফোন",
    "contact.phoneAvailable": "সোমবার-শুক্রবার, সকাল ৯টা-সন্ধ্যা ৬টা উপলব্ধ",
    "contact.phoneNumber": "+৮৮০ ১২৩৪-৫৬৭৮৯০",
    "contact.email": "ইমেইল",
    "contact.emailResponse": "আমরা ২৪ ঘন্টার মধ্যে জবাব দেব",
    "contact.emailAddress": "info@wellasset.com",
    "contact.office": "অফিস",
    "contact.officeVisit": "আমাদের প্রধান অফিসে আসুন",
    "contact.officeAddress": "১২৩ গুলশান এভিনিউ\nঢাকা ১২১২, বাংলাদেশ",
    "contact.formTitle": "আমাদের একটি বার্তা পাঠান",
    "contact.formDesc": "নিচের ফর্মটি পূরণ করুন এবং আমাদের টিম দ্রুত আপনার সাথে যোগাযোগ করবে। আপনি কোনো নির্দিষ্ট সম্পত্তি সম্পর্কে তথ্যের জন্য খুঁজছেন বা সাধারণ অনুসন্ধান আছে, আমরা সাহায্য করতে এখানে আছি।",
    "contact.fullName": "পুরো নাম",
    "contact.fullNamePlaceholder": "আপনার নাম",
    "contact.emailLabel": "ইমেইল ঠিকানা",
    "contact.emailPlaceholder": "example@email.com",
    "contact.phoneLabel": "ফোন নম্বর",
    "contact.phonePlaceholder": "+৮৮০ ১XXX-XXXXXX",
    "contact.messageLabel": "আপনার বার্তা",
    "contact.messagePlaceholder": "আমরা কীভাবে আপনাকে সাহায্য করতে পারি তা বলুন...",
    "contact.sendMessage": "বার্তা পাঠান",
    "contact.sending": "পাঠানো হচ্ছে...",
    "contact.visitOffice": "আমাদের অফিসে যান",
    "contact.mapAvailable": "ম্যাপ ইন্টিগ্রেশন উপলব্ধ",
    "contact.mapLocation": "১২৩ গুলশান এভিনিউ, ঢাকা ১২১২, বাংলাদেশ",
    "contact.officeHours": "অফিস সময়",
    "contact.mondayFriday": "সোমবার - শুক্রবার",
    "contact.mondayFridayTime": "সকাল ৯:০০ - সন্ধ্যা ৬:০০",
    "contact.saturday": "শনিবার",
    "contact.saturdayTime": "সকাল ১০:০০ - বিকাল ৪:০০",
    "contact.sunday": "রবিবার",
    "contact.sundayClosed": "বন্ধ",
    "contact.successTitle": "বার্তা সফলভাবে পাঠানো হয়েছে!",
    "contact.successDesc": "আমরা যত তাড়াতাড়ি সম্ভব আপনার সাথে যোগাযোগ করব।",
    "contact.errorTitle": "বার্তা পাঠাতে ত্রুটি",
    "contact.errorDesc": "পরে আবার চেষ্টা করুন।",
    
    // Footer
    "footer.tagline": "২০১০ সাল থেকে ব্যতিক্রমী জীবনযাত্রার স্থান এবং বিনিয়োগের সুযোগ তৈরি করছি।",
    "footer.quickLinks": "দ্রুত লিঙ্ক",
    "footer.home": "হোম",
    "footer.properties": "সম্পত্তি",
    "footer.about": "আমাদের সম্পর্কে",
    "footer.contact": "যোগাযোগ",
    "footer.contactInfo": "যোগাযোগের তথ্য",
    "footer.officeAddress": "১২৩ গুলশান এভিনিউ\nঢাকা ১২১২, বাংলাদেশ",
    "footer.phone": "+৮৮০ ১২৩৪-৫৬৭৮৯০",
    "footer.email": "info@wellasset.com",
    "footer.followUs": "আমাদের অনুসরণ করুন",
    "footer.copyright": "ওয়েল অ্যাসেট ডেভেলপমেন্ট কো., লিমিটেড। সর্বস্বত্ব সংরক্ষিত।",
    
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
