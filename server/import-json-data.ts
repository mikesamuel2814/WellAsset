// Load environment variables - works in both dev and production
if (process.env.NODE_ENV !== "production") {
  // Development: use dotenv
  try {
    const { config } = await import("dotenv");
    config();
  } catch {
    // dotenv not available - use system env vars
  }
}
// Production: environment variables come from systemd/.env.production

import { db } from "./db";
import { users, properties, agents, inquiries, siteSettings, socialMedia } from "@shared/schema";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

// Get directory name for both dev (source) and production (compiled)
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");
// In production, compiled file is in dist/, need to go up to find server/wellasset_db_jsons
// In development, source file is in server/, so wellasset_db_jsons is in the same dir
const jsonDir = process.env.NODE_ENV === "production" 
  ? join(__dirname, "..", "server", "wellasset_db_jsons")  // dist/ -> server/wellasset_db_jsons
  : join(__dirname, "wellasset_db_jsons");                 // server/ -> server/wellasset_db_jsons

// Helper function to convert snake_case to camelCase
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Helper function to convert object keys from snake_case to camelCase
function convertKeys(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(convertKeys);
  }
  if (typeof obj === "object") {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip the 'id' field since we'll let the DB auto-generate IDs
      if (key === "id") {
        continue;
      }
      const camelKey = toCamelCase(key);
      converted[camelKey] = convertKeys(value);
    }
    return converted;
  }
  return obj;
}

async function importUsers() {
  console.log("Importing users...");
  const data = JSON.parse(readFileSync(join(jsonDir, "users.json"), "utf-8"));
  
  for (const user of data) {
    try {
      // Skip id, convert snake_case to camelCase
      const { id, ...userData } = user;
      const converted = convertKeys(userData);
      await db.insert(users).values(converted).onConflictDoUpdate({
        target: users.email,
        set: converted,
      });
      console.log(`  ✓ User: ${user.email}`);
    } catch (error: any) {
      console.error(`  ✗ Error importing user ${user.email}:`, error.message);
    }
  }
}

async function importAgents() {
  console.log("Importing agents...");
  const data = JSON.parse(readFileSync(join(jsonDir, "agents.json"), "utf-8"));
  
  for (const agent of data) {
    try {
      const { id, ...agentData } = agent;
      const converted = convertKeys(agentData);
      await db.insert(agents).values(converted).onConflictDoUpdate({
        target: agents.email,
        set: converted,
      });
      console.log(`  ✓ Agent: ${agent.email || agent.name}`);
    } catch (error: any) {
      console.error(`  ✗ Error importing agent:`, error.message);
    }
  }
}

async function importProperties() {
  console.log("Importing properties...");
  const data = JSON.parse(readFileSync(join(jsonDir, "properties.json"), "utf-8"));
  
  for (const property of data) {
    try {
      const { id, agent_id, created_at, ...propertyData } = property;
      const converted = convertKeys(propertyData);
      
      // Handle agent_id - set to null for now since IDs will be different
      converted.agentId = null;
      
      // Convert price from string to string (drizzle handles decimal conversion)
      if (converted.price) {
        converted.price = String(converted.price);
      }
      
      // Convert latitude/longitude from string to string
      if (converted.latitude) {
        converted.latitude = String(converted.latitude);
      }
      if (converted.longitude) {
        converted.longitude = String(converted.longitude);
      }
      
      // Ensure arrays are properly set
      if (!converted.features || !Array.isArray(converted.features)) {
        converted.features = [];
      }
      if (!converted.images || !Array.isArray(converted.images)) {
        converted.images = [];
      }
      if (converted.videos && !Array.isArray(converted.videos)) {
        converted.videos = null;
      }
      
      await db.insert(properties).values(converted);
      console.log(`  ✓ Property: ${property.title}`);
    } catch (error: any) {
      console.error(`  ✗ Error importing property ${property.title}:`, error.message);
    }
  }
}

async function importInquiries() {
  console.log("Importing inquiries...");
  const data = JSON.parse(readFileSync(join(jsonDir, "inquiries.json"), "utf-8"));
  
  for (const inquiry of data) {
    try {
      const { id, property_id, created_at, ...inquiryData } = inquiry;
      const converted = convertKeys(inquiryData);
      
      // Set propertyId to null for now (can be linked later if needed)
      converted.propertyId = null;
      
      await db.insert(inquiries).values(converted);
      console.log(`  ✓ Inquiry: ${inquiry.email || inquiry.name || "Anonymous"}`);
    } catch (error: any) {
      console.error(`  ✗ Error importing inquiry:`, error.message);
    }
  }
}

async function importSiteSettings() {
  console.log("Importing site settings...");
  const data = JSON.parse(readFileSync(join(jsonDir, "site_settings.json"), "utf-8"));
  
  for (const setting of data) {
    try {
      const { id, updated_at, ...settingData } = setting;
      const converted = convertKeys(settingData);
      
      await db.insert(siteSettings).values(converted).onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: converted.value,
          valueBn: converted.valueBn,
          updatedAt: new Date(),
        },
      });
      console.log(`  ✓ Setting: ${setting.key}`);
    } catch (error: any) {
      console.error(`  ✗ Error importing setting ${setting.key}:`, error.message);
    }
  }
}

async function importSocialMedia() {
  console.log("Importing social media...");
  const data = JSON.parse(readFileSync(join(jsonDir, "social_media.json"), "utf-8"));
  
  for (const social of data) {
    try {
      const { id, ...socialData } = social;
      const converted = convertKeys(socialData);
      
      // Social media doesn't have a unique constraint, so just insert
      await db.insert(socialMedia).values(converted);
      console.log(`  ✓ Social Media: ${social.platform}`);
    } catch (error: any) {
      console.error(`  ✗ Error importing social media:`, error.message);
    }
  }
}

async function main() {
  try {
    console.log("Starting JSON data import...\n");
    
    await importUsers();
    console.log();
    
    await importAgents();
    console.log();
    
    await importProperties();
    console.log();
    
    await importInquiries();
    console.log();
    
    await importSiteSettings();
    console.log();
    
    await importSocialMedia();
    console.log();
    
    console.log("✅ Import completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Import failed:", error);
    process.exit(1);
  }
}

main();

