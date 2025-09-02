// src/pages/staff/StaffCourseManagementPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import StaffSidebar from "../../components/sidebar/StaffSidebar";
import StaffHeader from "../../components/header/StaffHeader";
import { useNotification } from "../../components/notifications";

// Import icons from react-icons
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import {
  getCourses,
  CourseListDto,
  CourseStatus,
  CourseLevel,
  CourseType,
  CourseQueryParameters,
} from "../../services/courseService";

const StaffCourseManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { error: showError } = useNotification();

  const [courses, setCourses] = useState<CourseListDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [queryParameters, setQueryParameters] = useState<CourseQueryParameters>({
    pageNumber: 1,
    pageSize: 10,
    searchTerm: null,
    instructorId: null,
    status: null,
    level: null,
    courseType: null, // Default to Personal as per new rule
    startDate: null,
    endDate: null,
  });

  // Hàm để fetch dữ liệu khóa học từ API
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Query parameters being sent:", queryParameters);
      const response = await getCourses(queryParameters);
      console.log("Courses response:", response);
      setCourses(response.items);
      setPagination((prev) => ({
        ...prev,
        total: response.totalItemsCount,
        current: Math.max(1, response.pageIndex),
        pageSize: response.pageSize,
      }));
    } catch (error) {
      showError("Không thể tải danh sách khóa học.");
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  }, [queryParameters, showError]); // `fetchCourses` depends on `queryParameters`

  // Gọi API khi queryParameters thay đổi
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]); // `fetchCourses` is now a dependency of useEffect

  // Xử lý thay đổi phân trang
  const handlePageChange = (page: number) => {
    setQueryParameters((prev) => ({
      ...prev,
      pageNumber: page,
    }));
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    setQueryParameters((prev) => ({
      ...prev,
      pageSize: newSize,
      pageNumber: 1, // Reset to page 1 when page size changes
    }));
  };

  // Xử lý thay đổi tìm kiếm
  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQueryParameters((prev) => ({
      ...prev,
      searchTerm: e.target.value || null,
    }));
  };

  const handleSearchSubmit = () => {
    // Trigger fetchCourses via queryParameters change
    setQueryParameters(prev => ({ ...prev, pageNumber: 1 }));
  };

  // Xử lý thay đổi bộ lọc trạng thái
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === "" ? null : Number(e.target.value) as CourseStatus;
    setQueryParameters((prev) => ({
      ...prev,
      status: value,
      pageNumber: 1,
    }));
  };

  // Xử lý thay đổi bộ lọc cấp độ
  const handleLevelFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === "" ? null : Number(e.target.value) as CourseLevel;
    setQueryParameters((prev) => ({
      ...prev,
      level: value,
      pageNumber: 1,
    }));
  };

  // Xử lý thay đổi bộ lọc loại khóa học
  const handleCourseTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === "" ? null : Number(e.target.value) as CourseType;
    setQueryParameters((prev) => ({
      ...prev,
      courseType: value,
      pageNumber: 1,
    }));
  };

  // Calculate total pages for pagination
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <div className="flex h-screen font-inter"> {/* Changed font to Inter */}
      <StaffSidebar />
      <div className="flex-1 flex flex-col">
        <StaffHeader />
        <main className="pt-16 p-6 bg-gray-50 h-full overflow-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Quản lý Khóa học
          </h1>

          {/* Filter and Create Course Section */}
          <div className="bg-white p-6 rounded-xl shadow-xl mb-6"> {/* Rounded and shadow updated */}
            <div className="flex flex-wrap items-end gap-4 mb-4"> {/* Using flexbox for layout */}
              {/* Search Input */}
              <div className="flex-1 min-w-[250px] max-w-sm">
                <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                <div className="flex rounded-lg shadow-sm border border-gray-300 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all">
                  <input
                    type="text"
                    id="search-input"
                    placeholder="Tìm kiếm theo tiêu đề hoặc mô tả"
                    value={queryParameters.searchTerm || ""}
                    onChange={handleSearchTermChange}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(); }}
                    className="flex-1 block w-full px-4 py-2 rounded-l-lg focus:outline-none bg-white text-gray-800"
                  />
                  <button
                    onClick={handleSearchSubmit}
                    className="px-4 py-2 bg-orange-600 text-white rounded-r-lg hover:bg-orange-700 transition-colors flex items-center justify-center"
                    aria-label="Tìm kiếm"
                  >
                    <FaSearch size={16} />
                  </button>
                </div>
              </div>

              {/* Status Filter */}
              <div className="min-w-[150px]">
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  id="status-filter"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none"
                  onChange={handleStatusFilterChange}
                  value={queryParameters.status === null ? "" : queryParameters.status}
                >
                  <option value="">Tất cả trạng thái</option>
                  {Object.keys(CourseStatus)
                    .filter((key) => isNaN(Number(key)))
                    .map((key) => (
                      <option key={key} value={CourseStatus[key as keyof typeof CourseStatus]}>
                        {key}
                      </option>
                    ))}
                </select>
              </div>

              {/* Level Filter */}
              <div className="min-w-[150px]">
                <label htmlFor="level-filter" className="block text-sm font-medium text-gray-700 mb-1">Cấp độ</label>
                <select
                  id="level-filter"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none"
                  onChange={handleLevelFilterChange}
                  value={queryParameters.level === null ? "" : queryParameters.level}
                >
                  <option value="">Tất cả cấp độ</option>
                  {Object.keys(CourseLevel)
                    .filter((key) => isNaN(Number(key)))
                    .map((key) => (
                      <option key={key} value={CourseLevel[key as keyof typeof CourseLevel]}>
                        {key}
                      </option>
                    ))}
                </select>
              </div>

              {/* Course Type Filter */}
              <div className="min-w-[150px]">
                <label htmlFor="coursetype-filter" className="block text-sm font-medium text-gray-700 mb-1">Loại khóa học</label>
                <select
                  id="coursetype-filter"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none"
                  onChange={handleCourseTypeFilterChange}
                  value={queryParameters.courseType === null ? "" : queryParameters.courseType}
                >
                  <option value="">Tất cả loại</option>
                  <option value={CourseType.Public}>Công khai</option>
                  <option value={CourseType.Personal}>Cá nhân</option>
                </select>
              </div>

              {/* Create New Course Button */}
              <button
                onClick={() => navigate("/course-management/create")}
                className="flex items-center px-6 py-2 rounded-lg bg-pink-600 text-white shadow-md hover:bg-pink-700 transition-colors duration-200 text-sm font-semibold ml-auto"
              >
                <FaPlus className="mr-2" />
                Tạo Khóa học Mới
              </button>
            </div>
          </div>

          {/* Courses Table */}
          <div className="bg-white p-6 rounded-xl shadow-xl overflow-x-auto"> {/* Added overflow-x-auto for responsiveness */}
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-green-500 border-opacity-25"></div>
                <p className="ml-4 text-gray-700">Đang tải khóa học...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-10 text-gray-600">Không tìm thấy khóa học nào phù hợp với tiêu chí của bạn.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Tiêu đề</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cấp độ</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá (VND)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số học viên</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảng viên</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course.courseId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link to={`/course-detail/${course.courseId}`} className="text-blue-600 hover:underline">
                          {course.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{CourseLevel[course.level]}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${course.courseType === CourseType.Public ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}
                        `}>
                          {course.courseType === CourseType.Public ? 'Công khai' : 'Cá nhân'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{course.price.toLocaleString("vi-VN")}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${course.status === CourseStatus.Published ? 'bg-green-100 text-green-800' :
                            course.status === CourseStatus.Draft ? 'bg-blue-100 text-blue-800' :
                            course.status === CourseStatus.Archived ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}
                        `}>
                          {CourseStatus[course.status].toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{course.enrollmentsCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{course.instructorsCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(course.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Custom Pagination */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 rounded-lg shadow-inner">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Số mục trên trang:</span>
                  <select
                    value={pagination.pageSize}
                    onChange={handlePageSizeChange}
                    className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-green-500 focus:border-green-500 text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.current - 1)}
                    disabled={pagination.current === 1}
                    className={`p-2 rounded-full ${pagination.current === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'} transition-colors`}
                    aria-label="Trang trước"
                  >
                    <FaChevronLeft size={14} />
                  </button>
                  <span className="text-sm font-medium text-gray-800">
                    Trang {pagination.current} của {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.current + 1)}
                    disabled={pagination.current === totalPages}
                    className={`p-2 rounded-full ${pagination.current === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'} transition-colors`}
                    aria-label="Trang tiếp"
                  >
                    <FaChevronRight size={14} />
                  </button>
                </div>
                <span className="text-sm text-gray-700">
                  Tổng cộng: {pagination.total} khóa học
                </span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffCourseManagementPage;
