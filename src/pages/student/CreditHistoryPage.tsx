import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getCreditHistory, getPaymentHistory } from '../../services/paymentService';
import { CreditTransactionItem, PaymentHistoryItem } from '../../types/common.types';
import { FiArrowLeft, FiCreditCard, FiDollarSign, FiCalendar, FiClock } from 'react-icons/fi';

const CreditHistoryPage: React.FC = () => {
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const [creditTransactions, setCreditTransactions] = useState<CreditTransactionItem[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'credit' | 'payment'>('credit');

  useEffect(() => {
    if (userInfo?.id) {
      fetchHistory();
    }
  }, [userInfo?.id]);

  const fetchHistory = async () => {
    if (!userInfo?.id) return;

    setIsLoading(true);
    setError('');

    try {
      const [creditData, paymentData] = await Promise.all([
        getCreditHistory(userInfo.id),
        getPaymentHistory(userInfo.id)
      ]);

      setCreditTransactions(creditData);
      setPaymentHistory(paymentData);
    } catch (error: any) {
      console.error('Fetch history error:', error);
      setError('Có lỗi xảy ra khi tải lịch sử giao dịch');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('vi-VN');
  };

  const getTransactionType = (amount: number) => {
    return amount > 0 ? 'Nạp tiền' : 'Chi tiêu';
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải lịch sử giao dịch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lịch sử giao dịch</h1>
              <p className="text-gray-600">Xem lịch sử nạp và sử dụng credit</p>
            </div>
          </div>

          {/* Current Credit Display */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiCreditCard className="h-6 w-6 text-green-600" />
                <span className="text-lg font-medium text-green-800">Credit hiện tại:</span>
              </div>
              <span className="text-2xl font-bold text-green-900">
                {userInfo?.credit || 0} credit
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('credit')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition duration-200 ${
                activeTab === 'credit'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiCreditCard className="h-4 w-4" />
                Lịch sử Credit ({creditTransactions.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition duration-200 ${
                activeTab === 'payment'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiDollarSign className="h-4 w-4" />
                Lịch sử Thanh toán ({paymentHistory.length})
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'credit' ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử giao dịch Credit</h3>
                {creditTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <FiCreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Chưa có giao dịch credit nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {creditTransactions.map((transaction) => (
                      <div
                        key={transaction.transactionId}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            <FiCreditCard className={`h-5 w-5 ${
                              transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {getTransactionType(transaction.amount)}
                            </p>
                            <p className="text-sm text-gray-600">{transaction.description}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <FiCalendar className="h-3 w-3" />
                                {formatDate(transaction.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${getTransactionColor(transaction.amount)}`}>
                            {transaction.amount > 0 ? '+' : ''}{formatAmount(transaction.amount)} credit
                          </p>
                          <p className="text-xs text-gray-500">
                            Số dư: {formatAmount(transaction.balanceAfter)} credit
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử thanh toán</h3>
                {paymentHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <FiDollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Chưa có lịch sử thanh toán nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentHistory.map((payment) => (
                      <div
                        key={payment.paymentId}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            payment.status === 'Completed' ? 'bg-green-100' : 
                            payment.status === 'Failed' ? 'bg-red-100' : 'bg-yellow-100'
                          }`}>
                            <FiDollarSign className={`h-5 w-5 ${
                              payment.status === 'Completed' ? 'text-green-600' : 
                              payment.status === 'Failed' ? 'text-red-600' : 'text-yellow-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {payment.description || 'Thanh toán credit'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Loại: {payment.paymentType === 'Money' ? 'Tiền mặt' : 'Credit'}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <FiCalendar className="h-3 w-3" />
                                {formatDate(payment.createdAt)}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                payment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                payment.status === 'Failed' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {payment.status === 'Completed' ? 'Thành công' :
                                 payment.status === 'Failed' ? 'Thất bại' : 'Đang xử lý'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {formatAmount(payment.amount)} VND
                          </p>
                          {payment.transactionId && (
                            <p className="text-xs text-gray-500">
                              ID: {payment.transactionId}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditHistoryPage; 