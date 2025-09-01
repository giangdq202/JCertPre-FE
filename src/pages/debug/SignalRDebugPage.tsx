import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import SignalRDebugger from '../../components/debug/SignalRDebugger';
import SignalRConnectionTester from '../../components/debug/SignalRConnectionTester';
import SignalRRealtimeTest from '../../components/debug/SignalRRealtimeTest';
import { SIGNALR_CONFIG } from '../../config/signalr';

const SignalRDebugPage: React.FC = () => {
  const { userInfo } = useAuth();

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Authentication Required</h2>
          <p>Please log in to access the SignalR debug page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">SignalR Debug Console</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">User Info</h3>
              <p className="text-sm text-blue-700">
                <strong>ID:</strong> {userInfo.id}
              </p>
              <p className="text-sm text-blue-700">
                <strong>Role:</strong> {userInfo.roleName}
              </p>
              <p className="text-sm text-blue-700">
                <strong>Name:</strong> {userInfo.fullName}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">SignalR Config</h3>
              <p className="text-sm text-green-700">
                <strong>Enabled:</strong> {SIGNALR_CONFIG.ENABLED ? 'YES' : 'NO'}
              </p>
              <p className="text-sm text-green-700">
                <strong>Max Reconnect:</strong> {SIGNALR_CONFIG.MAX_RECONNECT_ATTEMPTS}
              </p>
              <p className="text-sm text-green-700">
                <strong>Debug Mode:</strong> {SIGNALR_CONFIG.DEBUG_MODE ? 'ON' : 'OFF'}
              </p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Environment</h3>
              <p className="text-sm text-yellow-700">
                <strong>Node ENV:</strong> {process.env.NODE_ENV || 'unknown'}
              </p>
              <p className="text-sm text-yellow-700">
                <strong>Build Mode:</strong> {import.meta.env.MODE || 'unknown'}
              </p>
            </div>
          </div>

          {!SIGNALR_CONFIG.ENABLED && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <strong>Warning:</strong> SignalR is disabled in configuration. 
                    Enable it in <code>src/config/signalr.ts</code> to test the connection.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <SignalRRealtimeTest />
        </div>

        <div className="mb-6">
          <SignalRConnectionTester />
        </div>

        <SignalRDebugger />
      </div>
    </div>
  );
};

export default SignalRDebugPage;
