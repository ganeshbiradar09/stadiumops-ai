// Version metadata for Prompt Engineering tracking
export const PROMPT_VERSION = "3.0-EnterpriseReasoning-Schema";

export const STADIUM_SYSTEM_PROMPT = `
You are an expert FIFA Stadium Operations Decision Support AI for the World Cup 2026.
Your primary role is to assist the Stadium Operations Manager and Tournament Organizers in Crowd Management and Operational Intelligence.

You will receive a JSON object representing the stadium status:
- Gate details (Queue time, load/occupancy, staff, alarms, medical incidents, emergency status)
- Context details (Weather, parking occupancy, transit delays)

Your task is to analyze these combined signals to spot operational hazards, bottlenecks, safety risks, and flow inefficiencies, and output a structured list of recommendations.

CRITICAL INSTRUCTIONS (HALLUCINATION GUARDRAILS):
1. You must act as a decision support engine, NOT a chatbot.
2. If evidence conflicts (e.g., high density but low queue time), you MUST output confidence < 50 and explicitly note the contradiction in 'missing_information'.
3. If critical telemetry is missing, recommend 'Monitor Situation' rather than fabricating a response.
4. NEVER fabricate numbers or metrics. Use only the provided data.
5. You must explicitly state your assumptions (e.g., 'Assuming weather remains clear').
6. Mark uncertainty explicitly in the 'confidence_reason' field.
`;

export const STADIUM_RESPONSE_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      recommendation_id: { type: "STRING", description: "Unique 6-digit random number (e.g. REC-123456)" },
      title: { type: "STRING", description: "Title describing the action" },
      priority: { type: "STRING", enum: ["Critical", "High", "Medium", "Low"] },
      situation: { type: "STRING", description: "Current state of the stadium/gate" },
      evidence: { type: "ARRAY", items: { type: "STRING" }, description: "Metrics backing up the situation" },
      trend: { type: "STRING", description: "What the historical trajectory looks like" },
      prediction: { type: "STRING", description: "What will happen if we do nothing" },
      confidence: { type: "NUMBER", description: "Between 0 and 100" },
      confidence_reason: { type: "STRING", description: "Why this confidence score was chosen, noting any uncertainty" },
      assumptions: { type: "ARRAY", items: { type: "STRING" }, description: "Explicit assumptions made (e.g. 'Weather holds')" },
      missing_information: { type: "STRING", description: "What data is conflicting, missing, or unknown?" },
      decision_trace: { type: "ARRAY", items: { type: "STRING" }, description: "Step-by-step logic: Telemetry -> Trend -> Prediction -> Action" },
      recommended_action: { type: "STRING", description: "The exact operational directive" },
      expected_outcome: { type: "STRING", description: "Anticipated results" },
      expected_impact: { type: "STRING", description: "Measurable impact, e.g., 'Queue reduction by 15 mins'" },
      estimated_queue_reduction: { type: "STRING", description: "e.g., '25%'" },
      estimated_resolution_time: { type: "STRING", description: "e.g., '15 min'" },
      staff_required: { type: "STRING", description: "e.g., '8 stewards'" },
      risk_if_ignored: { type: "STRING", description: "The safety hazard if rejected" },
      validation_status: { type: "STRING", description: "Always 'Pending Validation' by default" }
    },
    required: [
      "recommendation_id", "title", "priority", 
      "situation", "evidence", "trend", "prediction",
      "confidence", "confidence_reason", "assumptions", "missing_information", "decision_trace",
      "recommended_action", "expected_outcome", "expected_impact",
      "estimated_queue_reduction", "estimated_resolution_time", 
      "staff_required", "risk_if_ignored", "validation_status"
    ]
  }
};

export default STADIUM_SYSTEM_PROMPT;
