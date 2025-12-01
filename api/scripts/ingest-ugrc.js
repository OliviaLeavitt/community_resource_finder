/**
 * Ingest nearby UGRC data into Postgres.
 * This is a simple "fetch around a point" loader so you can demo with real data.
 *
 * Config via env:
 * - DATABASE_URL
 * - UGRC_API_KEY (required)
 * - UGRC_BASE_URL (default https://api.mapserv.utah.gov)
 * - INGEST_LAT / INGEST_LNG (center point, default Provo)
 * - INGEST_BUFFER_M (meters radius, default 20000)
 *
 * Run: node scripts/ingest-ugrc.js
 */

require('dotenv').config();
const { Pool } = require('pg');

const UGRC_BASE = (process.env.UGRC_BASE_URL || 'https://api.mapserv.utah.gov').replace(/\/$/, '');
const UGRC_KEY = process.env.UGRC_API_KEY;
const CENTER_LAT = Number(process.env.INGEST_LAT || 40.233);
const CENTER_LNG = Number(process.env.INGEST_LNG || -111.657);
const BUFFER_M = Number(process.env.INGEST_BUFFER_M || 2000);
const MAX_BUFFER = 2000; // UGRC search buffer limit in meters

if (!UGRC_KEY) {
  console.error('Missing UGRC_API_KEY in .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://crf:crfpass@localhost:5432/crf',
});

const UGRC_TABLES = [
  {
    table: 'health.licensed_health_care_facilities',
    fields: 'FACILITY_NAME,ADDRESS,CITY,TELEPHONE,LICENSE_TYPE,shape@',
    category: 'Health Facility',
    map: props => ({
      name: props.FACILITY_NAME,
      address: [props.ADDRESS, props.CITY].filter(Boolean).join(', '),
      city: props.CITY || null,
      phone: props.TELEPHONE || null,
      category: props.LICENSE_TYPE || 'Health Facility',
    }),
  },
  {
    table: 'society.public_libraries',
    fields: 'LIBRARY,ADDRESS,CITY,PHONE,shape@',
    category: 'Library',
    map: props => ({
      name: props.LIBRARY,
      address: [props.ADDRESS, props.CITY].filter(Boolean).join(', '),
      city: props.CITY || null,
      phone: props.PHONE || null,
      category: 'Library',
    }),
  },
  {
    table: 'recreation.parks_local',
    fields: 'NAME,TYPE,CITY,shape@',
    category: 'Park',
    map: props => ({
      name: props.NAME,
      address: props.CITY || '',
      city: props.CITY || null,
      category: props.TYPE || 'Park',
    }),
  },
];

function encodeGeometry(lat, lng) {
  return encodeURIComponent(`point:{"x":${lng},"y":${lat},"spatialReference":{"wkid":4326}}`);
}

async function fetchUgrc(tableCfg) {
  const geometry = encodeGeometry(CENTER_LAT, CENTER_LNG);
  const buffer = Math.min(BUFFER_M, MAX_BUFFER);
  const url = `${UGRC_BASE}/api/v1/search/${tableCfg.table}/${tableCfg.fields}?geometry=${geometry}&buffer=${buffer}&format=geojson&apikey=${UGRC_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`UGRC fetch failed ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  if (data.status && data.status !== 200) {
    throw new Error(`UGRC responded with status ${data.status}: ${data.message || ''}`);
  }
  return (data.features || []).map(f => {
    const props = f.properties || {};
    const geom = f.geometry;
    if (!geom || geom.type !== 'Point' || !Array.isArray(geom.coordinates)) return null;
    const [lng, lat] = geom.coordinates;
    const mapped = tableCfg.map(props);
    return {
      ...mapped,
      lat,
      lng,
    };
  }).filter(Boolean);
}

async function findResourceId(client, name, address) {
  const { rows } = await client.query(
    `
    SELECT r.id
    FROM resources r
    LEFT JOIN locations l ON l.resource_id = r.id
    WHERE r.name = $1 AND COALESCE(l.address, '') = COALESCE($2, '')
    LIMIT 1;
    `,
    [name, address || '']
  );
  return rows[0]?.id || null;
}

async function upsertOne(client, item, category) {
  const resourceId =
    (await findResourceId(client, item.name, item.address)) ||
    (await client
      .query(
        `
        INSERT INTO resources (organization_id, name, description, category, eligibility_text)
        VALUES (NULL, $1, NULL, $2, NULL)
        RETURNING id;
        `,
        [item.name, category]
      )
      .then(r => r.rows[0].id));

  await client.query(
    `
    UPDATE resources
    SET category = COALESCE($2, category)
    WHERE id = $1;
    `,
    [resourceId, category]
  );

  const pointExpr = item.lat && item.lng
    ? `ST_SetSRID(ST_MakePoint(${Number(item.lng)}, ${Number(item.lat)}), 4326)::geography`
    : null;

  const existingLoc = await client.query(
    'SELECT id FROM locations WHERE resource_id = $1 LIMIT 1',
    [resourceId]
  );

  if (existingLoc.rows[0]) {
    await client.query(
      `
      UPDATE locations
      SET address = $1, city = $2, state = $3, zip = $4,
          point = ${pointExpr ? pointExpr : 'point'}
      WHERE resource_id = $5;
      `,
      [item.address || null, item.city || null, item.state || null, item.zip || null, resourceId]
    );
  } else {
    await client.query(
      `
      INSERT INTO locations (resource_id, address, city, state, zip, point)
      VALUES ($1, $2, $3, $4, $5, ${pointExpr ? pointExpr : 'NULL'});
      `,
      [resourceId, item.address || null, item.city || null, item.state || null, item.zip || null]
    );
  }
}

async function main() {
  console.log(`Fetching UGRC data around lat=${CENTER_LAT}, lng=${CENTER_LNG}, buffer=${BUFFER_M}m`);
  const client = await pool.connect();
  try {
    for (const cfg of UGRC_TABLES) {
      console.log(`- ${cfg.table} ...`);
      const rows = await fetchUgrc(cfg);
      console.log(`  fetched ${rows.length} features`);
      for (const item of rows) {
        await upsertOne(client, item, cfg.category);
      }
    }
    console.log('Done.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
