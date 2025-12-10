import { MapPin } from 'lucide-react';

interface SearchBarProps {
  city: string;
  onCityChange: (value: string) => void;
  onSearch: () => void;
}

export function SearchBar({ city, onCityChange, onSearch }: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder="City (e.g., Provo, Salt Lake City)"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Find nearby food
          </button>
        </div>
      </div>
    </form>
  );
}
