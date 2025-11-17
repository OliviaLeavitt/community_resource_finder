
-- Organizations offering services
CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  website TEXT,
  phone TEXT
);

-- Individual services/programs
CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  organization_id INT REFERENCES organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  eligibility_text TEXT
);

-- Addresses and geo point
-- Use PostGIS geography for spherical distance calcs
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  resource_id INT REFERENCES resources(id) ON DELETE CASCADE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  point GEOGRAPHY(POINT, 4326)
);

-- Open hours (0=Sunday ... 6=Saturday)
CREATE TABLE IF NOT EXISTS open_hours (
  id SERIAL PRIMARY KEY,
  resource_id INT REFERENCES resources(id) ON DELETE CASCADE,
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  opens_at TIME,
  closes_at TIME
);

-- AI embeddings for semantic search (one per resource to start)
CREATE TABLE IF NOT EXISTS embeddings (
  resource_id INT PRIMARY KEY REFERENCES resources(id) ON DELETE CASCADE,
  vec VECTOR(768)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS resources_category_idx ON resources (category);
CREATE INDEX IF NOT EXISTS locations_point_gix ON locations USING GIST ((point));
