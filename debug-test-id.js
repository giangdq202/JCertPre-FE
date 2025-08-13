// Debug utility to test different test ID formats
// Add this to your StudyPlanCreator or StudyPlanEditor for testing

// eslint-disable-next-line no-unused-vars
const debugTestId = (selectedTest) => {
  console.log('=== DEBUG TEST SELECTION ===');
  console.log('Selected test object:', selectedTest);
  console.log('testId (current):', selectedTest.testId);
  console.log('testTemplateTypeId:', selectedTest.testTemplateTypeId);
  console.log('testTemplateId:', selectedTest.testTemplateId);
  
  // You can try these different values:
  const possibleTestIds = {
    // Current approach
    currentTestId: selectedTest.testId,
    
    // Alternative approaches
    testTemplateTypeId: selectedTest.testTemplateTypeId,
    testTemplateId: selectedTest.testTemplateId,
    
    // If backend expects a different format
    // Maybe it needs the templateId with a prefix?
    templateIdWithPrefix: `template_${selectedTest.testTemplateId}`,
    
    // Or maybe it's the typeId with a prefix?
    typeIdWithPrefix: `type_${selectedTest.testTemplateTypeId}`,
  };
  
  console.log('Possible test IDs to try:', possibleTestIds);
  console.log('=== END DEBUG ===');
  
  // Return the ID you want to test
  return selectedTest.testId; // Change this to test different values
};

// Usage in your handleItemSelected function:
// const testIdToUse = debugTestId(test);
// newItems[editingItemIndex] = {
//   ...newItems[editingItemIndex],
//   testId: testIdToUse,
//   testName: test.title
// };
