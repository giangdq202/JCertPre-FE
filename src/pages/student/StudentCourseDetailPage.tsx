import React, { useState, useEffect } from 'react';
import StudentSideBar from '../../components/sidebar/StudentSideBar';
import StudentHeader from '../../components/header/StudentHeader';
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import {
    getCourseById,
    getCourses,
    CourseDto,
    CourseLevel,
    CourseStatus,
    CourseListDto
} from '../../services/courseService';
import {
    enrollSelfInCourse,
    checkEnrollmentStatus,
    // unenrollFromCourse // Không cần import nữa nếu bỏ chức năng hủy ghi danh
} from '../../services/enrollmentService';
import paths from "../../routes/path";

// Mock data cho các phần khác (hiện tại vẫn giữ nguyên tĩnh)
const mockSessions = [
    {
        session: "Lớp tổng ôn Ngữ pháp N3",
        instructor: "Yamamoto Keiko",
        date: "10/05/2025",
        time: "10:00-11:30 JST",
        duration: "1.5 giờ",
        level: "N3",
        spots: "6/15"
    },
    {
        session: "Thực hành Nói: Hàng ngày",
        instructor: "Saito Akira",
        date: "10/05/2025",
        time: "10:00-11:00 JST",
        duration: "1 giờ",
        level: "N3",
        spots: "7/10"
    },
    {
        session: "Hội thảo Nhận diện Hán tự",
        instructor: "Tanaka Yoshiko",
        date: "15/05/2025",
        time: "13:00-15:00 JST",
        duration: "2 giờ",
        level: "N3",
        spots: "9/20"
    },
    {
        session: "Thi thử và Ôn tập JLPT N3",
        instructor: "Watanabe Hanako",
        date: "20/05/2025",
        time: "09:00-13:00 JST",
        duration: "4 giờ",
        level: "N3",
        spots: "18/30"
    }
];

const StudentCourseDetailPage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [course, setCourse] = useState<CourseDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const [similarCourses, setSimilarCourses] = useState<CourseListDto[]>([]);
    const [isLoadingSimilarCourses, setIsLoadingSimilarCourses] = useState(true);

    const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
    const [isUserEnrolled, setIsUserEnrolled] = useState<boolean | null>(null);

    useEffect(() => {
        const fetchCourseDetailsAndEnrollmentStatus = async () => {
            if (!courseId) {
                setError("Không tìm thấy ID khóa học.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);

            try {
                const fetchedCourse = await getCourseById(courseId);
                setCourse(fetchedCourse);

                const enrollmentStatusResult = await checkEnrollmentStatus(courseId);
                setIsUserEnrolled(enrollmentStatusResult.isEnrolled);

            } catch (err: any) {
                console.error("Lỗi khi tải chi tiết khóa học hoặc kiểm tra trạng thái ghi danh:", err);
                setError("Không thể tải chi tiết khóa học hoặc kiểm tra trạng thái ghi danh. Vui lòng thử lại sau.");
                if (err.response?.status === 401) {
                    toast.error("Bạn cần đăng nhập để xem chi tiết khóa học và trạng thái ghi danh.");
                    navigate(paths.login);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourseDetailsAndEnrollmentStatus();
    }, [courseId, navigate]);

    useEffect(() => {
        const fetchSimilarCourses = async () => {
            setIsLoadingSimilarCourses(true);
            try {
                const response = await getCourses({
                    pageNumber: 1,
                    pageSize: 6,
                    status: CourseStatus.Published,
                });
                const filteredCourses = response.items.filter(c => c.courseId !== courseId);
                setSimilarCourses(filteredCourses);
            } catch (err) {
                console.error("Lỗi khi tải các khóa học tương tự:", err);
            } finally {
                setIsLoadingSimilarCourses(false);
            }
        };

        if (!isLoading) {
            fetchSimilarCourses();
        }
    }, [isLoading, courseId]);

    const handleEnrollCourse = async () => {
        if (!courseId) {
            toast.error("Không có ID khóa học để đăng ký.");
            return;
        }

        setIsEnrolling(true);
        try {
            const result = await enrollSelfInCourse({ courseId });
            toast.success(`Đã đăng ký thành công khóa học: ${result.courseTitle}`);
            setIsUserEnrolled(true); // Cập nhật trạng thái sau khi ghi danh thành công
            // Không navigate ngay sau khi đăng ký thành công để người dùng thấy trạng thái "Đã đăng ký"
            // và có thể chọn "Đi đến khóa học của bạn"
        } catch (err: any) {
            console.error("Lỗi khi đăng ký khóa học:", err);
            if (err.response && err.response.data && err.response.data.message) {
                toast.error(`Đăng ký thất bại: ${err.response.data.message}`);
            } else {
                toast.error("Đã xảy ra lỗi khi đăng ký khóa học. Vui lòng thử lại.");
            }
        } finally {
            setIsEnrolling(false);
        }
    };

    // Hiển thị trạng thái tải cho khóa học chính
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 font-inter flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 border-green-500 border-opacity-25"></div>
                    <p className="mt-4 text-gray-600">Đang tải chi tiết khóa học...</p>
                </div>
            </div>
        );
    }

    // Hiển thị lỗi nếu có vấn đề khi tải khóa học chính
    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 font-inter flex items-center justify-center">
                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Lỗi</h2>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <button
                        onClick={() => navigate(paths.student_home)}
                        className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    // Hiển thị nếu không tìm thấy khóa học chính
    if (!course) {
        return (
            <div className="min-h-screen bg-gray-100 font-inter flex items-center justify-center">
                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Không tìm thấy khóa học</h2>
                    <p className="text-gray-700 mb-6">Khóa học bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                    <button
                        onClick={() => navigate(paths.student_home)}
                        className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Xem tất cả khóa học
                    </button>
                </div>
            </div>
        );
    }

    // Chuẩn bị dữ liệu hiển thị từ khóa học đã tải
    const courseOverview = [
        { label: "Số lượng bài học", value: `${course.lessonsCount}` },
        { label: "Số buổi livestream", value: `${course.livestreamsCount}` },
        { label: "Số lượt đăng ký", value: `${course.enrollmentsCount}` },
    ];
    const mainInstructor = course.instructors.length > 0 ? course.instructors[0] : null;

    return (
        <div className="min-h-screen bg-gray-100 font-inter flex flex-col lg:flex-row">
            <StudentSideBar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <StudentHeader />
                <main className="flex-1 p-6 overflow-y-auto mt-16 lg:mt-0">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Chi tiết khóa học</h1>
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                        <div className="text-sm text-gray-500 mb-6">
                            <Link to={paths.student_home} className="text-green-600 hover:underline">Tất cả Khóa học</Link>
                            <span className="mx-2">&gt;</span>
                            <span>{course.title}</span>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="lg:w-2/3">
                                <img
                                    src={course.thumbnailUrl || "https://placehold.co/1200x500/A8A29E/ffffff?text=Course+Banner"}
                                    alt={course.title}
                                    className="w-full rounded-xl shadow-md mb-6 object-cover h-64"
                                />
                                <div className="mb-6">
                                    <h2 className="text-3xl font-bold text-gray-800 mb-4">{course.title}</h2>
                                    <p className="text-gray-700 leading-relaxed mb-4">{course.description}</p>
                                    {mainInstructor && (
                                        <div className="flex items-center gap-3 mt-6">
                                            <img src="https://placehold.co/40x40/cccccc/ffffff?text=GV" alt="Instructor Avatar" className="w-10 h-10 rounded-full object-cover border" />
                                            <div>
                                                <div className="font-medium text-gray-800">{mainInstructor.fullName}</div>
                                                <div className="text-sm text-gray-500">Level: {CourseLevel[course.level]}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-6 text-center text-gray-600 border-t border-b border-gray-200 py-4">
                                    {courseOverview.map((item, index) => (
                                        <div key={index}>
                                            <div className="text-2xl font-bold text-green-600">{item.value}</div>
                                            <div className="text-sm">{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="lg:w-1/3">
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-md sticky top-6">
                                    <div className="text-center mb-6">
                                        {/* Điều kiện hiển thị giá / Đã đăng ký */}
                                        {isUserEnrolled ? (
                                            <span className="text-4xl font-extrabold text-blue-700">
                                                Đã đăng ký
                                            </span>
                                        ) : (
                                            <span className="text-4xl font-extrabold text-green-700">
                                                {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString("vi-VN")} VND`}
                                            </span>
                                        )}
                                    </div>

                                    {/* Nút Đăng ký/Đi đến khóa học */}
                                    {isUserEnrolled === null ? (
                                        <button
                                            disabled={true}
                                            className="w-full bg-gray-400 text-white font-bold py-3 rounded-lg opacity-75 cursor-not-allowed shadow-lg mb-4"
                                        >
                                            Đang kiểm tra trạng thái...
                                        </button>
                                    ) : isUserEnrolled ? (
                                        <button
                                            onClick={() => courseId && navigate(paths.learn_course.replace(':courseId', courseId))}
                                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg mb-4"
                                        >
                                            Đi đến khóa học của bạn
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleEnrollCourse}
                                            disabled={isEnrolling}
                                            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isEnrolling ? 'Đang đăng ký...' : 'Đăng ký ngay'}
                                        </button>
                                    )}

                                    {/* Loại bỏ nút "Hủy ghi danh" */}
                                    {/* {isUserEnrolled && (
                                        <button
                                            onClick={handleUnenrollCourse}
                                            disabled={isEnrolling}
                                            className="w-full bg-red-500 text-white font-bold py-2 rounded-lg hover:bg-red-600 transition-colors shadow-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isEnrolling ? 'Đang hủy ghi danh...' : 'Hủy ghi danh'}
                                        </button>
                                    )} */}

                                    <div className="mt-6 text-sm text-gray-600 space-y-3">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            <span>Đội ngũ hỗ trợ tận tâm</span>
                                        </div>
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            <span>Truy cập trọn đời</span>
                                        </div>
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-6 6M10 14l6-6M4 20h16M7 4h10"></path></svg>
                                            <span>Chứng chỉ hoàn thành khóa học</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Phần Các khóa học có sẵn khác (Khóa học tương tự) */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Các khóa học có sẵn khác</h3>
                            <Link to={paths.student_home} className="text-green-600 hover:underline">Xem tất cả</Link>
                        </div>
                        {isLoadingSimilarCourses ? (
                            <div className="flex justify-center items-center h-24 bg-white rounded-xl shadow-lg">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-4 border-green-500 border-opacity-25"></div>
                                <p className="ml-4 text-gray-600">Đang tải các khóa học khác...</p>
                            </div>
                        ) : similarCourses.length === 0 ? (
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <p className="text-gray-600 text-center">Không tìm thấy khóa học nào khác có sẵn.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {similarCourses.map((courseItem) => (
                                    <Link to={`/student/course-detail/${courseItem.courseId}`} key={courseItem.courseId} className="block">
                                        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-200 hover:scale-[1.02]">
                                            <img
                                                src={courseItem.thumbnailUrl || "https://placehold.co/400x200/E0F2F1/004D40?text=Course+Thumbnail"}
                                                alt={courseItem.title}
                                                className="w-full h-40 object-cover"
                                            />
                                            <div className="p-6">
                                                <h4 className="text-lg font-semibold text-gray-800 mb-2">{courseItem.title}</h4>
                                                <p className="text-gray-600 text-sm mb-4 truncate">{courseItem.description}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xl font-bold text-green-700">
                                                        {courseItem.price === 0 ? "Miễn phí" : `${courseItem.price.toLocaleString("vi-VN")} VND`}
                                                    </span>
                                                    <button className="bg-green-50 text-green-700 py-2 px-4 rounded-lg hover:bg-green-100 transition-colors">
                                                        Xem khóa học
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Phần Lịch học sắp tới - Giữ nguyên mock data */}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Lịch học sắp tới</h3>
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="grid grid-cols-7 font-semibold text-gray-700 border-b border-gray-200 pb-4 mb-4">
                                    <div className="col-span-2">Session</div>
                                    <div>Giảng viên</div>
                                    <div className="col-span-2">Ngày & Thời gian</div>
                                    <div>Thời lượng</div>
                                    <div>Cấp độ</div>
                                    <div></div>
                                </div>
                                {mockSessions.map((session, index) => (
                                    <div key={index} className="grid grid-cols-7 items-center py-4 border-b border-gray-100 last:border-b-0">
                                        <div className="col-span-2 text-gray-900 font-medium">{session.session}</div>
                                        <div className="text-gray-600">{session.instructor}</div>
                                        <div className="col-span-2 text-gray-600">
                                            <p>{session.date}</p>
                                            <p className="text-sm font-semibold text-green-600">{session.time}</p>
                                        </div>
                                        <div className="text-gray-600">{session.duration}</div>
                                        <div className="text-gray-600">{session.level}</div>
                                        <div className="text-right">
                                            {/* Nút đăng ký cho từng session - hiện tại vẫn mock */}
                                            <button className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm">
                                                Đăng ký ({session.spots})
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Phần Tư vấn */}
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Bạn cần trợ giúp chọn khóa học phù hợp?</h3>
                        <p className="text-gray-600 mb-6">
                            Hãy để chúng tôi giúp bạn tìm khóa học phù hợp nhất dựa trên mục tiêu và trình độ hiện tại của bạn.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <button className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md">
                                Chat với Tư vấn viên
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StudentCourseDetailPage;