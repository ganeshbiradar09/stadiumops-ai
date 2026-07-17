import React, { useEffect, useRef } from 'react';
import { 
  BrainCircuit, 
  X,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Button } from '../common/Button';

export const ExecutiveBriefingModal = ({ activeSnapshot, explainRec, onClose }) => {
  const lastActiveElement = useRef(null);

  useEffect(() => {
    if (explainRec) {
      lastActiveElement.current = document.activeElement;
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
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
  }, [explainRec, onClose]);

  if (!activeSnapshot || !explainRec) return null;

  // Render a mini trace step
  const renderTraceStep = (step, index, total) => (
    <div key={index} className="flex items-center">
      <div className="bg-slate-800/80 border border-slate-700/50 rounded-lg px-2 py-1.5 text-[10px] text-slate-300 font-semibold shadow-sm">
        {step}
      </div>
      {index < total - 1 && (
        <ArrowRight className="h-3 w-3 text-slate-600 mx-1.5 shrink-0" />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl flex flex-col gap-6 animate-scale-up max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider bg-blue-500/10 px-2 py-1 rounded w-max mb-2">
              <BrainCircuit className="h-4 w-4" />
              <span>AI Decision Trace & Impact Simulator</span>
            </div>
            <h3 id="modal-title" className="text-xl font-black text-slate-100 leading-snug">
              {explainRec.title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700/60"
            aria-label="Close executive briefing modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* AI Decision Trace Timeline */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Reasoning Pipeline</span>
          <div className="flex flex-wrap items-center gap-y-2 p-3 bg-slate-950 border border-slate-800/80 rounded-xl overflow-x-auto">
            {explainRec.decision_trace && explainRec.decision_trace.length > 0 
              ? explainRec.decision_trace.map((step, idx) => renderTraceStep(step, idx, explainRec.decision_trace.length))
              : renderTraceStep("Analysis Completed", 0, 1)
            }
          </div>
        </div>

        {/* Scenario Comparison (Before vs After) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Do Nothing Scenario */}
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-rose-500/20 text-rose-300 text-[9px] font-black uppercase px-2 py-1 rounded-bl-lg">
              Scenario A
            </div>
            <span className="text-[11px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="h-4 w-4" /> If Ignored (Do Nothing)
            </span>
            <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/50 mt-1">
              <p className="text-sm font-semibold text-slate-300 leading-relaxed">
                {explainRec.prediction}
              </p>
            </div>
            <div className="mt-auto">
              <span className="text-[10px] text-rose-400/80 font-bold uppercase tracking-wider block mb-1">Critical Risk</span>
              <p className="text-xs font-bold text-rose-300 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                {explainRec.risk_if_ignored}
              </p>
            </div>
          </div>

          {/* Action Scenario */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase px-2 py-1 rounded-bl-lg">
              Scenario B
            </div>
            <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" /> If Approved (Execute Action)
            </span>
            <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/50 mt-1">
              <p className="text-sm font-semibold text-slate-300 leading-relaxed">
                {explainRec.recommended_action}
              </p>
            </div>
            <div className="mt-auto">
              <span className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider block mb-1">Expected Impact</span>
              <p className="text-xs font-bold text-emerald-300 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                {explainRec.expected_impact}
              </p>
              <div className="flex gap-2 mt-2">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Recovery ETA: {explainRec.estimated_resolution_time}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Staff: {explainRec.staff_required}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Diagnostic Metadata Footer */}
        <div className="flex justify-between items-end border-t border-slate-800 pt-4 mt-2">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                <span>Model: <span className="text-blue-400 font-bold">{explainRec.modelName}</span></span>
                <span>Version: <span className="text-slate-300">{explainRec.promptVersion}</span></span>
             </div>
             <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                <span>Validation: <span className="text-emerald-400">{explainRec.validation_status}</span></span>
             </div>
          </div>
          <Button variant="secondary" onClick={onClose} className="font-bold uppercase tracking-wider text-xs">
            Acknowledge & Close
          </Button>
        </div>

      </div>
    </div>
  );
};
