import React, { useState } from 'react';
import { MapPin, ArrowRightLeft, Sparkles } from 'lucide-react';
import { WeatherMap } from '../components/map/WeatherMap';
import { apiClient } from '../services/api';
import { CityComparisonResponse } from '../types';
import { useWeather } from '../context/WeatherContext';

export const MapPage: React.FC = () => {
  const { t, formatTemp, formatWind } = useWeather();
  const [cityA, setCityA] = useState<string>('Chennai');
  const [cityB, setCityB] = useState<string>('Bengaluru');
  const [comparison, setComparison] = useState<CityComparisonResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityA.trim() || !cityB.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<CityComparisonResponse>('/weather/compare', {
        params: { city_a: cityA.trim(), city_b: cityB.trim() }
      });
      setComparison(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Could not compare the selected cities.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-sky-400" />
          <span>{t.map.title}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t.map.subtitle}
        </p>
      </div>

      {/* Interactive Map */}
      <WeatherMap />

      {/* Multi-City Comparison Card */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <ArrowRightLeft className="w-4 h-4 text-sky-400" />
          <span>Multi-City Meteorological Comparison</span>
        </div>

        <form onSubmit={handleCompare} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={cityA}
            onChange={(e) => setCityA(e.target.value)}
            placeholder="City 1 (e.g. Chennai)"
            className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <input
            type="text"
            value={cityB}
            onChange={(e) => setCityB(e.target.value)}
            placeholder="City 2 (e.g. Bengaluru)"
            className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-medium text-xs rounded-xl shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>{loading ? 'Analyzing...' : 'Compare Cities'}</span>
          </button>
        </form>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        {comparison && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-sky-300" />
              <span>Comparative Synthesis</span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {comparison.comparison_summary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <span className="font-bold text-slate-200">{comparison.city_a.location.name}</span>
                <div className="mt-1 text-slate-300">
                  Temp: <strong className="text-rose-300">{formatTemp(comparison.city_a.current.temperature)}</strong> ({comparison.city_a.current.weather_description})
                </div>
                <div className="text-slate-400 text-[11px]">
                  Humidity: {comparison.city_a.current.relative_humidity}% · Wind: {formatWind(comparison.city_a.current.wind_speed)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <span className="font-bold text-slate-200">{comparison.city_b.location.name}</span>
                <div className="mt-1 text-slate-300">
                  Temp: <strong className="text-rose-300">{formatTemp(comparison.city_b.current.temperature)}</strong> ({comparison.city_b.current.weather_description})
                </div>
                <div className="text-slate-400 text-[11px]">
                  Humidity: {comparison.city_b.current.relative_humidity}% · Wind: {formatWind(comparison.city_b.current.wind_speed)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
