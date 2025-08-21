import { useState, useEffect } from 'react';
import { feedbackService } from '../services/feedbackService';

interface CourseRating {
  averageRating: number;
  totalFeedbacks: number;
}

interface CourseRatingsState {
  [courseId: string]: CourseRating;
}

export const useCourseRatings = (courseIds: string[]) => {
  const [ratings, setRatings] = useState<CourseRatingsState>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRatings = async () => {
      if (courseIds.length === 0) return;

      setLoading(true);
      try {
        const ratingPromises = courseIds.map(async (courseId) => {
          try {
            const rating = await feedbackService.getCourseAverageRating(courseId);
            return { courseId, rating };
          } catch (error) {
            console.warn(`Failed to fetch rating for course ${courseId}:`, error);
            return { courseId, rating: null };
          }
        });

        const results = await Promise.all(ratingPromises);
        
        const newRatings: CourseRatingsState = {};
        results.forEach(({ courseId, rating }) => {
          if (rating !== null && rating !== undefined) {
            console.log(`Rating for course ${courseId}:`, rating);
            
            // Handle both formats: number or object
            let normalizedRating: CourseRating;
            if (typeof rating === 'number') {
              // Backend trả về chỉ số rating
              normalizedRating = {
                averageRating: rating,
                totalFeedbacks: 0 // Default khi không có thông tin
              };
            } else if (typeof rating === 'object' && 'averageRating' in rating) {
              // Backend trả về object đầy đủ
              normalizedRating = rating as CourseRating;
            } else {
              console.warn(`Invalid rating format for course ${courseId}:`, rating);
              return;
            }
            
            console.log(`Normalized rating for course ${courseId}:`, normalizedRating);
            newRatings[courseId] = normalizedRating;
          }
        });

        console.log('All course ratings:', newRatings);
        setRatings(newRatings);
      } catch (error) {
        console.error('Failed to fetch course ratings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [courseIds.join(',')]); // Use join to create stable dependency

  return { ratings, loading };
};

// Hook for single course rating
export const useCourseRating = (courseId: string) => {
  const { ratings, loading } = useCourseRatings([courseId]);
  return { 
    rating: ratings[courseId] || null, 
    loading 
  };
};
