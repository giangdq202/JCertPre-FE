// src/pages/student/StudentExamPage.tsx
import React, { useEffect, useState } from "react";
import StudentSideBar from "../../components/sidebar/StudentSideBar";
import StudentHeader from "../../components/header/StudentHeader";
import JLPTTestInterface from "../../components/JLPTTestInterface";
import { TestType, CourseLevel } from "../../services/testService";
import { FaPlay, FaGraduationCap, FaClock, FaUsers } from "react-icons/fa";
import { 
  getAllTestTemplateTypes, 
  TestTemplateTypeDto 
} from "../../services/testTemplateTypeService";
import { 
  getAllByTypeId as getTemplatesByTypeId, 
  TestTemplateDto 
} from "../../services/testTemplateService";
import { 
  getAllByTemplateId as getConfigsByTemplateId, 
  TestTemplateConfigDto 
} from "../../services/testTemplateConfigService";

interface TestOption {
  id: string; // use templateId for uniqueness
  title: string; // e.g., "JLPT N5 Auto - Đề 1"
  testType: TestType;
  courseLevel: CourseLevel;
  estimatedDuration: number;
}

const StudentExamPage: React.FC = () => {
  const [selectedTest, setSelectedTest] = useState<TestOption | null>(null);
  const [isInTest, setIsInTest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [testOptions, setTestOptions] = useState<TestOption[]>([]);

  // Load available options from template types, templates and configs
  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch active template types for JLPTAuto and EntryAuto
        const [jlptTypes, entryTypes] = await Promise.all([
          getAllTestTemplateTypes({ type: TestType.JLPTAuto, isActive: true, pageSize: 100 }),
          getAllTestTemplateTypes({ type: TestType.EntryAuto, isActive: true, pageSize: 100 })
        ]);

        const allTypes: TestTemplateTypeDto[] = [
          ...jlptTypes.items,
          ...entryTypes.items
        ];

        const options: TestOption[] = [];

        // For each type, load templates and ensure templates have at least one config
        for (const type of allTypes) {
          const templates: TestTemplateDto[] = await getTemplatesByTypeId(type.testTemplateTypeId);
          for (const template of templates) {
            // Check if template has configs
            const configs: TestTemplateConfigDto[] = await getConfigsByTemplateId(template.templateId);
            if (configs && configs.length > 0) {
              options.push({
                id: template.templateId,
                title: `${type.typeName} - ${template.templateName}`,
                testType: type.testType as unknown as TestType,
                courseLevel: type.courseLevel as unknown as CourseLevel,
                estimatedDuration: template.durationMinutes || 0,
              });
            }
          }
        }

        setTestOptions(options);
      } catch (err) {
        console.error('Failed to load exam options:', err);
        setError('Không thể tải danh sách bài test. Vui lòng thử lại sau.');
        setTestOptions([]);
      } finally {
        setLoading(false);
      }
    };
    loadOptions();
  }, []);

  const handleStartTest = (testOption: TestOption) => {
    setSelectedTest(testOption);
    setIsInTest(true);
  };

  const handleBackToList = () => {
    setIsInTest(false);
    setSelectedTest(null);
  };

  if (isInTest && selectedTest) {
    return (
      <JLPTTestInterface
        testType={selectedTest.testType}
        courseLevel={selectedTest.courseLevel}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-inter">
      {/* Sidebar */}
      <StudentSideBar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <StudentHeader />

        {/* Content */}
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Thi thử JLPT & Kiểm tra đầu vào
            </h2>
            <p className="text-gray-600">
              Chọn loại bài thi phù hợp với trình độ của bạn để bắt đầu làm bài
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-lg p-6 border text-center text-gray-600">
                Đang tải danh sách bài test...
              </div>
            )}
            {!loading && error && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-red-50 rounded-lg p-6 border border-red-200 text-center text-red-700">
                {error}
              </div>
            )}
            {!loading && !error && testOptions.length === 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-lg p-6 border text-center text-gray-600">
                Chưa có mẫu đề thi nào sẵn sàng. Vui lòng thử lại sau.
              </div>
            )}
            {!loading && !error && testOptions.map((testOption) => (
              <div
                key={testOption.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FaGraduationCap className={`text-xl ${
                      testOption.testType === TestType.JLPTAuto ? 'text-blue-600' : 'text-green-600'
                    }`} />
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      testOption.testType === TestType.JLPTAuto 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {testOption.testType === TestType.JLPTAuto ? 'JLPT' : 'Kiểm tra đầu vào'}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700`}>
                    {CourseLevel[testOption.courseLevel]}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {testOption.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">Bài thi theo cấu hình hệ thống</p>

                <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FaClock />
                    <span>~{testOption.estimatedDuration} phút</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaUsers />
                    <span>Cấp độ {CourseLevel[testOption.courseLevel]}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartTest(testOption)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    testOption.testType === TestType.JLPTAuto
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <FaPlay size={14} />
                  Bắt đầu làm bài
                </button>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Hướng dẫn làm bài
            </h3>
            <div className="space-y-2 text-blue-700 text-sm">
              <p>• Bài thi sẽ được chia thành nhiều phần (Part) với thời gian riêng biệt</p>
              <p>• Bạn không thể làm Part tiếp theo khi Part hiện tại chưa hết thời gian</p>
              <p>• Bạn không thể quay lại Part trước khi Part hiện tại chưa hết thời gian</p>
              <p>• Hệ thống sẽ tự động nộp bài khi hết thời gian tổng</p>
              <p>• Câu trả lời sẽ được lưu tự động khi bạn chọn</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentExamPage;
