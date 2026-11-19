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
    const connect = () => new MongoClient(uri, { serverSelectionTimeoutMS: 8000, maxPoolSize: 10 }).connect();
    globalForMongo._mongoClientPromise = connect()
      .catch(async (err) => {
        // Some Windows / ISP DNS servers refuse the SRV lookup used by "mongodb+srv://"
        // (querySrv ECONNREFUSED). Retry once using public DNS resolvers.
        if (!isSrvDnsError(err)) throw err;
        const dns = await import("node:dns");
        dns.setServers(["1.1.1.1", "8.8.8.8", ...dns.getServers()]);
        console.warn("[mongodb] SRV DNS lookup failed — retrying with public DNS resolvers");
        return connect();
      })
      .catch((err) => {
        // allow a retry on the next call instead of caching the failure forever
        globalForMongo._mongoClientPromise = undefined;
        throw err;
      });
  }
  return globalForMongo._mongoClientPromise;
}

function isSrvDnsError(err: unknown): boolean {
  const e = err as { syscall?: string; code?: string; message?: string };
  return e?.syscall === "querySrv" || /querySrv|ENOTFOUND _mongodb/.test(String(e?.message ?? ""));
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
  pages: "pages",
} as const;
