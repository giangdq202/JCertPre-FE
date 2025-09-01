
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import InstructorSidebar from '../../components/sidebar/InstructorSidebar';
import InstructorHeader from '../../components/header/InstructorHeader';
import InstructorLivestreamJoin from '../../components/livestream/InstructorLivestreamJoin';
import { useAuth } from '../../auth/AuthContext';
import { livestreamApi, LivestreamDto, LivestreamStatus } from '../../services/livestreamService';
import paths from '../../routes/path';
import { FaArrowLeft, FaVideo, FaClock, FaChalkboardTeacher } from 'react-icons/fa';
import { Button, Card, Typography, Spin } from 'antd';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface LivestreamState {
  livestreamId: string;
  roomName: string;
  token: string;
  title: string;
  scheduledDateTime: string;
  description?: string;
  durationMinutes: number;
}

const InstructorLiveStreamPage: React.FC = () => {
  const { livestreamId } = useParams<{ livestreamId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  
  const [livestream, setLivestream] = useState<LivestreamDto | null>(null);
  const [livestreamState, setLivestreamState] = useState<LivestreamState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canJoin, setCanJoin] = useState(false);

  useEffect(() => {
    const initializeLivestream = async () => {
      console.log('🔍 Debug - Initializing livestream:', {
        livestreamId,
        hasLocationState: !!location.state,
        userId: userInfo?.id
      });

      if (!livestreamId) {
        console.error('❌ No livestreamId provided');
        toast.error("Không tìm thấy ID livestream.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Check if we have state from navigation (from schedule page)
        if (location.state) {
          console.log('✅ Using state from navigation:', location.state);
          const state = location.state as LivestreamState;
          setLivestreamState(state);
          
          // Create a mock livestream object from the state for rendering
          const mockLivestream: LivestreamDto = {
            livestreamId: state.livestreamId,
            courseId: '', // We don't have this from state
            description: state.description || state.title,
            scheduledDateTime: state.scheduledDateTime,
            durationMinutes: state.durationMinutes,
            status: LivestreamStatus.LIVE,
            endDateTime: '', // Will be calculated if needed
            isLive: true,
            isScheduled: true,
            canStart: true
          };
          setLivestream(mockLivestream);
          setCanJoin(true);
          console.log('✅ Set livestream and canJoin from navigation state');
          setIsLoading(false);
          return;
        }

        // Check sessionStorage for livestream config
        const sessionConfig = sessionStorage.getItem('livestreamConfig');
        if (sessionConfig) {
          console.log('✅ Using sessionStorage config:', sessionConfig);
          const config = JSON.parse(sessionConfig);
          setLivestreamState(config);
          
          // Still need to fetch livestream details for complete info
          const livestreamDetails = await livestreamApi.getLivestreamById(livestreamId);
          console.log('✅ Livestream details from sessionStorage flow:', livestreamDetails);
          setLivestream(livestreamDetails);
          setCanJoin(true);
          setIsLoading(false);
          return;
        }

        // If no state, try to get livestream details and generate token
        console.log('🔄 Fetching livestream details for ID:', livestreamId);
        const livestreamDetails = await livestreamApi.getLivestreamById(livestreamId);
        console.log('✅ Livestream details received:', livestreamDetails);
        setLivestream(livestreamDetails);

        if (!userInfo?.id) {
          console.error('❌ No user ID found');
          throw new Error("Vui lòng đăng nhập để tham gia livestream.");
        }

        // Generate join token for instructor
        console.log('🔄 Generating join token for instructor:', userInfo.id);
        const joinTokenResponse = await livestreamApi.generateJoinToken(livestreamId, userInfo.id);
        console.log('✅ Join token received:', joinTokenResponse);
        
        const newState: LivestreamState = {
          livestreamId,
          roomName: joinTokenResponse.roomName,
          token: joinTokenResponse.token,
          title: livestreamDetails.description || 'Buổi dạy trực tuyến',
          scheduledDateTime: livestreamDetails.scheduledDateTime,
          description: livestreamDetails.description,
          durationMinutes: livestreamDetails.durationMinutes
        };
        
        setLivestreamState(newState);
        
        // Check if instructor can join (always true for instructor)
        setCanJoin(true);

      } catch (error: any) {
        console.error("Error initializing livestream:", error);
        let errorMessage = "Có lỗi xảy ra khi tải thông tin livestream.";
        
        if (error.response?.status === 403) {
          errorMessage = "Bạn không có quyền tham gia livestream này.";
        } else if (error.response?.status === 404) {
          errorMessage = "Không tìm thấy livestream này.";
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLivestream();
  }, [livestreamId, location.state, userInfo?.id]);

  const handleBackToSchedule = () => {
    navigate(paths.instructor_schedule);
  };

  const getLivestreamStatus = () => {
    if (!livestream) return { status: 'unknown', text: 'Không xác định', color: 'bg-gray-100 text-gray-800' };
    
    const now = dayjs();
    const livestreamStart = dayjs(livestream.scheduledDateTime);
    const livestreamEnd = livestreamStart.add(livestream.durationMinutes, 'minute');
    
    if (now.isBefore(livestreamStart.subtract(15, 'minute'))) {
      return { status: 'scheduled', text: 'Chưa đến giờ', color: 'bg-blue-100 text-blue-800' };
    } else if (now.isBefore(livestreamStart)) {
      return { status: 'starting', text: 'Sẵn sàng bắt đầu', color: 'bg-orange-100 text-orange-800' };
    } else if (now.isBefore(livestreamEnd)) {
      return { status: 'live', text: 'Đang diễn ra', color: 'bg-red-100 text-red-800' };
    } else {
      return { status: 'completed', text: 'Đã kết thúc', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex flex-col lg:flex-row">
        <InstructorSidebar />
        <div className="flex-1 flex flex-col">
          <InstructorHeader />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Spin size="large" />
              <p className="mt-4 text-gray-600 font-medium">Đang tải thông tin buổi dạy...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!livestream || !livestreamState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex flex-col lg:flex-row">
        <InstructorSidebar />
        <div className="flex-1 flex flex-col">
          <InstructorHeader />
          <div className="flex-1 flex items-center justify-center">
            <Card className="max-w-md w-full text-center">
              <div className="mb-6">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaVideo className="text-red-500 text-2xl" />
                </div>
                <Title level={3} className="text-gray-800 mb-2">
                  Không tìm thấy livestream
                </Title>
                <Text className="text-gray-600">
                  Livestream bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                </Text>
              </div>
              <Button 
                type="primary" 
                icon={<FaArrowLeft />}
                onClick={handleBackToSchedule}
                className="bg-gradient-to-r from-purple-600 to-blue-600 border-0"
                size="large"
              >
                Quay lại lịch dạy
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getLivestreamStatus();

  console.log('🎨 Render check:', {
    hasLivestream: !!livestream,
    hasLivestreamState: !!livestreamState,
    canJoin,
    isLoading,
    livestreamTitle: livestream?.description,
    stateTitle: livestreamState?.title
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex flex-col lg:flex-row">
      <InstructorSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <InstructorHeader />
        
        {/* Header */}
        <div className="bg-white border-b border-purple-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                type="text"
                icon={<FaArrowLeft />}
                onClick={handleBackToSchedule}
                className="text-gray-600 hover:text-gray-800 border-0"
              >
                Quay lại lịch dạy
              </Button>
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
        <div className="bg-white border-b border-purple-200 px-6 py-4">
          <div className="flex items-center gap-3 mb-2">
            <FaChalkboardTeacher className="text-purple-600 text-xl" />
            <h1 className="text-2xl font-bold text-gray-800">{livestreamState.title}</h1>
          </div>
          
          {livestreamState.description && (
            <p className="text-gray-600 mb-3">{livestreamState.description}</p>
          )}
          
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <FaClock className="text-purple-500" />
              <span>{livestreamState.durationMinutes} phút</span>
            </div>
            <div className="flex items-center gap-2">
              <FaChalkboardTeacher className="text-blue-500" />
              <span>Giảng viên</span>
            </div>
          </div>
        </div>

        {/* Livestream Component */}
        <div className="flex-1">
          {canJoin ? (
            <InstructorLivestreamJoin
              roomName={livestreamState.roomName}
              token={livestreamState.token}
              title={livestreamState.title}
              scheduledDateTime={livestreamState.scheduledDateTime}
              description={livestreamState.description}
              durationMinutes={livestreamState.durationMinutes}
              livestreamId={livestreamState.livestreamId}
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
                    ? 'Buổi dạy chưa đến giờ. Bạn chỉ có thể tham gia 15 phút trước khi bắt đầu.'
                    : statusInfo.status === 'completed'
                    ? 'Buổi dạy đã kết thúc.'
                    : 'Bạn không có quyền tham gia buổi dạy này.'
                  }
                </p>
                <Button
                  type="primary"
                  icon={<FaArrowLeft />}
                  onClick={handleBackToSchedule}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 border-0"
                >
                  Quay lại lịch dạy
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorLiveStreamPage;