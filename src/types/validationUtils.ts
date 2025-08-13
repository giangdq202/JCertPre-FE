/**
 * Shared validation utilities
 * These functions are used across multiple validation systems to ensure consistency
 */

/**
 * Utility function to validate GUID format and ensure it's not default/empty
 * Matches backend NotDefaultGuidAttribute behavior exactly
 */
export const isValidGuid = (guid: string): boolean => {
  // Check if it's a valid GUID format
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!guidRegex.test(guid)) {
    return false;
  }
  
  // Check if it's not the default/empty GUID (00000000-0000-0000-0000-000000000000)
  // This matches the backend NotDefaultGuidAttribute behavior
  return guid !== '00000000-0000-0000-0000-000000000000';
};

/**
 * Common validation result type used across all validation systems
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Common validation function signature used across all validation systems
 */
export type ValidationFunction<T> = (value: T) => ValidationResult;
