import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  CalendarDays, 
  ShieldAlert, 
  TrendingUp, 
  MapPin, 
  Bookmark, 
  Settings, 
  Cpu
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { t } = useWeather();

  const navItems = [
    { to: '/', label: t.nav.dashboard, icon: LayoutDashboard },
    { to: '/chat', label: t.nav.chat, icon: Bot, badge: 'AI' },
    { to: '/forecast', label: t.nav.forecast, icon: CalendarDays },
    { to: '/alerts', label: t.nav.alerts, icon: ShieldAlert, alertBadge: true },
    { to: '/climate', label: t.nav.climate, icon: TrendingUp },
    { to: '/map', label: t.nav.map, icon: MapPin },
    { to: '/saved-locations', label: t.nav.savedLocations, icon: Bookmark },
    { to: '/settings', label: t.nav.settings, icon: Settings },
    { to: '/nwp-status', label: t.nav.nwpStatus, icon: Cpu },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900/60 dark:bg-navy-950/60 border-r border-slate-800 p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Navigation
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-400/20 text-sky-200">
                    {item.badge}
                  </span>
                )}
                {item.alertBadge && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span>Operational Node</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>
        <p>MoES-IMD Disaster Resilience</p>
        <p className="text-[10px] text-slate-500">Harmonized Open-Meteo & NWP</p>
      </div>
    </aside>
  );
};
