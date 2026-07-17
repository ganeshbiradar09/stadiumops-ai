import { PROMPT_VERSION } from '../prompts/stadiumSystemPrompt';
import { validateAndNormalizeAiResponse } from './dataNormalizer';

/**
 * Fallback Rule-Based Simulation Engine.
 * Runs when VITE_GEMINI_API_KEY is not configured or in force-simulation.
 * Mimics Gemini reasoning over data anomalies for judge testing dynamically.
 */
export const runSimulationMode = (normalizedData, datasetName) => {
  const recommendations = [];
  const timestamp = new Date().toISOString();

  // Find all gates with queue time > 15
  const slowGates = normalizedData.gates.filter(g => g.queueTime > 15);
  // Find all gates with queue time <= 10
  const fastGates = normalizedData.gates.filter(g => g.queueTime <= 10 && g.occupancy < 75);

  // 1. Dynamic Crowd Flow Rerouting Recommendation
  if (slowGates.length > 0 && fastGates.length > 0) {
    const primarySlow = [...slowGates].sort((a, b) => b.queueTime - a.queueTime)[0];
    const primaryFast = [...fastGates].sort((a, b) => a.queueTime - b.queueTime)[0];
    
    const queueDiff = primarySlow.queueTime - primaryFast.queueTime;
    const estReduction = Math.round(queueDiff * 0.8) + 5; // e.g. 24%
    const staffNeeded = Math.max(4, Math.round(primarySlow.queueTime / 3));
    const etaVal = `${Math.round(primarySlow.queueTime * 0.4 + 4)} min`;

    recommendations.push({
      recommendation_id: `REC-${Math.floor(Math.random() * 900000) + 100000}`,
      title: `Reroute Ingress Flow: ${primarySlow.name} to ${primaryFast.name}`,
      priority: primarySlow.queueTime >= 25 ? "Critical" : "High",
      situation: `Congested ${primarySlow.name} (${primarySlow.queueTime}m queue) while nearby ${primaryFast.name} has only ${primaryFast.queueTime}m queue.`,
      evidence: [
        `${primarySlow.name} queue is saturated at ${primarySlow.queueTime} minutes wait time`,
        `${primaryFast.name} has available checking capacity (${primaryFast.occupancy}% load)`,
        `Dynamic pedestrian pathways link both checkpoint plazas`
      ],
      trend: "Queue times at primary gate are accelerating exponentially.",
      prediction: "Total gate lockup and boundary failure within 15 minutes.",
      confidence: 85 + Math.min(10, Math.round(primarySlow.queueTime / 4)),
      confidence_reason: `High confidence based on stable deterministic delta between ${primarySlow.name} and ${primaryFast.name}.`,
      assumptions: ["Crowd will follow dynamic signage", "No localized blockages on connecting pathway"],
      decision_trace: [
        `Identified bottleneck at ${primarySlow.name} (${primarySlow.queueTime}m)`,
        `Scanned adjacent gates for available capacity`,
        `Identified ${primaryFast.name} (${primaryFast.queueTime}m)`,
        `Calculated routing differential impact`,
        `Generated recommendation`
      ],
      recommended_action: `Redirect 35% of incoming visitor flow from ${primarySlow.name} to ${primaryFast.name}. Adjust perimeter dynamic display signage to guide incoming flow.`,
      expected_outcome: `Balances security check ingress, draining queues at ${primarySlow.name} and reducing average queue lengths across the stadium.`,
      expected_impact: `Queue reduction by ${estReduction}% (${etaVal} recovery)`,
      estimated_queue_reduction: `${estReduction}%`,
      estimated_resolution_time: etaVal,
      staff_required: `${staffNeeded} stewards`,
      risk_if_ignored: `Extreme turnstile crowd congestion at ${primarySlow.name}, causing ticket checker delays and physical crushing risks near perimeter fences.`
    });
  }

  // 2. Incident-Based Recommendations
  normalizedData.incidents.forEach((inc, idx) => {
    let priority = "High";
    let staff = "4 marshals";
    let action = `Dispatch security and maintenance agents to investigate ${inc.gate} incident: "${inc.description}".`;
    let risk = "Security validation failure and turnstile crowd build-ups.";
    
    if (inc.description.toLowerCase().includes('validator') || inc.description.toLowerCase().includes('outage') || inc.description.toLowerCase().includes('terminal')) {
      priority = "Critical";
      staff = "2 technicians, 4 stewards";
      action = `Dispatch local technical support agent 'Delta' to Gate B turnstiles to restart ticket validators and manual bypass lanes.`;
      risk = "Total gate lockup, spectator entry delays, and perimeter checkpoint spillover.";
    } else if (inc.description.toLowerCase().includes('rain') || inc.description.toLowerCase().includes('weather') || inc.description.toLowerCase().includes('wet') || inc.description.toLowerCase().includes('water')) {
      priority = "High";
      staff = "12 stewards";
      action = `Deploy rain canopies over scanner turnstiles at all gates. Supply handheld ticket sweepers.`;
      risk = "Device malfunctions, slippery concourses, and queue delays.";
    }

    recommendations.push({
      recommendation_id: `REC-${Math.floor(Math.random() * 900000) + 100000}`,
      title: `Remediate ${inc.gate} Incident`,
      priority,
      situation: `Manual override logged incident: "${inc.description}" at ${inc.gate}.`,
      evidence: [
        `Active override log flag registered: "${inc.description}"`,
        `Safety impact rating evaluated as ${priority}`
      ],
      trend: "Throughput is steadily dropping at this checkpoint.",
      prediction: "Failure to remediate will cause bottleneck and concourse spillover.",
      confidence: 95 - idx,
      recommended_action: action,
      expected_outcome: "Remediation of bottleneck, restoring standard access throughput rates.",
      estimated_queue_reduction: "20%",
      estimated_resolution_time: "8 min",
      eta: "8 min",
      staff_required: staff,
      risk_if_ignored: risk,
      promptVersion: PROMPT_VERSION,
      datasetName: datasetName || "Live Ingest",
      timestamp,
      modelName: "Simulation-Engine-Cognitive-v3"
    });
  });

  // 3. Security Alarms and Medical Emergencies
  normalizedData.gates.forEach(gate => {
    if (gate.securityAlerts > 0 || gate.emergencyStatus !== 'Normal') {
      const staffCount = Math.max(4, gate.securityAlerts * 3);
      recommendations.push({
        recommendation_id: `REC-${Math.floor(Math.random() * 900000) + 100000}`,
        title: `Emergency Security Dispatch to ${gate.name}`,
        priority: "Critical",
        situation: `Active security alerts (${gate.securityAlerts}) detected at ${gate.name}. Emergency status: ${gate.emergencyStatus}.`,
        evidence: [
          `Security alerts logged: ${gate.securityAlerts} reports at checkpoint`,
          `Gate emergency flag: "${gate.emergencyStatus}"`
        ],
        trend: "Escalating security incident reports in the perimeter zone.",
        prediction: "Local fence breach risk and unchecked crowd surge if uncontained.",
        confidence: 96,
        recommended_action: `Dispatch ${staffCount} tactical officers and coordinate local perimeter sweep near ${gate.name}.`,
        expected_outcome: `Restores boundary control, secures incoming spectator check lanes.`,
        estimated_queue_reduction: "N/A",
        estimated_resolution_time: "5 min",
        eta: "5 min",
        staff_required: `${staffCount} officers`,
        risk_if_ignored: `Spectator entry security failure, local fence breach risk, and unchecked crowd surge.`,
        promptVersion: PROMPT_VERSION,
        datasetName: datasetName || "Live Ingest",
        timestamp,
        modelName: "Simulation-Engine-Cognitive-v3"
      });
    }

    if (gate.medicalCases > 0) {
      const medSquads = Math.max(1, Math.round(gate.medicalCases / 2));
      recommendations.push({
        recommendation_id: `REC-${Math.floor(Math.random() * 900000) + 100000}`,
        title: `Medical Squad Influx at ${gate.name}`,
        priority: "High",
        situation: `${gate.medicalCases} medical case logs registered near ${gate.name} access concourse.`,
        evidence: [
          `${gate.medicalCases} medical case logs registered near gate area`,
          "First-aid concourse station available"
        ],
        trend: "Medical incidents causing compounding walkway blockages.",
        prediction: "Secondary safety hazards and localized crowd congestion if left untreated.",
        confidence: 91,
        recommended_action: `Deploy ${medSquads} first-aid squad(s) to ${gate.name} concourse. Instruct stewards to open path routes for emergency egress.`,
        expected_outcome: `Treats distressed spectators, eliminates walkway blockage, and maintains queue entry flow rate.`,
        estimated_queue_reduction: "10%",
        estimated_resolution_time: "8 min",
        eta: "8 min",
        staff_required: `${medSquads * 2} responders`,
        risk_if_ignored: `Delayed medical attention for spectators, localized crowd congestion, and secondary safety blockages.`,
        promptVersion: PROMPT_VERSION,
        datasetName: datasetName || "Live Ingest",
        timestamp,
        modelName: "Simulation-Engine-Cognitive-v3"
      });
    }
  });

  // 4. Transit Delays
  if (normalizedData.context.transitDelay > 0) {
    const delay = normalizedData.context.transitDelay;
    const extraShuttles = Math.min(12, Math.max(4, Math.round(delay * 0.4)));
    recommendations.push({
      recommendation_id: `REC-${Math.floor(Math.random() * 900000) + 100000}`,
      title: `Deploy Transit Shuttles (Delay: ${delay} min)`,
      priority: delay >= 20 ? "High" : "Medium",
      situation: `Active delays of ${delay} minutes on municipal train lines causing egress congestion.`,
      evidence: [
        `Transit train delay is ${delay} minutes`,
        "Lot D shuttle staging area has active passenger build-ups"
      ],
      trend: "Passenger volume in transit plazas is growing without sufficient egress capacity.",
      prediction: "Gridlock at exit gate zones and highway pedestrian spillover hazards.",
      confidence: 88,
      recommended_action: `Deploy ${extraShuttles} reserve electric shuttles to link Lot D with alternative station hubs. Adjust local highway signal priority.`,
      expected_outcome: `Smooths exit congestion, maintains steady egress throughput.`,
      estimated_queue_reduction: "25%",
      estimated_resolution_time: "15 min",
      eta: "15 min",
      staff_required: `${extraShuttles} shuttle drivers`,
      risk_if_ignored: `Spectator gridlock at exit gate zones, highway pedestrian spillover hazards, and transit delays.`,
      promptVersion: PROMPT_VERSION,
      datasetName: datasetName || "Live Ingest",
      timestamp,
      modelName: "Simulation-Engine-Cognitive-v3"
    });
  }

  // 5. Weather Hazards
  if (normalizedData.context.weather && normalizedData.context.weather !== 'Clear' && normalizedData.context.weather !== 'Unknown') {
    const weather = normalizedData.context.weather;
    recommendations.push({
      recommendation_id: `REC-${Math.floor(Math.random() * 900000) + 100000}`,
      title: `Weather Response: ${weather} Protocol`,
      priority: weather === 'Heavy Rain' ? "High" : "Medium",
      situation: `Active weather sensors report: ${weather}`,
      evidence: [
        `Active weather sensors report: ${weather}`,
        "Turnstile canopy covers pre-staged in plaza lockers"
      ],
      trend: "Weather degradation risking validator scanner performance.",
      prediction: "Validator hardware failures, ticket verification backlogs, and walkway slip injuries.",
      confidence: 90,
      recommended_action: `Deploy protective turnstile canopies. Distribute handheld backup scanners to gate stewards. Set up wet floor signs in concourses.`,
      expected_outcome: `Protects access checkpoint devices, avoids rain-induced check delays.`,
      estimated_queue_reduction: "15%",
      estimated_resolution_time: "10 min",
      eta: "10 min",
      staff_required: "8 stewards",
      risk_if_ignored: `Validator hardware failures, ticket verification backlogs, and walkway slip injuries.`,
      promptVersion: PROMPT_VERSION,
      datasetName: datasetName || "Live Ingest",
      timestamp,
      modelName: "Simulation-Engine-Cognitive-v3"
    });
  }

  // 6. Default Normal Case
  if (recommendations.length === 0) {
    recommendations.push({
      recommendation_id: `REC-${Math.floor(Math.random() * 900000) + 100000}`,
      title: "Maintain Standard Ingress Operations",
      priority: "Low",
      situation: "Stadium networks are running within normal parameters. Ingress streams are balanced.",
      evidence: [
        "All access wait times under 10 minutes",
        "Sensors reporting clear weather play conditions",
        "No device failures or incidents registered"
      ],
      trend: "Stable crowd dynamics across all sectors.",
      prediction: "Operations will remain optimal.",
      confidence: 98,
      confidence_reason: "High baseline stability across all ingest parameters.",
      assumptions: ["No unpredictable macroscopic events", "Weather holds clear"],
      decision_trace: ["All telemetry optimal", "Zero incidents found", "Maintain protocol"],
      recommended_action: "Maintain standard shift roster. Continue monitoring automated feeds.",
      expected_outcome: "Operations remain optimal. No change required.",
      expected_impact: "Stable zero-defect operational baseline",
      estimated_queue_reduction: "0%",
      estimated_resolution_time: "N/A",
      staff_required: "Standard shift",
      risk_if_ignored: "None. Maintain standard operations monitoring."
    });
  }

  // Validate and normalize all simulated recommendations just like real AI ones
  return recommendations.map(rec => 
    validateAndNormalizeAiResponse(rec, datasetName, PROMPT_VERSION, "Simulation-Engine-Cognitive-v3")
  );
};
