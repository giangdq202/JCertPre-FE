import React from "react";
import { FaTrophy, FaChartBar, FaBookOpen, FaArrowRight } from "react-icons/fa";

interface TestResultSummary {
  totalScore: number;
  maxScore: number;
  percentage: number;
  sections: {
    sectionName: string;
    score: number;
    maxScore: number;
    percentage: number;
    weakAreas?: string[];
  }[];
}

interface EntryTestResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: TestResultSummary;
  level: string;
  onContinue: () => void;
}

const EntryTestResultModal: React.FC<EntryTestResultModalProps> = ({
  isOpen,
  onClose,
  result,
  level,
  onContinue,
}) => {
  if (!isOpen) return null;

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (percentage: number): string => {
    if (percentage >= 80) return "bg-green-100 border-green-200";
    if (percentage >= 60) return "bg-yellow-100 border-yellow-200";
    return "bg-red-100 border-red-200";
  };

  const getScoreLabel = (percentage: number): string => {
    if (percentage >= 80) return "Xuất sắc";
    if (percentage >= 60) return "Khá";
    if (percentage >= 40) return "Trung bình";
    return "Cần cải thiện";
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100 m-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTrophy className="text-3xl text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Kết quả bài test đầu vào
          </h2>
          <p className="text-gray-600 text-lg">
            Test trình độ {level}
          </p>
        </div>

        {/* Overall Score */}
        <div className={`border-2 rounded-xl p-6 mb-8 ${getScoreBgColor(result.percentage)}`}>
          <div className="text-center">
            <div className={`text-5xl font-bold ${getScoreColor(result.percentage)} mb-2`}>
              {result.percentage}%
            </div>
            <div className="text-lg font-semibold text-gray-800 mb-1">
              {getScoreLabel(result.percentage)}
            </div>
            <div className="text-sm text-gray-600">
              {result.totalScore}/{result.maxScore} điểm
            </div>
          </div>
        </div>

        {/* Section Breakdown */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaChartBar className="mr-2" />
            Chi tiết kết quả từng phần
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.sections.map((section, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800">{section.sectionName}</h4>
                  <span className={`text-sm font-medium ${getScoreColor(section.percentage)}`}>
                    {section.percentage}%
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full ${
                      section.percentage >= 80 ? "bg-green-500" :
                      section.percentage >= 60 ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}
                    style={{ width: `${section.percentage}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-600">
                  {section.score}/{section.maxScore} điểm
                </div>
                
                {/* Weak areas */}
                {section.weakAreas && section.weakAreas.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Cần cải thiện:</p>
                    <div className="flex flex-wrap gap-1">
                      {section.weakAreas.map((area, areaIndex) => (
                        <span 
                          key={areaIndex}
                          className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
            <FaBookOpen className="mr-2" />
            Đánh giá và khuyến nghị
          </h3>
          
          <div className="space-y-3">
            {result.percentage >= 80 ? (
              <p className="text-blue-700">
                🎉 <strong>Xuất sắc!</strong> Bạn đã thành thạo hầu hết kiến thức ở trình độ {level}. 
                Bạn có thể tiếp tục ôn luyện để cải thiện những điểm yếu nhỏ hoặc chuyển sang học trình độ cao hơn.
              </p>
            ) : result.percentage >= 60 ? (
              <p className="text-blue-700">
                👍 <strong>Khá tốt!</strong> Bạn đã nắm được khá nhiều kiến thức cơ bản ở trình độ {level}. 
                Hãy tập trung vào các phần có điểm thấp để cải thiện.
              </p>
            ) : result.percentage >= 40 ? (
              <p className="text-blue-700">
                📚 <strong>Cần ôn tập thêm.</strong> Bạn có nền tảng cơ bản nhưng cần cải thiện đáng kể. 
                Đề xuất tập trung vào các chủ đề cơ bản trước khi nâng cao.
              </p>
            ) : (
              <p className="text-blue-700">
                💪 <strong>Cần nhiều luyện tập.</strong> Bạn nên bắt đầu với những kiến thức cơ bản nhất 
                và dành nhiều thời gian để xây dựng nền tảng vững chắc.
              </p>
            )}
            
            <div className="mt-4">
              <p className="text-sm font-medium text-blue-800 mb-2">Các khóa học được đề xuất:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                {result.sections
                  .filter(section => section.percentage < 70)
                  .map((section, index) => (
                    <li key={index}>• Khóa học {section.sectionName} cơ bản</li>
                  ))
                }
                {result.percentage < 50 && (
                  <li>• Khóa học từ vựng và ngữ pháp nền tảng {level}</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={onContinue}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow hover:shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
          >
            <span>Tiếp tục học tập</span>
            <FaArrowRight className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntryTestResultModal;
