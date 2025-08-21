import React, { useState, useEffect } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import { useFeedback } from '../../hooks/useFeedback';
import { useNotification } from '../notifications';
import { useAuth } from '../../auth/AuthContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  userFeedback?: any;
  onFeedbackSubmitted: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  userFeedback,
  onFeedbackSubmitted
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createFeedback, updateFeedback } = useFeedback();
  const { success, error } = useNotification();
  const { userInfo } = useAuth();

  // Pre-fill form if editing existing feedback
  useEffect(() => {
    if (userFeedback) {
      setRating(userFeedback.rating || 0);
      setComment(userFeedback.comment || '');
    } else {
      setRating(0);
      setComment('');
    }
  }, [userFeedback, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      error('Lỗi đánh giá', 'Vui lòng chọn số sao đánh giá');
      return;
    }

    if (!userInfo?.id) {
      error('Lỗi xác thực', 'Bạn cần đăng nhập để gửi đánh giá');
      return;
    }

    setIsSubmitting(true);

    try {
      if (userFeedback) {
        // Update existing feedback
        await updateFeedback(userInfo.id, courseId, {
          rating: rating,
          comment: comment.trim() || undefined
        });
        success('Thành công', 'Đánh giá của bạn đã được cập nhật');
      } else {
        // Create new feedback
        const feedbackData = {
          userId: userInfo.id,
          courseId: courseId,
          rating: rating,
          comment: comment.trim() || undefined
        };
        console.log('FeedbackModal: Creating feedback with data:', feedbackData);
        await createFeedback(feedbackData);
        success('Thành công', 'Cảm ơn bạn đã đánh giá khóa học');
      }
      
      onFeedbackSubmitted();
      onClose();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      error('Lỗi', 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">
            {userFeedback ? 'Cập nhật đánh giá' : 'Đánh giá khóa học'}
          </h3>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="text-center mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">{courseTitle}</h4>
            <p className="text-gray-600 text-sm">
              Chia sẻ trải nghiệm của bạn về khóa học này
            </p>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">
              Đánh giá tổng thể <span className="text-red-500">*</span>
            </label>
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`text-3xl transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  } hover:text-yellow-400`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  disabled={isSubmitting}
                >
                  <FaStar />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500">
              {hoverRating > 0 ? (
                getRatingText(hoverRating)
              ) : rating > 0 ? (
                getRatingText(rating)
              ) : (
                'Chọn số sao để đánh giá'
              )}
            </p>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">
              Nhận xét (tùy chọn)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ chi tiết về trải nghiệm của bạn với khóa học này..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
            />
            <p className="text-right text-xs text-gray-500 mt-1">
              {comment.length}/500 ký tự
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {userFeedback ? 'Đang cập nhật...' : 'Đang gửi...'}
                </div>
              ) : (
                userFeedback ? 'Cập nhật đánh giá' : 'Gửi đánh giá'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const getRatingText = (rating: number): string => {
  switch (rating) {
    case 1:
      return 'Rất không hài lòng';
    case 2:
      return 'Không hài lòng';
    case 3:
      return 'Bình thường';
    case 4:
      return 'Hài lòng';
    case 5:
      return 'Rất hài lòng';
    default:
      return '';
  }
};

export default FeedbackModal;
