import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaVideo, FaClock, FaUser, FaArrowLeft, FaPlay } from 'react-icons/fa';
import dayjs from 'dayjs';

interface LivestreamJoinProps {
  roomName: string;
  token: string;
  title: string;
  scheduledDateTime: string;
  description?: string;
  durationMinutes: number;
}

const LivestreamJoin: React.FC<LivestreamJoinProps> = ({
  roomName,
  token,
  title,
  scheduledDateTime,
  description,
  durationMinutes
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
        isLivestream: true
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
        text: `Buổi livestream sẽ bắt đầu sau ${timeUntilStart} phút`,
        color: 'text-blue-600'
      };
    } else if (timeUntilStart > 0) {
      return {
        status: 'starting',
        text: `Buổi livestream sẽ bắt đầu sau ${timeUntilStart} phút`,
        color: 'text-orange-600'
      };
    } else if (timeUntilStart > -durationMinutes) {
      return {
        status: 'live',
        text: 'Buổi livestream đang diễn ra',
        color: 'text-red-600'
      };
    } else {
      return {
        status: 'ended',
        text: 'Buổi livestream đã kết thúc',
        color: 'text-gray-500'
      };
    }
  };

  const timeStatus = getTimeStatus();

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Connection Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <FaVideo className="text-green-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Kết nối Livestream</h2>
                <p className="text-sm text-gray-600">Sẵn sàng tham gia buổi học trực tuyến</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${timeStatus.color}`}>
                {timeStatus.text}
              </div>
              <div className="text-xs text-gray-500">
                {dayjs(scheduledDateTime).format('HH:mm DD/MM/YYYY')}
              </div>
            </div>
          </div>

          {connectionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-700 text-sm">{connectionError}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Livestream Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Thông tin buổi học</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FaVideo className="text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Tên buổi học</p>
                    <p className="font-medium text-gray-800">{title}</p>
                  </div>
                </div>
                
                {description && (
                  <div className="flex items-start gap-3">
                    <FaVideo className="text-blue-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Mô tả</p>
                      <p className="font-medium text-gray-800">{description}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <FaClock className="text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Thời lượng</p>
                    <p className="font-medium text-gray-800">{durationMinutes} phút</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <FaUser className="text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Vai trò</p>
                    <p className="font-medium text-gray-800">Học viên</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Join Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleJoinRoom}
              disabled={isConnecting || timeStatus.status === 'ended'}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                isConnecting || timeStatus.status === 'ended'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:scale-105'
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
                  <span>Tham gia buổi học</span>
                </>
              )}
            </button>
            
            {timeStatus.status === 'ended' && (
              <p className="text-center text-sm text-gray-500 mt-2">
                Buổi livestream đã kết thúc
              </p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Hướng dẫn tham gia</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p>• Đảm bảo microphone và camera hoạt động bình thường</p>
            <p>• Kiểm tra kết nối internet ổn định</p>
            <p>• Tắt các ứng dụng khác để tránh lag</p>
            <p>• Nếu gặp vấn đề, hãy liên hệ hỗ trợ</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivestreamJoin; 