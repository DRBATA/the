import Dexie, { Table } from 'dexie';

// Basic shape for storing meta key/value pairs
export interface MetaRecord {
  key: string;
  value: string;
}

// OPTIONAL: profile interface matching Supabase `profiles` (kept minimal for now)
export interface CachedProfile {
  id: string;
  email: string; // still cached separately, but not stored in profiles table
  username?: string | null;
  water_subscription_status?: string | null;
  // membership_status removed from schema
  water_bottle_saved: number;
  medical_exemption?: boolean | null;
  confirmed_address?: string | null;
  whatsapp_number?: string | null;
  created_at?: string | null; // ISO timestamp
  stripe_customer_id?: string | null;
}

class WaterBarDB extends Dexie {
  // Tables
  meta!: Table<MetaRecord, string>; // key is PK
  profiles!: Table<CachedProfile, string>; // id is PK

  constructor() {
    super("WaterBarDB");
    this.version(1).stores({
      meta: "key",
      profiles: "id",
    });
  }
}

export const db = new WaterBarDB();
