# StadiumOps AI - FIFA World Cup 2026 Command Center

StadiumOps AI is an AI-assisted operational decision-support platform that continuously evaluates stadium telemetry to generate explainable recommendations for crowd management, safety, and resource allocation.

## Live Demo
👉 **[https://stadiumops-ai.vercel.app](https://stadiumops-ai.vercel.app)**

---

## 1. Project Screenshots
*Tip: Place your screenshots inside `src/assets/` named exactly as below to render them in your repository.*

![Dashboard Command Deck](src/assets/hero.png)
*Figure 1: Main command deck featuring dynamic Recharts scrollers, status grids, and decision cards.*

---

## 2. Project Highlights

✔ **Live Telemetry Simulation**: Drifts metrics every 8 seconds to mimic a real digital twin.
✔ **Explainable AI (XAI)**: Shows exact metric triggers (e.g. wait times, alarms) inside decision rationales.
✔ **Closed-Loop Outcome Simulation**: Drains queues, redirects flow, and clears active incidents instantly on approval.
✔ **High-Reliability CSV Validation**: Captures, lists, and displays validation warning logs before ingestion.
✔ **Firebase + Offline Failover**: Uses Firestore logs, falling back to `localStorage` automatically.
✔ **One-Click Presentation Mode**: Runs a complete automated storyboard in one click for judging.
✔ **Vercel Static Hosting**: Fast production builds with zero-config serverless deployments.

---

## 3. Core Features

| Feature | Description |
| :--- | :--- |
| **Live Telemetry** | Simulates realistic operational drift (Queues, Occupancy, Parking, Transit) every 8 seconds. |
| **Explainable AI** | Opens a cognitive panel mapping the specific metrics that triggered each AI recommendation. |
| **Outcome Simulation** | Applies approved actions in the telemetry coordinates and models queue reduction outcomes. |
| **CSV Validation** | Parses spreadsheet formats, rejects errors (negative values, bad times), and normalizes rows. |
| **Report Export** | Compiles current KPIs, recommendations, reasoning, timelines, and audit logs into a text report. |
| **Demo Mode** | Automates ingestion, AI dispatches, approvals, outcomes, and report downloads in one click. |

---

## 4. System Architecture

The application decouples parsing, state coordinating, and cognitive reasoning into distinct layers:

```
    [ CSV / Synthetic Scenario ]
                 │
                 ▼
          [ CSV Validator ]
                 │
                 ▼
         [ Data Normalizer ]
                 │
                 ▼
      [ Recommendation Engine ]
           │           │
           ▼           ▼
      [ Gemini ]  [ Simulation ]
           │
           ▼
     [ React Dashboard ]
           │
           ▼
     [ Reports & Audit ]
```

- **Frontend Core**: React (v19) + Vite (v8) + Tailwind CSS (v4) with native `@tailwindcss/vite` integration.
- **Cognitive Layer**: Google Gemini REST integration with direct client-side fetch failovers to prevent browser bundle packaging locks.
- **Gemini Fallback (Simulation Mode)**: If no Gemini API key is configured in the environment, StadiumOps AI automatically switches to a mathematically consistent Simulation Mode, allowing the application to remain fully functional for demonstrations and evaluation.
- **Database Layer**: Cloud Firestore (saving datasets, recommendations, timeline logs) with `localStorage` backup buffers for standalone offline capabilities.

---

## 5. Project Folder Structure

```
src/
  assets/              # Vite graphics & screenshots
  components/
    common/            # Reusable UI containers (Card, Badge, Button)
    layout/            # Layout shells (Header, Sidebar, Shell)
    dashboard/         # Recharts visualizers & timeline modules
  data/                # Synthetic CSV scenarios
  pages/               # Page views (Dashboard, Operations, Crowd, Transit, Reports)
  prompts/             # Version-controlled system prompt
  services/            # API adapters (Gemini, Firebase, CSV Validator)
  utils/               # Staging & drift stream engine
```

---

## 6. Local Installation & How to Run

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup Steps
1. Clone or copy the repository files.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Copy `.env.example` to `.env` in the root:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   # Optional Firebase Configs:
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   ```
4. Launch the local development server:
   ```bash
   npm run dev
   ```
5. Build production bundle:
   ```bash
   npm run build
   ```

---

## 7. Environment Variables

The application reads from `.env` in the root:
- `VITE_GEMINI_API_KEY`: Used to query the live Gemini 1.5 Flash model. If not present, the system defaults to Simulation Mode.
- `VITE_FIREBASE_API_KEY`: Used to connect to Google Cloud Firestore. If missing, all databases route to local storage.

---

## 8. Quick Demo Walkthrough

Use the built-in demo to walk through a complete operational scenario:

1. **Ingest Scenario**: Go to **Data Sources** in the sidebar. Click **Ingest & Run GenAI Analysis** under the Synthetic Scenario Ingestor (defaults to *Normal Match*).
2. **Review Decisions**: Return to the **Dashboard** to view calculated AI recommendations and drifting telemetry.
3. **Traceability**: Click **Explain Decision** to inspect which telemetry values triggered the recommendation.
4. **Outcome**: Click **Approve** and observe the gate queues draining and active incident flags clearing in real-time.
5. **Download Report**: Go to **Reports**, choose **GenAI Decision & Reasoning Export**, and click **Download** to save the complete decision audit log.

---

## 9. Tested & Supported Browsers

- Chrome (v110 or higher)
- Edge (v110 or higher)
- Firefox (v110 or higher)
- Safari (v16 or higher)

---

## 10. License

This project is licensed under the MIT License - see the LICENSE file for details.
*(Created for PromptWars 2026 Evaluation purposes only).*
