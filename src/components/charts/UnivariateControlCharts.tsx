import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface UnivariateControlChartsProps {
  data: any[];
}

const MiniChart = ({ data, dataKey, color, title }: { data: any[], dataKey: string, color: string, title: string }) => {
  const currentVal = data.length > 0 ? data[data.length - 1].wsrSra[dataKey] : 0;
  const limit = data.length > 0 ? data[data.length - 1].wsrSra.limit : 0.6; // Default fallback

  return (
    <div className="flex-1 min-h-0 flex flex-col border-b border-cyan-500/10 last:border-0 pb-1 mb-1 relative">
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-[10px] text-cyan-400/70 uppercase tracking-wider">{title}</span>
        <span className="text-[10px] font-mono font-bold" style={{ color }}>
          {currentVal !== undefined ? currentVal : '-'}
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="time" hide />
            {/* Symmetric domain around 0 based on limit */}
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: color, color: '#cbd5e1', fontSize: '10px', padding: '4px' }}
              itemStyle={{ color: '#cbd5e1' }}
              labelStyle={{ display: 'none' }}
              formatter={(value: any, name: string) => [value, name === `wsrSra.${dataKey}` ? 'Z-分数' : (name === 'wsrSra.limit' ? '控制上限' : '控制下限')]}
            />
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
            
            {/* Dynamic Control Limits (Step) */}
            <Line type="step" dataKey="wsrSra.limit" stroke="#f43f5e" strokeDasharray="3 3" dot={false} strokeWidth={1} isAnimationActive={false} />
            <Line type="step" dataKey={(d) => -d.wsrSra.limit} name="控制下限" stroke="#f43f5e" strokeDasharray="3 3" dot={false} strokeWidth={1} isAnimationActive={false} />
            
            {/* Main Z-Score Line */}
            <Line type="monotone" dataKey={`wsrSra.${dataKey}`} stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const UnivariateControlCharts: React.FC<UnivariateControlChartsProps> = ({ data }) => {
  return (
    <div className="w-full h-full flex flex-col">
      <MiniChart data={data} dataKey="z_d" color="#06b6d4" title="WSR-SRA-AEWMA (d)" />
      <MiniChart data={data} dataKey="z_h" color="#10b981" title="WSR-SRA-AEWMA (h)" />
      <MiniChart data={data} dataKey="z_u" color="#f43f5e" title="WSR-SRA-AEWMA (u)" />
    </div>
  );
};
