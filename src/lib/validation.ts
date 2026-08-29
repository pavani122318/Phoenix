export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface StationMatch {
  stationId: string;
  stationName: string;
  city: string;
  state: string;
}

// Simple map of seeded PIN codes to station info for instant checks
const PIN_CODE_STATION_MAP: Record<string, StationMatch> = {
  // Mumbai PINs
  '400001': { stationId: 'mumbai', stationName: 'Phoenix Mumbai Station', city: 'Mumbai', state: 'Maharashtra' },
  '400002': { stationId: 'mumbai', stationName: 'Phoenix Mumbai Station', city: 'Mumbai', state: 'Maharashtra' },
  '400003': { stationId: 'mumbai', stationName: 'Phoenix Mumbai Station', city: 'Mumbai', state: 'Maharashtra' },
  '400004': { stationId: 'mumbai', stationName: 'Phoenix Mumbai Station', city: 'Mumbai', state: 'Maharashtra' },
  '400005': { stationId: 'mumbai', stationName: 'Phoenix Mumbai Station', city: 'Mumbai', state: 'Maharashtra' },
  '400020': { stationId: 'mumbai', stationName: 'Phoenix Mumbai Station', city: 'Mumbai', state: 'Maharashtra' },
  '400021': { stationId: 'mumbai', stationName: 'Phoenix Mumbai Station', city: 'Mumbai', state: 'Maharashtra' },
  
  // Hyderabad PINs
  '500001': { stationId: 'hyderabad', stationName: 'Phoenix Hyderabad Station', city: 'Hyderabad', state: 'Telangana' },
  '500002': { stationId: 'hyderabad', stationName: 'Phoenix Hyderabad Station', city: 'Hyderabad', state: 'Telangana' },
  '500003': { stationId: 'hyderabad', stationName: 'Phoenix Hyderabad Station', city: 'Hyderabad', state: 'Telangana' },
  '500081': { stationId: 'hyderabad', stationName: 'Phoenix Hyderabad Station', city: 'Hyderabad', state: 'Telangana' },
  '500082': { stationId: 'hyderabad', stationName: 'Phoenix Hyderabad Station', city: 'Hyderabad', state: 'Telangana' },
  '500032': { stationId: 'hyderabad', stationName: 'Phoenix Hyderabad Station', city: 'Hyderabad', state: 'Telangana' },
  
  // Delhi PINs
  '110001': { stationId: 'delhi', stationName: 'Phoenix Delhi Station', city: 'Delhi', state: 'Delhi' },
  '110002': { stationId: 'delhi', stationName: 'Phoenix Delhi Station', city: 'Delhi', state: 'Delhi' },
  '110003': { stationId: 'delhi', stationName: 'Phoenix Delhi Station', city: 'Delhi', state: 'Delhi' },
  '110004': { stationId: 'delhi', stationName: 'Phoenix Delhi Station', city: 'Delhi', state: 'Delhi' },
  '110011': { stationId: 'delhi', stationName: 'Phoenix Delhi Station', city: 'Delhi', state: 'Delhi' },
  '110021': { stationId: 'delhi', stationName: 'Phoenix Delhi Station', city: 'Delhi', state: 'Delhi' },
};

/**
 * Validates Indian PIN code format (6 digits)
 */
export function validatePinCode(pinCode: string): ValidationResult {
  const trimmed = pinCode.trim();
  if (!trimmed) {
    return { isValid: false, error: 'PIN code is required' };
  }
  if (!/^\d{6}$/.test(trimmed)) {
    return { isValid: false, error: 'PIN code must be a 6-digit number' };
  }
  return { isValid: true };
}

/**
 * Checks if pigeon delivery is operationally available for a PIN code.
 * Returns station information if served.
 */
export function getStationForPinCode(pinCode: string): StationMatch | null {
  const cleanPin = pinCode.trim();
  return PIN_CODE_STATION_MAP[cleanPin] || null;
}

/**
 * Validates Indian Phone Number (10 digits starting with 6-9)
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Phone number is required' };
  }
  if (!/^[6-9]\d{9}$/.test(trimmed)) {
    return { isValid: false, error: 'Enter a valid 10-digit Indian phone number (starting with 6-9)' };
  }
  return { isValid: true };
}
