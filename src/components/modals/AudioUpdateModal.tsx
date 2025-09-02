import React, { useState } from 'react';
import { updateQuestion } from '../../services/questionService';
import { QuestionDto } from '../../types/question.types';
import { useNotification } from '../notifications';

interface AudioUpdateModalProps {
  question: QuestionDto;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedQuestion: QuestionDto) => void;
}

export const AudioUpdateModal: React.FC<AudioUpdateModalProps> = ({
  question,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { error: errorNotification, success } = useNotification();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        errorNotification('Vui lòng chọn file audio hợp lệ!');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        errorNotification('File audio không được vượt quá 10MB!');
        return;
      }

      setAudioFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!audioFile) {
      errorNotification('Vui lòng chọn file audio!');
      return;
    }

    setIsUploading(true);
    try {
      const updatedQuestion = await updateQuestion(question.id, {
        audioFile: audioFile
      });
      
      success('Cập nhật audio thành công!');
      onSuccess(updatedQuestion);
      handleClose();
    } catch (error: any) {
      console.error('Error updating audio:', error);
      errorNotification(error.response?.data?.message || 'Lỗi khi cập nhật audio!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setAudioFile(null);
    setPreviewUrl(null);
    onClose();
  };

  // Clean up preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  // Check if question has existing audio
  const hasExistingAudio = question.questionAttachments?.some(
    att => att.mediaType === 'audio' || att.mediaType.startsWith('audio/')
  ) || false;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Cập nhật Audio</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Current Audio Display */}
          {hasExistingAudio && (
            <div className="border rounded-lg p-3 bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Audio hiện tại:</h4>
              {question.questionAttachments
                ?.filter(att => att.mediaType === 'audio' || att.mediaType.startsWith('audio/'))
                .map((att, index) => (
                  <div key={index} className="mb-2">
                    <audio controls className="w-full">
                      <source src={att.mediaUrl} type={att.mediaType} />
                      Trình duyệt của bạn không hỗ trợ phát audio.
                    </audio>
                  </div>
                ))}
              <p className="text-xs text-gray-500 mt-2">
                Chọn file audio mới để thay thế
              </p>
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {hasExistingAudio ? 'Thay thế bằng audio mới:' : 'Thêm audio mới:'}
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Hỗ trợ các định dạng: MP3, WAV, M4A. Tối đa 10MB.
            </p>
          </div>

          {/* Preview Audio */}
          {previewUrl && (
            <div className="border rounded-lg p-3 bg-blue-50">
              <h4 className="text-sm font-medium mb-2">Xem trước audio mới:</h4>
              <audio controls className="w-full">
                <source src={previewUrl} type={audioFile?.type} />
                Trình duyệt của bạn không hỗ trợ phát audio.
              </audio>
            </div>
          )}

          {/* Question Info */}
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <strong>Câu hỏi:</strong> {question.content}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleUpload}
            disabled={!audioFile || isUploading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Đang tải lên...' : hasExistingAudio ? 'Cập nhật' : 'Thêm audio'}
          </button>
        </div>
      </div>
    </div>
  );
};
