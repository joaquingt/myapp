import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import * as fs from 'fs';

const dbDir = path.join(__dirname, '../../database');
const dbPath = path.join(dbDir, 'fieldtech.db');

export interface Database {
  get: (sql: string, params?: any[]) => Promise<any>;
  all: (sql: string, params?: any[]) => Promise<any[]>;
  run: (sql: string, params?: any[]) => Promise<sqlite3.RunResult>;
  close: () => Promise<void>;
}

export function createDatabase(): Database {
  const db = new sqlite3.Database(dbPath);

  return {
    get: (sql: string, params: any[] = []) => {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err: Error | null, row: any) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    },

    all: (sql: string, params: any[] = []) => {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err: Error | null, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    },

    run: (sql: string, params: any[] = []) => {
      return new Promise<sqlite3.RunResult>((resolve, reject) => {
        db.run(sql, params, function(this: sqlite3.RunResult, err: Error | null) {
          if (err) reject(err);
          else resolve(this);
        });
      });
    },

    close: () => {
      return new Promise<void>((resolve, reject) => {
        db.close((err: Error | null) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  };
}

// Singleton database instance
let dbInstance: Database | null = null;

export function getDatabase(): Database {
  if (!dbInstance) {
    dbInstance = createDatabase();
  }
  return dbInstance;
}