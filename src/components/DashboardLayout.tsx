import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, className }) => {
  return (
    <div className={cn("min-h-screen bg-slate-950 text-cyan-50 p-4 font-sans overflow-hidden", className)}>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
        className="grid grid-cols-12 grid-rows-12 gap-4 h-[calc(100vh-2rem)]"
      >
        {children}
      </motion.div>
    </div>
  );
};

export const DashboardPanel: React.FC<{ children: React.ReactNode; title?: string; className?: string }> = ({ children, title, className }) => {
  return (
    <div className={cn("bg-slate-900/80 border border-cyan-500/30 rounded-lg p-2 relative overflow-hidden backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.1)] flex flex-col", className)}>
      {title && (
        <div className="flex items-center justify-between mb-1 border-b border-cyan-500/20 pb-1 shrink-0">
          <h3 className="text-cyan-400 font-semibold uppercase text-[10px] lg:text-xs flex items-center gap-1.5" title={title}>
            <span className="w-1 h-3 bg-cyan-500 rounded-sm inline-block flex-shrink-0"></span>
            <span className="leading-none">{title}</span>
          </h3>
          <div className="flex gap-1 flex-shrink-0">
            <span className="w-1 h-1 bg-cyan-500/50 rounded-full"></span>
            <span className="w-1 h-1 bg-cyan-500/50 rounded-full"></span>
            <span className="w-1 h-1 bg-cyan-500/50 rounded-full"></span>
          </div>
        </div>
      )}
      <div className="flex-1 w-full relative z-10 flex flex-col min-h-0">
        {children}
      </div>
      
      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-sm"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-sm"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-sm"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500/50 rounded-br-sm"></div>
    </div>
  );
};
