import React, { useState, useEffect } from 'react';
import { Bookmark, Plus, Trash2, MapPin, Search } from 'lucide-react';
import { apiClient } from '../services/api';
import { SavedLocation, LocationSearchResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';
import { Link } from 'react-router-dom';

export const SavedLocationsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { fetchWeatherByCity, locationName } = useWeather();
  const [saved, setSaved] = useState<SavedLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSaved = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiClient.get<SavedLocation[]>('/locations/saved');
      setSaved(res.data);
    } catch (e) {
      //
    }
  };

  useEffect(() => {
    fetchSaved();
  }, [isAuthenticated]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await apiClient.get<LocationSearchResult[]>('/locations/search', {
        params: { q: searchQuery.trim() }
      });
      setSearchResults(res.data);
    } catch (e) {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLocation = async (loc: LocationSearchResult) => {
    try {
      await apiClient.post('/locations/saved', {
        name: loc.name,
        latitude: loc.latitude,
        longitude: loc.longitude,
        country: loc.country,
        admin1: loc.admin1,
      });
      setSearchQuery('');
      setSearchResults([]);
      fetchSaved();
    } catch (e) {
      //
    }
  };

  const handleDeleteLocation = async (id: number) => {
    try {
      await apiClient.delete(`/locations/saved/${id}`);
      setSaved((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      //
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-sky-400" />
          <span>Saved Weather Locations</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Store frequently monitored cities and district centers for rapid meteorological access.
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="p-8 rounded-2xl glass-card border border-slate-800 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-sky-400 mx-auto opacity-60" />
          <h3 className="text-base font-bold text-slate-200">Sign in to sync your saved cities</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Create a free WeatherGPT student account to bookmark multiple districts, manage agro-meteorological advisories, and persist chat conversations.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-500/20"
            >
              Sign In or Register
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Add City Search */}
          <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-sky-400" />
              <span>Add Location to Favorites</span>
            </h3>

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city (e.g., Coimbatore, Madurai, Pune)..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-medium"
              >
                Search
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium">Search Results:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {searchResults.map((res, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{res.name}</div>
                        <div className="text-[10px] text-slate-400">{res.admin1 || res.country}</div>
                      </div>
                      <button
                        onClick={() => handleSaveLocation(res)}
                        className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-medium rounded-lg text-xs"
                      >
                        Save
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Saved List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Your Saved Cities ({saved.length})</h3>
            {saved.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 glass-card rounded-2xl">
                No saved locations yet. Search and save cities above.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {saved.map((loc) => {
                  const isActive = locationName.toLowerCase() === loc.name.toLowerCase();
                  return (
                    <div
                      key={loc.id}
                      className={`p-4 rounded-2xl glass-card border flex items-center justify-between transition-all ${
                        isActive ? 'border-sky-500 shadow-md shadow-sky-500/10' : 'border-slate-800'
                      }`}
                    >
                      <button
                        onClick={() => fetchWeatherByCity(loc.name)}
                        className="text-left flex items-start gap-2.5 flex-1"
                      >
                        <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                        <div>
                          <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                            <span>{loc.name}</span>
                            {isActive && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-semibold">Active</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{loc.admin1 || loc.country}</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleDeleteLocation(loc.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors rounded-lg"
                        title="Remove location"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
