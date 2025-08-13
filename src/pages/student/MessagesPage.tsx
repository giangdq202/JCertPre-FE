import React, { useState, useEffect, useRef } from 'react';
import StudentSideBar from '../../components/sidebar/StudentSideBar';
import ChatHeader from '../../components/chat/ChatHeader';
import ChatMessage from '../../components/chat/ChatMessage';
import ChatInput from '../../components/chat/ChatInput';
import { 
  HiOutlineChatBubbleLeftRight
} from 'react-icons/hi2';
import { useConversation } from '../../hooks/useConversation';
import { useAuth } from '../../auth/AuthContext';

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
    sendNewMessage
  } = useConversation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          {/* Error Display */}
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
                subtitle="Academic Manager"
                theme="green"
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