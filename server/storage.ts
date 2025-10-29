import { 
  type User, 
  type InsertUser,
  type Property,
  type InsertProperty,
  type Agent,
  type InsertAgent,
  type Inquiry,
  type InsertInquiry
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllProperties(): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: InsertProperty): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;
  
  getAllAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, agent: InsertAgent): Promise<Agent | undefined>;
  deleteAgent(id: string): Promise<boolean>;
  
  getAllInquiries(): Promise<Inquiry[]>;
  getInquiry(id: string): Promise<Inquiry | undefined>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  updateInquiryStatus(id: string, status: string): Promise<Inquiry | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private properties: Map<string, Property>;
  private agents: Map<string, Agent>;
  private inquiries: Map<string, Inquiry>;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.agents = new Map();
    this.inquiries = new Map();
    this.seedData();
  }

  private seedData() {
    const sampleProperties: Property[] = [
      {
        id: "1",
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
        agentId: undefined,
        createdAt: new Date("2025-01-15"),
      },
      {
        id: "2",
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
        agentId: undefined,
        createdAt: new Date("2025-01-18"),
      },
      {
        id: "3",
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
        agentId: undefined,
        createdAt: new Date("2025-01-20"),
      },
      {
        id: "4",
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
        agentId: undefined,
        createdAt: new Date("2025-01-22"),
      },
      {
        id: "5",
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
        agentId: undefined,
        createdAt: new Date("2025-01-25"),
      },
      {
        id: "6",
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
        agentId: undefined,
        createdAt: new Date("2025-01-28"),
      },
    ];

    sampleProperties.forEach(prop => {
      this.properties.set(prop.id, prop);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllProperties(): Promise<Property[]> {
    return Array.from(this.properties.values()).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async getProperty(id: string): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = randomUUID();
    const property: Property = {
      ...insertProperty,
      id,
      createdAt: new Date(),
    };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: string, insertProperty: InsertProperty): Promise<Property | undefined> {
    const existing = this.properties.get(id);
    if (!existing) return undefined;
    
    const updated: Property = {
      ...existing,
      ...insertProperty,
      id,
    };
    this.properties.set(id, updated);
    return updated;
  }

  async deleteProperty(id: string): Promise<boolean> {
    return this.properties.delete(id);
  }

  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = randomUUID();
    const agent: Agent = { ...insertAgent, id };
    this.agents.set(id, agent);
    return agent;
  }

  async updateAgent(id: string, insertAgent: InsertAgent): Promise<Agent | undefined> {
    const existing = this.agents.get(id);
    if (!existing) return undefined;
    
    const updated: Agent = {
      ...existing,
      ...insertAgent,
      id,
    };
    this.agents.set(id, updated);
    return updated;
  }

  async deleteAgent(id: string): Promise<boolean> {
    return this.agents.delete(id);
  }

  async getAllInquiries(): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values()).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async getInquiry(id: string): Promise<Inquiry | undefined> {
    return this.inquiries.get(id);
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const id = randomUUID();
    const inquiry: Inquiry = {
      ...insertInquiry,
      id,
      status: "unread",
      createdAt: new Date(),
    };
    this.inquiries.set(id, inquiry);
    return inquiry;
  }

  async updateInquiryStatus(id: string, status: string): Promise<Inquiry | undefined> {
    const existing = this.inquiries.get(id);
    if (!existing) return undefined;
    
    const updated: Inquiry = {
      ...existing,
      status,
    };
    this.inquiries.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
