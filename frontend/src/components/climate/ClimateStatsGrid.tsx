import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  TrendingUp, 
  Sun, 
  Calendar,
  CloudRain
} from 'lucide-react';
import { ClimateSummaryStats } from '../../types';

interface ClimateStatsGridProps {
  stats: ClimateSummaryStats;
}

export const ClimateStatsGrid: React.FC<ClimateStatsGridProps> = ({ stats }) => {
  const cards = [
    {
      title: "Average Temperature",
      value: `${stats.overall_avg_temp}°C`,
      subtitle: `Analyzed over ${stats.analyzed_days_count} days`,
      icon: Thermometer,
      color: "text-sky-400",
    },
    {
      title: "Record High / Low",
      value: `${stats.record_max_temp}°C / ${stats.record_min_temp}°C`,
      subtitle: `Mean range: ${stats.mean_max_temp}°C to ${stats.mean_min_temp}°C`,
      icon: Sun,
      color: "text-amber-400",
    },
    {
      title: "Accumulated Rainfall",
      value: `${stats.total_rainfall_mm} mm`,
      subtitle: `Single day max: ${stats.max_single_day_rainfall} mm`,
      icon: Droplets,
      color: "text-blue-400",
    },
    {
      title: "Rainy Days",
      value: `${stats.rainy_days_count} days`,
      subtitle: `Dry spells: ${stats.dry_spell_days} days (<0.1mm)`,
      icon: CloudRain,
      color: "text-teal-400",
    },
    {
      title: "Thermal Anomaly",
      value: `${stats.temperature_anomaly !== undefined ? (stats.temperature_anomaly > 0 ? `+${stats.temperature_anomaly}` : stats.temperature_anomaly) : '0.0'}°C`,
      subtitle: "Compared to 30-year climatological baseline",
      icon: TrendingUp,
      color: "text-purple-400",
    },
    {
      title: "Analysis Interval",
      value: `${stats.analyzed_days_count} Days`,
      subtitle: "Quality-controlled European Copernicus ERA5 data",
      icon: Calendar,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">{c.title}</span>
              <Icon className={`w-4 h-4 ${c.color}`} />
            </div>

            <div className="my-2">
              <div className="text-lg sm:text-xl font-bold text-slate-100">
                {c.value}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 truncate">
              {c.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
};
