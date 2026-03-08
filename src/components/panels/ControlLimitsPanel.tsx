import React from 'react';

export const ControlLimitsPanel: React.FC = () => {
  return (
    <div className="h-full flex flex-col justify-between text-xs">
      <div className="space-y-2">
        <div className="flex justify-between items-center border-b border-cyan-500/20 pb-1">
          <span className="text-cyan-400">PP-AMFEWMA Limit</span>
          <span className="font-mono text-emerald-400">5.00</span>
        </div>
        <div className="flex justify-between items-center border-b border-cyan-500/20 pb-1">
          <span className="text-cyan-400">WSR-SRA Limit (d)</span>
          <span className="font-mono text-emerald-400">0.50</span>
        </div>
        <div className="flex justify-between items-center border-b border-cyan-500/20 pb-1">
          <span className="text-cyan-400">WSR-SRA Limit (h)</span>
          <span className="font-mono text-emerald-400">0.10</span>
        </div>
        <div className="flex justify-between items-center border-b border-cyan-500/20 pb-1">
          <span className="text-cyan-400">WSR-SRA Limit (u)</span>
          <span className="font-mono text-emerald-400">0.05</span>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-cyan-500/30">
        <div className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider">System Status</div>
        <div className="flex gap-2">
          <div className="flex-1 bg-emerald-500/20 border border-emerald-500/50 rounded p-1 text-center text-emerald-400">
            Normal
          </div>
          <div className="flex-1 bg-slate-800 border border-slate-700 rounded p-1 text-center text-slate-500">
            Warning
          </div>
          <div className="flex-1 bg-slate-800 border border-slate-700 rounded p-1 text-center text-slate-500">
            Critical
          </div>
        </div>
      </div>
    </div>
  );
};
