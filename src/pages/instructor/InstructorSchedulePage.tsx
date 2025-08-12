import React, { useState, useEffect } from "react";
import InstructorSidebar from "../../components/sidebar/InstructorSidebar";
import InstructorHeader from "../../components/header/InstructorHeader";
import { Calendar, Badge, Modal, Button, Spin } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { FaBookOpen, FaClock, FaPlay, FaCalendarAlt, FaGraduationCap } from "react-icons/fa";
import { HiOutlineAcademicCap, HiOutlineClock, HiOutlineCalendar } from "react-icons/hi2";
import { useAuth } from "../../auth/AuthContext";
import paths from "../../routes/path";
import { livestreamApi, LivestreamTimetableDto } from "../../services/livestreamService";
import { toast } from 'react-toastify';

// Livestream interface for instructor courses
interface LivestreamEvent {
  livestreamId: string;
  courseId: string;
  courseName?: string;
  description?: string;
  scheduledDateTime: string;
  durationMinutes: number;
  status: string;
}

const InstructorSchedulePage: React.FC = () => {
  const { userInfo, handleLogout } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<LivestreamTimetableDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Livestream states
  const [livestreams, setLivestreams] = useState<LivestreamTimetableDto[]>([]);
  const [isLoadingLivestreams, setIsLoadingLivestreams] = useState(false);

  const handleProfileClick = () =>
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  const handleLogoutClick = () => {
    handleLogout();
    setIsProfileDropdownOpen(false);
  };

  const handleJoinLivestream = async (livestream: LivestreamTimetableDto) => {
    if (!userInfo?.id) {
      toast.error("Vui lòng đăng nhập để tham gia livestream.");
      return;
    }

    try {
      // Get join token for the livestream
      const joinTokenResponse = await livestreamApi.generateJoinToken(livestream.livestreamId, userInfo.id);
      
      // Store livestream config in sessionStorage
      const livestreamConfig = {
        roomName: joinTokenResponse.roomName,
        title: livestream.description || 'Livestream',
        token: joinTokenResponse.token,
        livestreamId: livestream.livestreamId,
        scheduledDateTime: livestream.scheduledDateTime,
        durationMinutes: livestream.durationMinutes
      };
      
      sessionStorage.setItem('livestreamConfig', JSON.stringify(livestreamConfig));
      
      // Navigate to livestream page
      window.location.href = paths.student_livestream.replace(':livestreamId', livestream.livestreamId);
      
    } catch (error: any) {
      console.error("Lỗi khi tham gia livestream:", error);
      if (error.response?.status === 403) {
        toast.error("Bạn không có quyền tham gia livestream này hoặc livestream chưa bắt đầu.");
      } else {
        toast.error("Có lỗi xảy ra khi tham gia livestream. Vui lòng thử lại sau.");
      }
    }
  };

  // Fetch livestreams for instructor courses using getLivestreamsByUser
  useEffect(() => {
    const fetchLivestreams = async () => {
      if (!userInfo?.id) return;
      
      setIsLoadingLivestreams(true);
      try {
        // Use getLivestreamsByUser to get livestreams for courses where user is instructor
        const livestreamsData = await livestreamApi.getLivestreamsByUser(userInfo.id);
        // Convert to timetable format manually or use the timetable API if available
        const timetableData = await livestreamApi.getLivestreamTimetableByUser(userInfo.id);
        setLivestreams(timetableData);
      } catch (error) {
        console.error("Error fetching instructor livestreams:", error);
        setLivestreams([]);
      } finally {
        setIsLoadingLivestreams(false);
      }
    };

    fetchLivestreams();
  }, [userInfo?.id]);

  const onSelectDate = (value: Dayjs) => {
    const dateKey = value.format("YYYY-MM-DD");
    const eventsForDate = livestreams.filter(livestream => {
      const livestreamDate = dayjs(livestream.scheduledDateTime);
      return livestreamDate.format("YYYY-MM-DD") === dateKey;
    });
    
    if (eventsForDate.length > 0) {
      setSelectedEvents(eventsForDate);
      setIsModalOpen(true);
    } else {
      setSelectedEvents([]);
      setIsModalOpen(false);
    }
  };

  const cellRender = (current: Dayjs, info: any) => {
    if (info.type !== 'date') return info.originNode;
    
    const dateKey = current.format("YYYY-MM-DD");
    const eventsForDate = livestreams.filter(livestream => {
      const livestreamDate = dayjs(livestream.scheduledDateTime);
      return livestreamDate.format("YYYY-MM-DD") === dateKey;
    });
    
    return (
      <div className="relative group">
        {info.originNode}
        {eventsForDate.length > 0 && (
          <div className="absolute -top-1 -right-1 z-10">
            <div className="flex flex-col gap-1">
              {eventsForDate.map((livestream, index) => (
                <div
                  key={livestream.livestreamId}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-2 py-1 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer border border-white"
                  style={{
                    maxWidth: '120px',
                    fontSize: '10px',
                    lineHeight: '1.2',
                    fontWeight: '600',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  <div className="flex items-center gap-1">
                    <FaPlay className="text-[8px]" />
                    <span className="truncate">
                      {livestream.courseName?.substring(0, 15) || 'Khóa học'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 flex flex-col lg:flex-row font-inter">
      <style>
        {`
          .custom-calendar .ant-picker-calendar-header {
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            border-radius: 16px;
            margin-bottom: 24px;
            padding: 20px;
          }
          
          .custom-calendar .ant-picker-calendar-header .ant-picker-calendar-mode-switch {
            background: rgba(255,255,255,0.2);
            border-radius: 8px;
            border: none;
          }
          
          .custom-calendar .ant-picker-calendar-header .ant-picker-calendar-mode-switch .ant-picker-calendar-mode-switch-select {
            color: white;
            font-weight: 600;
          }
          
          .custom-calendar .ant-picker-calendar-header .ant-picker-calendar-mode-switch .ant-picker-calendar-mode-switch-select.ant-picker-calendar-mode-switch-select-active {
            background: rgba(255,255,255,0.3);
            border-radius: 6px;
          }
          
          .custom-calendar .ant-picker-calendar-header .ant-picker-calendar-header-controls {
            color: white;
          }
          
          .custom-calendar .ant-picker-calendar-header .ant-picker-calendar-header-controls .ant-picker-calendar-header-controls-month-select,
          .custom-calendar .ant-picker-calendar-header .ant-picker-calendar-header-controls .ant-picker-calendar-header-controls-year-select {
            color: white;
            font-weight: 600;
          }
          
          .custom-calendar .ant-picker-calendar-header .ant-picker-calendar-header-controls .ant-picker-calendar-header-controls-month-select:hover,
          .custom-calendar .ant-picker-calendar-header .ant-picker-calendar-header-controls .ant-picker-calendar-header-controls-year-select:hover {
            color: #fbbf24;
          }
          
          .custom-calendar .ant-picker-calendar-header .ant-picker-calendar-header-controls .ant-picker-calendar-header-controls-prev,
          .custom-calendar .ant-picker-calendar-header .ant-picker-calendar-header-controls .ant-picker-calendar-header-controls-next {
            color: white;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .custom-calendar .ant-picker-calendar-header .ant-picker-calendar-header-controls .ant-picker-calendar-header-controls-prev:hover,
          .custom-calendar .ant-picker-calendar-header .ant-picker-calendar-header-controls .ant-picker-calendar-header-controls-next:hover {
            background: rgba(255,255,255,0.3);
            color: #fbbf24;
          }
          
          .custom-calendar .ant-picker-calendar-body {
            background: white;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          
          .custom-calendar .ant-picker-calendar-body .ant-picker-calendar-date {
            border-radius: 12px;
            margin: 2px;
            transition: all 0.3s ease;
          }
          
          .custom-calendar .ant-picker-calendar-body .ant-picker-calendar-date:hover {
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            color: white;
            transform: scale(1.05);
          }
          
          .custom-calendar .ant-picker-calendar-body .ant-picker-calendar-date.ant-picker-calendar-date-today {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            font-weight: bold;
          }
          
          .custom-modal .ant-modal-content {
            border-radius: 20px;
            overflow: hidden;
          }
          
          .custom-modal .ant-modal-header {
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            color: white;
            border-bottom: none;
          }
          
          .custom-modal .ant-modal-title {
            color: white;
          }
          
          .custom-modal .ant-modal-close {
            color: white;
          }
          
          .custom-modal .ant-modal-close:hover {
            color: #fbbf24;
          }
        `}
      </style>
      {/* Sidebar */}
      <InstructorSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <InstructorHeader />

        {/* Content */}
        <div className="p-6 lg:p-8">
          {/* Calendar Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
                  <HiOutlineCalendar className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Lịch dạy học</h2>
                  <p className="text-gray-600 text-sm">Quản lý lịch trình livestream của các khóa học</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              {isLoadingLivestreams ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <Spin size="large" />
                    <p className="mt-4 text-gray-600 font-medium">Đang tải lịch dạy học...</p>
                  </div>
                </div>
              ) : (
                <Calendar
                  fullscreen={true}
                  cellRender={cellRender}
                  onSelect={onSelectDate}
                  className="custom-calendar"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
              )}
            </div>
          </div>

          {/* Enhanced Modal */}
          <Modal
            title={
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                  <FaBookOpen className="text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800">Chi tiết buổi dạy</span>
              </div>
            }
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={[
              <Button 
                key="cancel" 
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 font-medium"
              >
                Đóng
              </Button>,
            ]}
            width={600}
            className="custom-modal"
          >
            {selectedEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedEvents.map((livestream) => (
                  <div
                    key={livestream.livestreamId}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                        <FaPlay className="text-white text-lg" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <HiOutlineAcademicCap className="text-blue-600 text-lg" />
                          <h4 className="text-xl font-bold text-gray-800">
                            {livestream.courseName || 'Khóa học'}
                          </h4>
                          <Badge 
                            color={livestream.status === 'LIVE' ? 'red' : 'green'} 
                            text={livestream.status === 'LIVE' ? 'Đang diễn ra' : 'Sắp diễn ra'}
                            className="ml-auto"
                          />
                        </div>
                        
                        <p className="text-gray-700 mb-4 font-medium">
                          {livestream.description || 'Buổi livestream dạy học'}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <HiOutlineClock className="text-blue-500" />
                            <span className="font-medium">
                              {dayjs(livestream.scheduledDateTime).format('HH:mm DD/MM/YYYY')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaClock className="text-green-500" />
                            <span className="font-medium">
                              {livestream.durationMinutes} phút
                            </span>
                          </div>
                        </div>
                        
                        {livestream.startsWithin15Minutes && !livestream.canStart && (
                          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2 text-yellow-800">
                              <FaClock className="text-yellow-600" />
                              <span className="text-sm font-medium">
                                Sắp bắt đầu trong {dayjs(livestream.scheduledDateTime).diff(dayjs(), 'minute')} phút
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {livestream.status === 'COMPLETED' && (
                          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-600">
                              <FaClock className="text-gray-500" />
                              <span className="text-sm font-medium">
                                Buổi dạy đã kết thúc
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <Button
                          type="primary"
                          className={`font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                            livestream.canStart 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                              : livestream.status === 'COMPLETED'
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                          }`}
                          icon={<FaPlay className="mr-2" />}
                          onClick={() => livestream.canStart && handleJoinLivestream(livestream)}
                          disabled={!livestream.canStart || livestream.status === 'COMPLETED'}
                        >
                          {livestream.status === 'COMPLETED' 
                            ? 'Đã kết thúc' 
                            : livestream.canStart 
                            ? 'Bắt đầu dạy' 
                            : 'Chưa đến giờ'
                          }
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineCalendar className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-600 font-medium text-lg">
                  Không có buổi dạy nào trong ngày này.
                </p>
                <p className="text-gray-500 mt-2">
                  Hãy chọn ngày khác để xem lịch dạy học.
                </p>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default InstructorSchedulePage;


