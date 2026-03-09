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
  if (!currentData) return <div className="text-slate-500 text-center p-4">等待数据...</div>;

  const { d, h, u } = currentData;
  const recommendations: { type: 'warning' | 'success' | 'info', message: string, detail: string }[] = [];

  // Logic based on Image 2
  if (d > 110.2) {
    recommendations.push({
      type: 'warning',
      message: '降低真空/负压',
      detail: '外径 (d) 过大。优先进行单变量调整。'
    });
  } else if (d < 109.8) {
    recommendations.push({
      type: 'warning',
      message: '增加真空/负压',
      detail: '外径 (d) 过小。优先进行单变量调整。'
    });
  }

  if (h > 10.05) {
    recommendations.push({
      type: 'warning',
      message: '增加牵引速度',
      detail: '壁厚 (h) 过厚。10秒后，稍微增加真空以外径补偿。'
    });
  } else if (h < 9.95) {
    recommendations.push({
      type: 'warning',
      message: '降低牵引速度',
      detail: '壁厚 (h) 过薄。10秒后，稍微降低真空以外径补偿。'
    });
  }

  if (u > 0.3) {
    recommendations.push({
      type: 'warning',
      message: '检查真空稳定性',
      detail: '不圆度 (u) 过高。警报：清洁定径套。'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success',
      message: '系统稳定',
      detail: '所有参数均在控制限内。'
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
