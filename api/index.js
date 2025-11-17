const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://crf:crfpass@localhost:5432/crf'
});

// Simple GET /resources endpoint
app.get('/resources', async (req, res) => {
  const { query = '', lat, lng } = req.query;

  const sql = `
    SELECT r.id, r.name, r.description, r.category,
           o.phone,
           CONCAT(l.address, ', ', l.city) AS address,
           COALESCE(
             ST_DistanceSphere(l.point, ST_MakePoint($2, $3)) / 1609.34,
             NULL
           ) AS miles
    FROM resources r
    LEFT JOIN organizations o ON o.id = r.organization_id
    LEFT JOIN locations l ON l.resource_id = r.id
    WHERE ($1 = '' OR (r.name ILIKE '%'||$1||'%' OR r.description ILIKE '%'||$1||'%'))
    ORDER BY miles NULLS LAST
    LIMIT 25;
  `;

  try {
    const { rows } = await pool.query(sql, [query, Number(lng), Number(lat)]);
    res.json(rows.map(x => ({
      id: x.id,
      name: x.name,
      description: x.description,
      category: x.category,
      phone: x.phone,
      address: x.address,
      distance: x.miles ? Math.round(x.miles * 10) / 10 : null,
      directionsUrl: x.address ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(x.address)}` : null
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'query_failed' });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
