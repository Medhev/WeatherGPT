import React from 'react';
import { CalendarDays, Sunrise, Sunset, Wind, Droplets, SunMedium } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { getWeatherIconComponent } from '../utils/weatherIcons';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const ForecastPage: React.FC = () => {
  const { weather, locationName, formatTemp, formatWind, loading } = useWeather();

  if (loading || !weather) {
    return <LoadingSkeleton rows={5} />;
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-sky-400" />
          <span>7-Day Synoptic Weather Outlook</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Extended numerical guidance and probability metrics for <strong className="text-sky-300">{locationName}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {weather.daily.map((day, index) => {
          const dateObj = new Date(day.date);
          const dayTitle = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : dateObj.toLocaleDateString('en-US', { weekday: 'long' });

          return (
            <div
              key={day.date}
              className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-100">{dayTitle}</h3>
                  <span className="text-xs text-slate-400">
                    {dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  {getWeatherIconComponent(day.weather_icon, "w-8 h-8")}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-2xl font-extrabold text-slate-100">
                  {formatTemp(day.temperature_max)}
                  <span className="text-sm font-normal text-slate-400 ml-2">/ {formatTemp(day.temperature_min)}</span>
                </div>
                <div className="text-xs text-sky-300 font-medium capitalize">
                  {day.weather_description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800/60">
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  <span>Rain: {day.precipitation_probability_max}% ({day.precipitation_sum}mm)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-teal-400" />
                  <span>Wind: {formatWind(day.wind_speed_max)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sunrise className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rise: {day.sunrise ? new Date(day.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:05 AM'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sunset className="w-3.5 h-3.5 text-orange-400" />
                  <span>Set: {day.sunset ? new Date(day.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:15 PM'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
