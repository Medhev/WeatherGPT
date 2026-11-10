import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, Calendar, RefreshCw } from 'lucide-react';
import { apiClient } from '../services/api';
import { ClimateTrendsResponse } from '../types';
import { ClimateTrendChart } from '../components/climate/ClimateTrendChart';
import { ClimateStatsGrid } from '../components/climate/ClimateStatsGrid';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { useWeather } from '../context/WeatherContext';

export const ClimatePage: React.FC = () => {
  const { locationName, t } = useWeather();
  const [climateData, setClimateData] = useState<ClimateTrendsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Default dates: past 30 days
  const today = new Date();
  const defaultEnd = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const defaultStart = new Date(today.getTime() - 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(defaultStart);
  const [endDate, setEndDate] = useState<string>(defaultEnd);

  const fetchClimateData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<ClimateTrendsResponse>('/climate/trends', {
        params: {
          city: locationName,
          start_date: startDate,
          end_date: endDate,
        },
      });
      setClimateData(res.data);
    } catch (err) {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClimateData();
  }, [locationName]);

  const handleDownloadCsv = () => {
    const csvUrl = `${apiClient.defaults.baseURL}/climate/export-csv?city=${encodeURIComponent(
      locationName
    )}&start_date=${startDate}&end_date=${endDate}`;
    window.open(csvUrl, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-sky-400" />
            <span>{t.climate.title}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing historical climate telemetry and 30-year anomalies for <strong className="text-sky-300">{locationName}</strong>.
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-sky-500/20 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>{t.climate.exportCsv}</span>
        </button>
      </div>

      {/* Date Range Selection Bar */}
      <div className="p-4 rounded-2xl glass-card border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <span className="font-semibold text-slate-300">Observation Date Window:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-slate-400">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-slate-400">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <button
            onClick={fetchClimateData}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Compute Analytics</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : climateData ? (
        <div className="space-y-6">
          {/* Key Summary Statistics Grid */}
          <ClimateStatsGrid stats={climateData.statistics} />

          {/* Graphical Trends */}
          <ClimateTrendChart data={climateData.daily_records} />
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 text-sm glass-card rounded-2xl">
          Historical archive records currently unavailable for this coordinate query.
        </div>
      )}
    </div>
  );
};
