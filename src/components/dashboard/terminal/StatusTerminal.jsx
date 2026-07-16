import React from 'react';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';

export const StatusTerminal = ({ timelineEvents }) => {
  return (
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
  );
};
