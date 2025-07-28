// src/pages/student/StudentExamPage.tsx
import React from "react";
import StudentSideBar from "../../components/sidebar/StudentSideBar";
import StudentHeader from "../../components/header/StudentHeader";
import TestCard from "../../components/card/TestCard";

const StudentExamPage: React.FC = () => {
  // Danh sách đề thi (mock data)
  const tests = [
    {
      title: "Đề thi thử JLPT N3 - Số 1",
      description: "Bài thi thử JLPT N3 theo cấu trúc chuẩn.",
      testType: 0,
      durationMinutes: 120,
      availableFrom: "2025-07-18T11:27:01.829Z",
      availableTo: "2025-08-18T11:27:01.829Z",
      maxAttempts: 3,
      status: 0,
    },
    {
      title: "Đề thi thử JLPT N4 - Số 2",
      description: "Ôn tập kiến thức N4 với đề thi sát thực tế.",
      testType: 0,
      durationMinutes: 105,
      availableFrom: "2025-07-20T11:27:01.829Z",
      availableTo: "2025-08-20T11:27:01.829Z",
      maxAttempts: 5,
      status: 1,
    },
  ];

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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Đề thi thử JLPT
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test, index) => (
              <TestCard
                key={index}
                title={test.title}
                description={test.description}
                durationMinutes={test.durationMinutes}
                availableFrom={test.availableFrom}
                availableTo={test.availableTo}
                maxAttempts={test.maxAttempts}
                status={test.status}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentExamPage;
