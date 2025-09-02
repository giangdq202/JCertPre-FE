import React, { useState, useEffect } from 'react';
import { 
  HiTrash, 
  HiSearch, 
  HiSave,
  HiOutlineBookOpen,
  HiOutlineClipboardList 
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/AuthContext';
import { createStudyPlan } from '../../services/studyPlanService';
import { createStudyPlanItem, CreateStudyPlanItemRequest } from '../../services/studyPlanItemService';
import { CourseListDto } from '../../services/courseService';
import CourseTestSearchModal, { TestOption } from './CourseTestSearchModal';
import StudentStudyPlans from './StudentStudyPlans';

interface StudyPlanItem {
  id: string; // temporary ID for frontend
  sequence: number;
  itemType: 'course' | 'test'; // Keep original types
  courseId?: string;
  testTemplateTypeId?: string; // Changed from testId to testTemplateTypeId
  courseName?: string;
  testName?: string;
  description?: string; // Added description field
}

interface StudyPlanCreatorProps {
  studentId: string;
  studentName?: string;
  onStudyPlanCreated?: (studyPlanId: string) => void;
}

const StudyPlanCreator: React.FC<StudyPlanCreatorProps> = ({
  studentId,
  studentName,
  onStudyPlanCreated
}) => {
  const { userInfo } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchType, setSearchType] = useState<'course' | 'test'>('course');
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Study Plan Form Data
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [items, setItems] = useState<StudyPlanItem[]>([]);
  const [refreshStudyPlans, setRefreshStudyPlans] = useState(0);

  // Initialize dates
  useEffect(() => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(today.getMonth() + 6); // Default 6 months duration

    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(futureDate.toISOString().split('T')[0]);
  }, []);

  const addItem = () => {
    const newItem: StudyPlanItem = {
      id: `temp_${Date.now()}`,
      sequence: items.length + 1,
      itemType: 'course' // Default to course since UI item can contain both
    };
    setItems([...items, newItem]);
    // Remove the automatic modal opening
    // setEditingItemIndex(items.length);
    // setSearchType(type);
    // setShowSearchModal(true);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    // Update sequences
    const updatedItems = newItems.map((item, i) => ({
      ...item,
      sequence: i + 1
    }));
    setItems(updatedItems);
  };

  const updateItemDescription = (index: number, description: string) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      description: description
    };
    setItems(newItems);
  };

  const editItem = (index: number, type: 'course' | 'test') => {
    setEditingItemIndex(index);
    setSearchType(type);
    setShowSearchModal(true);
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
      };
    } else {
      const test = selectedItem as TestOption;
      
      // DEBUG: Log all possible test IDs
      console.log('=== DEBUG TEST SELECTION ===');
      console.log('Selected test object:', test);
      console.log('testId (will be used):', test.testId);
      console.log('testTemplateTypeId:', test.testTemplateTypeId);
      console.log('testTemplateId:', test.testTemplateId);
      
      // Try different approaches - you can uncomment to test:
      const testIdOptions = {
        option1: test.testId, // current (testTemplateTypeId)
        option2: test.testTemplateId, // actual template ID
        option3: test.testTemplateTypeId, // explicit type ID
      };
      console.log('Test ID options:', testIdOptions);
      console.log('=== END DEBUG ===');
      
      newItems[editingItemIndex] = {
        ...newItems[editingItemIndex],
        testTemplateTypeId: test.testId, // Map test.testId to testTemplateTypeId
        testName: test.title
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

    if (items.length === 0) {
      toast.error('Vui lòng thêm ít nhất một mục học tập');
      return;
    }

    // Check if all items have at least course or test
    const invalidItems = items.filter(item => 
      !item.courseId && !item.testTemplateTypeId
    );

    if (invalidItems.length > 0) {
      toast.error('Vui lòng chọn khóa học hoặc bài test cho tất cả các mục trong lộ trình');
      return;
    }

    setIsLoading(true);

    try {
      // Create study plan
      const studyPlan = await createStudyPlan({
        studentId,
        createdByStaffId: userInfo.id,
        planName: planName.trim(),
        description: description.trim() || '',
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString()
      });

      // Create study plan items
      const itemPromises: Promise<any>[] = [];

      items.forEach((item, index) => {
        console.log('=== PROCESSING ITEM ===');
        console.log('Item data:', item);
        console.log('courseId:', item.courseId);
        console.log('testTemplateTypeId:', item.testTemplateTypeId);
        
        const itemRequest: CreateStudyPlanItemRequest = {
          planId: studyPlan.planId,
          sequence: index + 1,
          itemType: item.itemType,
          courseId: item.courseId,
          testTemplateTypeId: item.testTemplateTypeId,
          status: 0, // NOT_STARTED
          description: item.description || ''
        };
        
        console.log('Creating study plan item with both course and test:', itemRequest);
        itemPromises.push(createStudyPlanItem(itemRequest));
        console.log('=== END PROCESSING ITEM ===');
      });

      await Promise.all(itemPromises);

      toast.success('Lộ trình học đã được tạo thành công!');
      
      // Reset form
      setPlanName('');
      setDescription('');
      setItems([]);
      
      // Trigger refresh of existing study plans
      setRefreshStudyPlans(prev => prev + 1);
      
      // Notify parent
      onStudyPlanCreated?.(studyPlan.planId);

    } catch (error: any) {
      console.error('Error creating study plan:', error);
      
      // Handle validation errors
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        toast.error(`Validation errors:\n${errorMessages}`);
      } else {
        toast.error('Có lỗi xảy ra khi tạo lộ trình học');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Current Study Plans */}
      {studentName && (
        <>
          <StudentStudyPlans 
            studentId={studentId}
            studentName={studentName}
            refreshKey={refreshStudyPlans}
          />
          
          {/* Separator */}
          <div className="border-t border-gray-200 pt-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Tạo lộ trình học mới
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Thiết kế lộ trình học phù hợp cho {studentName}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Study Plan Basic Info */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          Thông tin lộ trình học
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
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800">
            Nội dung lộ trình
          </h4>
          <div className="flex gap-2">
            <button
              onClick={() => addItem()}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <HiOutlineBookOpen className="w-4 h-4" />
              Thêm lộ trình học
            </button>
            {/* <button
              onClick={() => addItem('test')}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <HiOutlineClipboardList className="w-4 h-4" />
              Thêm bài test
            </button> */}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <HiOutlineBookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>Chưa có mục nào trong lộ trình</p>
            <p className="text-sm">Nhấn nút "Thêm lộ trình học" để bắt đầu</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors space-y-3"
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
                        onClick={() => editItem(index, 'course')}
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
                        onClick={() => editItem(index, 'test')}
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
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading || !planName.trim() || items.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <HiSave className="w-5 h-5" />
          {isLoading ? 'Đang tạo...' : 'Tạo lộ trình học'}
        </button>
      </div>

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
  );
};

export default StudyPlanCreator;
