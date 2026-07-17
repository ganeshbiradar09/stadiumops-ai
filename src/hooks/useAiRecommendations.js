import { useState, useEffect, useCallback } from 'react';
import { recommendationEngine } from '../utils/recommendationEngine';

export const useAiRecommendations = () => {
  const [recommendations, setRecommendations] = useState(recommendationEngine.getActiveRecommendations());
  const [resolvingId, setResolvingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [explainRec, setExplainRec] = useState(null);

  const syncRecommendations = useCallback(() => {
    setRecommendations(recommendationEngine.getActiveRecommendations());
  }, []);

  useEffect(() => {
    window.addEventListener('stadiumops-telemetry-update', syncRecommendations);
    return () => window.removeEventListener('stadiumops-telemetry-update', syncRecommendations);
  }, [syncRecommendations]);

  const handleApprove = useCallback(async (id) => {
    setResolvingId(id);
    setTimeout(async () => {
      await recommendationEngine.approveRecommendation(id);
      setResolvingId(null);
    }, 250);
  }, []);

  const handleReject = useCallback(async (id) => {
    setRejectingId(id);
    setTimeout(async () => {
      await recommendationEngine.rejectRecommendation(id);
      setRejectingId(null);
    }, 250);
  }, []);

  return {
    recommendations,
    resolvingId,
    rejectingId,
    explainRec,
    setExplainRec,
    syncRecommendations,
    handleApprove,
    handleReject
  };
};
