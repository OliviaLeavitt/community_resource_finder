// src/resourceService.js
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

/**
 * Fetch community resources from the backend.
 * @param {Object} options - search options
 * @param {string} options.query - search keywords
 * @param {number} options.lat - latitude
 * @param {number} options.lng - longitude
 * @param {number} options.radius - search radius (miles)
 */
export async function searchResources({ query = '', lat, lng, radius }) {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    params.set('lat', lat);
    params.set('lng', lng);
  }
  if (radius) params.set('radius', radius);

  const res = await fetch(`${API_BASE}/resources?${params.toString()}`);
  if (!res.ok) throw new Error('API request failed');
  return res.json();
}
