import "server-only";
import { MongoClient, type Db } from "mongodb";

const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

export function isDbConfigured(): boolean {
  const uri = process.env.MONGODB_URI;
  return Boolean(uri && !uri.includes("<db_password>"));
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri || !isDbConfigured()) {
    throw new Error(
      "MONGODB_URI is not configured. Set it (with your real password) in .env.local",
    );
  }
  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 10,
    });
    globalForMongo._mongoClientPromise = client.connect().catch((err) => {
      // allow a retry on the next call instead of caching the failure forever
      globalForMongo._mongoClientPromise = undefined;
      throw err;
    });
  }
  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB || "darjeeling_hair_company");
}

export const COLLECTIONS = {
  hero: "hero_slides",
  services: "services",
  gallery: "gallery",
  settings: "settings",
  bookings: "bookings",
  products: "products",
  productCategories: "product_categories",
  serviceCategories: "service_categories",
} as const;
