import React, { useState, useRef, useEffect } from 'react';
import StudentSideBar from '../../components/sidebar/StudentSideBar';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import paths from "../../routes/path";

// Placeholder data cho trang chi tiết khóa học
const mockCourse = {
    // Tiêu đề khóa học
    title: "Khóa luyện thi JLPT N3 toàn diện",
    // Mô tả khóa học
    description: "Nắm vững toàn bộ ngữ pháp, từ vựng và Hán tự cần thiết cho kỳ thi JLPT N3 với khóa học toàn diện này. Bao gồm các bài học tương tác, bài tập thực hành và đề thi thử.",
    instructor: {
        // Giữ nguyên tên giảng viên tiếng Nhật
        name: "Yamamoto Keiko",
        // Giữ nguyên URL ảnh đại diện
        avatar: "https://placehold.co/40x40/cccccc/ffffff?text=YK",
        rating: 4.9,
    },
    // Giữ nguyên giá tiền (giả định là VND)
    price: "24,800",
    // Giữ nguyên URL ảnh banner
    image: "https://placehold.co/1200x500/A8A29E/ffffff?text=Course+Banner",
    // Dữ liệu tổng quan
    overview: [
        { label: "Video bài học", value: "62" },
        { label: "Tổng thời lượng", value: "24 giờ" },
        { label: "Bài kiểm tra", value: "12" },
    ]
};

const mockAvailableCourses = [
    {
        // Khóa học 1
        title: 'Làm chủ Hán tự JLPT N4',
        instructor: 'Tanaka Yumi',
        price: '13,500',
        image: 'https://placehold.co/400x200/52525B/ffffff?text=Kanji+N4',
        rating: 4.8,
        description: 'Hướng dẫn toàn diện về các Hán tự N4 thiết yếu kèm thực hành.'
    },
    {
        // Khóa học 2
        title: 'Tiếng Nhật giao tiếp cấp độ N3',
        instructor: 'Saito Akira',
        price: '19,500',
        image: 'https://placehold.co/400x200/52525B/ffffff?text=Conversational+N3',
        rating: 4.5,
        description: 'Cải thiện kỹ năng nói và nghe cho giao tiếp hàng ngày.'
    },
    {
        // Khóa học 3
        title: 'Đọc hiểu nâng cao',
        instructor: 'Satō Jun',
    
        price: '21,000',
        image: 'https://placehold.co/400x200/52525B/ffffff?text=Reading+Comprehension',
        rating: 4.7,
        description: 'Chiến lược và kỹ thuật xử lý các văn bản phức tạp ở trình độ N2/N1.'
    },
    {
        // Khóa học 4
        title: 'Ngữ pháp tiếng Nhật cho người mới bắt đầu',
        instructor: 'Suzuki Haru',
        price: '9,000',
        image: 'https://placehold.co/400x200/52525B/ffffff?text=Beginner+Grammar',
        rating: 5.0,
        description: 'Hoàn hảo cho người mới bắt đầu. Học cấu trúc câu cơ bản.'
    },
    {
        // Khóa học 5
        title: 'Kỹ năng Nghe chuyên sâu',
        instructor: 'Watanabe Hanako',
        price: '14,500',
        image: 'https://placehold.co/400x200/52525B/ffffff?text=Listening+Skills',
        rating: 4.6,
        description: 'Nâng cao khả năng nghe hiểu thông qua các tình huống thực tế.'
    },
    {
        // Khóa học 6
        title: 'Tiếng Nhật thương mại',
        instructor: 'Takahashi Kenji',
        price: '25,000',
        image: 'https://placehold.co/400x200/52525B/ffffff?text=Business+Japanese',
        rating: 4.9,
        description: 'Học tiếng Nhật thương mại trang trọng, từ vựng và sắc thái văn hóa.'
    },
];

const mockSessions = [
    {
        // Session 1
        session: "Lớp tổng ôn Ngữ pháp N3",
        instructor: "Yamamoto Keiko",
        date: "10/05/2025",
        time: "10:00-11:30 JST",
        duration: "1.5 giờ",
        level: "N3",
        spots: "6/15"
    },
    {
        // Session 2
        session: "Thực hành Nói: Hàng ngày",
        instructor: "Saito Akira",
        date: "10/05/2025",
        time: "10:00-11:00 JST",
        duration: "1 giờ",
        level: "N3",
        spots: "7/10"
    },
    {
        // Session 3
        session: "Hội thảo Nhận diện Hán tự",
        instructor: "Tanaka Yoshiko",
        date: "15/05/2025",
        time: "13:00-15:00 JST",
        duration: "2 giờ",
        level: "N3",
        spots: "9/20"
    },
    {
        // Session 4
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
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const profileDropdownRef = useRef<HTMLDivElement | null>(null);
    const { userInfo, handleLogout } = useAuth();
    const navigate = useNavigate();

    // Logic xử lý dropdown (giống StudentHomePage)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileDropdownRef.current && event.target && !profileDropdownRef.current.contains(event.target as HTMLElement)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleProfileClick = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    const handleLogoutClick = () => {
        handleLogout();
        setIsProfileDropdownOpen(false);
        navigate(paths.login, { replace: true });
    };

    return (
        <div className="min-h-screen bg-gray-100 font-inter flex flex-col lg:flex-row">
            {/* Sidebar Component */}
            <StudentSideBar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header (giống StudentHomePage) */}
                <header className="bg-white shadow-md p-4 flex items-center justify-end rounded-b-xl lg:rounded-none">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm khóa học, kỳ thi, hoặc từ vựng..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                        {/* Notification & Settings Icons */}
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                            </svg>
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            </svg>
                        </button>
                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileDropdownRef}>
                            <button
                                onClick={handleProfileClick}
                                className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
                            >
                                <img src="https://placehold.co/32x32/cccccc/ffffff?text=MA" alt="User Avatar" className="rounded-full" />
                                <span className="text-gray-700 font-medium hidden md:block">{userInfo?.fullName || "Người dùng"}</span>
                                {isProfileDropdownOpen ? (
                                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                                ) : (
                                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                )}
                            </button>
                            {isProfileDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-lg rounded-md py-2 z-50">
                                    <div className="px-4 py-2 text-sm text-gray-700">
                                        <p><strong>Họ và tên:</strong> {userInfo?.fullName || "N/A"}</p>
                                        <p><strong>Email:</strong> {userInfo?.email || "N/A"}</p>
                                        <p><strong>Số điện thoại:</strong> {userInfo?.phone || "N/A"}</p>
                                        <p><strong>Vai trò:</strong> {userInfo?.roleName || "N/A"}</p>
                                    </div>
                                    <div className="border-t border-gray-200 my-2"></div>
                                    <button
                                        onClick={() => { navigate(paths.student_profile); setIsProfileDropdownOpen(false); }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                                    > Xem Hồ sơ </button>
                                    <button
                                        onClick={handleLogoutClick}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                                    > Đăng xuất </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Course Enrollment</h1>

                    {/* Course Detail Section */}
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                        {/* Breadcrumbs/Navigation */}
                        <div className="text-sm text-gray-500 mb-6">
                            <Link to="/student/courses" className="text-green-600 hover:underline">Tất cả Khóa học</Link>
                            <span className="mx-2">&gt;</span>
                            <span>{mockCourse.title}</span>
                        </div>

                        {/* Course Hero and Details */}
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Left Column: Course Image and Description */}
                            <div className="lg:w-2/3">
                                <img src={mockCourse.image} alt={mockCourse.title} className="w-full rounded-xl shadow-md mb-6 object-cover h-64" />
                                
                                <div className="mb-6">
                                    <h2 className="text-3xl font-bold text-gray-800 mb-4">{mockCourse.title}</h2>
                                    <div className="flex items-center space-x-4 text-gray-600 mb-4">
                                        <div className="flex items-center space-x-2">
                                            <img src={mockCourse.instructor.avatar} alt="Instructor Avatar" className="w-10 h-10 rounded-full" />
                                            <span>{mockCourse.instructor.name}</span>
                                        </div>
                                        <div className="flex items-center text-yellow-500">
                                            <span className="text-lg font-bold mr-1">{mockCourse.instructor.rating}</span>
                                            <span className="text-base">★ ★ ★ ★ ★</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed mb-6">{mockCourse.description}</p>
                                </div>

                                {/* Course Overview (Lessons, Duration, Quizzes) */}
                                <div className="grid grid-cols-3 gap-6 text-center text-gray-600 border-t border-b border-gray-200 py-4">
                                    {mockCourse.overview.map((item, index) => (
                                        <div key={index}>
                                            <div className="text-2xl font-bold text-green-600">{item.value}</div>
                                            <div className="text-sm">{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Pricing and Enrollment Box */}
                            <div className="lg:w-1/3">
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-md sticky top-6">
                                    <div className="text-center mb-6">
                                        <span className="text-4xl font-extrabold text-green-700">${mockCourse.price}</span>
                                        <span className="text-gray-500"> VND</span>
                                    </div>
                                    
                                    <button className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg mb-4">
                                        Đăng ký ngay
                                    </button>
                                    <button className="w-full bg-white text-green-600 border border-green-600 font-bold py-3 rounded-lg hover:bg-green-50 transition-colors shadow-md">
                                        Đăng ký trải nghiệm miễn phí
                                    </button>

                                    <div className="mt-6 text-sm text-gray-600 space-y-3">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            <span>Bảo hiểm 30 ngày hoàn tiền</span>
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

                    {/* Available Courses Section (Khóa học tương tự) */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Các khóa học có sẵn khác</h3>
                            <a href="#" className="text-green-600 hover:underline">Xem tất cả</a>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mockAvailableCourses.map((course, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-200 hover:scale-[1.02]">
                                    <img src={course.image} alt={course.title} className="w-full h-40 object-cover" />
                                    <div className="p-6">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h4>
                                        <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                                        <div className="flex items-center text-gray-600 text-sm mb-4">
                                            <img src="https://placehold.co/24x24/cccccc/ffffff?text=GV" alt="Instructor Avatar" className="rounded-full mr-2" />
                                            <span>{course.instructor}</span>
                                            <span className="ml-auto text-yellow-500">{course.rating} ★</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xl font-bold text-green-700">${course.price}</span>
                                            <button className="bg-green-50 text-green-700 py-2 px-4 rounded-lg hover:bg-green-100 transition-colors">
                                                Xem khóa học
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Sessions Section */}
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
                                            <button className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm">
                                                Đăng ký ({session.spots})
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Advisory Section */}
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Bạn cần trợ giúp chọn khóa học phù hợp?</h3>
                        <p className="text-gray-600 mb-6">
                            Hãy để chúng tôi giúp bạn tìm khóa học phù hợp nhất dựa trên mục tiêu và trình độ hiện tại của bạn.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <button className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md">
                                Chat với Tư vấn viên
                            </button>
                            <button className="bg-white text-green-700 border border-green-600 py-3 px-8 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-md">
                                Đặt lịch Tư vấn
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StudentCourseDetailPage;