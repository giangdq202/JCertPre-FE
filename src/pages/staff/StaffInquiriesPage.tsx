import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffHeader from '../../components/header/StaffHeader';
import StaffSidebar from '../../components/sidebar/StaffSidebar';
import { 
  HiOutlineChatBubbleLeftRight,
  HiOutlineClock,
  HiOutlineArrowRight
} from 'react-icons/hi2';
import { getMyConversations, ConversationDto } from '../../services/conversationService';
import { useAuth } from '../../auth/AuthContext';
import { toast } from 'react-toastify';

const StaffInquiriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load conversations for staff
  useEffect(() => {
    const loadConversations = async () => {
      if (!userInfo?.id) return;

      setLoading(true);
      setError(null);

      try {
        const staffConversations = await getMyConversations(userInfo.id);
        
        // Sắp xếp conversations theo thời gian cập nhật gần nhất
        const sortedConversations = staffConversations.sort((a, b) => {
          const aLastMessage = a.messages?.[a.messages.length - 1];
          const bLastMessage = b.messages?.[b.messages.length - 1];
          
          if (!aLastMessage && !bLastMessage) return 0;
          if (!aLastMessage) return 1;
          if (!bLastMessage) return -1;
          
          return new Date(bLastMessage.sentAt).getTime() - new Date(aLastMessage.sentAt).getTime();
        });

        setConversations(sortedConversations);
      } catch (err) {
        console.error('Failed to load conversations:', err);
        setError('Không thể tải danh sách cuộc hội thoại');
        toast.error('Không thể tải danh sách cuộc hội thoại');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    // Auto-refresh every 10 minutes
    const interval = setInterval(loadConversations, 600000);
    return () => clearInterval(interval);
  }, [userInfo?.id]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const getStudentFromConversation = (conversation: ConversationDto) => {
    // Tìm participant không phải là staff hiện tại
    return conversation.participants?.find(p => 
      p.id !== userInfo?.id && 
      (p.roleName === 'STUDENT' || p.roleName === null)
    );
  };

  const handleViewChat = (conversationId: string) => {
    navigate(`/staff/messages/${conversationId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StaffHeader />
        <div className="flex">
          <StaffSidebar />
          <div className="flex-1 p-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-4 border-orange-500 border-opacity-25"></div>
              <span className="ml-4 text-gray-600">Đang tải yêu cầu tư vấn...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffHeader />
      <div className="flex">
        <StaffSidebar />
        
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Cuộc hội thoại tư vấn
            </h1>
            <p className="text-gray-600">
              Quản lý các cuộc hội thoại tư vấn với học viên ({conversations.length} cuộc hội thoại)
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Conversations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conversations.map((conversation) => {
              const student = getStudentFromConversation(conversation);
              const lastMessage = conversation.messages?.[conversation.messages.length - 1];
              
              return (
                <div key={conversation.conversationId} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {student?.fullName?.charAt(0) || 'S'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {student?.fullName || 'Học viên'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {student?.email || 'Không có email'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {conversation.messages?.length || 0} tin nhắn
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      {conversation.conversationName}
                    </h4>
                    {lastMessage && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        <span className="font-medium">
                          {lastMessage.senderId === userInfo?.id ? 'Bạn' : lastMessage.senderName}:
                        </span> {lastMessage.content}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    {lastMessage && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <HiOutlineClock className="w-3 h-3" />
                        {formatTime(lastMessage.sentAt)}
                      </div>
                    )}
                    <span className="text-xs text-gray-500">
                      Tạo: {formatTime(conversation.createdAt)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleViewChat(conversation.conversationId)}
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Đi đến cuộc trò chuyện</span>
                    <HiOutlineArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {conversations.length === 0 && !loading && (
            <div className="text-center py-12">
              <HiOutlineChatBubbleLeftRight className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Không có cuộc hội thoại nào
              </h3>
              <p className="text-gray-500">
                Hiện tại chưa có cuộc hội thoại tư vấn nào từ học viên
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffInquiriesPage; 