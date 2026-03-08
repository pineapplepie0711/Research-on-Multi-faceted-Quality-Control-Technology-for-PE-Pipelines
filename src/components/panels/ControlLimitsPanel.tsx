import React from 'react';
import { PipelineData } from '@/hooks/usePipelineData';

interface ControlLimitsPanelProps {
  data: PipelineData[];
}

export const ControlLimitsPanel: React.FC<ControlLimitsPanelProps> = ({ data }) => {
  const latest = data.length > 0 ? data[data.length - 1] : null;

  // Default values if no data
  const ppLimit = latest ? latest.ucl.toFixed(2) : '5.00';
  
  // WSR Limit is the same for all in this implementation (nonparametric)
  const wsrLimit = latest ? latest.wsrSra.limit.toFixed(2) : '0.60';

  const riskLevel = latest ? latest.riskLevel : 'Low';

  return (
    <div className="h-full flex flex-col justify-between text-xs">
      <div className="space-y-2">
        <div className="flex justify-between items-center border-b border-cyan-500/20 pb-1">
          <span className="text-cyan-400">PP-AMFEWMA Limit</span>
          <span className="font-mono text-emerald-400">{ppLimit}</span>
        </div>
        <div className="flex justify-between items-center border-b border-cyan-500/20 pb-1">
          <span className="text-cyan-400">WSR-SRA Limit (d)</span>
          <span className="font-mono text-emerald-400">{wsrLimit}</span>
        </div>
        <div className="flex justify-between items-center border-b border-cyan-500/20 pb-1">
          <span className="text-cyan-400">WSR-SRA Limit (h)</span>
          <span className="font-mono text-emerald-400">{wsrLimit}</span>
        </div>
        <div className="flex justify-between items-center border-b border-cyan-500/20 pb-1">
          <span className="text-cyan-400">WSR-SRA Limit (u)</span>
          <span className="font-mono text-emerald-400">{wsrLimit}</span>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-cyan-500/30">
        <div className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider">System Status</div>
        <div className="flex gap-2">
          <div className={`flex-1 border rounded p-1 text-center transition-colors ${
            riskLevel === 'Low' 
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
              : 'bg-slate-800 border-slate-700 text-slate-500'
          }`}>
            Normal
          </div>
          <div className={`flex-1 border rounded p-1 text-center transition-colors ${
            riskLevel === 'Medium' 
              ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' 
              : 'bg-slate-800 border-slate-700 text-slate-500'
          }`}>
            Warning
          </div>
          <div className={`flex-1 border rounded p-1 text-center transition-colors ${
            riskLevel === 'High' 
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' 
              : 'bg-slate-800 border-slate-700 text-slate-500'
          }`}>
            Critical
          </div>
        </div>
      </div>
    </div>
  );
};
