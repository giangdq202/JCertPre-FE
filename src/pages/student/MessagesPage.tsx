import React, { useState, useEffect, useRef, useCallback } from 'react';
import StudentSideBar from '../../components/sidebar/StudentSideBar';
import ChatHeader from '../../components/chat/ChatHeader';
import ChatMessage from '../../components/chat/ChatMessage';
import ChatInput from '../../components/chat/ChatInput';
import ChatConnectionStatus from '../../components/chat/ChatConnectionStatus';
import StudentChatStudyPlanView from '../../components/studyplan/StudentChatStudyPlanView';
import { 
  HiOutlineChatBubbleLeftRight,
  HiOutlineAcademicCap
} from 'react-icons/hi2';
import { HiX } from 'react-icons/hi';
import { useConversation } from '../../hooks/useConversation';
import { useAuth } from '../../auth/AuthContext';
import { useSignalRChat } from '../../hooks/useSignalRChat';
import { MessageDto } from '../../services/conversationService';
import { signalrService } from '../../services/signalrService';
import { toast } from 'react-toastify';
import { SIGNALR_CONFIG } from '../../config/signalr';

const MessagesPage: React.FC = () => {
  const { userInfo } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isStudyPlanMode, setIsStudyPlanMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    currentConversation,
    messages,
    isLoading,
    isSendingMessage,
    error,
    sendNewMessage,
    setMessages // We need this to update messages from SignalR
  } = useConversation();

  // SignalR real-time chat integration
  const handleNewMessage = useCallback((message: MessageDto) => {
    console.log('[MessagesPage] New message received:', message);
    console.log('[MessagesPage] Message details:', {
      messageId: message.messageId,
      senderId: message.senderId,
      currentUserId: userInfo?.id,
      content: message.content
    });
    
    // *** THAY ĐỔI: Nhận tất cả messages (kể cả của chính mình) ***
    // Điều này đảm bảo real-time sync giữa các client
    setMessages((prevMessages: MessageDto[]) => {
      console.log('[MessagesPage] Current messages count:', prevMessages.length);
      const messageExists = prevMessages.some((m: MessageDto) => m.messageId === message.messageId);
      console.log('[MessagesPage] Message already exists:', messageExists);
      
      if (!messageExists) {
        const updatedMessages = [...prevMessages, message];
        const sortedMessages = updatedMessages.sort((a, b) => 
          new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );
        console.log('[MessagesPage] Updated messages count:', sortedMessages.length);
        return sortedMessages;
      }
      return prevMessages;
    });
    
    // Chỉ show toast cho messages từ người khác
    if (message.senderId !== userInfo?.id) {
      toast.info(`Tin nhắn mới từ Academic Manager`);
    }
  }, [userInfo?.id, setMessages]);

  const { isConnected } = useSignalRChat({
    conversationId: null, // Không auto-join, sẽ manual join sau khi load conversation  
    onMessageReceived: handleNewMessage,
    enabled: SIGNALR_CONFIG.ENABLED // Luôn enable connection
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect để join conversation khi cả connection và conversation đều sẵn sàng
  useEffect(() => {
    const joinConversationWhenReady = async () => {
      if (currentConversation?.conversationId && isConnected) {
        console.log('[MessagesPage] Connection and conversation ready, joining...');
        try {
          await signalrService.joinConversation(currentConversation.conversationId);
          console.log('[MessagesPage] Successfully joined conversation via effect');
        } catch (error) {
          console.error('[MessagesPage] Failed to join conversation via effect:', error);
        }
      }
    };

    joinConversationWhenReady();
  }, [currentConversation?.conversationId, isConnected]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) return;
    
    await sendNewMessage(newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Create chat components for split view
  const chatHeader = (
    <ChatHeader
      title={currentConversation?.conversationName || 'Academic Manager'}
      subtitle={isConnected ? "Academic Manager - Đang kết nối" : "Academic Manager - Mất kết nối"}
      isOnline={isConnected}
      theme="green"
      additionalActions={
        <div className="flex items-center gap-3">
          <ChatConnectionStatus isConnected={isConnected} theme="green" />
          {!isStudyPlanMode && userInfo?.id && (
            <button
              onClick={() => setIsStudyPlanMode(true)}
              className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              title="Xem lộ trình học"
            >
              <HiOutlineAcademicCap className="w-4 h-4" />
              Lộ trình học
            </button>
          )}
          {isStudyPlanMode && (
            <button
              onClick={() => setIsStudyPlanMode(false)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              title="Đóng chế độ xem lộ trình"
            >
              <HiX className="w-4 h-4" />
              Đóng lộ trình
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
            messageTheme="green"
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );

  const chatInput = (
    <ChatInput
      value={newMessage}
      onChange={setNewMessage}
      onSend={handleSendMessage}
      onKeyPress={handleKeyPress}
      isLoading={isSendingMessage}
      theme="green"
    />
  );

  return (
    <div className="h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 z-20">
        <StudentSideBar />
      </div>
      
      {/* Chat Content Area - với left margin để tránh sidebar */}
      <div className="ml-64 h-screen flex flex-col bg-white relative">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200 fixed top-0 left-64 right-0 z-30">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Chat Area */}
        {currentConversation ? (
          isStudyPlanMode && userInfo?.id ? (
            <StudentChatStudyPlanView
              chatHeader={chatHeader}
              chatMessages={chatMessages}
              chatInput={chatInput}
              studentId={userInfo.id}
              studentName={userInfo.fullName || 'Học viên'}
              onClose={() => setIsStudyPlanMode(false)}
            />
          ) : (
            <>
              {/* Fixed Chat Header */}
              <div className="fixed top-0 left-64 right-0 z-30 bg-white border-b border-gray-200">
                {chatHeader}
              </div>

              {/* Messages - Scrollable area với padding top và bottom cho fixed elements */}
              <div className="pt-20 pb-24 px-6 space-y-4 overflow-y-auto h-screen">
                {messages.map((message) => {
                  const isOwnMessage = message.senderId === userInfo?.id;
                  return (
                    <ChatMessage
                      key={message.messageId}
                      content={message.content}
                      timestamp={message.sentAt}
                      isOwnMessage={isOwnMessage}
                      senderName={!isOwnMessage ? message.senderName : undefined}
                      messageTheme="green"
                    />
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Fixed Chat Input at bottom */}
              <div className="fixed bottom-0 left-64 right-0 z-30 bg-white border-t border-gray-200">
                {chatInput}
              </div>
            </>
          )
        ) : (
          <div className="pt-20 h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Đang khởi tạo cuộc hội thoại
                  </h3>
                  <p className="text-gray-500">
                    Vui lòng chờ trong giây lát...
                  </p>
                </>
              ) : (
                <>
                  <HiOutlineChatBubbleLeftRight className="mx-auto text-6xl text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Đang chuẩn bị cuộc hội thoại
                  </h3>
                  <p className="text-gray-500">
                    Hệ thống đang thiết lập cuộc hội thoại cho bạn...
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage; 