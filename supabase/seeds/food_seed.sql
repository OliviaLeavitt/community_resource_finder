/*
  Seed data for food-specific resources
  - Safe to run multiple times (uses ON CONFLICT DO NOTHING on natural keys)
  - Data source tag: manual_seed_food
*/

-- Idempotency helpers: ensure external_id is unique for conflict handling
CREATE UNIQUE INDEX IF NOT EXISTS organizations_external_id_idx ON organizations(external_id);
CREATE UNIQUE INDEX IF NOT EXISTS resources_external_id_idx ON resources(external_id);

-- Organizations
INSERT INTO organizations (name, description, website, phone, email, data_source, external_id)
VALUES
  ('Provo Food Bank', 'Emergency food boxes and pantry items for Utah County', 'https://provofoodbank.org', '801-555-1111', 'help@provofoodbank.org', 'manual_seed_food', 'provo_food_bank'),
  ('Wasatch Community Services', 'Community aid with groceries and vouchers', 'https://wasatchcs.org', '801-555-2222', NULL, 'manual_seed_food', 'wasatch_cs'),
  ('Downtown Mobile Meals', 'Hot meal distribution via mobile truck', 'https://downtownmobilemeals.org', '801-555-3333', NULL, 'manual_seed_food', 'dt_mobile_meals'),
  ('Faith Outreach Pantry', 'Faith-based pantry with weekly distribution', NULL, '801-555-4444', NULL, 'manual_seed_food', 'faith_outreach'),
  ('South Provo Community Pantry', 'Neighborhood pantry with weekly distribution and produce boxes', 'https://southprovopantry.org', '801-555-5555', NULL, 'manual_seed_food', 'south_provo_pantry'),
  ('Provo Community Kitchen', 'Community kitchen offering daily hot lunches and take-home dinners', 'https://provocommunitykitchen.org', '801-555-6666', 'info@provocommunitykitchen.org', 'manual_seed_food', 'provo_kitchen')
ON CONFLICT (external_id) DO NOTHING;

-- Resources (food-only)
WITH org_lookup AS (
  SELECT external_id, id FROM organizations WHERE data_source = 'manual_seed_food'
)
INSERT INTO resources (organization_id, name, description, category, subcategory, phone, email, website, data_source, external_id, is_active, last_verified)
VALUES
  ((SELECT id FROM org_lookup WHERE external_id = 'provo_food_bank'),
    'Weekly Pantry Pickup',
    'Walk-in pantry; ID requested. Fresh produce, canned goods, diapers when available.',
    'food', 'pantry', '801-555-1111', 'help@provofoodbank.org', 'https://provofoodbank.org/pantry',
    'manual_seed_food', 'provo_food_bank_weekly_pantry', true, now()),
  ((SELECT id FROM org_lookup WHERE external_id = 'wasatch_cs'),
    'Grocery Vouchers',
    'Food vouchers for low-income households; residency in Utah County required.',
    'food', 'vouchers', '801-555-2222', NULL, 'https://wasatchcs.org/food',
    'manual_seed_food', 'wasatch_cs_vouchers', true, now()),
  ((SELECT id FROM org_lookup WHERE external_id = 'dt_mobile_meals'),
    'Mobile Hot Meals',
    'Hot dinners served from a mobile truck; first-come, first-served. Check schedule.',
    'food', 'hot_meals', '801-555-3333', NULL, 'https://downtownmobilemeals.org/schedule',
    'manual_seed_food', 'dt_mobile_hot_meals', true, now()),
  ((SELECT id FROM org_lookup WHERE external_id = 'faith_outreach'),
    'Wednesday Pantry',
    'Shelf-stable groceries and some fresh items; brief intake form on arrival.',
    'food', 'pantry', '801-555-4444', NULL, NULL,
    'manual_seed_food', 'faith_outreach_wed', true, now()),
  ((SELECT id FROM org_lookup WHERE external_id = 'south_provo_pantry'),
    'South Provo Pantry Pickup',
    'Weekly groceries plus fresh produce; appointments available.',
    'food', 'pantry', '801-555-5555', NULL, 'https://southprovopantry.org/schedule',
    'manual_seed_food', 'south_provo_pantry_pickup', true, now()),
  ((SELECT id FROM org_lookup WHERE external_id = 'provo_kitchen'),
    'Community Kitchen Lunch',
    'Hot lunches served dine-in; take-home dinners on Fridays.',
    'food', 'hot_meals', '801-555-6666', 'info@provocommunitykitchen.org', 'https://provocommunitykitchen.org/menu',
    'manual_seed_food', 'provo_kitchen_lunch', true, now())
ON CONFLICT (external_id) DO NOTHING;

-- Locations
WITH res_lookup AS (
  SELECT external_id, id FROM resources WHERE data_source = 'manual_seed_food'
)
INSERT INTO locations (resource_id, address_line1, city, state, zip_code, latitude, longitude)
VALUES
  ((SELECT id FROM res_lookup WHERE external_id = 'provo_food_bank_weekly_pantry'),
    '123 Center St', 'Provo', 'UT', '84601', 40.2338, -111.6585),
  ((SELECT id FROM res_lookup WHERE external_id = 'wasatch_cs_vouchers'),
    '45 Main St', 'Orem', 'UT', '84057', 40.2970, -111.6946),
  ((SELECT id FROM res_lookup WHERE external_id = 'dt_mobile_hot_meals'),
    '200 W 100 S', 'Salt Lake City', 'UT', '84101', 40.7638, -111.9000),
  ((SELECT id FROM res_lookup WHERE external_id = 'faith_outreach_wed'),
    '780 N 800 E', 'Provo', 'UT', '84606', 40.2464, -111.6418),
  ((SELECT id FROM res_lookup WHERE external_id = 'south_provo_pantry_pickup'),
    '950 S 200 E', 'Provo', 'UT', '84606', 40.2275, -111.6520),
  ((SELECT id FROM res_lookup WHERE external_id = 'provo_kitchen_lunch'),
    '420 W Center St', 'Provo', 'UT', '84601', 40.2345, -111.6667)
ON CONFLICT DO NOTHING;

-- Eligibility rules
INSERT INTO eligibility_rules (resource_id, rule_type, description)
SELECT rl.id, rule.rule_type, rule.description
FROM resources rl
JOIN (VALUES
  ('provo_food_bank_weekly_pantry', 'income', 'Household income under 200% FPL'),
  ('provo_food_bank_weekly_pantry', 'residency', 'Utah County residents; ID requested'),
  ('wasatch_cs_vouchers', 'residency', 'Utah County address required'),
  ('dt_mobile_hot_meals', 'none', 'Open to all; no documentation required'),
  ('faith_outreach_wed', 'residency', 'Utah Valley residents preferred'),
  ('south_provo_pantry_pickup', 'residency', 'Provo residents prioritized; others welcome if capacity allows'),
  ('south_provo_pantry_pickup', 'income', 'Income under 250% FPL'),
  ('provo_kitchen_lunch', 'none', 'Open to all; no documentation required')
) AS rule(external_id, rule_type, description)
ON rule.external_id = rl.external_id
ON CONFLICT DO NOTHING;

-- Open hours
INSERT INTO open_hours (resource_id, day_of_week, opens_at, closes_at, notes)
SELECT rl.id, oh.day_of_week, oh.opens_at, oh.closes_at, oh.notes
FROM resources rl
JOIN (VALUES
  ('provo_food_bank_weekly_pantry', 2, '10:00', '16:00', 'Closed holidays'),
  ('wasatch_cs_vouchers', 4, '12:00', '18:00', 'Bring photo ID'),
  ('dt_mobile_hot_meals', 5, '17:00', '19:00', 'Arrive early; truck moves locations'),
  ('faith_outreach_wed', 3, '14:00', '17:00', 'Limited fresh produce'),
  ('south_provo_pantry_pickup', 1, '15:00', '18:00', 'Appointments available; walk-ins accepted'),
  ('provo_kitchen_lunch', 1, '11:30', '13:30', 'Take-home dinners Fridays at 17:00'),
  ('provo_kitchen_lunch', 5, '11:30', '13:30', 'Friday service includes take-home dinners')
) AS oh(external_id, day_of_week, opens_at, closes_at, notes)
ON oh.external_id = rl.external_id
ON CONFLICT DO NOTHING;
