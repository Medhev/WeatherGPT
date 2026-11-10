import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { HistoricalDayData } from '../../types';

interface ClimateTrendChartProps {
  data: HistoricalDayData[];
}

export const ClimateTrendChart: React.FC<ClimateTrendChartProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      
      {/* 1. Temperature Trend Line Chart */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">
            Daily Maximum, Minimum & Mean Temperatures (°C)
          </h3>
          <span className="text-xs text-slate-400">ERA5 Climate Reanalysis</span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={(val) => val.slice(5)} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '0.75rem', fontSize: '12px' }}
                labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Line type="monotone" dataKey="temperature_max" name="Max Temp (°C)" stroke="#f43f5e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="temperature_mean" name="Mean Temp (°C)" stroke="#38bdf8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="temperature_min" name="Min Temp (°C)" stroke="#34d399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Rainfall Accumulation Bar Chart */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">
            Daily Precipitation (mm)
          </h3>
          <span className="text-xs text-sky-400">IMD Rainy Day Benchmark: ≥ 2.5 mm</span>
        </div>

        <div className="h-48 sm:h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={(val) => val.slice(5)} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '0.75rem', fontSize: '12px' }}
                labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
              />
              <Bar dataKey="precipitation_sum" name="Rainfall (mm)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
