// src/pages/student/StudentCoursesPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import StudentSideBar from "../../components/sidebar/StudentSideBar";
import StudentHeader from "../../components/header/StudentHeader";
import CourseCard, {
  CourseTypeEnum,
  CourseStatusEnum,
} from "../../components/card/CourseCard";
import Pagination from "../../components/pagination/Pagination";
import {
  getCourses,
  CourseListDto,
  CourseStatus,
  CourseLevel,
  CourseType,
} from "../../services/courseService";
import { getMyEnrollments } from "../../services/enrollmentService";
import { useCourseRatings } from "../../hooks/useCourseRatings";

interface Course {
  id: string;
  title: string;
  level: string;
  price: number;
  thumbnail: string;
  courseType: CourseTypeEnum;
  status: CourseStatusEnum;
  description?: string;
  isEnrolled?: boolean; // Add this field to track enrollment status
}

const StudentCoursesPage: React.FC = () => {
  const navigate = useNavigate();

  // ---------- Filters ----------
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>(""); // empty = all

  // ---------- Pagination states ----------
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // ---------- Data ----------
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  // Get course ratings
  const courseIds = allCourses.map(course => course.id);
  const { ratings } = useCourseRatings(courseIds);

  // Fetch all courses and enrolled courses from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get all published courses with Public type only
        const queryParams = {
          pageNumber: 1,
          pageSize: 100, // Get more courses to filter from
          status: CourseStatus.Published,
          courseType: CourseType.Public, // Only show Public courses
        };

        const response = await getCourses(queryParams);
        
        // Get enrolled course IDs
        try {
          const enrollments = await getMyEnrollments();
          const enrolledIds = enrollments.map(enrollment => enrollment.courseId);
          setEnrolledCourseIds(enrolledIds);
        } catch (error) {
          console.error("Error fetching enrollments:", error);
          setEnrolledCourseIds([]);
        }
        
        // Convert to Course interface and mark enrolled courses
        const coursesWithDetails = response.items.map(course => ({
          id: course.courseId,
          title: course.title,
          level: getLevelString(course.level),
          price: course.price,
          thumbnail: course.thumbnailUrl || "",
          courseType: getCourseTypeString(course.courseType),
          status: getStatusString(course.status),
          description: course.description,
          isEnrolled: enrolledCourseIds.includes(course.courseId),
        }));
        
        setAllCourses(coursesWithDetails);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Không thể tải danh sách khóa học");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update enrollment status when enrolledCourseIds changes
  useEffect(() => {
    setAllCourses(prevCourses => 
      prevCourses.map(course => ({
        ...course,
        isEnrolled: enrolledCourseIds.includes(course.id)
      }))
    );
  }, [enrolledCourseIds]);

  // Helper functions to convert enums to strings
  const getLevelString = (level: CourseLevel): string => {
    const levelMap: { [key in CourseLevel]: string } = {
      [CourseLevel.N5]: "N5",
      [CourseLevel.N4]: "N4",
      [CourseLevel.N3]: "N3",
      [CourseLevel.N2]: "N2",
      [CourseLevel.N1]: "N1"
    };
    return levelMap[level] || "N5";
  };

  const getCourseTypeString = (courseType: number): CourseTypeEnum => {
    const typeMap: { [key: number]: CourseTypeEnum } = {
      0: "Personal",
      1: "Public"
    };
    return typeMap[courseType] || "Public";
  };

  const getStatusString = (status: CourseStatus): CourseStatusEnum => {
    const statusMap: { [key in CourseStatus]: CourseStatusEnum } = {
      [CourseStatus.Draft]: "Draft",
      [CourseStatus.Published]: "Published",
      [CourseStatus.Archived]: "Archived"
    };
    return statusMap[status] || "Published";
  };

  // Filter courses based on search term and selected level, excluding enrolled courses
  const filteredCourses = useMemo(() => {
    return allCourses.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = selectedLevel === "" || course.level === selectedLevel;
      
      // Only show courses that are NOT enrolled
      const isNotEnrolled = !course.isEnrolled;
      
      return matchesSearch && matchesLevel && isNotEnrolled;
    });
  }, [allCourses, searchTerm, selectedLevel]);

  // Pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  const handleResetFilter = () => {
    setSearchTerm("");
    setSelectedLevel("");
  };

  // Handle course click - since we only show non-enrolled courses, always navigate to course detail
  const handleCourseClick = (course: Course) => {
    // Navigate to course detail page
    navigate(`/student/course-detail/${course.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <StudentSideBar />
        <div className="flex-1 flex flex-col">
          <StudentHeader />
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-gray-600">Đang tải khóa học...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <StudentSideBar />
        <div className="flex-1 flex flex-col">
          <StudentHeader />
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-red-500 text-lg mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <StudentSideBar />
      <div className="flex-1 flex flex-col">
        <StudentHeader />
        
        {/* Header */}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Danh sách khóa học
          </h1>
          
          {/* Bộ lọc */}
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <input
              type="text"
              placeholder="Tìm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-green-400 w-full sm:w-64"
            />

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-green-400"
            >
              <option value="">Tất cả cấp độ</option>
              <option value="N5">N5</option>
              <option value="N4">N4</option>
              <option value="N3">N3</option>
              <option value="N2">N2</option>
              <option value="N1">N1</option>
            </select>

            <button
              onClick={handleResetFilter}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
            >
              Đặt lại
            </button>
          </div>

          {/* Course Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedCourses.length > 0 ? (
              paginatedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  thumbnail={course.thumbnail}
                  title={course.title}
                  description={course.description}
                  level={course.level}
                  price={course.price}
                  courseType={course.courseType}
                  buttonText="Đăng ký"
                  onClick={() => handleCourseClick(course)}
                  averageRating={ratings?.[course.id]}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">
                  Không tìm thấy khóa học nào phù hợp bộ lọc.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredCourses.length > 0 && (
            <Pagination
              page={page}
              pageSize={pageSize}
              total={filteredCourses.length}
              onPageChange={(p) => setPage(Math.max(1, p))}
              onPageSizeChange={(s) => setPageSize(s)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCoursesPage;