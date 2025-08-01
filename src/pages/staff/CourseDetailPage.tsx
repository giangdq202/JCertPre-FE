// src/pages/staff/CourseDetailPage.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StaffSidebar from "../../components/sidebar/StaffSidebar";
import StaffHeader from "../../components/header/StaffHeader";
import ThumbnailUploader from "../../components/forms/ThumbnailUploader"; // This component might still use Ant Design internally, will keep it for now.

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
  LessonDto,
  CreateLessonDto,
  UpdateLessonDto,
  getLessonsByCourseId,
  createLesson,
  updateLesson,
  deleteLessonById,
  deleteAllLessonsByCourseId,
} from "../../services/lessonService";
import {
  DocumentDto,
  uploadImageDocument,
  uploadVideoDocument,
  uploadRawDocument,
  deleteDocument,
  getDocumentsByLessonId,
} from "../../services/documentService";
import { getAllUsers, UserDto } from "../../services/userService";
import paths from "../../routes/path";

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


  // --- Course Data Fetching ---
  useEffect(() => {
    const fetchCourseAndLessons = async () => {
      console.log("Fetching course details for ID:", courseId);

      if (!courseId) {
        // message.error("Course ID is missing. Redirecting to course list."); // Removed Ant Design message
        alert("Course ID is missing. Redirecting to course list."); // Using alert
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
      } catch (error) {
        // message.error("Failed to fetch course details or lessons. Please check the ID or network connection."); // Removed Ant Design message
        alert("Failed to fetch course details or lessons. Please check the ID or network connection."); // Using alert
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
        alert("Không thể tải danh sách giảng viên.");
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
    const { name, value } = e.target;
    setCourseFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleCourseSelectChange = (name: keyof UpdateCourseDto) => (value: any) => {
    setCourseFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (file: File | null) => {
    setThumbnailFile(file);
  };

  const onFinishCourse = async () => {
    if (!courseId) return;
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
      alert("Course updated successfully!"); // Using alert
    } catch (error) {
      // message.error("Failed to update course."); // Removed Ant Design message
      alert("Failed to update course."); // Using alert
      console.error("Error updating course:", error);
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleUpdateCourseStatus = async (newStatus: CourseStatus) => {
    if (!courseId || !course) return; // Ensure course data is available
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
      alert(`Course status updated to ${CourseStatus[newStatus]} successfully!`); // Using alert
    } catch (error) {
      // message.error("Failed to update course status."); // Removed Ant Design message
      alert("Failed to update course status."); // Using alert
      console.error("Error updating course status:", error);
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleAddInstructor = async () => {
    if (!courseId || !newInstructorId) {
      alert("Vui lòng chọn một giảng viên.");
      return;
    }
    setSubmittingCourse(true);
    try {
      await addInstructorToCourse(courseId, newInstructorId);
      alert("Đã thêm giảng viên thành công!");
      const updatedCourseData = await getCourseById(courseId);
      setCourse(updatedCourseData);
      setIsAddInstructorModalVisible(false);
      setNewInstructorId("");
    } catch (error) {
      alert("Không thể thêm giảng viên. Kiểm tra ID hoặc nếu đã được gán.");
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
      alert("Instructor removed successfully!"); // Using alert
      const updatedCourseData = await getCourseById(courseId);
      setCourse(updatedCourseData);
    } catch (error) {
      // message.error("Failed to remove instructor."); // Removed Ant Design message
      alert("Failed to remove instructor."); // Using alert
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
        thumbnailUrl: course.thumbnailUrl,
        status: course.status,
      });
      setThumbnailFile(null); // Reset thumbnail file when canceling
      // message.info("Course changes discarded."); // Removed Ant Design message
      alert("Course changes discarded."); // Using alert
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
      // message.success("Lesson created successfully!"); // Removed Ant Design message
      alert("Lesson created successfully!"); // Using alert
      setCreateLessonFormState({ title: '', content: '', lessonOrder: 0 }); // Reset form
      setActiveLessonPanel(newLesson.lessonId);
    } catch (error) {
      // message.error("Failed to create lesson."); // Removed Ant Design message
      alert("Failed to create lesson."); // Using alert
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
    setSubmittingLesson(true);
    try {
      const updatedLesson = await updateLesson(editingLessonId, editLessonFormState);
      const documentsForUpdatedLesson = await getDocumentsByLessonId(updatedLesson.lessonId);
      const lessonWithDocs = { ...updatedLesson, documents: documentsForUpdatedLesson };

      setLessons((prev) =>
        prev.map((l) => (l.lessonId === editingLessonId ? lessonWithDocs : l)).sort((a, b) => a.lessonOrder - b.lessonOrder)
      );
      // message.success("Lesson updated successfully!"); // Removed Ant Design message
      alert("Lesson updated successfully!"); // Using alert
      setEditingLessonId(null); // Exit editing mode
      setEditLessonFormState({}); // Clear edit form state
      setActiveLessonPanel([]); // Collapse the panel after update
    } catch (error) {
      // message.error("Failed to update lesson."); // Removed Ant Design message
      alert("Failed to update lesson."); // Using alert
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
      alert("Lesson deleted successfully!"); // Using alert
    } catch (error) {
      // message.error("Failed to delete lesson."); // Removed Ant Design message
      alert("Failed to delete lesson."); // Using alert
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
      alert("All lessons deleted successfully!"); // Using alert
    } catch (error) {
      // message.error("Failed to delete all lessons."); // Removed Ant Design message
      alert("Failed to delete all lessons."); // Using alert
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
      alert("Please select a file to upload.");
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
            ? { ...lesson, documents: [...lesson.documents, newDocument] }
            : lesson
        ).sort((a, b) => a.lessonOrder - b.lessonOrder)
      );

      alert("Document uploaded successfully!");
      setIsUploadDocumentModalVisible(false);
      setFileList([]);
    } catch (error) {
      alert("Failed to upload document.");
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
                documents: lesson.documents.filter(
                  (doc) => doc.documentId !== documentId
                ),
              }
            : lesson
        ).sort((a, b) => a.lessonOrder - b.lessonOrder)
      );
      // message.success("Document deleted successfully!"); // Removed Ant Design message
      alert("Document deleted successfully!"); // Using alert
    } catch (error) {
      // message.error("Failed to delete document."); // Removed Ant Design message
      alert("Failed to delete document."); // Using alert
      console.error("Error deleting document:", error);
    } finally {
      setSubmittingDocument(false);
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">Cấp độ</label>
                    <select
                      id="level"
                      name="level"
                      value={courseFormState.level ?? ''}
                      onChange={(e) => handleCourseSelectChange('level')(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
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
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Giá (VND)</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={courseFormState.price || 0}
                      onChange={handleCourseFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
                      min={0}
                    />
                  </div>
                </div>

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
                    disabled={submittingCourse}
                    className={`flex items-center px-6 py-2 rounded-lg shadow-md transition-all duration-200 text-white font-semibold
                      ${submittingCourse ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
                    `}
                  >
                    <FaSave className="mr-2" />
                    {submittingCourse ? "Đang lưu..." : "Lưu thay đổi khóa học"}
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
                        course.status === CourseStatus.Archived ? 'bg-yellow-100 text-yellow-700' :
                        course.status === CourseStatus.Suspended ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}
                    `}>
                      {CourseStatus[course.status].toUpperCase()}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(CourseStatus)
                      .filter((key) => isNaN(Number(key)))
                      .map((key) => {
                        const statusValue = CourseStatus[key as keyof typeof CourseStatus];
                        if (statusValue === course.status) return null;
                        return (
                          <CustomPopconfirm
                            key={key}
                            title={`Bạn có chắc muốn đổi trạng thái thành ${key}?`}
                            onConfirm={() => handleUpdateCourseStatus(statusValue)}
                            disabled={submittingCourse}
                          >
                            <button
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                                ${statusValue === CourseStatus.Published ? 'bg-green-500 hover:bg-green-600 text-white' :
                                  statusValue === CourseStatus.Draft ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                                  statusValue === CourseStatus.Archived ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                                  statusValue === CourseStatus.Suspended ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}
                                ${submittingCourse ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                              disabled={submittingCourse}
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
                <div className="mb-4">
                  <label htmlFor="create-title" className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài học</label>
                  <input
                    type="text"
                    id="create-title"
                    name="title"
                    value={createLessonFormState.title}
                    onChange={handleCreateLessonChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="create-content" className="block text-sm font-medium text-gray-700 mb-1">Nội dung bài học</label>
                  <textarea
                    id="create-content"
                    name="content"
                    rows={3}
                    value={createLessonFormState.content}
                    onChange={handleCreateLessonChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  ></textarea>
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
                          onClick={() => setActiveLessonPanel(activeLessonPanel === lesson.lessonId ? [] : lesson.lessonId)}
                        >
                          <span className="font-medium text-gray-800">Bài học {lesson.lessonOrder}: {lesson.title}</span>
                          <div className="flex items-center gap-2">
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
                                <div>
                                  <label htmlFor={`edit-title-${lesson.lessonId}`} className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                                  <input
                                    type="text"
                                    id={`edit-title-${lesson.lessonId}`}
                                    name="title"
                                    value={editLessonFormState.title || ''}
                                    onChange={handleEditLessonChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`edit-order-${lesson.lessonId}`} className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
                                  <input
                                    type="number"
                                    id={`edit-order-${lesson.lessonId}`}
                                    name="lessonOrder"
                                    value={editLessonFormState.lessonOrder || ''}
                                    onChange={handleEditLessonChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
                                    min={1}
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`edit-content-${lesson.lessonId}`} className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                                  <textarea
                                    id={`edit-content-${lesson.lessonId}`}
                                    name="content"
                                    rows={4}
                                    value={editLessonFormState.content || ''}
                                    onChange={handleEditLessonChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
                                  ></textarea>
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

                                {/* Documents Section for this lesson */}
                                <h4 className="text-lg font-semibold text-gray-700 mt-5 mb-3 border-t pt-4">Tài liệu bài học</h4>
                                {lesson.documents && lesson.documents.length > 0 ? (
                                  <ul className="space-y-3">
                                    {lesson.documents.map((doc) => (
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
    </div>
  );
};

export default CourseDetailPage;
