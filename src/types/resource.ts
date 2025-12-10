export interface ResourceWithDetails {
  id: string;
  name: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  organization: {
    name: string;
    phone: string | null;
    website: string | null;
  } | null;
  location: {
    address_line1: string | null;
    address_line2: string | null;
    city: string;
    state: string;
    zip_code: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
  eligibility: Array<{
    rule_type: string;
    description: string;
  }>;
  hours: Array<{
    day_of_week: number;
    opens_at: string | null;
    closes_at: string | null;
    notes: string | null;
  }>;
  distance?: number;
}
