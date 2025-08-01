import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const MockModeNotice: React.FC = () => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <FiAlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-yellow-900 mb-1">
            Chế độ Test (Mock Mode)
          </h4>
          <p className="text-xs text-yellow-800">
            Hiện tại đang sử dụng dữ liệu test. Khi cấu hình PayOS hoàn tất, 
            tính năng thanh toán thực sẽ được kích hoạt.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MockModeNotice; 