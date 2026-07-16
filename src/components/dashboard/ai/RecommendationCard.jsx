import React from 'react';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import { HelpCircle, X, Check } from 'lucide-react';

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
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Action Directive:</span>
        <p className="text-xs text-slate-100 font-extrabold mt-1 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
          {rec.recommended_action}
        </p>
      </div>

      {/* Operational Variables grid */}
      <div className="grid grid-cols-2 gap-3 text-[10px] bg-slate-950/30 p-2.5 rounded-lg border border-slate-900/60">
        <div>
          <span className="text-slate-400 block">Queue Reduction</span>
          <span className="text-slate-200 font-bold font-mono">{rec.estimated_queue_reduction}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Resolution ETA</span>
          <span className="text-slate-200 font-bold font-mono">{rec.estimated_resolution_time}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Staff Needed</span>
          <span className="text-slate-200 font-bold font-mono">{rec.staff_required}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Impact projection</span>
          <span className="text-slate-200 font-bold truncate block">{rec.expected_operational_impact}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-end pt-1 border-t border-slate-900/60">
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
              className="text-[10px] text-rose-400 border-rose-950/20 hover:bg-rose-500/10 px-2.5"
              onClick={() => onReject(rec.id)}
              aria-label={`Reject recommendation: ${rec.title}`}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              className="text-[10px] bg-blue-600 hover:bg-blue-500 text-slate-100 px-3.5"
              onClick={() => onApprove(rec.id)}
              aria-label={`Approve recommendation: ${rec.title}`}
            >
              <Check className="h-3.5 w-3.5" />
              <span>Approve</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
