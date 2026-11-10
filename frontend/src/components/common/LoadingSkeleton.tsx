import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="space-y-4 animate-pulse p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50">
      <div className="h-8 bg-slate-700/60 rounded-xl w-1/3"></div>
      <div className="h-20 bg-slate-700/40 rounded-xl w-full"></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-700/30 rounded-xl"></div>
        ))}
      </div>
    </div>
  );
};
