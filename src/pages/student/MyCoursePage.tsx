// src/pages/student/MyCoursePage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import StudentSideBar from "../../components/sidebar/StudentSideBar";
import StudentHeader from "../../components/header/StudentHeader";
import CourseCard, {
  CourseTypeEnum,
  CourseStatusEnum,
} from "../../components/card/CourseCard";
import Pagination from "../../components/pagination/Pagination";
import { getMyEnrollments, EnrollmentDetailDto } from "../../services/enrollmentService";
import { getCourseById, CourseDto } from "../../services/courseService";

interface Course {
  id: string;
  title: string;
  level: string;
  price: number;
  thumbnail: string;
  courseType: CourseTypeEnum;
  status: CourseStatusEnum;
  description?: string;
  progress?: number; // my courses only
}

const MyCoursePage: React.FC = () => {
  const navigate = useNavigate();

  // ---------- Filters ----------
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>(""); // empty = all

  // ---------- Pagination states ----------
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // ---------- Data ----------
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch enrolled courses from API
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get enrollments
        const enrollments = await getMyEnrollments();
        
        // Fetch course details for each enrollment
        const coursesWithDetails = await Promise.all(
          enrollments.map(async (enrollment) => {
            try {
              const courseDetails = await getCourseById(enrollment.courseId);
              
              return {
                id: enrollment.courseId,
                title: courseDetails.title,
                level: getLevelString(courseDetails.level),
                price: courseDetails.price,
                thumbnail: courseDetails.thumbnailUrl || "",
                courseType: getCourseTypeString(courseDetails.courseType),
                status: getStatusString(courseDetails.status),
                description: courseDetails.description,
                progress: 0, // TODO: Get actual progress from API if available
              };
            } catch (error) {
              console.error(`Error fetching course details for ${enrollment.courseId}:`, error);
              // Return basic info from enrollment if course fetch fails
              return {
                id: enrollment.courseId,
                title: enrollment.courseTitle || "Unknown Course",
                level: "N5", // Default level
                price: 0,
                thumbnail: "",
                courseType: "Online" as CourseTypeEnum,
                status: "Published" as CourseStatusEnum,
                description: enrollment.courseDescription || "",
                progress: 0,
              };
            }
          })
        );
        
        setMyCourses(coursesWithDetails);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        setError("Không thể tải danh sách khóa học đã đăng ký");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  // Helper functions to convert enums to strings
  const getLevelString = (level: number): string => {
    const levelMap: { [key: number]: string } = {
      0: "N5",
      1: "N4", 
      2: "N3",
      3: "N2",
      4: "N1"
    };
    return levelMap[level] || "N5";
  };

  const getCourseTypeString = (courseType: number): CourseTypeEnum => {
    const typeMap: { [key: number]: CourseTypeEnum } = {
      0: "Online",
      1: "Offline",
      2: "Hybrid"
    };
    return typeMap[courseType] || "Online";
  };

  const getStatusString = (status: number): CourseStatusEnum => {
    const statusMap: { [key: number]: CourseStatusEnum } = {
      0: "Draft",
      1: "Published",
      2: "Archived", 
      3: "Suspended"
    };
    return statusMap[status] || "Published";
  };

  // Filter courses based on search term and selected level
  const filteredCourses = useMemo(() => {
    return myCourses.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = selectedLevel === "" || course.level === selectedLevel;
      
      return matchesSearch && matchesLevel;
    });
  }, [myCourses, searchTerm, selectedLevel]);

  // Pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  const handleResetFilter = () => {
    setSearchTerm("");
    setSelectedLevel("");
  };

  // Handle course click - navigate to learn course page
  const handleCourseClick = (course: Course) => {
    navigate(`/learn-course/${course.id}`);
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
            Khóa học của tôi
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
                  progress={course.progress}
                  courseType={course.courseType}
                  buttonText="Tiếp tục học"
                  onClick={() => handleCourseClick(course)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchTerm || selectedLevel 
                    ? "Không tìm thấy khóa học nào phù hợp bộ lọc."
                    : "Bạn chưa đăng ký khóa học nào."}
                </p>
                {!searchTerm && !selectedLevel && (
                  <button
                    onClick={() => navigate("/student/courses")}
                    className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Khám phá khóa học
                  </button>
                )}
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

export default MyCoursePage; 