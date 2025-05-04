import Dexie, { Table } from 'dexie';

export interface MetaRecord {
  id?: number;
  email: string;
  lastMagicLinkSent?: string; // ISO string or timestamp
}

class MagicLinkDexie extends Dexie {
  meta!: Table<MetaRecord, number>;

  constructor() {
    super('MagicLinkDB');
    this.version(1).stores({
      meta: '++id, email, lastMagicLinkSent',
    });
  }
}

export const db = new MagicLinkDexie();
