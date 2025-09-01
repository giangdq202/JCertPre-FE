import React, { useState, useEffect, useRef, useCallback } from 'react';
import StudentSideBar from '../../components/sidebar/StudentSideBar';
import ChatHeader from '../../components/chat/ChatHeader';
import ChatMessage from '../../components/chat/ChatMessage';
import ChatInput from '../../components/chat/ChatInput';
import ChatConnectionStatus from '../../components/chat/ChatConnectionStatus';
import SignalRDebugger from '../../components/debug/SignalRDebugger';
import { 
  HiOutlineChatBubbleLeftRight
} from 'react-icons/hi2';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <StudentSideBar />
        
        <div className="flex-1 flex flex-col bg-white">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Chat Area */}
          {currentConversation ? (
            <>
              <ChatHeader
                title={currentConversation.conversationName}
                subtitle={isConnected ? "Academic Manager - Đang kết nối" : "Academic Manager - Mất kết nối"}
                isOnline={isConnected}
                theme="green"
                additionalActions={
                  <ChatConnectionStatus isConnected={isConnected} theme="green" />
                }
              />

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
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

              <ChatInput
                value={newMessage}
                onChange={setNewMessage}
                onSend={handleSendMessage}
                onKeyPress={handleKeyPress}
                isLoading={isSendingMessage}
                theme="green"
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
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
    </div>
  );
};

export default MessagesPage; 