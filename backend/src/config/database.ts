import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create PostgreSQL pool for user profiles
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === 'false'
      ? false
      : { rejectUnauthorized: false },
});

async function initDb() {
  await pool.query(`
    create table if not exists users (
      id serial primary key,
      phone text unique not null,
      full_name text,
      age int,
      address text,
      avatar_url text,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    create or replace function set_updated_at()
    returns trigger as $$
    begin
      new.updated_at = now();
      return new;
    end;
    $$ language plpgsql;

    drop trigger if exists trg_users_updated on users;
    create trigger trg_users_updated
      before update on users
      for each row execute procedure set_updated_at();
  `);
  console.log('✅ PostgreSQL DB ready');
}

// Initialize database on startup
initDb().catch((e) => {
  console.error('❌ PostgreSQL DB init error:', e);
  process.exit(1);
});

export { pool };