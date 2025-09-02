import axiosInstance from '../consts/axios/axiosInstance';
import {
  CREATE_STUDY_PLAN_ITEM_URL,
  DELETE_STUDY_PLAN_ITEM_URL,
  GET_STUDY_PLAN_ITEM_BY_ID_URL,
  GET_STUDY_PLAN_ITEMS_BY_PLAN_URL,
  UPDATE_STUDY_PLAN_ITEM_URL
} from '../consts/apiUrl/baseUrl';
// ====== IMPORTS ======

export type {
  ItemStatus,
  StudyPlanItemDto,
  CreateStudyPlanItemRequest,
  UpdateStudyPlanItemRequest,
  StudyPlanItemWithDetails,
  StudyPlanStatusSummary,
  StudyPlanItemFilters,
  StudyPlanItemValidationResult
} from '../types/StudyPlan';

import {
  ItemStatus,
  StudyPlanItemDto,
  CreateStudyPlanItemRequest,
  UpdateStudyPlanItemRequest
} from '../types/StudyPlan';

// ====== SERVICE FUNCTIONS ======

/**
 * Creates a new study plan item using query parameters
 */
export const createStudyPlanItem = async (itemData: CreateStudyPlanItemRequest): Promise<StudyPlanItemDto> => {
  try {
    console.log('Creating study plan item:', itemData);
    
    // Build query parameters for the API
    const params = new URLSearchParams({
      planId: itemData.planId,
      sequence: itemData.sequence.toString(),
      itemType: itemData.itemType
    });

    if (itemData.courseId) {
      params.append('courseId', itemData.courseId);
    }
    if (itemData.testTemplateTypeId) {
      params.append('testTemplateTypeId', itemData.testTemplateTypeId);
    }
    if (itemData.status !== undefined) {
      params.append('status', itemData.status.toString());
    }
    if (itemData.description) {
      params.append('description', itemData.description);
    }
    
    const response = await axiosInstance.post<StudyPlanItemDto>(
      `${CREATE_STUDY_PLAN_ITEM_URL}?${params.toString()}`
    );
    
    console.log('Study plan item created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Create study plan item API error:', error);
    throw error;
  }
};

/**
 * Gets a study plan item by ID
 */
export const getStudyPlanItemById = async (itemId: string): Promise<StudyPlanItemDto> => {
  try {
    console.log('Getting study plan item by ID:', itemId);
    
    const response = await axiosInstance.get<StudyPlanItemDto>(
      GET_STUDY_PLAN_ITEM_BY_ID_URL(itemId)
    );
    
    console.log('Study plan item retrieved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get study plan item by ID API error:', error);
    throw error;
  }
};

/**
 * Gets all study plan items for a specific plan
 */
export const getStudyPlanItemsByPlan = async (planId: string): Promise<StudyPlanItemDto[]> => {
  try {
    console.log('Getting study plan items by plan ID:', planId);
    
    const response = await axiosInstance.get<StudyPlanItemDto[]>(
      GET_STUDY_PLAN_ITEMS_BY_PLAN_URL(planId)
    );
    
    console.log('Study plan items retrieved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get study plan items by plan API error:', error);
    throw error;
  }
};

/**
 * Updates an existing study plan item
 */
export const updateStudyPlanItem = async (
  itemId: string, 
  updateData: UpdateStudyPlanItemRequest
): Promise<StudyPlanItemDto> => {
  try {
    console.log('Updating study plan item:', itemId, updateData);
    
    const response = await axiosInstance.put<StudyPlanItemDto>(
      UPDATE_STUDY_PLAN_ITEM_URL(itemId),
      updateData
    );
    
    console.log('Study plan item updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Update study plan item API error:', error);
    throw error;
  }
};

/**
 * Deletes a study plan item
 */
export const deleteStudyPlanItem = async (itemId: string): Promise<void> => {
  try {
    console.log('Deleting study plan item:', itemId);
    
    await axiosInstance.delete(DELETE_STUDY_PLAN_ITEM_URL(itemId));
    
    console.log('Study plan item deleted successfully');
  } catch (error) {
    console.error('Delete study plan item API error:', error);
    throw error;
  }
};

/**
 * Updates the status of a study plan item
 */
export const updateStudyPlanItemStatus = async (
  itemId: string, 
  status: ItemStatus
): Promise<StudyPlanItemDto> => {
  try {
    console.log('Updating study plan item status:', itemId, status);
    
    const response = await updateStudyPlanItem(itemId, { status });
    
    console.log('Study plan item status updated successfully:', response);
    return response;
  } catch (error) {
    console.error('Update study plan item status API error:', error);
    throw error;
  }
};

/**
 * Reorders study plan items by updating their sequence
 */
export const reorderStudyPlanItems = async (
  items: { itemId: string; sequence: number }[]
): Promise<StudyPlanItemDto[]> => {
  try {
    console.log('Reordering study plan items:', items);
    
    const updatePromises = items.map(item =>
      updateStudyPlanItem(item.itemId, { sequence: item.sequence })
    );
    
    const results = await Promise.all(updatePromises);
    
    console.log('Study plan items reordered successfully:', results);
    return results;
  } catch (error) {
    console.error('Reorder study plan items API error:', error);
    throw error;
  }
};

// ====== UTILITY FUNCTIONS ======

/**
 * Sorts study plan items by sequence
 */
export const sortStudyPlanItemsBySequence = (items: StudyPlanItemDto[]): StudyPlanItemDto[] => {
  return [...items].sort((a, b) => a.sequence - b.sequence);
};

/**
 * Gets the next sequence number for a new item
 */
export const getNextSequence = (existingItems: StudyPlanItemDto[]): number => {
  if (existingItems.length === 0) return 1;
  const maxSequence = Math.max(...existingItems.map(item => item.sequence));
  return maxSequence + 1;
};

/**
 * Filters items by type
 */
export const filterItemsByType = (items: StudyPlanItemDto[], itemType: string): StudyPlanItemDto[] => {
  return items.filter(item => item.itemType === itemType);
};

/**
 * Filters items by status
 */
export const filterItemsByStatus = (items: StudyPlanItemDto[], status: ItemStatus): StudyPlanItemDto[] => {
  return items.filter(item => item.status === status);
};

/**
 * Gets completion percentage
 */
export const getCompletionPercentage = (items: StudyPlanItemDto[]): number => {
  if (items.length === 0) return 0;
  const completedItems = items.filter(item => item.status === ItemStatus.COMPLETED);
  return Math.round((completedItems.length / items.length) * 100);
};

/**
 * Gets status summary
 */
export const getStatusSummary = (items: StudyPlanItemDto[]) => {
  const summary = {
    total: items.length,
    notStarted: 0,
    inProgress: 0,
    completed: 0,
    skipped: 0
  };

  items.forEach(item => {
    switch (item.status) {
      case ItemStatus.NOT_STARTED:
        summary.notStarted++;
        break;
      case ItemStatus.IN_PROGRESS:
        summary.inProgress++;
        break;
      case ItemStatus.COMPLETED:
        summary.completed++;
        break;
      case ItemStatus.SKIPPED:
        summary.skipped++;
        break;
    }
  });

  return summary;
};

/**
 * Gets item type display text
 */
export const getItemTypeText = (itemType: string): string => {
  switch (itemType.toLowerCase()) {
    case 'course':
      return 'Khóa học';
    case 'test':
      return 'Bài kiểm tra';
    case 'lesson':
      return 'Bài học';
    case 'assignment':
      return 'Bài tập';
    default:
      return itemType;
  }
};

/**
 * Gets item type icon
 */
export const getItemTypeIcon = (itemType: string): string => {
  switch (itemType.toLowerCase()) {
    case 'course':
      return '📚';
    case 'test':
      return '📝';
    case 'lesson':
      return '📖';
    case 'assignment':
      return '✏️';
    default:
      return '📄';
  }
};

/**
 * Validates item data
 */
export const validateStudyPlanItem = (item: CreateStudyPlanItemRequest): string[] => {
  const errors: string[] = [];

  if (!item.planId) {
    errors.push('Plan ID is required');
  }

  if (!item.itemType) {
    errors.push('Item type is required');
  }

  if (item.sequence < 1) {
    errors.push('Sequence must be greater than 0');
  }

  if (item.itemType === 'course' && !item.courseId) {
    errors.push('Course ID is required for course items');
  }

  if (item.itemType === 'test' && !item.testTemplateTypeId) {
    errors.push('Test ID is required for test items');
  }

  return errors;
};

/**
 * Helper to create course study plan item
 */
export const createCourseItem = async (
  planId: string,
  courseId: string,
  sequence?: number,
  existingItems?: StudyPlanItemDto[]
): Promise<StudyPlanItemDto> => {
  const itemSequence = sequence || getNextSequence(existingItems || []);
  
  return createStudyPlanItem({
    planId,
    sequence: itemSequence,
    itemType: 'course',
    courseId,
    status: ItemStatus.NOT_STARTED
  });
};

/**
 * Helper to create test study plan item
 */
export const createTestItem = async (
  planId: string,
  testId: string,
  sequence?: number,
  existingItems?: StudyPlanItemDto[]
): Promise<StudyPlanItemDto> => {
  const itemSequence = sequence || getNextSequence(existingItems || []);
  
  return createStudyPlanItem({
    planId,
    sequence: itemSequence,
    itemType: 'test',
    testTemplateTypeId: testId,
    status: ItemStatus.NOT_STARTED
  });
};

/**
 * Batch create multiple items for a study plan
 */
export const batchCreateStudyPlanItems = async (
  items: CreateStudyPlanItemRequest[]
): Promise<StudyPlanItemDto[]> => {
  try {
    console.log('Batch creating study plan items:', items);
    
    const createPromises = items.map(item => createStudyPlanItem(item));
    const results = await Promise.all(createPromises);
    
    console.log('Batch create completed:', results);
    return results;
  } catch (error) {
    console.error('Batch create study plan items error:', error);
    throw error;
  }
};

// ====== DEBUG/TESTING FUNCTIONS ======

/**
 * Debug function to test all study plan item APIs
 */
export const debugStudyPlanItemAPI = async (planId: string) => {
  console.group('=== STUDY PLAN ITEM API DEBUG ===');
  
  try {
    // Test get items by plan
    console.log('1. Testing getStudyPlanItemsByPlan...');
    const planItems = await getStudyPlanItemsByPlan(planId);
    console.log('Plan items:', planItems);
    
    if (planItems.length > 0) {
      // Test get by ID
      console.log('2. Testing getStudyPlanItemById...');
      const firstItem = await getStudyPlanItemById(planItems[0].itemId);
      console.log('First item:', firstItem);
      
      // Test utility functions
      console.log('3. Testing utility functions...');
      const sortedItems = sortStudyPlanItemsBySequence(planItems);
      const completionPercentage = getCompletionPercentage(planItems);
      const statusSummary = getStatusSummary(planItems);
      
      console.log('Sorted items:', sortedItems);
      console.log('Completion percentage:', completionPercentage);
      console.log('Status summary:', statusSummary);
    }
    
  } catch (error) {
    console.error('Study plan item API debug error:', error);
  }
  
  console.groupEnd();
};

/**
 * Example usage of study plan item service
 */
export const studyPlanItemServiceExamples = () => {
  console.group('=== STUDY PLAN ITEM SERVICE EXAMPLES ===');
  
  console.log(`
// Create a new study plan item (uses query parameters)
const newItem = await createStudyPlanItem({
  planId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  sequence: 1,
  itemType: "course",
  courseId: "course-guid-here",
  status: ItemStatus.NOT_STARTED
});

// Create test item
const testItem = await createStudyPlanItem({
  planId: "3fa85f64-5717-4562-b3fc-2c963f66afa6", 
  sequence: 2,
  itemType: "test",
  testId: "test-guid-here",
  status: ItemStatus.NOT_STARTED
});

// Get study plan item by ID
const item = await getStudyPlanItemById("item-guid-here");

// Get all items for a plan
const planItems = await getStudyPlanItemsByPlan("plan-guid-here");

// Update study plan item
const updatedItem = await updateStudyPlanItem("item-guid-here", {
  status: ItemStatus.COMPLETED
});

// Update only status
const statusUpdatedItem = await updateStudyPlanItemStatus("item-guid-here", ItemStatus.IN_PROGRESS);

// Reorder items
const reorderedItems = await reorderStudyPlanItems([
  { itemId: "item1", sequence: 2 },
  { itemId: "item2", sequence: 1 }
]);

// Utility functions
const sortedItems = sortStudyPlanItemsBySequence(items);
const nextSequence = getNextSequence(existingItems);
const completionRate = getCompletionPercentage(items);
const summary = getStatusSummary(items);
const courseItems = filterItemsByType(items, "course");
const completedItems = filterItemsByStatus(items, ItemStatus.COMPLETED);

// Display helpers
const typeText = getItemTypeText("course"); // "Khóa học"
const typeIcon = getItemTypeIcon("test");   // "📝"
const statusText = getItemStatusText(ItemStatus.COMPLETED); // "Hoàn thành"
const statusColor = getItemStatusColor(ItemStatus.IN_PROGRESS); // "text-blue-600 bg-blue-100"
  `);
  
  console.groupEnd();
};
