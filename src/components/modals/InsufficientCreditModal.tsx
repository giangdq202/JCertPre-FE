import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { FiAlertTriangle, FiCreditCard, FiX } from 'react-icons/fi';
import paths from '../../routes/path';

interface InsufficientCreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredAmount: number;
  currentCredit: number;
}

const InsufficientCreditModal: React.FC<InsufficientCreditModalProps> = ({
  isOpen,
  onClose,
  requiredAmount,
  currentCredit
}) => {
  const navigate = useNavigate();
  const { userInfo } = useAuth();

  if (!isOpen) return null;

  const handlePurchaseCredit = () => {
    onClose();
    navigate(paths.credit_purchase);
  };

  const handleViewHistory = () => {
    onClose();
    navigate(paths.credit_history);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FiAlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Credit không đủ</h3>
              <p className="text-sm text-gray-600">Bạn cần nạp thêm credit để tiếp tục</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition duration-200"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Credit Status */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Credit hiện tại:</span>
              <span className="text-lg font-bold text-gray-900">
                {currentCredit} credit
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Credit cần thiết:</span>
              <span className="text-lg font-bold text-red-600">
                {requiredAmount} credit
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Cần thêm:</span>
              <span className="text-lg font-bold text-red-600">
                {requiredAmount - currentCredit} credit
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Thông tin:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Tỷ lệ: 1 credit = 1 VND</li>
              <li>• Thanh toán qua PayOS (an toàn, bảo mật)</li>
              <li>• Credit sẽ được cộng ngay sau khi thanh toán thành công</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handlePurchaseCredit}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition duration-200 flex items-center justify-center gap-2"
            >
              <FiCreditCard className="h-4 w-4" />
              Nạp Credit ngay
            </button>
            
            <button
              onClick={handleViewHistory}
              className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition duration-200"
            >
              Xem lịch sử giao dịch
            </button>
            
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition duration-200"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsufficientCreditModal; 