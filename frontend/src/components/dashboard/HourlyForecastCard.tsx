import React from 'react';
import { Clock, Droplets } from 'lucide-react';
import { HourlyForecastPoint } from '../../types';
import { getWeatherIconComponent } from '../../utils/weatherIcons';
import { useWeather } from '../../context/WeatherContext';

interface HourlyForecastCardProps {
  hourly: HourlyForecastPoint[];
}

export const HourlyForecastCard: React.FC<HourlyForecastCardProps> = ({ hourly }) => {
  const { formatTemp, t } = useWeather();

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
          <Clock className="w-4 h-4 text-sky-400" />
          <span>{t.dashboard.hourlyForecast}</span>
        </div>
        <span className="text-xs text-slate-400">Next 24 Hours</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
        {hourly.map((point, index) => {
          const timeStr = new Date(point.time).toLocaleTimeString([], { hour: 'numeric' });
          const isNow = index === 0;

          return (
            <div
              key={point.time}
              className={`flex-shrink-0 flex flex-col items-center justify-between p-3 rounded-xl min-w-[76px] transition-all ${
                isNow
                  ? 'bg-sky-500/20 border border-sky-500/40 text-white'
                  : 'bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/40 text-slate-300'
              }`}
            >
              <span className="text-xs font-medium text-slate-400">
                {isNow ? 'Now' : timeStr}
              </span>

              <div className="my-2.5">
                {getWeatherIconComponent(point.weather_icon, "w-6 h-6")}
              </div>

              <span className="text-sm font-bold text-slate-100">
                {formatTemp(point.temperature)}
              </span>

              {point.precipitation_probability > 0 ? (
                <div className="flex items-center gap-0.5 text-[10px] text-sky-400 font-semibold mt-1">
                  <Droplets className="w-2.5 h-2.5" />
                  <span>{point.precipitation_probability}%</span>
                </div>
              ) : (
                <div className="h-4 mt-1"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
