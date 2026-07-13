import { generateRecommendations } from '../services/geminiService';
import { normalizeStadiumData } from './dataNormalizer';
import { saveDataset, saveRecommendation, updateRecommendationStatus, saveAuditLog } from '../services/firebaseService';

// Handle background loop ref
let telemetryInterval = null;
let approvedEffects = [];

export const recommendationEngine = {
  /**
   * Processes a newly parsed dataset (or synthetic dataset)
   */
  async processNewDataset(rows, datasetName) {
    // 1. Normalize
    const snapshot = normalizeStadiumData(rows);
    localStorage.setItem('stadiumops_active_snapshot', JSON.stringify(snapshot));
    localStorage.setItem('stadiumops_active_dataset_name', datasetName);

    // Populate initial chart history for dynamic charts (rolling 30 snapshots)
    const initialHistory = [];
    const baseTime = new Date();
    for (let i = 29; i >= 0; i--) {
      const pastTime = new Date(baseTime.getTime() - i * 12000);
      const timeStr = pastTime.toLocaleTimeString('en-US', { hour12: false }).slice(0, 8);
      initialHistory.push({
        time: timeStr.slice(0, 5),
        crowdSize: snapshot.gates.reduce((sum, g) => sum + Math.round(g.capacity * (g.occupancy / 100)), 0),
        flowRate: snapshot.gates.reduce((sum, g) => sum + g.queueTime * 5, 0)
      });
    }
    localStorage.setItem('stadiumops_chart_history', JSON.stringify(initialHistory));

    // Clear old active approved effects on new dataset ingestion
    approvedEffects = [];

    // 2. Save dataset snapshot to Firestore (with audit log)
    await saveDataset({
      datasetName,
      timestamp: new Date().toISOString(),
      snapshot
    });
    await saveAuditLog('DATASET_INGESTED', { datasetName, avgQueue: snapshot.averageQueueTime, gatesCount: snapshot.gates.length });

    // 3. Call Gemini (or rule-based simulation)
    const recommendations = await generateRecommendations(snapshot, datasetName);
    
    // Initialize recommendation status as 'Pending'
    const recsWithStatus = recommendations.map(rec => ({
      ...rec,
      status: 'Pending'
    }));

    // 4. Save each generated recommendation to Firestore (or mock localDb)
    const savedRecs = [];
    // Clear old timeline events when loading a new scenario
    localStorage.removeItem('stadiumops_timeline');

    for (const rec of recsWithStatus) {
      const saved = await saveRecommendation(rec);
      savedRecs.push({
        ...rec,
        id: saved.id
      });
      
      this.addTimelineEvent({
        id: saved.id,
        timestamp: rec.timestamp,
        incident: `Anomalies Flagged at ${datasetName}`,
        reasoning: rec.reasoning,
        recommendation: rec.recommended_action,
        confidence: rec.confidence,
        status: 'Pending',
        outcome: 'Awaiting manager response.'
      });
    }

    localStorage.setItem('stadiumops_active_recommendations', JSON.stringify(savedRecs));
    this.saveToHistory(savedRecs);
    
    // Start live telemetry twin ticks automatically after dataset load
    this.startLiveStreaming();

    // Dispatch update event
    window.dispatchEvent(new CustomEvent('stadiumops-telemetry-update', {
      detail: { snapshot }
    }));

    return { snapshot, recommendations: savedRecs };
  },

  /**
   * Approves a recommendation and triggers the Outcome Simulation
   */
  async approveRecommendation(recId) {
    const localRecs = this.getActiveRecommendations();
    const rec = localRecs.find(r => r.id === recId || r.recommendation_id === recId);
    if (!rec) return;

    const id = rec.id || recId;

    // Update db status and save audit log
    await updateRecommendationStatus(id, 'Approved');
    await saveAuditLog('RECOMMENDATION_APPROVED', { id, action: rec.recommended_action, staff: rec.staff_required });

    // Update local state
    const updated = localRecs.map(r => (r.id === id || r.recommendation_id === id) ? { ...r, status: 'Approved' } : r);
    localStorage.setItem('stadiumops_active_recommendations', JSON.stringify(updated));

    // Update timeline event with detailed outcome
    const outcome = `Approved - Dispatch action deployed. Estimated wait time reduced by ${rec.estimated_queue_reduction}. Staff required: ${rec.staff_required} deployed to checkpoint.`;
    this.updateTimelineEventStatus(id, 'Approved', outcome);

    // Parse targets to append active approved simulation effects
    let type = 'other';
    let slowName = '';
    let fastName = '';
    let gateName = '';

    if (rec.title.includes('Reroute')) {
      type = 'reroute';
      slowName = rec.title.replace('Reroute Ingress Flow: ', '').split(' to ')[0];
      fastName = rec.title.replace('Reroute Ingress Flow: ', '').split(' to ')[1];
    } else if (rec.title.includes('Remediate')) {
      type = 'incident';
      gateName = rec.title.replace('Remediate ', '').replace(' Incident', '');
    } else if (rec.title.includes('Security') || rec.title.includes('Medical')) {
      type = 'security_medical';
      gateName = rec.title.split(' to ')[1] || rec.title.split(' at ')[1];
    } else if (rec.title.includes('Transit') || rec.title.includes('Shuttles')) {
      type = 'transit';
    }

    approvedEffects.push({
      type,
      slowName,
      fastName,
      gateName,
      remainingTicks: 5
    });

    // Apply the first step of outcome simulation instantly for immediate UI feedback
    const snapshot = this.getActiveSnapshot();
    if (snapshot) {
      const updatedGates = snapshot.gates.map(gate => {
        let queue = gate.queueTime;
        let occ = gate.occupancy;
        let staff = gate.staff;
        let sec = gate.securityAlerts;
        let med = gate.medicalCases;
        let em = gate.emergencyStatus;

        if (type === 'reroute') {
          if (slowName && gate.name.toLowerCase().includes(slowName.toLowerCase())) {
            queue = Math.max(4, queue - 6);
            occ = Math.max(15, occ - 10);
          }
          if (fastName && gate.name.toLowerCase().includes(fastName.toLowerCase())) {
            queue = Math.min(45, queue + 2);
            occ = Math.min(95, occ + 4);
          }
        } else if (type === 'incident') {
          if (gateName && gate.name.toLowerCase().includes(gateName.toLowerCase())) {
            queue = Math.max(4, queue - 8);
            occ = Math.max(15, occ - 12);
          }
        } else if (type === 'security_medical') {
          if (gateName && gate.name.toLowerCase().includes(gateName.toLowerCase())) {
            sec = 0;
            med = 0;
            em = 'Normal';
            queue = Math.max(4, queue - 8);
          }
        }
        return { ...gate, queueTime: queue, occupancy: occ, staff, securityAlerts: sec, medicalCases: med, emergencyStatus: em };
      });

      let transitDelay = snapshot.context.transitDelay;
      if (type === 'transit') {
        transitDelay = Math.max(0, transitDelay - 8);
      }

      const totalQueue = updatedGates.reduce((sum, g) => sum + g.queueTime, 0);
      const avgQueue = Math.round((totalQueue / updatedGates.length) * 10) / 10;
      const maxQueue = Math.max(...updatedGates.map(g => g.queueTime));

      let incidents = snapshot.incidents;
      if (type === 'incident' && gateName) {
        incidents = incidents.filter(inc => !inc.gate.toLowerCase().includes(gateName.toLowerCase()));
      }

      const nextSnapshot = {
        ...snapshot,
        gates: updatedGates,
        averageQueueTime: avgQueue,
        maxQueueTime: maxQueue,
        incidents,
        context: {
          ...snapshot.context,
          transitDelay
        }
      };

      localStorage.setItem('stadiumops_active_snapshot', JSON.stringify(nextSnapshot));
      
      const datasetName = this.getActiveDatasetName();
      const nextRecs = await generateRecommendations(nextSnapshot, datasetName);
      const updatedRecs = nextRecs.map(newRec => {
        const matchedOld = updated.find(o => o.recommended_action === newRec.recommended_action || o.title === newRec.title);
        return {
          ...newRec,
          status: matchedOld ? matchedOld.status : 'Pending',
          id: matchedOld ? matchedOld.id : newRec.id || newRec.recommendation_id
        };
      });

      localStorage.setItem('stadiumops_active_recommendations', JSON.stringify(updatedRecs));
      this.saveToHistory(updatedRecs);
      
      // Dispatch immediately
      window.dispatchEvent(new CustomEvent('stadiumops-telemetry-update', {
        detail: { snapshot: nextSnapshot }
      }));
    }
  },

  /**
   * Rejects a recommendation
   */
  async rejectRecommendation(recId) {
    const localRecs = this.getActiveRecommendations();
    const rec = localRecs.find(r => r.id === recId || r.recommendation_id === recId);
    if (!rec) return;

    const id = rec.id || recId;

    // Update db status and save audit log
    await updateRecommendationStatus(id, 'Rejected');
    await saveAuditLog('RECOMMENDATION_REJECTED', { id, action: rec.recommended_action, risk: rec.risk_if_ignored });

    // Update local state
    const updated = localRecs.map(r => (r.id === id || r.recommendation_id === id) ? { ...r, status: 'Rejected' } : r);
    localStorage.setItem('stadiumops_active_recommendations', JSON.stringify(updated));

    // Update timeline event with risk outcomes
    const outcome = `Rejected - Manual bypass override active. Risk logged: "${rec.risk_if_ignored}"`;
    this.updateTimelineEventStatus(id, 'Rejected', outcome);
  },

  /**
   * Stops the active telemetry streaming loop
   */
  stopLiveStreaming() {
    if (telemetryInterval) {
      clearInterval(telemetryInterval);
      telemetryInterval = null;
    }
  },

  /**
   * Dynamic Telemetry Streaming Loop.
   * Simulates active real-time operations by adjusting metrics.
   */
  startLiveStreaming() {
    if (telemetryInterval) {
      clearInterval(telemetryInterval);
    }

    telemetryInterval = setInterval(async () => {
      const snapshot = this.getActiveSnapshot();
      if (!snapshot) {
        clearInterval(telemetryInterval);
        return;
      }

      // Simulate minor drifts
      let updatedGates = snapshot.gates.map(gate => {
        // Queue Length ±1–3
        const queueChange = Math.floor(Math.random() * 7) - 3;
        const newQueue = Math.max(1, Math.min(90, gate.queueTime + queueChange));

        // Occupancy ±1–2%
        const occChange = Math.floor(Math.random() * 5) - 2;
        const newOcc = Math.max(5, Math.min(100, gate.occupancy + occChange));

        // Staff ±0–1
        const staffChange = Math.floor(Math.random() * 3) - 1;
        const newStaff = Math.max(5, Math.min(100, gate.staff + staffChange));

        return {
          ...gate,
          queueTime: newQueue,
          occupancy: newOcc,
          staff: newStaff
        };
      });

      // Parking ±1%
      const parkingChange = Math.floor(Math.random() * 3) - 1;
      let newParking = Math.max(5, Math.min(100, snapshot.context.parkingOccupancy + parkingChange));

      // Transit Delay ±0–1 min
      const transitChange = Math.floor(Math.random() * 3) - 1;
      let newTransitDelay = Math.max(0, Math.min(120, snapshot.context.transitDelay + transitChange));

      let incidentsList = [...snapshot.incidents];

      // Apply active approved simulation outcomes over time
      approvedEffects = approvedEffects.filter(eff => {
        if (eff.remainingTicks <= 0) return false;
        
        if (eff.type === 'reroute') {
          const slowGate = updatedGates.find(g => g.name.toLowerCase().includes(eff.slowName?.toLowerCase()));
          const fastGate = updatedGates.find(g => g.name.toLowerCase().includes(eff.fastName?.toLowerCase()));
          if (slowGate) {
            slowGate.queueTime = Math.max(4, slowGate.queueTime - 4);
            slowGate.occupancy = Math.max(15, slowGate.occupancy - 6);
          }
          if (fastGate) {
            fastGate.queueTime = Math.min(45, fastGate.queueTime + 1.5);
            fastGate.occupancy = Math.min(95, fastGate.occupancy + 2);
          }
        } else if (eff.type === 'incident') {
          const targetGate = updatedGates.find(g => g.name.toLowerCase().includes(eff.gateName?.toLowerCase()));
          if (targetGate) {
            targetGate.queueTime = Math.max(4, targetGate.queueTime - 5);
            targetGate.occupancy = Math.max(15, targetGate.occupancy - 8);
          }
          incidentsList = incidentsList.filter(inc => !inc.gate.toLowerCase().includes(eff.gateName?.toLowerCase()));
        } else if (eff.type === 'security_medical') {
          const targetGate = updatedGates.find(g => g.name.toLowerCase().includes(eff.gateName?.toLowerCase()));
          if (targetGate) {
            targetGate.securityAlerts = 0;
            targetGate.medicalCases = 0;
            targetGate.emergencyStatus = 'Normal';
            targetGate.queueTime = Math.max(4, targetGate.queueTime - 6);
          }
        } else if (eff.type === 'transit') {
          newTransitDelay = Math.max(0, newTransitDelay - 4);
        }
        
        eff.remainingTicks--;
        return eff.remainingTicks > 0;
      });

      const totalQueue = updatedGates.reduce((sum, g) => sum + g.queueTime, 0);
      const avgQueue = Math.round((totalQueue / updatedGates.length) * 10) / 10;
      const maxQueue = Math.max(...updatedGates.map(g => g.queueTime));

      // Recalculate density level
      const avgOcc = updatedGates.reduce((sum, g) => sum + g.occupancy, 0) / updatedGates.length;
      let crowdDensityLevel = "Low";
      if (avgOcc >= 80) crowdDensityLevel = "Critical";
      else if (avgOcc >= 60) crowdDensityLevel = "High";
      else if (avgOcc >= 35) crowdDensityLevel = "Moderate";

      const updatedSnapshot = {
        ...snapshot,
        gates: updatedGates,
        averageQueueTime: avgQueue,
        maxQueueTime: maxQueue,
        crowdDensityLevel,
        incidents: incidentsList,
        context: {
          ...snapshot.context,
          parkingOccupancy: newParking,
          transitDelay: newTransitDelay
        }
      };

      localStorage.setItem('stadiumops_active_snapshot', JSON.stringify(updatedSnapshot));

      // Append point to sliding chart history (rolling 30 points)
      const historyRaw = localStorage.getItem('stadiumops_chart_history');
      if (historyRaw) {
        const history = JSON.parse(historyRaw);
        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 8);
        const totalOcc = updatedGates.reduce((sum, g) => sum + Math.round(g.capacity * (g.occupancy / 100)), 0);
        
        history.push({
          time: timeStr.slice(0, 5),
          crowdSize: totalOcc,
          flowRate: Math.round(updatedGates.reduce((sum, g) => sum + g.queueTime * 5, 0))
        });
        
        while (history.length > 30) {
          history.shift(); // Keep rolling last 30 points
        }
        localStorage.setItem('stadiumops_chart_history', JSON.stringify(history));
      }

      // Refresh recommendations based on the new telemetry snapshot
      const datasetName = localStorage.getItem('stadiumops_active_dataset_name') || "Live Ingest";
      const recommendations = await generateRecommendations(updatedSnapshot, datasetName);
      
      // Preserve existing statuses (Approved/Rejected) for unchanged recommendations if possible
      const oldRecs = this.getActiveRecommendations();
      const recsWithStatus = recommendations.map(newRec => {
        const matchedOld = oldRecs.find(o => o.recommended_action === newRec.recommended_action || o.title === newRec.title);
        return {
          ...newRec,
          status: matchedOld ? matchedOld.status : 'Pending',
          id: matchedOld ? matchedOld.id : newRec.id || newRec.recommendation_id
        };
      });

      localStorage.setItem('stadiumops_active_recommendations', JSON.stringify(recsWithStatus));
      this.saveToHistory(recsWithStatus);

      // Dispatch event to update UI instantly
      window.dispatchEvent(new CustomEvent('stadiumops-telemetry-update', {
        detail: { snapshot: updatedSnapshot }
      }));

    }, process.env.NODE_ENV === 'test' ? 10 : 8000);
  },

  /**
   * Storing in recommendation history, filtering out exact duplicates
   */
  saveToHistory(recommendations) {
    const raw = localStorage.getItem('stadiumops_recommendation_history');
    const history = raw ? JSON.parse(raw) : [];
    
    recommendations.forEach(rec => {
      const isDup = history.some(h => h.recommendation_id === rec.recommendation_id || (h.recommended_action === rec.recommended_action && h.timestamp === rec.timestamp));
      if (!isDup) {
        history.push(rec);
      }
    });

    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    localStorage.setItem('stadiumops_recommendation_history', JSON.stringify(history));
  },

  getRecommendationHistory() {
    const raw = localStorage.getItem('stadiumops_recommendation_history');
    return raw ? JSON.parse(raw) : [];
  },

  /**
   * Getters for Active Local State
   */
  getActiveSnapshot() {
    const raw = localStorage.getItem('stadiumops_active_snapshot');
    return raw ? JSON.parse(raw) : null;
  },

  getActiveDatasetName() {
    return localStorage.getItem('stadiumops_active_dataset_name') || "Fictional Telemetry Feed";
  },

  getActiveRecommendations() {
    const raw = localStorage.getItem('stadiumops_active_recommendations');
    return raw ? JSON.parse(raw) : [];
  },

  getChartHistory() {
    const raw = localStorage.getItem('stadiumops_chart_history');
    return raw ? JSON.parse(raw) : [];
  },

  /**
   * Timeline Methods
   */
  getTimeline() {
    const raw = localStorage.getItem('stadiumops_timeline');
    return raw ? JSON.parse(raw) : [];
  },

  addTimelineEvent(event) {
    const timeline = this.getTimeline();
    timeline.unshift(event);
    localStorage.setItem('stadiumops_timeline', JSON.stringify(timeline));
  },

  updateTimelineEventStatus(recId, status, outcome) {
    const timeline = this.getTimeline();
    const updated = timeline.map(evt => (evt.id === recId || evt.recommendation_id === recId) ? { ...evt, status, outcome } : evt);
    localStorage.setItem('stadiumops_timeline', JSON.stringify(updated));
    
    // Dispatch update event
    window.dispatchEvent(new CustomEvent('stadiumops-telemetry-update'));
  }
};

// Initialize streaming immediately if snapshot exists
if (recommendationEngine.getActiveSnapshot()) {
  recommendationEngine.startLiveStreaming();
}

export default recommendationEngine;
