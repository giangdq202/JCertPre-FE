import React from 'react';
import CertificateGenerator from './CertificateGenerator';

const CertificateDemo: React.FC = () => {
  const sampleCertificateData = {
    studentName: 'Nguyễn Văn A',
    courseTitle: 'Khóa học tiếng Nhật N5 - Cơ bản',
    completionDate: '19/08/2025',
    courseLevel: 'N5',
    instructorName: 'Thầy Tanaka Hiroshi'
  };

  return (
    <div className="p-8 bg-gradient-to-br from-green-50 to-green-100 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-green-800 mb-6 text-center">
          🎓 Demo Certificate Generator
        </h1>
        
        <div className="bg-green-50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-700 mb-4">📋 Thông tin chứng chỉ mẫu:</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Tên học viên:</strong> {sampleCertificateData.studentName}</p>
            <p><strong>Khóa học:</strong> {sampleCertificateData.courseTitle}</p>
            <p><strong>Trình độ:</strong> {sampleCertificateData.courseLevel}</p>
            <p><strong>Ngày hoàn thành:</strong> {sampleCertificateData.completionDate}</p>
            <p><strong>Giảng viên:</strong> {sampleCertificateData.instructorName}</p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">Nhấn nút bên dưới để tạo và tải chứng chỉ PDF:</p>
          <CertificateGenerator 
            certificateData={sampleCertificateData}
            onDownload={() => console.log('Certificate downloaded successfully!')}
          />
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">✨ Cập nhật mới:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Font chữ:</strong> Đổi thành Times New Roman (font an toàn, ít lỗi)</li>
            <li>• <strong>Màu sắc:</strong> Theme xanh lá cây phù hợp với StudentHomePage</li>
            <li>• <strong>Thiết kế:</strong> Thêm viền, signature lines và cải thiện layout</li>
            <li>• <strong>Button:</strong> Icon download và styling mới</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CertificateDemo;
