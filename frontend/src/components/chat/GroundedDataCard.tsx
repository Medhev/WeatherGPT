import React from 'react';
import { Database, MapPin, Thermometer, Droplets, Calendar } from 'lucide-react';
import { GroundedDataRecord } from '../../types';

interface GroundedDataCardProps {
  data: GroundedDataRecord;
}

export const GroundedDataCard: React.FC<GroundedDataCardProps> = ({ data }) => {
  return (
    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-sky-500/30 text-xs space-y-2 mt-2 shadow-inner">
      <div className="flex items-center justify-between text-sky-400 font-semibold border-b border-sky-500/20 pb-1.5">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5" />
          <span>Grounded Meteorological Evidence</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">
          Tool: {data.tool}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
        {data.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-sky-400 flex-shrink-0" />
            <span className="truncate">{data.location}</span>
          </div>
        )}

        {data.temperature !== undefined && (
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-3 h-3 text-rose-400 flex-shrink-0" />
            <span>{data.temperature}°C ({data.weather_condition || 'Fair'})</span>
          </div>
        )}

        {data.rain_probability !== undefined && (
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3 h-3 text-blue-400 flex-shrink-0" />
            <span>Rain Prob: {data.rain_probability}%</span>
          </div>
        )}

        {data.date_context && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-amber-400 flex-shrink-0" />
            <span className="capitalize">{data.date_context}</span>
          </div>
        )}
      </div>
    </div>
  );
};
