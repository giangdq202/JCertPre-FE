import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InstructorSidebar from '../../components/sidebar/InstructorSidebar';
import InstructorHeader from '../../components/header/InstructorHeader';
import { 
  FaArrowLeft, 
  FaEye, 
  FaCheck, 
  FaClock,
  FaCalendarAlt,
  FaSearch,
  FaStar
} from 'react-icons/fa';
import { TestAttemptDto } from '../../services/testAttemptService';
import { WrittenAnswerDto, ScoringWritingRequestDto } from '../../types/attemptAnswer.types';
import { toast } from 'react-toastify';

// Services that need to be created/imported
import { 
  getPagedAttemptsByTestIdAndIsPass 
} from '../../services/testAttemptService';
import { 
  getAllWrittenByAttemptId,
  scoringWriting 
} from '../../services/attemptAnswerService';

interface WritingSubmissionWithAnswers extends TestAttemptDto {
  writingAnswers: WrittenAnswerDto[];
  totalScore?: number | null;
}

interface ScoreData {
  score: number;
  graderComment?: string;
}

const WritingSubmissionsPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  // State management
  const [activeTab, setActiveTab] = useState<'unscored' | 'scored'>('unscored');
  const [unscoredSubmissions, setUnscoredSubmissions] = useState<WritingSubmissionWithAnswers[]>([]);
  const [scoredSubmissions, setScoredSubmissions] = useState<WritingSubmissionWithAnswers[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<WritingSubmissionWithAnswers | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreData>({ score: 0, graderComment: '' });

  // Load submissions
  const loadSubmissions = async () => {
    if (!testId) return;

    try {
      setIsLoading(true);

      // B1: Get unscored attempts (isPass = undefined for unscored)
      const unscoredAttempts = await getPagedAttemptsByTestIdAndIsPass(testId, undefined, 1, 100);
      
      // B1: Get scored attempts (isPass = true or false)
      const scoredAttempts = await getPagedAttemptsByTestIdAndIsPass(testId, true, 1, 100);
      const failedAttempts = await getPagedAttemptsByTestIdAndIsPass(testId, false, 1, 100);
      
      // B2: Load writing answers for each attempt
      const loadSubmissionWithAnswers = async (attempts: TestAttemptDto[]): Promise<WritingSubmissionWithAnswers[]> => {
        const submissions: WritingSubmissionWithAnswers[] = [];
        
        for (const attempt of attempts) {
          try {
            const writingAnswers = await getAllWrittenByAttemptId(attempt.attemptId);
            // Calculate total score from writing answers
            const totalScore = writingAnswers.length > 0 && writingAnswers.some(answer => answer.score !== null)
              ? Math.round(writingAnswers.reduce((sum, answer) => sum + (answer.score || 0), 0) / writingAnswers.length)
              : null;
            
            submissions.push({
              ...attempt,
              writingAnswers,
              totalScore
            });
          } catch (error) {
            console.error(`Failed to load answers for attempt ${attempt.attemptId}:`, error);
          }
        }
        
        return submissions;
      };

      const unscored = await loadSubmissionWithAnswers(unscoredAttempts.items || []);
      const scored = await loadSubmissionWithAnswers([
        ...(scoredAttempts.items || []),
        ...(failedAttempts.items || [])
      ]);

      setUnscoredSubmissions(unscored);
      setScoredSubmissions(scored);

    } catch (error) {
      console.error('Failed to load submissions:', error);
      toast.error('Không thể tải danh sách bài nộp');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle scoring
  const handleScoreSubmission = async (submission: WritingSubmissionWithAnswers) => {
    if (!submission.writingAnswers.length) {
      toast.error('Không tìm thấy câu trả lời để chấm điểm');
      return;
    }

    try {
      setIsScoring(true);

      // B3: Score each writing answer
      for (const answer of submission.writingAnswers) {
        await scoringWriting(answer.answerId, {
          score: scoreData.score,
          graderComment: scoreData.graderComment || ''
        });
      }

      toast.success('Đã chấm điểm thành công!');
      
      // Reload submissions
      await loadSubmissions();
      
      // Close scoring modal
      setSelectedSubmission(null);
      setScoreData({ score: 0, graderComment: '' });

    } catch (error) {
      console.error('Failed to score submission:', error);
      toast.error('Không thể chấm điểm bài nộp');
    } finally {
      setIsScoring(false);
    }
  };

  // Filter submissions by search term (by user ID only)
  const filterSubmissions = (submissions: WritingSubmissionWithAnswers[]) => {
    return submissions.filter(sub => 
      sub.userId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Load data on component mount
  useEffect(() => {
    loadSubmissions();
  }, [testId]);

  if (isLoading && unscoredSubmissions.length === 0 && scoredSubmissions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách bài nộp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <InstructorSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <InstructorHeader />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FaArrowLeft />
                  Quay lại
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Chấm điểm bài viết</h1>
              </div>
              
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo User ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('unscored')}
                  className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                    activeTab === 'unscored'
                      ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FaClock />
                    Chưa chấm ({filterSubmissions(unscoredSubmissions).length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('scored')}
                  className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                    activeTab === 'scored'
                      ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FaCheck />
                    Đã chấm ({filterSubmissions(scoredSubmissions).length})
                  </div>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === 'unscored' ? (
                  <div className="space-y-4">
                    {filterSubmissions(unscoredSubmissions).length === 0 ? (
                      <div className="text-center py-12">
                        <FaClock className="text-4xl text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Không có bài nộp nào cần chấm</p>
                      </div>
                    ) : (
                      filterSubmissions(unscoredSubmissions).map((submission) => (
                        <div key={submission.attemptId} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FaCalendarAlt />
                                <span>{formatDate(submission.startTime)}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedSubmission(submission)}
                              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              <FaEye />
                              Chấm điểm
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filterSubmissions(scoredSubmissions).length === 0 ? (
                      <div className="text-center py-12">
                        <FaCheck className="text-4xl text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Chưa có bài nào được chấm</p>
                      </div>
                    ) : (
                      filterSubmissions(scoredSubmissions).map((submission) => (
                        <div key={submission.attemptId} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FaCalendarAlt />
                                <span>{formatDate(submission.startTime)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FaStar className="text-yellow-500" />
                                <span className="font-medium">
                                  {submission.totalScore !== null ? `${submission.totalScore}/100` : 'Chưa có điểm'}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedSubmission(submission)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <FaEye />
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Scoring Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">
                  {activeTab === 'unscored' ? 'Chấm điểm bài viết' : 'Chi tiết bài đã chấm'}
                </h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Writing Answers */}
              <div className="space-y-6">
                <h4 className="font-semibold text-gray-800">Câu trả lời:</h4>
                {selectedSubmission.writingAnswers.map((answer, index) => (
                  <div key={answer.answerId} className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-3">Câu {index + 1}</h5>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{answer.writtenAnswer}</p>
                    </div>
                    
                    {activeTab === 'scored' && answer.score !== null && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <FaStar className="text-yellow-500" />
                          <span className="font-medium">Điểm: {answer.score}/100</span>
                        </div>
                        {answer.graderComment && (
                          <p className="text-gray-700 text-sm">{answer.graderComment}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Scoring Section (only for unscored) */}
              {activeTab === 'unscored' && (
                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-4">Chấm điểm</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Điểm (0-100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={scoreData.score}
                        onChange={(e) => setScoreData(prev => ({ ...prev, score: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nhận xét (tùy chọn)
                      </label>
                      <textarea
                        value={scoreData.graderComment}
                        onChange={(e) => setScoreData(prev => ({ ...prev, graderComment: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Nhập nhận xét cho sinh viên..."
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setSelectedSubmission(null)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleScoreSubmission(selectedSubmission)}
                        disabled={isScoring}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
                      >
                        {isScoring ? 'Đang chấm...' : 'Lưu điểm'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingSubmissionsPage;