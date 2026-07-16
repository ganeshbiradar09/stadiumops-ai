import { useState, useEffect, useCallback } from 'react';
import { recommendationEngine } from '../utils/recommendationEngine';

export const useTerminalLogger = () => {
  const [timelineEvents, setTimelineEvents] = useState(recommendationEngine.getTimeline());

  const syncTimeline = useCallback(() => {
    setTimelineEvents(recommendationEngine.getTimeline());
  }, []);

  useEffect(() => {
    window.addEventListener('stadiumops-telemetry-update', syncTimeline);
    return () => window.removeEventListener('stadiumops-telemetry-update', syncTimeline);
  }, [syncTimeline]);

  return { timelineEvents, syncTimeline };
};
