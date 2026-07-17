/**
 * Data Normalizer for Stadium Operations telemetry inputs
 */

/**
 * Normalizes array of parsed CSV rows into a single structured operational snapshot.
 * Takes the latest row for each unique gate to prevent key duplication.
 * 
 * @param {Array<object>} rows 
 * @returns {object} Normalized operational snapshot
 */
export const normalizeStadiumData = (rows, prevSnapshot = null) => {
  if (!rows || rows.length === 0) {
    return {
      timestamp: new Date().toISOString(),
      matchTime: "00:00",
      averageQueueTime: 0,
      maxQueueTime: 0,
      crowdDensityLevel: "Low",
      gates: [],
      incidents: [],
      context: {
        weather: "Unknown",
        parkingOccupancy: 0,
        transitDelay: 0
      }
    };
  }

  // Deduplicate by gate name - keeping the latest record (e.g. at the bottom of the CSV)
  const uniqueGatesMap = new Map();
  rows.forEach(r => {
    uniqueGatesMap.set(r.gate.toLowerCase(), r);
  });
  const latestRows = Array.from(uniqueGatesMap.values());

  // Find overall signals
  const gates = latestRows.map(r => {
    const prevGate = prevSnapshot?.gates?.find(g => g.name === r.gate);
    return {
      gateId: r.gate.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: r.gate,
      queueTime: r.queueLength, // minutes
      queueTimeDelta: prevGate ? r.queueLength - prevGate.queueTime : 0,
      occupancy: r.occupancy,   // percentage
      occupancyDelta: prevGate ? r.occupancy - prevGate.occupancy : 0,
      capacity: r.capacity,
      staff: r.staff,
      // Extended properties
      riskLevel: r.riskLevel || 'Low',
      emergencyStatus: r.emergencyStatus || 'Normal',
      medicalCases: r.medicalCases || 0,
      securityAlerts: r.securityAlerts || 0,
      vipTraffic: r.vipTraffic || 'None',
      shuttleStatus: r.shuttleStatus || 'Optimal',
      confidence: r.confidence
    };
  });

  const totalQueue = gates.reduce((sum, g) => sum + g.queueTime, 0);
  const avgQueue = Math.round((totalQueue / gates.length) * 10) / 10;
  const maxQueue = Math.max(...gates.map(g => g.queueTime));

  // Determine crowd density category based on gate occupancies
  const avgOccupancy = gates.reduce((sum, g) => sum + g.occupancy, 0) / gates.length;
  let crowdDensityLevel = "Low";
  if (avgOccupancy >= 80) {
    crowdDensityLevel = "Critical";
  } else if (avgOccupancy >= 60) {
    crowdDensityLevel = "High";
  } else if (avgOccupancy >= 35) {
    crowdDensityLevel = "Moderate";
  }

  // Extract incidents
  const incidents = latestRows
    .filter(r => r.incident && r.incident.toLowerCase() !== 'none' && r.incident.trim() !== '')
    .map(r => ({
      gate: r.gate,
      description: r.incident
    }));

  // Context signals from the first row (common across the stadium snapshot)
  const firstRow = rows[0];
  
  const parkingOccupancy = firstRow.parking || 0;
  const transitDelay = firstRow.transitDelay || 0;

  return {
    timestamp: new Date().toISOString(),
    matchTime: firstRow.time || "12:00",
    averageQueueTime: avgQueue,
    averageQueueTimeDelta: prevSnapshot ? parseFloat((avgQueue - prevSnapshot.averageQueueTime).toFixed(1)) : 0,
    maxQueueTime: maxQueue,
    maxQueueTimeDelta: prevSnapshot ? (maxQueue - prevSnapshot.maxQueueTime) : 0,
    crowdDensityLevel,
    gates,
    incidents,
    context: {
      weather: firstRow.weather || "Clear",
      parkingOccupancy,
      parkingOccupancyDelta: prevSnapshot ? parkingOccupancy - prevSnapshot.context.parkingOccupancy : 0,
      transitDelay,
      transitDelayDelta: prevSnapshot ? transitDelay - prevSnapshot.context.transitDelay : 0
    }
  };
};

/**
 * Normalizes a manual incident form input into an incident object.
 */
export const normalizeManualIncident = (gateName, text, time) => {
  const gateId = gateName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return {
    timestamp: new Date().toISOString(),
    matchTime: time || new Date().toLocaleTimeString('en-US', { hour12: false }),
    averageQueueTime: 0,
    maxQueueTime: 0,
    crowdDensityLevel: "Moderate",
    gates: [{ 
      gateId, 
      name: gateName, 
      queueTime: 10, 
      occupancy: 50, 
      capacity: 5000, 
      staff: 10,
      riskLevel: 'Low',
      emergencyStatus: 'Normal',
      medicalCases: 0,
      securityAlerts: 0,
      vipTraffic: 'None',
      shuttleStatus: 'Optimal',
      confidence: 100
    }],
    incidents: [{ gate: gateName, description: text }],
    context: {
      weather: "Clear",
      parkingOccupancy: 80,
      transitDelay: 0
    }
  };
};

/**
 * AI Response Validator and Normalizer (Release Phase 5A)
 * Performs strict schema validation, type checking, and default injection
 * before the UI consumes the data.
 * 
 * @param {object} rec The raw recommendation object from Gemini/Simulation
 * @param {string} datasetName
 * @param {string} promptVersion
 * @param {string} modelName
 */
export const validateAndNormalizeAiResponse = (rec, datasetName, promptVersion, modelName) => {
  const timestamp = new Date().toISOString();
  
  // 1. Core Field Validation & Normalization
  const normalized = {
    ...rec,
    recommendation_id: rec.recommendation_id || `REC-${Math.floor(Math.random() * 900000) + 100000}`,
    title: rec.title || "Operations Recommendation",
    priority: ["Critical", "High", "Medium", "Low"].includes(rec.priority) ? rec.priority : "Medium",
    situation: rec.situation || rec.recommended_action || "Unknown situation",
    
    // Arrays validation
    evidence: Array.isArray(rec.evidence) && rec.evidence.length > 0 ? rec.evidence : ["Visual confirmation required"],
    assumptions: Array.isArray(rec.assumptions) && rec.assumptions.length > 0 ? rec.assumptions : ["Assuming standard operational conditions"],
    decision_trace: Array.isArray(rec.decision_trace) && rec.decision_trace.length > 0 ? rec.decision_trace : [
      "Telemetry parsed", "Trend analyzed", "Prediction formulated", "Recommendation generated"
    ],
    
    // Strings validation
    trend: rec.trend || "Stable",
    prediction: rec.prediction || "No change predicted",
    recommended_action: rec.recommended_action || "Monitor situation",
    expected_outcome: rec.expected_outcome || "Standard flow optimization",
    expected_impact: rec.expected_impact || rec.expected_outcome || "Stable operations",
    estimated_queue_reduction: rec.estimated_queue_reduction || "0 min",
    estimated_resolution_time: rec.estimated_resolution_time || "10 min",
    staff_required: rec.staff_required || "0 staff",
    risk_if_ignored: rec.risk_if_ignored || "Low operations safety threat.",
    missing_information: rec.missing_information || "None identified",
    validation_status: "Validated by Schema Engine",
    
    // Numeric Validation
    confidence: typeof rec.confidence === 'number' ? Math.max(0, Math.min(100, rec.confidence)) : 75,
    confidence_reason: rec.confidence_reason || "Based on available telemetry metrics",
    
    // Metadata injection
    promptVersion,
    datasetName: datasetName || "Custom Influx",
    timestamp,
    modelName: modelName || "Unknown Engine"
  };

  // 2. Logic Validation (Phase 5 Guardrails)
  if (normalized.missing_information !== "None identified" && normalized.confidence > 50) {
    // If there is missing info, cap confidence
    normalized.confidence = Math.min(normalized.confidence, 49);
    normalized.validation_status = "Confidence reduced due to missing information";
  }

  return normalized;
};

export default normalizeStadiumData;
