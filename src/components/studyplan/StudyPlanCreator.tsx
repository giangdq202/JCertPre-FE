import React, { useState, useEffect } from 'react';
import { 
  HiPlus, 
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
import { getCourses, CourseListDto, CourseStatus, CourseType } from '../../services/courseService';
import { getAllByUserId, TestDto, TestType, CourseLevel } from '../../services/testService';
import CourseTestSearchModal from './CourseTestSearchModal';

interface StudyPlanItem {
  id: string; // temporary ID for frontend
  sequence: number;
  itemType: 'course' | 'test';
  courseId?: string;
  testId?: string;
  courseName?: string;
  testName?: string;
}

interface StudyPlanCreatorProps {
  studentId: string;
  onStudyPlanCreated?: (studyPlanId: string) => void;
}

const StudyPlanCreator: React.FC<StudyPlanCreatorProps> = ({
  studentId,
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

  // Initialize dates
  useEffect(() => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(today.getMonth() + 6); // Default 6 months duration

    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(futureDate.toISOString().split('T')[0]);
  }, []);

  const addItem = (type: 'course' | 'test') => {
    const newItem: StudyPlanItem = {
      id: `temp_${Date.now()}`,
      sequence: items.length + 1,
      itemType: type
    };
    setItems([...items, newItem]);
    setEditingItemIndex(items.length);
    setSearchType(type);
    setShowSearchModal(true);
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

  const editItem = (index: number) => {
    setEditingItemIndex(index);
    setSearchType(items[index].itemType);
    setShowSearchModal(true);
  };

  const handleItemSelected = (selectedItem: CourseListDto | TestDto) => {
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
      const test = selectedItem as TestDto;
      newItems[editingItemIndex] = {
        ...newItems[editingItemIndex],
        testId: test.testId,
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

    // Check if all items have required data
    const invalidItems = items.filter(item => 
      (item.itemType === 'course' && !item.courseId) ||
      (item.itemType === 'test' && !item.testId)
    );

    if (invalidItems.length > 0) {
      toast.error('Vui lòng chọn khóa học/bài test cho tất cả các mục');
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
      const itemPromises = items.map((item) => {
        const itemRequest: CreateStudyPlanItemRequest = {
          planId: studyPlan.planId,
          sequence: item.sequence,
          itemType: item.itemType,
          courseId: item.courseId,
          testId: item.testId,
          status: 0 // NOT_STARTED
        };
        return createStudyPlanItem(itemRequest);
      });

      await Promise.all(itemPromises);

      toast.success('Lộ trình học đã được tạo thành công!');
      
      // Reset form
      setPlanName('');
      setDescription('');
      setItems([]);
      
      // Notify parent
      onStudyPlanCreated?.(studyPlan.planId);

    } catch (error) {
      console.error('Error creating study plan:', error);
      toast.error('Có lỗi xảy ra khi tạo lộ trình học');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
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
              onClick={() => addItem('course')}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <HiOutlineBookOpen className="w-4 h-4" />
              Thêm khóa học
            </button>
            <button
              onClick={() => addItem('test')}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <HiOutlineClipboardList className="w-4 h-4" />
              Thêm bài test
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <HiOutlineBookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>Chưa có mục nào trong lộ trình</p>
            <p className="text-sm">Nhấn nút "Thêm khóa học" hoặc "Thêm bài test" để bắt đầu</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-medium text-orange-600">
                  {item.sequence}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {item.itemType === 'course' ? (
                      <HiOutlineBookOpen className="w-4 h-4 text-blue-500" />
                    ) : (
                      <HiOutlineClipboardList className="w-4 h-4 text-green-500" />
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.itemType === 'course' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {item.itemType === 'course' ? 'Khóa học' : 'Bài test'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 font-medium">
                    {item.courseName || item.testName || (
                      <span className="text-gray-500 italic">
                        Chưa chọn {item.itemType === 'course' ? 'khóa học' : 'bài test'}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => editItem(index)}
                    className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors"
                    title={`Chọn ${item.itemType === 'course' ? 'khóa học' : 'bài test'}`}
                  >
                    <HiSearch className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeItem(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Xóa mục"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
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
