import { useState } from 'react';

export default function SearchBar({ onSearch, coords, setCoords }) {
  const [query, setQuery] = useState('');
  const [radius, setRadius] = useState(25);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ query, radius });
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported.');
    navigator.geolocation.getCurrentPosition(
      p => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => alert('Could not get your location.')
    );
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search for food, shelter, legal help..."
      />
      <input
        type="number"
        min={1}
        max={100}
        value={radius}
        onChange={e => setRadius(Number(e.target.value))}
        title="Search radius (miles)"
      />
      <button type="button" onClick={useMyLocation}>📍 My Location</button>
      <button type="submit">Search</button>
    </form>
  );
}
