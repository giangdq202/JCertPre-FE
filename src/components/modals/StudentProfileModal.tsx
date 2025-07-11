import React, { useState } from 'react';
import { createStudentProfile, StudentProfileDto } from '../../services/studentProfileService';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onProfileCreated: (profile: StudentProfileDto) => void;
}

const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ isOpen, onClose, userId, onProfileCreated }) => {
  const [currentLevel, setCurrentLevel] = useState('N5');
  const [learningGoals, setLearningGoals] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentLevel(e.target.value);
  };

  const handleGoalsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLearningGoals(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLevel || !learningGoals) {
      setError('Vui lòng điền đầy đủ trình độ và mục tiêu.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Gọi service để tạo hồ sơ
      const newProfile = await createStudentProfile({
        userId: userId,
        currentLevel: currentLevel,
        learningGoals: learningGoals
      });
      
      onProfileCreated(newProfile); // Cập nhật state ở StudentHomePage
    } catch (err) {
      console.error("Failed to create student profile:", err);
      setError("Đã xảy ra lỗi khi tạo hồ sơ. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full transform transition-transform duration-300 scale-95 opacity-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Chào mừng bạn!</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Vui lòng cung cấp một chút thông tin về trình độ và mục tiêu học tập của bạn để chúng tôi có thể cá nhân hóa trải nghiệm.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="currentLevel" className="block text-sm font-medium text-gray-700 mb-2">
              Hãy tự đánh giá, trình độ tiếng Nhật hiện tại của bạn ở cấp độ nào?
            </label>
            <select
              id="currentLevel"
              value={currentLevel}
              onChange={handleLevelChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
            >
              {['N5', 'N4', 'N3', 'N2', 'N1'].map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="learningGoals" className="block text-sm font-medium text-gray-700 mb-2">
              Mục tiêu học tập của bạn là gì? (Ví dụ: Đạt N3 vào tháng 12, Giao tiếp thành thạo,...)
            </label>
            <textarea
              id="learningGoals"
              value={learningGoals}
              onChange={handleGoalsChange}
              rows={4}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 resize-none text-gray-900"
              placeholder="Nhập mục tiêu học tập của bạn..."
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm" role="alert">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang tạo hồ sơ...' : 'Xác nhận và bắt đầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfileModal;