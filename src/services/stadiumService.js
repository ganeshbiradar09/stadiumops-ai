import * as mockData from '../data/mockStadiumData';

/**
 * Service simulating remote API communications for the Stadium operations command deck.
 */
export const stadiumService = {
  /**
   * Fetches the current stadium metadata and match stats
   */
  async getStadiumInfo() {
    return Promise.resolve(mockData.stadiumMetadata);
  },

  /**
   * Fetches active access gate statuses
   */
  async getGates() {
    return Promise.resolve(mockData.gatesList);
  },

  /**
   * Fetches parking lot telemetry
   */
  async getParking() {
    return Promise.resolve(mockData.parkingStatus);
  },

  /**
   * Triggers a manual log entry ingestion (mock database write)
   */
  async submitIncident(_incident) {
    // Removed debug log
    return Promise.resolve({ success: true, timestamp: new Date().toISOString() });
  }
};
export default stadiumService;
