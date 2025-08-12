import React, { useState, useEffect } from 'react';
import StudentSideBar from '../../components/sidebar/StudentSideBar';
import StudentHeader from '../../components/header/StudentHeader';
import { Link, useNavigate, useParams } from "react-router-dom";
import { useNotification } from '../../components/notifications';
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
import { useLessonProgress } from '../../hooks/useLessonProgress';
import { useAuth } from '../../auth/AuthContext';
import CertificateGenerator from '../../components/CertificateGenerator';
import { livestreamApi, LivestreamDto, LivestreamStatus } from '../../services/livestreamService';
import paths from "../../routes/path";
import dayjs from 'dayjs';
import { FaPlay, FaClock, FaCalendarAlt, FaUser, FaVideo } from 'react-icons/fa';
import { HiOutlineAcademicCap, HiOutlineClock, HiOutlineCalendar } from 'react-icons/hi2';

const StudentCourseDetailPage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { success, error: showError, warning } = useNotification();
    const [course, setCourse] = useState<CourseDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { getCourseCompletionRate } = useLessonProgress();
    const { userInfo } = useAuth();

    const [similarCourses, setSimilarCourses] = useState<CourseListDto[]>([]);
    const [isLoadingSimilarCourses, setIsLoadingSimilarCourses] = useState(true);

    const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
    const [isUserEnrolled, setIsUserEnrolled] = useState<boolean | null>(null);
    const [completionRate, setCompletionRate] = useState<number>(0);
    const [isLoadingCompletion, setIsLoadingCompletion] = useState(false);

    // Livestream states
    const [livestreams, setLivestreams] = useState<LivestreamDto[]>([]);
    const [isLoadingLivestreams, setIsLoadingLivestreams] = useState(false);

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
                    showError("Chưa đăng nhập", "Bạn cần đăng nhập để xem chi tiết khóa học và trạng thái ghi danh.");
                    navigate(paths.login);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourseDetailsAndEnrollmentStatus();
    }, [courseId, navigate]);

    // Fetch completion rate when user is enrolled
    useEffect(() => {
        const fetchCompletionRate = async () => {
            if (!courseId || !isUserEnrolled) return;
            
            setIsLoadingCompletion(true);
            try {
                const rate = await getCourseCompletionRate(courseId);
                setCompletionRate(rate);
            } catch (error) {
                console.error('Error fetching completion rate:', error);
                setCompletionRate(0);
            } finally {
                setIsLoadingCompletion(false);
            }
        };

        fetchCompletionRate();
    }, [courseId, isUserEnrolled, getCourseCompletionRate]);

    // Fetch livestreams for this course
    useEffect(() => {
        const fetchLivestreams = async () => {
            if (!courseId) return;
            
            setIsLoadingLivestreams(true);
            try {
                const livestreamsData = await livestreamApi.getLivestreamsByCourse(courseId);
                setLivestreams(livestreamsData);
            } catch (error) {
                console.error("Error fetching livestreams:", error);
                setLivestreams([]);
            } finally {
                setIsLoadingLivestreams(false);
            }
        };

        if (!isLoading) {
            fetchLivestreams();
        }
    }, [courseId, isLoading]);

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
            showError("Lỗi đăng ký", "Không có ID khóa học để đăng ký.");
            return;
        }

        setIsEnrolling(true);
        try {
            const result = await enrollSelfInCourse({ courseId });
            success("Đăng ký thành công!", `Đã đăng ký khóa học: ${result.courseTitle}`);
            setIsUserEnrolled(true); // Cập nhật trạng thái sau khi ghi danh thành công
            // Không navigate ngay sau khi đăng ký thành công để người dùng thấy trạng thái "Đã đăng ký"
            // và có thể chọn "Đi đến khóa học của bạn"
        } catch (err: any) {
            console.error("Lỗi khi đăng ký khóa học:", err);
            if (err.response && err.response.data && err.response.data.message) {
                showError("Đăng ký thất bại", err.response.data.message);
            } else {
                showError("Lỗi đăng ký", "Đã xảy ra lỗi khi đăng ký khóa học. Vui lòng thử lại.");
            }
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleJoinLivestream = async (livestream: LivestreamDto) => {
        const now = dayjs();
        const livestreamStart = dayjs(livestream.scheduledDateTime);
        const timeUntilStart = livestreamStart.diff(now, 'minute');

        if (timeUntilStart > 15) {
            warning("Chưa đến giờ", `Buổi livestream sẽ bắt đầu sau ${timeUntilStart} phút. Bạn chỉ có thể tham gia 15 phút trước khi bắt đầu.`);
            return;
        }

        if (timeUntilStart < -livestream.durationMinutes) {
            showError("Livestream đã kết thúc", "Buổi livestream này đã kết thúc.");
            return;
        }

        try {
            // Check if user can join
            const canJoin = await livestreamApi.canJoinLivestream(livestream.livestreamId, userInfo?.id || '');
            
            if (!canJoin) {
                showError("Không có quyền truy cập", "Bạn không có quyền tham gia buổi livestream này.");
                return;
            }

            // Generate join token
            const joinData = await livestreamApi.generateJoinToken(livestream.livestreamId, userInfo?.id || '');
            
            // Navigate to livestream room
            navigate(paths.student_livestream.replace(':livestreamId', livestream.livestreamId), {
                state: {
                    livestreamId: livestream.livestreamId,
                    roomName: joinData.roomName,
                    token: joinData.token,
                    title: joinData.title,
                    scheduledDateTime: joinData.scheduledDateTime,
                    description: joinData.description,
                    durationMinutes: joinData.durationMinutes
                }
            });
        } catch (error: any) {
            console.error("Error joining livestream:", error);
            showError("Lỗi tham gia livestream", "Không thể tham gia buổi livestream. Vui lòng thử lại.");
        }
    };

    const getLivestreamStatus = (livestream: LivestreamDto) => {
        const now = dayjs();
        const livestreamStart = dayjs(livestream.scheduledDateTime);
        const livestreamEnd = dayjs(livestream.endDateTime);
        const timeUntilStart = livestreamStart.diff(now, 'minute');

        if (livestream.status === LivestreamStatus.COMPLETED) {
            return { status: 'completed', text: 'Đã kết thúc', color: 'text-gray-500' };
        }

        if (livestream.status === LivestreamStatus.LIVE) {
            return { status: 'live', text: 'Đang diễn ra', color: 'text-red-600' };
        }

        if (timeUntilStart <= 0 && timeUntilStart > -livestream.durationMinutes) {
            return { status: 'live', text: 'Đang diễn ra', color: 'text-red-600' };
        }

        if (timeUntilStart <= 15 && timeUntilStart > 0) {
            return { status: 'starting', text: 'Sắp bắt đầu', color: 'text-orange-600' };
        }

        return { status: 'scheduled', text: 'Đã lên lịch', color: 'text-green-600' };
    };

    const canJoinLivestream = (livestream: LivestreamDto) => {
        const now = dayjs();
        const livestreamStart = dayjs(livestream.scheduledDateTime);
        const timeUntilStart = livestreamStart.diff(now, 'minute');
        
        return timeUntilStart <= 15 && timeUntilStart > -livestream.durationMinutes && livestream.status !== LivestreamStatus.COMPLETED;
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
        { label: "Số buổi livestream", value: `${livestreams.length}` },
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
                                        <div className="space-y-4">
                                            {completionRate >= 100 ? (
                                                <>
                                                    <div className="text-center py-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <div className="text-green-600 font-semibold mb-2">
                                                            🎉 Đã hoàn thành khóa học!
                                                        </div>
                                                        <div className="text-sm text-green-600">
                                                            Hoàn thành {completionRate}%
                                                        </div>
                                                    </div>
                                                    <CertificateGenerator 
                                                        certificateData={{
                                                            studentName: userInfo?.fullName || "Học viên",
                                                            courseTitle: course.title,
                                                            completionDate: new Date().toLocaleDateString('vi-VN'),
                                                            courseLevel: CourseLevel[course.level],
                                                            instructorName: course.instructors[0]?.fullName,
                                                        }}
                                                        onDownload={() => {
                                                            console.log('Certificate downloaded for course:', course.title);
                                                        }}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => courseId && navigate(paths.learn_course.replace(':courseId', courseId))}
                                                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                                                    >
                                                        Đi đến khóa học của bạn
                                                    </button>
                                                    {!isLoadingCompletion && (
                                                        <div className="text-center py-2">
                                                            <div className="text-sm text-gray-600 mb-1">
                                                                Tiến độ học tập
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                                    style={{ width: `${completionRate}%` }}
                                                                ></div>
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {completionRate}% hoàn thành
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleEnrollCourse}
                                            disabled={isEnrolling}
                                            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isEnrolling ? 'Đang đăng ký...' : 'Đăng ký ngay'}
                                        </button>
                                    )}

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
                    

                    {/* Phần Lịch học sắp tới - Real data */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <FaVideo className="text-2xl text-blue-600" />
                            <h3 className="text-xl font-bold text-gray-800">Lịch livestream sắp tới</h3>
                        </div>
                        
                        {isLoadingLivestreams ? (
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-4 border-green-500 border-opacity-25"></div>
                                    <p className="ml-4 text-gray-600">Đang tải lịch livestream...</p>
                                </div>
                            </div>
                        ) : livestreams.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                                <FaVideo className="text-4xl text-gray-400 mx-auto mb-4" />
                                <h4 className="text-lg font-semibold text-gray-700 mb-2">Chưa có livestream nào</h4>
                                <p className="text-gray-500">Khóa học này chưa có lịch livestream nào được lên kế hoạch.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-6 font-semibold text-gray-700 border-b border-gray-200 pb-4 mb-4 gap-4">
                                        <div className="lg:col-span-2">Buổi học</div>
                                        <div>Trạng thái</div>
                                        <div>Ngày & Thời gian</div>
                                        <div>Thời lượng</div>
                                        <div></div>
                                    </div>
                                    
                                    {livestreams.map((livestream) => {
                                        const statusInfo = getLivestreamStatus(livestream);
                                        const canJoin = canJoinLivestream(livestream);
                                        
                                        return (
                                            <div key={livestream.livestreamId} className="grid grid-cols-1 lg:grid-cols-6 items-center py-4 border-b border-gray-100 last:border-b-0 gap-4">
                                                <div className="lg:col-span-2">
                                                    <div className="text-gray-900 font-medium">{livestream.description || 'Buổi học trực tuyến'}</div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                        <FaUser className="text-xs" />
                                                        <span>Giảng viên</span>
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                        {statusInfo.text}
                                                    </span>
                                                </div>
                                                
                                                <div className="text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <FaCalendarAlt className="text-sm" />
                                                        <span>{dayjs(livestream.scheduledDateTime).format('DD/MM/YYYY')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <FaClock className="text-sm" />
                                                        <span className="font-semibold text-green-600">
                                                            {dayjs(livestream.scheduledDateTime).format('HH:mm')}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <HiOutlineClock className="text-sm" />
                                                        <span>{livestream.durationMinutes} phút</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-right">
                                                    {canJoin ? (
                                                        <button
                                                            onClick={() => handleJoinLivestream(livestream)}
                                                            className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center gap-2"
                                                        >
                                                            <FaPlay className="text-xs" />
                                                            Tham gia
                                                        </button>
                                                    ) : statusInfo.status === 'completed' ? (
                                                        <span className="text-gray-400 text-sm">Đã kết thúc</span>
                                                    ) : statusInfo.status === 'scheduled' ? (
                                                        <span className="text-gray-500 text-sm">Chưa đến giờ</span>
                                                    ) : (
                                                        <span className="text-orange-500 text-sm">Sắp bắt đầu</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
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
                    {/* Phần Tư vấn */}
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Bạn cần trợ giúp chọn khóa học phù hợp?</h3>
                        <p className="text-gray-600 mb-6">
                            Hãy để chúng tôi giúp bạn tìm khóa học phù hợp nhất dựa trên mục tiêu và trình độ hiện tại của bạn.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <button 
                                onClick={() => navigate(paths.student_messages)}
                                className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
                            >
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