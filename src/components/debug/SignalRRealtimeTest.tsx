import React, { useState, useCallback, useEffect } from 'react';
import { signalrService } from '../../services/signalrService';
import { useAuth } from '../../auth/AuthContext';
import { MessageDto } from '../../services/conversationService';

const SignalRRealtimeTest: React.FC = () => {
  const { jwtToken, userInfo } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentConversation, setCurrentConversation] = useState('34ed7822-99e9-47af-b6f0-380a7147168e');
  const [testMessage, setTestMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState<MessageDto[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
    console.log(`[RealtimeTest] ${message}`);
  };

  // Message handler
  const handleMessageReceived = useCallback((message: MessageDto) => {
    addLog(`📨 RECEIVED: ${message.content} (from: ${message.senderName || message.senderId})`);
    setReceivedMessages(prev => [...prev, message]);
  }, []);

  // Setup connection và handlers
  const setupConnection = async () => {
    addLog('🔄 Setting up SignalR connection...');
    
    if (!jwtToken) {
      addLog('❌ No JWT token available');
      return;
    }

    try {
      // Start connection
      await signalrService.startConnection(jwtToken);
      setIsConnected(true);
      addLog('✅ Connection established');

      // Setup message handler
      signalrService.onMessageReceived(handleMessageReceived);
      addLog('✅ Message handler setup');

      // Join conversation
      if (currentConversation) {
        await signalrService.joinConversation(currentConversation);
        addLog(`✅ Joined conversation: ${currentConversation}`);
      }

    } catch (error) {
      addLog(`❌ Connection failed: ${error}`);
      setIsConnected(false);
    }
  };

  // Test send message qua REST API
  const testSendMessage = async () => {
    if (!testMessage.trim()) {
      addLog('❌ Please enter a test message');
      return;
    }

    addLog(`🚀 Sending message: "${testMessage}"`);
    
    try {
      const response = await fetch(`http://localhost:5001/api/conversations/${currentConversation}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          content: testMessage,
          conversationId: currentConversation
        })
      });

      if (response.ok) {
        const result = await response.json();
        addLog(`✅ Message sent via API. ID: ${result.messageId}`);
        addLog('⏳ Waiting for real-time notification...');
        setTestMessage('');
        
        // Wait 3 seconds to see if we get SignalR notification
        setTimeout(() => {
          addLog('⏰ 3 seconds passed. Check if message was received above.');
        }, 3000);
      } else {
        addLog(`❌ Failed to send: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      addLog(`❌ Send error: ${error}`);
    }
  };

  // Disconnect
  const disconnect = async () => {
    try {
      await signalrService.stopConnection();
      setIsConnected(false);
      addLog('🔌 Disconnected');
    } catch (error) {
      addLog(`❌ Disconnect error: ${error}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setReceivedMessages([]);
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      signalrService.offMessageReceived();
    };
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg max-w-4xl">
      <h3 className="text-lg font-bold mb-4 text-purple-800">
        🔴 LIVE Real-time SignalR Test
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded">
          <strong>User:</strong> {userInfo?.fullName || 'Unknown'}
          <br />
          <strong>Role:</strong> {userInfo?.roleName || 'Unknown'}
        </div>
        <div className="bg-green-50 p-3 rounded">
          <strong>Status:</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-sm ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="bg-yellow-50 p-3 rounded">
          <strong>Messages Received:</strong> {receivedMessages.length}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Conversation ID:</label>
        <input
          type="text"
          value={currentConversation}
          onChange={(e) => setCurrentConversation(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Test Message:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enter message to send..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded"
            onKeyPress={(e) => e.key === 'Enter' && testSendMessage()}
          />
          <button
            onClick={testSendMessage}
            disabled={!isConnected || !testMessage.trim()}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-300"
          >
            Send Test
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={setupConnection}
          disabled={isConnected}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          Connect & Join
        </button>
        
        <button
          onClick={disconnect}
          disabled={!isConnected}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-300"
        >
          Disconnect
        </button>
        
        <button
          onClick={clearLogs}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Clear
        </button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-80 overflow-y-auto">
        <div className="mb-2 text-yellow-400">🔴 LIVE LOGS (Real-time Test):</div>
        {logs.length === 0 ? (
          <div className="text-gray-500">Click "Connect & Join" to start...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">
              {log}
            </div>
          ))
        )}
      </div>

      {receivedMessages.length > 0 && (
        <div className="mt-4 p-4 bg-green-50 rounded">
          <h4 className="font-bold text-green-800 mb-2">📨 Received Messages:</h4>
          {receivedMessages.map((msg, index) => (
            <div key={index} className="text-sm mb-1 p-2 bg-white rounded border-l-4 border-green-400">
              <strong>{msg.senderName || msg.senderId}:</strong> {msg.content}
              <br />
              <span className="text-gray-500 text-xs">{new Date(msg.sentAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SignalRRealtimeTest;
