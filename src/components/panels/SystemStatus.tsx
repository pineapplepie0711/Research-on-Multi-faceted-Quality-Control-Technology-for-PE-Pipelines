import React from 'react';
import { Activity, Server, Database, Wifi } from 'lucide-react';

export const SystemStatus: React.FC = () => {
  const logs = [
    { time: '12:30:00', msg: '挤出机1温度正常', type: 'info' },
    { time: '12:30:05', msg: '真空泵压力稳定', type: 'info' },
    { time: '12:30:12', msg: '牵引速度已调整', type: 'warning' },
    { time: '12:30:18', msg: '数据同步完成', type: 'success' },
  ];

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="grid grid-cols-4 gap-2 mb-2">
        <div className="bg-slate-800/50 p-2 rounded flex flex-col items-center justify-center border border-slate-700">
          <Server className="w-4 h-4 text-cyan-400 mb-1" />
          <span className="text-[10px] text-slate-400">服务器</span>
          <span className="text-[10px] text-emerald-400">在线</span>
        </div>
        <div className="bg-slate-800/50 p-2 rounded flex flex-col items-center justify-center border border-slate-700">
          <Database className="w-4 h-4 text-purple-400 mb-1" />
          <span className="text-[10px] text-slate-400">数据库</span>
          <span className="text-[10px] text-emerald-400">已连接</span>
        </div>
        <div className="bg-slate-800/50 p-2 rounded flex flex-col items-center justify-center border border-slate-700">
          <Wifi className="w-4 h-4 text-blue-400 mb-1" />
          <span className="text-[10px] text-slate-400">网络</span>
          <span className="text-[10px] text-emerald-400">5ms</span>
        </div>
        <div className="bg-slate-800/50 p-2 rounded flex flex-col items-center justify-center border border-slate-700">
          <Activity className="w-4 h-4 text-rose-400 mb-1" />
          <span className="text-[10px] text-slate-400">负载</span>
          <span className="text-[10px] text-emerald-400">12%</span>
        </div>
      </div>
      
      <div className="flex-1 bg-black/20 rounded p-2 overflow-hidden font-mono text-[10px]">
        {logs.map((log, i) => (
          <div key={i} className="mb-1 flex gap-2">
            <span className="text-slate-500">[{log.time}]</span>
            <span className={
              log.type === 'warning' ? 'text-amber-400' :
              log.type === 'success' ? 'text-emerald-400' :
              'text-cyan-100'
            }>{log.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
