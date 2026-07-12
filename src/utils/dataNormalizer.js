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
export const normalizeStadiumData = (rows) => {
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
  const gates = latestRows.map(r => ({
    gateId: r.gate.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: r.gate,
    queueTime: r.queueLength, // minutes
    occupancy: r.occupancy,   // percentage
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
  }));

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
  
  return {
    timestamp: new Date().toISOString(),
    matchTime: firstRow.time || "12:00",
    averageQueueTime: avgQueue,
    maxQueueTime: maxQueue,
    crowdDensityLevel,
    gates,
    incidents,
    context: {
      weather: firstRow.weather || "Clear",
      parkingOccupancy: firstRow.parking || 0,
      transitDelay: firstRow.transitDelay || 0
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
export default normalizeStadiumData;
