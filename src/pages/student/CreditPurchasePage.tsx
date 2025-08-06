import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { createCreditPurchase } from '../../services/paymentService';
import { CreateCreditPurchaseRequest } from '../../types/common.types';
import paths from '../../routes/path';

const CreditPurchasePage: React.FC = () => {
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleCreditAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setCreditAmount(value);
  };

  const handlePurchase = async () => {
    if (!userInfo?.id) {
      setError('Không tìm thấy thông tin người dùng');
      return;
    }

    if (creditAmount <= 0) {
      setError('Vui lòng nhập số credit muốn nạp');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const request: CreateCreditPurchaseRequest = {
        userId: userInfo.id,
        creditAmount: creditAmount
      };

      const response = await createCreditPurchase(request);
      
      // Chuyển hướng đến trang thanh toán PayOS
      window.location.href = response.paymentUrl;
    } catch (error: any) {
      console.error('Purchase error:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Nạp Credit</h1>
          <p className="text-gray-600">Nạp credit để mua khóa học và tham gia kỳ thi</p>
        </div>

        {/* Current Credit Display */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-800">Credit hiện tại:</span>
            <span className="text-lg font-bold text-green-900">
              {userInfo?.credit || 0} credit
            </span>
          </div>
        </div>

        {/* Credit Amount Input */}
        <div className="mb-6">
          <label htmlFor="creditAmount" className="block text-sm font-medium text-gray-700 mb-2">
            Số credit muốn nạp
          </label>
          <div className="relative">
            <input
              type="number"
              id="creditAmount"
              value={creditAmount || ''}
              onChange={handleCreditAmountChange}
              placeholder="Nhập số credit (1 credit = 1 VND)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="1"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              credit
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tỷ lệ: 1 credit = 1 VND
          </p>
        </div>

        {/* Amount Display */}
        {creditAmount > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">Số tiền cần thanh toán:</span>
              <span className="text-lg font-bold text-blue-900">
                {creditAmount.toLocaleString('vi-VN')} VND
              </span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleBack}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition duration-200"
          >
            Quay lại
          </button>
          <button
            onClick={handlePurchase}
            disabled={isLoading || creditAmount <= 0}
            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition duration-200"
          >
            {isLoading ? 'Đang xử lý...' : 'Nạp Credit'}
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Thông tin thanh toán:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Thanh toán qua PayOS (an toàn, bảo mật)</li>
            <li>• Hỗ trợ: ATM, Internet Banking, QR Code</li>
            <li>• Credit sẽ được cộng ngay sau khi thanh toán thành công</li>
            <li>• Nếu có vấn đề, vui lòng liên hệ hỗ trợ</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreditPurchasePage; 