# Phase 4.5: Executive Demo Script

This script is designed to walk a judge or executive stakeholder through the Stadium Operations Command Center in a consistent, impactful 2–3 minute sequence.

---

## 1. The Setup (0:00 - 0:30)

**Goal:** Establish the problem and the architecture.

* **Action:** Start with a fresh, empty dashboard (refresh if necessary).
* **Script:** 
  > "Welcome to the Stadium Operations Command Center. Modern stadiums generate massive amounts of telemetry—from ticketing scanners to IoT crowd sensors. The problem isn't getting data; it's making sense of it before a bottleneck becomes a safety incident. This dashboard acts as an orchestrator, fusing physical security feeds with live telemetry. Right now, it's idle, waiting for a data stream."

---

## 2. The Ingestion (0:30 - 1:00)

**Goal:** Demonstrate data normalization and live UI updates.

* **Action:** Open the **Data Sources** modal and select the `Capacity Crunch` scenario. Click **Load Scenario**.
* **Script:**
  > "Let's inject a high-stress scenario: a sudden capacity crunch at the North Gates. Notice how the dashboard instantly lights up. The IoT sensors detect the surge, and the timeline logs the event. The telemetry is normalized and passed through our predictive engine. You can see the Operational Intelligence feed immediately flag the congestion, while the KPI widgets track the exact queue times."

---

## 3. The AI Reasoning (1:00 - 1:45)

**Goal:** Showcase the predictive AI capabilities and structured output.

* **Action:** Direct attention to the **GenAI Operational Decision Engine** panel as it transitions through its loading states (`[OK]`, `[COMPUTING]`, `[READY]`).
* **Script:**
  > "But we don't just want reactive alerts; we want proactive solutions. While the data was streaming in, our recommendation engine maintained a rolling history buffer to calculate trends. It passed that historical context to Gemini 1.5 Flash. The LLM analyzed the velocity of the crowd and generated structured, deterministic JSON. Notice the recommendation here: it identified the situation, provided evidence, and predicted a 25-minute delay if we do nothing. It gives us a clear action directive to deploy emergency stanchions."

---

## 4. The Execution (1:45 - 2:15)

**Goal:** Prove the system handles human-in-the-loop decisions smoothly.

* **Action:** Click the **Explain Decision** button on the critical recommendation.
* **Script:** 
  > "Before acting, we want transparency. The AI provides an executive briefing detailing exactly why it made this recommendation."
* **Action:** Close the modal and click **Approve**.
* **Script:**
  > "I approve the action. The system immediately registers the human-in-the-loop decision, transitions the card to an approved state, and updates the timeline log. We've just averted a crowd crush."

---

## 5. Developer Observability (2:15 - 2:30)

**Goal:** Highlight engineering excellence to technical judges.

* **Action:** Click the **Database Icon** in the bottom right to open the Diagnostics Panel.
* **Script:**
  > "Finally, a quick look under the hood. As an engineering team, we prioritize observability. This floating diagnostics drawer tracks our AI latency, fallback status, and telemetry processing times in real-time, ensuring we can monitor the health of our decision engine without cluttering the operational UI."
