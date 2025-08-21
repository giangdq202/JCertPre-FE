import React, { useState, useRef } from 'react';
import { importQuestions, isImportFailedQuestionsBlob, ImportFailedQuestionsBlob } from '../../services/questionService';
import { ImportQuestionsResultDto } from '../../types/question.types';
import { useNotification } from '../notifications';

interface ImportQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result?: ImportQuestionsResultDto, failedBlob?: ImportFailedQuestionsBlob) => void;
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
        
        // Call onSuccess with failed blob info (parent will handle notifications)
        onSuccess(undefined, result);
      } else {
        // All questions imported successfully
        setImportResult(result);
        setFailedQuestionsBlob(null);
        
        // Call onSuccess with result info (parent will handle notifications)
        onSuccess(result, undefined);
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
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
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
            <div className={`p-4 rounded-lg border ${
              importResult.failedCount === 0 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  importResult.failedCount === 0 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {importResult.failedCount === 0 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium mb-2 ${
                    importResult.failedCount === 0 
                      ? 'text-green-800' 
                      : 'text-yellow-800'
                  }`}>
                    {importResult.failedCount === 0 
                      ? 'Import thành công!' 
                      : 'Import hoàn tất với một số lỗi'}
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={importResult.failedCount === 0 ? 'text-green-700' : 'text-yellow-700'}>
                        Tổng số câu hỏi:
                      </span>
                      <span className="font-medium">{importResult.totalCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Thành công:</span>
                      <span className="font-medium text-green-700">{importResult.successCount}</span>
                    </div>
                    {importResult.failedCount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-red-700">Thất bại:</span>
                        <span className="font-medium text-red-700">{importResult.failedCount}</span>
                      </div>
                    )}
                  </div>
                  {importResult.successCount > 0 && (
                    <div className="mt-2 bg-green-100 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500 text-xs text-white text-center py-1 transition-all duration-500"
                        style={{ width: `${(importResult.successCount / importResult.totalCount) * 100}%` }}
                      >
                        {Math.round((importResult.successCount / importResult.totalCount) * 100)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {failedQuestionsBlob && failedQuestionsBlob.importSummary && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-red-800 mb-2">
                    {failedQuestionsBlob.importSummary.successCount > 0 
                      ? 'Import hoàn tất với lỗi' 
                      : 'Import thất bại'}
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-red-700">Tổng số câu hỏi:</span>
                      <span className="font-medium">{failedQuestionsBlob.importSummary.totalCount}</span>
                    </div>
                    {failedQuestionsBlob.importSummary.successCount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">Thành công:</span>
                        <span className="font-medium text-green-700">{failedQuestionsBlob.importSummary.successCount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-red-700">Thất bại:</span>
                      <span className="font-medium text-red-700">{failedQuestionsBlob.importSummary.failedCount}</span>
                    </div>
                  </div>
                  {failedQuestionsBlob.importSummary.successCount > 0 && (
                    <div className="mt-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500 text-xs text-white text-center py-1 transition-all duration-500"
                        style={{ width: `${(failedQuestionsBlob.importSummary.successCount / failedQuestionsBlob.importSummary.totalCount) * 100}%` }}
                      >
                        {Math.round((failedQuestionsBlob.importSummary.successCount / failedQuestionsBlob.importSummary.totalCount) * 100)}% thành công
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleDownloadFailedQuestions}
                    className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Tải xuống danh sách câu hỏi lỗi
                  </button>
                </div>
              </div>
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
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang import...
              </div>
            ) : (
              'Import'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportQuestionsModal;
