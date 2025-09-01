import React, { useState } from 'react';
import { signalrService } from '../../services/signalrService';
import { useAuth } from '../../auth/AuthContext';
import { BASE_URL } from '../../consts/apiUrl/baseUrl';

const SignalRConnectionTester: React.FC = () => {
  const { jwtToken } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [testConversationId, setTestConversationId] = useState('test-conversation-123');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[SignalRTester] ${message}`);
  };

  const testStep1_BackendHealth = async () => {
    addLog('🧪 STEP 1: Testing Backend Health...');
    try {
      const baseUrl = BASE_URL.replace('/api', '');
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        addLog('✅ Backend is responding');
      } else {
        addLog(`❌ Backend responded with status: ${response.status}`);
      }
    } catch (error) {
      addLog(`❌ Backend health check failed: ${error}`);
    }
  };

  const testStep2_SignalRConnection = async () => {
    addLog('🧪 STEP 2: Testing SignalR Connection...');
    if (!jwtToken) {
      addLog('❌ No JWT token available');
      return;
    }

    try {
      await signalrService.startConnection(jwtToken);
      addLog('✅ SignalR connection established');
    } catch (error) {
      addLog(`❌ SignalR connection failed: ${error}`);
    }
  };

  const testStep3_JoinConversation = async () => {
    addLog('🧪 STEP 3: Testing Join Conversation...');
    try {
      await signalrService.joinConversation(testConversationId);
      addLog(`✅ Successfully joined conversation: ${testConversationId}`);
    } catch (error) {
      addLog(`❌ Failed to join conversation: ${error}`);
    }
  };

  const testStep4_MessageHandler = () => {
    addLog('🧪 STEP 4: Setting up Message Handler...');
    signalrService.onMessageReceived((message) => {
      addLog(`📨 RECEIVED MESSAGE: ${JSON.stringify(message)}`);
    });
    addLog('✅ Message handler registered');
  };

  const testStep5_SendTestMessage = async () => {
    addLog('🧪 STEP 5: Testing Send Message via REST API...');
    try {
      // Test qua REST API để xem có trigger SignalR không
      const baseUrl = BASE_URL;
      const response = await fetch(`${baseUrl}/conversations/${testConversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          content: `Test message sent at ${new Date().toISOString()}`,
          conversationId: testConversationId
        })
      });

      if (response.ok) {
        addLog('✅ REST API message sent successfully');
        addLog('⏳ Waiting for SignalR notification...');
      } else {
        addLog(`❌ REST API message failed: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        addLog(`Error details: ${errorText}`);
      }
    } catch (error) {
      addLog(`❌ Send message error: ${error}`);
    }
  };

  const runFullTest = async () => {
    setLogs([]);
    addLog('🚀 Starting Full SignalR Test Suite...');
    
    await testStep1_BackendHealth();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testStep2_SignalRConnection();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testStep3_JoinConversation();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    testStep4_MessageHandler();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testStep5_SendTestMessage();
    
    addLog('🏁 Test suite completed. Check results above.');
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg max-w-4xl">
      <h3 className="text-lg font-bold mb-4 text-blue-800">SignalR Real-time Test Suite</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Test Conversation ID:</label>
        <input
          type="text"
          value={testConversationId}
          onChange={(e) => setTestConversationId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded"
          placeholder="Enter conversation ID to test"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={runFullTest}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          🚀 Run Full Test
        </button>
        
        <button
          onClick={testStep1_BackendHealth}
          className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 text-sm"
        >
          1. Backend
        </button>
        
        <button
          onClick={testStep2_SignalRConnection}
          className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 text-sm"
        >
          2. Connect
        </button>
        
        <button
          onClick={testStep3_JoinConversation}
          className="bg-orange-500 text-white px-3 py-2 rounded hover:bg-orange-600 text-sm"
        >
          3. Join
        </button>
        
        <button
          onClick={testStep5_SendTestMessage}
          className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
        >
          5. Send Test
        </button>
        
        <button
          onClick={clearLogs}
          className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 text-sm"
        >
          Clear
        </button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
        <div className="mb-2 text-yellow-400">🔍 Test Results:</div>
        {logs.length === 0 ? (
          <div className="text-gray-500">Click "Run Full Test" to start comprehensive testing...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SignalRConnectionTester;
