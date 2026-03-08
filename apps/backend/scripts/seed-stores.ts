/**
 * Seeds the stores table with default locations.
 * Run from apps/backend: npm run seed
 * Loads DATABASE_URL from .env (or set it in the environment).
 * Create the DB first: createdb pocketdiscount
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Store } from '../src/stores/store.entity';
import { STORE_LOCATIONS } from '../src/stores/store-data';

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('Set DATABASE_URL to seed stores.');
    process.exit(1);
  }

  const ds = new DataSource({
    type: 'postgres',
    url,
    synchronize: true,
    entities: [Store],
  });

  try {
    await ds.initialize();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      console.error('Cannot connect to PostgreSQL. Is it running?');
      console.error('  macOS (Homebrew): brew services start postgresql@14');
      console.error('  Or: pg_ctl -D /usr/local/var/postgres start');
      process.exit(1);
    }
    throw err;
  }

  const repo = ds.getRepository(Store);

  const existing = await repo.count();
  if (existing > 0) {
    console.log(`Stores table already has ${existing} rows. Skipping seed.`);
    await ds.destroy();
    return;
  }

  for (const s of STORE_LOCATIONS) {
    await repo.save(
      repo.create({
        id: s.id,
        retailer: s.retailer,
        name: s.name,
        address: s.address,
        city: s.city,
        lat: s.lat,
        lng: s.lng,
        color: s.color,
        openingHours: s.openingHours ?? null,
      }),
    );
  }
  console.log(`Seeded ${STORE_LOCATIONS.length} stores.`);
  await ds.destroy();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
