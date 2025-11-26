const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname, '../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'fieldtech.db');

const migrations = [
  `
  -- Migration 001: Create technicians table
  CREATE TABLE IF NOT EXISTS technicians (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    photo_url TEXT,
    role TEXT DEFAULT 'technician',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  `,
  
  `
  -- Migration 002: Create tickets table
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_number TEXT UNIQUE NOT NULL,
    technician_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_phone TEXT,
    job_location TEXT NOT NULL,
    work_to_do TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status TEXT DEFAULT 'Assigned' CHECK(status IN ('Assigned', 'In Progress', 'Completed', 'Signed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (technician_id) REFERENCES technicians (id) ON DELETE CASCADE
  );
  `,
  
  `
  -- Migration 003: Create ticket_work_logs table
  CREATE TABLE IF NOT EXISTS ticket_work_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    work_description TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE
  );
  `,
  
  `
  -- Migration 004: Create ticket_media table
  CREATE TABLE IF NOT EXISTS ticket_media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    media_type TEXT NOT NULL CHECK(media_type IN ('photo', 'video')),
    file_url TEXT NOT NULL,
    file_path TEXT NOT NULL,
    original_name TEXT,
    file_size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE
  );
  `,
  
  `
  -- Migration 005: Create ticket_signatures table (completion signature)
  CREATE TABLE IF NOT EXISTS ticket_signatures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER UNIQUE NOT NULL,
    signed_by_name TEXT NOT NULL,
    signature_image TEXT NOT NULL,
    signed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE
  );
  `,
  
  `
  -- Migration 005b: Create ticket_start_signatures table (start signature)
  CREATE TABLE IF NOT EXISTS ticket_start_signatures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER UNIQUE NOT NULL,
    signed_by_name TEXT NOT NULL,
    signature_image TEXT NOT NULL,
    signed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE
  );
  `,
  
  `
  -- Migration 006: Create indexes for performance
  CREATE INDEX IF NOT EXISTS idx_tickets_technician_id ON tickets(technician_id);
  CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
  CREATE INDEX IF NOT EXISTS idx_tickets_scheduled_date ON tickets(scheduled_date);
  CREATE INDEX IF NOT EXISTS idx_ticket_work_logs_ticket_id ON ticket_work_logs(ticket_id);
  CREATE INDEX IF NOT EXISTS idx_ticket_media_ticket_id ON ticket_media(ticket_id);
  CREATE INDEX IF NOT EXISTS idx_ticket_signatures_ticket_id ON ticket_signatures(ticket_id);
  CREATE INDEX IF NOT EXISTS idx_ticket_start_signatures_ticket_id ON ticket_start_signatures(ticket_id);
  `
];

function runMigrations() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database.');
    });

    // Run migrations sequentially
    let migrationIndex = 0;
    
    function runNextMigration() {
      if (migrationIndex >= migrations.length) {
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
            reject(err);
          } else {
            console.log('Database migrations completed successfully.');
            resolve(true);
          }
        });
        return;
      }

      const migration = migrations[migrationIndex];
      console.log(`Running migration ${migrationIndex + 1}/${migrations.length}...`);
      
      db.exec(migration, (err) => {
        if (err) {
          console.error(`Error in migration ${migrationIndex + 1}:`, err.message);
          reject(err);
          return;
        }
        migrationIndex++;
        runNextMigration();
      });
    }

    runNextMigration();
  });
}

// Export for programmatic use
module.exports = { runMigrations };

// Run migrations if called directly
if (require.main === module) {
  runMigrations().catch(console.error);
}