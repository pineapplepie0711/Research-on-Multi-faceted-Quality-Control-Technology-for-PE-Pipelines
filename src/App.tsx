import React, { useState, useEffect } from 'react';
import { DashboardLayout, DashboardPanel } from '@/components/DashboardLayout';
import { RealTimeDataChart } from '@/components/charts/RealTimeDataChart';
import { MultivariateControlChart } from '@/components/charts/MultivariateControlChart';
import { UnivariateControlCharts } from '@/components/charts/UnivariateControlCharts';
import { PredictionChart } from '@/components/charts/PredictionChart';
import { RiskIndicator } from '@/components/panels/RiskIndicator';
import { ControlLimitsPanel } from '@/components/panels/ControlLimitsPanel';
import { RecommendationPanel } from '@/components/panels/RecommendationPanel';
import { SystemStatus } from '@/components/panels/SystemStatus';
import { usePipelineData } from '@/hooks/usePipelineData';
import { Clock, Activity, Settings, AlertTriangle } from 'lucide-react';

export default function App() {
  const { data, currentRisk } = usePipelineData();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentDataPoint = data.length > 0 ? data[data.length - 1] : null;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="col-span-12 row-span-1 flex items-center justify-between bg-slate-900/50 border-b border-cyan-500/30 px-6 py-2 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
          <h1 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 uppercase">
            燃气PE管道多变量质量控制平台
          </h1>
        </div>
        <div className="flex items-center gap-6 text-cyan-100/80 font-mono text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            系统在线
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Left Column */}
      <div className="col-span-3 row-span-11 grid grid-rows-12 gap-4">
        {/* PP-AMFEWMA Control Chart */}
        <DashboardPanel title="PP-AMFEWMA" className="row-span-4">
          <MultivariateControlChart data={data} />
        </DashboardPanel>

        {/* WSR-SRA-AEWMA Control Chart */}
        <DashboardPanel title="WSR-SRA-AEWMA" className="row-span-4">
          <UnivariateControlCharts data={data} />
        </DashboardPanel>

        {/* MTCN-DQN-Transformer Prediction */}
        <DashboardPanel title="MTCN-DQN-Transformer" className="row-span-4">
          <PredictionChart data={data} />
        </DashboardPanel>
      </div>

      {/* Middle Column */}
      <div className="col-span-6 row-span-11 grid grid-rows-12 gap-4">
        {/* Top Indicators */}
        <div className="row-span-2 grid grid-cols-3 gap-4">
          <DashboardPanel title="VW-GCM" className="col-span-1 flex items-center justify-center bg-slate-900/90 p-1">
             <RiskIndicator dataPoint={currentDataPoint ? { d: currentDataPoint.d, h: currentDataPoint.h, u: currentDataPoint.u } : undefined} />
          </DashboardPanel>
          <DashboardPanel title="生产数量" className="col-span-1 flex flex-col items-center justify-center">
             <div className="text-lg lg:text-xl font-mono text-cyan-400 font-bold">1,284</div>
             <div className="text-[8px] lg:text-[10px] text-slate-400 uppercase tracking-wider mt-1">管道产量</div>
          </DashboardPanel>
          <DashboardPanel title="运行时间" className="col-span-1 flex flex-col items-center justify-center">
             <div className="text-lg lg:text-xl font-mono text-blue-400 font-bold">48h</div>
             <div className="text-[8px] lg:text-[10px] text-slate-400 uppercase tracking-wider mt-1">连续运行</div>
          </DashboardPanel>
        </div>

        {/* Main Real-time Data Chart */}
        <DashboardPanel title="实时数据采集 (d, h, u)" className="row-span-10 relative">
          <div className="absolute top-4 right-4 flex gap-4 text-xs z-20">
             <div className="flex items-center gap-1"><span className="w-3 h-1 bg-cyan-500"></span> 外径</div>
             <div className="flex items-center gap-1"><span className="w-3 h-1 bg-emerald-500"></span> 壁厚</div>
             <div className="flex items-center gap-1"><span className="w-3 h-1 bg-rose-500"></span> 不圆度</div>
          </div>
          <RealTimeDataChart data={data} />
          
          {/* Map Overlay Effect (Optional decorative background) */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-900/0 to-slate-900/0"></div>
        </DashboardPanel>
      </div>

      {/* Right Column */}
      <div className="col-span-3 row-span-11 grid grid-rows-12 gap-4">
        {/* Real-time Control Limits */}
        <DashboardPanel title="实时控制限" className="row-span-3">
          <ControlLimitsPanel data={data} />
        </DashboardPanel>

        {/* Recommended Instructions */}
        <DashboardPanel title="推荐指令" className="row-span-5">
          <RecommendationPanel currentData={currentDataPoint ? { d: currentDataPoint.d, h: currentDataPoint.h, u: currentDataPoint.u } : null} />
        </DashboardPanel>

        {/* System Status / Equipment Alarm */}
        <DashboardPanel title="设备报警信息" className="row-span-4">
          <SystemStatus />
        </DashboardPanel>
      </div>
    </DashboardLayout>
  );
}
