import React, { useState, useEffect } from 'react';
import { signalrService } from '../../services/signalrService';
import { useAuth } from '../../auth/AuthContext';
import { BASE_URL } from '../../consts/apiUrl/baseUrl';
import { SIGNALR_CONFIG } from '../../config/signalr';

const SignalRDebugger: React.FC = () => {
  const { jwtToken } = useAuth();
  const [status, setStatus] = useState<string>('Not Connected');
  const [logs, setLogs] = useState<string[]>([]);
  const [hubUrl, setHubUrl] = useState<string>('');
  const [conversationId, setConversationId] = useState<string>('');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    const baseUrl = BASE_URL.replace('/api', '');
    const url = `${baseUrl}/hubs/chat`;
    setHubUrl(url);
  }, []);

  const testConnection = async () => {
    if (!jwtToken) {
      addLog('❌ No JWT token available');
      return;
    }

    try {
      addLog('🔄 Starting SignalR connection...');
      addLog(`📡 Hub URL: ${hubUrl}`);
      addLog(`🎫 Token present: ${jwtToken ? 'YES' : 'NO'}`);
      addLog(`⚙️ Config enabled: ${SIGNALR_CONFIG.ENABLED}`);
      
      await signalrService.startConnection(jwtToken);
      setStatus('Connected');
      addLog('✅ SignalR connection established');
    } catch (error) {
      setStatus('Failed');
      addLog(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testJoinConversation = async () => {
    if (!conversationId.trim()) {
      addLog('❌ Please enter a conversation ID');
      return;
    }

    try {
      addLog(`🔄 Joining conversation: ${conversationId}`);
      await signalrService.joinConversation(conversationId);
      addLog(`✅ Successfully joined conversation: ${conversationId}`);
    } catch (error) {
      addLog(`❌ Failed to join conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testBackendHealth = async () => {
    try {
      addLog('🔄 Testing backend health...');
      const response = await fetch(`${BASE_URL.replace('/api', '')}/api/health`);
      if (response.ok) {
        addLog('✅ Backend is healthy');
      } else {
        addLog(`⚠️ Backend responded with status: ${response.status}`);
      }
    } catch (error) {
      addLog(`❌ Backend health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const disconnect = async () => {
    try {
      await signalrService.stopConnection();
      setStatus('Disconnected');
      addLog('🔌 SignalR connection stopped');
    } catch (error) {
      addLog(`❌ Error disconnecting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg max-w-4xl mx-auto">
      <h3 className="text-lg font-bold mb-4">SignalR Connection Debugger</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-3 rounded">
          <strong>Status:</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-sm ${
            status === 'Connected' ? 'bg-green-100 text-green-800' :
            status === 'Failed' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {status}
          </span>
        </div>
        
        <div className="bg-white p-3 rounded">
          <strong>Hub URL:</strong>
          <div className="text-sm text-gray-600 break-all">{hubUrl}</div>
        </div>
      </div>

      <div className="bg-white p-3 rounded mb-4">
        <label className="block text-sm font-medium mb-2">Test Conversation Join:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={conversationId}
            onChange={(e) => setConversationId(e.target.value)}
            placeholder="Enter conversation ID"
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <button
            onClick={testJoinConversation}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            disabled={status !== 'Connected'}
          >
            Join
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={testConnection}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Connect SignalR
        </button>
        
        <button
          onClick={disconnect}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          disabled={status !== 'Connected'}
        >
          Disconnect
        </button>
        
        <button
          onClick={testBackendHealth}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Test Backend
        </button>
        
        <button
          onClick={clearLogs}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Clear Logs
        </button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
        <div className="mb-2 text-gray-400">Debug Console:</div>
        {logs.length === 0 ? (
          <div className="text-gray-500">Click "Connect SignalR" to start debugging...</div>
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

export default SignalRDebugger;
