import React, { useState, useEffect } from "react";
import InstructorSidebar from "../../components/sidebar/InstructorSidebar";
import InstructorHeader from "../../components/header/InstructorHeader";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { getCourses, CourseListDto, CourseQueryParameters } from "../../services/courseService";
import paths from "../../routes/path";
import { FaChalkboardTeacher, FaUsers, FaCalendarAlt, FaEye, FaPlay } from "react-icons/fa";
import { MdOutlineAccessTime, MdOutlineSchool } from "react-icons/md";
import { HiOutlineAcademicCap } from "react-icons/hi2";
import { Spin } from "antd";
import { toast } from 'react-toastify';

const InstructorCoursesPage: React.FC = () => {
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseListDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 12;

  // Fetch courses assigned to instructor
  useEffect(() => {
    const fetchInstructorCourses = async () => {
      if (!userInfo?.id) return;
      
      setLoading(true);
      try {
        const queryParams: CourseQueryParameters = {
          pageNumber: currentPage,
          pageSize: pageSize,
          instructorId: userInfo.id
        };
        
        const response = await getCourses(queryParams);
        setCourses(response.items);
        setTotalItems(response.totalItemsCount);
      } catch (error) {
        console.error("Error fetching instructor courses:", error);
        toast.error("Không thể tải danh sách khóa học. Vui lòng thử lại sau.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorCourses();
  }, [userInfo?.id, currentPage]);

  const handleCourseClick = (courseId: string) => {
    navigate(paths.instructor_course_detail.replace(':courseId', courseId));
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: // Draft
        return "bg-yellow-100 text-yellow-800";
      case 1: // Published
        return "bg-green-100 text-green-800";
      case 2: // Archived
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Bản nháp";
      case 1:
        return "Đã xuất bản";
      case 2:
        return "Đã lưu trữ";
      default:
        return "Không xác định";
    }
  };

  const getLevelText = (level: number) => {
    const levels = ["N5", "N4", "N3", "N2", "N1"];
    return levels[level] || "N/A";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 font-inter flex flex-col lg:flex-row">
      <InstructorSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <InstructorHeader />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <FaChalkboardTeacher className="text-3xl" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight mb-2">
                    Khóa học được giao
                  </h1>
                  <p className="text-blue-100 text-lg font-medium">
                    Quản lý và tạo bài kiểm tra cho các khóa học bạn dạy
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <MdOutlineSchool className="text-2xl text-yellow-300" />
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Tổng khóa học</p>
                      <p className="text-2xl font-bold">{totalItems}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <FaPlay className="text-2xl text-green-300" />
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Đang hoạt động</p>
                      <p className="text-2xl font-bold">{courses.filter(c => c.status === 1).length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <FaUsers className="text-2xl text-orange-300" />
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Tổng học viên</p>
                      <p className="text-2xl font-bold">{courses.reduce((sum, course) => sum + course.enrollmentsCount, 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Spin size="large" />
                <p className="mt-4 text-gray-600 font-medium">Đang tải khóa học...</p>
              </div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaChalkboardTeacher className="text-gray-400 text-4xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Chưa có khóa học nào được giao
              </h3>
              <p className="text-gray-600">
                Bạn chưa được giao dạy khóa học nào. Hãy liên hệ với quản lý để được phân công.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {courses.map((course) => (
                  <div
                    key={course.courseId}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                    onClick={() => handleCourseClick(course.courseId)}
                  >
                    {/* Course Thumbnail */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={course.thumbnailUrl || '/placeholder-course.jpg'}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(course.status)}`}>
                          {getStatusText(course.status)}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {getLevelText(course.level)}
                        </span>
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {course.description}
                      </p>

                      {/* Course Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaUsers className="text-blue-500" />
                          <span>{course.enrollmentsCount} học viên</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <HiOutlineAcademicCap className="text-green-500" />
                          <span>{course.instructorsCount} giảng viên</span>
                        </div>
                      </div>

                      {/* Course Dates */}
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <FaCalendarAlt className="text-blue-500" />
                          <span>Bắt đầu: {new Date(course.startDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MdOutlineAccessTime className="text-red-500" />
                          <span>Kết thúc: {new Date(course.endDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCourseClick(course.courseId);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                        >
                          <FaEye />
                          Quản lý
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalItems > pageSize && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    <span className="px-4 py-2 text-gray-700">
                      Trang {currentPage} / {Math.ceil(totalItems / pageSize)}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalItems / pageSize), prev + 1))}
                      disabled={currentPage >= Math.ceil(totalItems / pageSize)}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default InstructorCoursesPage;
