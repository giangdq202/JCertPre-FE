import React, { useState, useEffect, useRef } from 'react';
import { useLessonProgress } from '../hooks/useLessonProgress';
import { useAuth } from '../auth/AuthContext';
import { FiCheckCircle, FiCircle, FiPlay, FiPause, FiVolume2, FiVolumeX } from 'react-icons/fi';

interface VideoLessonPlayerProps {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  videoUrl: string;
  onLessonCompleted?: () => void;
}

export const VideoLessonPlayer: React.FC<VideoLessonPlayerProps> = ({
  courseId,
  lessonId,
  lessonTitle,
  videoUrl,
  onLessonCompleted,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isLoading: authLoading } = useAuth();
  const {
    loading,
    error,
    getLessonCompletionRate,
    markLessonCompleted,
    updateLessonProgressRate,
  } = useLessonProgress();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  // Load initial progress
  useEffect(() => {
    if (authLoading) return; // Don't load progress while auth is loading
    
    const loadProgress = async () => {
      try {
        const rate = await getLessonCompletionRate(lessonId);
        setProgress(rate);
        setIsCompleted(rate >= 100);
      } catch (error) {
        console.error('Failed to load lesson progress:', error);
      }
    };

    loadProgress();
  }, [lessonId, getLessonCompletionRate, authLoading]);

  // Create lesson progress when video starts playing (if not exists)
  const handleVideoStart = async () => {
    if (authLoading) return; // Don't create progress while auth is loading
    
    try {
      // Check if progress exists, if not create it
      const existingProgress = await getLessonCompletionRate(lessonId);
      if (existingProgress === 0) {
        // Create initial progress record
        await updateLessonProgressRate(lessonId, courseId, 0);
      }
    } catch (error) {
      console.error('Failed to create initial lesson progress:', error);
      // Don't throw the error, just log it to avoid breaking the video player
    }
  };

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      
      setCurrentTime(current);
      
      // Calculate progress percentage (chỉ hiển thị, không gọi API)
      const progressPercent = total > 0 ? (current / total) * 100 : 0;
      setProgress(progressPercent);

      // Check if video is completed (watched 90% or more)
      if (progressPercent >= 90 && !isCompleted) {
        handleVideoCompleted();
      }
    }
  };

  const handleVideoCompleted = async () => {
    try {
      await markLessonCompleted(lessonId, courseId);
      setIsCompleted(true);
      setProgress(100);
      onLessonCompleted?.();
    } catch (error) {
      console.error('Failed to mark lesson as completed:', error);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    if (isCompleted) return 'text-green-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Video Header */}
      {/* <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isCompleted ? (
              <FiCheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <FiCircle className="h-6 w-6 text-gray-400" />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{lessonTitle}</h3>
              <p className="text-sm text-gray-500">
                {isCompleted ? 'Đã hoàn thành' : 'Đang học'}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-lg font-bold ${getProgressColor()}`}>
              {Math.round(progress)}%
            </div>
            <div className="text-xs text-gray-500">Tiến độ</div>
          </div>
        </div>
      </div> */}

      {/* Video Player */}
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full h-64 md:h-96 bg-black"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoCompleted}
          onPlay={() => {
            setIsPlaying(true);
            handleVideoStart();
          }}
          onPause={() => setIsPlaying(false)}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Video Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
              }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Play/Pause Button */}
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isPlaying ? (
                  <FiPause className="h-6 w-6" />
                ) : (
                  <FiPlay className="h-6 w-6" />
                )}
              </button>

              {/* Time Display */}
              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  {isMuted ? (
                    <FiVolumeX className="h-5 w-5" />
                  ) : (
                    <FiVolume2 className="h-5 w-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      {/* <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Tiến độ học tập</span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isCompleted ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {progress >= 90 && !isCompleted && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700 flex items-center gap-2">
              <FiCheckCircle className="h-4 w-4" />
              Sắp hoàn thành! Bạn đã xem được {Math.round(progress)}% video
            </p>
          </div>
        )}

        {isCompleted && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700 flex items-center gap-2">
              <FiCheckCircle className="h-4 w-4" />
              Chúc mừng! Bạn đã hoàn thành bài học này
            </p>
          </div>
        )}
      </div> */}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="p-4 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-blue-600">Đang cập nhật tiến độ...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Lesson List Item with Progress
interface LessonListItemProps {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  lessonOrder: number;
  isActive?: boolean;
  onLessonClick: () => void;
}

export const LessonListItem: React.FC<LessonListItemProps> = ({
  courseId,
  lessonId,
  lessonTitle,
  lessonOrder,
  isActive = false,
  onLessonClick,
}) => {
  const { isLoading: authLoading } = useAuth();
  const { getLessonCompletionRate } = useLessonProgress();
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (authLoading) return; // Don't load progress while auth is loading
    
    const loadProgress = async () => {
      try {
        const rate = await getLessonCompletionRate(lessonId);
        setProgress(rate);
        setIsCompleted(rate >= 100);
      } catch (error) {
        console.error('Failed to load lesson progress:', error);
      }
    };

    loadProgress();
  }, [lessonId, getLessonCompletionRate, authLoading]);

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
        isActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      onClick={onLessonClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <FiCheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
              <span className="text-xs text-gray-500">{lessonOrder}</span>
            </div>
          )}
          
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{lessonTitle}</h4>
            <p className="text-sm text-gray-500">
              {isCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-sm font-medium ${
            isCompleted ? 'text-green-600' : progress > 0 ? 'text-yellow-600' : 'text-gray-500'
          }`}>
            {Math.round(progress)}%
          </div>
          
          {/* Mini Progress Bar */}
          <div className="w-16 h-1 bg-gray-200 rounded-full mt-1">
            <div
              className={`h-1 rounded-full transition-all duration-300 ${
                isCompleted ? 'bg-green-500' : progress > 0 ? 'bg-yellow-500' : 'bg-gray-300'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};