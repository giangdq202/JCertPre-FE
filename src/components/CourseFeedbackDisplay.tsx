import React from 'react';
import { FaStar, FaUser } from 'react-icons/fa';
import { FeedbackDto } from '../services/feedbackService';
import dayjs from 'dayjs';

interface CourseFeedbackDisplayProps {
  feedbacks: FeedbackDto[];
  averageRating: { averageRating: number; totalFeedbacks: number } | null;
  loading: boolean;
}

const CourseFeedbackDisplay: React.FC<CourseFeedbackDisplayProps> = ({
  feedbacks,
  averageRating,
  loading
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-4 border-green-500 border-opacity-25"></div>
          <p className="ml-4 text-gray-600">Đang tải đánh giá...</p>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = {
      sm: 'text-sm',
      md: 'text-lg',
      lg: 'text-xl'
    }[size];

    return (
      <div className={`flex items-center gap-1 ${sizeClass}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]; // Index 0 = 1 star, Index 4 = 5 stars
    feedbacks.forEach(feedback => {
      const ratingIndex = Math.floor(feedback.rating) - 1;
      if (ratingIndex >= 0 && ratingIndex < 5) {
        distribution[ratingIndex]++;
      }
    });
    return distribution.reverse(); // Reverse to show 5 stars first
  };

  if (!feedbacks.length && !loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <FaStar className="text-4xl text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-semibold text-gray-700 mb-2">Chưa có đánh giá nào</h4>
        <p className="text-gray-500">Hãy trở thành người đầu tiên đánh giá khóa học này!</p>
      </div>
    );
  }

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Đánh giá từ học viên</h3>
      
      {/* Overall Rating Summary */}
      {averageRating && (
        <div className="flex flex-col md:flex-row gap-8 mb-8 pb-6 border-b border-gray-200">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-800 mb-2">
              {averageRating.averageRating.toFixed(1)}
            </div>
            <div className="mb-2">
              {renderStars(averageRating.averageRating, 'lg')}
            </div>
            <p className="text-gray-600">
              {averageRating.totalFeedbacks} đánh giá
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1">
            {ratingDistribution.map((count, index) => {
              const starCount = 5 - index;
              const percentage = averageRating.totalFeedbacks > 0 
                ? (count / averageRating.totalFeedbacks) * 100 
                : 0;

              return (
                <div key={starCount} className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-gray-600 w-8">
                    {starCount} sao
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Individual Feedbacks */}
      <div className="space-y-6">
        {feedbacks.slice(0, 10).map((feedback) => (
          <div key={feedback.feedbackId} className="border-b border-gray-100 pb-6 last:border-b-0">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaUser className="text-green-600" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="font-medium text-gray-800">Học viên</div>
                  {renderStars(feedback.rating, 'sm')}
                  <span className="text-sm text-gray-500">
                    {dayjs(feedback.createdAt).format('DD/MM/YYYY')}
                  </span>
                </div>
                
                {feedback.comment && (
                  <p className="text-gray-700 leading-relaxed">
                    {feedback.comment}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show more button if there are more feedbacks */}
      {feedbacks.length > 10 && (
        <div className="text-center mt-6">
          <button className="text-green-600 hover:text-green-700 font-medium">
            Xem thêm đánh giá ({feedbacks.length - 10} đánh giá khác)
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseFeedbackDisplay;
