import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, Clock, Server, AlertCircle } from 'lucide-react';
import { apiClient } from '../services/api';
import { IntegrationStatus } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const NwpStatusPage: React.FC = () => {
  const [statuses, setStatuses] = useState<Record<string, IntegrationStatus>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await apiClient.get<Record<string, IntegrationStatus>>('/nwp/status');
        setStatuses(res.data);
      } catch (e) {
        //
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            OPERATIONAL
          </span>
        );
      case 'PENDING_CREDENTIALS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            AWAITING MoES API KEY
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
            <Server className="w-3.5 h-3.5" />
            PLANNED HPC PIPELINE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-sky-400" />
          <span>Numerical Weather Prediction (NWP) & IMD Ingestion Architecture</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Verification matrix for GFS, WRF, Open-Meteo, and official Ministry of Earth Sciences (MoES) Mausam feeds.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-sky-100">Meteorological Integrity Guarantee: </strong>
          WeatherGPT never fabricates government warnings or simulates NWP outputs without explicit transparency.
          Real-time weather data is sourced live from Open-Meteo high-resolution APIs; official IMD API and HPC gridded models are documented with pluggable adapter interfaces.
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(statuses).map(([key, item]) => (
            <div
              key={key}
              className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-slate-100">{item.provider_name}</h3>
                  <p className="text-xs text-slate-300">{item.description}</p>
                </div>
                {getStatusBadge(item.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Data Format</span>
                  <span className="text-slate-200">{item.data_format}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Update Frequency</span>
                  <span className="text-slate-200">{item.update_frequency}</span>
                </div>
                <div className="col-span-2 mt-1">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Endpoint Specification</span>
                  <span className="text-sky-400 font-mono text-[11px] break-all">{item.api_endpoint || 'Local IPC / Shared HPC Mount'}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                <strong className="text-slate-300">Technical Note: </strong>
                {item.notes}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
