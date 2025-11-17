
INSERT INTO organizations (name, website, phone)
VALUES
  ('Provo Community Pantry','https://example.org','(801) 555-1234'),
  ('Wasatch Shelter','https://shelter.example','(801) 555-9876')
ON CONFLICT DO NOTHING;

INSERT INTO resources (organization_id, name, description, category, eligibility_text)
VALUES
  (1, 'Provo Food Pantry', 'Free groceries for local residents', 'food', 'Bring ID; first-come'),
  (2, 'Wasatch Overnight Shelter', 'Emergency beds and warming center', 'shelter', 'Adults; limited capacity')
ON CONFLICT DO NOTHING;

INSERT INTO locations (resource_id, address, city, state, zip, point)
VALUES
  (1, '123 Center St', 'Provo', 'UT', '84601', ST_GeogFromText('SRID=4326;POINT(-111.657 40.233)')),
  (2, '45 Canyon Rd', 'Provo', 'UT', '84604', ST_GeogFromText('SRID=4326;POINT(-111.651 40.268)'))
ON CONFLICT DO NOTHING;

INSERT INTO open_hours (resource_id, day_of_week, opens_at, closes_at) VALUES
  (1, 2, '10:00', '14:00'),
  (1, 5, '10:00', '14:00'),
  (2, 0, '19:00', '07:00'),
  (2, 5, '19:00', '07:00');
