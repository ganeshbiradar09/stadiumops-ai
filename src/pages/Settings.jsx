import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Settings, Sliders, Shield, BellRing, Cpu } from 'lucide-react';

export const SettingsPage = () => {
  const [venueName, setVenueName] = useState('FIFA Venue Alpha');
  const [capacity, setCapacity] = useState(75000);
  const [queueWarning, setQueueWarning] = useState(15);
  const [queueDanger, setQueueDanger] = useState(25);
  const [aiConfidence, setAiConfidence] = useState(85);

  const handleSave = (e) => {
    e.preventDefault();
    alert('System configurations saved successfully.');
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-500" />
          <span>System Configuration</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Fine-tuning operational alarm thresholds, venue capacities, and AI decision limits.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Venue Settings */}
          <Card title="Venue Metadata" subtitle="Core specifications for the active stadium profile">
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Stadium Profile Name</label>
                <input 
                  type="text" 
                  value={venueName} 
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Max Seat Capacity</label>
                  <input 
                    type="number" 
                    value={capacity} 
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Host City Location</label>
                  <input 
                    type="text" 
                    value="Metropolis, US" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-500 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Alarm Trigger Thresholds */}
          <Card title="Telemetry Thresholds" subtitle="Configure system alert levels for queue lengths and sensor status">
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Queue Warning (mins)</label>
                  <input 
                    type="number" 
                    value={queueWarning} 
                    onChange={(e) => setQueueWarning(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-300 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Queue Danger (mins)</label>
                  <input 
                    type="number" 
                    value={queueDanger} 
                    onChange={(e) => setQueueDanger(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-300 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Safety Index Threshold</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer">
                  <option>Strict (85% Safety Index trigger)</option>
                  <option>Moderate (75% Safety Index trigger)</option>
                  <option>Relaxed (65% Safety Index trigger)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* AI Decision Support Tuning */}
          <Card title="Decision Engine Parameters" subtitle="Tweak cognitive reasoning limits and dispatcher models">
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Active Dispatcher Model</label>
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                  <Cpu className="h-4 w-4 text-blue-400 shrink-0" />
                  <span className="text-xs font-mono font-semibold text-slate-300">StadiumOps-v2.6-Live (Fine-tuned)</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Minimum Confidence Threshold ({aiConfidence}%)</label>
                <input 
                  type="range" 
                  min="50" 
                  max="98"
                  value={aiConfidence} 
                  onChange={(e) => setAiConfidence(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1 font-semibold">
                  <span>50% (High Alert Rate)</span>
                  <span>98% (High Safety Focus)</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Integration webhooks */}
          <Card title="Perimeter Integrations" subtitle="Push notifications and system hooks endpoint settings">
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Staff Mobile Dispatch Webhook</label>
                <input 
                  type="url" 
                  placeholder="https://api.stadiumops.internal/dispatch/v1/webhook"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-300 focus:outline-none"
                  disabled
                />
              </div>
              <div className="flex items-center gap-3 bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                <BellRing className="h-4 w-4 text-blue-400 shrink-0" />
                <p className="text-[10px] text-slate-300">
                  Model decision dispatches trigger SMS and device alerts to active grid marshals automatically when approved.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Save Button Row */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
          <Button variant="secondary" size="md">
            Reset Defaults
          </Button>
          <Button type="submit" variant="primary" size="md">
            Save System Configurations
          </Button>
        </div>
      </form>
    </div>
  );
};
export default SettingsPage;
