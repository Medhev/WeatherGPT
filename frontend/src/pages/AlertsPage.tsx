import React, { useState, useEffect } from 'react';
import { ShieldAlert, Filter, Search, RefreshCw } from 'lucide-react';
import { apiClient } from '../services/api';
import { AlertItem, AlertListResponse } from '../types';
import { AlertCard } from '../components/alerts/AlertCard';
import { AdvisorySummaryCard } from '../components/dashboard/AdvisorySummaryCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { useWeather } from '../context/WeatherContext';

export const AlertsPage: React.FC = () => {
  const { locationName, t } = useWeather();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchLocation, setSearchLocation] = useState<string>('');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<AlertListResponse>('/alerts', {
        params: {
          severity: severityFilter !== 'all' ? severityFilter : undefined,
          location: searchLocation.trim() || undefined,
          include_simulated: true,
        },
      });
      setAlerts(res.data.alerts);
    } catch (err) {
      // Keep empty if failed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAlerts();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <span>{t.alerts.title}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.alerts.subtitle}
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="p-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Warnings</span>
        </button>
      </div>

      {/* Filter and Location Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl glass-card border border-slate-800">
        
        {/* Severity Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
          {['all', 'Moderate', 'Severe', 'Extreme'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                severityFilter.toLowerCase() === sev.toLowerCase()
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {sev === 'all' ? 'All Alerts' : `${sev} Tier`}
            </button>
          ))}
        </div>

        {/* Location Filter Input */}
        <form onSubmit={handleSearchSubmit} className="relative sm:w-64">
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="Filter location (e.g., Chennai)..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Alerts Grid */}
      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : alerts.length === 0 ? (
        <div className="p-8 rounded-2xl glass-card border border-slate-800 text-center space-y-2">
          <ShieldAlert className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-200">{t.alerts.noAlerts}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All regional stations are reporting atmospheric conditions within standard safety limits.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {/* Embedded Location-based Safety Advisories */}
      <div className="pt-4">
        <h2 className="text-base font-bold text-slate-200 mb-3">
          Operational Sector Advisories for {locationName}
        </h2>
        <AdvisorySummaryCard />
      </div>

    </div>
  );
};
