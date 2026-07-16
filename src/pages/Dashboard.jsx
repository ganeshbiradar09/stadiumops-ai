import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { CrowdChart } from '../components/dashboard/CrowdChart';
import { GateChart } from '../components/dashboard/GateChart';
import { IntelSection } from '../components/dashboard/IntelSection';
import { ExecutiveBriefingModal } from '../components/dashboard/ExecutiveBriefingModal';
import { isAiMode } from '../services/geminiService'; 
import { recommendationEngine } from '../utils/recommendationEngine';
import { parseAndValidateCSV } from '../services/csvParser';
import { KPISection } from '../components/dashboard/kpi/KPISection';
import { RecommendationPanel } from '../components/dashboard/ai/RecommendationPanel';

export const Dashboard = () => {
  const [explainRec, setExplainRec] = useState(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [justFinishedProcessing, setJustFinishedProcessing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }));
  const [resolvingId, setResolvingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const lastActiveElement = useRef(null);
  
  // Real-time telemetry bindings
  const [activeSnapshot, setActiveSnapshot] = useState(recommendationEngine.getActiveSnapshot());
  const [recommendations, setRecommendations] = useState(recommendationEngine.getActiveRecommendations());
  const [timelineEvents, setTimelineEvents] = useState(recommendationEngine.getTimeline());
  const datasetName = recommendationEngine.getActiveDatasetName();

  // Calculate active layout metrics safely
  const { occupancyPercentage, totalOccupancy } = React.useMemo(() => {
    if (!activeSnapshot || !activeSnapshot.gates) return { occupancyPercentage: 0, totalOccupancy: 0 };
    const cap = activeSnapshot.gates.reduce((sum, g) => sum + g.capacity, 0);
    if (cap === 0) return { occupancyPercentage: 0, totalOccupancy: 0 };
    const occ = Math.round(activeSnapshot.gates.reduce((sum, g) => sum + (g.capacity * (g.occupancy / 100)), 0));
    return {
      occupancyPercentage: Math.round((occ / cap) * 100),
      totalOccupancy: occ
    };
  }, [activeSnapshot]);

  useEffect(() => {
    const handleUpdate = () => {
      setActiveSnapshot(recommendationEngine.getActiveSnapshot());
      setRecommendations(recommendationEngine.getActiveRecommendations());
      setTimelineEvents(recommendationEngine.getTimeline());
      setLastUpdateTime(new Date().toLocaleTimeString('en-US', { hour12: false }));

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

  useEffect(() => {
    if (explainRec) {
      lastActiveElement.current = document.activeElement;
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setExplainRec(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        if (lastActiveElement.current) {
          lastActiveElement.current.focus();
        }
      };
    }
  }, [explainRec]);

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

  const handleApprove = async (id) => {
    setResolvingId(id);
    setTimeout(async () => {
      await recommendationEngine.approveRecommendation(id);
      setActiveSnapshot(recommendationEngine.getActiveSnapshot());
      setRecommendations(recommendationEngine.getActiveRecommendations());
      setTimelineEvents(recommendationEngine.getTimeline());
      setResolvingId(null);
    }, 250);
  };

  const handleReject = async (id) => {
    setRejectingId(id);
    setTimeout(async () => {
      await recommendationEngine.rejectRecommendation(id);
      setActiveSnapshot(recommendationEngine.getActiveSnapshot());
      setRecommendations(recommendationEngine.getActiveRecommendations());
      setTimelineEvents(recommendationEngine.getTimeline());
      setRejectingId(null);
    }, 250);
  };

  // Presentation Demo Script
  const runOneClickDemo = async () => {
    if (demoRunning) return;
    setDemoRunning(true);
    try {
      alert("Demo Phase 1/5: Loading Peak Traffic Scenario...\nIngesting 17-dimensional synthetic CSV telemetry containing rainfall anomalies and turnstile validator failure logs.");
      
      const demoCSV = `Gate,Queue Length,Occupancy,Capacity,Staff,Weather,Incident,Parking,Transit Delay,Time,Risk Level,Emergency Status,Medical Cases,Security Alerts,VIP Traffic,Shuttle Status,Confidence
Gate A (North),28,92%,15000,32,Heavy Rain,Wet plaza floor,88%,15,19:30,High,Normal,0,0,None,Optimal,90%
Gate B (East),32,96%,20000,45,Heavy Rain,Outage turnstile lane 3,88%,15,19:30,Critical,Emergency,1,3,None,Optimal,95%
Gate C (Southeast),8,48%,15000,35,Heavy Rain,None,88%,15,19:30,Medium,Normal,0,0,None,Optimal,85%
Gate D (South),10,52%,15000,32,Heavy Rain,None,88%,15,19:30,Medium,Normal,0,0,None,Optimal,85%
Gate E (West),12,56%,15000,32,Heavy Rain,None,88%,15,19:30,Medium,Normal,0,0,None,Optimal,85%
Gate F (VIP/Skybox),2,15%,5000,18,Heavy Rain,None,88%,15,19:30,Low,Normal,0,0,High,Optimal,90%`;

      const parsed = parseAndValidateCSV(demoCSV);
      
      // Ingest and trigger recalculation
      const res = await recommendationEngine.processNewDataset(parsed.processedRows, "Interactive Presentation Demo Scenario");
      
      setIsAiProcessing(true); // Trigger 1.8s AI Processing Sequence

      // Force immediate re-renders
      setActiveSnapshot(res.snapshot);
      setRecommendations(res.recommendations);
      setTimelineEvents(recommendationEngine.getTimeline());

      await new Promise(r => setTimeout(r, 4000));

      // Step 2: Auto-approve Critical recommendation
      const criticalRec = res.recommendations.find(r => r.priority === 'Critical');
      if (criticalRec) {
        alert(`Demo Phase 2/5: AI Decision Engine flagged anomalous queue sizes and turnstile outages at Gate B.\nAutomatically approving recommended action: "${criticalRec.title}"`);
        
        setResolvingId(criticalRec.id);
        await new Promise(r => setTimeout(r, 250)); // Play exit animation in demo
        await recommendationEngine.approveRecommendation(criticalRec.id);
        setResolvingId(null);
        
        // Sync state
        setActiveSnapshot(recommendationEngine.getActiveSnapshot());
        setRecommendations(recommendationEngine.getActiveRecommendations());
        setTimelineEvents(recommendationEngine.getTimeline());

        await new Promise(r => setTimeout(r, 4000));
      }

      // Step 3: Run Outcome Simulation
      alert("Demo Phase 3/5: Dynamic Outcome Simulation Engine active.\nNotice that turnstile queues are draining, medical cases have cleared, and the decision timeline logs have synced.");
      setActiveSnapshot(recommendationEngine.getActiveSnapshot());
      setRecommendations(recommendationEngine.getActiveRecommendations());
      setTimelineEvents(recommendationEngine.getTimeline());

      await new Promise(r => setTimeout(r, 3000));

      // Step 4: Export report
      alert("Demo Phase 4/5: Compiling AI Decision support logs and downloading CSV/Text reports...");
      
      let reportContent = "========================================================================\n";
      reportContent += "FIFA WORLD CUP 2026 - DEMO OPERATIONAL OUTCOMES EXPORT\n";
      reportContent += `Generated: ${new Date().toISOString()}\n`;
      reportContent += "========================================================================\n\n";
      
      const currentSnapshot = recommendationEngine.getActiveSnapshot();
      reportContent += "--- KPIs STATE AFTER OUTCOME SIMULATION ---\n";
      reportContent += `Average wait time: ${currentSnapshot.averageQueueTime} mins\n`;
      reportContent += `Max queue time: ${currentSnapshot.maxQueueTime} mins\n`;
      reportContent += `Crowd density Level: ${currentSnapshot.crowdDensityLevel}\n\n`;

      reportContent += "--- DECISION HISTORY LOGS ---\n";
      recommendationEngine.getActiveRecommendations().forEach(rec => {
        reportContent += `* [${rec.status}] ${rec.title}: ${rec.recommended_action} (Confidence: ${rec.confidence}%)\n`;
      });

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const element = document.createElement("a");
      element.href = URL.createObjectURL(blob);
      element.download = `DEMO_AI_Decision_Report.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      await new Promise(r => setTimeout(r, 1000));

      alert("Demo Phase 5/5: One-click presentation demonstration completed successfully!\nAll KPIs are restored within standard safety limits.");

    } catch {
      // Removed debug log
      alert("Demo simulation error occurred.");
    } finally {
      setDemoRunning(false);
    }
  };

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CrowdChart />
        <GateChart />
      </div>

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
        <Card 
          title="Operational Decision Timeline" 
          subtitle="Audit log registry tracking chronological AI dispatches and manager approvals"
        >
          <div className="mt-4 space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {timelineEvents.length === 0 ? (
              <div className="h-36 flex items-center justify-center text-slate-400 text-xs font-semibold border border-slate-900 rounded-xl bg-slate-950/20">
                Timeline logs await dataset uploads...
              </div>
            ) : (
              timelineEvents.map((evt, idx) => {
                let statusColor = 'slate';
                if (evt.status === 'Approved') statusColor = 'success';
                if (evt.status === 'Rejected') statusColor = 'danger';

                return (
                  <div key={idx} className="relative pl-6 pb-4 border-l border-slate-800 last:pb-0">
                    <div className={`
                      absolute -left-1.5 top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-slate-950 flex items-center justify-center
                      ${evt.status === 'Approved' ? 'border-emerald-500' : evt.status === 'Rejected' ? 'border-rose-500' : 'border-blue-500'}
                    `}>
                      <span className={`h-1.5 w-1.5 rounded-full ${evt.status === 'Approved' ? 'bg-emerald-500' : evt.status === 'Rejected' ? 'bg-rose-500' : 'bg-blue-500'}`}></span>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-400">{evt.timestamp.slice(11, 19)}</span>
                          <span className="text-slate-300 font-bold">{evt.incident}</span>
                        </div>
                        <Badge variant={statusColor} className="text-[9px] px-1.5 py-0">{evt.status}</Badge>
                      </div>

                      <div className="text-xs text-slate-400 font-medium">
                        <span className="text-blue-400 font-bold block text-[10px] uppercase">Model Recommendation:</span>
                        <p className="mt-0.5 text-slate-200 leading-normal">{evt.recommendation}</p>
                      </div>

                      <div className="text-[10px] text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-900/60 leading-relaxed font-semibold">
                        <span className="text-slate-400 font-bold uppercase block text-[9px] mb-0.5">Audit Outcome log:</span>
                        <span className="text-slate-300">{evt.outcome || 'Pending operational manager authorization.'}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Explain Decision Popup Modal overlay */}
      <ExecutiveBriefingModal 
        activeSnapshot={activeSnapshot} 
        explainRec={explainRec} 
        onClose={() => setExplainRec(null)} 
      />

      {/* Grid of Event Streams */}
      <div className="grid grid-cols-1 gap-6">
        <IntelSection />
      </div>
    </div>
  );
};
export default Dashboard;
