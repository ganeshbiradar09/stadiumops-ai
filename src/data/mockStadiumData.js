// Realistic mock data for StadiumOps AI - Fictional Venue: FIFA Venue Alpha
// World Cup 2026 Operational Intelligence Dashboard

export const stadiumMetadata = {
  name: "FIFA Venue Alpha",
  city: "Metropolis, Host City",
  capacity: 75000,
  currentMatch: {
    stage: "Group Stage - Match 14",
    teams: "USA vs GERMANY",
    timeRemaining: "72' (Second Half)",
    score: "1 - 1",
    attendance: 72480,
    attendancePercentage: 96.6
  }
};

export const operationalScore = {
  overall: 94,
  change: "+1.2%",
  status: "Optimal",
  breakdown: [
    { name: "Crowd Flow", score: 92, status: "Good" },
    { name: "Transit Efficiency", score: 89, status: "Good" },
    { name: "Safety & Security", score: 98, status: "Excellent" },
    { name: "Staff Readiness", score: 96, status: "Excellent" }
  ]
};

export const weatherData = {
  temperature: 24, // Celsius
  condition: "Partly Cloudy",
  wind: "14 km/h ENE",
  humidity: "58%",
  precipitation: "10%",
  alertLevel: "None"
};

export const parkingStatus = {
  totalSpots: 12000,
  occupiedSpots: 10420,
  occupancyPercentage: 86.8,
  lots: [
    { name: "Lot A (VIP & Media)", capacity: 2000, occupied: 1950, status: "Full" },
    { name: "Lot B (General West)", capacity: 4000, occupied: 3620, status: "Near Capacity" },
    { name: "Lot C (General East)", capacity: 4000, occupied: 3150, status: "Moderate" },
    { name: "Lot D (Shuttle & Rideshare)", capacity: 2000, occupied: 1700, status: "Moderate" }
  ]
};

export const gatesList = [
  { id: "gate-a", name: "Gate A (North)", status: "Open", queueTime: 4, flowRate: 120, occupancy: 42 },
  { id: "gate-b", name: "Gate B (East)", status: "Open", queueTime: 18, flowRate: 245, occupancy: 88 },
  { id: "gate-c", name: "Gate C (Southeast)", status: "Restricted", queueTime: 26, flowRate: 190, occupancy: 92 },
  { id: "gate-d", name: "Gate D (South)", status: "Open", queueTime: 8, flowRate: 150, occupancy: 55 },
  { id: "gate-e", name: "Gate E (West)", status: "Open", queueTime: 6, flowRate: 110, occupancy: 40 },
  { id: "gate-f", name: "Gate F (VIP/Skybox)", status: "Open", queueTime: 2, flowRate: 35, occupancy: 15 }
];

export const crowdTrendData = [
  { time: "16:00", crowdSize: 12000, flowRate: 150 },
  { time: "16:30", crowdSize: 28000, flowRate: 420 },
  { time: "17:00", crowdSize: 45000, flowRate: 750 },
  { time: "17:30", crowdSize: 62000, flowRate: 980 },
  { time: "18:00", crowdSize: 71200, flowRate: 610 },
  { time: "18:30", crowdSize: 72480, flowRate: 85 },
  { time: "19:00", crowdSize: 72480, flowRate: 40 },
  { time: "19:30", crowdSize: 72480, flowRate: 35 }
];

export const gateOccupancyData = [
  { name: "Gate A", current: 42, max: 100, activeFlow: 120 },
  { name: "Gate B", current: 88, max: 100, activeFlow: 245 },
  { name: "Gate C", current: 92, max: 100, activeFlow: 190 },
  { name: "Gate D", current: 55, max: 100, activeFlow: 150 },
  { name: "Gate E", current: 40, max: 100, activeFlow: 110 },
  { name: "Gate F", current: 15, max: 100, activeFlow: 35 }
];

export const operationalIntelligenceEvents = [
  {
    id: "evt-01",
    timestamp: "19:22:15",
    type: "warning",
    category: "Crowd Flow",
    message: "Gate C queue expansion rate exceeds safety threshold (+24% in 5 min).",
    location: "Southeast Plaza",
    status: "Active"
  },
  {
    id: "evt-02",
    timestamp: "19:15:30",
    type: "info",
    category: "Transportation",
    message: "Transit Shuttle fleet operational status reporting 98% efficiency. Headway average 3.2 minutes.",
    location: "Lot D Shuttle Loop",
    status: "Resolved"
  },
  {
    id: "evt-03",
    timestamp: "19:02:44",
    type: "danger",
    category: "Access Control",
    message: "Ticket validator terminal malfunction at Gate B lane 4.",
    location: "Gate B Turnstiles",
    status: "Active"
  },
  {
    id: "evt-04",
    timestamp: "18:45:10",
    type: "info",
    category: "Security",
    message: "Pre-match security sweeps completed successfully for VIP skyboxes.",
    location: "Concourse Level 3",
    status: "Resolved"
  }
];

export const genAiDecisions = [
  {
    id: "dec-101",
    timestamp: "19:23:05",
    confidence: 96,
    recommendation: "Redirect Spectators from Lot C to Gate D (South)",
    rationale: "Gate C (Southeast) wait time is 26 mins due to restricted lane config. Gate D wait time is 8 mins. Rerouting 40% of incoming flow balances pedestrian density.",
    impact: "Reduces Gate C wait time by ~12 mins; balances perimeter density.",
    actions: [
      "Update dynamic stadium signage at east concourse intersection.",
      "Dispatch push notification to USA team ticket-holders in Sector E4-E8.",
      "Alert Zone 3 marshalling team to open auxiliary guide fences."
    ],
    status: "Approved & Deployed"
  },
  {
    id: "dec-102",
    timestamp: "19:04:12",
    confidence: 89,
    recommendation: "Re-assign Gate B Technician to Terminal B-4",
    rationale: "Validator failure at Lane 4 causes Gate B queue to spill into transit plaza. Tech Support Agent 'Delta' is 120m away with toolset ready.",
    impact: "Restores Lane 4 flow rates (+60 persons/min) within estimated 6-minute window.",
    actions: [
      "Send priority ticket notification to Tech Agent Delta.",
      "Notify Gate B manager of technician's estimated arrival time (ETA 4 min)."
    ],
    status: "Completed"
  },
  {
    id: "dec-103",
    timestamp: "18:50:30",
    confidence: 92,
    recommendation: "Pre-stage Shuttle Fleet at Transit Center West",
    rationale: "Predictive model forecasts USA vs GERMANY match exit surge to peak at 20:45. Shuttle demand will spike by 150% in Lot D.",
    impact: "Mitigates post-match egress transit queues, reducing peak wait times from 35 mins to under 15 mins.",
    actions: [
      "Stagger launch of 8 additional electric transit shuttles from secondary holding lot.",
      "Adjust signal timing at Perimeter Highway and Avenue Alpha exit roads."
    ],
    status: "Pending Stage Approval"
  }
];

export const dataSourcesList = [
  {
    id: "src-1",
    name: "RFID Ticketing Turnstiles API",
    type: "Live Stream",
    status: "Connected",
    lastSync: "Just now",
    frequency: "Real-time (WebSocket)",
    recordsProcessed: 145020
  },
  {
    id: "src-2",
    name: "Perimeter Crowd Cameras (CCTV-AI)",
    type: "Computer Vision Feed",
    status: "Connected",
    lastSync: "3s ago",
    frequency: "30 FPS Analysed",
    recordsProcessed: 9840
  },
  {
    id: "src-3",
    name: "Lot A-D Smart Parking Sensors",
    type: "IoT Telemetry",
    status: "Connected",
    lastSync: "12s ago",
    frequency: "Every 10 seconds",
    recordsProcessed: 12000
  },
  {
    id: "src-4",
    name: "Metropolis Transit Authority GTFS-RT",
    type: "External API Integration",
    status: "Connected",
    lastSync: "1m ago",
    frequency: "Every 60 seconds",
    recordsProcessed: 180
  },
  {
    id: "src-5",
    name: "Weather Operations Feed (NOAA)",
    type: "Static/Poll REST",
    status: "Connected",
    lastSync: "15m ago",
    frequency: "Every 15 minutes",
    recordsProcessed: 48
  },
  {
    id: "src-6",
    name: "Manual Incident Log CSV Upload",
    type: "File Upload",
    status: "Idle / Ready",
    lastSync: "3 hours ago",
    frequency: "Manual",
    recordsProcessed: 12
  }
];
