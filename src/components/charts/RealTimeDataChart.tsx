import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface RealTimeDataChartProps {
  data: any[];
}

const SingleChart = ({ data, dataKey, color, title, target, unit, domain }: { data: any[], dataKey: string, color: string, title: string, target?: number, unit: string, domain?: any[] }) => (
  <div className="flex-1 min-h-0 flex flex-col relative border-b border-cyan-500/10 last:border-0 pb-2 mb-2">
    <div className="absolute top-0 right-2 z-10 flex items-center gap-2">
       <span className="text-[10px] text-slate-400 uppercase tracking-wider">{title}</span>
       <span className="text-xs font-mono font-bold" style={{ color }}>
         {data.length > 0 ? data[data.length - 1][dataKey] : '-'} <span className="text-[10px] opacity-70">{unit}</span>
       </span>
    </div>
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 15, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="time" hide />
          <YAxis stroke={color} tick={{ fill: color, fontSize: 10 }} domain={domain || ['auto', 'auto']} width={45} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: color, color: '#cbd5e1', fontSize: '11px', padding: '4px' }}
            itemStyle={{ color: '#cbd5e1' }}
            labelStyle={{ display: 'none' }}
            formatter={(value: number) => [value, title]}
          />
          {target && <ReferenceLine y={target} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Target', fill: '#64748b', fontSize: 8, position: 'insideLeft' }} />}
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} animationDuration={500} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const RealTimeDataChart: React.FC<RealTimeDataChartProps> = ({ data }) => {
  return (
    <div className="w-full h-full flex flex-col">
      <SingleChart data={data} dataKey="d" color="#06b6d4" title="Diameter" target={160.5} unit="mm" domain={[(dataMin: number) => dataMin - 0.5, (dataMax: number) => dataMax + 0.5]} />
      <SingleChart data={data} dataKey="h" color="#10b981" title="Thickness" target={9.8} unit="mm" domain={[(dataMin: number) => dataMin - 0.1, (dataMax: number) => dataMax + 0.1]} />
      <SingleChart data={data} dataKey="u" color="#f43f5e" title="Unroundness" unit="mm" domain={[0, 'auto']} />
    </div>
  );
};
