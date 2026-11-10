import React from 'react';
import { CalendarDays, Droplets } from 'lucide-react';
import { DailyForecastPoint } from '../../types';
import { getWeatherIconComponent } from '../../utils/weatherIcons';
import { useWeather } from '../../context/WeatherContext';

interface DailyForecastCardProps {
  daily: DailyForecastPoint[];
}

export const DailyForecastCard: React.FC<DailyForecastCardProps> = ({ daily }) => {
  const { formatTemp, t } = useWeather();

  const getDayName = (dateStr: string, index: number) => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
          <CalendarDays className="w-4 h-4 text-sky-400" />
          <span>{t.dashboard.sevenDayForecast}</span>
        </div>
        <span className="text-xs text-slate-400">7-Day Outlook</span>
      </div>

      <div className="space-y-2.5">
        {daily.map((day, idx) => {
          return (
            <div
              key={day.date}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/30 transition-colors text-sm"
            >
              {/* Day name & date */}
              <div className="w-24 flex flex-col">
                <span className="font-semibold text-slate-200">
                  {getDayName(day.date, idx)}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(day.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>

              {/* Weather icon & description */}
              <div className="flex items-center gap-2.5 flex-1 px-2">
                {getWeatherIconComponent(day.weather_icon, "w-6 h-6")}
                <span className="text-xs text-slate-300 hidden sm:inline capitalize truncate max-w-[140px]">
                  {day.weather_description}
                </span>
              </div>

              {/* Rain chance */}
              <div className="w-16 flex items-center justify-center">
                {day.precipitation_probability_max > 0 ? (
                  <span className="flex items-center gap-1 text-xs text-sky-400 font-medium">
                    <Droplets className="w-3 h-3" />
                    {day.precipitation_probability_max}%
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">-</span>
                )}
              </div>

              {/* Min / Max Temp */}
              <div className="w-28 flex items-center justify-end gap-2 font-semibold">
                <span className="text-slate-100">{formatTemp(day.temperature_max)}</span>
                <span className="text-slate-400 text-xs font-normal">/</span>
                <span className="text-slate-400 text-xs">{formatTemp(day.temperature_min)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
