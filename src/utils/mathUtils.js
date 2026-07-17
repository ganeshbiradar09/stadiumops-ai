/**
 * Algorithmic utility to replace hardcoded magic numbers.
 * Calculates the Operational Score (0-100) dynamically based on stadium telemetry.
 * 
 * Score Penalty Factors:
 * - High average queue times (up to -40 points)
 * - High density / max queue (up to -20 points)
 * - Medical incidents (up to -15 points)
 * - Security incidents (up to -15 points)
 * - Transit delays (up to -10 points)
 */
export const calculateOperationalScore = (snapshot) => {
  if (!snapshot) return 100;

  let score = 100;

  // Penalty 1: Average Queue Times (0 to -40)
  // Ideal is < 5 mins. At 30 mins, full -40 penalty.
  const queuePenalty = Math.min(40, Math.max(0, (snapshot.averageQueueTime - 5) * 1.6));
  score -= queuePenalty;

  // Penalty 2: Density / Max Queue (0 to -20)
  // Max queue penalty (e.g. one gate is backed up badly)
  const maxQueuePenalty = Math.min(20, Math.max(0, (snapshot.maxQueueTime - 10) * 1.0));
  score -= maxQueuePenalty;

  // Penalty 3: Incidents (Medical/Security)
  const totalMedical = snapshot.gates?.reduce((sum, g) => sum + (g.medicalCases || 0), 0) || 0;
  const totalSecurity = snapshot.gates?.reduce((sum, g) => sum + (g.securityAlerts || 0), 0) || 0;
  
  const medicalPenalty = Math.min(15, totalMedical * 3);
  const securityPenalty = Math.min(15, totalSecurity * 5);
  
  score -= (medicalPenalty + securityPenalty);

  // Penalty 4: Transit Delays
  const delayPenalty = Math.min(10, (snapshot.context?.transitDelay || 0) * 0.5);
  score -= delayPenalty;

  return Math.max(0, Math.round(score));
};

/**
 * Basic Linear Regression for Predictive Forecasting.
 * Predicts future queue length based on a rolling history window.
 * @param {Array<number>} history - Array of recent queue wait times (e.g., last 5 snapshots)
 * @param {number} futureSteps - Number of intervals ahead to predict
 * @returns {number} Predicted queue wait time
 */
export const predictQueue = (history, futureSteps = 1) => {
  if (!history || history.length < 2) return history?.[history.length - 1] || 0;

  const n = history.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += history[i];
    sumXY += i * history[i];
    sumXX += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const predicted = slope * (n - 1 + futureSteps) + intercept;
  
  // Floor at 0
  return Math.max(0, Math.round(predicted * 10) / 10);
};
