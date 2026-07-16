import { useState } from 'react';
import { recommendationEngine } from '../utils/recommendationEngine';
import { parseAndValidateCSV } from '../services/csvParser';

export const useDemoScript = (setIsAiProcessing) => {
  const [demoRunning, setDemoRunning] = useState(false);

  const runOneClickDemo = async () => {
    if (demoRunning) return;
    setDemoRunning(true);
    try {
      alert("Demo Phase 1/5: Loading Peak Traffic Scenario...\nIngesting 17-dimensional synthetic CSV telemetry containing rainfall anomalies and turnstile validator failure logs.");
      
      const demoCSV = `Gate,Queue Length,Occupancy,Capacity,Staff,Weather,Incident,Parking,Transit Delay,Time,Risk Level,Emergency Status,Medical Cases,Security Alerts,VIP Traffic,Shuttle Status,Confidence
Gate A (North),28,92%,15000,32,Heavy Rain,Wet plaza floor,88%,15,19:30,High,Normal,0,0,None,Optimal,90%
Gate B (East),32,96%,20000,45,Heavy Rain,Outage turnstile lane 3,88%,15,19:30,Critical,Emergency,1,3,None,Optimal,95%
Gate C (Southeast),8,48%,15000,35,Heavy Rain,None,88%,15,19:30,Medium,Normal,0,0,None,Optimal,85%
Gate D (South),10,52%,15000,32,Heavy Rain,None,88%,15,19:30,Medium,Normal,0,0,None,Optimal,85%
Gate E (West),12,56%,15000,32,Heavy Rain,None,88%,15,19:30,Medium,Normal,0,0,None,Optimal,85%
Gate F (VIP/Skybox),2,15%,5000,18,Heavy Rain,None,88%,15,19:30,Low,Normal,0,0,High,Optimal,90%`;

      const parsed = parseAndValidateCSV(demoCSV);
      
      // Ingest and trigger recalculation
      const res = await recommendationEngine.processNewDataset(parsed.processedRows, "Interactive Presentation Demo Scenario");
      
      // Process dataset natively fires the update event.
      setIsAiProcessing(true); // Trigger 1.8s AI Processing Sequence

      await new Promise(r => setTimeout(r, 4000));

      // Step 2: Auto-approve Critical recommendation
      const criticalRec = res.recommendations.find(r => r.priority === 'Critical');
      if (criticalRec) {
        alert(`Demo Phase 2/5: AI Decision Engine flagged anomalous queue sizes and turnstile outages at Gate B.\nAutomatically approving recommended action: "${criticalRec.title}"`);
        
        await recommendationEngine.approveRecommendation(criticalRec.id);
        
        await new Promise(r => setTimeout(r, 4000));
      }

      // Step 3: Run Outcome Simulation
      alert("Demo Phase 3/5: Dynamic Outcome Simulation Engine active.\nNotice that turnstile queues are draining, medical cases have cleared, and the decision timeline logs have synced.");
      window.dispatchEvent(new CustomEvent('stadiumops-telemetry-update'));

      await new Promise(r => setTimeout(r, 3000));

      // Step 4: Export report
      alert("Demo Phase 4/5: Compiling AI Decision support logs and downloading CSV/Text reports...");
      
      let reportContent = "========================================================================\n";
      reportContent += "FIFA WORLD CUP 2026 - DEMO OPERATIONAL OUTCOMES EXPORT\n";
      reportContent += `Generated: ${new Date().toISOString()}\n`;
      reportContent += "========================================================================\n\n";
      
      const currentSnapshot = recommendationEngine.getActiveSnapshot();
      reportContent += "--- KPIs STATE AFTER OUTCOME SIMULATION ---\n";
      reportContent += `Average wait time: ${currentSnapshot.averageQueueTime} mins\n`;
      reportContent += `Max queue time: ${currentSnapshot.maxQueueTime} mins\n`;
      reportContent += `Crowd density Level: ${currentSnapshot.crowdDensityLevel}\n\n`;

      reportContent += "--- DECISION HISTORY LOGS ---\n";
      recommendationEngine.getActiveRecommendations().forEach(rec => {
        reportContent += `* [${rec.status}] ${rec.title}: ${rec.recommended_action} (Confidence: ${rec.confidence}%)\n`;
      });

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const element = document.createElement("a");
      element.href = URL.createObjectURL(blob);
      element.download = `DEMO_AI_Decision_Report.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      await new Promise(r => setTimeout(r, 1000));

      alert("Demo Phase 5/5: One-click presentation demonstration completed successfully!\nAll KPIs are restored within standard safety limits.");

    } catch {
      alert("Demo simulation error occurred.");
    } finally {
      setDemoRunning(false);
    }
  };

  return { runOneClickDemo, demoRunning };
};
