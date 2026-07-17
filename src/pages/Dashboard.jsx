import React, { useState, useEffect } from 'react';
import { Badge } from '../components/common/Badge';
import { TelemetryChartPanel } from '../components/dashboard/charts/TelemetryChartPanel';
import { IntelSection } from '../components/dashboard/IntelSection';
import { ExecutiveBriefingModal } from '../components/dashboard/ExecutiveBriefingModal';
import { isAiMode } from '../services/geminiService'; 
import { recommendationEngine } from '../utils/recommendationEngine';
import { KPISection } from '../components/dashboard/kpi/KPISection';
import { RecommendationPanel } from '../components/dashboard/ai/RecommendationPanel';
import { StatusTerminal } from '../components/dashboard/terminal/StatusTerminal';
import { useTerminalLogger } from '../hooks/useTerminalLogger';
import { useAiRecommendations } from '../hooks/useAiRecommendations';
import { useTelemetry } from '../hooks/useTelemetry';
import { useDemoScript } from '../hooks/useDemoScript';
import { DiagnosticsPanel } from '../components/dashboard/diagnostics/DiagnosticsPanel';

export const Dashboard = () => {
  const { timelineEvents } = useTerminalLogger();
  const { recommendations, resolvingId, rejectingId, explainRec, setExplainRec, handleApprove, handleReject } = useAiRecommendations();
  const { activeSnapshot, datasetName, lastUpdateTime, occupancyPercentage, totalOccupancy } = useTelemetry();
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [justFinishedProcessing, setJustFinishedProcessing] = useState(false);
  const { runOneClickDemo, demoRunning } = useDemoScript(setIsAiProcessing);

  useEffect(() => {
    const handleUpdate = () => {
      const triggerLoading = localStorage.getItem('stadiumops_trigger_loading');
      if (triggerLoading === 'true') {
        localStorage.removeItem('stadiumops_trigger_loading');
        setIsAiProcessing(true);
      }
    };
    window.addEventListener('stadiumops-telemetry-update', handleUpdate);

    // Initial mount check
    const triggerLoading = localStorage.getItem('stadiumops_trigger_loading');
    if (triggerLoading === 'true') {
      localStorage.removeItem('stadiumops_trigger_loading');
      setIsAiProcessing(true);
    }

    return () => window.removeEventListener('stadiumops-telemetry-update', handleUpdate);
  }, []);

  // AI loading sequence timer (1.8s max duration, 600ms per stage)
  useEffect(() => {
    if (isAiProcessing) {
      setLoadingStage(0);
      const timer1 = setTimeout(() => setLoadingStage(1), 600);
      const timer2 = setTimeout(() => setLoadingStage(2), 1200);
      const timer3 = setTimeout(() => {
        setIsAiProcessing(false);
        setLoadingStage(0);
        setJustFinishedProcessing(true);
      }, 1800);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isAiProcessing]);

  useEffect(() => {
    if (justFinishedProcessing) {
      const timer = setTimeout(() => {
        setJustFinishedProcessing(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [justFinishedProcessing]);

  // Setup default fallback snapshot on initial boot if empty
  useEffect(() => {
    if (!activeSnapshot) {
      const defaultRows = [
        { gate: "Gate A (North)", queueLength: 4, occupancy: 42, capacity: 15000, staff: 32, weather: "Clear", incident: "None", parking: 80, transitDelay: 0, time: "19:00" },
        { gate: "Gate B (East)", queueLength: 8, occupancy: 62, capacity: 20000, staff: 45, weather: "Clear", incident: "None", parking: 80, transitDelay: 0, time: "19:00" },
        { gate: "Gate C (Southeast)", queueLength: 7, occupancy: 58, capacity: 15000, staff: 35, weather: "Clear", incident: "None", parking: 80, transitDelay: 0, time: "19:00" },
        { gate: "Gate D (South)", queueLength: 5, occupancy: 45, capacity: 15000, staff: 32, weather: "Clear", incident: "None", parking: 80, transitDelay: 0, time: "19:00" },
        { gate: "Gate E (West)", queueLength: 6, occupancy: 48, capacity: 15000, staff: 32, weather: "Clear", incident: "None", parking: 80, transitDelay: 0, time: "19:00" },
        { gate: "Gate F (VIP/Skybox)", queueLength: 2, occupancy: 15, capacity: 5000, staff: 18, weather: "Clear", incident: "None", parking: 80, transitDelay: 0, time: "19:00" }
      ];
      recommendationEngine.processNewDataset(defaultRows, "Default Operational Feed");
    }
  }, [activeSnapshot]);


  if (!activeSnapshot) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Initializing Control Deck...</span>
      </div>
    );
  }


  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in font-sans">
      
      {/* Live Operations Banner */}
      <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 px-4 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold shadow-inner">
        <div className="flex flex-wrap items-center gap-4">
          {/* LIVE indicator */}
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold tracking-wider">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>LIVE OPERATIONAL FEED</span>
          </div>

          <div className="h-3 w-px bg-slate-800 hidden sm:block"></div>

          {/* Active scenario */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 uppercase tracking-wider text-[10px]">Scenario:</span>
            <span className="text-slate-300 font-bold font-mono">{datasetName}</span>
          </div>

          <div className="h-3 w-px bg-slate-800 hidden sm:block"></div>

          {/* Last telemetry update */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 uppercase tracking-wider text-[10px]">Last Update:</span>
            <span className="text-slate-300 font-mono font-bold" key={lastUpdateTime}>{lastUpdateTime}</span>
          </div>
        </div>

        {/* AI Status */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 uppercase tracking-wider text-[10px]">AI Status:</span>
          {isAiProcessing ? (
            <Badge variant="warning" className="animate-pulse text-[9px] py-0 font-bold tracking-wider uppercase">
              Analyzing...
            </Badge>
          ) : justFinishedProcessing ? (
            <Badge variant="success" className="text-[9px] py-0 font-bold tracking-wider uppercase">
              Recommendations Updated
            </Badge>
          ) : (
            <Badge variant="info" className="text-[9px] py-0 font-bold tracking-wider uppercase">
              Monitoring
            </Badge>
          )}
        </div>
      </div>

      {/* Global Status Banner & AI / Simulation Mode Badges */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/30 p-4 border border-slate-900 rounded-xl">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <span>Operational Control Deck</span>
            {isAiMode ? (
              <Badge variant="info" className="animate-pulse shadow-md shadow-blue-500/10 font-bold uppercase tracking-widest text-[9px]">
                AI Reasoning Mode
              </Badge>
            ) : (
              <Badge variant="warning" className="font-bold uppercase tracking-widest text-[9px]">
                Simulation Mode
              </Badge>
            )}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-slate-400">Active Scenario: <span className="text-slate-200 font-bold">{datasetName}</span></p>
            <div className="h-3.5 w-px bg-slate-800"></div>
            <button 
              onClick={runOneClickDemo}
              disabled={demoRunning}
              className="text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 flex items-center gap-1 animate-pulse focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-sm"
              aria-label={demoRunning ? "Running presentation demo" : "Run presentation demo"}
              aria-busy={demoRunning}
            >
              <span>{demoRunning ? '⚡ Running Demo...' : '⚡ Run Presentation Demo'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg wait times</span>
            <div className="text-base font-black text-blue-400 font-mono mt-0.5">
              <span key={activeSnapshot.averageQueueTime} className="animate-number-pulse">
                {activeSnapshot.averageQueueTime}
              </span> mins
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Security State</span>
            <div className="text-base font-black text-emerald-400 font-mono mt-0.5">Normal Grid</div>
          </div>
        </div>
      </div>

      {/* Grid of 6 Status Metric Cards */}
      <KPISection 
        activeSnapshot={activeSnapshot} 
        occupancyPercentage={occupancyPercentage} 
        totalOccupancy={totalOccupancy} 
      />

      {/* Grid of Two Analytics Charts */}
      <TelemetryChartPanel />

      {/* Dynamic Recommendation Panel & Operational Timeline Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Dynamic AI Recommendation Engine */}
        <RecommendationPanel 
          isAiProcessing={isAiProcessing}
          loadingStage={loadingStage}
          recommendations={recommendations}
          resolvingId={resolvingId}
          rejectingId={rejectingId}
          onExplain={setExplainRec}
          onReject={handleReject}
          onApprove={handleApprove}
        />

        {/* Operational Decision Timeline */}
        <StatusTerminal timelineEvents={timelineEvents} />
      </div>

      {/* Explain Decision Popup Modal overlay */}
      <ExecutiveBriefingModal 
        activeSnapshot={activeSnapshot} 
        explainRec={explainRec} 
        onClose={() => setExplainRec(null)} 
      />

      <div className="grid grid-cols-1 gap-6">
        <IntelSection />
      </div>

      <DiagnosticsPanel />
    </div>
  );
};
export default Dashboard;
