import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { ResourceCard } from './components/ResourceCard';
import { useResources } from './hooks/useResources';

function App() {
  const [cityInput, setCityInput] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const { resources, loading, error } = useResources(cityFilter, hasSearched);

  const supabaseProject = useMemo(() => {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    if (!url) return null;
    const slug = url.replace(/^https?:\/\//, '').split('.')[0];
    return `Connected to Supabase project: ${slug}`;
  }, []);
  const usingDemoData = !supabaseProject;

  const handleSearch = () => {
    setCityFilter(cityInput.trim());
    setHasSearched(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <header className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center gap-2 text-blue-700 text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            <span>AI-powered community resource finder</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              Find food assistance near you.
            </h1>
            <p className="text-lg text-slate-600 max-w-3xl">
              Browse verified food resources across Utah. Filter by your city to see the closest pantries,
              vouchers, and hot meals.
            </p>
            {supabaseProject && (
              <p className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {supabaseProject}
              </p>
            )}
            {usingDemoData && (
              <p className="inline-flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Demo mode: using built-in sample data. Add VITE_SUPABASE_URL/ANON_KEY to load live backend.
              </p>
            )}
          </div>

          <div className="mt-8">
            <SearchBar city={cityInput} onCityChange={setCityInput} onSearch={handleSearch} />
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: 'Daily data refresh', copy: 'Scheduled ingestion keeps resources current.' },
              { title: 'Food-only focus', copy: 'Pantries, vouchers, and hot meals in Utah.' },
              { title: 'Geo aware', copy: 'Filter by city; see nearby options first.' },
            ].map((item) => (
              <div
                key={item.title}
                className="p-4 rounded-xl border border-slate-100 bg-white/70 shadow-sm"
              >
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600 mt-1">{item.copy}</p>
              </div>
            ))}
          </div>
        </header>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Results</h2>
            </div>
            {loading && (
              <span className="text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                Fetching resources...
              </span>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-lg border border-red-100 bg-red-50 text-red-800 text-sm">
              {error}
            </div>
          )}

          {!hasSearched && (
            <div className="p-6 rounded-xl border border-dashed border-slate-200 bg-white text-center text-slate-600">
              Enter a city to see nearby food resources.
            </div>
          )}

          {hasSearched && !loading && !error && resources.length === 0 && (
            <div className="p-6 rounded-xl border border-dashed border-slate-200 bg-white text-center text-slate-600">
              No food resources found for that area yet. Try another nearby city in Utah.
            </div>
          )}

          {hasSearched && (
            <div className="grid grid-cols-1 gap-4">
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
