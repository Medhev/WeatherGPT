import React, { useState } from 'react';
import { Settings as SettingsIcon, Check, Globe, Thermometer, Wind, Palette } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';

export const SettingsPage: React.FC = () => {
  const {
    language,
    setLanguage,
    tempUnit,
    setTempUnit,
    windUnit,
    setWindUnit,
    theme,
    setTheme,
    t,
  } = useWeather();
  const { isAuthenticated } = useAuth();
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = async () => {
    if (isAuthenticated) {
      try {
        await apiClient.put('/preferences', {
          temp_unit: tempUnit,
          wind_speed_unit: windUnit,
          language: language,
          theme: theme,
        });
      } catch (e) {
        // Local preference is already saved
      }
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-sky-400" />
          <span>{t.settings.title}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize units, multilingual presentation, and visual theme preferences.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{t.settings.savedSuccess}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Temperature Unit */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
            <Thermometer className="w-4 h-4 text-rose-400" />
            <span>{t.settings.temperatureUnit}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTempUnit('celsius')}
              className={`p-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                tempUnit === 'celsius'
                  ? 'bg-sky-500/20 border-sky-500 text-white shadow-md'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold">{t.settings.celsius}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Indian / MoES Meteorological Metric</div>
            </button>

            <button
              type="button"
              onClick={() => setTempUnit('fahrenheit')}
              className={`p-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                tempUnit === 'fahrenheit'
                  ? 'bg-sky-500/20 border-sky-500 text-white shadow-md'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold">{t.settings.fahrenheit}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Imperial Scale (US / UK standard)</div>
            </button>
          </div>
        </div>

        {/* Wind Speed Unit */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
            <Wind className="w-4 h-4 text-teal-400" />
            <span>{t.settings.windSpeedUnit}</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'kmh', label: 'Kilometers per Hour (km/h)', desc: 'IMD Highway standard' },
              { id: 'ms', label: 'Meters per Second (m/s)', desc: 'Scientific SI unit' },
              { id: 'mph', label: 'Miles per Hour (mph)', desc: 'Aviation / Marine scale' },
            ].map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setWindUnit(u.id as any)}
                className={`p-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                  windUnit === u.id
                    ? 'bg-sky-500/20 border-sky-500 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold">{u.label.split(' ')[0]}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{u.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
            <Globe className="w-4 h-4 text-sky-400" />
            <span>{t.settings.language}</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'en', name: 'English', native: 'English' },
              { id: 'ta', name: 'Tamil', native: 'தமிழ்' },
              { id: 'hi', name: 'Hindi', native: 'हिन्दी' },
            ].map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLanguage(l.id as any)}
                className={`p-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                  language === l.id
                    ? 'bg-sky-500/20 border-sky-500 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold">{l.native}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{l.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Preference */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
            <Palette className="w-4 h-4 text-indigo-400" />
            <span>{t.settings.theme}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'system' as const, label: t.settings.system, desc: 'Follow your device preference' },
              { id: 'light' as const, label: t.settings.light, desc: 'Clean high-contrast daylight theme' },
              { id: 'dark' as const, label: t.settings.dark, desc: 'Weather-inspired deep navy contrast' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setTheme(option.id)}
                aria-pressed={theme === option.id}
                className={`theme-option p-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                  theme === option.id
                    ? 'bg-sky-500/20 border-sky-500 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="theme-preview" aria-hidden="true">
                  <div className="theme-preview-window">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="theme-preview-window theme-preview-window-accent">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
                <div className="font-bold mt-2">{option.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-500/25 transition-all"
        >
          {t.settings.savePreferences}
        </button>
      </div>
    </div>
  );
};
