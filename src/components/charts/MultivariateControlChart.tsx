import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell, Line } from 'recharts';

interface MultivariateControlChartProps {
  data: any[];
}

export const MultivariateControlChart: React.FC<MultivariateControlChartProps> = ({ data }) => {
  const lastPoint = data.length > 0 ? data[data.length - 1] : null;
  
  // Calculate contributions for the last point
  const contributions = lastPoint ? [
    { name: 'd', value: Math.abs(lastPoint.d - 160.5) },
    { name: 'h', value: Math.abs(lastPoint.h - 9.8) * 5 },
    { name: 'u', value: lastPoint.u * 10 }
  ] : [];

  // Calculate histogram
  const values = data.map(d => d.ppAmfewma);
  const min = 0;
  const max = Math.max(...values, 8);
  const binCount = 8;
  const binSize = (max - min) / binCount;
  const histogramData = Array.from({ length: binCount }).map((_, i) => {
    const binStart = min + i * binSize;
    const binEnd = binStart + binSize;
    const count = values.filter(v => v >= binStart && v < binEnd).length;
    return { name: binStart.toFixed(0), count };
  });

  return (
    <div className="w-full h-full flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-1">
      {/* Figure 7: Main Trend */}
      <div className="flex-[2] min-h-[120px] relative border-b border-cyan-500/20 pb-1 shrink-0">
        <div className="absolute top-0 left-0 text-[8px] text-cyan-400/50 z-10">趋势</div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPpAmfewma" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis stroke="#8b5cf6" tick={{ fill: '#8b5cf6', fontSize: 8 }} />
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#8b5cf6', fontSize: '10px' }} />
            <Line type="step" dataKey="ucl" stroke="#f43f5e" strokeDasharray="3 3" dot={false} strokeWidth={1.5} />
            <Area type="monotone" dataKey="ppAmfewma" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPpAmfewma)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 min-h-[80px] flex gap-2 shrink-0">
        {/* Figure 8: Distribution */}
        <div className="flex-1 min-h-0 relative border-r border-cyan-500/20 pr-1">
           <div className="absolute top-0 left-0 text-[8px] text-cyan-400/50 z-10">分布</div>
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={histogramData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
               <XAxis dataKey="name" tick={{ fontSize: 8 }} interval={1} />
               <YAxis tick={{ fontSize: 8 }} />
               <Bar dataKey="count" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
             </BarChart>
           </ResponsiveContainer>
        </div>

        {/* Figure 9: Contribution */}
        <div className="flex-1 min-h-0 relative">
           <div className="absolute top-0 left-0 text-[8px] text-cyan-400/50 z-10">贡献</div>
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={contributions} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
               <XAxis type="number" hide />
               <YAxis dataKey="name" type="category" width={15} tick={{ fontSize: 8 }} />
               <Bar dataKey="value" radius={[0, 2, 2, 0]}>
                 {contributions.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={index === 0 ? '#06b6d4' : index === 1 ? '#10b981' : '#f43f5e'} />
                 ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
