import { useEffect, useState } from 'react';
import { searchResources } from './resourceService';
import SearchBar from './components/SearchBar';
import ResourceCard from './components/ResourceCard';

export default function App() {
  const [coords, setCoords] = useState({ lat: 40.233, lng: -111.657 }); // Provo fallback
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const doSearch = async ({ query = '', radius = 25 }) => {
    setLoading(true);
    setError('');
    try {
      const data = await searchResources({ query, lat: coords.lat, lng: coords.lng, radius });
      setResults(data);
    } catch (e) {
      setError('Search failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { doSearch({}); }, []); // initial load

  return (
    <div className="container">
      <h1>Find free help near you</h1>
      <SearchBar onSearch={doSearch} coords={coords} setCoords={setCoords} />
      {loading && <p>Searching...</p>}
      {error && <p className="error">{error}</p>}
      <div className="results">
        {results.length === 0 && !loading && <p>No results. Try "food" or "shelter".</p>}
        {results.map(r => <ResourceCard key={r.id} r={r} />)}
      </div>
    </div>
  );
}
