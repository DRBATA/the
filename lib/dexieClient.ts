import Dexie, { Table } from 'dexie';

// Basic shape for storing meta key/value pairs
export interface MetaRecord {
  key: string;
  value: string;
}

// OPTIONAL: profile interface matching Supabase `profiles` (kept minimal for now)
export interface CachedProfile {
  id: string;
  email: string;
  water_bottle_saved: number;
  water_subscription_status?: string;
  membership_status?: string;
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
