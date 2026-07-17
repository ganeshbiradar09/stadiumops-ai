import { STADIUM_SYSTEM_PROMPT, PROMPT_VERSION, STADIUM_RESPONSE_SCHEMA } from '../prompts/stadiumSystemPrompt';
import { GoogleGenAI } from '@google/genai';
import { validateAndNormalizeAiResponse } from '../utils/dataNormalizer';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
export const getAiModeStatus = () => {
  const forceSim = localStorage.getItem('stadiumops_force_simulation') === 'true';
  return !!API_KEY && !forceSim;
};

// Backward compatibility helper
export const isAiMode = !!API_KEY && localStorage.getItem('stadiumops_force_simulation') !== 'true';


import { runSimulationMode } from '../utils/simulationEngine';

/**
 * Calls the Gemini API using native fetch to avoid browser packaging restrictions.
 * Enforces structured JSON format and injects version headers.
 * 
 * @param {object} normalizedData 
 * @param {string} datasetName 
 * @returns {Promise<Array<object>>} Generated recommendations array
 */
export const generateRecommendations = async (normalizedData, datasetName) => {
  const t0 = performance.now();
  if (!isAiMode) {
    const recs = runSimulationMode(normalizedData, datasetName);
    const latency = performance.now() - t0;
    updateDiagnostics({
      aiLatency: latency,
      parseStatus: 'Success (Sim)',
      fallbackMode: true,
      modelName: "Simulation-Engine-Cognitive-v3",
      promptVersion: PROMPT_VERSION
    });
    return Promise.resolve(recs);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Analyze this live stadium data snapshot:\n${JSON.stringify(normalizedData, null, 2)}`,
      config: {
        systemInstruction: STADIUM_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: STADIUM_RESPONSE_SCHEMA,
        temperature: 0.1
      }
    });

    const responseText = response.text;
    
    if (!responseText) {
      throw new Error("Empty content response from Gemini model");
    }

    // Parse response
    const parsedRecommendations = JSON.parse(responseText);
    
    // Inject prompt metadata and validate via Schema Engine (Release Phase 5A)
    const list = Array.isArray(parsedRecommendations) ? parsedRecommendations : [parsedRecommendations];
    
    const recommendationsWithMetadata = list.map(rec => 
      validateAndNormalizeAiResponse(rec, datasetName, PROMPT_VERSION, "gemini-1.5-flash")
    );

    const t1 = performance.now();
    updateDiagnostics({
      aiLatency: t1 - t0,
      parseStatus: 'Success',
      fallbackMode: false,
      modelName: "gemini-1.5-flash",
      promptVersion: PROMPT_VERSION
    });

    return recommendationsWithMetadata;

  } catch (error) {
    console.error("Gemini API call failed. Falling back to simulation logic: ", error);
    const recs = runSimulationMode(normalizedData, datasetName);
    const latency = performance.now() - t0;
    updateDiagnostics({
      aiLatency: latency,
      parseStatus: 'Failed - Simulation Fallback',
      fallbackMode: true,
      modelName: "Simulation-Engine-Cognitive-v3",
      promptVersion: PROMPT_VERSION
    });
    return recs;
  }
};

const updateDiagnostics = (metrics) => {
  const currentRaw = localStorage.getItem('stadiumops_diagnostics');
  const current = currentRaw ? JSON.parse(currentRaw) : {};
  const updated = { ...current, ...metrics, lastUpdate: new Date().toISOString() };
  localStorage.setItem('stadiumops_diagnostics', JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('stadiumops-diagnostics-update', { detail: updated }));
};
