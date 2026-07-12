// Synthetic Stadium Operational Datasets (CSV format)
// Designed for World Cup 2026 Operations Command judge validation.

export const SYNTHETIC_DATASETS = {
  normal_match: {
    name: "Normal Match (Standard Influx)",
    description: "Balanced visitor queues, optimal gate distribution, clear play conditions.",
    csv: `Gate,Queue Length,Occupancy,Capacity,Staff,Weather,Incident,Parking,Transit Delay,Time
Gate A (North),4,42%,15000,32,Clear,None,80%,0,19:00
Gate B (East),8,62%,20000,45,Clear,None,80%,0,19:00
Gate C (Southeast),7,58%,15000,35,Clear,None,80%,0,19:00
Gate D (South),5,45%,15000,32,Clear,None,80%,0,19:00
Gate E (West),6,48%,15000,32,Clear,None,80%,0,19:00
Gate F (VIP/Skybox),2,15%,5000,18,Clear,None,80%,0,19:00`
  },

  high_crowd: {
    name: "High Crowd (Gate B & C Saturation)",
    description: "Pedestrian congestion spikes at East/Southeast gates. Wait times exceed safety threshold.",
    csv: `Gate,Queue Length,Occupancy,Capacity,Staff,Weather,Incident,Parking,Transit Delay,Time
Gate A (North),6,52%,15000,32,Clear,None,85%,0,19:15
Gate B (East),26,92%,20000,45,Clear,None,85%,0,19:15
Gate C (Southeast),32,96%,15000,35,Clear,None,85%,0,19:15
Gate D (South),8,55%,15000,32,Clear,None,85%,0,19:15
Gate E (West),7,48%,15000,32,Clear,None,85%,0,19:15
Gate F (VIP/Skybox),3,22%,5000,18,Clear,None,85%,0,19:15`
  },

  heavy_rain: {
    name: "Heavy Rain (Safety Slowdown)",
    description: "Sudden heavy rain slows security screening. Queue expansion across outdoor ticket plazas.",
    csv: `Gate,Queue Length,Occupancy,Capacity,Staff,Weather,Incident,Parking,Transit Delay,Time
Gate A (North),14,68%,15000,32,Heavy Rain,Safety checks delayed due to wet ticket scanners,88%,10,19:20
Gate B (East),28,88%,20000,45,Heavy Rain,Safety checks delayed due to wet ticket scanners,88%,10,19:20
Gate C (Southeast),24,84%,15000,35,Heavy Rain,Safety checks delayed due to wet ticket scanners,88%,10,19:20
Gate D (South),18,72%,15000,32,Heavy Rain,Safety checks delayed due to wet ticket scanners,88%,10,19:20
Gate E (West),15,70%,15000,32,Heavy Rain,Safety checks delayed due to wet ticket scanners,88%,10,19:20
Gate F (VIP/Skybox),4,28%,5000,18,Heavy Rain,None,88%,10,19:20`
  },

  transit_disruption: {
    name: "Transit Disruption (Metro Delay)",
    description: "35-minute city metro delay redirects crowd arrivals. Shuttle loop experiences high vehicle backlog.",
    csv: `Gate,Queue Length,Occupancy,Capacity,Staff,Weather,Incident,Parking,Transit Delay,Time
Gate A (North),6,40%,15000,32,Clear,None,92%,35,19:00
Gate B (East),8,45%,20000,45,Clear,None,92%,35,19:00
Gate C (Southeast),12,52%,15000,35,Clear,None,92%,35,19:00
Gate D (South),24,78%,15000,32,Clear,Metro station blockage redirects crowd to shuttle loops,92%,35,19:00
Gate E (West),28,82%,15000,32,Clear,Metro station blockage redirects crowd to shuttle loops,92%,35,19:00
Gate F (VIP/Skybox),2,18%,5000,18,Clear,None,92%,35,19:00`
  },

  security_incident: {
    name: "Security Incident (Validator Outage)",
    description: "Gate B turnstile network crash. Staff dispatch needed to handle queue spillover.",
    csv: `Gate,Queue Length,Occupancy,Capacity,Staff,Weather,Incident,Parking,Transit Delay,Time
Gate A (North),5,45%,15000,32,Clear,None,80%,0,18:45
Gate B (East),34,94%,20000,45,Clear,Validator terminal crash - turnstile lanes 3 and 4 offline,80%,0,18:45
Gate C (Southeast),8,55%,15000,35,Clear,None,80%,0,18:45
Gate D (South),6,48%,15000,32,Clear,None,80%,0,18:45
Gate E (West),7,50%,15000,32,Clear,None,80%,0,18:45
Gate F (VIP/Skybox),2,15%,5000,18,Clear,None,80%,0,18:45`
  },

  late_match_exit: {
    name: "Late Match Exit (Egress Surge)",
    description: "End of second half. Audience leaving seats. Saturated exits and transit pickup queues.",
    csv: `Gate,Queue Length,Occupancy,Capacity,Staff,Weather,Incident,Parking,Transit Delay,Time
Gate A (North),28,95%,15000,32,Clear,Spectator egress surge,86%,5,21:00
Gate B (East),35,98%,20000,45,Clear,Spectator egress surge,86%,5,21:00
Gate C (Southeast),32,96%,15000,35,Clear,Spectator egress surge,86%,5,21:00
Gate D (South),22,90%,15000,32,Clear,Spectator egress surge,86%,5,21:00
Gate E (West),24,92%,15000,32,Clear,Spectator egress surge,86%,5,21:00
Gate F (VIP/Skybox),6,35%,5000,18,Clear,None,86%,5,21:00`
  }
};
export default SYNTHETIC_DATASETS;
