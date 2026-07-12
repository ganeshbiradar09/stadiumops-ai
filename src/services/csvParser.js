/**
 * High-reliability CSV Parser and Validator for Stadium Operations
 */

/**
 * Validates a time string format (HH:MM or HH:MM:SS)
 * @param {string} val 
 * @returns {boolean}
 */
const isValidTime = (val) => {
  if (!val) return false;
  // Match standard 24hr or 12hr formats like 19:30, 08:15:00, 4:20
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  return timeRegex.test(val.trim());
};

/**
 * Parses and validates stadium operational CSV data.
 * Does not silently discard rows; returns validation reports for judge review.
 * 
 * Expected CSV Headers:
 * Gate, Queue Length, Occupancy, Capacity, Staff, Weather, Incident, Parking, Transit Delay, Time
 * Optional Extended Headers:
 * Risk Level, Emergency Status, Medical Cases, Security Alerts, VIP Traffic, Shuttle Status, Confidence
 * 
 * @param {string} csvText 
 * @returns {object} Validation report
 */
export const parseAndValidateCSV = (csvText) => {
  if (!csvText || !csvText.trim()) {
    return {
      success: false,
      processedRows: [],
      rejectedRows: [{ line: 1, content: "Empty file", reason: "CSV content is empty" }],
      summary: { total: 0, processed: 0, rejected: 1 }
    };
  }

  const lines = csvText.split(/\r?\n/);
  const processedRows = [];
  const rejectedRows = [];
  
  if (lines.length === 0 || !lines[0].trim()) {
    return {
      success: false,
      processedRows: [],
      rejectedRows: [{ line: 1, content: "", reason: "No headers found" }],
      summary: { total: 0, processed: 0, rejected: 1 }
    };
  }

  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Helper to get column index
  const getColIndex = (name) => headers.indexOf(name);
  
  // Validate headers - must have at least Gate
  const gateIdx = getColIndex('gate');
  if (gateIdx === -1) {
    return {
      success: false,
      processedRows: [],
      rejectedRows: [{ line: 1, content: lines[0], reason: "Missing required header: 'Gate'" }],
      summary: { total: 1, processed: 0, rejected: 1 }
    };
  }

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine.trim()) continue; // Skip empty lines
    
    const lineNumber = i + 1;
    const cells = rawLine.split(',').map(c => c.trim());
    
    // Check cell count has at least the first 10 columns for backward compatibility
    if (cells.length < 10) {
      rejectedRows.push({
        line: lineNumber,
        content: rawLine,
        reason: `Insufficient columns. Expected at least 10, found ${cells.length}.`
      });
      continue;
    }

    // Extract values
    const gate = cells[gateIdx];
    const rawQueue = cells[getColIndex('queue length')];
    const rawOccupancy = cells[getColIndex('occupancy')];
    const rawCapacity = cells[getColIndex('capacity')];
    const rawStaff = cells[getColIndex('staff')];
    const weather = cells[getColIndex('weather')] || 'Clear';
    const incident = cells[getColIndex('incident')] || 'None';
    const rawParking = cells[getColIndex('parking')];
    const rawTransitDelay = cells[getColIndex('transit delay')];
    const timeVal = cells[getColIndex('time')];

    // Extended optional fields
    const riskLevel = cells[getColIndex('risk level')] || 'Low';
    const emergencyStatus = cells[getColIndex('emergency status')] || 'Normal';
    const rawMedicalCases = cells[getColIndex('medical cases')];
    const rawSecurityAlerts = cells[getColIndex('security alerts')];
    const vipTraffic = cells[getColIndex('vip traffic')] || 'None';
    const shuttleStatus = cells[getColIndex('shuttle status')] || 'Optimal';
    const rawConfidence = cells[getColIndex('confidence')];

    const rowErrors = [];

    // Validation rules:
    // 1. Missing Gate ID
    if (!gate) {
      rowErrors.push("Missing Gate ID");
    }

    // 2. Queue length validations
    const queueLength = Number(rawQueue);
    if (rawQueue !== undefined && rawQueue !== '') {
      if (isNaN(queueLength)) {
        rowErrors.push(`Invalid Queue Length: '${rawQueue}' is not a number`);
      } else if (queueLength < 0) {
        rowErrors.push(`Negative Queue Length: ${queueLength}`);
      }
    } else {
      rowErrors.push("Missing Queue Length");
    }

    // 3. Occupancy validations
    let occupancyPercent = 0;
    if (rawOccupancy !== undefined && rawOccupancy !== '') {
      const cleanOccStr = rawOccupancy.replace('%', '');
      occupancyPercent = Number(cleanOccStr);
      if (isNaN(occupancyPercent)) {
        rowErrors.push(`Invalid Occupancy: '${rawOccupancy}' is not a number`);
      } else if (occupancyPercent < 0) {
        rowErrors.push(`Negative Occupancy: ${occupancyPercent}%`);
      } else if (occupancyPercent > 100) {
        rowErrors.push(`Occupancy above 100%: ${occupancyPercent}%`);
      }
    }

    // 4. Capacity validations
    const capacityVal = Number(rawCapacity);
    if (rawCapacity !== undefined && rawCapacity !== '') {
      if (isNaN(capacityVal)) {
        rowErrors.push(`Invalid Capacity: '${rawCapacity}'`);
      } else if (capacityVal < 0) {
        rowErrors.push(`Negative Capacity: ${capacityVal}`);
      }
    }

    // 5. Staff validations
    const staffVal = Number(rawStaff);
    if (rawStaff !== undefined && rawStaff !== '') {
      if (isNaN(staffVal)) {
        rowErrors.push(`Invalid Staff Count: '${rawStaff}'`);
      } else if (staffVal < 0) {
        rowErrors.push(`Negative Staff Count: ${staffVal}`);
      }
    }

    // 6. Time Format validations
    if (timeVal && !isValidTime(timeVal)) {
      rowErrors.push(`Invalid Time Format: '${timeVal}' (expected HH:MM or HH:MM:SS)`);
    }

    // 7. Parking and Transit Delay
    const parkingVal = rawParking ? Number(rawParking.replace('%', '')) : null;
    if (parkingVal !== null && (isNaN(parkingVal) || parkingVal < 0 || parkingVal > 100)) {
      rowErrors.push(`Invalid Parking Occupancy: '${rawParking}'`);
    }

    const transitDelayVal = rawTransitDelay ? Number(rawTransitDelay) : 0;
    if (isNaN(transitDelayVal) || transitDelayVal < 0) {
      rowErrors.push(`Invalid Transit Delay: '${rawTransitDelay}'`);
    }

    // 8. Extended fields validations (if present)
    let medicalCases = 0;
    if (rawMedicalCases !== undefined && rawMedicalCases !== '') {
      medicalCases = Number(rawMedicalCases);
      if (isNaN(medicalCases) || medicalCases < 0) {
        rowErrors.push(`Invalid Medical Cases: '${rawMedicalCases}'`);
      }
    }

    let securityAlerts = 0;
    if (rawSecurityAlerts !== undefined && rawSecurityAlerts !== '') {
      securityAlerts = Number(rawSecurityAlerts);
      if (isNaN(securityAlerts) || securityAlerts < 0) {
        rowErrors.push(`Invalid Security Alerts: '${rawSecurityAlerts}'`);
      }
    }

    let confidenceVal = null;
    if (rawConfidence !== undefined && rawConfidence !== '') {
      const cleanConf = rawConfidence.replace('%', '');
      confidenceVal = Number(cleanConf);
      if (isNaN(confidenceVal) || confidenceVal < 0 || confidenceVal > 100) {
        rowErrors.push(`Invalid Confidence: '${rawConfidence}'`);
      }
    }

    if (rowErrors.length > 0) {
      rejectedRows.push({
        line: lineNumber,
        content: rawLine,
        reason: rowErrors.join('; ')
      });
    } else {
      processedRows.push({
        gate,
        queueLength,
        occupancy: occupancyPercent,
        capacity: capacityVal || 0,
        staff: staffVal || 0,
        weather,
        incident,
        parking: parkingVal || 0,
        transitDelay: transitDelayVal,
        time: timeVal || '12:00',
        // Optional variables
        riskLevel,
        emergencyStatus,
        medicalCases,
        securityAlerts,
        vipTraffic,
        shuttleStatus,
        confidence: confidenceVal
      });
    }
  }

  return {
    success: rejectedRows.length === 0,
    processedRows,
    rejectedRows,
    summary: {
      total: processedRows.length + rejectedRows.length,
      processed: processedRows.length,
      rejected: rejectedRows.length
    }
  };
};
export default parseAndValidateCSV;
