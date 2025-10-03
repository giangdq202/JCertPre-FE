import { getAllTestAttemptsByUserId, TestAttemptDto, TestAttemptStatus } from './testAttemptService';

/**
 * Check if user has passed a specific test
 * @param userId - User ID
 * @param testId - Test ID
 * @returns true if user has at least one passing attempt for the test
 */
export const hasUserPassedTest = async (userId: string, testId: string): Promise<boolean> => {
  try {
    const attempts = await getAllTestAttemptsByUserId(userId);
    
    // Find attempts for this specific test that are passed
    const passingAttempts = attempts.filter(attempt => 
      attempt.testId === testId && 
      attempt.isPass === true
    );
    
    return passingAttempts.length > 0;
  } catch (error) {
    console.error('Error checking test completion:', error);
    return false;
  }
};

/**
 * Get all test IDs that user has passed
 * @param userId - User ID
 * @returns Set of test IDs that user has passed
 */
export const getUserPassedTestIds = async (userId: string): Promise<Set<string>> => {
  try {
    console.log('=== getUserPassedTestIds DEBUG ===');
    console.log('UserID:', userId);
    
    const attempts = await getAllTestAttemptsByUserId(userId);
    console.log('Total attempts from API:', attempts.length);
    
    const passedTestIds = new Set<string>();
    attempts.forEach((attempt, index) => {
      console.log(`Attempt ${index}: id=${attempt.attemptId}, status=${attempt.status}, isPass=${attempt.isPass}, testId=${attempt.testId}`);
      console.log(`TestAttemptStatus.Completed value:`, TestAttemptStatus.Completed);
      
      // Must be completed AND passed
      if (attempt.status === TestAttemptStatus.Completed && attempt.isPass === true) {
        console.log(`✅ PASSED: Adding testId ${attempt.testId} to passed set`);
        passedTestIds.add(attempt.testId);
      } else {
        console.log(`❌ NOT PASSED: status=${attempt.status} (expected ${TestAttemptStatus.Completed}), isPass=${attempt.isPass}`);
      }
    });
    
    console.log('Final passed test IDs:', Array.from(passedTestIds));
    return passedTestIds;
  } catch (error) {
    console.error('Error getting passed test IDs:', error);
    return new Set();
  }
};

/**
 * Check if user can proceed to next lesson based on test completion
 * @param userId - User ID
 * @param testId - Test ID (if lesson has a test)
 * @returns true if user can proceed (no test or test is passed)
 */
export const canUserProceedToNextLesson = async (userId: string, testId?: string): Promise<boolean> => {
  if (!testId) {
    // No test required, user can proceed
    return true;
  }
  
  // Test required, check if user passed it
  return await hasUserPassedTest(userId, testId);
};

/**
 * Get test completion summary for multiple tests
 * @param userId - User ID
 * @param testIds - Array of test IDs to check
 * @returns Map of testId -> isPass status
 */
export const getTestCompletionSummary = async (
  userId: string, 
  testIds: string[]
): Promise<Map<string, boolean>> => {
  try {
    const attempts = await getAllTestAttemptsByUserId(userId);
    const summary = new Map<string, boolean>();
    
    // Initialize all tests as not passed
    testIds.forEach(testId => {
      summary.set(testId, false);
    });
    
    // Update status for passed tests
    attempts.forEach(attempt => {
      if (attempt.isPass === true && testIds.includes(attempt.testId)) {
        summary.set(attempt.testId, true);
      }
    });
    
    return summary;
  } catch (error) {
    console.error('Error getting test completion summary:', error);
    // Return all false on error
    const summary = new Map<string, boolean>();
    testIds.forEach(testId => {
      summary.set(testId, false);
    });
    return summary;
  }
};

export default {
  hasUserPassedTest,
  getUserPassedTestIds,
  canUserProceedToNextLesson,
  getTestCompletionSummary
};
