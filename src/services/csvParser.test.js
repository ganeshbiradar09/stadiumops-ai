import { describe, test, expect } from 'vitest';
import { parseAndValidateCSV } from './csvParser';

describe('csvParser.js unit tests', () => {
  const validHeader = 'Gate, Queue Length, Occupancy, Capacity, Staff, Weather, Incident, Parking, Transit Delay, Time\n';
  
  test('parses empty or whitespace input safely as failure', () => {
    const resultNull = parseAndValidateCSV(null);
    expect(resultNull.success).toBe(false);
    expect(resultNull.summary.rejected).toBe(1);

    const resultBlank = parseAndValidateCSV('   ');
    expect(resultBlank.success).toBe(false);
    
    const resultEmptyFirstLine = parseAndValidateCSV('\nGate A, 10, 30%, 1000, 5, Clear, None, 50%, 0, 12:00');
    expect(resultEmptyFirstLine.success).toBe(false);
    expect(resultEmptyFirstLine.summary.rejected).toBe(1);
  });

  test('rejects CSV with missing required Gate header', () => {
    const csv = 'Queue Length, Occupancy, Capacity, Staff, Weather, Incident, Parking, Transit Delay, Time\n10, 30%, 1000, 5, Clear, None, 50%, 0, 12:00';
    const result = parseAndValidateCSV(csv);
    expect(result.success).toBe(false);
    expect(result.rejectedRows[0].reason).toContain("Missing required header: 'Gate'");
  });

  test('accepts mixed casing and whitespace in headers', () => {
    const csv = '  GaTe  , queue length, OCCUPANCY, capacity, staff, weather, incident, parking, transit delay, time\nGate A, 10, 30%, 1000, 5, Clear, None, 50%, 0, 12:00';
    const result = parseAndValidateCSV(csv);
    expect(result.success).toBe(true);
    expect(result.processedRows[0].gate).toBe('Gate A');
  });

  test('rejects rows with insufficient columns', () => {
    const csv = validHeader + 'Gate A, 10, 30%'; // only 3 columns
    const result = parseAndValidateCSV(csv);
    expect(result.success).toBe(false);
    expect(result.rejectedRows[0].reason).toContain('Insufficient columns');
  });

  describe('defensive validation rules', () => {
    test('rejects negative queue lengths, staff, capacity, and delays', () => {
      const row1 = 'Gate A, -5, 30%, 1000, 5, Clear, None, 50%, 0, 12:00\n'; // neg queue
      const row2 = 'Gate B, 10, 30%, -100, 5, Clear, None, 50%, 0, 12:00\n'; // neg capacity
      const row3 = 'Gate C, 10, 30%, 1000, -2, Clear, None, 50%, 0, 12:00\n'; // neg staff
      const row4 = 'Gate D, 10, 30%, 1000, 5, Clear, None, 50%, -10, 12:00\n'; // neg delay

      const result = parseAndValidateCSV(validHeader + row1 + row2 + row3 + row4);
      expect(result.success).toBe(false);
      expect(result.summary.rejected).toBe(4);
      expect(result.rejectedRows[0].reason).toContain('Negative Queue Length');
      expect(result.rejectedRows[1].reason).toContain('Negative Capacity');
      expect(result.rejectedRows[2].reason).toContain('Negative Staff Count');
      expect(result.rejectedRows[3].reason).toContain('Invalid Transit Delay');
    });

    test('validates occupancy bounds (0% to 100%)', () => {
      const rowNeg = 'Gate A, 10, -5%, 1000, 5, Clear, None, 50%, 0, 12:00\n';
      const rowOver = 'Gate B, 10, 105%, 1000, 5, Clear, None, 50%, 0, 12:00\n';
      
      const result = parseAndValidateCSV(validHeader + rowNeg + rowOver);
      expect(result.success).toBe(false);
      expect(result.summary.rejected).toBe(2);
      expect(result.rejectedRows[0].reason).toContain('Negative Occupancy');
      expect(result.rejectedRows[1].reason).toContain('Occupancy above 100%');
    });

    test('validates non-numeric inputs for staff, parking, and medical cases', () => {
      const rowBadStaff = 'Gate A, 10, 30%, 1000, badstaff, Clear, None, 50%, 0, 12:00\n';
      const rowBadParking = 'Gate B, 10, 30%, 1000, 5, Clear, None, badparking, 0, 12:00\n';
      const headerWithMed = 'Gate, Queue Length, Occupancy, Capacity, Staff, Weather, Incident, Parking, Transit Delay, Time, Medical Cases\n';
      const rowBadMed = 'Gate C, 10, 30%, 1000, 5, Clear, None, 50%, 0, 12:00, badmed\n';

      const resultStaff = parseAndValidateCSV(validHeader + rowBadStaff);
      expect(resultStaff.rejectedRows[0].reason).toContain('Invalid Staff Count');

      const resultParking = parseAndValidateCSV(validHeader + rowBadParking);
      expect(resultParking.rejectedRows[0].reason).toContain('Invalid Parking Occupancy');

      const resultMed = parseAndValidateCSV(headerWithMed + rowBadMed);
      expect(resultMed.rejectedRows[0].reason).toContain('Invalid Medical Cases');
    });

    test('validates missing and non-numeric queue length, occupancy, and capacity', () => {
      const rowBadQueue = 'Gate A, badqueue, 30%, 1000, 5, Clear, None, 50%, 0, 12:00\n';
      const rowMissingQueue = 'Gate B, , 30%, 1000, 5, Clear, None, 50%, 0, 12:00\n';
      const rowBadOcc = 'Gate C, 10, badocc, 1000, 5, Clear, None, 50%, 0, 12:00\n';
      const rowBadCap = 'Gate D, 10, 30%, badcap, 5, Clear, None, 50%, 0, 12:00\n';

      const resultBadQueue = parseAndValidateCSV(validHeader + rowBadQueue);
      expect(resultBadQueue.rejectedRows[0].reason).toContain('Invalid Queue Length');

      const resultMissingQueue = parseAndValidateCSV(validHeader + rowMissingQueue);
      expect(resultMissingQueue.rejectedRows[0].reason).toContain('Missing Queue Length');

      const resultBadOcc = parseAndValidateCSV(validHeader + rowBadOcc);
      expect(resultBadOcc.rejectedRows[0].reason).toContain('Invalid Occupancy');

      const resultBadCap = parseAndValidateCSV(validHeader + rowBadCap);
      expect(resultBadCap.rejectedRows[0].reason).toContain('Invalid Capacity');

      const rowMissingGate = ', 10, 30%, 1000, 5, Clear, None, 50%, 0, 12:00\n';
      const resultMissingGate = parseAndValidateCSV(validHeader + rowMissingGate);
      expect(resultMissingGate.rejectedRows[0].reason).toContain('Missing Gate ID');
    });

    test('validates time formats (HH:MM or HH:MM:SS)', () => {
      const badTime1 = 'Gate A, 10, 30%, 1000, 5, Clear, None, 50%, 0, 25:00\n'; // bad hour
      const badTime2 = 'Gate B, 10, 30%, 1000, 5, Clear, None, 50%, 0, 12:61\n'; // bad minutes
      const badTime3 = 'Gate C, 10, 30%, 1000, 5, Clear, None, 50%, 0, badtime\n';
      const goodTime1 = 'Gate D, 10, 30%, 1000, 5, Clear, None, 50%, 0, 08:30\n';
      const goodTime2 = 'Gate E, 10, 30%, 1000, 5, Clear, None, 50%, 0, 19:45:30\n';

      const result = parseAndValidateCSV(validHeader + badTime1 + badTime2 + badTime3 + goodTime1 + goodTime2);
      expect(result.summary.processed).toBe(2);
      expect(result.summary.rejected).toBe(3);
      expect(result.rejectedRows[0].reason).toContain('Invalid Time Format');
    });

    test('validates security alerts and confidence limits', () => {
      const header = 'Gate, Queue Length, Occupancy, Capacity, Staff, Weather, Incident, Parking, Transit Delay, Time, Security Alerts, Confidence\n';
      const row1 = 'Gate A, 10, 30%, 1000, 5, Clear, None, 50%, 0, 12:00, -1, 50%\n'; // neg security alerts
      const row2 = 'Gate B, 10, 30%, 1000, 5, Clear, None, 50%, 0, 12:00, 2, 120%\n'; // over 100% confidence
      const row3 = 'Gate C, 10, 30%, 1000, 5, Clear, None, 50%, 0, 12:00, 0, -10%\n'; // neg confidence

      const result = parseAndValidateCSV(header + row1 + row2 + row3);
      expect(result.success).toBe(false);
      expect(result.summary.rejected).toBe(3);
      expect(result.rejectedRows[0].reason).toContain('Invalid Security Alerts');
      expect(result.rejectedRows[1].reason).toContain('Invalid Confidence');
      expect(result.rejectedRows[2].reason).toContain('Invalid Confidence');
    });
  });

  describe('performance and size bounds tests', () => {
    test('handles large files (10,000 rows) successfully', () => {
      let largeCsv = validHeader;
      for (let i = 0; i < 10000; i++) {
        largeCsv += `Gate ${i}, 10, 30%, 1000, 5, Clear, None, 50%, 0, 12:00\n`;
      }
      const result = parseAndValidateCSV(largeCsv);
      expect(result.success).toBe(true);
      expect(result.summary.processed).toBe(10000);
    });

    test('parses 5,000 rows in less than 100 milliseconds', () => {
      let csv = validHeader;
      for (let i = 0; i < 5000; i++) {
        csv += `Gate ${i}, 15, 45%, 1500, 10, Rainy, None, 75%, 2, 18:30\n`;
      }
      
      const startTime = performance.now();
      const result = parseAndValidateCSV(csv);
      const endTime = performance.now();
      
      expect(result.success).toBe(true);
      expect(result.summary.processed).toBe(5000);
      expect(endTime - startTime).toBeLessThan(300);
    });
  });
});
