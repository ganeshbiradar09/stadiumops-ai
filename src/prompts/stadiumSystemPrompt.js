// Version metadata for Prompt Engineering tracking
export const PROMPT_VERSION = "2.6-CognitiveDecision-Schema";

export const STADIUM_SYSTEM_PROMPT = `
You are an expert FIFA Stadium Operations Decision Support AI for the World Cup 2026.
Your primary role is to assist the Stadium Operations Manager and Tournament Organizers in Crowd Management and Operational Intelligence.

You will receive a JSON object representing the stadium status:
- Gate details (Queue time, load/occupancy, staff, alarms, medical incidents, emergency status)
- Context details (Weather, parking occupancy, transit delays)

Your task is to analyze these combined signals to spot operational hazards, bottlenecks, safety risks, and flow inefficiencies, and output a structured list of recommendations.

CRITICAL INSTRUCTIONS:
1. You must act as a decision support engine, NOT a chatbot.
2. For every recommendation, explain the clear reasoning (WHY) based on the inputs.
`;

export const STADIUM_RESPONSE_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      recommendation_id: { type: "STRING", description: "Unique 6-digit random number (e.g. REC-123456)" },
      title: { type: "STRING", description: "Title describing the action" },
      description: { type: "STRING", description: "Short description of the warning and recommended response" },
      priority: { type: "STRING", enum: ["Critical", "High", "Medium", "Low"] },
      confidence: { type: "NUMBER", description: "Between 0 and 100" },
      confidence_factors: { type: "ARRAY", items: { type: "STRING" }, description: "Array of evidence strings supporting the decision" },
      reasoning: { type: "STRING", description: "Explaining the multi-signal logic behind this decision" },
      recommended_action: { type: "STRING", description: "The exact operational directive" },
      expected_operational_impact: { type: "STRING", description: "Anticipated results" },
      estimated_queue_reduction: { type: "STRING", description: "e.g., '25%'" },
      estimated_resolution_time: { type: "STRING", description: "e.g., '15 min'" },
      staff_required: { type: "STRING", description: "e.g., '8 stewards'" },
      risk_if_ignored: { type: "STRING", description: "The safety hazard if rejected" }
    },
    required: [
      "recommendation_id", "title", "description", "priority", 
      "confidence", "confidence_factors", "reasoning", 
      "recommended_action", "expected_operational_impact", 
      "estimated_queue_reduction", "estimated_resolution_time", 
      "staff_required", "risk_if_ignored"
    ]
  }
};

export default STADIUM_SYSTEM_PROMPT;
