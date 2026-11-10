import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { WeatherResponse } from '../types';
import { translations, Language, TranslationDictionary } from '../i18n/translations';

interface WeatherContextType {
  weather: WeatherResponse | null;
  locationName: string;
  loading: boolean;
  error: string | null;
  language: Language;
  tempUnit: 'celsius' | 'fahrenheit';
  windUnit: 'kmh' | 'ms' | 'mph';
  theme: 'light' | 'dark';
  t: TranslationDictionary;
  setLanguage: (lang: Language) => void;
  setTempUnit: (unit: 'celsius' | 'fahrenheit') => void;
  setWindUnit: (unit: 'kmh' | 'ms' | 'mph') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  fetchWeatherByCity: (cityName: string) => Promise<void>;
  fetchWeatherByCoords: (lat: number, lon: number, name?: string) => Promise<void>;
  formatTemp: (celsius: number) => string;
  formatWind: (kmh: number) => string;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [locationName, setLocationName] = useState<string>('Chennai');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [language, setLanguageState] = useState<Language>(
    (localStorage.getItem('weathergpt_lang') as Language) || 'en'
  );
  const [tempUnit, setTempUnitState] = useState<'celsius' | 'fahrenheit'>(
    (localStorage.getItem('weathergpt_temp_unit') as any) || 'celsius'
  );
  const [windUnit, setWindUnitState] = useState<'kmh' | 'ms' | 'mph'>(
    (localStorage.getItem('weathergpt_wind_unit') as any) || 'kmh'
  );
  const [theme, setThemeState] = useState<'light' | 'dark'>(
    (localStorage.getItem('weathergpt_theme') as any) || 'dark'
  );

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('weathergpt_lang', lang);
  };

  const setTempUnit = (unit: 'celsius' | 'fahrenheit') => {
    setTempUnitState(unit);
    localStorage.setItem('weathergpt_temp_unit', unit);
  };

  const setWindUnit = (unit: 'kmh' | 'ms' | 'mph') => {
    setWindUnitState(unit);
    localStorage.setItem('weathergpt_wind_unit', unit);
  };

  const setTheme = (th: 'light' | 'dark') => {
    setThemeState(th);
    localStorage.setItem('weathergpt_theme', th);
    if (th === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Sync dark class on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const fetchWeatherByCity = async (cityName: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<WeatherResponse>('/weather/current', {
        params: { city: cityName },
      });
      setWeather(res.data);
      setLocationName(res.data.location.name);
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to fetch meteorological data for ${cityName}.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat: number, lon: number, name?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<WeatherResponse>('/weather/current', {
        params: { lat, lon, city: name },
      });
      setWeather(res.data);
      setLocationName(res.data.location.name);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch weather for coordinates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch for Chennai
    fetchWeatherByCity('Chennai');
  }, []);

  const formatTemp = (celsius: number): string => {
    if (tempUnit === 'fahrenheit') {
      const f = (celsius * 9) / 5 + 32;
      return `${Math.round(f)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  const formatWind = (kmh: number): string => {
    if (windUnit === 'ms') {
      return `${(kmh / 3.6).toFixed(1)} m/s`;
    }
    if (windUnit === 'mph') {
      return `${(kmh * 0.621371).toFixed(1)} mph`;
    }
    return `${Math.round(kmh)} km/h`;
  };

  const t = translations[language] || translations.en;

  return (
    <WeatherContext.Provider
      value={{
        weather,
        locationName,
        loading,
        error,
        language,
        tempUnit,
        windUnit,
        theme,
        t,
        setLanguage,
        setTempUnit,
        setWindUnit,
        setTheme,
        fetchWeatherByCity,
        fetchWeatherByCoords,
        formatTemp,
        formatWind,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be used within a WeatherProvider');
  return ctx;
};
