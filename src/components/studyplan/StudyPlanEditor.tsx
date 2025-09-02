import React, { useState, useEffect } from 'react';
import { 
  HiTrash, 
  HiSearch, 
  HiSave,
  HiOutlineBookOpen,
  HiOutlineClipboardList,
  HiX,
  HiPencil,
  HiPlus,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/AuthContext';
import { updateStudyPlan, deleteStudyPlan } from '../../services/studyPlanService';
import { 
  createStudyPlanItem, 
  updateStudyPlanItem, 
  deleteStudyPlanItem,
  CreateStudyPlanItemRequest
} from '../../services/studyPlanItemService';
import { UpdateStudyPlanRequest, UpdateStudyPlanItemRequest } from '../../types/StudyPlan';
import { CourseListDto, getCourseById, CourseDto } from '../../services/courseService';
import { getTestTemplateTypeNameById } from '../../services/testTemplateTypeService';
import CourseTestSearchModal, { TestOption } from './CourseTestSearchModal';
import { StudyPlanDto, StudyPlanItemDto, ItemStatus } from '../../types/StudyPlan';

interface StudyPlanItem {
  id: string; // itemId for existing items, temp ID for new items
  sequence: number;
  itemType: 'course' | 'test';
  courseId?: string;
  testTemplateTypeId?: string; // Changed from testId to testTemplateTypeId
  courseName?: string;
  testName?: string;
  description?: string; // Add description field
  isNew?: boolean; // Flag to indicate if this is a new item
  isDeleted?: boolean; // Flag to mark items for deletion
}

interface StudyPlanEditorProps {
  studyPlan: StudyPlanDto;
  studyPlanItems: StudyPlanItemDto[];
  studentId?: string; // Add studentId to fetch personal courses
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void; // Optional delete callback
}

const StudyPlanEditor: React.FC<StudyPlanEditorProps> = ({
  studyPlan,
  studyPlanItems,
  studentId,
  onSave,
  onCancel,
  onDelete
}) => {
  const { userInfo } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchType, setSearchType] = useState<'course' | 'test'>('course');
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Study Plan Form Data
  const [planName, setPlanName] = useState(studyPlan.planName);
  const [description, setDescription] = useState(studyPlan.description);
  const [startDate, setStartDate] = useState(studyPlan.startDate.split('T')[0]);
  const [endDate, setEndDate] = useState(studyPlan.endDate.split('T')[0]);
  const [items, setItems] = useState<StudyPlanItem[]>([]);

  // Initialize items from props
  useEffect(() => {
    const loadItemsWithDetails = async () => {
      const initialItems = await Promise.all(
        studyPlanItems.map(async (item) => {
          let courseName = undefined;
          let testName = undefined;
          
          try {
            if (item.itemType === 'course' && item.courseId) {
              const course: CourseDto = await getCourseById(item.courseId);
              courseName = course.title;
            } else if (item.itemType === 'test' && item.testTemplateTypeId) {
              const testName_temp = await getTestTemplateTypeNameById(item.testTemplateTypeId);
              testName = testName_temp || `Test ${item.testTemplateTypeId}`;
            }
            
            // Also load both course and test if both IDs exist
            if (item.courseId && !courseName) {
              const course: CourseDto = await getCourseById(item.courseId);
              courseName = course.title;
            }
            if (item.testTemplateTypeId && !testName) {
              const testName_temp = await getTestTemplateTypeNameById(item.testTemplateTypeId);
              testName = testName_temp || `Test ${item.testTemplateTypeId}`;
            }
          } catch (error) {
            console.error('Error loading item details:', error);
            courseName = item.courseId ? `Course ${item.courseId}` : undefined;
            testName = item.testTemplateTypeId ? `Test ${item.testTemplateTypeId}` : undefined;
          }
          
          return {
            id: item.itemId,
            sequence: item.sequence,
            itemType: item.itemType as 'course' | 'test',
            courseId: item.courseId,
            testTemplateTypeId: item.testTemplateTypeId,
            courseName,
            testName,
            description: item.description, // Include description from API
            isNew: false,
            isDeleted: false
          };
        })
      );
      setItems(initialItems);
    };
    
    loadItemsWithDetails();
  }, [studyPlanItems]);

  const addItem = () => {
    const newItem: StudyPlanItem = {
      id: `temp_${Date.now()}`,
      sequence: items.filter(item => !item.isDeleted).length + 1,
      itemType: 'course', // Default to course since UI item can contain both
      isNew: true,
      isDeleted: false
    };
    setItems([...items, newItem]);
    // Remove the automatic modal opening
    // setEditingItemIndex(items.length);
    // setSearchType(type);
    // setShowSearchModal(true);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    const item = newItems[index];
    
    if (item.isNew) {
      // Remove new items completely
      newItems.splice(index, 1);
    } else {
      // Mark existing items for deletion
      newItems[index] = { ...item, isDeleted: true };
    }
    
    // Update sequences for remaining items
    const activeItems = newItems.filter(item => !item.isDeleted);
    activeItems.forEach((item, i) => {
      const originalIndex = newItems.findIndex(originalItem => originalItem.id === item.id);
      newItems[originalIndex] = { ...newItems[originalIndex], sequence: i + 1 };
    });
    
    setItems(newItems);
  };

  const updateItemDescription = (index: number, description: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], description };
    setItems(newItems);
  };

  const handleItemSelected = (selectedItem: CourseListDto | TestOption) => {
    if (editingItemIndex === null) return;

    const newItems = [...items];
    if (searchType === 'course') {
      const course = selectedItem as CourseListDto;
      newItems[editingItemIndex] = {
        ...newItems[editingItemIndex],
        courseId: course.courseId,
        courseName: course.title
        // Don't clear testId and testName - keep existing test if any
      };
    } else {
      const test = selectedItem as TestOption;
      
      // DEBUG: Log all possible test IDs
      console.log('=== DEBUG TEST SELECTION (EDITOR) ===');
      console.log('Selected test object:', test);
      console.log('testId (will be used):', test.testId);
      console.log('testTemplateTypeId:', test.testTemplateTypeId);
      console.log('testTemplateId:', test.testTemplateId);
      console.log('=== END DEBUG ===');
      
      newItems[editingItemIndex] = {
        ...newItems[editingItemIndex],
        testTemplateTypeId: test.testId, // Map test.testId to testTemplateTypeId
        testName: test.title
        // Don't clear courseId and courseName - keep existing course if any
      };
    }
    
    setItems(newItems);
    setShowSearchModal(false);
    setEditingItemIndex(null);
  };

  const handleSave = async () => {
    if (!userInfo?.id) {
      toast.error('Không thể xác định thông tin người dùng');
      return;
    }

    if (!planName.trim()) {
      toast.error('Vui lòng nhập tên lộ trình học');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Vui lòng chọn ngày bắt đầu và kết thúc');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    const activeItems = items.filter(item => !item.isDeleted);
    if (activeItems.length === 0) {
      toast.error('Vui lòng thêm ít nhất một mục học tập');
      return;
    }

    // Check if all active items have at least one content (course or test)
    const invalidItems = activeItems.filter(item => 
      !item.courseId && !item.testTemplateTypeId
    );

    if (invalidItems.length > 0) {
      toast.error('Vui lòng chọn ít nhất một khóa học hoặc bài test cho tất cả các mục');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Update study plan basic info
      const updatePlanData: UpdateStudyPlanRequest = {
        planName: planName.trim(),
        description: description.trim() || '',
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString()
      };
      
      await updateStudyPlan(studyPlan.planId, updatePlanData);

      // 2. Handle item changes
      const promises: Promise<any>[] = [];

      // Delete marked items
      const itemsToDelete = items.filter(item => item.isDeleted && !item.isNew);
      itemsToDelete.forEach(item => {
        promises.push(deleteStudyPlanItem(item.id));
      });

      // Create new items
      const newItems = items.filter(item => item.isNew && !item.isDeleted);
      
      newItems.forEach(item => {
        console.log('=== PROCESSING NEW ITEM ===');
        console.log('Item data:', item);
        console.log('courseId:', item.courseId);
        console.log('testTemplateTypeId:', item.testTemplateTypeId);
        
        const itemRequest: CreateStudyPlanItemRequest = {
          planId: studyPlan.planId,
          sequence: item.sequence,
          itemType: item.itemType,
          courseId: item.courseId,
          testTemplateTypeId: item.testTemplateTypeId,
          description: item.description || '',
          status: ItemStatus.NOT_STARTED
        };
        
        console.log('Creating study plan item with both course and test:', itemRequest);
        promises.push(createStudyPlanItem(itemRequest));
        console.log('=== END PROCESSING ITEM ===');
      });

      // Update existing items (sequence or content changes)
      const existingItems = items.filter(item => !item.isNew && !item.isDeleted);
      const originalItems = studyPlanItems;
      
      existingItems.forEach(item => {
        const originalItem = originalItems.find(orig => orig.itemId === item.id);
        if (originalItem) {
          const hasChanges = 
            originalItem.sequence !== item.sequence ||
            originalItem.courseId !== item.courseId ||
            originalItem.testTemplateTypeId !== item.testTemplateTypeId ||
            originalItem.itemType !== item.itemType ||
            originalItem.description !== item.description; // Check description changes
            
          if (hasChanges) {
            const updateRequest: UpdateStudyPlanItemRequest = {
              sequence: item.sequence,
              itemType: item.itemType,
              courseId: item.courseId,
              testTemplateTypeId: item.testTemplateTypeId,
              description: item.description || '' // Include description
            };
            promises.push(updateStudyPlanItem(item.id, updateRequest));
          }
        }
      });

      await Promise.all(promises);

      toast.success('Lộ trình học đã được cập nhật thành công!');
      onSave();

    } catch (error: any) {
      console.error('Error updating study plan:', error);
      
      // Handle validation errors
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        toast.error(`Validation errors:\n${errorMessages}`);
      } else {
        toast.error('Có lỗi xảy ra khi cập nhật lộ trình học');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!studyPlan.planId) return;
    
    setIsLoading(true);
    try {
      await deleteStudyPlan(studyPlan.planId);
      toast.success('Lộ trình học đã được xóa thành công!');
      onDelete?.();
    } catch (error) {
      console.error('Error deleting study plan:', error);
      toast.error('Có lỗi xảy ra khi xóa lộ trình học');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const activeItems = items.filter(item => !item.isDeleted);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-orange-500 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HiPencil className="w-6 h-6" />
            <div>
              <h3 className="text-lg font-semibold">Chỉnh sửa lộ trình học</h3>
              <p className="text-orange-100 text-sm">Cập nhật thông tin và nội dung lộ trình</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-orange-600 rounded-lg transition-colors"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          {/* Study Plan Basic Info */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin cơ bản
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên lộ trình học *
                </label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="Ví dụ: Lộ trình JLPT N3 - 6 tháng"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chi tiết về lộ trình học..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Study Plan Items */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                Nội dung lộ trình ({activeItems.length} mục)
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => addItem()}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <HiPlus className="w-4 h-4" />
                  Thêm lộ trình học
                </button>
                {/* <button
                  onClick={() => addItem('test')}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <HiPlus className="w-4 h-4" />
                  Thêm bài test
                </button> */}
              </div>
            </div>

            {activeItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <HiOutlineBookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>Chưa có mục nào trong lộ trình</p>
                <p className="text-sm">Nhấn nút "Thêm lộ trình học" để bắt đầu</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => {
                  if (item.isDeleted) return null;
                  
                  return (
                    <div
                      key={item.id}
                      className={`p-4 border rounded-lg transition-colors space-y-3 ${
                        item.isNew ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {/* Item Header */}
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-medium text-orange-600">
                          {item.sequence}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          {/* Course Section */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <HiOutlineBookOpen className="w-4 h-4 text-blue-500" />
                              <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                                Khóa học
                              </span>
                              {item.courseName ? (
                                <span className="text-sm text-gray-900 font-medium">{item.courseName}</span>
                              ) : (
                                <span className="text-sm text-gray-500 italic">Chưa chọn khóa học</span>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setEditingItemIndex(index);
                                setSearchType('course');
                                setShowSearchModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors text-xs"
                              title="Chọn khóa học"
                            >
                              <HiSearch className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Test Section */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <HiOutlineClipboardList className="w-4 h-4 text-green-500" />
                              <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                                Bài test
                              </span>
                              {item.testName ? (
                                <span className="text-sm text-gray-900 font-medium">{item.testName}</span>
                              ) : (
                                <span className="text-sm text-gray-500 italic">Chưa chọn bài test</span>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setEditingItemIndex(index);
                                setSearchType('test');
                                setShowSearchModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded transition-colors text-xs"
                              title="Chọn bài test"
                            >
                              <HiSearch className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => removeItem(index)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Xóa mục"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Description Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ghi chú cho mục này (tùy chọn)
                        </label>
                        <textarea
                          value={item.description || ''}
                          onChange={(e) => updateItemDescription(index, e.target.value)}
                          placeholder="Thêm ghi chú, hướng dẫn hoặc yêu cầu đặc biệt cho mục này..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                          rows={2}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4 flex justify-between">
          {/* Delete button on the left */}
          {onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              <HiTrash className="w-4 h-4" />
              Xóa lộ trình
            </button>
          )}
          
          {/* Action buttons on the right */}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !planName.trim() || activeItems.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <HiSave className="w-4 h-4" />
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <HiOutlineExclamationCircle className="w-8 h-8 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-800">Xác nhận xóa</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa lộ trình học "{planName}"? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 transition-colors"
                >
                  {isLoading ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Course/Test Search Modal */}
        {showSearchModal && (
          <CourseTestSearchModal
            type={searchType}
            studentId={studentId}
            onSelect={handleItemSelected}
            onClose={() => {
              setShowSearchModal(false);
              setEditingItemIndex(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default StudyPlanEditor;
