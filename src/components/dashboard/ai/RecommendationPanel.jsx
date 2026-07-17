import React from 'react';
import { Card } from '../../common/Card';
import { BrainCircuit } from 'lucide-react';
import { isAiMode } from '../../../services/geminiService';
import { RecommendationCard } from './RecommendationCard';

export const RecommendationPanel = React.memo(({
  isAiProcessing,
  loadingStage,
  recommendations,
  resolvingId,
  rejectingId,
  onExplain,
  onReject,
  onApprove
}) => {
  return (
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
        {isAiProcessing ? (
          <div 
            className="h-[400px] flex flex-col items-center justify-center border border-slate-900 rounded-xl bg-slate-950/20 px-4"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            {/* Central spinner */}
            <div className="relative mb-5 flex items-center justify-center">
              <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>

            {/* Processing messages */}
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">
              Operational Engine Ingest
            </h3>
            <p className="text-xs text-blue-400 font-mono font-bold animate-pulse text-center mb-5">
              {loadingStage === 0 && "Connecting telemetry…"}
              {loadingStage === 1 && "Analyzing operational data…"}
              {loadingStage === 2 && "Generating AI recommendations…"}
            </p>

            {/* Progress bar */}
            <div className="w-56 bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-900 relative">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${
                    loadingStage === 0 ? '30%' :
                    loadingStage === 1 ? '65%' : '95%'
                  }`
                }}
              ></div>
            </div>

            {/* Sleek inline system status log */}
            <div className="mt-6 w-full max-w-xs bg-slate-950/60 border border-slate-900/60 rounded-lg p-2.5 font-mono text-[9px] text-slate-400 space-y-1.5 text-left h-24 overflow-y-auto">
              {loadingStage >= 0 && (
                <div className="text-blue-500/70 animate-fade-in">&gt; Connecting to perimeter devices... [OK]</div>
              )}
              {loadingStage >= 1 && (
                <div className="text-amber-500/70 animate-fade-in">&gt; Risk matrix validation active... [COMPUTING]</div>
              )}
              {loadingStage >= 2 && (
                <div className="text-emerald-500/70 animate-fade-in">&gt; Finalizing decision support lists... [READY]</div>
              )}
            </div>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs font-semibold border border-slate-900 rounded-xl bg-slate-950/20 animate-fade-in">
            <BrainCircuit className="h-10 w-10 text-slate-700 mb-3" />
            <span className="text-slate-300">No active operational insights.</span>
            <span className="text-[10px] text-slate-500 mt-1 max-w-xs text-center leading-relaxed">
              Operational engine is monitoring telemetry. Upload a new CSV dataset or run the demo presentation to trigger analysis.
            </span>
          </div>
        ) : (
          recommendations.map((rec, index) => (
            <RecommendationCard 
              key={rec.id}
              rec={rec}
              index={index}
              isResolving={resolvingId === rec.id}
              isRejecting={rejectingId === rec.id}
              onExplain={onExplain}
              onReject={onReject}
              onApprove={onApprove}
            />
          ))
        )}
      </div>
    </Card>
  );
});

RecommendationPanel.displayName = 'RecommendationPanel';
