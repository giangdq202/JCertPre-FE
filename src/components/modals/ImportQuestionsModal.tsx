import React, { useState, useRef } from 'react';
import { importQuestions, isImportFailedQuestionsBlob, ImportFailedQuestionsBlob } from '../../services/questionService';
import { ImportQuestionsResultDto } from '../../types/question.types';
import { useNotification } from '../notifications';

interface ImportQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ImportQuestionsModal: React.FC<ImportQuestionsModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportQuestionsResultDto | null>(null);
  const [failedQuestionsBlob, setFailedQuestionsBlob] = useState<ImportFailedQuestionsBlob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useNotification();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (selectedFile.type !== 'application/json') {
        error('Vui lòng chọn file JSON hợp lệ');
        return;
      }
      setFile(selectedFile);
      setImportResult(null);
      setFailedQuestionsBlob(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      error('Vui lòng chọn file để import');
      return;
    }

    setIsLoading(true);
    try {
      const result = await importQuestions(file);
      
      if (isImportFailedQuestionsBlob(result)) {
        // Has failed questions
        setFailedQuestionsBlob(result);
        setImportResult(null);
        
        const summary = result.importSummary;
        if (summary) {
          if (summary.successCount > 0 && summary.failedCount > 0) {
            success(`Import thành công ${summary.successCount}/${summary.totalCount} câu hỏi. ${summary.failedCount} câu hỏi thất bại.`);
          } else if (summary.failedCount > 0) {
            error(`Tất cả ${summary.failedCount} câu hỏi import đều thất bại.`);
          }
        }
      } else {
        // All questions imported successfully
        setImportResult(result);
        setFailedQuestionsBlob(null);
        success(`Import thành công ${result.SuccessCount}/${result.TotalCount} câu hỏi!`);
        onSuccess();
      }
    } catch (err: any) {
      console.error('Import error:', err);
      error(err.message || 'Có lỗi xảy ra khi import câu hỏi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadFailedQuestions = () => {
    if (failedQuestionsBlob) {
      const url = URL.createObjectURL(failedQuestionsBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'import_failed_questions.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    setFailedQuestionsBlob(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Import Câu Hỏi</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn file JSON
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              File phải có định dạng JSON với cấu trúc câu hỏi hợp lệ
            </p>
          </div>

          {file && (
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm"><strong>File:</strong> {file.name}</p>
              <p className="text-sm"><strong>Kích thước:</strong> {(file.size / 1024).toFixed(2)} KB</p>
            </div>
          )}

          {importResult && (
            <div className="bg-green-50 p-3 rounded">
              <h4 className="font-medium text-green-800 mb-2">Kết quả Import</h4>
              <p className="text-sm text-green-700">
                <strong>Tổng số:</strong> {importResult.TotalCount} câu hỏi
              </p>
              <p className="text-sm text-green-700">
                <strong>Thành công:</strong> {importResult.SuccessCount} câu hỏi
              </p>
              <p className="text-sm text-green-700">
                <strong>Thất bại:</strong> {importResult.FailedCount} câu hỏi
              </p>
            </div>
          )}

          {failedQuestionsBlob && failedQuestionsBlob.importSummary && (
            <div className="bg-yellow-50 p-3 rounded">
              <h4 className="font-medium text-yellow-800 mb-2">Kết quả Import</h4>
              <p className="text-sm text-yellow-700">
                <strong>Tổng số:</strong> {failedQuestionsBlob.importSummary.totalCount} câu hỏi
              </p>
              <p className="text-sm text-yellow-700">
                <strong>Thành công:</strong> {failedQuestionsBlob.importSummary.successCount} câu hỏi
              </p>
              <p className="text-sm text-yellow-700">
                <strong>Thất bại:</strong> {failedQuestionsBlob.importSummary.failedCount} câu hỏi
              </p>
              <button
                onClick={handleDownloadFailedQuestions}
                className="mt-2 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
              >
                Tải xuống danh sách câu hỏi thất bại
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
          >
            Đóng
          </button>
          <button
            onClick={handleImport}
            disabled={!file || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang import...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportQuestionsModal;
