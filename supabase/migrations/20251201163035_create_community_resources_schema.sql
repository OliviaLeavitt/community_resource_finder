/*
  # Community Resource Finder - Database Schema

  ## Overview
  Creates the complete database structure for the Community Resource Finder app,
  including organizations, resources, locations, eligibility rules, operating hours,
  and AI embeddings for semantic search.

  ## New Tables

  1. **organizations**
     - `id` (uuid, primary key)
     - `name` (text) - Organization name
     - `description` (text) - What the organization does
     - `website` (text) - Organization website
     - `phone` (text) - Contact phone
     - `email` (text) - Contact email
     - `data_source` (text) - Where this data came from
     - `external_id` (text) - ID from the source system
     - `last_updated` (timestamptz) - When data was last refreshed
     - `created_at` (timestamptz)

  2. **resources**
     - `id` (uuid, primary key)
     - `organization_id` (uuid, foreign key)
     - `name` (text) - Service name
     - `description` (text) - What this service provides
     - `category` (text) - Type of service (food, shelter, health, etc.)
     - `subcategory` (text) - More specific categorization
     - `phone` (text) - Direct contact for this service
     - `email` (text) - Service email
     - `website` (text) - Service-specific URL
     - `data_source` (text) - Source of this data
     - `external_id` (text) - ID from source system
     - `is_active` (boolean) - Whether resource is currently available
     - `last_verified` (timestamptz) - Last verification date
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  3. **locations**
     - `id` (uuid, primary key)
     - `resource_id` (uuid, foreign key)
     - `address_line1` (text)
     - `address_line2` (text)
     - `city` (text)
     - `state` (text)
     - `zip_code` (text)
     - `latitude` (decimal) - For geospatial search
     - `longitude` (decimal)
     - `created_at` (timestamptz)

  4. **eligibility_rules**
     - `id` (uuid, primary key)
     - `resource_id` (uuid, foreign key)
     - `rule_type` (text) - income, age, residency, etc.
     - `description` (text) - Human-readable eligibility requirement
     - `created_at` (timestamptz)

  5. **open_hours**
     - `id` (uuid, primary key)
     - `resource_id` (uuid, foreign key)
     - `day_of_week` (int) - 0=Sunday, 6=Saturday
     - `opens_at` (time) - Opening time
     - `closes_at` (time) - Closing time
     - `notes` (text) - Special notes (by appointment, etc.)
     - `created_at` (timestamptz)

  6. **embeddings**
     - `id` (uuid, primary key)
     - `resource_id` (uuid, foreign key)
     - `content` (text) - Text that was embedded
     - `embedding` (vector) - AI-generated vector for semantic search
     - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Allow public read access (resources are public information)
  - No write access for regular users (data comes from automated ingestion)

  ## Indexes
  - Full-text search indexes on names and descriptions
  - Geospatial index on location coordinates
  - Category indexes for filtering
  - Foreign key indexes for joins

  ## Important Notes
  1. Data is automatically ingested from public sources
  2. All tables support tracking data source and external IDs for updates
  3. Resources can be marked inactive without deletion
  4. Location data supports distance-based queries
  5. Embeddings table will support AI-powered semantic search
*/

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  website text,
  phone text,
  email text,
  data_source text NOT NULL,
  external_id text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  subcategory text,
  phone text,
  email text,
  website text,
  data_source text NOT NULL,
  external_id text,
  is_active boolean DEFAULT true,
  last_verified timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  address_line1 text,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS eligibility_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  rule_type text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS open_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  opens_at time,
  closes_at time,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  content text NOT NULL,
  embedding vector(384),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_resources_name ON resources USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_resources_description ON resources USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_is_active ON resources(is_active);
CREATE INDEX IF NOT EXISTS idx_locations_city ON locations(city);
CREATE INDEX IF NOT EXISTS idx_locations_coords ON locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_open_hours_day ON open_hours(day_of_week);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to organizations"
  ON organizations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access to resources"
  ON resources FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Public read access to locations"
  ON locations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access to eligibility rules"
  ON eligibility_rules FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access to open hours"
  ON open_hours FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access to embeddings"
  ON embeddings FOR SELECT
  TO anon, authenticated
  USING (true);