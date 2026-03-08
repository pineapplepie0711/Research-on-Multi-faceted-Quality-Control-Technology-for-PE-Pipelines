import React from 'react';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface RecommendationPanelProps {
  currentData: {
    d: number;
    h: number;
    u: number;
  } | null;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ currentData }) => {
  if (!currentData) return <div className="text-slate-500 text-center p-4">Waiting for data...</div>;

  const { d, h, u } = currentData;
  const recommendations: { type: 'warning' | 'success' | 'info', message: string, detail: string }[] = [];

  // Logic based on Image 2
  if (d > 110.2) {
    recommendations.push({
      type: 'warning',
      message: 'Decrease Vacuum / Negative Pressure',
      detail: 'Outer Diameter (d) is too large. Prioritize single variable adjustment.'
    });
  } else if (d < 109.8) {
    recommendations.push({
      type: 'warning',
      message: 'Increase Vacuum / Negative Pressure',
      detail: 'Outer Diameter (d) is too small. Prioritize single variable adjustment.'
    });
  }

  if (h > 10.05) {
    recommendations.push({
      type: 'warning',
      message: 'Increase Traction Speed',
      detail: 'Wall Thickness (h) is too thick. 10s later, slightly increase vacuum to compensate diameter.'
    });
  } else if (h < 9.95) {
    recommendations.push({
      type: 'warning',
      message: 'Decrease Traction Speed',
      detail: 'Wall Thickness (h) is too thin. 10s later, slightly decrease vacuum to compensate diameter.'
    });
  }

  if (u > 0.3) {
    recommendations.push({
      type: 'warning',
      message: 'Check Vacuum Stability',
      detail: 'Unroundness (u) is high. Alert: Clean Sizing Sleeve.'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success',
      message: 'System Stable',
      detail: 'All parameters are within control limits.'
    });
  }

  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
      <div className="space-y-3">
        {recommendations.map((rec, idx) => (
          <div key={idx} className={`p-3 rounded border-l-4 ${
            rec.type === 'warning' ? 'bg-amber-500/10 border-amber-500' : 
            rec.type === 'success' ? 'bg-emerald-500/10 border-emerald-500' : 
            'bg-blue-500/10 border-blue-500'
          }`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {rec.type === 'warning' ? <AlertCircle className="w-5 h-5 text-amber-500" /> : 
                 rec.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : 
                 <ArrowRight className="w-5 h-5 text-blue-500" />}
              </div>
              <div>
                <div className={`font-semibold text-sm ${
                  rec.type === 'warning' ? 'text-amber-400' : 
                  rec.type === 'success' ? 'text-emerald-400' : 
                  'text-blue-400'
                }`}>
                  {rec.message}
                </div>
                <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {rec.detail}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
