import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { genAiDecisions } from '../../data/mockStadiumData';
import { BrainCircuit, CheckCircle2, AlertTriangle, ArrowRight, Play } from 'lucide-react';

/**
 * GenAI Operational Decision Engine recommendation and dispatch panel.
 */
export const RecSection = () => {
  const [selectedId, setSelectedId] = useState(genAiDecisions[0]?.id);

  const selectedDecision = genAiDecisions.find(dec => dec.id === selectedId) || genAiDecisions[0];

  return (
    <Card 
      title="GenAI Operational Decision Engine" 
      subtitle="Autonomous reasoning and real-time decision support recommendations"
      className="h-[480px] flex flex-col justify-between"
      headerAction={
        <div className="flex items-center gap-1">
          <BrainCircuit className="h-4 w-4 text-blue-400" />
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Model: StadiumOps-v2.6-Live</span>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-2 h-full items-stretch">
        {/* Left Side: Decision List */}
        <div className="md:col-span-2 flex flex-col gap-2 overflow-y-auto max-h-[350px] pr-1">
          {genAiDecisions.map((dec) => {
            const isSelected = dec.id === selectedId;
            let statusColor = 'slate';
            if (dec.status.includes('Deployed') || dec.status === 'Completed') statusColor = 'success';
            if (dec.status.includes('Pending')) statusColor = 'warning';

            return (
              <button
                key={dec.id}
                onClick={() => setSelectedId(dec.id)}
                className={`
                  text-left p-3 rounded-xl border transition-all text-xs font-semibold
                  ${isSelected 
                    ? 'bg-blue-600/10 border-blue-500/40 text-slate-100 shadow-md shadow-blue-500/5' 
                    : 'bg-slate-950/40 hover:bg-slate-900/30 border-slate-800/80 text-slate-400'
                  }
                `}
              >
                <div className="flex justify-between items-center mb-1.5 gap-2">
                  <span className="font-mono text-[10px] text-slate-500 font-bold">{dec.id}</span>
                  <Badge variant={statusColor} className="text-[9px] px-1.5 py-0">{dec.status}</Badge>
                </div>
                <div className={`truncate ${isSelected ? 'text-slate-100' : 'text-slate-300'}`}>
                  {dec.recommendation}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-500 font-mono">{dec.timestamp}</span>
                  <span className="text-[10px] text-blue-400 font-mono font-bold">Conf: {dec.confidence}%</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Decision Detail Panel */}
        <div className="md:col-span-3 bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between max-h-[350px] overflow-y-auto">
          {selectedDecision ? (
            <div className="space-y-4">
              {/* Recommendation Title */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">Decision Detail • {selectedDecision.id}</span>
                  <span className="text-xs font-mono font-extrabold text-blue-400">Confidence Match: {selectedDecision.confidence}%</span>
                </div>
                <h4 className="text-sm font-bold text-slate-100 mt-1">{selectedDecision.recommendation}</h4>
              </div>

              {/* Rationale and AI Logic */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AI Reasoning & Logic</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-900 font-medium">
                  {selectedDecision.rationale}
                </p>
              </div>

              {/* Impact Projection */}
              <div className="flex gap-2 items-start text-xs bg-blue-500/5 border border-blue-500/10 p-3 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-blue-400">Projected Egress Impact:</span>
                  <p className="text-slate-300 mt-0.5">{selectedDecision.impact}</p>
                </div>
              </div>

              {/* Suggested Action List */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Suggested Action Plan</span>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {selectedDecision.actions.map((act, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <ArrowRight className="h-3.5 w-3.5 text-slate-600 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Trigger */}
              <div className="pt-2 border-t border-slate-900 flex justify-end">
                <button 
                  className={`
                    inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg border transition-all
                    ${selectedDecision.status.includes('Deployed') || selectedDecision.status === 'Completed'
                      ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 border-blue-500 hover:bg-blue-500 text-slate-100'
                    }
                  `}
                  disabled={selectedDecision.status.includes('Deployed') || selectedDecision.status === 'Completed'}
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>{selectedDecision.status.includes('Deployed') || selectedDecision.status === 'Completed' ? 'Deployed' : 'Deploy Action Plan'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs font-semibold">
              Select a cognitive decision to inspect
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
export default RecSection;
