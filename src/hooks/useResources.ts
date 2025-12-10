import { useState, useEffect } from 'react';
import { supabase, hasSupabase } from '../lib/supabase';
import type { ResourceWithDetails } from '../types/resource.ts';

const fallbackResources: ResourceWithDetails[] = [
  {
    id: 'provo_food_bank_weekly_pantry',
    name: 'Weekly Pantry Pickup',
    description: 'Walk-in pantry; ID requested. Fresh produce, canned goods, diapers when available.',
    category: 'food',
    subcategory: 'pantry',
    phone: '801-555-1111',
    email: 'help@provofoodbank.org',
    website: 'https://provofoodbank.org/pantry',
    organization: {
      name: 'Provo Food Bank',
      phone: '801-555-1111',
      website: 'https://provofoodbank.org'
    },
    location: {
      address_line1: '123 Center St',
      address_line2: null,
      city: 'Provo',
      state: 'UT',
      zip_code: '84601',
      latitude: 40.2338,
      longitude: -111.6585
    },
    eligibility: [
      { rule_type: 'income', description: 'Household income under 200% FPL' },
      { rule_type: 'residency', description: 'Utah County residents; ID requested' }
    ],
    hours: [
      { day_of_week: 2, opens_at: '10:00', closes_at: '16:00', notes: 'Closed holidays' }
    ]
  },
  {
    id: 'wasatch_cs_vouchers',
    name: 'Grocery Vouchers',
    description: 'Food vouchers for low-income households; residency in Utah County required.',
    category: 'food',
    subcategory: 'vouchers',
    phone: '801-555-2222',
    email: null,
    website: 'https://wasatchcs.org/food',
    organization: {
      name: 'Wasatch Community Services',
      phone: '801-555-2222',
      website: 'https://wasatchcs.org'
    },
    location: {
      address_line1: '45 Main St',
      address_line2: null,
      city: 'Orem',
      state: 'UT',
      zip_code: '84057',
      latitude: 40.297,
      longitude: -111.6946
    },
    eligibility: [{ rule_type: 'residency', description: 'Utah County address required' }],
    hours: [
      { day_of_week: 4, opens_at: '12:00', closes_at: '18:00', notes: 'Bring photo ID' }
    ]
  },
  {
    id: 'dt_mobile_hot_meals',
    name: 'Mobile Hot Meals',
    description: 'Hot dinners served from a mobile truck; first-come, first-served. Check schedule.',
    category: 'food',
    subcategory: 'hot_meals',
    phone: '801-555-3333',
    email: null,
    website: 'https://downtownmobilemeals.org/schedule',
    organization: {
      name: 'Downtown Mobile Meals',
      phone: '801-555-3333',
      website: 'https://downtownmobilemeals.org'
    },
    location: {
      address_line1: '200 W 100 S',
      address_line2: null,
      city: 'Salt Lake City',
      state: 'UT',
      zip_code: '84101',
      latitude: 40.7638,
      longitude: -111.9
    },
    eligibility: [{ rule_type: 'none', description: 'Open to all; no documentation required' }],
    hours: [
      { day_of_week: 5, opens_at: '17:00', closes_at: '19:00', notes: 'Arrive early; truck moves locations' }
    ]
  },
  {
    id: 'faith_outreach_wed',
    name: 'Wednesday Pantry',
    description: 'Shelf-stable groceries and some fresh items; brief intake form on arrival.',
    category: 'food',
    subcategory: 'pantry',
    phone: '801-555-4444',
    email: null,
    website: null,
    organization: {
      name: 'Faith Outreach Pantry',
      phone: '801-555-4444',
      website: null
    },
    location: {
      address_line1: '780 N 800 E',
      address_line2: null,
      city: 'Provo',
      state: 'UT',
      zip_code: '84606',
      latitude: 40.2464,
      longitude: -111.6418
    },
    eligibility: [{ rule_type: 'residency', description: 'Utah Valley residents preferred' }],
    hours: [
      { day_of_week: 3, opens_at: '14:00', closes_at: '17:00', notes: 'Limited fresh produce' }
    ]
  },
  {
    id: 'south_provo_pantry_pickup',
    name: 'South Provo Pantry Pickup',
    description: 'Weekly groceries plus fresh produce; appointments available.',
    category: 'food',
    subcategory: 'pantry',
    phone: '801-555-5555',
    email: null,
    website: 'https://southprovopantry.org/schedule',
    organization: {
      name: 'South Provo Community Pantry',
      phone: '801-555-5555',
      website: 'https://southprovopantry.org'
    },
    location: {
      address_line1: '950 S 200 E',
      address_line2: null,
      city: 'Provo',
      state: 'UT',
      zip_code: '84606',
      latitude: 40.2275,
      longitude: -111.652
    },
    eligibility: [
      { rule_type: 'residency', description: 'Provo residents prioritized; others welcome if capacity allows' },
      { rule_type: 'income', description: 'Income under 250% FPL' }
    ],
    hours: [
      { day_of_week: 1, opens_at: '15:00', closes_at: '18:00', notes: 'Appointments available; walk-ins accepted' }
    ]
  },
  {
    id: 'provo_kitchen_lunch',
    name: 'Community Kitchen Lunch',
    description: 'Hot lunches served dine-in; take-home dinners on Fridays.',
    category: 'food',
    subcategory: 'hot_meals',
    phone: '801-555-6666',
    email: 'info@provocommunitykitchen.org',
    website: 'https://provocommunitykitchen.org/menu',
    organization: {
      name: 'Provo Community Kitchen',
      phone: '801-555-6666',
      website: 'https://provocommunitykitchen.org'
    },
    location: {
      address_line1: '420 W Center St',
      address_line2: null,
      city: 'Provo',
      state: 'UT',
      zip_code: '84601',
      latitude: 40.2345,
      longitude: -111.6667
    },
    eligibility: [{ rule_type: 'none', description: 'Open to all; no documentation required' }],
    hours: [
      { day_of_week: 1, opens_at: '11:30', closes_at: '13:30', notes: 'Take-home dinners Fridays at 17:00' },
      { day_of_week: 5, opens_at: '11:30', closes_at: '13:30', notes: 'Friday service includes take-home dinners' }
    ]
  }
];

function filterFallback(city: string) {
  const normalized = city.trim().toLowerCase();
  if (!normalized) return fallbackResources;
  return fallbackResources.filter((item) =>
    item.location?.city?.toLowerCase().includes(normalized)
  );
}

export function useResources(city: string, enabled = true) {
  const [resources, setResources] = useState<ResourceWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setResources([]);
      setLoading(false);
      setError(null);
      return;
    }

    async function fetchResources() {
      setLoading(true);
      setError(null);

      try {
        if (!supabase) {
          setResources(filterFallback(city));
          return;
        }

        let query = supabase
          .from('resources')
          .select(`
            id,
            name,
            description,
            category,
            subcategory,
            phone,
            email,
            website,
            organization:organizations(name, phone, website),
            location:locations(
              address_line1,
              address_line2,
              city,
              state,
              zip_code,
              latitude,
              longitude
            ),
            eligibility:eligibility_rules(rule_type, description),
            hours:open_hours(day_of_week, opens_at, closes_at, notes)
          `)
          .eq('is_active', true)
          .eq('category', 'food') // lock the app to food resources only
          .eq('locations.state', 'UT'); // default to Utah resources

        if (city) {
          query = query.filter('locations.city', 'ilike', `%${city}%`);
        }

        const { data, error: fetchError } = await query.limit(20);

        if (fetchError) throw fetchError;

        const formattedData: ResourceWithDetails[] = (data || []).map((resource: any) => ({
          id: resource.id,
          name: resource.name,
          description: resource.description,
          category: resource.category,
          subcategory: resource.subcategory,
          phone: resource.phone,
          email: resource.email,
          website: resource.website,
          organization: Array.isArray(resource.organization)
            ? resource.organization[0] || null
            : resource.organization,
          location: Array.isArray(resource.location)
            ? resource.location[0] || null
            : resource.location,
          eligibility: Array.isArray(resource.eligibility) ? resource.eligibility : [],
          hours: Array.isArray(resource.hours) ? resource.hours : [],
        }));

        if (formattedData.length === 0) {
          setResources(filterFallback(city));
          if (hasSupabase) {
            setError('No live results found for that area. Showing sample data instead.');
          }
          return;
        }

        setResources(formattedData);
      } catch (err) {
        setResources(filterFallback(city));
        if (hasSupabase) {
          const message = err instanceof Error ? err.message : 'An error occurred';
          setError(`Live data unavailable: ${message}. Showing sample resources instead.`);
        }
        console.error('Error fetching resources:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchResources();
  }, [city, enabled]);

  return { resources, loading, error };
}
