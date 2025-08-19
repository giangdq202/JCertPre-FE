import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNotification } from './notifications';

interface CertificateData {
  studentName: string;
  courseTitle: string;
  completionDate: string;
  courseLevel: string;
  instructorName?: string;
}

interface CertificateGeneratorProps {
  certificateData: CertificateData;
  onDownload?: () => void;
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  certificateData,
  onDownload
}) => {
  const { error: showError } = useNotification();
  const generateCertificate = async () => {
    try {
      // Tạo HTML template cho certificate
      const certificateHTML = `
        <div id="certificate" style="
          width: 800px; 
          height: 600px; 
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
          color: white;
          font-family: 'Times New Roman', 'Georgia', 'serif';
          padding: 40px;
          text-align: center;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        ">
          <div style="
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 30px;
            margin: 20px;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255,255,255,0.2);
          ">
            <h1 style="
              font-size: 42px;
              margin-bottom: 25px;
              color: #FEF3C7;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
              font-weight: bold;
              letter-spacing: 2px;
              font-family: 'Times New Roman', serif;
            ">CHỨNG CHỈ HOÀN THÀNH</h1>
            
            <div style="margin: 35px 0;">
              <p style="font-size: 20px; margin: 12px 0; font-style: italic; font-family: 'Times New Roman', serif;">
                Chứng nhận rằng
              </p>
              <h2 style="
                font-size: 32px;
                color: #FEF3C7;
                margin: 18px 0;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
                font-weight: bold;
                letter-spacing: 1px;
                font-family: 'Times New Roman', serif;
              ">${certificateData.studentName}</h2>
              <p style="font-size: 20px; margin: 12px 0; font-style: italic; font-family: 'Times New Roman', serif;">
                đã hoàn thành thành công khóa học
              </p>
              <h3 style="
                font-size: 28px;
                color: #FEF3C7;
                margin: 18px 0;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
                font-weight: bold;
                letter-spacing: 1px;
                font-family: 'Times New Roman', serif;
              ">${certificateData.courseTitle}</h3>
            </div>
            
            <div style="margin: 35px 0;">
              <p style="font-size: 18px; margin: 10px 0; font-weight: 500; font-family: 'Times New Roman', serif;">
                <strong style="font-weight: bold;">Trình độ:</strong> ${certificateData.courseLevel}
              </p>
              <p style="font-size: 18px; margin: 10px 0; font-weight: 500; font-family: 'Times New Roman', serif;">
                <strong style="font-weight: bold;">Ngày hoàn thành:</strong> ${certificateData.completionDate}
              </p>
              ${certificateData.instructorName ? `
                <p style="font-size: 18px; margin: 10px 0; font-weight: 500; font-family: 'Times New Roman', serif;">
                  <strong style="font-weight: bold;">Giảng viên:</strong> ${certificateData.instructorName}
                </p>
              ` : ''}
            </div>
            
            <div style="
              margin-top: 45px;
              padding-top: 25px;
              border-top: 2px solid rgba(255,255,255,0.3);
            ">
              <p style="font-size: 16px; color: rgba(255,255,255,0.9); font-style: italic; font-family: 'Times New Roman', serif;">
                Chứng chỉ này được cấp bởi JCertPre - Hệ thống học tập trực tuyến
              </p>
              <div style="
                margin-top: 25px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 40px;
              ">
                <div style="text-align: center;">
                  <div style="
                    width: 120px;
                    height: 2px;
                    background: rgba(255,255,255,0.5);
                    margin: 0 auto 8px auto;
                  "></div>
                  <p style="font-size: 14px; color: rgba(255,255,255,0.8); font-family: 'Times New Roman', serif;">
                    Chữ ký học viên
                  </p>
                </div>
                <div style="text-align: center;">
                  <div style="
                    width: 120px;
                    height: 2px;
                    background: rgba(255,255,255,0.5);
                    margin: 0 auto 8px auto;
                  "></div>
                  <p style="font-size: 14px; color: rgba(255,255,255,0.8); font-family: 'Times New Roman', serif;">
                    Chữ ký giảng viên
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Tạo temporary div để render certificate
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = certificateHTML;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      document.body.appendChild(tempDiv);

      // Chuyển đổi HTML thành canvas
      const certificateElement = tempDiv.querySelector('#certificate') as HTMLElement;
      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });

      // Tạo PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Tính toán kích thước để fit vào PDF
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, (pdfHeight - imgHeight) / 2, imgWidth, imgHeight);
      
      // Tạo blob URL để mở trong tab mới
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      // Mở PDF trong tab mới
      window.open(blobUrl, '_blank');

      // Cleanup
      document.body.removeChild(tempDiv);
      
      // Callback
      onDownload?.();
    } catch (error) {
      console.error('Error generating certificate:', error);
      showError('Lỗi', 'Có lỗi xảy ra khi tạo chứng chỉ. Vui lòng thử lại.');
    }
  };

  return (
    <button
      onClick={generateCertificate}
      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center gap-2 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Tải chứng chỉ
    </button>
  );
};

export default CertificateGenerator; 