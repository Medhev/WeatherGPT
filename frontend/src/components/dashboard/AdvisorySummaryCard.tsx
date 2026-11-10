import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Car, 
  Umbrella, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/api';
import { DisasterAdvisory } from '../../types';
import { useWeather } from '../../context/WeatherContext';

export const AdvisorySummaryCard: React.FC = () => {
  const { locationName, t } = useWeather();
  const [advisories, setAdvisories] = useState<DisasterAdvisory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAdvisories = async () => {
      setLoading(false);
      try {
        const res = await apiClient.get<DisasterAdvisory[]>('/alerts/advisories', {
          params: { city: locationName }
        });
        setAdvisories(res.data);
      } catch (err) {
        // Fallback default
      }
    };
    fetchAdvisories();
  }, [locationName]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Agriculture & Irrigation':
        return <Sprout className="w-4 h-4 text-emerald-400" />;
      case 'Travel & Commute':
        return <Car className="w-4 h-4 text-sky-400" />;
      case 'Rain & Umbrella':
        return <Umbrella className="w-4 h-4 text-blue-400" />;
      case 'Heat Safety & Exposure':
        return <Flame className="w-4 h-4 text-amber-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'Emergency':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">Emergency</span>;
      case 'Warning':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">Warning</span>;
      case 'Caution':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-semibold border border-yellow-500/30">Caution</span>;
      default:
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">Normal</span>;
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{t.dashboard.advisoryOverview}</span>
        </div>
        <Link
          to="/alerts"
          className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition-colors"
        >
          <span>View All Alerts</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {advisories.slice(0, 4).map((adv, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:border-slate-700 space-y-2 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getCategoryIcon(adv.category)}
                <span className="text-xs font-semibold text-slate-200">
                  {adv.category}
                </span>
              </div>
              {getLevelBadge(adv.level)}
            </div>

            <p className="text-xs font-medium text-slate-100 line-clamp-1">
              {adv.headline}
            </p>

            <ul className="space-y-1">
              {adv.advice_points.slice(0, 2).map((pt, pIdx) => (
                <li key={pIdx} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                  <span className="text-sky-400 font-bold">·</span>
                  <span className="line-clamp-1">{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
