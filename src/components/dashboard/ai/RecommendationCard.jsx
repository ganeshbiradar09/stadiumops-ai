import React from 'react';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import { HelpCircle, X, Check, CheckCircle2 } from 'lucide-react';

export const RecommendationCard = ({ 
  rec, 
  index, 
  isResolving, 
  isRejecting, 
  onExplain, 
  onReject, 
  onApprove 
}) => {
  let priorityVariant = 'info';
  if (rec.priority === 'Critical') priorityVariant = 'danger';
  if (rec.priority === 'High') priorityVariant = 'warning';
  
  let statusColor = 'slate';
  if (rec.status === 'Approved') statusColor = 'success';
  if (rec.status === 'Rejected') statusColor = 'danger';

  // Build the Confidence Bar
  const conf = rec.confidence || 0;
  const blocksTotal = 10;
  const blocksFilled = Math.round(conf / 10);
  const gaugeString = '█'.repeat(blocksFilled) + '░'.repeat(blocksTotal - blocksFilled);
  
  let confColor = 'text-emerald-400';
  let confLabel = 'HIGH CONFIDENCE';
  if (conf < 60) {
    confColor = 'text-rose-400';
    confLabel = 'LOW CONFIDENCE';
  } else if (conf < 85) {
    confColor = 'text-amber-400';
    confLabel = 'MEDIUM CONFIDENCE';
  }

  return (
    <div 
      key={rec.id} 
      style={{ animationDelay: `${index * 80}ms` }}
      className={`
        p-4 rounded-xl border bg-slate-950/30 flex flex-col gap-3 transition-all hover:bg-slate-900/10
        ${rec.status === 'Approved' ? 'border-emerald-950/40 bg-emerald-950/5' : rec.status === 'Rejected' ? 'border-rose-950/30' : 'border-slate-800'}
        animate-card-fade-in opacity-0
        ${isResolving ? 'animate-resolve-fade-out' : ''}
        ${isRejecting ? 'animate-resolve-fade-out' : ''}
      `}
    >
      {/* Card Header */}
      <div className="flex justify-between items-center gap-2">
        <Badge variant={priorityVariant}>{rec.priority}</Badge>
        <Badge variant={statusColor} className="text-[9px] px-1.5 py-0 uppercase">{rec.status}</Badge>
      </div>

      <h4 className="text-sm font-black text-blue-400 uppercase tracking-wider leading-tight">
        {rec.title}
      </h4>

      {/* Confidence Gauge */}
      <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-2 border border-slate-800/80">
        <div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Decision Confidence</span>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${confColor}`}>{confLabel}</span>
        </div>
        <div className={`font-mono text-base tracking-widest ${confColor}`}>
          <span className="opacity-80 text-xs mr-2">{conf}%</span>{gaugeString}
        </div>
      </div>
      
      {/* Evidence and Assumptions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
        <div className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-800/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Evidence</span>
          <ul className="space-y-1">
            {rec.evidence && rec.evidence.length > 0 ? rec.evidence.map((ev, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[10px] text-slate-300 font-medium">
                <CheckCircle2 className="h-3 w-3 text-emerald-500/70 shrink-0 mt-0.5" />
                <span>{ev}</span>
              </li>
            )) : (
              <li className="text-[10px] text-slate-500 italic">No evidence provided</li>
            )}
          </ul>
        </div>

        <div className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-800/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Assumptions</span>
          <ul className="space-y-1">
            {rec.assumptions && rec.assumptions.length > 0 ? rec.assumptions.map((assump, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[10px] text-slate-300 font-medium">
                <CheckCircle2 className="h-3 w-3 text-blue-500/70 shrink-0 mt-0.5" />
                <span>{assump}</span>
              </li>
            )) : (
              <li className="text-[10px] text-slate-500 italic">Standard assumptions apply</li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-1">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Recommended Action:</span>
        <p className="text-xs text-slate-100 font-bold leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-900 shadow-inner">
          {rec.recommended_action}
        </p>
      </div>

      {/* Expected Impact display instead of raw table */}
      <div className="bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10 mt-1">
        <span className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider block mb-1">Expected Impact</span>
        <div className="text-sm font-black text-emerald-300">
          {rec.expected_impact}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-end pt-2 mt-1 border-t border-slate-900/60">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[10px] font-bold gap-1"
          onClick={() => onExplain(rec)}
          aria-label={`Explain decision details for recommendation: ${rec.title}`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Explain Decision</span>
        </Button>
        
        {rec.status === 'Pending' && (
          <>
            <Button 
              variant="secondary" 
              size="sm" 
              className="text-[10px] text-rose-400 border-rose-950/20 hover:bg-rose-500/10 px-3"
              onClick={() => onReject(rec.id)}
              aria-label={`Reject recommendation: ${rec.title}`}
            >
              <X className="h-3.5 w-3.5" />
              <span>Reject</span>
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              className="text-[10px] bg-blue-600 hover:bg-blue-500 text-slate-100 px-4"
              onClick={() => onApprove(rec.id)}
              aria-label={`Approve recommendation: ${rec.title}`}
            >
              <Check className="h-3.5 w-3.5" />
              <span>Approve & Execute</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
