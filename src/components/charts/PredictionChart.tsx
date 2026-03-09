import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

interface PredictionChartProps {
  data: any[];
}

type MetricType = 'd' | 'h' | 'u';

export const PredictionChart: React.FC<PredictionChartProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('d');

  const metricLabels = {
    d: '外径',
    h: '壁厚',
    u: '不圆度'
  };

  const metricColors = {
    d: '#06b6d4', // Cyan
    h: '#10b981', // Emerald
    u: '#f43f5e'  // Rose
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Controls */}
      <div className="absolute top-0 right-0 z-20 flex gap-1">
        {(['d', 'h', 'u'] as MetricType[]).map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMetric(m)}
            className={`px-2 py-0.5 text-[9px] font-mono rounded border transition-colors cursor-pointer ${
              selectedMetric === m
                ? 'bg-slate-700 border-slate-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-1">
        {/* Top Chart: Fusion Visualization */}
      <div className="flex-1 min-h-[120px] relative shrink-0">
        <div className="absolute top-0 left-0 text-[10px] text-slate-400 font-mono z-10">
          融合过程 ({metricLabels[selectedMetric]})
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis domain={['auto', 'auto']} hide />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6', color: '#cbd5e1', fontSize: '10px' }}
              labelStyle={{ display: 'none' }}
            />
            <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '5px' }} iconSize={8} />
            
            {/* Components */}
            <Line 
              type="monotone" 
              dataKey={`mtcn.${selectedMetric}`} 
              name="局部 (MTCN)" 
              stroke="#64748b" 
              strokeWidth={1} 
              dot={false} 
              strokeOpacity={0.5} 
            />
            <Line 
              type="monotone" 
              dataKey={`transformer.${selectedMetric}`} 
              name="全局 (Trans)" 
              stroke="#f59e0b" 
              strokeWidth={1} 
              dot={false} 
              strokeOpacity={0.8} 
            />
            
            {/* Result */}
            <Line 
              type="monotone" 
              dataKey={`fusedPrediction.${selectedMetric}`} 
              name="融合 (DQN)" 
              stroke="#3b82f6" 
              strokeWidth={2} 
              dot={false} 
            />
            
            {/* Actual (Target/Raw) */}
            <Line 
              type="monotone" 
              dataKey={selectedMetric} 
              name="实际值" 
              stroke={metricColors[selectedMetric]} 
              strokeWidth={1} 
              dot={{r:1}} 
              strokeOpacity={0.6} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Chart: DQN Weight Lambda */}
      <div className="h-[100px] relative border-t border-slate-800 pt-1 shrink-0">
        <div className="absolute top-1 left-0 text-[10px] text-slate-400 font-mono z-10">
          DQN 权重 λ ({metricLabels[selectedMetric]})
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 15, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis domain={[0, 1]} hide />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#8b5cf6', color: '#cbd5e1', fontSize: '10px' }}
              labelStyle={{ display: 'none' }}
              formatter={(value: number) => [value.toFixed(3), 'λ (权重)']}
            />
            <Area 
              type="step" 
              dataKey={`dqnWeights.${selectedMetric}`} 
              stroke="#8b5cf6" 
              fill="#8b5cf6" 
              fillOpacity={0.2} 
              strokeWidth={1.5} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      </div>
    </div>
  );
};
