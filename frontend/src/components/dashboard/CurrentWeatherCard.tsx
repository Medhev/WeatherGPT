import React from 'react';
import { MapPin, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { WeatherResponse } from '../../types';
import { getWeatherIconComponent } from '../../utils/weatherIcons';
import { useWeather } from '../../context/WeatherContext';

interface CurrentWeatherCardProps {
  weather: WeatherResponse;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({ weather }) => {
  const { formatTemp, t } = useWeather();
  const curr = weather.current;
  const loc = weather.location;
  const todayDaily = weather.daily[0];

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-900 text-white shadow-xl shadow-sky-950/40 border border-sky-400/20">
      {/* Background ambient lighting */}
      <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left: Location & Main Temperature */}
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sky-200">
              <MapPin className="w-5 h-5 text-sky-300" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {loc.name}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-sky-200/80">
              <Clock className="w-3.5 h-3.5" />
              <span>Local Station Time: {new Date(curr.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>·</span>
              <span className="bg-sky-500/30 px-2 py-0.5 rounded-full text-[10px] font-medium border border-sky-300/30">
                {weather.source}
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-4">
            <div className="text-6xl sm:text-7xl font-extrabold tracking-tighter">
              {formatTemp(curr.temperature)}
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-sky-200">
                {t.dashboard.feelsLike}: {formatTemp(curr.apparent_temperature)}
              </div>
              {todayDaily && (
                <div className="flex items-center gap-3 text-xs text-sky-100/90 font-medium">
                  <span className="flex items-center gap-0.5 text-rose-300">
                    <ArrowUp className="w-3.5 h-3.5" /> {formatTemp(todayDaily.temperature_max)}
                  </span>
                  <span className="flex items-center gap-0.5 text-cyan-200">
                    <ArrowDown className="w-3.5 h-3.5" /> {formatTemp(todayDaily.temperature_min)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Weather Condition Icon & Headline */}
        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
            {getWeatherIconComponent(curr.weather_icon, "w-16 h-16 sm:w-20 sm:h-20")}
          </div>
          <div className="text-right mt-3 space-y-0.5">
            <div className="text-lg sm:text-xl font-bold text-white capitalize">
              {curr.weather_description}
            </div>
            <div className="text-xs text-sky-200">
              {curr.rain > 0 ? `Active Rain: ${curr.rain} mm` : 'Precipitation Nil'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
