import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { parseAndValidateCSV } from '../services/csvParser';
import { normalizeStadiumData } from '../utils/dataNormalizer';
import { recommendationEngine } from '../utils/recommendationEngine';
import { SYNTHETIC_DATASETS } from '../data/syntheticDatasets';
import { dataSourcesList } from '../data/mockStadiumData';
import { Database, Upload, FileText, ShieldAlert, Layers, ToggleLeft, ToggleRight } from 'lucide-react';

export const DataSources = () => {
  const navigate = useNavigate();
  const [selectedSyntheticKey, setSelectedSyntheticKey] = useState('normal_match');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationReport, setValidationReport] = useState(null);
  const [normalizedPreview, setNormalizedPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Incident Form inputs
  const [incidentText, setIncidentText] = useState('');
  const [incidentGate, setIncidentGate] = useState('Gate B (East)');

  // AI vs Simulation state
  const [forceSim, setForceSim] = useState(localStorage.getItem('stadiumops_force_simulation') === 'true');
  const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

  const toggleSimulationMode = () => {
    const nextVal = !forceSim;
    localStorage.setItem('stadiumops_force_simulation', String(nextVal));
    setForceSim(nextVal);
    // Reload active recommendations in engine with new mode flag
    const snapshot = recommendationEngine.getActiveSnapshot();
    if (snapshot) {
      recommendationEngine.processNewDataset(
        snapshot.gates.map(g => ({
          gate: g.name,
          queueLength: g.queueTime,
          occupancy: g.occupancy,
          capacity: g.capacity,
          staff: g.staff,
          weather: snapshot.context.weather,
          incident: snapshot.incidents.map(i => i.description).join('; ') || 'None',
          parking: snapshot.context.parkingOccupancy,
          transitDelay: snapshot.context.transitDelay,
          time: snapshot.matchTime
        })),
        recommendationEngine.getActiveDatasetName()
      );
    }
  };

  // 1. Handle Synthetic Ingestion
  const handleLoadSynthetic = async () => {
    setIsProcessing(true);
    try {
      const dataset = SYNTHETIC_DATASETS[selectedSyntheticKey];
      const parsed = parseAndValidateCSV(dataset.csv);
      
      if (parsed.processedRows.length > 0) {
        localStorage.setItem('stadiumops_trigger_loading', 'true');
        await recommendationEngine.processNewDataset(parsed.processedRows, dataset.name);
        alert(`Successfully loaded and analyzed "${dataset.name}". Redirecting to Dashboard...`);
        navigate('/');
      } else {
        alert("Failed to process synthetic dataset. Check syntax.");
      }
    } catch (err) {
      console.error(err);
      alert("Error parsing synthetic data.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Handle CSV File drag-and-drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUploadKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      document.getElementById('file-upload').click();
    }
  };

  const handleFile = (file) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const parsed = parseAndValidateCSV(text);
      setValidationReport(parsed);
      
      if (parsed.processedRows.length > 0) {
        // Pre-normalize valid rows for the UI preview card
        const previewSnapshot = normalizeStadiumData(parsed.processedRows);
        setNormalizedPreview(previewSnapshot);
      } else {
        setNormalizedPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadUploadedCSV = async () => {
    if (!validationReport || validationReport.processedRows.length === 0) return;
    setIsProcessing(true);
    try {
      localStorage.setItem('stadiumops_trigger_loading', 'true');
      await recommendationEngine.processNewDataset(validationReport.processedRows, `CSV Upload: ${selectedFile.name}`);
      alert("Successfully loaded and analyzed CSV dataset. Redirecting to Dashboard...");
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("Error running analysis on uploaded dataset.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Handle Incident Form submissions
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!incidentText.trim()) return;
    setIsProcessing(true);
    try {
      const currentSnapshot = recommendationEngine.getActiveSnapshot() || {
        gates: [
          { name: "Gate A (North)", queueTime: 5, occupancy: 40, capacity: 15000, staff: 32 },
          { name: "Gate B (East)", queueTime: 6, occupancy: 42, capacity: 20000, staff: 45 },
          { name: "Gate C (Southeast)", queueTime: 5, occupancy: 40, capacity: 15000, staff: 35 },
          { name: "Gate D (South)", queueTime: 6, occupancy: 42, capacity: 15000, staff: 32 },
          { name: "Gate E (West)", queueTime: 5, occupancy: 40, capacity: 15000, staff: 32 },
          { name: "Gate F (VIP/Skybox)", queueTime: 2, occupancy: 12, capacity: 5000, staff: 18 }
        ],
        context: { weather: "Clear", parkingOccupancy: 80, transitDelay: 0 }
      };

      // Feed incident details into the gates list
      const rows = currentSnapshot.gates.map(gate => {
        const isTarget = gate.name.includes(incidentGate.split(' ')[0]);
        return {
          gate: gate.name,
          queueLength: isTarget ? Math.max(25, gate.queueTime + 18) : gate.queueTime, // Saturated queue
          occupancy: isTarget ? Math.max(90, gate.occupancy + 35) : gate.occupancy,
          capacity: gate.capacity,
          staff: gate.staff,
          weather: currentSnapshot.context.weather,
          incident: isTarget ? incidentText : 'None',
          parking: currentSnapshot.context.parkingOccupancy,
          transitDelay: currentSnapshot.context.transitDelay,
          time: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5)
        };
      });

      localStorage.setItem('stadiumops_trigger_loading', 'true');
      await recommendationEngine.processNewDataset(rows, "Manual Incident Override");
      alert("Manual Incident logged. Redirecting to Dashboard...");
      setIncidentText('');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("Error dispatching manual report.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Header with Connectivity Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/30 p-4 border border-slate-900 rounded-xl">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-500" />
            <span>Operations Data Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Supervising active API telemetry streams, cloud databases, and manual files ingestion.</p>
        </div>
        
        {/* Model Connectivity Alert Toggler */}
        <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <div className="text-left font-mono">
            <span className="text-[9px] text-slate-400 block">Gemini API status</span>
            <div className="text-xs font-bold text-slate-200">
              {hasApiKey ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  Active in env
                </span>
              ) : (
                <span className="text-slate-400">Not configured (.env)</span>
              )}
            </div>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <button 
            onClick={toggleSimulationMode}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-sm"
            role="switch"
            aria-checked={!forceSim && hasApiKey}
            aria-label="Toggle Gemini API Live Mode"
          >
            {forceSim || !hasApiKey ? (
              <>
                <ToggleLeft className="h-5 w-5 text-slate-400" />
                <span>Simulation Active</span>
              </>
            ) : (
              <>
                <ToggleRight className="h-5 w-5 text-blue-500" />
                <span>Gemini Live Active</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ingestion & Previews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Synthetic Dataset */}
          <Card title="Synthetic Scenario Ingestor" subtitle="Simulate specific World Cup stadium operational conditions for testing">
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Select Scenario</label>
                <select 
                  value={selectedSyntheticKey}
                  onChange={(e) => setSelectedSyntheticKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                >
                  {Object.entries(SYNTHETIC_DATASETS).map(([key, dataset]) => (
                    <option key={key} value={key}>{dataset.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-2">
                  {SYNTHETIC_DATASETS[selectedSyntheticKey].description}
                </p>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={handleLoadSynthetic} 
                  disabled={isProcessing}
                  className="w-full sm:w-auto"
                >
                  {isProcessing ? 'Processing Scenario...' : 'Ingest & Run GenAI Analysis'}
                </Button>
              </div>
            </div>
          </Card>

          {/* CSV Normalization Preview Panel */}
          {selectedFile && normalizedPreview && (
            <Card 
              title="CSV Pre-Normalization Preview" 
              subtitle="Aggregated values computed from parsed spreadsheet before loading"
              headerAction={<Badge variant="success">Normalized Successfully</Badge>}
            >
              <div className="mt-4 space-y-4 font-mono">
                {/* Overall Telemetry */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/60 p-3 rounded-lg border border-slate-900 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Weather Condition</span>
                    <span className="text-slate-200 font-bold">{normalizedPreview.context.weather}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Parking Fill</span>
                    <span className="text-slate-200 font-bold">{normalizedPreview.context.parkingOccupancy}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Transit Delay</span>
                    <span className="text-slate-200 font-bold">{normalizedPreview.context.transitDelay} mins</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Average Wait Time</span>
                    <span className="text-blue-400 font-bold">{normalizedPreview.averageQueueTime} mins</span>
                  </div>
                </div>

                {/* Gates Parsed */}
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase mb-1">Parsed Gate Checkpoints</span>
                  <div className="max-h-[160px] overflow-y-auto border border-slate-900 rounded-lg divide-y divide-slate-900">
                    {normalizedPreview.gates.map((g, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 text-[11px] hover:bg-slate-900/10">
                        <span className="font-bold text-slate-300">{g.name}</span>
                        <div className="flex gap-4">
                          <span>Queue: <span className="text-blue-400 font-bold">{g.queueTime}m</span></span>
                          <span>Load: <span className="text-purple-400 font-bold">{g.occupancy}%</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Active Registry Feed */}
          <Card title="Telemetry Stream Registry" subtitle="Active real-time webhooks and cloud database adapters">
            <div className="mt-4 space-y-3">
              {dataSourcesList.map((src) => {
                const isActive = src.status === 'Connected';
                return (
                  <div key={src.id} className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex gap-3 items-center">
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{src.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          Format: {src.type} | Sync: {src.frequency}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 self-end sm:self-center font-mono">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Processed Logs</span>
                        <span className="text-xs text-slate-300 font-semibold">{src.recordsProcessed.toLocaleString()}</span>
                      </div>
                      <Badge variant={isActive ? 'success' : 'slate'}>{src.status}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Upload Portal & Manual Log Input */}
        <div className="space-y-6">
          {/* CSV File Upload Card */}
          <Card title="CSV Ingestion Terminal" subtitle="Upload ticketing logs or device metrics manual spreadsheets">
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onKeyDown={handleUploadKeyDown}
              tabIndex={0}
              role="button"
              aria-label="CSV file upload dropzone"
              className={`
                mt-4 border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[160px] focus:outline-none focus:ring-2 focus:ring-blue-500/50
                ${dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'}
              `}
            >
              <input 
                id="file-upload" 
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleFileInput}
              />
              
              {!selectedFile && (
                <label htmlFor="file-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                  <Upload className="h-8 w-8 text-slate-400 mb-3" />
                  <span className="text-xs font-bold text-slate-200">Drag & drop CSV file or <span className="text-blue-400">browse</span></span>
                  <span className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">Supports Gate, Queue, Occupancy, Capacity...</span>
                </label>
              )}

              {selectedFile && validationReport && (
                <div className="flex flex-col items-center w-full">
                  <FileText className="h-8 w-8 text-blue-400 mb-2" />
                  <span className="text-xs font-bold text-slate-200 truncate max-w-[200px]">{selectedFile.name}</span>
                  
                  {/* Validation Summary Report */}
                  <div className="mt-3 w-full bg-slate-950/60 p-2.5 rounded-lg border border-slate-900 text-left space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Processed Rows:</span>
                      <span className="text-emerald-400 font-bold font-mono">{validationReport.summary.processed}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Rejected Rows:</span>
                      <span className="text-rose-400 font-bold font-mono">{validationReport.summary.rejected}</span>
                    </div>
                  </div>

                  {validationReport.summary.processed > 0 && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={handleLoadUploadedCSV}
                      disabled={isProcessing}
                      className="mt-3.5 w-full text-[10px]"
                    >
                      {isProcessing ? 'Analyzing...' : 'Run GenAI on Valid Rows'}
                    </Button>
                  )}

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-1 text-[9px] text-slate-400 hover:text-slate-300"
                    onClick={() => {
                      setSelectedFile(null);
                      setValidationReport(null);
                      setNormalizedPreview(null);
                    }}
                  >
                    Clear File
                  </Button>
                </div>
              )}
            </div>

            {/* Validation Rejection Log Listing */}
            {validationReport && validationReport.rejectedRows.length > 0 && (
              <div className="mt-4 bg-rose-500/5 border border-rose-500/10 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-rose-400">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">CSV Validation Warnings</span>
                </div>
                <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
                  {validationReport.rejectedRows.map((err, idx) => (
                    <div key={idx} className="bg-slate-950 p-2 rounded border border-rose-950/30 text-[10px] font-mono leading-normal">
                      <span className="text-rose-400 font-bold">Line {err.line}:</span> <span className="text-slate-400">{err.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Manual Incident Log Entry */}
          <Card title="Manual Incident Form" subtitle="Log incidents or blockages directly to the control deck">
            <form onSubmit={handleManualSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="affectedCheckpoint" className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Affected Checkpoint</label>
                <select 
                  id="affectedCheckpoint"
                  value={incidentGate}
                  onChange={(e) => setIncidentGate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                >
                  <option>Gate A (North)</option>
                  <option>Gate B (East)</option>
                  <option>Gate C (Southeast)</option>
                  <option>Gate D (South)</option>
                  <option>Gate E (West)</option>
                </select>
              </div>
              <div>
                <label htmlFor="overrideLogDetails" className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Override Log Details</label>
                <textarea
                  id="overrideLogDetails"
                  value={incidentText}
                  onChange={(e) => setIncidentText(e.target.value)}
                  placeholder="e.g. Turnstile scanner failure detected. Ticket queues building up. Redirect flow."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isProcessing}
                className="w-full text-xs font-bold uppercase tracking-wider"
              >
                {isProcessing ? 'Analyzing...' : 'Log & Run GenAI Decision'}
              </Button>
            </form>
          </Card>
        </div>

      </div>
    </div>
  );
};
export default DataSources;
