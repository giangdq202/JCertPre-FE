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

interface Course {
  id: number;
  title: string;
  level: string;
  price: number;
  thumbnail: string;
  courseType: CourseTypeEnum;
  status: CourseStatusEnum;
  description?: string;
  progress?: number; // my courses only
}

const StudentCoursesPage: React.FC = () => {
  const navigate = useNavigate();

  // ---------- Filters ----------
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>(""); // empty = all
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // ---------- Pagination states (My Courses) ----------
  const [myPage, setMyPage] = useState<number>(1);
  const [myPageSize, setMyPageSize] = useState<number>(10);

  // ---------- Pagination states (All Courses) ----------
  const [allPage, setAllPage] = useState<number>(1);
  const [allPageSize, setAllPageSize] = useState<number>(10);

  // ---------- Data ----------
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  // Mock data load
  useEffect(() => {
    setMyCourses([
      {
        id: 1,
        title: "Khóa học JLPT N5 Cơ bản",
        level: "N5",
        price: 500000,
        thumbnail:
          "https://dungmori.com/cdn/course/default/1690872770_61725_e6c174.png",
        progress: 60,
        description: "Bắt đầu hành trình JLPT với nền tảng N5.",
        courseType: "Online",
        status: "Published",
      },
      {
        id: 2,
        title: "Luyện đề JLPT N4",
        level: "N4",
        price: 700000,
        thumbnail:
          "https://akira.edu.vn/wp-content/uploads/2017/09/featured-image-de-thi-thu-n4.jpg",
        progress: 30,
        description: "Thực hành đề thi thử N4 sát cấu trúc JLPT.",
        courseType: "Online",
        status: "Published",
      },
      {
        id: 5,
        title: "Ôn tập JLPT N5 trực tiếp cuối tuần",
        level: "N5",
        price: 0,
        thumbnail:
          "https://i.ytimg.com/vi/Fzk4HxCaVyY/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLC20nZ0MsBsIs82oHbhaTk1G0gHAQ",
        progress: 10,
        description: "Lớp học trực tiếp cuối tuần tại trung tâm.",
        courseType: "Offline",
        status: "Published",
      },
    ]);

    setAllCourses([
      {
        id: 3,
        title: "Khóa học JLPT N3 Nâng cao",
        level: "N3",
        price: 900000,
        thumbnail: "https://i.ytimg.com/vi/whSOf7vRZLE/maxresdefault.jpg",
        description: "Khóa học nâng cao dành cho học viên muốn chinh phục N3.",
        courseType: "Online",
        status: "Published",
      },
      {
        id: 4,
        title: "Luyện nghe JLPT N2",
        level: "N2",
        price: 1200000,
        thumbnail:
          "https://i.ytimg.com/vi/LGmPRE0zkGk/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCh0exQF3inOhHxyW8OGG-VtiPmlw",
        description: "Học kỹ năng nghe hiểu chuyên sâu cho kỳ thi JLPT N2.",
        courseType: "Hybrid",
        status: "Draft",
      },
      {
        id: 6,
        title: "Workshop Kanji N3 tại lớp",
        level: "N3",
        price: 0,
        thumbnail:
          "https://kosei.vn/Files/235/download/hoc-kanji-n3/KanjiN3-12.png",
        description: "Buổi workshop offline ôn Kanji quan trọng.",
        courseType: "Offline",
        status: "Published",
      },
      {
        id: 7,
        title: "Luyện đề JLPT N2",
        level: "N2",
        price: 300000,
        thumbnail:
          "https://tailieutiengnhat.net/wp-content/uploads/2020/07/de-thi-jlpt-n2.jpg",
        description:
          "Bộ đề luyện thi JLPT N2 giúp bạn ôn tập và củng cố kiến thức hiệu quả trước kỳ thi chính thức.",
        courseType: "Online",
        status: "Archived",
      },
      {
        id: 8,
        title: "Khóa học JLPT N1",
        level: "N1",
        price: 1500000,
        thumbnail:
          "https://dungmori.com/cdn/ckeditor/images/%C4%90%E1%BB%81%20thi%20b%E1%BA%A3o%20s%C6%A1n/N4-3/hd%20hoc%20n1%20copy.png",
        description:
          "Khóa học JLPT N1 chuyên sâu, cung cấp đầy đủ kiến thức và kỹ năng cần thiết để chinh phục cấp độ cao nhất.",
        courseType: "Online",
        status: "Suspended",
      },
    ]);
  }, []);

  // ---------- Filtering logic (applies to All Courses only) ----------
  const filteredAllCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return allCourses.filter((c) => {
      const matchTerm =
        !term ||
        c.title.toLowerCase().includes(term) ||
        (c.description?.toLowerCase().includes(term) ?? false);

      const matchLevel = !selectedLevel || c.level === selectedLevel;
      const matchType = !selectedType || c.courseType === selectedType;
      const matchStatus = !selectedStatus || c.status === selectedStatus;

      return matchTerm && matchLevel && matchType && matchStatus;
    });
  }, [allCourses, searchTerm, selectedLevel, selectedType, selectedStatus]);

  // ---------- Filtering logic (My Courses) ----------
  const filteredMyCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return myCourses.filter((c) => {
      const matchTerm =
        !term ||
        c.title.toLowerCase().includes(term) ||
        (c.description?.toLowerCase().includes(term) ?? false);

      const matchLevel = !selectedLevel || c.level === selectedLevel;
      const matchType = !selectedType || c.courseType === selectedType;
      const matchStatus = !selectedStatus || c.status === selectedStatus;

      return matchTerm && matchLevel && matchType && matchStatus;
    });
  }, [myCourses, searchTerm, selectedLevel, selectedType, selectedStatus]);

  // ---------- Paginated slices ----------
  const paginatedMy = useMemo(() => {
    const start = (myPage - 1) * myPageSize;
    return filteredMyCourses.slice(start, start + myPageSize);
  }, [filteredMyCourses, myPage, myPageSize]);

  const paginatedAll = useMemo(() => {
    const start = (allPage - 1) * allPageSize;
    return filteredAllCourses.slice(start, start + allPageSize);
  }, [filteredAllCourses, allPage, allPageSize]);

  // Reset page when filters change
  useEffect(() => {
    setMyPage(1);
    setAllPage(1);
  }, [searchTerm, selectedLevel, selectedType, selectedStatus]);

  const handleResetFilter = () => {
    setSearchTerm("");
    setSelectedLevel("");
    setSelectedType("");
    setSelectedStatus("");
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <StudentSideBar />
      <div className="flex-1 flex flex-col">
        <StudentHeader />
        {/* Bộ lọc */}
        <div className="flex flex-wrap gap-4 items-center mt-6 ml-5">
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

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-green-400"
          >
            <option value="">Tất cả loại</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-green-400"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Draft">Nháp</option>
            <option value="Published">Đang xuất bản</option>
            <option value="Archived">Lưu trữ</option>
            <option value="Suspended">Tạm ngưng</option>
          </select>

          <button
            onClick={handleResetFilter}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
          >
            Đặt lại
          </button>
        </div>

        <div className="p-6 space-y-16">
          {/* ===== Khóa học của tôi ===== */}
          <section>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Khóa học của tôi
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedMy.length > 0 ? (
                paginatedMy.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    thumbnail={course.thumbnail}
                    title={course.title}
                    level={course.level}
                    progress={course.progress}
                    description={course.description}
                    price={course.price}
                    courseType={course.courseType}
                    buttonText="Tiếp tục học"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  />
                ))
              ) : (
                <p className="text-gray-500">
                  Không có khóa học nào phù hợp bộ lọc.
                </p>
              )}
            </div>

            {/* Pagination My Courses */}
            <Pagination
              page={myPage}
              pageSize={myPageSize}
              total={filteredMyCourses.length}
              onPageChange={(p) => setMyPage(Math.max(1, p))}
              onPageSizeChange={(s) => setMyPageSize(s)}
            />
          </section>

          {/* ===== Danh sách tất cả khóa học ===== */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Danh sách khóa học
              </h2>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedAll.length > 0 ? (
                paginatedAll.map((course) => (
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
                    onClick={() => navigate(`/courses/${course.id}`)}
                  />
                ))
              ) : (
                <p className="text-gray-500">
                  Không tìm thấy khóa học nào phù hợp bộ lọc.
                </p>
              )}
            </div>

            {/* Pagination All Courses */}
            <Pagination
              page={allPage}
              pageSize={allPageSize}
              total={filteredAllCourses.length}
              onPageChange={(p) => setAllPage(Math.max(1, p))}
              onPageSizeChange={(s) => setAllPageSize(s)}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudentCoursesPage;
