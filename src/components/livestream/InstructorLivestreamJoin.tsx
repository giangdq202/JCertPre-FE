import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaVideo, FaClock, FaPlay, FaChalkboardTeacher } from 'react-icons/fa';
import dayjs from 'dayjs';

interface InstructorLivestreamJoinProps {
  roomName: string;
  token: string;
  title: string;
  scheduledDateTime: string;
  description?: string;
  durationMinutes: number;
  livestreamId: string;
}

const InstructorLivestreamJoin: React.FC<InstructorLivestreamJoinProps> = ({
  roomName,
  token,
  title,
  scheduledDateTime,
  description,
  durationMinutes,
  livestreamId
}) => {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleJoinRoom = async () => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      // Clear any existing room config to avoid conflicts
      sessionStorage.removeItem('roomConfig');
      
      // Store the connection data for the video conference component
      sessionStorage.setItem('livestreamConfig', JSON.stringify({
        roomName,
        token,
        title,
        scheduledDateTime,
        description,
        durationMinutes,
        livestreamId, // Add livestreamId for mute functionality
        isLivestream: true,
        role: 'instructor'
      }));

      // Navigate to the LiveKit room
      navigate(`/livekit/room/${roomName}`);
    } catch (error: any) {
      console.error('Error joining livestream:', error);
      setConnectionError('Không thể kết nối đến buổi livestream. Vui lòng thử lại.');
      toast.error('Lỗi kết nối livestream');
    } finally {
      setIsConnecting(false);
    }
  };

  const getTimeStatus = () => {
    const now = dayjs();
    const livestreamStart = dayjs(scheduledDateTime);
    const timeUntilStart = livestreamStart.diff(now, 'minute');

    if (timeUntilStart > 15) {
      return {
        status: 'waiting',
        text: `Buổi dạy sẽ bắt đầu sau ${timeUntilStart} phút`,
        color: 'text-purple-600'
      };
    } else if (timeUntilStart > 0) {
      return {
        status: 'starting',
        text: `Buổi dạy sẽ bắt đầu sau ${timeUntilStart} phút`,
        color: 'text-orange-600'
      };
    } else if (timeUntilStart > -durationMinutes) {
      return {
        status: 'live',
        text: 'Buổi dạy đang diễn ra',
        color: 'text-red-600'
      };
    } else {
      return {
        status: 'ended',
        text: 'Buổi dạy đã kết thúc',
        color: 'text-gray-500'
      };
    }
  };

  const timeStatus = getTimeStatus();

  return (
    <div className="flex-1 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Connection Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-3 rounded-full">
                <FaVideo className="text-purple-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Kết nối Livestream</h2>
                <p className="text-gray-600">Sẵn sàng tham gia buổi học trực tuyến</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                timeStatus.status === 'live' 
                  ? 'bg-red-100 text-red-800' 
                  : timeStatus.status === 'starting'
                  ? 'bg-orange-100 text-orange-800'
                  : timeStatus.status === 'ended'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {timeStatus.status === 'live' && '🔴 '}
                {timeStatus.text}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {dayjs().format('HH:mm DD/MM/YYYY')}
              </p>
            </div>
          </div>

          {connectionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">{connectionError}</p>
            </div>
          )}

          {/* Livestream Details */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Thông tin buổi dạy</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <FaClock className="text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Thời gian</p>
                  <p className="font-medium text-gray-800">
                    {dayjs(scheduledDateTime).format('HH:mm DD/MM/YYYY')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FaClock className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Thời lượng</p>
                  <p className="font-medium text-gray-800">{durationMinutes} phút</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FaChalkboardTeacher className="text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-600">Vai trò</p>
                  <p className="font-medium text-gray-800">Giảng viên</p>
                </div>
              </div>
            </div>
          </div>

          {/* Join Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleJoinRoom}
              disabled={isConnecting || timeStatus.status === 'ended'}
              className={`w-full py-4 px-6 rounded-lg font-bold text-white transition-all duration-200 flex items-center justify-center gap-3 ${
                isConnecting || timeStatus.status === 'ended'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Đang kết nối...</span>
                </>
              ) : (
                <>
                  <FaPlay className="text-sm" />
                  <span>Bắt đầu buổi dạy</span>
                </>
              )}
            </button>
            
            {timeStatus.status === 'ended' && (
              <p className="text-center text-sm text-gray-500 mt-2">
                Buổi dạy đã kết thúc
              </p>
            )}
          </div>
        </div>

        {/* Instructions for Instructor */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
          <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
            <FaChalkboardTeacher className="text-purple-600" />
            Hướng dẫn cho giảng viên
          </h3>
          <div className="space-y-2 text-sm text-purple-700">
            <p>• Đảm bảo microphone và camera hoạt động bình thường</p>
            <p>• Kiểm tra kết nối internet ổn định (tối thiểu 5Mbps upload)</p>
            <p>• Chuẩn bị tài liệu và slide bài giảng</p>
            <p>• Tắt các ứng dụng khác để tối ưu hiệu suất</p>
            <p>• Có thể mời học viên tham gia sau khi vào phòng</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorLivestreamJoin;
