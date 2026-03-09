import React from 'react';
import { cn } from '@/lib/utils';

interface RiskIndicatorProps {
  dataPoint?: {
    d: number;
    h: number;
    u: number;
  };
}

// Gaussian Membership Function
const gaussian = (x: number, ex: number, en: number) => {
  return Math.exp(-Math.pow(x - ex, 2) / (2 * en * en));
};

// Asymmetric Gaussian Membership Function
const asymmetricGaussian = (x: number, ex: number, enL: number, enR: number) => {
  const en = x <= ex ? enL : enR;
  return Math.exp(-Math.pow(x - ex, 2) / (2 * en * en));
};

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({ dataPoint }) => {
  if (!dataPoint) return (
    <div className="flex items-center justify-center h-full text-xs text-slate-500">No Data</div>
  );

  const { d, h, u } = dataPoint;

  // --- 1. Calculate Membership Vectors for each indicator ---

  // d (Diameter) - Symmetric Cloud
  // V1 (Safe): Ex=160.5, En=0.15
  const d_v1 = gaussian(d, 160.5, 0.15);
  // V2 (Warning): Ex=160.2/160.8, En=0.15
  const d_v2 = Math.max(gaussian(d, 160.2, 0.15), gaussian(d, 160.8, 0.15));
  // V3 (Critical): Ex=160.05/160.95, En=0.10
  const d_v3 = Math.max(gaussian(d, 160.05, 0.10), gaussian(d, 160.95, 0.10));
  // V4 (Failure): <160.0 or >161.0. Modeled as "inverse" of others or explicit tails.
  const d_v4 = (d < 160.0 || d > 161.0) ? 1.0 : 0.0; 

  // h (Thickness) - Asymmetric Cloud
  // V1 (Safe): Ex=9.80, EnL=0.05, EnR=0.15
  const h_v1 = asymmetricGaussian(h, 9.80, 0.05, 0.15);
  // V2 (Warning): Ex=9.65/10.1, EnL=0.05, EnR=0.15
  const h_v2 = Math.max(asymmetricGaussian(h, 9.65, 0.05, 0.15), asymmetricGaussian(h, 10.1, 0.05, 0.15));
  // V3 (Critical): Ex=9.55/10.4, EnL=0.02, EnR=0.10
  const h_v3 = Math.max(asymmetricGaussian(h, 9.55, 0.02, 0.10), asymmetricGaussian(h, 10.4, 0.02, 0.10));
  // V4 (Failure): <9.50
  const h_v4 = h < 9.50 ? 1.0 : 0.0;

  // u (Unroundness) - Asymmetric Cloud (Half-bell)
  // V1 (Safe): Ex=0.00, EnL=0.80, EnR=0.80
  const u_v1 = asymmetricGaussian(u, 0.00, 0.80, 0.80);
  // V2 (Warning): Ex=1.50, EnL=0.50, EnR=0.50
  const u_v2 = asymmetricGaussian(u, 1.50, 0.50, 0.50);
  // V3 (Critical): Ex=2.80, EnL=0.30, EnR=0.30
  const u_v3 = asymmetricGaussian(u, 2.80, 0.30, 0.30);
  // V4 (Failure): >3.20
  const u_v4 = u > 3.20 ? 1.0 : 0.0;

  // --- 2. Aggregate Results (Average) ---
  // Assuming equal weights for simplicity as weights weren't specified
  let v1 = (d_v1 + h_v1 + u_v1) / 3;
  let v2 = (d_v2 + h_v2 + u_v2) / 3;
  let v3 = (d_v3 + h_v3 + u_v3) / 3;
  let v4 = (d_v4 + h_v4 + u_v4) / 3;

  // Normalize vector to sum to 1 for display purposes
  const sum = v1 + v2 + v3 + v4;
  if (sum > 0) {
    v1 /= sum;
    v2 /= sum;
    v3 /= sum;
    v4 /= sum;
  } else {
    // Fallback if all are 0 (e.g. in gaps), assign to nearest or V4
    v4 = 1.0; 
  }

  // Determine dominant risk
  const maxVal = Math.max(v1, v2, v3, v4);
  let finalRisk = '安全';
  let colorClass = 'text-emerald-400';
  
  if (v4 === maxVal) { finalRisk = '故障'; colorClass = 'text-red-600'; }
  else if (v3 === maxVal) { finalRisk = '严重'; colorClass = 'text-red-500'; }
  else if (v2 === maxVal) { finalRisk = '警告'; colorClass = 'text-yellow-400'; }

  return (
    <div className={cn("flex items-center justify-between p-2 w-full h-full gap-2")}>
      {/* Left side: V1-V4 horizontal bars */}
      <div className="flex flex-col gap-1.5 w-[55%]">
        <div className="flex items-center gap-2 text-[9px] font-mono">
          <span className="text-slate-400 w-3">V1</span>
          <div className="flex-1 h-1.5 bg-emerald-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${v1 * 100}%` }}></div>
          </div>
          <span className="text-emerald-400 w-6 text-right">{(v1 * 100).toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono">
          <span className="text-slate-400 w-3">V2</span>
          <div className="flex-1 h-1.5 bg-yellow-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: `${v2 * 100}%` }}></div>
          </div>
          <span className="text-yellow-400 w-6 text-right">{(v2 * 100).toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono">
          <span className="text-slate-400 w-3">V3</span>
          <div className="flex-1 h-1.5 bg-orange-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${v3 * 100}%` }}></div>
          </div>
          <span className="text-orange-400 w-6 text-right">{(v3 * 100).toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono">
          <span className="text-slate-400 w-3">V4</span>
          <div className="flex-1 h-1.5 bg-red-600/20 rounded-full overflow-hidden">
            <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${v4 * 100}%` }}></div>
          </div>
          <span className="text-red-500 w-6 text-right">{(v4 * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Right side: Final Risk */}
      <div className="flex flex-col items-center justify-center w-[45%]">
        <div className={`text-2xl lg:text-3xl font-bold tracking-tighter ${colorClass}`}>
          {finalRisk.toUpperCase()}
        </div>
        <div className="text-[8px] uppercase opacity-80 font-semibold text-center leading-tight mt-1 text-slate-400">
          VW-GCM 评估
        </div>
      </div>
    </div>
  );
};
