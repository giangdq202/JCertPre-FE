import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StaffHeader from '../../components/header/StaffHeader';
import StaffSidebar from '../../components/sidebar/StaffSidebar';
import ChatHeader from '../../components/chat/ChatHeader';
import ChatMessage from '../../components/chat/ChatMessage';
import ChatInput from '../../components/chat/ChatInput';
import ChatConnectionStatus from '../../components/chat/ChatConnectionStatus';
import ChatStudyPlanSplitView from '../../components/studyplan/ChatStudyPlanSplitView';
import { 
  HiOutlineChatBubbleLeftRight, 
  HiOutlineArrowLeft,
  HiOutlineAcademicCap
} from 'react-icons/hi2';
import { HiX } from 'react-icons/hi';
import { getConversation, sendMessage, ConversationDto, MessageDto, MessageRequest } from '../../services/conversationService';
import { useAuth } from '../../auth/AuthContext';
import { toast } from 'react-toastify';
import { useSignalRChat } from '../../hooks/useSignalRChat';
import { SIGNALR_CONFIG } from '../../config/signalr';
import { signalrService } from '../../services/signalrService';

const StaffMessagesPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [conversation, setConversation] = useState<ConversationDto | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStudyPlanMode, setIsStudyPlanMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // SignalR real-time chat integration
  const handleNewMessage = useCallback((message: MessageDto) => {
    console.log('[StaffMessagesPage] New message received:', message);
    console.log('[StaffMessagesPage] Message details:', {
      messageId: message.messageId,
      senderId: message.senderId,
      currentUserId: userInfo?.id,
      content: message.content
    });
    
    // *** THAY ĐỔI: Nhận tất cả messages (kể cả của chính mình) ***
    // Điều này đảm bảo real-time sync giữa các client
    setMessages((prevMessages: MessageDto[]) => {
      console.log('[StaffMessagesPage] Current messages count:', prevMessages.length);
      const messageExists = prevMessages.some((m: MessageDto) => m.messageId === message.messageId);
      console.log('[StaffMessagesPage] Message already exists:', messageExists);
      
      if (!messageExists) {
        const updatedMessages = [...prevMessages, message];
        const sortedMessages = updatedMessages.sort((a, b) => 
          new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );
        console.log('[StaffMessagesPage] Updated messages count:', sortedMessages.length);
        return sortedMessages;
      }
      return prevMessages;
    });
    
    // Chỉ show toast cho messages từ người khác
    if (message.senderId !== userInfo?.id) {
      toast.info(`Tin nhắn mới từ ${message.senderName || 'Học viên'}`);
    }
  }, [userInfo?.id]);

  const { isConnected } = useSignalRChat({
    conversationId: null, // Không auto-join, sẽ manual join sau khi load conversation
    onMessageReceived: handleNewMessage,
    enabled: SIGNALR_CONFIG.ENABLED // Luôn enable connection, nhưng không auto-join
  });

  // Load conversation data
  useEffect(() => {
    const loadConversation = async () => {
      if (!conversationId) {
        setError('Không tìm thấy ID cuộc hội thoại');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const conversationData = await getConversation(conversationId);
        setConversation(conversationData);
        
        // Sắp xếp messages theo thời gian (cũ nhất trước)
        const sortedMessages = (conversationData.messages || []).sort((a, b) => 
          new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );
        setMessages(sortedMessages);
        
        // *** THÊM: Manual join conversation sau khi load xong ***
        if (conversationData.conversationId && isConnected) {
          console.log('[StaffMessagesPage] Manually joining conversation:', conversationData.conversationId);
          try {
            await signalrService.joinConversation(conversationData.conversationId);
            console.log('[StaffMessagesPage] Successfully joined conversation');
          } catch (error) {
            console.error('[StaffMessagesPage] Failed to join conversation:', error);
          }
        }
      } catch (err) {
        console.error('Failed to load conversation:', err);
        setError('Không thể tải cuộc hội thoại');
        toast.error('Không thể tải cuộc hội thoại');
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
    // Removed auto-refresh interval since we now use SignalR for real-time updates
  }, [conversationId]);

  // Effect để join conversation khi cả connection và conversation đều sẵn sàng
  useEffect(() => {
    const joinConversationWhenReady = async () => {
      if (conversation?.conversationId && isConnected) {
        console.log('[StaffMessagesPage] Connection and conversation ready, joining...');
        try {
          await signalrService.joinConversation(conversation.conversationId);
          console.log('[StaffMessagesPage] Successfully joined conversation via effect');
        } catch (error) {
          console.error('[StaffMessagesPage] Failed to join conversation via effect:', error);
        }
      }
    };

    joinConversationWhenReady();
  }, [conversation?.conversationId, isConnected]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation || !userInfo?.id) return;

    setIsSendingMessage(true);

    try {
      const messageRequest: MessageRequest = {
        Content: newMessage.trim(),
        senderId: userInfo.id
      };

      console.log('[StaffMessagesPage] Sending message via API...');
      const sentMessage = await sendMessage(conversation.conversationId, messageRequest);
      console.log('[StaffMessagesPage] Message sent successfully:', sentMessage);
      
      // *** THAY ĐỔI: Không add message vào state ngay lập tức ***
      // Để SignalR handle việc add message real-time
      // Điều này đảm bảo cả hai phía (student & staff) đều nhận message cùng lúc
      
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Không thể gửi tin nhắn');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStudentFromConversation = () => {
    if (!conversation) return null;
    return conversation.participants?.find(p => 
      p.id !== userInfo?.id && 
      (p.roleName === 'STUDENT' || p.roleName === null)
    );
  };

  const handleStudyPlanCreated = (studyPlanId: string) => {
    toast.success('Lộ trình học đã được tạo thành công!');
    setIsStudyPlanMode(false);
    
    // Optionally send a message to the chat about the study plan
    const messageText = `📚 Tôi đã tạo một lộ trình học dành riêng cho bạn (ID: ${studyPlanId}). Vui lòng kiểm tra trong mục "Lộ trình học" để xem chi tiết.`;
    setNewMessage(messageText);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50">
        <div className="fixed top-0 left-0 right-0 z-30">
          <StaffHeader />
        </div>
        <div className="fixed left-0 top-16 bottom-0 z-20">
          <StaffSidebar />
        </div>
        <div className="ml-64 mt-16 h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Đang tải cuộc hội thoại
            </h3>
            <p className="text-gray-500">
              Vui lòng chờ trong giây lát...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="h-screen bg-gray-50">
        <div className="fixed top-0 left-0 right-0 z-30">
          <StaffHeader />
        </div>
        <div className="fixed left-0 top-16 bottom-0 z-20">
          <StaffSidebar />
        </div>
        <div className="ml-64 mt-16 h-screen flex items-center justify-center">
          <div className="text-center">
            <HiOutlineChatBubbleLeftRight className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {error || 'Không tìm thấy cuộc hội thoại'}
            </h3>
            <p className="text-gray-500 mb-4">
              Vui lòng quay lại trang cuộc hội thoại tư vấn
            </p>
            <button
              onClick={() => navigate('/staff/inquiries')}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 mx-auto"
            >
              <HiOutlineArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const student = getStudentFromConversation();

  // Chat components for split view
  const chatHeader = (
    <ChatHeader
      title={student?.fullName || 'Học viên'}
      subtitle={isConnected ? 
        `${student?.email || conversation.conversationName} - Đang kết nối` : 
        `${student?.email || conversation.conversationName} - Mất kết nối`
      }
      avatar={student?.avatarUrl}
      showBackButton={true}
      onBackClick={() => navigate('/staff/inquiries')}
      theme="orange"
      isOnline={isConnected}
      additionalActions={
        <div className="flex items-center gap-3">
          <ChatConnectionStatus isConnected={isConnected} theme="orange" />
          {!isStudyPlanMode && student && (
            <button
              onClick={() => setIsStudyPlanMode(true)}
              className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
              title="Thiết kế lộ trình học cho học viên"
            >
              <HiOutlineAcademicCap className="w-4 h-4" />
              Thiết kế lộ trình
            </button>
          )}
          {isStudyPlanMode && (
            <button
              onClick={() => setIsStudyPlanMode(false)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              title="Đóng chế độ thiết kế lộ trình"
            >
              <HiX className="w-4 h-4" />
              Đóng thiết kế
            </button>
          )}
        </div>
      }
    />
  );

  const chatMessages = (
    <div className="space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.senderId === userInfo?.id;
        return (
          <ChatMessage
            key={message.messageId}
            content={message.content}
            timestamp={message.sentAt}
            isOwnMessage={isOwnMessage}
            senderName={!isOwnMessage ? message.senderName : undefined}
            messageTheme="orange"
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );

  const chatInput = (
    <div>
      {/* Chat Input */}
      <ChatInput
        value={newMessage}
        onChange={setNewMessage}
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
        isLoading={isSendingMessage}
        placeholder="Nhập tin nhắn để trả lời học viên..."
        theme="orange"
      />
    </div>
  );

  return (
    <div className="h-screen bg-gray-50">
      {/* Fixed Staff Header */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <StaffHeader />
      </div>
      
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-16 bottom-0 z-20">
        <StaffSidebar />
      </div>
      
      {/* Chat Content Area - với margin để tránh header và sidebar */}
      <div className="ml-64 mt-16 h-screen flex flex-col bg-white relative">
        {isStudyPlanMode && student ? (
          <ChatStudyPlanSplitView
            chatHeader={chatHeader}
            chatMessages={chatMessages}
            chatInput={chatInput}
            studentId={student.id}
            studentName={student.fullName || 'Học viên'}
            studentEmail={student.email || ''}
            onClose={() => setIsStudyPlanMode(false)}
            onStudyPlanCreated={handleStudyPlanCreated}
          />
        ) : (
          <>
            {/* Fixed Chat Header */}
            <div className="fixed top-16 left-64 right-0 z-20 bg-white border-b border-gray-200">
              {chatHeader}
            </div>
            
            {/* Messages - Scrollable area với padding cho fixed elements */}
            <div className="pt-20 pb-32 px-6 space-y-4 overflow-y-auto h-full">
              {messages.map((message) => {
                const isOwnMessage = message.senderId === userInfo?.id;
                return (
                  <ChatMessage
                    key={message.messageId}
                    content={message.content}
                    timestamp={message.sentAt}
                    isOwnMessage={isOwnMessage}
                    senderName={!isOwnMessage ? message.senderName : undefined}
                    messageTheme="orange"
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Fixed Chat Input at bottom */}
            <div className="fixed bottom-0 left-64 right-0 z-20 bg-white border-t border-gray-200">
              {chatInput}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StaffMessagesPage; 