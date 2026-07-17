import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { recommendationEngine } from '../utils/recommendationEngine';
import { FileText, Download, Calendar, CheckSquare } from 'lucide-react';

export const Reports = () => {
  const [reportType, setReportType] = useState('genai');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedList, setGeneratedList] = useState([
    { id: "REP-401", title: "GenAI Operational Decision Registry - Ingress Phase", date: "2026-07-12", size: "1.2 MB", type: "TXT" },
    { id: "REP-398", title: "Crowd Influx Peak Analysis - Match Day 14", date: "2026-07-12", size: "2.4 MB", type: "PDF" },
    { id: "REP-392", title: "Gate Occupancy Turnstile Outlier Audit", date: "2026-07-11", size: "4.8 MB", type: "CSV" }
  ]);

  const handleGenerate = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    
    setTimeout(() => {
      let title = "Live Crowd Distribution Profile";
      let format = "PDF";
      
      if (reportType === 'genai') {
        title = "GenAI Decision Reasoning Logs Export";
        format = "TXT";
      } else if (reportType === 'transit') {
        title = "Transit & Shuttle Fleet Load Report";
        format = "CSV";
      }

      const newReport = {
        id: `REP-${Math.floor(Math.random() * 100) + 500}`,
        title,
        date: new Date().toISOString().split('T')[0],
        size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
        type: format
      };
      
      setGeneratedList([newReport, ...generatedList]);
      setIsGenerating(false);
      alert('Operational report generated and added to catalog.');
    }, 1200);
  };

  const handleDownload = (rep) => {
    if (rep.title.includes("GenAI")) {
      const recs = recommendationEngine.getActiveRecommendations();
      const snapshot = recommendationEngine.getActiveSnapshot();
      const timeline = recommendationEngine.getTimeline();
      
      const rawLogs = localStorage.getItem('stadiumops_audit_logs');
      const auditLogs = rawLogs ? JSON.parse(rawLogs) : [];

      if (!snapshot) {
        alert("No active operational snapshot found. Please load data first.");
        return;
      }

      let content = "========================================================================\n";
      content += "FIFA WORLD CUP 2026 - GENAI DECISION SUPPORT ENGINE ANALYTICAL EXPORT\n";
      content += `Report ID: ${rep.id} | Generated: ${new Date().toISOString()}\n`;
      content += `Context Scenario: ${recommendationEngine.getActiveDatasetName()}\n`;
      content += "========================================================================\n\n";

      content += "--- CURRENT OPERATIONAL KEY PERFORMANCE INDICATORS (KPIs) ---\n";
      content += `Match Clock time: ${snapshot.matchTime}\n`;
      content += `Average Gate wait time: ${snapshot.averageQueueTime} minutes\n`;
      content += `Peak Queue wait time: ${snapshot.maxQueueTime} minutes\n`;
      content += `Crowd Density Rating: ${snapshot.crowdDensityLevel}\n`;
      content += `Perimeter weather condition: ${snapshot.context.weather}\n`;
      content += `Combined parking occupancy: ${snapshot.context.parkingOccupancy}%\n`;
      content += `Municipal transit delays: ${snapshot.context.transitDelay} minutes\n`;
      content += `Active alarms/incidents: ${snapshot.incidents.length}\n\n`;

      content += "--- GATE PERIMETER CHECKPOINTS DATA ---\n";
      snapshot.gates.forEach(g => {
        content += `- ${g.name}: Queue: ${g.queueTime}m | Load: ${g.occupancy}% | Staff: ${g.staff} stewards | Alerts: ${g.securityAlerts || 0} | Medics: ${g.medicalCases || 0} | Emergency: ${g.emergencyStatus || 'Normal'}\n`;
      });
      content += "\n";

      content += "--- DYNAMIC AI RECOMMENDED DECISIONS & ACTION DIRECTIVES ---\n";
      if (recs.length === 0) {
        content += "No recommendations computed.\n";
      } else {
        recs.forEach((rec, idx) => {
          content += `[Recommendation #${idx + 1} - Priority: ${rec.priority} (ID: ${rec.id || rec.recommendation_id})]\n`;
          content += `Title: ${rec.title}\n`;
          content += `Situation: ${rec.situation}\n`;
          content += `Trend: ${rec.trend}\n`;
          content += `Prediction: ${rec.prediction}\n`;
          content += `Recommended Action: ${rec.recommended_action}\n`;
          content += `Expected Outcome: ${rec.expected_outcome || rec.expected_operational_impact}\n`;
          content += `Estimated Queue Reduction: ${rec.estimated_queue_reduction}\n`;
          content += `Resolution ETA: ${rec.estimated_resolution_time}\n`;
          content += `Staff Required: ${rec.staff_required}\n`;
          content += `Safety Risk if Ignored: ${rec.risk_if_ignored}\n`;
          content += `Approval Status: ${rec.status}\n`;
          if (rec.metrics_triggered) {
            content += "Metrics Triggered:\n";
            Object.entries(rec.metrics_triggered).forEach(([key, val]) => {
              content += `  * ${key}: ${val}\n`;
            });
          }
          content += "------------------------------------------------------------------------\n";
        });
      }
      content += "\n";

      content += "--- OPERATIONAL DECISION CHRONOLOGICAL TIMELINE ---\n";
      if (timeline.length === 0) {
        content += "Timeline registry empty.\n";
      } else {
        timeline.forEach((evt, _idx) => {
          content += `[${evt.timestamp}] Incident: ${evt.incident} | Status: ${evt.status}\n`;
          content += `  Recommendation: ${evt.recommendation}\n`;
          content += `  Outcome Log: ${evt.outcome}\n\n`;
        });
      }
      content += "\n";

      content += "--- PERIMETER AUDIT LOGS REGISTRY ---\n";
      if (auditLogs.length === 0) {
        content += "No actions logged.\n";
      } else {
        auditLogs.forEach(log => {
          content += `[${log.timestamp}] [${log.action}] - ${JSON.stringify(log.details)}\n`;
        });
      }

      // Trigger download
      const blob = new Blob([content], { type: 'text/plain' });
      const element = document.createElement("a");
      element.href = URL.createObjectURL(blob);
      element.download = `${rep.id}_AI_Decision_Report.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      alert(`Downloading mock PDF/CSV report: ${rep.title} (${rep.size})`);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-500" />
          <span>Operational Reports Registry</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Generating official analytical summaries and compliance logs for FIFA Venue Alpha operations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Generator Form */}
        <div className="lg:col-span-1">
          <Card title="Compile Report" subtitle="Specify metrics context parameters">
            <form onSubmit={handleGenerate} className="mt-4 space-y-4">
              {/* Report Type */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Report Profile</label>
                <div className="space-y-2">
                  {[
                    { id: 'genai', label: 'GenAI Decision & Reasoning Export' },
                    { id: 'crowd', label: 'Crowd Flow & Security Profile' },
                    { id: 'transit', label: 'Transit & Parking Efficiency' }
                  ].map(opt => (
                    <label 
                      key={opt.id}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all focus-within:ring-2 focus-within:ring-blue-500/50
                        ${reportType === opt.id 
                          ? 'bg-blue-600/10 border-blue-500/30 text-slate-200' 
                          : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:bg-slate-900/20'
                        }
                      `}
                    >
                      <input 
                        type="radio" 
                        name="report-type" 
                        value={opt.id}
                        checked={reportType === opt.id}
                        onChange={() => setReportType(opt.id)}
                        className="sr-only"
                      />
                      <CheckSquare className={`h-4 w-4 shrink-0 ${reportType === opt.id ? 'text-blue-400' : 'text-slate-700'}`} />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div>
                <label htmlFor="timeHorizon" className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Time Horizon</label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <select 
                    id="timeHorizon"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 appearance-none cursor-pointer"
                    disabled
                  >
                    <option>Current Active Match (Match Day 14)</option>
                    <option>Past 24 Hours</option>
                    <option>Past 7 Days</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                type="submit" 
                className="w-full text-xs font-bold uppercase tracking-wider"
                disabled={isGenerating}
              >
                {isGenerating ? 'Compiling File...' : 'Compile Operational PDF'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Side: Generated Files Catalog */}
        <div className="lg:col-span-2">
          <Card title="Operational Archive" subtitle="Download compiled PDF/CSV reports">
            {/* List */}
            <div className="space-y-3 mt-4">
              {generatedList.map((rep) => (
                <div key={rep.id} className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 flex justify-between items-center hover:bg-slate-900/10 transition-colors">
                  <div className="flex gap-3 items-center min-w-0">
                    <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-200 truncate">{rep.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        ID: {rep.id} | Compiled: {rep.date} | Format: {rep.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 font-mono">
                    <span className="text-xs text-slate-400 hidden sm:inline">{rep.size}</span>
                    <button 
                      onClick={() => handleDownload(rep)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      title="Download report"
                      aria-label={`Download report: ${rep.title}`}
                    >
                      <Download className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Reports;
