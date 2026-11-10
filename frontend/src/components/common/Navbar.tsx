import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CloudSun, 
  Search, 
  Sun, 
  Moon, 
  Globe, 
  User as UserIcon, 
  LogOut, 
  Navigation,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { useAuth } from '../../context/AuthContext';
import { Language } from '../../i18n/translations';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar, isMobileSidebarOpen }) => {
  const { 
    locationName, 
    fetchWeatherByCity, 
    language, 
    setLanguage, 
    theme, 
    setTheme, 
    t 
  } = useWeather();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeatherByCity(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeatherByCity(`${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`);
        },
        () => {
          alert("Geolocation permission denied. Please search city manually.");
        }
      );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 dark:bg-navy-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Mobile trigger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform">
                <CloudSun className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent">
                    WeatherGPT
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                    MoES · IMD
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  AI Weather & Climate Disaster Intelligence
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Search City */}
          <div className="flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.dashboard.searchPlaceholder}
                className="w-full bg-slate-800/80 hover:bg-slate-800 focus:bg-slate-800 border border-slate-700/80 rounded-xl pl-10 pr-24 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={handleDetectLocation}
                title={t.dashboard.useMyLocation}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-slate-700/80 hover:bg-slate-700 text-sky-400 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Navigation className="w-3 h-3" />
                <span className="hidden lg:inline">Locate</span>
              </button>
            </form>
          </div>

          {/* Right: Controls (Language, Theme, Auth) */}
          <div className="flex items-center gap-2">
            
            {/* Language dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-medium border border-slate-700 transition-colors"
                title="Change Language"
              >
                <Globe className="w-4 h-4 text-sky-400" />
                <span className="uppercase">{language}</span>
              </button>
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-xl bg-slate-800 border border-slate-700 shadow-xl py-1 z-50 animate-fadeIn">
                  <button
                    onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-700 transition-colors ${language === 'en' ? 'text-sky-400 font-semibold' : 'text-slate-300'}`}
                  >
                    English (EN)
                  </button>
                  <button
                    onClick={() => { setLanguage('ta'); setIsLangMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-700 transition-colors ${language === 'ta' ? 'text-sky-400 font-semibold' : 'text-slate-300'}`}
                  >
                    தமிழ் (Tamil)
                  </button>
                  <button
                    onClick={() => { setLanguage('hi'); setIsLangMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-700 transition-colors ${language === 'hi' ? 'text-sky-400 font-semibold' : 'text-slate-300'}`}
                  >
                    हिन्दी (Hindi)
                  </button>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth / Profile */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-700">
                <span className="text-xs font-medium text-slate-300 hidden sm:inline">
                  {user?.username}
                </span>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                  title={t.nav.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-1">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium shadow-md shadow-sky-500/20 transition-colors"
                >
                  {t.nav.login}
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
