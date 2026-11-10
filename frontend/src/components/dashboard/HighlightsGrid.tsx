import React from 'react';
import { 
  Droplets, 
  Wind, 
  Gauge, 
  Eye, 
  SunMedium, 
  Sunrise, 
  Sunset, 
  Compass,
  Activity
} from 'lucide-react';
import { WeatherHighlights, CurrentWeather } from '../../types';
import { useWeather } from '../../context/WeatherContext';

interface HighlightsGridProps {
  highlights: WeatherHighlights;
  current: CurrentWeather;
}

export const HighlightsGrid: React.FC<HighlightsGridProps> = ({ highlights, current }) => {
  const { formatWind, t } = useWeather();

  const getWindDirectionCardinal = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };

  const cards = [
    {
      title: t.dashboard.humidity,
      value: `${highlights.humidity}%`,
      subtitle: highlights.humidity > 70 ? 'High humidity' : highlights.humidity < 35 ? 'Dry air' : 'Optimal comfort',
      icon: Droplets,
      color: 'text-sky-400',
    },
    {
      title: t.dashboard.windSpeed,
      value: formatWind(highlights.wind_speed),
      subtitle: `Direction: ${getWindDirectionCardinal(highlights.wind_direction)} (${highlights.wind_direction}°)`,
      icon: Wind,
      color: 'text-teal-400',
    },
    {
      title: t.dashboard.pressure,
      value: `${Math.round(highlights.pressure_hpa)} hPa`,
      subtitle: 'Mean Sea Level (MSL)',
      icon: Gauge,
      color: 'text-indigo-400',
    },
    {
      title: t.dashboard.visibility,
      value: `${highlights.visibility_km} km`,
      subtitle: highlights.visibility_km >= 10 ? 'Clear horizon' : 'Reduced visibility',
      icon: Eye,
      color: 'text-emerald-400',
    },
    {
      title: t.dashboard.uvIndex,
      value: `${highlights.uv_index.toFixed(1)}`,
      subtitle: highlights.uv_index >= 8 ? 'Very High UV' : highlights.uv_index >= 6 ? 'High UV' : 'Moderate UV',
      icon: SunMedium,
      color: 'text-amber-400',
    },
    {
      title: 'Solar Ephemeris',
      value: highlights.sunrise ? new Date(highlights.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:05 AM',
      subtitle: highlights.sunset ? `Sunset: ${new Date(highlights.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '06:15 PM',
      icon: Sunrise,
      color: 'text-orange-400',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
        <Activity className="w-4 h-4 text-sky-400" />
        <span>{t.dashboard.weatherHighlights}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">{card.title}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>

              <div className="my-2">
                <div className="text-xl sm:text-2xl font-bold text-slate-100">
                  {card.value}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 truncate">
                {card.subtitle}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
