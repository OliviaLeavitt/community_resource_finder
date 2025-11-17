// api/index.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://crf:crfpass@localhost:5432/crf',
});

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

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
