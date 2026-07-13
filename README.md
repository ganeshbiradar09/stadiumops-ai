# StadiumOps AI - FIFA World Cup 2026 Command Center

![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-8-purple)
![Gemini](https://img.shields.io/badge/Google-Gemini-orange)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-yellow)
![License](https://img.shields.io/badge/License-MIT-green)

StadiumOps AI is an AI-assisted operational decision-support platform designed for FIFA World Cup 2026 scenarios that continuously evaluates stadium telemetry to generate explainable recommendations for crowd management, safety, and resource allocation.

## Live Demo
👉 **[https://stadiumops-ai.vercel.app](https://stadiumops-ai.vercel.app)**

---

## Table of Contents
- [Project Overview](#1-project-overview)
- [Challenge Vertical](#2-challenge-vertical)
- [Assumptions](#3-assumptions)
- [Project Highlights](#4-project-highlights)
- [Project Screenshots](#5-project-screenshots)
- [Core Features](#6-core-features)
- [System Architecture](#7-system-architecture)
- [Project Folder Structure](#8-project-folder-structure)
- [Local Installation & How to Run](#9-local-installation--how-to-run)
- [Environment Variables](#10-environment-variables)
- [Quick Demo Walkthrough](#11-quick-demo-walkthrough)
- [Tested & Supported Browsers](#12-tested--supported-browsers)
- [Acknowledgements](#13-acknowledgements)
- [License](#14-license)

---

## 1. Project Overview

StadiumOps AI is an operational decision-support platform designed for FIFA World Cup 2026 scenarios that evaluates multi-dimensional stadium telemetry to highlight bottlenecks, trigger emergency responses, and model crowd-control outcomes.

---

## 2. Challenge Vertical

**Smart Stadium Operations & Crowd Management**

StadiumOps AI is designed as an AI-assisted operational command center for large-scale sporting events such as the FIFA World Cup 2026. The platform helps stadium operators monitor crowd movement, identify operational risks, and generate explainable recommendations for safety and resource allocation.

---

## 3. Assumptions

- Telemetry data is simulated for demonstration purposes.
- Gemini API access is optional; the application falls back to Simulation Mode if unavailable.
- CSV files follow the documented schema.
- Firebase is optional and localStorage is used when credentials are absent.
- The architecture is designed so simulated telemetry can be replaced with real-time IoT or WebSocket feeds.

---

## 4. Project Highlights

✔ **AI-Assisted Operational Decision Support**: Real-time dispatching and crowd safety operations.
✔ **AI Analysis Workflow**: Simulates multi-stage processing logs before revealing recommendations.
✔ **Explainable AI**: Telemetry-based reasoning showing cognitive triggers.
✔ **Live Telemetry Simulation**: Drifts metrics every 8 seconds to mimic a real stadium digital twin.
✔ **Executive Decision Briefing**: Comprehensive executive dashboard summarizing key alerts.
✔ **Closed-Loop Outcome Simulation**: Drains wait times, clears incidents, and re-allocates staff dynamically on approval.
✔ **High-Reliability CSV Validation**: Captures, lists, and displays validation warning logs before ingestion.
✔ **Firebase + Offline Fallback**: Real-time syncing with automatic failover to local storage.
✔ **Report Export**: Compiles KPIs, recommendations, and audit logs into flat text reports.
✔ **One-Click Presentation Demo**: Complete automated presentation run for quick judging evaluations.
✔ **WCAG 2.1 AA Accessibility**: Full keyboard navigation, proper ARIA labeling, semantic structures, and high contrast.
✔ **Enterprise-Grade Hardening**: Payload type validations, deep input sanitization, and strict multi-layered size constraints on file parsing.
✔ **High-Performance Architecture**: Granular React.lazy() route splitting and React.memo() render pruning strategies ensuring a highly optimized <1 MB initial bundle size.

---

## 5. Project Screenshots

### Dashboard Command Deck
![Dashboard](src/assets/dashboard.png)
*Figure 1: Main command deck showing real-time Recharts trends, status grids, and occupancy rates.*

### Operations Control Deck
![Operations](src/assets/operations.png)
*Figure 2: Access Point Control Deck supervising security wait times, turnstile loads, and marshal allocations.*

### Crowd Intelligence Command
![Crowd](src/assets/crowd.png)
*Figure 3: Concourse Heatmap details showing crowd density indexes, Safety Risk ratings, and patrol counts.*

### Operations Data Hub
![Data Sources](src/assets/datasources.png)
*Figure 4: Data Sources hub for CSV validation parsing warnings, manual override forms, and synthetic scenarios.*

### Operational Reports Registry
![Reports](src/assets/reports.png)
*Figure 5: Reports compiler supporting GenAI Decision and Reasoning structured logs export.*

---

## 6. Core Features

| Feature | Description |
| :--- | :--- |
| **Live Telemetry** | Simulates realistic operational drift (Queues, Occupancy, Parking, Transit) every 8 seconds. |
| **Explainable AI** | Opens a cognitive panel mapping the specific metrics that triggered each AI recommendation. |
| **Outcome Simulation** | Applies approved actions in the telemetry coordinates and models queue reduction outcomes. |
| **CSV Validation** | Parses spreadsheet formats, rejects errors (negative values, bad times), and normalizes rows. |
| **Report Export** | Compiles current KPIs, recommendations, reasoning, timelines, and audit logs into a text report. |
| **Demo Mode** | Automates ingestion, AI dispatches, approvals, outcomes, and report downloads in one click. |

---

## 7. System Architecture

The application decouples parsing, state coordinating, and cognitive reasoning into distinct layers:

```
CSV / Synthetic Scenario
        │
        ▼
 CSV Validation
        │
        ▼
 Data Normalization
        │
        ▼
 Recommendation Engine
        │
   ┌────┴────┐
   ▼         ▼
 Gemini   Simulation
        │
        ▼
 React Dashboard
        │
        ▼
 Reports & Audit Logs
```

- **Frontend Core**: React (v19) + Vite (v8) + Tailwind CSS (v4) with native `@tailwindcss/vite` integration.
- **Cognitive Layer**: Google Gemini REST integration with direct client-side fetch failovers to prevent browser bundle packaging locks.
- **Gemini Fallback (Simulation Mode)**: If no Gemini API key is configured in the environment, StadiumOps AI automatically switches to Simulation Mode, allowing the application to remain fully functional for demonstrations and evaluation.
- **Database Layer**: Cloud Firestore (saving datasets, recommendations, timeline logs) with `localStorage` backup buffers for standalone offline capabilities.

---

## 8. Project Folder Structure

```
src
├── assets/            # Vite graphics & screenshots
├── components/
│   ├── common/        # Reusable UI containers (Card, Badge, Button)
│   ├── dashboard/     # Recharts visualizers & timeline modules
│   └── layout/        # Layout shells (Header, Sidebar, Shell)
├── data/              # Synthetic CSV scenarios
├── pages/             # Page views (Dashboard, Operations, Crowd, Transit, Reports)
├── prompts/           # Version-controlled system prompt
├── services/          # API adapters (Gemini, Firebase, CSV Validator)
└── utils/             # Staging & drift stream engine
```

---

## 9. Local Installation & How to Run

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

## 10. Environment Variables

The application reads from `.env` in the root:
- `VITE_GEMINI_API_KEY`: Used to query the live Gemini 1.5 Flash model. If not present, the system defaults to Simulation Mode.
- `VITE_FIREBASE_API_KEY`: Used to connect to Google Cloud Firestore. If missing, all databases route to local storage.

---

## 11. Quick Demo Walkthrough

Walk through the primary operational flow of the command deck:

1. **Load a Scenario**: Ingest synthetic models or upload customized CSV telemetry in the **Data Sources** page.
2. **Observe AI Analysis**: Watch the inline multi-stage loading sequence as the engine processes live data.
3. **Review Recommendations**: Inspect computed directives on the dashboard deck.
4. **Open Explain Decision**: Redirection to the executive briefing board displaying the 6-dimension telemetry signals grid and confidence ratings.
5. **Approve a Recommendation**: Click Approve to deploy action plans.
6. **Observe Outcome Simulation**: Watch queues drain, incident markers clear, and KPI scores update in real-time.
7. **Export Report**: Navigate to the **Reports** menu to compile and download operational briefings.

---

## 12. Tested & Supported Browsers

- Chrome (v110 or higher)
- Edge (v110 or higher)
- Firefox (v110 or higher)
- Safari (v16 or higher)

---

## 13. Acknowledgements

- **Google Gemini**: Dynamic operational reasoning models
- **React**: Frontend application architecture
- **Vite**: Rapid asset compilation server
- **Tailwind CSS**: Modern styled CSS theme configurations
- **Firebase**: Multi-regional real-time database synchronization
- **Recharts**: Responsive telemetry data visualization

---

## 14. License

This project is licensed under the MIT License - see the LICENSE file for details.
*(Created for PromptWars 2026 Evaluation purposes only).*
