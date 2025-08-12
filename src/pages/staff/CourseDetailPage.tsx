// src/pages/staff/CourseDetailPage.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StaffSidebar from "../../components/sidebar/StaffSidebar";
import StaffHeader from "../../components/header/StaffHeader";
import ThumbnailUploader from "../../components/forms/ThumbnailUploader"; // This component might still use Ant Design internally, will keep it for now.
import { DatePicker } from "antd"; // Add DatePicker import
import dayjs from "dayjs"; // Add dayjs import

// Import icons from react-icons
import {
  FaSave,
  FaRedo,
  FaPlus,
  FaUserMinus,
  FaEdit,
  FaTrash,
  FaChevronRight,
  FaUpload,
  FaFilePdf,
  FaVideo,
  FaDownload,
  FaTimes, // For close button in modal
  FaExclamationCircle, // For popconfirm icon
  FaBroadcastTower, // For livestream icon
  FaCalendarAlt, // For date/time icon
  FaClock, // For duration icon
  FaQuestionCircle, // For test icon
  FaEye, // For open test
  FaEyeSlash, // For close test
} from "react-icons/fa";

// Import services and types
import {
  getCourseById,
  updateCourse, // Now used for status updates as well
  // updateCourseStatus, // Removed as we're now using updateCourse
  addInstructorToCourse,
  removeInstructorFromCourse,
  CourseDto,
  UpdateCourseDto,
  CourseStatus,
  CourseLevel,
  CourseType,
  InstructorInfoDto,
} from "../../services/courseService";
import {
  getLessonsByCourseId,
  createLesson,
  updateLesson,
  deleteLessonById,
  deleteAllLessonsByCourseId,
} from "../../services/lessonService";
import {
  LessonDto,
  CreateLessonDto,
  UpdateLessonDto,
  validateLessonCreateDto,
  validateLessonUpdateDto,
  LESSON_VALIDATION_RULES
} from "../../types/lesson.types";
import {
  DocumentDto,
  uploadImageDocument,
  uploadVideoDocument,
  uploadRawDocument,
  deleteDocument,
  getDocumentsByLessonId,
} from "../../services/documentService";
import { getAllUsers, UserDto } from "../../services/userService";
import { 
  livestreamApi, 
  CreateLivestreamDto, 
  LivestreamDto, 
  LivestreamStatus 
} from "../../services/livestreamService";
import { getByLessonId, TestDto, TestStatus, updateTestStatus } from "../../services/testService";
import paths from "../../routes/path";
import { useNotification } from "../../components/notifications";
import CreateTestModal from "../../components/modals/CreateTestModal";
import EditTestModal from "../../components/modals/EditTestModal";

// Utility functions for date formatting
const formatDateToDisplay = (isoDate: string): string => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDisplayToISO = (displayDate: string): string => {
  if (!displayDate) return '';
  const [day, month, year] = displayDate.split('/');
  // Create date in UTC to avoid timezone offset issues
  const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
  return date.toISOString();
};

const isValidDisplayDate = (displayDate: string): boolean => {
  if (!displayDate) return false;
  // Updated regex to allow both single and double-digit day/month
  const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
  if (!dateRegex.test(displayDate)) return false;
  
  const [day, month, year] = displayDate.split('/');
  // Create date in UTC to avoid timezone offset issues
  const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
  
  // Check if the date is valid (not NaN)
  return !isNaN(date.getTime());
};

// Custom Modal component (simplified for this example, you might have a more robust one)
interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmLoading?: boolean;
  okText?: string;
  showConfirmButton?: boolean;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmLoading,
  okText = "Confirm",
  showConfirmButton = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 font-inter">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 relative animate-fade-in-up">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="modal-content mb-6">{children}</div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          {showConfirmButton && (
            <button
              onClick={onConfirm}
              disabled={confirmLoading}
              className={`px-5 py-2 rounded-lg text-white transition-colors text-sm font-medium
                ${confirmLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
              `}
            >
              {confirmLoading ? "Loading..." : okText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Custom Popconfirm component (simplified)
interface CustomPopconfirmProps {
  title: string;
  onConfirm: () => void;
  children: React.ReactNode;
  okText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const CustomPopconfirm: React.FC<CustomPopconfirmProps> = ({
  title,
  onConfirm,
  children,
  okText = "Yes",
  cancelText = "No",
  icon = <FaExclamationCircle className="text-red-500" />,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled]);

  const handleConfirm = () => {
    onConfirm();
    setIsOpen(false);
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      triggerRef.current &&
      !triggerRef.current.contains(event.target as Node) &&
      popoverRef.current &&
      !popoverRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div onClick={handleToggle}>{children}</div>
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64 right-0 mt-2 animate-fade-in-up"
        >
          <div className="flex items-center mb-3">
            {icon}
            <span className="ml-2 text-gray-800 text-sm font-medium">{title}</span>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 rounded-md text-gray-700 border border-gray-300 hover:bg-gray-100 text-xs font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className="px-3 py-1.5 rounded-md bg-red-500 text-white hover:bg-red-600 text-xs font-medium"
            >
              {okText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError, warning: showWarning, info: showInfo } = useNotification();

  const [course, setCourse] = useState<CourseDto | null>(null);
  const [lessons, setLessons] = useState<LessonDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingCourse, setSubmittingCourse] = useState<boolean>(false);
  const [submittingLesson, setSubmittingLesson] = useState<boolean>(false);
  const [submittingDocument, setSubmittingDocument] = useState<boolean>(false);

  const [isAddInstructorModalVisible, setIsAddInstructorModalVisible] =
    useState<boolean>(false);
  const [newInstructorId, setNewInstructorId] = useState<string>("");
  const [activeLessonPanel, setActiveLessonPanel] = useState<string | string[]>(
    []
  );

  const [isUploadDocumentModalVisible, setIsUploadDocumentModalVisible] = useState(false);
  const [fileList, setFileList] = useState<File[]>([]);
  const [currentLessonIdForUpload, setCurrentLessonIdForUpload] = useState<string>("");
  const [instructors, setInstructors] = useState<UserDto[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);


  // Form state for course details
  const [courseFormState, setCourseFormState] = useState<UpdateCourseDto>({});
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  // Form state for creating new lesson
  const [createLessonFormState, setCreateLessonFormState] = useState<CreateLessonDto>({ title: '', content: '', lessonOrder: 0 });
  // Form state for editing lesson
  const [editLessonFormState, setEditLessonFormState] = useState<UpdateLessonDto>({});
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // Validation error states
  const [dateValidationError, setDateValidationError] = useState<string>("");
  const [lessonValidationError, setLessonValidationError] = useState<string>("");
  
  // Livestream state
  const [livestreams, setLivestreams] = useState<LivestreamDto[]>([]);
  const [loadingLivestreams, setLoadingLivestreams] = useState(false);
  const [isCreateLivestreamModalVisible, setIsCreateLivestreamModalVisible] = useState(false);
  const [createLivestreamFormState, setCreateLivestreamFormState] = useState<CreateLivestreamDto>({
    courseId: courseId || "",
    description: "",
    scheduledDateTime: "",
    durationMinutes: 60,
  });
  const [submittingLivestream, setSubmittingLivestream] = useState(false);
  const [livestreamValidationError, setLivestreamValidationError] = useState<string>("");

  // Test creation state
  const [isCreateTestModalVisible, setIsCreateTestModalVisible] = useState(false);
  const [isEditTestModalVisible, setIsEditTestModalVisible] = useState(false);
  const [currentLessonForTest, setCurrentLessonForTest] = useState<string>("");
  const [currentTestForEdit, setCurrentTestForEdit] = useState<TestDto | null>(null);
  
  // Test management state
  const [lessonTests, setLessonTests] = useState<{ [key: string]: TestDto | null }>({});
  const [loadingTests, setLoadingTests] = useState<{ [key: string]: boolean }>({});

  // Validation functions
  const validateCourseDates = (startDate: string, endDate: string): { isValid: boolean; message: string } => {
    // Get today's date in UTC to avoid timezone issues
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    // Check if start date is in the past
    if (startDateObj < today) {
      return { isValid: false, message: "Ngày bắt đầu không được là ngày đã qua." };
    }
    
    // Check if end date is after start date with at least 24 hours difference
    const timeDifference = endDateObj.getTime() - startDateObj.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);
    
    if (hoursDifference < 24) {
      return { isValid: false, message: "Ngày kết thúc phải sau ngày bắt đầu ít nhất 24 giờ." };
    }
    
    return { isValid: true, message: "" };
  };

  const validateInstructorForPublishing = (instructors: InstructorInfoDto[]): { isValid: boolean; message: string } => {
    if (instructors.length === 0) {
      return { isValid: false, message: "Khóa học phải có ít nhất một giảng viên trước khi được xuất bản." };
    }
    return { isValid: true, message: "" };
  };

  const validateLivestreamSchedule = (scheduledDateTime: string, courseStartDate: string, courseEndDate: string): { isValid: boolean; message: string } => {
    if (!scheduledDateTime) {
      return { isValid: false, message: "Vui lòng chọn thời gian cho livestream." };
    }

    const scheduleDate = new Date(scheduledDateTime);
    const startDate = new Date(courseStartDate);
    const endDate = new Date(courseEndDate);

    // Check if scheduled time is within course date range
    if (scheduleDate < startDate || scheduleDate > endDate) {
      return { isValid: false, message: "Thời gian livestream phải nằm trong khoảng thời gian của khóa học." };
    }

    return { isValid: true, message: "" };
  };

  // --- Course Data Fetching ---
  useEffect(() => {
    const fetchCourseAndLessons = async () => {
      console.log("Fetching course details for ID:", courseId);

      if (!courseId) {
        // message.error("Course ID is missing. Redirecting to course list."); // Removed Ant Design message
        showError("Lỗi", "Course ID is missing. Redirecting to course list.");
        setLoading(false);
        navigate(paths.course_management);
        return;
      }
      setLoading(true);
      try {
        const courseData = await getCourseById(courseId);
        setCourse(courseData);
        setCourseFormState({
          title: courseData.title,
          description: courseData.description,
          level: courseData.level,
          courseType: courseData.courseType,
          price: courseData.price,
          startDate: courseData.startDate,
          endDate: courseData.endDate,
          thumbnailUrl: courseData.thumbnailUrl,
          status: courseData.status,
        });

        const lessonsData = await getLessonsByCourseId(courseId, undefined, 1, 1000);
        const lessonsWithDocuments = await Promise.all(
          lessonsData.items.map(async (lesson) => {
            try {
              const documents = await getDocumentsByLessonId(lesson.lessonId);
              return { ...lesson, documents };
            } catch (docError) {
              console.error(`Error fetching documents for lesson ${lesson.lessonId}:`, docError);
              return { ...lesson, documents: [] };
            }
          })
        );
        setLessons(lessonsWithDocuments.sort((a, b) => a.lessonOrder - b.lessonOrder));

        // Fetch livestreams for this course
        const livestreamsData = await livestreamApi.getLivestreamsByCourse(courseId);
        setLivestreams(livestreamsData);
        console.log("Livestreams loaded:", livestreamsData.length);
      } catch (error) {
        // message.error("Failed to fetch course details or lessons. Please check the ID or network connection."); // Removed Ant Design message
        showError("Lỗi", "Failed to fetch course details or lessons. Please check the ID or network connection.");
        console.error("Error fetching data:", error);
        navigate(paths.course_management);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseAndLessons();
  }, [courseId, navigate]);

  // Fetch instructors for the dropdown
  useEffect(() => {
    const fetchInstructors = async () => {
      setLoadingInstructors(true);
      try {
        // Get all users without roleId filter, then filter by roleName on frontend
        const response = await getAllUsers({
          pageNumber: 1,
          pageSize: 1000, // Get all users
        });
        // Filter users whose roleName is "Instructor"
        const instructorUsers = response.items.filter(user => user.roleName === "INSTRUCTOR");
        setInstructors(instructorUsers);
      } catch (error) {
        console.error("Error fetching instructors:", error);
        showError("Lỗi", "Không thể tải danh sách giảng viên.");
      } finally {
        setLoadingInstructors(false);
      }
    };

    if (isAddInstructorModalVisible) {
      fetchInstructors();
    }
  }, [isAddInstructorModalVisible]);


  // --- Course Management Handlers ---
  const handleCourseFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle date fields - convert display format to ISO string
    if ((name === 'startDate' || name === 'endDate') && value) {
      // Allow partial input - only validate when the date format is complete
      if (isValidDisplayDate(value)) {
        const isoString = formatDisplayToISO(value);
        setCourseFormState(prev => ({ ...prev, [name]: isoString }));
        
        // Validate dates when both start and end dates are available
        if (name === 'startDate' && courseFormState.endDate) {
          const validation = validateCourseDates(isoString, courseFormState.endDate);
          setDateValidationError(validation.isValid ? "" : validation.message);
        } else if (name === 'endDate' && courseFormState.startDate) {
          const validation = validateCourseDates(courseFormState.startDate, isoString);
          setDateValidationError(validation.isValid ? "" : validation.message);
        }
      } else {
        // For partial input, store the display value temporarily
        // This allows users to type without the field being cleared
        setCourseFormState(prev => ({ ...prev, [name]: value }));
        // Clear validation error for partial input
        setDateValidationError("");
      }
    } else if ((name === 'startDate' || name === 'endDate') && !value) {
      // Handle empty value
      setCourseFormState(prev => ({ ...prev, [name]: '' }));
      setDateValidationError("");
    } else {
      setCourseFormState(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCourseSelectChange = (name: keyof UpdateCourseDto) => (value: any) => {
    setCourseFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (file: File | null) => {
    setThumbnailFile(file);
  };

  const onFinishCourse = async () => {
    if (!courseId) return;
    
    // Validate dates if both start and end dates are provided
    if (courseFormState.startDate && courseFormState.endDate) {
      const dateValidation = validateCourseDates(courseFormState.startDate, courseFormState.endDate);
      if (!dateValidation.isValid) {
        showWarning("Cảnh báo", dateValidation.message);
        return;
      }
    }
    
    setSubmittingCourse(true);
    try {
      const updateData: UpdateCourseDto = {
        ...courseFormState,
        thumbnailFile: thumbnailFile,
      };
      const updatedCourse = await updateCourse(courseId, updateData);
      setCourse(updatedCourse);
      setThumbnailFile(null); // Reset thumbnail file after successful update
      // message.success("Course updated successfully!"); // Removed Ant Design message
              showSuccess("Thành công", "Course updated successfully!");
    } catch (error) {
      // message.error("Failed to update course."); // Removed Ant Design message
              showError("Lỗi", "Failed to update course.");
      console.error("Error updating course:", error);
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleUpdateCourseStatus = async (newStatus: CourseStatus) => {
    if (!courseId || !course) return; // Ensure course data is available
    
    // Validate instructor requirement for publishing
    if (newStatus === CourseStatus.Published) {
      const instructorValidation = validateInstructorForPublishing(course.instructors);
      if (!instructorValidation.isValid) {
        showWarning("Cảnh báo", instructorValidation.message);
        return;
      }
    }
    
    // Validate dates if both start and end dates are provided and trying to publish
    if (newStatus === CourseStatus.Published && courseFormState.startDate && courseFormState.endDate) {
      const dateValidation = validateCourseDates(courseFormState.startDate, courseFormState.endDate);
      if (!dateValidation.isValid) {
        showWarning("Cảnh báo", dateValidation.message);
        return;
      }
    }
    
    setSubmittingCourse(true);
    try {
      // Create a new UpdateCourseDto with the updated status and existing course data
      const updatedCourseData: UpdateCourseDto = {
        ...courseFormState, // Use current form state for other fields
        status: newStatus,
      };

      // Call the updateCourse API with the full updated DTO
      const updatedCourse = await updateCourse(courseId, updatedCourseData);
      setCourse(updatedCourse);
      setCourseFormState(prev => ({ ...prev, status: newStatus })); // Update form state as well
      // message.success(`Course status updated to ${CourseStatus[newStatus]} successfully!`); // Removed Ant Design message
              showSuccess("Thành công", `Course status updated to ${CourseStatus[newStatus]} successfully!`);
    } catch (error) {
      // message.error("Failed to update course status."); // Removed Ant Design message
              showError("Lỗi", "Failed to update course status.");
      console.error("Error updating course status:", error);
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleAddInstructor = async () => {
    if (!courseId || !newInstructorId) {
              showWarning("Cảnh báo", "Vui lòng chọn một giảng viên.");
      return;
    }
    setSubmittingCourse(true);
    try {
      await addInstructorToCourse(courseId, newInstructorId);
              showSuccess("Thành công", "Đã thêm giảng viên thành công!");
      const updatedCourseData = await getCourseById(courseId);
      setCourse(updatedCourseData);
      setIsAddInstructorModalVisible(false);
      setNewInstructorId("");
    } catch (error) {
              showError("Lỗi", "Không thể thêm giảng viên. Kiểm tra ID hoặc nếu đã được gán.");
      console.error("Error adding instructor:", error);
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleRemoveInstructor = async (instructorIdToRemove: string) => {
    if (!courseId) return;
    setSubmittingCourse(true);
    try {
      await removeInstructorFromCourse(courseId, instructorIdToRemove);
      // message.success("Instructor removed successfully!"); // Removed Ant Design message
              showSuccess("Thành công", "Instructor removed successfully!");
      const updatedCourseData = await getCourseById(courseId);
      setCourse(updatedCourseData);
    } catch (error) {
      // message.error("Failed to remove instructor."); // Removed Ant Design message
              showError("Lỗi", "Failed to remove instructor.");
      console.error("Error removing instructor:", error);
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleCancelCourseEdit = () => {
    if (course) {
      setCourseFormState({
        title: course.title,
        description: course.description,
        level: course.level,
        courseType: course.courseType,
        price: course.price,
        startDate: course.startDate,
        endDate: course.endDate,
        thumbnailUrl: course.thumbnailUrl,
        status: course.status,
      });
      setThumbnailFile(null); // Reset thumbnail file when canceling
      // message.info("Course changes discarded."); // Removed Ant Design message
              showInfo("Thông báo", "Course changes discarded.");
    }
  };

  // --- Lesson Management Handlers ---
  const handleCreateLessonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCreateLessonFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateLessonNumberChange = (name: keyof CreateLessonDto) => (value: number | null) => {
    setCreateLessonFormState(prev => ({ ...prev, [name]: value ?? 0 }));
  };

  const handleCreateLesson = async () => {
    if (!courseId) return;
    
    // Clear previous validation errors
    setLessonValidationError("");
    
    // Validate lesson data before submission
    const validation = validateLessonCreateDto(createLessonFormState);
    if (!validation.isValid) {
      setLessonValidationError(validation.message || "Validation failed");
      return;
    }
    
    setSubmittingLesson(true);
    try {
      const nextLessonOrder = lessons.length > 0
        ? Math.max(...lessons.map(l => l.lessonOrder)) + 1
        : 1;

      const newLessonData: CreateLessonDto = {
        ...createLessonFormState,
        lessonOrder: nextLessonOrder,
      };

      const newLesson = await createLesson(courseId, newLessonData);
      const documentsForNewLesson = await getDocumentsByLessonId(newLesson.lessonId);
      const lessonWithDocs = { ...newLesson, documents: documentsForNewLesson };

      setLessons((prev) => [...prev, lessonWithDocs].sort((a, b) => a.lessonOrder - b.lessonOrder));
      showSuccess("Thành công", "Lesson created successfully!");
      setCreateLessonFormState({ title: '', content: '', lessonOrder: 0 }); // Reset form
      setActiveLessonPanel(newLesson.lessonId);
    } catch (error) {
      showError("Lỗi", "Failed to create lesson.");
      console.error("Error creating lesson:", error);
    } finally {
      setSubmittingLesson(false);
    }
  };

  const handleEditLessonClick = (lesson: LessonDto) => {
    setEditingLessonId(lesson.lessonId);
    setEditLessonFormState({
      title: lesson.title,
      lessonOrder: lesson.lessonOrder,
      content: lesson.content,
    });
    setActiveLessonPanel(lesson.lessonId); // Open the panel for editing
  };

  const handleEditLessonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditLessonFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleEditLessonNumberChange = (name: keyof UpdateLessonDto) => (value: number | null) => {
    setEditLessonFormState(prev => ({ ...prev, [name]: value ?? 0 }));
  };

  const handleUpdateLesson = async () => {
    if (!editingLessonId) return;
    
    // Clear previous validation errors
    setLessonValidationError("");
    
    // Validate lesson data before submission
    const validation = validateLessonUpdateDto(editLessonFormState);
    if (!validation.isValid) {
      setLessonValidationError(validation.message || "Validation failed");
      return;
    }
    
    setSubmittingLesson(true);
    try {
      const updatedLesson = await updateLesson(editingLessonId, editLessonFormState);
      const documentsForUpdatedLesson = await getDocumentsByLessonId(updatedLesson.lessonId);
      const lessonWithDocs = { ...updatedLesson, documents: documentsForUpdatedLesson };

      setLessons((prev) =>
        prev.map((l) => (l.lessonId === editingLessonId ? lessonWithDocs : l)).sort((a, b) => a.lessonOrder - b.lessonOrder)
      );
      showSuccess("Thành công", "Lesson updated successfully!");
      setEditingLessonId(null); // Exit editing mode
      setEditLessonFormState({}); // Clear edit form state
      setActiveLessonPanel([]); // Collapse the panel after update
    } catch (error) {
      showError("Lỗi", "Failed to update lesson.");
      console.error("Error updating lesson:", error);
    } finally {
      setSubmittingLesson(false);
    }
  };

  const handleCancelEditLesson = () => {
    setEditingLessonId(null);
    setEditLessonFormState({});
    setActiveLessonPanel([]);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    setSubmittingLesson(true);
    try {
      await deleteLessonById(lessonId);
      setLessons((prev) => prev.filter((l) => l.lessonId !== lessonId));
      // message.success("Lesson deleted successfully!"); // Removed Ant Design message
        showSuccess("Thành công", "Lesson deleted successfully!"); // Using alert
    } catch (error) {
      // message.error("Failed to delete lesson."); // Removed Ant Design message
        showError("Lỗi", "Failed to delete lesson."); // Using alert
      console.error("Error deleting lesson:", error);
    } finally {
      setSubmittingLesson(false);
    }
  };

  const handleDeleteAllLessons = async () => {
    if (!courseId) return;
    setSubmittingLesson(true);
    try {
      await deleteAllLessonsByCourseId(courseId);
      setLessons([]);
      // message.success("All lessons deleted successfully!"); // Removed Ant Design message
        showSuccess("Thành công", "All lessons deleted successfully!"); // Using alert
    } catch (error) {
      // message.error("Failed to delete all lessons."); // Removed Ant Design message
        showError("Lỗi", "Failed to delete all lessons."); // Using alert
      console.error("Error deleting all lessons:", error);
    } finally {
      setSubmittingLesson(false);
    }
  };

  // --- Document Management Handlers ---

  const showUploadDocumentModal = (lessonId: string) => {
    setCurrentLessonIdForUpload(lessonId);
    setFileList([]);
    setIsUploadDocumentModalVisible(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileList([e.target.files[0]]);
    } else {
      setFileList([]);
    }
  };

  const handleUploadDocument = async () => {
    if (!currentLessonIdForUpload || fileList.length === 0) {
      showWarning("Cảnh báo", "Please select a file to upload.");
      return;
    }
    setSubmittingDocument(true);
    try {
      const fileToUpload = fileList[0];
      let newDocument: DocumentDto;
      const fileType = fileToUpload.type;
      if (fileType.startsWith("image/")) {
        newDocument = await uploadImageDocument({
          lessonId: currentLessonIdForUpload,
          file: fileToUpload,
        });
      } else if (fileToUpload.name.endsWith(".mp4")) {
        newDocument = await uploadVideoDocument({
          lessonId: currentLessonIdForUpload,
          file: fileToUpload,
        });
      } else {
        // Assume all other types are raw documents (pdf, word, excel, ppt)
        newDocument = await uploadRawDocument({
          lessonId: currentLessonIdForUpload,
          file: fileToUpload,
        });
      }

      setLessons((prevLessons) =>
        prevLessons.map((lesson) =>
          lesson.lessonId === currentLessonIdForUpload
            ? { ...lesson, documents: [...(lesson.documents || []), newDocument] }
            : lesson
        ).sort((a, b) => a.lessonOrder - b.lessonOrder)
      );

              showSuccess("Thành công", "Document uploaded successfully!");
      setIsUploadDocumentModalVisible(false);
      setFileList([]);
    } catch (error) {
              showError("Lỗi", "Failed to upload document.");
      console.error("Error uploading document:", error);
    } finally {
      setSubmittingDocument(false);
    }
  };

  const handleDeleteDocument = async (lessonId: string, documentId: string) => {
    setSubmittingDocument(true);
    try {
      await deleteDocument(documentId);
      setLessons((prevLessons) =>
        prevLessons.map((lesson) =>
          lesson.lessonId === lessonId
            ? {
                ...lesson,
                documents: (lesson.documents || []).filter(
                  (doc) => doc.documentId !== documentId
                ),
              }
            : lesson
        ).sort((a, b) => a.lessonOrder - b.lessonOrder)
      );
      // message.success("Document deleted successfully!"); // Removed Ant Design message
        showSuccess("Thành công", "Document deleted successfully!"); // Using alert
    } catch (error) {
      // message.error("Failed to delete document."); // Removed Ant Design message
        showError("Lỗi", "Failed to delete document."); // Using alert
      console.error("Error deleting document:", error);
    } finally {
      setSubmittingDocument(false);
    }
  };

  // --- Livestream Handlers ---
  const handleCreateLivestreamFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCreateLivestreamFormState(prev => ({
      ...prev,
      [name]: value
    }));
    setLivestreamValidationError("");
  };

  const handleCreateLivestreamNumberChange = (name: keyof CreateLivestreamDto) => (value: number) => {
    setCreateLivestreamFormState(prev => ({
      ...prev,
      [name]: value
    }));
    setLivestreamValidationError("");
  };

  const handleCreateLivestream = async () => {
    if (!course) return;

    // Validate livestream schedule
    const validation = validateLivestreamSchedule(
      createLivestreamFormState.scheduledDateTime,
      course.startDate,
      course.endDate
    );

    if (!validation.isValid) {
      setLivestreamValidationError(validation.message);
      return;
    }

    setSubmittingLivestream(true);
    try {
      // Ensure the date is properly converted to UTC
      const livestreamData = {
        ...createLivestreamFormState,
        scheduledDateTime: createLivestreamFormState.scheduledDateTime
      };
      
      const newLivestream = await livestreamApi.createLivestream(livestreamData);
      setLivestreams(prev => [...prev, newLivestream]);
      
      // Reset form
      setCreateLivestreamFormState({
        courseId: courseId || "",
        description: "",
        scheduledDateTime: "",
        durationMinutes: 60,
      });
      setIsCreateLivestreamModalVisible(false);
      setLivestreamValidationError("");
      
              showSuccess("Thành công", "Livestream created successfully!");
    } catch (error) {
      console.error("Error creating livestream:", error);
              showError("Lỗi", "Failed to create livestream. Please try again.");
    } finally {
      setSubmittingLivestream(false);
    }
  };

  const handleDeleteLivestream = async (livestreamId: string) => {
    try {
      await livestreamApi.deleteLivestream(livestreamId);
      setLivestreams(prev => prev.filter(ls => ls.livestreamId !== livestreamId));
              showSuccess("Thành công", "Livestream deleted successfully!");
    } catch (error) {
      console.error("Error deleting livestream:", error);
              showError("Lỗi", "Failed to delete livestream. Please try again.");
    }
  };

  const showCreateTestModal = (lessonId: string) => {
    setCurrentLessonForTest(lessonId);
    setIsCreateTestModalVisible(true);
  };

  const handleTestCreated = () => {
    // Refresh course data or show success message
            showSuccess("Thành công", "Test created successfully!");
  };

  const showEditTestModal = (test: TestDto) => {
    setCurrentTestForEdit(test);
    setIsEditTestModalVisible(true);
  };

  const handleTestUpdated = () => {
    // Refresh test data
    if (currentTestForEdit?.lessonId) {
      loadLessonTest(currentTestForEdit.lessonId);
    }
    setIsEditTestModalVisible(false);
    setCurrentTestForEdit(null);
            showSuccess("Thành công", "Test updated successfully!");
  };



  const loadLessonTest = async (lessonId: string) => {
    setLoadingTests(prev => ({ ...prev, [lessonId]: true }));
    try {
      const test = await getByLessonId(lessonId);
      setLessonTests(prev => ({ ...prev, [lessonId]: test }));
    } catch (error) {
      console.error(`Failed to load test for lesson ${lessonId}:`, error);
      setLessonTests(prev => ({ ...prev, [lessonId]: null }));
    } finally {
      setLoadingTests(prev => ({ ...prev, [lessonId]: false }));
    }
  };

  const handleTestStatusToggle = async (lessonId: string) => {
    const test = lessonTests[lessonId];
    if (!test) return;

    try {
      const newStatus = test.status === TestStatus.Open ? TestStatus.Close : TestStatus.Open;
      const updatedTest = await updateTestStatus(test.testId, newStatus);
      setLessonTests(prev => ({ ...prev, [lessonId]: updatedTest }));
    } catch (error) {
      console.error(`Failed to update test status for lesson ${lessonId}:`, error);
    }
  };

  const handleLessonPanelToggle = (lessonId: string) => {
    setActiveLessonPanel(activeLessonPanel === lessonId ? [] : lessonId);
    
    // Load test for this lesson if not already loaded
    if (!lessonTests[lessonId] && !loadingTests[lessonId]) {
      loadLessonTest(lessonId);
    }
  };


  // --- Loading and Error States ---
  if (loading) {
    return (
      <div className="flex h-screen font-['Inter']">
        <StaffSidebar />
        <div className="flex-1 flex flex-col justify-center items-center bg-gray-50">
          <div className="text-2xl font-semibold text-gray-700">Loading course details...</div>
          <div className="mt-4 animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-green-500 border-opacity-25"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-screen font-['Inter']">
        <StaffSidebar />
        <div className="flex-1 flex flex-col justify-center items-center bg-gray-50">
          <p className="text-lg text-gray-700">
            Course not found or an error occurred.
          </p>
          <button
            onClick={() => navigate(paths.course_management)}
            className="mt-4 px-6 py-3 bg-pink-600 text-white rounded-lg shadow-md hover:bg-pink-700 transition-colors duration-200"
          >
            Back to Course List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 font-inter flex flex-col lg:flex-row">
      <StaffSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StaffHeader />
        <main className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Quản lý Khóa học: <span className="text-green-600">{course.title}</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Course Information */}
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b pb-3">Thông tin khóa học</h2>
              <div className="space-y-5">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={courseFormState.title || ''}
                    onChange={handleCourseFormChange}
                    disabled={course.status === CourseStatus.Archived}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors ${
                      course.status === CourseStatus.Archived ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={courseFormState.description || ''}
                    onChange={handleCourseFormChange}
                    disabled={course.status === CourseStatus.Archived}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors ${
                      course.status === CourseStatus.Archived ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">Cấp độ</label>
                    <select
                      id="level"
                      name="level"
                      value={courseFormState.level ?? ''}
                      onChange={(e) => handleCourseSelectChange('level')(Number(e.target.value))}
                      disabled={course.status === CourseStatus.Archived}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors bg-white ${
                        course.status === CourseStatus.Archived ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    >
                      {Object.keys(CourseLevel)
                        .filter((key) => isNaN(Number(key)))
                        .map((key) => (
                          <option key={key} value={CourseLevel[key as keyof typeof CourseLevel]}>
                            {key}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="courseType" className="block text-sm font-medium text-gray-700 mb-1">Loại khóa học</label>
                    <select
                      id="courseType"
                      name="courseType"
                      value={courseFormState.courseType ?? ''}
                      onChange={(e) => handleCourseSelectChange('courseType')(Number(e.target.value))}
                      disabled={course.status === CourseStatus.Archived}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors bg-white ${
                        course.status === CourseStatus.Archived ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value={CourseType.Personal}>Cá nhân</option>
                      <option value={CourseType.Public}>Công khai</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Giá (VND)</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={courseFormState.price || 0}
                      onChange={handleCourseFormChange}
                      disabled={course.status === CourseStatus.Archived}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors ${
                        course.status === CourseStatus.Archived ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      min={0}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu (dd/mm/yyyy)</label>
                    <DatePicker
                      id="startDate"
                      name="startDate"
                      value={courseFormState.startDate ? dayjs(courseFormState.startDate) : null}
                      onChange={(date) => {
                        if (date) {
                          const isoString = date.toISOString();
                          setCourseFormState(prev => ({ ...prev, startDate: isoString }));
                          if (courseFormState.endDate) {
                            const validation = validateCourseDates(isoString, courseFormState.endDate);
                            setDateValidationError(validation.isValid ? "" : validation.message);
                          }
                        } else {
                          setCourseFormState(prev => ({ ...prev, startDate: '' }));
                          setDateValidationError("");
                        }
                      }}
                      disabled={course.status === CourseStatus.Archived}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors ${
                        dateValidationError ? 'border-red-500' : 'border-gray-300'
                      } ${course.status === CourseStatus.Archived ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc (dd/mm/yyyy)</label>
                    <DatePicker
                      id="endDate"
                      name="endDate"
                      value={courseFormState.endDate ? dayjs(courseFormState.endDate) : null}
                      onChange={(date) => {
                        if (date) {
                          const isoString = date.toISOString();
                          setCourseFormState(prev => ({ ...prev, endDate: isoString }));
                          if (courseFormState.startDate) {
                            const validation = validateCourseDates(courseFormState.startDate, isoString);
                            setDateValidationError(validation.isValid ? "" : validation.message);
                          }
                        } else {
                          setCourseFormState(prev => ({ ...prev, endDate: '' }));
                          setDateValidationError("");
                        }
                      }}
                      disabled={course.status === CourseStatus.Archived}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors ${
                        dateValidationError ? 'border-red-500' : 'border-gray-300'
                      } ${course.status === CourseStatus.Archived ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>
                {dateValidationError && (
                  <div>
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <FaExclamationCircle className="mr-1" />
                      {dateValidationError}
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
                  <ThumbnailUploader
                    form={{
                      setFieldsValue: (values: any) => setCourseFormState(prev => ({ ...prev, ...values })),
                      getFieldValue: (name: string) => (courseFormState as any)[name],
                    } as any}
                    initialImageUrl={course?.thumbnailUrl}
                    onFileChange={handleThumbnailChange}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={onFinishCourse}
                    disabled={submittingCourse || course.status === CourseStatus.Archived}
                    className={`flex items-center px-6 py-2 rounded-lg shadow-md transition-all duration-200 text-white font-semibold
                      ${submittingCourse || course.status === CourseStatus.Archived ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
                    `}
                  >
                    <FaSave className="mr-2" />
                    {submittingCourse ? "Đang lưu..." : course.status === CourseStatus.Archived ? "Không thể chỉnh sửa khóa học đã lưu trữ" : "Lưu thay đổi khóa học"}
                  </button>
                  <button
                    onClick={handleCancelCourseEdit}
                    className="flex items-center px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-semibold"
                  >
                    <FaRedo className="mr-2" />
                    Hủy thay đổi
                  </button>
                </div>

                <div className="mt-8 border-t pt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Trạng thái khóa học</h3>
                  <p className="mb-4 text-base">
                    Trạng thái hiện tại:{" "}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                      ${course.status === CourseStatus.Published ? 'bg-green-100 text-green-700' :
                        course.status === CourseStatus.Draft ? 'bg-blue-100 text-blue-700' :
                        course.status === CourseStatus.Archived ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}
                    `}>
                      {CourseStatus[course.status].toUpperCase()}
                    </span>
                  </p>
                  
                  {/* Show message for archived courses */}
                  {course.status === CourseStatus.Archived && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm flex items-center">
                        <FaExclamationCircle className="mr-2" />
                        Khóa học đã được lưu trữ tự động khi qua ngày kết thúc. Không thể thay đổi trạng thái của khóa học đã lưu trữ.
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(CourseStatus)
                      .filter((key) => isNaN(Number(key)))
                      .map((key) => {
                        const statusValue = CourseStatus[key as keyof typeof CourseStatus];
                        if (statusValue === course.status) return null;
                        
                        // Don't show "Set as Archived" button since it's handled by background service
                        if (statusValue === CourseStatus.Archived) return null;
                        
                        // Check if Published status should be disabled
                        const isPublishedDisabled = statusValue === CourseStatus.Published && course.instructors.length === 0;
                        
                        // Check if course is archived - if so, disable all status changes
                        const isArchivedDisabled = course.status === CourseStatus.Archived;
                        
                        return (
                          <CustomPopconfirm
                            key={key}
                            title={
                              isArchivedDisabled ? "Không thể thay đổi trạng thái của khóa học đã lưu trữ." :
                              isPublishedDisabled ? "Khóa học phải có ít nhất một giảng viên trước khi được xuất bản." : 
                              `Bạn có chắc muốn đổi trạng thái thành ${key}?`
                            }
                            onConfirm={() => handleUpdateCourseStatus(statusValue)}
                            disabled={submittingCourse || isPublishedDisabled || isArchivedDisabled}
                          >
                            <button
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                                ${statusValue === CourseStatus.Published ? 'bg-green-500 hover:bg-green-600 text-white' :
                                  statusValue === CourseStatus.Draft ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}
                                ${submittingCourse || isPublishedDisabled || isArchivedDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                              disabled={submittingCourse || isPublishedDisabled || isArchivedDisabled}
                              title={
                                isArchivedDisabled ? "Không thể thay đổi trạng thái của khóa học đã lưu trữ." :
                                isPublishedDisabled ? "Khóa học phải có ít nhất một giảng viên trước khi được xuất bản." : ""
                              }
                            >
                              Đặt thành {key}
                            </button>
                          </CustomPopconfirm>
                        );
                      })}
                  </div>
                </div>

                <div className="mt-8 border-t pt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Giảng viên</h3>
                  {course.instructors.length === 0 && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm flex items-center">
                        <FaExclamationCircle className="mr-2" />
                        Cảnh báo: Khóa học phải có ít nhất một giảng viên trước khi được xuất bản.
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => setIsAddInstructorModalVisible(true)}
                    className="flex items-center px-5 py-2 rounded-lg bg-green-600 text-white shadow-md hover:bg-green-700 transition-colors duration-200 text-sm font-semibold mb-4"
                  >
                    <FaPlus className="mr-2" /> Thêm Giảng viên
                  </button>
                  {course.instructors.length === 0 ? (
                    <p className="text-gray-600 text-sm">Chưa có giảng viên nào được gán.</p>
                  ) : (
                    <ul className="space-y-3">
                      {course.instructors.map((instructor: InstructorInfoDto) => (
                        <li key={instructor.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div>
                            <p className="font-medium text-gray-800">{instructor.fullName}</p>
                            <p className="text-sm text-gray-600">{instructor.email}</p>
                          </div>
                          <CustomPopconfirm
                            title="Bạn có chắc muốn xóa giảng viên này?"
                            onConfirm={() => handleRemoveInstructor(instructor.id)}
                            disabled={submittingCourse}
                          >
                            <button
                              className={`text-red-500 hover:text-red-700 transition-colors ${submittingCourse ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={submittingCourse}
                            >
                              <FaUserMinus size={18} />
                            </button>
                          </CustomPopconfirm>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Lesson Management */}
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col">
              <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b pb-3">Quản lý bài học</h2>

              {/* Create New Lesson Form */}
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Tạo bài học mới</h3>
              <div className="mb-6 p-5 border border-gray-200 rounded-xl bg-gray-50">
                {/* Validation Error Display */}
                {lessonValidationError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{lessonValidationError}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="create-title" className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề bài học <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="create-title"
                    name="title"
                    value={createLessonFormState.title}
                    onChange={handleCreateLessonChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Nhập tiêu đề bài học"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {createLessonFormState.title.length}/{LESSON_VALIDATION_RULES.TITLE_MAX_LENGTH} ký tự
                    </span>
                    {createLessonFormState.title.length > LESSON_VALIDATION_RULES.TITLE_MAX_LENGTH && (
                      <span className="text-xs text-red-500">
                        Tiêu đề quá dài
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="create-content" className="block text-sm font-medium text-gray-700 mb-1">
                    Nội dung bài học <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="create-content"
                    name="content"
                    rows={3}
                    value={createLessonFormState.content}
                    onChange={handleCreateLessonChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Nhập nội dung bài học"
                  ></textarea>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {createLessonFormState.content.length}/{LESSON_VALIDATION_RULES.CONTENT_MAX_LENGTH} ký tự
                    </span>
                    {createLessonFormState.content.length > LESSON_VALIDATION_RULES.CONTENT_MAX_LENGTH && (
                      <span className="text-xs text-red-500">
                        Nội dung quá dài
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={handleCreateLesson}
                  disabled={submittingLesson}
                  className={`flex items-center px-6 py-2 rounded-lg shadow-md transition-all duration-200 text-white font-semibold
                    ${submittingLesson ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                  `}
                >
                  <FaPlus className="mr-2" />
                  {submittingLesson ? "Đang thêm..." : "Thêm bài học"}
                </button>
              </div>

              {/* Existing Lessons List */}
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Bài học hiện có</h3>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {lessons.length === 0 ? (
                  <p className="text-gray-600 text-sm">Chưa có bài học nào cho khóa học này.</p>
                ) : (
                  <div className="space-y-3">
                    {lessons.map((lesson) => (
                      <div
                        key={lesson.lessonId}
                        className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
                      >
                        <div
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleLessonPanelToggle(lesson.lessonId)}
                        >
                          <span className="font-medium text-gray-800">Bài học {lesson.lessonOrder}: {lesson.title}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); showCreateTestModal(lesson.lessonId); }}
                              disabled={lessonTests[lesson.lessonId] !== null}
                              className={`transition-colors p-1 rounded-full ${
                                lessonTests[lesson.lessonId] !== null
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-100'
                              }`}
                              title={lessonTests[lesson.lessonId] !== null ? 'Lesson này đã có test' : 'Tạo test cho bài học'}
                            >
                              <FaQuestionCircle size={16} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); showUploadDocumentModal(lesson.lessonId); }}
                              className="text-gray-600 hover:text-green-600 transition-colors p-1 rounded-full hover:bg-gray-200"
                              title="Tải lên tài liệu"
                              disabled={submittingDocument}
                            >
                              <FaUpload size={16} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditLessonClick(lesson); }}
                              className="text-gray-600 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-gray-200"
                              title="Sửa bài học"
                              disabled={submittingLesson}
                            >
                              <FaEdit size={16} />
                            </button>
                            <CustomPopconfirm
                              title="Bạn có chắc muốn xóa bài học này?"
                              onConfirm={() => handleDeleteLesson(lesson.lessonId)}
                              disabled={submittingLesson}
                            >
                              <button
                                onClick={(e) => e.stopPropagation()} // Prevent collapse on popconfirm click
                                className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-100"
                                title="Xóa bài học"
                                disabled={submittingLesson}
                              >
                                <FaTrash size={16} />
                              </button>
                            </CustomPopconfirm>
                            <FaChevronRight className={`text-gray-500 transition-transform duration-200 ${activeLessonPanel === lesson.lessonId ? 'rotate-90' : ''}`} />
                          </div>
                        </div>

                        {activeLessonPanel === lesson.lessonId && (
                          <div className="p-4 border-t border-gray-200 bg-white">
                            {editingLessonId === lesson.lessonId ? (
                              <div className="space-y-4">
                                {/* Validation Error Display */}
                                {lessonValidationError && (
                                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm">{lessonValidationError}</p>
                                  </div>
                                )}
                                
                                <div>
                                  <label htmlFor={`edit-title-${lesson.lessonId}`} className="block text-sm font-medium text-gray-700 mb-1">
                                    Tiêu đề
                                  </label>
                                  <input
                                    type="text"
                                    id={`edit-title-${lesson.lessonId}`}
                                    name="title"
                                    value={editLessonFormState.title || ''}
                                    onChange={handleEditLessonChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
                                    placeholder="Nhập tiêu đề bài học"
                                  />
                                  {(editLessonFormState.title !== undefined && editLessonFormState.title !== '') && (
                                    <div className="flex justify-between items-center mt-1">
                                      <span className="text-xs text-gray-500">
                                        {editLessonFormState.title.length}/{LESSON_VALIDATION_RULES.TITLE_MAX_LENGTH} ký tự
                                      </span>
                                      {editLessonFormState.title.length > LESSON_VALIDATION_RULES.TITLE_MAX_LENGTH && (
                                        <span className="text-xs text-red-500">
                                          Tiêu đề quá dài
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                <div>
                                  <label htmlFor={`edit-order-${lesson.lessonId}`} className="block text-sm font-medium text-gray-700 mb-1">
                                    Thứ tự
                                  </label>
                                  <input
                                    type="number"
                                    id={`edit-order-${lesson.lessonId}`}
                                    name="lessonOrder"
                                    value={editLessonFormState.lessonOrder || ''}
                                    onChange={handleEditLessonChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
                                    min={LESSON_VALIDATION_RULES.LESSON_ORDER_MIN}
                                    max={LESSON_VALIDATION_RULES.LESSON_ORDER_MAX}
                                  />
                                  <div className="mt-1">
                                    <span className="text-xs text-gray-500">
                                      Phạm vi: {LESSON_VALIDATION_RULES.LESSON_ORDER_MIN} - {LESSON_VALIDATION_RULES.LESSON_ORDER_MAX}
                                    </span>
                                  </div>
                                </div>
                                
                                <div>
                                  <label htmlFor={`edit-content-${lesson.lessonId}`} className="block text-sm font-medium text-gray-700 mb-1">
                                    Nội dung
                                  </label>
                                  <textarea
                                    id={`edit-content-${lesson.lessonId}`}
                                    name="content"
                                    rows={4}
                                    value={editLessonFormState.content || ''}
                                    onChange={handleEditLessonChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
                                    placeholder="Nhập nội dung bài học"
                                  ></textarea>
                                  {(editLessonFormState.content !== undefined && editLessonFormState.content !== '') && (
                                    <div className="flex justify-between items-center mt-1">
                                      <span className="text-xs text-gray-500">
                                        {editLessonFormState.content.length}/{LESSON_VALIDATION_RULES.CONTENT_MAX_LENGTH} ký tự
                                      </span>
                                      {editLessonFormState.content.length > LESSON_VALIDATION_RULES.CONTENT_MAX_LENGTH && (
                                        <span className="text-xs text-red-500">
                                          Nội dung quá dài
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-3 mt-4">
                                  <button
                                    onClick={handleUpdateLesson}
                                    disabled={submittingLesson}
                                    className={`flex items-center px-5 py-2 rounded-lg shadow-md transition-all duration-200 text-white font-semibold
                                      ${submittingLesson ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
                                    `}
                                  >
                                    <FaSave className="mr-2" />
                                    {submittingLesson ? "Đang lưu..." : "Lưu thay đổi"}
                                  </button>
                                  <button
                                    onClick={handleCancelEditLesson}
                                    className="flex items-center px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-semibold"
                                  >
                                    <FaRedo className="mr-2" />
                                    Hủy
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <p className="text-gray-700 text-base">
                                  <span className="font-semibold">Thứ tự:</span> {lesson.lessonOrder}
                                </p>
                                <p className="text-gray-700 text-base">
                                  <span className="font-semibold">Nội dung:</span> {lesson.content}
                                </p>

                                {/* Tests Section for this lesson */}
                                <h4 className="text-lg font-semibold text-gray-700 mt-5 mb-3 border-t pt-4">Bài kiểm tra</h4>
                                {loadingTests[lesson.lessonId] ? (
                                  <div className="text-center text-gray-500 py-4">Đang tải...</div>
                                ) : lessonTests[lesson.lessonId] ? (
                                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                                    <div className="flex items-center gap-3">
                                      <FaQuestionCircle className="text-blue-600" size={20} />
                                      <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-800 block">
                                          {lessonTests[lesson.lessonId]?.title}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {lessonTests[lesson.lessonId]?.description}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => showEditTestModal(lessonTests[lesson.lessonId]!)}
                                        className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                        title="Chỉnh sửa test"
                                      >
                                        <FaEdit className="text-xs" />
                                        Sửa
                                      </button>
                                      <button
                                        onClick={() => handleTestStatusToggle(lesson.lessonId)}
                                        className={`flex items-center gap-1 px-3 py-1 text-xs rounded transition-colors ${
                                          lessonTests[lesson.lessonId]?.status === TestStatus.Open
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-600 text-white hover:bg-gray-700'
                                        }`}
                                        title={lessonTests[lesson.lessonId]?.status === TestStatus.Open ? 'Đóng test' : 'Mở test'}
                                      >
                                        {lessonTests[lesson.lessonId]?.status === TestStatus.Open ? (
                                          <>
                                            <FaEyeSlash className="text-xs" />
                                            Đóng
                                          </>
                                        ) : (
                                          <>
                                            <FaEye className="text-xs" />
                                            Mở
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-gray-500 text-sm mb-4">Chưa có bài kiểm tra nào.</div>
                                )}

                                {/* Documents Section for this lesson */}
                                <h4 className="text-lg font-semibold text-gray-700 mt-5 mb-3 border-t pt-4">Tài liệu bài học</h4>
                                {(lesson.documents || []).length > 0 ? (
                                  <ul className="space-y-3">
                                    {(lesson.documents || []).map((doc) => (
                                      <li key={doc.documentId} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex items-center gap-3">
                                          {doc.fileUrl.includes(".pdf") ? (
                                            <FaFilePdf size={24} className="text-red-500" />
                                          ) : (
                                            <FaVideo size={24} className="text-blue-500" />
                                          )}
                                          <a
                                            href={doc.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-800 font-medium hover:text-green-600 transition-colors truncate max-w-[200px] sm:max-w-none"
                                            title={doc.documentName}
                                          >
                                            {doc.documentName}
                                          </a>
                                          <span className="text-xs text-gray-500 ml-2">
                                            ({new Date(doc.uploadedAt).toLocaleDateString()})
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => {
                                              // Create a temporary anchor element to trigger download
                                              const link = document.createElement('a');
                                              link.href = doc.fileUrl;
                                              link.download = doc.documentName; // Suggest file name
                                              document.body.appendChild(link);
                                              link.click();
                                              document.body.removeChild(link);
                                            }}
                                            className="text-gray-600 hover:text-green-600 transition-colors p-1 rounded-full hover:bg-gray-200"
                                            title="Tải xuống tài liệu"
                                          >
                                            <FaDownload size={16} />
                                          </button>
                                          <CustomPopconfirm
                                            title="Bạn có chắc muốn xóa tài liệu này?"
                                            onConfirm={() => handleDeleteDocument(lesson.lessonId, doc.documentId)}
                                            disabled={submittingDocument}
                                          >
                                            <button
                                              className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-100"
                                              title="Xóa tài liệu"
                                              disabled={submittingDocument}
                                            >
                                              <FaTrash size={16} />
                                            </button>
                                          </CustomPopconfirm>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-500 text-sm">Chưa có tài liệu nào được gắn với bài học này.</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <CustomPopconfirm
                title="Bạn có chắc muốn xóa tất cả các bài học trong khóa học này? Hành động này không thể hoàn tác."
                onConfirm={handleDeleteAllLessons}
                disabled={submittingLesson || lessons.length === 0}
              >
                <button
                  className={`w-full mt-6 px-6 py-3 rounded-lg text-white font-semibold transition-colors duration-200
                    ${submittingLesson || lessons.length === 0 ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}
                  `}
                  disabled={submittingLesson || lessons.length === 0}
                >
                  <FaTrash className="inline-block mr-2" /> Xóa tất cả bài học
                </button>
              </CustomPopconfirm>

              {/* Livestream Management Section */}
              <div className="mt-8 border-t pt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaBroadcastTower className="mr-2 text-purple-600" />
                  Quản lý Livestream
                </h3>

                {/* Show warning for archived courses */}
                {course.status === CourseStatus.Archived && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm flex items-center">
                      <FaExclamationCircle className="mr-2" />
                      Không thể tạo livestream mới cho khóa học đã được lưu trữ (ARCHIVED).
                    </p>
                  </div>
                )}

                {/* Create New Livestream Form - Only show if course is not archived */}
                {course.status !== CourseStatus.Archived && (
                  <div className="mb-6 p-5 border border-purple-200 rounded-xl bg-purple-50">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Tạo livestream mới</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="livestream-description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả livestream</label>
                        <input
                          type="text"
                          id="livestream-description"
                          name="description"
                          value={createLivestreamFormState.description}
                          onChange={handleCreateLivestreamFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          placeholder="Nhập mô tả livestream"
                        />
                      </div>
                      <div>
                        <label htmlFor="livestream-duration" className="block text-sm font-medium text-gray-700 mb-1">Thời lượng (phút)</label>
                        <input
                          type="number"
                          id="livestream-duration"
                          name="durationMinutes"
                          value={createLivestreamFormState.durationMinutes}
                          onChange={(e) => handleCreateLivestreamNumberChange('durationMinutes')(parseInt(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          min={15}
                          max={480}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="livestream-schedule" className="block text-sm font-medium text-gray-700 mb-1">Thời gian lên lịch</label>
                        <DatePicker
                          id="livestream-schedule"
                          name="scheduledDateTime"
                          showTime={{ format: 'HH:mm' }}
                          format="YYYY-MM-DD HH:mm"
                          value={createLivestreamFormState.scheduledDateTime ? dayjs(createLivestreamFormState.scheduledDateTime) : null}
                          onChange={(date) => {
                            if (date) {
                              const isoString = date.toISOString();
                              setCreateLivestreamFormState(prev => ({ ...prev, scheduledDateTime: isoString }));
                              if (course && course.startDate && course.endDate) {
                                const validation = validateLivestreamSchedule(isoString, course.startDate, course.endDate);
                                setLivestreamValidationError(validation.isValid ? "" : validation.message);
                              }
                            } else {
                              setCreateLivestreamFormState(prev => ({ ...prev, scheduledDateTime: '' }));
                              setLivestreamValidationError("");
                            }
                          }}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                            livestreamValidationError ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {livestreamValidationError && (
                          <p className="text-red-600 text-sm mt-1 flex items-center">
                            <FaExclamationCircle className="mr-1" />
                            {livestreamValidationError}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleCreateLivestream}
                      disabled={submittingLivestream}
                      className={`flex items-center px-6 py-2 rounded-lg shadow-md transition-all duration-200 text-white font-semibold mt-4
                        ${submittingLivestream ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}
                      `}
                    >
                      <FaBroadcastTower className="mr-2" />
                      {submittingLivestream ? "Đang tạo..." : "Tạo livestream"}
                    </button>
                  </div>
                )}

                {/* Existing Livestreams List */}
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Livestream hiện có</h4>
                <div className="space-y-3">
                  {livestreams.length === 0 ? (
                    <p className="text-gray-600 text-sm">Chưa có livestream nào cho khóa học này.</p>
                  ) : (
                    livestreams.map((livestream) => (
                      <div
                        key={livestream.livestreamId}
                        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FaBroadcastTower className="text-purple-600" />
                              <h5 className="font-semibold text-gray-800">{livestream.description || "Livestream không có mô tả"}</h5>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium
                                ${livestream.status === LivestreamStatus.SCHEDULED ? 'bg-blue-100 text-blue-700' :
                                  livestream.status === LivestreamStatus.LIVE ? 'bg-green-100 text-green-700' :
                                  livestream.status === LivestreamStatus.COMPLETED ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700'}
                              `}>
                                {livestream.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <FaCalendarAlt className="text-gray-500" />
                                <span>Thời gian: {new Date(livestream.scheduledDateTime).toLocaleString('vi-VN')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FaClock className="text-gray-500" />
                                <span>Thời lượng: {livestream.durationMinutes} phút</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CustomPopconfirm
                              title="Bạn có chắc muốn xóa livestream này?"
                              onConfirm={() => handleDeleteLivestream(livestream.livestreamId)}
                            >
                              <button
                                className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-100"
                                title="Xóa livestream"
                              >
                                <FaTrash size={16} />
                              </button>
                            </CustomPopconfirm>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal for adding instructor */}
      <CustomModal
        isOpen={isAddInstructorModalVisible}
        onClose={() => setIsAddInstructorModalVisible(false)}
        title="Thêm Giảng viên vào Khóa học"
        onConfirm={handleAddInstructor}
        confirmLoading={submittingCourse}
        okText="Thêm"
      >
        <div className="mb-4">
          <label htmlFor="instructor-select" className="block text-sm font-medium text-gray-700 mb-1">Chọn giảng viên</label>
          {loadingInstructors ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
              <span className="ml-2 text-gray-600">Đang tải danh sách giảng viên...</span>
            </div>
          ) : (
            <select
              id="instructor-select"
              value={newInstructorId}
              onChange={(e) => setNewInstructorId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              <option value="">-- Chọn giảng viên --</option>
              {instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.fullName} ({instructor.email})
                </option>
              ))}
            </select>
          )}
          {instructors.length === 0 && !loadingInstructors && (
            <p className="text-gray-500 text-sm mt-2">Không có giảng viên nào khả dụng.</p>
          )}
        </div>
      </CustomModal>

      {/* Modal for uploading documents to a lesson */}
      <CustomModal
        isOpen={isUploadDocumentModalVisible}
        onClose={() => {
          setIsUploadDocumentModalVisible(false);
          setFileList([]); // Clear file selection on cancel
        }}
        title={`Tải lên tài liệu cho bài học`}
        onConfirm={handleUploadDocument}
        confirmLoading={submittingDocument}
        okText="Tải lên"
      >
        <div className="mb-4">
          <label htmlFor="file-upload-input" className="block text-sm font-medium text-gray-700 mb-1">Chọn tệp</label>
          <input
            type="file"
            id="file-upload-input"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-green-50 file:text-green-700
              hover:file:bg-green-100 cursor-pointer"
            // Allow all common document and video types
            accept=".pdf,.doc,.docx,.txt,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv,.3gp,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
          />
          {fileList.length > 0 && (
            <p className="text-gray-600 text-sm mt-2">Đã chọn: {fileList[0].name}</p>
          )}
        </div>
      </CustomModal>

      {/* Modal for creating livestream */}
      <CustomModal
        isOpen={isCreateLivestreamModalVisible}
        onClose={() => {
          setIsCreateLivestreamModalVisible(false);
          setLivestreamValidationError("");
        }}
        title="Tạo Livestream mới"
        onConfirm={handleCreateLivestream}
        confirmLoading={submittingLivestream}
        okText="Tạo"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="modal-livestream-description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả livestream</label>
            <input
              type="text"
              id="modal-livestream-description"
              name="description"
              value={createLivestreamFormState.description}
              onChange={handleCreateLivestreamFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="Nhập mô tả livestream"
            />
          </div>
          <div>
            <label htmlFor="modal-livestream-duration" className="block text-sm font-medium text-gray-700 mb-1">Thời lượng (phút)</label>
            <input
              type="number"
              id="modal-livestream-duration"
              name="durationMinutes"
              value={createLivestreamFormState.durationMinutes}
              onChange={(e) => handleCreateLivestreamNumberChange('durationMinutes')(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors"
              min={15}
              max={480}
            />
          </div>
          <div>
            <label htmlFor="modal-livestream-schedule" className="block text-sm font-medium text-gray-700 mb-1">Thời gian lên lịch</label>
            <DatePicker
              id="modal-livestream-schedule"
              name="scheduledDateTime"
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              value={createLivestreamFormState.scheduledDateTime ? dayjs(createLivestreamFormState.scheduledDateTime) : null}
              onChange={(date) => {
                if (date) {
                  const isoString = date.toISOString();
                  setCreateLivestreamFormState(prev => ({ ...prev, scheduledDateTime: isoString }));
                  if (course && course.startDate && course.endDate) {
                    const validation = validateLivestreamSchedule(isoString, course.startDate, course.endDate);
                    setLivestreamValidationError(validation.isValid ? "" : validation.message);
                  }
                } else {
                  setCreateLivestreamFormState(prev => ({ ...prev, scheduledDateTime: '' }));
                  setLivestreamValidationError("");
                }
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                livestreamValidationError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {livestreamValidationError && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <FaExclamationCircle className="mr-1" />
                {livestreamValidationError}
              </p>
            )}
          </div>
        </div>
      </CustomModal>

      {/* Modal for creating test */}
      <CreateTestModal
        isOpen={isCreateTestModalVisible}
        onClose={() => setIsCreateTestModalVisible(false)}
        lessonId={currentLessonForTest}
        courseLevel={course?.level || CourseLevel.N5}
        courseStartDate={course?.startDate || ""}
        courseEndDate={course?.endDate || ""}
        onTestCreated={handleTestCreated}
      />

      {/* Modal for editing test */}
      <EditTestModal
        isOpen={isEditTestModalVisible}
        onClose={() => {
          setIsEditTestModalVisible(false);
          setCurrentTestForEdit(null);
        }}
        test={currentTestForEdit}
        courseStartDate={course?.startDate}
        courseEndDate={course?.endDate}
        onTestUpdated={handleTestUpdated}
      />


    </div>
  );
};

export default CourseDetailPage;
