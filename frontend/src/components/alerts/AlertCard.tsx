import React from 'react';
import { ShieldAlert, AlertTriangle, Info, Clock, MapPin, CheckCircle } from 'lucide-react';
import { AlertItem } from '../../types';

interface AlertCardProps {
  alert: AlertItem;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const getSeverityStyle = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'extreme':
        return {
          border: 'border-rose-500/50',
          bg: 'bg-rose-500/10',
          badge: 'bg-rose-500 text-white',
          icon: ShieldAlert,
          iconColor: 'text-rose-500',
        };
      case 'severe':
        return {
          border: 'border-orange-500/50',
          bg: 'bg-orange-500/10',
          badge: 'bg-orange-500 text-white',
          icon: AlertTriangle,
          iconColor: 'text-orange-400',
        };
      case 'moderate':
        return {
          border: 'border-amber-500/50',
          bg: 'bg-amber-500/10',
          badge: 'bg-amber-500 text-slate-900 font-bold',
          icon: AlertTriangle,
          iconColor: 'text-amber-400',
        };
      default:
        return {
          border: 'border-emerald-500/50',
          bg: 'bg-emerald-500/10',
          badge: 'bg-emerald-500 text-white',
          icon: Info,
          iconColor: 'text-emerald-400',
        };
    }
  };

  const style = getSeverityStyle(alert.severity);
  const Icon = style.icon;

  return (
    <div className={`p-5 rounded-2xl glass-card border ${style.border} space-y-3 transition-all hover:shadow-lg`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${style.iconColor}`} />
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${style.badge}`}>
            {alert.severity} Alert
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {alert.event_type}
          </span>
        </div>

        {alert.is_simulated && (
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
            Academic Simulation Demo
          </span>
        )}
      </div>

      <h3 className="text-base font-bold text-slate-100">
        {alert.title}
      </h3>

      <p className="text-xs text-slate-300 leading-relaxed">
        {alert.description}
      </p>

      {alert.instruction && (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs text-slate-200 flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-sky-300">Action Recommended: </span>
            {alert.instruction}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span>{alert.location_name}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Effective: {new Date(alert.effective_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          {alert.expires_at && (
            <span>· Valid until: {new Date(alert.expires_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>
      </div>
    </div>
  );
};
