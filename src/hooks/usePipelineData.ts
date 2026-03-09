import { useState, useEffect, useRef } from 'react';

export interface PipelineData {
  time: string;
  d: number; // Diameter
  h: number; // Thickness
  u: number; // Unroundness
  
  riskLevel: 'Low' | 'Medium' | 'High';

  // PP-AMFEWMA specific (Multivariate)
  ppAmfewma: number; // Final statistic H_n
  ucl: number; // Dynamic Control Limit
  
  // WSR-SRA-AEWMA specific (Univariate)
  wsrSra: {
    z_d: number;
    z_h: number;
    z_u: number;
    limit: number;
  };

  // MTCN-DQN-Transformer specific
  mtcn: { d: number; h: number; u: number }; // Local high-freq features (Module a)
  transformer: { d: number; h: number; u: number }; // Global trend features (Module b)
  dqnWeights: { d: number; h: number; u: number }; // Adaptive weights lambda (Module c)
  fusedPrediction: { d: number; h: number; u: number }; // Final prediction (Module d input)

  prediction: {
    d: number;
    h: number;
    u: number;
  }[]; // Future predictions (General)
}

const TARGETS = { d: 160.38175, h: 9.95013, u: 0.30618 };
const SIGMA = { d: 0.06193, h: 0.05048, u: 0.00154 };

// Helper for normal distribution
function randn_bm() {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

// PP-AMFEWMA Constants
const LAMBDA = 0.2; // Base smoothing
const C_FACTOR = 3; // Adaptive threshold factor (k*sigma)
const GAMMA = 0.8; // Prediction confidence factor
const H0 = 12; // Base control limit
const ALPHA = 3; // Gain adjustment for dynamic limit
const K_TH = 0.5; // Slope threshold
const TAU = 0.2; // Smoothing factor for limit transition

// WSR-SRA-AEWMA Constants
const N = 20; // Window size
const ETA = 0.2; // Smoothing factor
const L = 3; // Control limit width
// Calculate Variance of Rank Statistic I
// Var(I) = (N+1)(2N+1) / (6N^2)
const VAR_I = ((N + 1) * (2 * N + 1)) / (6 * N * N);
// Calculate Control Limit for Z
// Limit = L * sqrt( (eta / (2-eta)) * Var(I) )
const WSR_LIMIT = L * Math.sqrt((ETA / (2 - ETA)) * VAR_I);

export const usePipelineData = () => {
  const [data, setData] = useState<PipelineData[]>([]);
  const [currentRisk, setCurrentRisk] = useState<'Low' | 'Medium' | 'High'>('Low');
  
  // Refs for simulation state to persist across renders
  const stateRef = useRef({
    timeIndex: 0,
    // PP-AMFEWMA State
    prevY: { d: TARGETS.d, h: TARGETS.h, u: TARGETS.u }, // Previous smoothed values
    prevH: 0, // Previous H statistic
    historyH: [] as number[], // History for slope calculation
    
    // WSR-SRA-AEWMA State
    historyD: [] as number[],
    historyH_WSR: [] as number[], // Renamed to avoid conflict with historyH
    historyU: [] as number[],
    prevZ_WSR: { d: 0, h: 0, u: 0 },
    sraSegment: { id: 0, adjustment: 1.0 }, // SRA Segment state

    // MTCN-DQN-Transformer State
    transformerState: { d: TARGETS.d, h: TARGETS.h, u: TARGETS.u }, // Simple EMA for global trend
    recentVolatility: { d: [] as number[], h: [] as number[], u: [] as number[] }, // For DQN input
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const state = stateRef.current;
      const { timeIndex } = state;
      
      // 1. Generate Raw Data (X_n)
      // Simulate some process drift and noise using normal distribution
      const noiseD = randn_bm() * SIGMA.d;
      const noiseH = randn_bm() * SIGMA.h;
      const noiseU = randn_bm() * SIGMA.u;
      
      // Add occasional drift/anomaly
      const drift = timeIndex > 50 && timeIndex < 80 ? (timeIndex - 50) * (SIGMA.h * 0.1) : 0;
      
      const rawD = TARGETS.d + noiseD + (timeIndex > 100 ? SIGMA.d * 3 : 0); // 3-sigma step shift at t=100
      const rawH = TARGETS.h + noiseH + drift;
      const rawU = TARGETS.u + noiseU;

      // --- PP-AMFEWMA Logic ---

      // 2. Adaptive Smoothing (AMFEWMA) -> Y_n
      const calcWeight = (val: number, target: number, sigma: number) => {
        const error = Math.abs(val - target);
        const threshold = C_FACTOR * sigma;
        if (error <= threshold) {
          return LAMBDA; 
        } else {
          return Math.min(0.9, LAMBDA + (error - threshold) / threshold);
        }
      };

      const w_d = calcWeight(rawD, TARGETS.d, SIGMA.d);
      const w_h = calcWeight(rawH, TARGETS.h, SIGMA.h);
      const w_u = calcWeight(rawU, TARGETS.u, SIGMA.u);

      const Y = {
        d: (1 - w_d) * state.prevY.d + w_d * rawD,
        h: (1 - w_h) * state.prevY.h + w_h * rawH,
        u: (1 - w_u) * state.prevY.u + w_u * rawU,
      };

      // 3. Prediction & Proactive Statistic -> Z_n (Proactive)
      const trend_d = Y.d - state.prevY.d;
      const trend_h = Y.h - state.prevY.h;
      const trend_u = Y.u - state.prevY.u;

      const pred_err_d = trend_d * 2;
      const pred_err_h = trend_h * 2;
      const pred_err_u = trend_u * 2;

      const Z_Proactive = {
        d: Y.d + GAMMA * pred_err_d,
        h: Y.h + GAMMA * pred_err_h,
        u: Y.u + GAMMA * pred_err_u,
      };

      // 4. Final Monitoring Statistic H_n
      const std_d = (Z_Proactive.d - TARGETS.d) / SIGMA.d;
      const std_h = (Z_Proactive.h - TARGETS.h) / SIGMA.h;
      const std_u = (Z_Proactive.u - TARGETS.u) / SIGMA.u;

      const H = std_d * std_d + std_h * std_h + std_u * std_u;

      // 5. Dynamic Control Limit (SDT based) -> UCL_n
      const newHistoryH = [...state.historyH, H].slice(-5);
      let slope = 0;
      if (newHistoryH.length >= 2) {
        slope = Math.abs(newHistoryH[newHistoryH.length - 1] - newHistoryH[0]) / newHistoryH.length;
      }

      const dynamicFactor = 1 + ALPHA * (1 / (1 + Math.exp(-(slope - K_TH) / TAU)));
      const UCL = H0 * dynamicFactor;

      // --- WSR-SRA-AEWMA Logic ---
      
      // Safety check for HMR/Hot Reloading: Ensure sraSegment exists
      if (!state.sraSegment) {
        state.sraSegment = { id: 0, adjustment: 1.0 };
      }

      // Simulate SRA (Segmented Regression Analysis) Segment Change
      // The control limit adjusts based on the detected segment's characteristics (e.g., noise level)
      if (timeIndex % 30 === 0 && timeIndex > 0) {
         state.sraSegment.id++;
         // Simulate varying limit width based on segment stability
         // In a real SRA, this would be derived from the residual variance of the current segment
         state.sraSegment.adjustment = 0.8 + Math.random() * 0.5; // 0.8 to 1.3
      }
      
      // Smooth transition for the limit (optional, but looks better)
      // We'll just use the step change for now to make "segmentation" obvious, 
      // or maybe add a small jitter to look "alive"
      const currentSraAdjustment = state.sraSegment.adjustment + (Math.random() * 0.05 - 0.025);
      const dynamicWSRLimit = WSR_LIMIT * currentSraAdjustment;

      const calculateWSR = (currentVal: number, target: number, history: number[], lastZVal: number) => {
        const deviation = currentVal - target;
        const newHistory = [...history, deviation].slice(-N);
        
        const absDev = Math.abs(deviation);
        const absHistory = newHistory.map(d => Math.abs(d));
        const sortedAbs = [...absHistory].sort((a, b) => a - b);
        const rank = sortedAbs.findIndex(v => v >= absDev) + 1;

        const sign = deviation >= 0 ? 1 : -1;
        const I = (sign * rank) / N;
        const Z = ETA * I + (1 - ETA) * lastZVal;
        
        return { Z, newHistory };
      };

      const wsrD = calculateWSR(rawD, TARGETS.d, state.historyD, state.prevZ_WSR.d);
      const wsrH = calculateWSR(rawH, TARGETS.h, state.historyH_WSR, state.prevZ_WSR.h);
      const wsrU = calculateWSR(rawU, TARGETS.u, state.historyU, state.prevZ_WSR.u);

      // --- MTCN-DQN-Transformer Logic ---
      
      // 1. Module (a) MA-MTCN (Local Features)
      // Simulate TCN capturing high-frequency local details (raw + slight lookahead/noise)
      const mtcn = {
        d: rawD + (Math.random() - 0.5) * 0.1,
        h: rawH + (Math.random() - 0.5) * 0.05,
        u: rawU + (Math.random() - 0.5) * 0.02,
      };

      // 2. Module (b) Transformer (Global Features)
      // Simulate Transformer capturing long-term trend (Smoothed EMA)
      const alphaTrans = 0.05; // Slow learning rate for global trend
      const transformer = {
        d: (1 - alphaTrans) * state.transformerState.d + alphaTrans * rawD,
        h: (1 - alphaTrans) * state.transformerState.h + alphaTrans * rawH,
        u: (1 - alphaTrans) * state.transformerState.u + alphaTrans * rawU,
      };

      // 3. Module (c) DQN Agent (Adaptive Weights)
      // Simulate DQN deciding weights based on volatility (state S_t)
      // If volatility is high, trust Local (MTCN). If low, trust Global (Transformer).
      const updateVolatility = (hist: number[], val: number) => {
        const newHist = [...hist, val].slice(-10);
        if (newHist.length < 2) return { vol: 0, hist: newHist };
        const mean = newHist.reduce((a, b) => a + b, 0) / newHist.length;
        const variance = newHist.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / newHist.length;
        return { vol: Math.sqrt(variance), hist: newHist };
      };

      const volD = updateVolatility(state.recentVolatility.d, rawD);
      const volH = updateVolatility(state.recentVolatility.h, rawH);
      const volU = updateVolatility(state.recentVolatility.u, rawU);

      // Map volatility to Lambda (0 to 1). Higher vol -> Higher Lambda (Trust Local)
      // Sigmoid mapping
      const getLambda = (vol: number, sensitivity: number) => {
        return 1 / (1 + Math.exp(-(vol - sensitivity) * 10));
      };

      const dqnWeights = {
        d: getLambda(volD.vol, 0.2),
        h: getLambda(volH.vol, 0.05),
        u: getLambda(volU.vol, 0.02),
      };

      // 4. Fusion (Eq 3-4)
      const fusedPrediction = {
        d: dqnWeights.d * mtcn.d + (1 - dqnWeights.d) * transformer.d,
        h: dqnWeights.h * mtcn.h + (1 - dqnWeights.h) * transformer.h,
        u: dqnWeights.u * mtcn.u + (1 - dqnWeights.u) * transformer.u,
      };


      // --- Risk Assessment ---
      let risk: 'Low' | 'Medium' | 'High' = 'Low';
      if (H > UCL) risk = 'High';
      else if (H > UCL * 0.8) risk = 'Medium';
      setCurrentRisk(risk);

      // --- Update State ---
      stateRef.current = {
        timeIndex: timeIndex + 1,
        // PP-AMFEWMA
        prevY: Y,
        prevH: H,
        historyH: newHistoryH,
        // WSR-SRA-AEWMA
        historyD: wsrD.newHistory,
        historyH_WSR: wsrH.newHistory,
        historyU: wsrU.newHistory,
        prevZ_WSR: { d: wsrD.Z, h: wsrH.Z, u: wsrU.Z },
        sraSegment: state.sraSegment, // Persist SRA segment state
        // MTCN-DQN-Transformer
        transformerState: transformer,
        recentVolatility: { d: volD.hist, h: volH.hist, u: volU.hist },
      };

      const newDataPoint: PipelineData = {
        time: new Date().toLocaleTimeString(),
        d: Number(rawD.toFixed(4)),
        h: Number(rawH.toFixed(4)),
        u: Number(rawU.toFixed(5)),
        riskLevel: risk,
        
        // PP-AMFEWMA
        ppAmfewma: Number(H.toFixed(2)),
        ucl: Number(UCL.toFixed(2)),
        
        // WSR-SRA-AEWMA
        wsrSra: {
          z_d: Number(wsrD.Z.toFixed(4)),
          z_h: Number(wsrH.Z.toFixed(4)),
          z_u: Number(wsrU.Z.toFixed(5)),
          limit: Number(dynamicWSRLimit.toFixed(4)),
        },

        // MTCN-DQN-Transformer
        mtcn: {
          d: Number(mtcn.d.toFixed(4)),
          h: Number(mtcn.h.toFixed(4)),
          u: Number(mtcn.u.toFixed(5)),
        },
        transformer: {
          d: Number(transformer.d.toFixed(4)),
          h: Number(transformer.h.toFixed(4)),
          u: Number(transformer.u.toFixed(5)),
        },
        dqnWeights: {
          d: Number(dqnWeights.d.toFixed(2)),
          h: Number(dqnWeights.h.toFixed(2)),
          u: Number(dqnWeights.u.toFixed(2)),
        },
        fusedPrediction: {
          d: Number(fusedPrediction.d.toFixed(4)),
          h: Number(fusedPrediction.h.toFixed(4)),
          u: Number(fusedPrediction.u.toFixed(5)),
        },

        prediction: [
            { d: Z_Proactive.d + trend_d, h: Z_Proactive.h + trend_h, u: Z_Proactive.u + trend_u },
            { d: Z_Proactive.d + trend_d*2, h: Z_Proactive.h + trend_h*2, u: Z_Proactive.u + trend_u*2 }
        ]
      };

      setData(prev => [...prev.slice(-49), newDataPoint]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { data, currentRisk };
};
