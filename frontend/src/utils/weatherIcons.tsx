import React from 'react';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudDrizzle,
  CloudFog,
  Wind
} from 'lucide-react';

export const getWeatherIconComponent = (iconName: string, className: string = "w-6 h-6") => {
  switch (iconName) {
    case 'clear-day':
      return <Sun className={`${className} text-amber-500 animate-spin-slow`} />;
    case 'clear-night':
      return <Moon className={`${className} text-sky-300`} />;
    case 'partly-cloudy-day':
      return <CloudSun className={`${className} text-amber-400`} />;
    case 'partly-cloudy-night':
      return <CloudMoon className={`${className} text-sky-400`} />;
    case 'cloudy':
      return <Cloud className={`${className} text-slate-400`} />;
    case 'rain':
    case 'heavy-rain':
    case 'showers':
      return <CloudRain className={`${className} text-blue-400`} />;
    case 'drizzle':
      return <CloudDrizzle className={`${className} text-sky-400`} />;
    case 'thunderstorm':
      return <CloudLightning className={`${className} text-purple-400 animate-pulse`} />;
    case 'snow':
      return <CloudSnow className={`${className} text-cyan-200`} />;
    case 'fog':
      return <CloudFog className={`${className} text-slate-400`} />;
    default:
      return <Cloud className={`${className} text-sky-400`} />;
  }
};
