require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://crf:crfpass@localhost:5432/crf',
});

const UGRC_BASE = (process.env.UGRC_BASE_URL || 'https://api.mapserv.utah.gov').replace(/\/$/, '');
const UGRC_KEY = process.env.UGRC_API_KEY;

// UGRC tables we can surface quickly (health facilities, libraries, parks)
const UGRC_TABLES = [
  {
    table: 'health.licensed_health_care_facilities',
    fields: 'FACILITY_NAME,ADDRESS,CITY,TELEPHONE,LICENSE_TYPE,shape@',
    map: props => ({
      name: props.FACILITY_NAME,
      address: [props.ADDRESS, props.CITY].filter(Boolean).join(', '),
      phone: props.TELEPHONE,
      category: props.LICENSE_TYPE || 'Health Facility',
    }),
  },
  {
    table: 'society.public_libraries',
    fields: 'LIBRARY,ADDRESS,CITY,PHONE,shape@',
    map: props => ({
      name: props.LIBRARY,
      address: [props.ADDRESS, props.CITY].filter(Boolean).join(', '),
      phone: props.PHONE,
      category: 'Library',
    }),
  },
  {
    table: 'recreation.parks_local',
    fields: 'NAME,TYPE,CITY,shape@',
    map: props => ({
      name: props.NAME,
      address: props.CITY || '',
      category: props.TYPE || 'Park',
    }),
  },
];

function haversineMiles(lat1, lon1, lat2, lon2) {
  const toRad = d => (d * Math.PI) / 180;
  const R = 6371e3; // meters
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dPhi = toRad(lat2 - lat1);
  const dLambda = toRad(lon2 - lon1);
  const a =
    Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c) / 1609.34;
}

async function searchUgrcTable(tableCfg, lat, lng, bufferMeters) {
  const safeBuffer = Math.min(bufferMeters, 2000); // UGRC docs warn about larger buffers
  const geometry = encodeURIComponent(`point:{"x":${lng},"y":${lat},"spatialReference":{"wkid":4326}}`);
  const url = `${UGRC_BASE}/api/v1/search/${tableCfg.table}/${tableCfg.fields}?geometry=${geometry}&buffer=${safeBuffer}&format=geojson&apikey=${UGRC_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`UGRC request failed ${res.status}`);
  }
  const data = await res.json();
  const features = data.features || [];
  return features
    .map(f => {
      const props = f.properties || {};
      const geom = f.geometry;
      if (!geom || geom.type !== 'Point' || !Array.isArray(geom.coordinates)) return null;
      const [featureLng, featureLat] = geom.coordinates;
      const base = tableCfg.map(props);
      const distance = haversineMiles(lat, lng, featureLat, featureLng);
      return {
        ...base,
        lat: featureLat,
        lng: featureLng,
        distance: Math.round(distance * 10) / 10,
        source: tableCfg.table,
      };
    })
    .filter(Boolean);
}

// GET /resources?query=food&lat=40.233&lng=-111.657&radius=25
app.get('/resources', async (req, res) => {
  const q = (req.query.query || '').trim();
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusMiles = Number(req.query.radius) || 25;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  // With coordinates: apply radius + distance sort
  const sqlWithGeo = `
    SELECT
      r.id, r.name, r.description, r.category,
      o.phone,
      CONCAT(l.address, ', ', l.city) AS address,
      ST_Distance(
        l.point,
        ST_SetSRID(ST_MakePoint($2::double precision, $3::double precision), 4326)::geography
      ) / 1609.34 AS miles
    FROM resources r
    LEFT JOIN organizations o ON o.id = r.organization_id
    LEFT JOIN locations     l ON l.resource_id = r.id
    WHERE ($1 = '' OR r.name ILIKE '%'||$1||'%' OR r.description ILIKE '%'||$1||'%')
      AND ST_DWithin(
        l.point,
        ST_SetSRID(ST_MakePoint($2::double precision, $3::double precision), 4326)::geography,
        $4::double precision * 1609.34
      )
    ORDER BY miles NULLS LAST, r.id
    LIMIT 50;
  `;

  // Without coordinates: no radius, no distance calc
  const sqlNoGeo = `
    SELECT
      r.id, r.name, r.description, r.category,
      o.phone,
      CONCAT(l.address, ', ', l.city) AS address,
      NULL::double precision AS miles
    FROM resources r
    LEFT JOIN organizations o ON o.id = r.organization_id
    LEFT JOIN locations     l ON l.resource_id = r.id
    WHERE ($1 = '' OR r.name ILIKE '%'||$1||'%' OR r.description ILIKE '%'||$1||'%')
    ORDER BY r.id
    LIMIT 50;
  `;

  try {
    const { rows } = hasCoords
      ? await pool.query(sqlWithGeo, [q, lng, lat, radiusMiles])
      : await pool.query(sqlNoGeo,  [q]);

    res.json(rows.map(x => ({
      id: x.id,
      name: x.name,
      description: x.description,
      category: x.category,
      phone: x.phone,
      address: x.address,
      distance: x.miles == null ? null : Math.round(x.miles * 10) / 10,
      directionsUrl: x.address
        ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(x.address)}`
        : null,
    })));
  } catch (e) {
    console.error('DB error:', e.message);
    res.status(500).json({ error: 'query_failed' });
  }
});

// GET /ugrc/resources?lat=40.24&lng=-111.65&buffer=2000
// Returns combined UGRC layers (health facilities, libraries, parks) near a point.
app.get('/ugrc/resources', async (req, res) => {
  if (!UGRC_KEY) return res.status(500).json({ error: 'missing_ugrc_key' });
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const buffer = Number(req.query.buffer) || 2000; // meters
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: 'invalid_coords' });
  }

  try {
    const results = [];
    for (const cfg of UGRC_TABLES) {
      const list = await searchUgrcTable(cfg, lat, lng, buffer);
      results.push(...list);
    }
    results.sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9));
    res.json(results);
  } catch (e) {
    console.error('UGRC error:', e.message);
    res.status(500).json({ error: 'ugrc_query_failed' });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
