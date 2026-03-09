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
  // Target: 160.38175, Sigma: 0.06193
  const d_v1 = gaussian(d, 160.38, 0.12);
  const d_v2 = Math.max(gaussian(d, 160.20, 0.12), gaussian(d, 160.56, 0.12));
  const d_v3 = Math.max(gaussian(d, 160.08, 0.09), gaussian(d, 160.68, 0.09));
  const d_v4 = (d < 160.02 || d > 160.74) ? 1.0 : 0.0; 

  // h (Thickness) - Asymmetric Cloud
  // Target: 9.95013, Sigma: 0.05048
  const h_v1 = asymmetricGaussian(h, 9.95, 0.05, 0.10);
  const h_v2 = Math.max(asymmetricGaussian(h, 9.80, 0.05, 0.10), asymmetricGaussian(h, 10.10, 0.05, 0.10));
  const h_v3 = Math.max(asymmetricGaussian(h, 9.70, 0.02, 0.08), asymmetricGaussian(h, 10.20, 0.02, 0.08));
  const h_v4 = (h < 9.65 || h > 10.25) ? 1.0 : 0.0;

  // u (Unroundness) - Asymmetric Cloud
  // Target: 0.30618, Sigma: 0.00154
  const u_v1 = asymmetricGaussian(u, 0.306, 0.003, 0.003);
  const u_v2 = asymmetricGaussian(u, 0.310, 0.002, 0.002);
  const u_v3 = asymmetricGaussian(u, 0.315, 0.001, 0.001);
  const u_v4 = u > 0.318 ? 1.0 : 0.0;

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
