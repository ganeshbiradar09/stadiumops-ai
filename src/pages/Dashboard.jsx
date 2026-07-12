import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { CrowdChart } from '../components/dashboard/CrowdChart';
import { GateChart } from '../components/dashboard/GateChart';
import { IntelSection } from '../components/dashboard/IntelSection';
import { isAiMode } from '../services/geminiService';
import { recommendationEngine } from '../utils/recommendationEngine';
import { parseAndValidateCSV } from '../services/csvParser';
import { 
  Users, 
  Flame, 
  LogOut, 
  Car, 
  CloudSun, 
  Gauge, 
  TrendingUp, 
  BrainCircuit, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  Check, 
  X,
  FileCode,
  ShieldAlert
} from 'lucide-react';
import { formatNumber, formatPercent } from '../utils/formatters';

export const Dashboard = () => {
  const [explainRec, setExplainRec] = useState(null);
  const [demoRunning, setDemoRunning] = useState(false);
  
  // Real-time telemetry bindings
  const [activeSnapshot, setActiveSnapshot] = useState(recommendationEngine.getActiveSnapshot());
  const [recommendations, setRecommendations] = useState(recommendationEngine.getActiveRecommendations());
  const [timelineEvents, setTimelineEvents] = useState(recommendationEngine.getTimeline());
  const datasetName = recommendationEngine.getActiveDatasetName();

  useEffect(() => {
    const handleUpdate = () => {
      setActiveSnapshot(recommendationEngine.getActiveSnapshot());
      setRecommendations(recommendationEngine.getActiveRecommendations());
      setTimelineEvents(recommendationEngine.getTimeline());
    };
    window.addEventListener('stadiumops-telemetry-update', handleUpdate);
    return () => window.removeEventListener('stadiumops-telemetry-update', handleUpdate);
  }, []);

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
  }, []);

  const handleApprove = async (id) => {
    await recommendationEngine.approveRecommendation(id);
  };

  const handleReject = async (id) => {
    await recommendationEngine.rejectRecommendation(id);
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
      
      // Force immediate re-renders
      setActiveSnapshot(res.snapshot);
      setRecommendations(res.recommendations);
      setTimelineEvents(recommendationEngine.getTimeline());

      await new Promise(r => setTimeout(r, 4000));

      // Step 2: Auto-approve Critical recommendation
      const criticalRec = res.recommendations.find(r => r.priority === 'Critical');
      if (criticalRec) {
        alert(`Demo Phase 2/5: AI Decision Engine flagged anomalous queue sizes and turnstile outages at Gate B.\nAutomatically approving recommended action: "${criticalRec.title}"`);
        await recommendationEngine.approveRecommendation(criticalRec.id);
        
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

    } catch (err) {
      console.error(err);
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

  // Calculate active layout metrics from the current snapshot
  const totalCapacity = activeSnapshot.gates.reduce((sum, g) => sum + g.capacity, 0);
  const totalOccupancy = Math.round(activeSnapshot.gates.reduce((sum, g) => sum + (g.capacity * (g.occupancy / 100)), 0));
  const occupancyPercentage = Math.round((totalOccupancy / totalCapacity) * 100);

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in font-sans">
      
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
              className="text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 flex items-center gap-1 animate-pulse"
            >
              <span>{demoRunning ? '⚡ Running Demo...' : '⚡ Run Presentation Demo'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg wait times</span>
            <div className="text-base font-black text-blue-400 font-mono mt-0.5">
              {activeSnapshot.averageQueueTime} mins
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Security State</span>
            <div className="text-base font-black text-emerald-400 font-mono mt-0.5">Normal Grid</div>
          </div>
        </div>
      </div>

      {/* Grid of 6 Status Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {/* 1. Stadium Status */}
        <Card hover className="flex flex-col justify-between p-4.5">
          <div className="flex justify-between items-start mb-2.5">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Stadium Occupancy</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-slate-100 font-mono">
              {occupancyPercentage}%
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 truncate">
              {formatNumber(totalOccupancy)} in attendance
            </p>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-900">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${occupancyPercentage}%` }}
            ></div>
          </div>
        </Card>

        {/* 2. Crowd Density */}
        <Card hover className="flex flex-col justify-between p-4.5">
          <div className="flex justify-between items-start mb-2.5">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Crowd Density</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Flame className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-slate-100 uppercase flex items-baseline gap-1.5">
              <span>{activeSnapshot.crowdDensityLevel}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 truncate">
              Max wait: {activeSnapshot.maxQueueTime} mins
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>{activeSnapshot.crowdDensityLevel === 'Critical' ? 'Immediate action required' : 'Monitored grid'}</span>
          </div>
        </Card>

        {/* 3. Gate Status */}
        <Card hover className="flex flex-col justify-between p-4.5">
          <div className="flex justify-between items-start mb-2.5">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Gates Status</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <LogOut className="h-4.5 w-4.5 rotate-180" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-slate-100 font-mono">
              {activeSnapshot.gates.length} active
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 truncate">
              Avg queue: {activeSnapshot.averageQueueTime} mins
            </p>
          </div>
          <div className="mt-3">
            <Badge variant={activeSnapshot.incidents.length > 0 ? 'danger' : 'success'} className="text-[9px] py-0">
              {activeSnapshot.incidents.length > 0 ? `${activeSnapshot.incidents.length} Alert overrides` : 'All Gates Clear'}
            </Badge>
          </div>
        </Card>

        {/* 4. Parking Usage */}
        <Card hover className="flex flex-col justify-between p-4.5">
          <div className="flex justify-between items-start mb-2.5">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Parking Lots</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Car className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-slate-100 font-mono">
              {activeSnapshot.context.parkingOccupancy}%
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 truncate">
              Lot A-D combined capacity
            </p>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-900">
            <div 
              className="bg-purple-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${activeSnapshot.context.parkingOccupancy}%` }}
            ></div>
          </div>
        </Card>

        {/* 5. Weather */}
        <Card hover className="flex flex-col justify-between p-4.5">
          <div className="flex justify-between items-start mb-2.5">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Weather Telemetry</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <CloudSun className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-slate-100">
              {activeSnapshot.context.weather}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 truncate">
              Rain impact: {activeSnapshot.context.weather === 'Heavy Rain' ? 'High delay risk' : 'Normal'}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span>Sensor telemetry active</span>
          </div>
        </Card>

        {/* 6. Operational Score */}
        <Card hover className="flex flex-col justify-between p-4.5 border-blue-500/10">
          <div className="flex justify-between items-start mb-2.5">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Operational Score</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Gauge className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-slate-100 font-mono flex items-center gap-1">
              <span>{activeSnapshot.averageQueueTime > 20 ? '78' : '94'}</span>
              <span className="text-[10px] text-emerald-400 flex items-center font-bold">
                <TrendingUp className="h-3 w-3 inline" /> +1.2%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 truncate">
              Overall flow index rating
            </p>
          </div>
          <div className="mt-3">
            <Badge variant={activeSnapshot.averageQueueTime > 20 ? 'warning' : 'success'} className="text-[9px] py-0">
              {activeSnapshot.averageQueueTime > 20 ? 'Moderate Alert' : 'Optimal Grid'}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Grid of Two Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CrowdChart />
        <GateChart />
      </div>

      {/* Dynamic Recommendation Panel & Operational Timeline Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Dynamic AI Recommendation Engine */}
        <Card 
          title="GenAI Operational Decision Engine" 
          subtitle="Autonomous reasoning and real-time decision support recommendations"
          headerAction={
            <div className="flex items-center gap-1">
              <BrainCircuit className="h-4 w-4 text-blue-400" />
              <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">
                {isAiMode ? 'Gemini 1.5 Live' : 'Simulation Engine Active'}
              </span>
            </div>
          }
        >
          <div className="mt-4 space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {recommendations.length === 0 ? (
              <div className="h-36 flex flex-col items-center justify-center text-slate-500 text-xs font-semibold border border-slate-900 rounded-xl bg-slate-950/20">
                <span>No recommendations computed.</span>
                <span className="text-[10px] text-slate-600 mt-1">Please upload operational CSV or run synthetic models on the Data Sources hub.</span>
              </div>
            ) : (
              recommendations.map((rec) => {
                let priorityVariant = 'info';
                if (rec.priority === 'Critical') priorityVariant = 'danger';
                if (rec.priority === 'High') priorityVariant = 'warning';
                
                let statusColor = 'slate';
                if (rec.status === 'Approved') statusColor = 'success';
                if (rec.status === 'Rejected') statusColor = 'danger';

                return (
                  <div 
                    key={rec.id} 
                    className={`
                      p-4 rounded-xl border bg-slate-950/30 flex flex-col gap-3 transition-all hover:bg-slate-900/10
                      ${rec.status === 'Approved' ? 'border-emerald-950/40 bg-emerald-950/5' : rec.status === 'Rejected' ? 'border-rose-950/30' : 'border-slate-800'}
                    `}
                  >
                    {/* Card Header */}
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={priorityVariant}>{rec.priority}</Badge>
                        <span className="text-[10px] text-blue-400 font-mono font-extrabold">Conf: {rec.confidence}%</span>
                      </div>
                      <Badge variant={statusColor} className="text-[9px] px-1.5 py-0 uppercase">{rec.status}</Badge>
                    </div>

                    {/* Reasoning and Recommended Action */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-blue-400 uppercase tracking-wider">
                        {rec.title}
                      </h4>
                      <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                        {rec.description}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Action Directive:</span>
                      <p className="text-xs text-slate-100 font-extrabold mt-1 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
                        {rec.recommended_action}
                      </p>
                    </div>

                    {/* Operational Variables grid */}
                    <div className="grid grid-cols-2 gap-3 text-[10px] bg-slate-950/30 p-2.5 rounded-lg border border-slate-900/60">
                      <div>
                        <span className="text-slate-500 block">Queue Reduction</span>
                        <span className="text-slate-200 font-bold font-mono">{rec.estimated_queue_reduction}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Resolution ETA</span>
                        <span className="text-slate-200 font-bold font-mono">{rec.estimated_resolution_time}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Staff Needed</span>
                        <span className="text-slate-200 font-bold font-mono">{rec.staff_required}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Impact projection</span>
                        <span className="text-slate-200 font-bold truncate block">{rec.expected_operational_impact}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 justify-end pt-1 border-t border-slate-900/60">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[10px] font-bold gap-1"
                        onClick={() => setExplainRec(rec)}
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                        <span>Explain Decision</span>
                      </Button>
                      
                      {rec.status === 'Pending' && (
                        <>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="text-[10px] text-rose-400 border-rose-950/20 hover:bg-rose-500/10 px-2.5"
                            onClick={() => handleReject(rec.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="text-[10px] bg-blue-600 hover:bg-blue-500 text-slate-100 px-3.5"
                            onClick={() => handleApprove(rec.id)}
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Operational Decision Timeline */}
        <Card 
          title="Operational Decision Timeline" 
          subtitle="Audit log registry tracking chronological AI dispatches and manager approvals"
        >
          <div className="mt-4 space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {timelineEvents.length === 0 ? (
              <div className="h-36 flex items-center justify-center text-slate-500 text-xs font-semibold border border-slate-900 rounded-xl bg-slate-950/20">
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
                          <span className="font-mono font-bold text-slate-500">{evt.timestamp.slice(11, 19)}</span>
                          <span className="text-slate-300 font-bold">{evt.incident}</span>
                        </div>
                        <Badge variant={statusColor} className="text-[9px] px-1.5 py-0">{evt.status}</Badge>
                      </div>

                      <div className="text-xs text-slate-400 font-medium">
                        <span className="text-blue-400 font-bold block text-[10px] uppercase">Model Recommendation:</span>
                        <p className="mt-0.5 text-slate-200 leading-normal">{evt.recommendation}</p>
                      </div>

                      <div className="text-[10px] text-slate-500 bg-slate-950 p-2.5 rounded border border-slate-900/60 leading-relaxed font-semibold">
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
      {explainRec && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-4 animate-scale-up">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                  <FileCode className="h-3.5 w-3.5" />
                  <span>Prompt Engineering & Cognitive Metadata</span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-100 mt-1">Explain Operational Decision</h3>
              </div>
              <button 
                onClick={() => setExplainRec(null)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Prompt version / model details */}
            <div className="grid grid-cols-2 gap-3 text-[10px] font-mono bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <div>
                <span className="text-slate-500">Model Name:</span>
                <span className="text-blue-400 font-bold block mt-0.5">{explainRec.modelName}</span>
              </div>
              <div>
                <span className="text-slate-500">Prompt Version:</span>
                <span className="text-blue-400 font-bold block mt-0.5">{explainRec.promptVersion}</span>
              </div>
              <div>
                <span className="text-slate-500">Dataset Context:</span>
                <span className="text-slate-300 font-bold block mt-0.5">{explainRec.datasetName}</span>
              </div>
              <div>
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-300 font-bold block mt-0.5 truncate">{explainRec.timestamp}</span>
              </div>
            </div>

            {/* Metrics Triggered */}
            {explainRec.metrics_triggered && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Telemetry Signals Triggered</span>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-900 text-xs font-mono">
                  {Object.entries(explainRec.metrics_triggered).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-slate-900/60 pb-1 last:border-0 last:pb-0">
                      <span className="text-slate-500 font-semibold">{key}:</span>
                      <span className="text-blue-400 font-bold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Rationale Reasoning */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Decision Rationale</span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-900 font-medium">
                {explainRec.reasoning}
              </p>
            </div>

            {/* Confidence factors */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Cognitive Confidence Factors ({explainRec.confidence}%)</span>
              <ul className="space-y-1.5 text-xs text-slate-400 font-medium">
                {explainRec.confidence_factors?.map((fac, idx) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{fac}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Safety Risks if Ignored */}
            <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg flex items-start gap-2.5 text-xs text-slate-300">
              <ShieldAlert className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-400 block text-[10px] uppercase">Safety Risk if Ignored:</span>
                <p className="mt-0.5 text-slate-300 leading-normal font-semibold">{explainRec.risk_if_ignored}</p>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <Button variant="secondary" size="sm" onClick={() => setExplainRec(null)}>
                Dismiss Explanation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Event Streams */}
      <div className="grid grid-cols-1 gap-6">
        <IntelSection />
      </div>
    </div>
  );
};
export default Dashboard;
