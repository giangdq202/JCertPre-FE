import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import StudentSideBar from '../../components/sidebar/StudentSideBar';
import StudentHeader from '../../components/header/StudentHeader';
import LivestreamJoin from '../../components/livestream/LivestreamJoin';
import { useAuth } from '../../auth/AuthContext';
import { livestreamApi, LivestreamDto } from '../../services/livestreamService';
import paths from '../../routes/path';
import { FaArrowLeft, FaVideo, FaClock, FaUser } from 'react-icons/fa';
import dayjs from 'dayjs';

interface LivestreamState {
  livestreamId: string;
  roomName: string;
  token: string;
  title: string;
  scheduledDateTime: string;
  description?: string;
  durationMinutes: number;
}

const StudentLivestreamPage: React.FC = () => {
  const { livestreamId } = useParams<{ livestreamId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  
  const [livestream, setLivestream] = useState<LivestreamDto | null>(null);
  const [livestreamState, setLivestreamState] = useState<LivestreamState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canJoin, setCanJoin] = useState(false);

  useEffect(() => {
    const initializeLivestream = async () => {
      if (!livestreamId) {
        setError("Không tìm thấy ID livestream.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Check if we have state from navigation (from course detail page)
        if (location.state) {
          const state = location.state as LivestreamState;
          setLivestreamState(state);
          
          // Fetch livestream details
          const livestreamData = await livestreamApi.getLivestreamById(livestreamId);
          setLivestream(livestreamData);
          
          // Check if user can join
          const canJoinResult = await livestreamApi.canJoinLivestream(livestreamId, userInfo?.id || '');
          setCanJoin(canJoinResult);
        } else {
          // If no state, try to generate join token
          try {
            const joinData = await livestreamApi.generateJoinToken(livestreamId, userInfo?.id || '');
            const livestreamData = await livestreamApi.getLivestreamById(livestreamId);
            
            setLivestreamState({
              livestreamId,
              roomName: joinData.roomName,
              token: joinData.token,
              title: joinData.title,
              scheduledDateTime: joinData.scheduledDateTime,
              description: joinData.description,
              durationMinutes: joinData.durationMinutes
            });
            
            setLivestream(livestreamData);
            
            // Check if user can join
            const canJoinResult = await livestreamApi.canJoinLivestream(livestreamId, userInfo?.id || '');
            setCanJoin(canJoinResult);
          } catch (error: any) {
            console.error("Error generating join token:", error);
            setError("Không thể tham gia buổi livestream này. Vui lòng kiểm tra lại quyền truy cập.");
          }
        }
      } catch (error: any) {
        console.error("Error initializing livestream:", error);
        setError("Không thể tải thông tin livestream. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeLivestream();
  }, [livestreamId, location.state, userInfo?.id]);

  const handleBackToCourse = () => {
    if (livestream?.courseId) {
      navigate(`/student/course-detail/${livestream.courseId}`);
    } else {
      navigate('/student/home');
    }
  };

  const getLivestreamStatus = () => {
    if (!livestream) return { status: 'unknown', text: 'Không xác định', color: 'text-gray-500' };
    
    const now = dayjs();
    const livestreamStart = dayjs(livestream.scheduledDateTime);
    const timeUntilStart = livestreamStart.diff(now, 'minute');

    if (livestream.status === 'COMPLETED') {
      return { status: 'completed', text: 'Đã kết thúc', color: 'text-gray-500' };
    }

    if (livestream.status === 'LIVE' || (timeUntilStart <= 0 && timeUntilStart > -livestream.durationMinutes)) {
      return { status: 'live', text: 'Đang diễn ra', color: 'text-red-600' };
    }

    if (timeUntilStart <= 15 && timeUntilStart > 0) {
      return { status: 'starting', text: 'Sắp bắt đầu', color: 'text-orange-600' };
    }

    return { status: 'scheduled', text: 'Đã lên lịch', color: 'text-green-600' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 font-inter flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 border-green-500 border-opacity-25"></div>
          <p className="mt-4 text-gray-600">Đang tải livestream...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 font-inter flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg max-w-md">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaVideo className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-4">Lỗi</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={handleBackToCourse}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Quay lại khóa học
          </button>
        </div>
      </div>
    );
  }

  if (!livestream || !livestreamState) {
    return (
      <div className="min-h-screen bg-gray-100 font-inter flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg max-w-md">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaVideo className="text-gray-400 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Không tìm thấy livestream</h2>
          <p className="text-gray-700 mb-6">Livestream bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <button
            onClick={handleBackToCourse}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Quay lại khóa học
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getLivestreamStatus();

  return (
    <div className="min-h-screen bg-gray-100 font-inter flex flex-col lg:flex-row">
      <StudentSideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentHeader />
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToCourse}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FaArrowLeft className="text-sm" />
                <span>Quay lại khóa học</span>
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FaClock className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  {dayjs(livestream.scheduledDateTime).format('HH:mm DD/MM/YYYY')}
                </span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
          </div>
        </div>

        {/* Livestream Info */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3 mb-2">
            <FaVideo className="text-blue-600 text-xl" />
            <h1 className="text-2xl font-bold text-gray-800">{livestreamState.title}</h1>
          </div>
          
          {livestreamState.description && (
            <p className="text-gray-600 mb-3">{livestreamState.description}</p>
          )}
          
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <FaClock className="text-green-500" />
              <span>{livestreamState.durationMinutes} phút</span>
            </div>
            <div className="flex items-center gap-2">
              <FaUser className="text-blue-500" />
              <span>Học viên</span>
            </div>
          </div>
        </div>

        {/* Livestream Component */}
        <div className="flex-1">
          {canJoin ? (
            <LivestreamJoin
              roomName={livestreamState.roomName}
              token={livestreamState.token}
              title={livestreamState.title}
              scheduledDateTime={livestreamState.scheduledDateTime}
              description={livestreamState.description}
              durationMinutes={livestreamState.durationMinutes}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaVideo className="text-yellow-500 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa thể tham gia</h3>
                <p className="text-gray-600 mb-4">
                  {statusInfo.status === 'scheduled' 
                    ? 'Buổi livestream chưa đến giờ. Bạn chỉ có thể tham gia 15 phút trước khi bắt đầu.'
                    : statusInfo.status === 'completed'
                    ? 'Buổi livestream đã kết thúc.'
                    : 'Bạn không có quyền tham gia buổi livestream này.'
                  }
                </p>
                <button
                  onClick={handleBackToCourse}
                  className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Quay lại khóa học
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentLivestreamPage; 